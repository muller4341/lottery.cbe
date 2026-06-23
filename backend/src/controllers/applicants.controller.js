// // Applicants controller - Excel upload + listing
// const fs = require('fs');
// const prisma = require('../lib/prisma');
// const { readWorkbook } = require('../utils/excel');
// const ALLOWED_BED_TYPES = ['1bed', '2bed', '3bed'];

// function normalizeKey(k) {
//   return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
// }
// const HEADER_MAP = {
//   employeeid: 'employeeId',
//   empid: 'employeeId',
//   id: 'employeeId',
//   fullname: 'fullName',
//   name: 'fullName',
//   site: 'site',
//   sitename: 'site',
//   bedtype: 'bedType',
//   type: 'bedType',
//   area: 'totalArea',
//   totalarea: 'totalArea',
//   size: 'totalArea',
// };

// function pick(row, ...keys) {
//   for (const k of keys) {
//     const nk = normalizeKey(k);
//     for (const rk of Object.keys(row)) {
//       if (normalizeKey(rk) === nk) {
//         const v = row[rk];
//         if (v !== null && v !== undefined && v !== '') return v;
//       }
//     }
//   }
//   return undefined;
// }
// function canonicalizeRow(row) {
//   const out = {};
//   for (const k of Object.keys(row)) {
//     const nk = normalizeKey(k);
//     const canon = HEADER_MAP[nk];
//     if (canon) out[canon] = row[k];
//   }
//   return out;
// }

// exports.upload = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
//     await ensureDefaults();

//     const rows = await readWorkbook(req.file.path);
//     if (!rows.length) {
//       return res.status(400).json({ ok: false, message: 'Excel file is empty' });
//     }

//     const sites = await prisma.site.findMany();
//     const siteByName = new Map(sites.map((s) => [s.name.toLowerCase(), s]));

//     const created = [];
//     const updated = [];
//     const errors = [];

//     for (let i = 0; i < rows.length; i++) {
//       const r = canonicalizeRow(rows[i]);
//       const employeeId = String(pick(r, 'employeeId', 'empId', 'id') || '').trim();
//       const fullName = String(pick(r, 'fullName', 'name') || '').trim() || null;
//       const siteName = String(pick(r, 'site', 'siteName') || '').trim();
//       const bed = String(pick(r, 'bedType', 'type') || '').trim().toLowerCase();
//       const area = Number(pick(r, 'area', 'totalArea', 'size'));

//       if (!employeeId) { errors.push({ row: i + 2, error: 'Missing employeeId' }); continue; }
//       if (!siteName || !siteByName.has(siteName.toLowerCase())) {
//         errors.push({ row: i + 2, error: `Invalid site name "${siteName}"` });
//         continue;
//       }
//       if (!ALLOWED_BED_TYPES.includes(bed)) {
//         errors.push({ row: i + 2, error: `Invalid bedType "${bed}"` });
//         continue;
//       }
//       if (Number.isNaN(area) || area <= 0) {
//         errors.push({ row: i + 2, error: 'Invalid totalArea' });
//         continue;
//       }
//       const site = siteByName.get(siteName.toLowerCase());

//       // Upsert by employeeId - one application per employee
//       const data = {
//         employeeId,
//         fullName,
//         siteId: site.id,
//         bedType: bed,
//         totalArea: area,
//       };
//       const existing = await prisma.applicant.findUnique({ where: { employeeId } });
//       if (existing) {
//         const u = await prisma.applicant.update({ where: { employeeId }, data });
//         updated.push(u);
//       } else {
//         const c = await prisma.applicant.create({ data });
//         created.push(c);
//       }
//     }

//     try { fs.unlinkSync(req.file.path); } catch (_) {}

//     return res.json({
//       ok: true,
//       message: `Imported ${created.length} new, updated ${updated.length}${errors.length ? `, ${errors.length} errors` : ''}`,
//       createdCount: created.length,
//       updatedCount: updated.length,
//       errorCount: errors.length,
//       errors: errors.slice(0, 50),
//     });
//   } catch (err) {
//     console.error('applicants upload error', err);
//     return res.status(500).json({ ok: false, message: err.message || 'Upload failed' });
//   }
// };

// exports.list = async (req, res) => {
//   const { siteId, bedType, totalArea } = req.query;
//   const where = {};
//   if (siteId) where.siteId = Number(siteId);
//   if (bedType) where.bedType = String(bedType);
//   if (totalArea) where.totalArea = Number(totalArea);

