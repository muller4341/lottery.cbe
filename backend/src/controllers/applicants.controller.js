// Applicants controller - Excel upload + listing
const fs = require('fs');
const prisma = require('../lib/prisma');
const { readWorkbook } = require('../utils/excel');
const { ensureDefaults } = require('./sites.controller');

const ALLOWED_BED_TYPES = ['1bed', '2bed', '3bed'];

function normalizeKey(k) {
  return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}
const HEADER_MAP = {
  employeeid: 'employeeId',
  empid: 'employeeId',
  id: 'employeeId',
  fullname: 'fullName',
  name: 'fullName',
  site: 'site',
  sitename: 'site',
  bedtype: 'bedType',
  type: 'bedType',
  area: 'totalArea',
  totalarea: 'totalArea',
  size: 'totalArea',
};

function pick(row, ...keys) {
  for (const k of keys) {
    const nk = normalizeKey(k);
    for (const rk of Object.keys(row)) {
      if (normalizeKey(rk) === nk) {
        const v = row[rk];
        if (v !== null && v !== undefined && v !== '') return v;
      }
    }
  }
  return undefined;
}
function canonicalizeRow(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    const canon = HEADER_MAP[nk];
    if (canon) out[canon] = row[k];
  }
  return out;
}

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
    await ensureDefaults();

    const rows = await readWorkbook(req.file.path);
    if (!rows.length) {
      return res.status(400).json({ ok: false, message: 'Excel file is empty' });
    }

    const sites = await prisma.site.findMany();
    const siteByName = new Map(sites.map((s) => [s.name.toLowerCase(), s]));

    const created = [];
    const updated = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = canonicalizeRow(rows[i]);
      const employeeId = String(pick(r, 'employeeId', 'empId', 'id') || '').trim();
      const fullName = String(pick(r, 'fullName', 'name') || '').trim() || null;
      const siteName = String(pick(r, 'site', 'siteName') || '').trim();
      const bed = String(pick(r, 'bedType', 'type') || '').trim().toLowerCase();
      const area = Number(pick(r, 'area', 'totalArea', 'size'));

      if (!employeeId) { errors.push({ row: i + 2, error: 'Missing employeeId' }); continue; }
      if (!siteName || !siteByName.has(siteName.toLowerCase())) {
        errors.push({ row: i + 2, error: `Invalid site name "${siteName}"` });
        continue;
      }
      if (!ALLOWED_BED_TYPES.includes(bed)) {
        errors.push({ row: i + 2, error: `Invalid bedType "${bed}"` });
        continue;
      }
      if (Number.isNaN(area) || area <= 0) {
        errors.push({ row: i + 2, error: 'Invalid totalArea' });
        continue;
      }
      const site = siteByName.get(siteName.toLowerCase());

      // Upsert by employeeId - one application per employee
      const data = {
        employeeId,
        fullName,
        siteId: site.id,
        bedType: bed,
        totalArea: area,
      };
      const existing = await prisma.applicant.findUnique({ where: { employeeId } });
      if (existing) {
        const u = await prisma.applicant.update({ where: { employeeId }, data });
        updated.push(u);
      } else {
        const c = await prisma.applicant.create({ data });
        created.push(c);
      }
    }

    try { fs.unlinkSync(req.file.path); } catch (_) {}

    return res.json({
      ok: true,
      message: `Imported ${created.length} new, updated ${updated.length}${errors.length ? `, ${errors.length} errors` : ''}`,
      createdCount: created.length,
      updatedCount: updated.length,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
    });
  } catch (err) {
    console.error('applicants upload error', err);
    return res.status(500).json({ ok: false, message: err.message || 'Upload failed' });
  }
};

exports.list = async (req, res) => {
  const { siteId, bedType, totalArea } = req.query;
  const where = {};
  if (siteId) where.siteId = Number(siteId);
  if (bedType) where.bedType = String(bedType);
  if (totalArea) where.totalArea = Number(totalArea);

  const applicants = await prisma.applicant.findMany({
    where,
    include: { site: true },
    orderBy: [{ createdAt: 'desc' }],
  });
  return res.json({ ok: true, applicants });
};

exports.summary = async (req, res) => {
  // Group applicants by (site, bedType, totalArea)
  const groups = await prisma.applicant.groupBy({
    by: ['siteId', 'bedType', 'totalArea'],
    _count: { _all: true },
  });
  const sites = await prisma.site.findMany();
  const siteById = new Map(sites.map((s) => [s.id, s]));
  return res.json({
    ok: true,
    groups: groups.map((g) => ({
      siteId: g.siteId,
      siteName: siteById.get(g.siteId)?.name,
      bedType: g.bedType,
      totalArea: g.totalArea,
      count: g._count._all,
    })),
  });
};

exports.removeAll = async (req, res) => {
  const result = await prisma.applicant.deleteMany({});
  return res.json({ ok: true, deleted: result.count });
};