//   const applicants = await prisma.applicant.findMany({
//     where,
//     include: { site: true },
//     orderBy: [{ createdAt: 'desc' }],
//   });
//   return res.json({ ok: true, applicants });
// };

// exports.summary = async (req, res) => {
//   // Group applicants by (site, bedType, totalArea)
//   const groups = await prisma.applicant.groupBy({
//     by: ['siteId', 'bedType', 'totalArea'],
//     _count: { _all: true },
//   });
//   const sites = await prisma.site.findMany();
//   const siteById = new Map(sites.map((s) => [s.id, s]));
//   return res.json({
//     ok: true,
//     groups: groups.map((g) => ({
//       siteId: g.siteId,
//       siteName: siteById.get(g.siteId)?.name,
//       bedType: g.bedType,
//       totalArea: g.totalArea,
//       count: g._count._all,
//     })),
//   });
// };

// exports.removeAll = async (req, res) => {
//   const result = await prisma.applicant.deleteMany({});
//   return res.json({ ok: true, deleted: result.count });
// };

// Applicants controller - Excel upload + listing
// Applicants controller - Excel upload + listing
// Lottery controller - draw + results + Excel export
// Applicants controller - Excel upload + listing
const fs = require('fs');
const prisma = require('../lib/prisma');
const { readWorkbook } = require('../utils/excel');

function normalizeKey(k) {
  return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}

const HEADER_MAP = {
  employeeid: 'idCode',
  empid: 'idCode',
  id: 'idCode',
  idcode: 'idCode',
  fullname: 'username',
  name: 'username',
  username: 'username',
  site: 'site',
  sitename: 'site',
  bedtype: 'bedroom',
  bedroom: 'bedroom',
  type: 'bedroom',
  area: 'area',
  totalarea: 'area',
  size: 'area',
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

    const rows = await readWorkbook(req.file.path);
    if (!rows.length) {
      return res.status(400).json({ ok: false, message: 'Excel file is empty' });
    }

    const created = [];
    const updated = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = canonicalizeRow(rows[i]);
      const idCode = String(pick(r, 'idCode', 'employeeId') || '').trim();
      const username = String(pick(r, 'username', 'fullName') || '').trim() || 'Unknown';
      const site = String(pick(r, 'site') || '').trim();
      const bedroomInput = pick(r, 'bedroom', 'bedroomNumber');
      const area = String(pick(r, 'area') || '').trim();

      if (!idCode) { 
        errors.push({ row: i + 2, error: 'Missing Identity/Employee Code' }); 
        continue; 
      }
      if (!site) {
        errors.push({ row: i + 2, error: 'Missing Site choice' });
        continue;
      }
      if (!area) {
        errors.push({ row: i + 2, error: 'Missing Area preference' });
        continue;
      }

      let bedroom = 0;
      if (bedroomInput !== undefined && bedroomInput !== null) {
        const parsed = parseInt(String(bedroomInput).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed)) bedroom = parsed;
      }

      const data = { idCode, username, site, area, bedroom };

      try {
        const existing = await prisma.applicant.findUnique({ where: { idCode } });
        if (existing) {
          const u = await prisma.applicant.update({ where: { idCode }, data });
          updated.push(u);
        } else {
          const c = await prisma.applicant.create({ data });
          created.push(c);
        }
      } catch (dbErr) {
        errors.push({ row: i + 2, error: dbErr.message || 'Database write failed' });
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
  try {
    const { site, bedroom, area } = req.query;
    const where = {};
    if (site) where.site = String(site);
    if (bedroom) where.bedroom = Number(bedroom);
    if (area) where.area = String(area);

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
    return res.json({ ok: true, applicants });
  } catch (err) {
    console.error('Applicants list fetch error:', err);
    return res.status(500).json({ ok: false, message: 'Failed to retrieve applicants' });
  }
};

exports.summary = async (req, res) => {
  try {
    const groups = await prisma.applicant.groupBy({
      by: ['site', 'bedroom', 'area'],
      _count: { _all: true },
    });

    return res.json({
      ok: true,
      groups: groups.map((g) => ({
        site: g.site,
        bedroom: g.bedroom,
        area: g.area,
        count: g._count._all,
      })),
    });
  } catch (err) {
    console.error('Applicants summary error:', err);
    return res.status(500).json({ ok: false, message: 'Failed to compute group summary statistics' });
  }
};

exports.removeAll = async (req, res) => {
  try {
    const result = await prisma.applicant.deleteMany({});
    return res.json({ ok: true, deleted: result.count });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};