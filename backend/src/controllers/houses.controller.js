// // // Houses controller - Excel upload + listing
// // const fs = require('fs');
// // const path = require('path');
// // const prisma = require('../lib/prisma');
// // const { readWorkbook } = require('../utils/excel');
// // const { ensureDefaults } = require('./sites.controller');

// // const ALLOWED_BED_TYPES = ['1bed', '2bed', '3bed'];

// // // Normalize header variations to canonical keys
// // function normalizeKey(k) {
// //   return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
// // }
// // const HEADER_MAP = {
// //   site: 'site',
// //   sitename: 'site',
// //   block: 'blockNumber',
// //   blocknumber: 'blockNumber',
// //   blockno: 'blockNumber',
// //   house: 'houseNumber',
// //   housenumber: 'houseNumber',
// //   houseno: 'houseNumber',
// //   floor: 'floorNumber',
// //   floornumber: 'floorNumber',
// //   floorno: 'floorNumber',
// //   bedtype: 'bedType',
// //   type: 'bedType',
// //   housetype: 'bedType',
// //   area: 'totalArea',
// //   totalarea: 'totalArea',
// //   size: 'totalArea',
// // };

// // function pick(row, ...keys) {
// //   for (const k of keys) {
// //     const nk = normalizeKey(k);
// //     for (const rk of Object.keys(row)) {
// //       if (normalizeKey(rk) === nk) {
// //         const v = row[rk];
// //         if (v !== null && v !== undefined && v !== '') return v;
// //       }
// //     }
// //   }
// //   return undefined;
// // }

// // function canonicalizeRow(row) {
// //   const out = {};
// //   for (const k of Object.keys(row)) {
// //     const nk = normalizeKey(k);
// //     const canon = HEADER_MAP[nk];
// //     if (canon) out[canon] = row[k];
// //   }
// //   return out;
// // }

// // exports.upload = async (req, res) => {
// //   try {
// //     if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
// //     await ensureDefaults();

// //     const rows = await readWorkbook(req.file.path);
// //     if (!rows.length) {
// //       return res.status(400).json({ ok: false, message: 'Excel file is empty' });
// //     }

// //     const sites = await prisma.site.findMany();
// //     const siteByName = new Map(sites.map((s) => [s.name.toLowerCase(), s]));

// //     const created = [];
// //     const errors = [];

// //     for (let i = 0; i < rows.length; i++) {
// //       const raw = rows[i];
// //       const r = canonicalizeRow(raw);
// //       const siteName = String(pick(r, 'site', 'siteName') || '').trim();
// //       const block = String(pick(r, 'block', 'blockNumber') || '').trim();
// //       const house = String(pick(r, 'house', 'houseNumber') || '').trim();
// //       const floor = Number(pick(r, 'floor', 'floorNumber'));
// //       const bed = String(pick(r, 'bedType', 'type', 'houseType') || '').trim().toLowerCase();
// //       const area = Number(pick(r, 'area', 'totalArea', 'size'));

// //       if (!siteName || !siteByName.has(siteName.toLowerCase())) {
// //         errors.push({ row: i + 2, error: `Invalid site name "${siteName}"` });
// //         continue;
// //       }
// //       if (!ALLOWED_BED_TYPES.includes(bed)) {
// //         errors.push({ row: i + 2, error: `Invalid bedType "${bed}" (use 1bed/2bed/3bed)` });
// //         continue;
// //       }
// //       if (!block || !house || Number.isNaN(floor) || Number.isNaN(area) || area <= 0) {
// //         errors.push({ row: i + 2, error: 'Missing or invalid field(s)' });
// //         continue;
// //       }

// //       const site = siteByName.get(siteName.toLowerCase());
// //       const row = await prisma.house.create({
// //         data: {
// //           siteId: site.id,
// //           blockNumber: block,
// //           houseNumber: house,
// //           floorNumber: floor,
// //           bedType: bed,
// //           totalArea: area,
// //         },
// //       });
// //       created.push(row);
// //     }

// //     // Optionally clean up uploaded file
// //     try { fs.unlinkSync(req.file.path); } catch (_) {}

// //     return res.json({
// //       ok: true,
// //       message: `Imported ${created.length} houses${errors.length ? `, ${errors.length} errors` : ''}`,
// //       createdCount: created.length,
// //       errorCount: errors.length,
// //       errors: errors.slice(0, 50),
// //     });
// //   } catch (err) {
// //     console.error('houses upload error', err);
// //     return res.status(500).json({ ok: false, message: err.message || 'Upload failed' });
// //   }
// // };

// // Houses controller - Excel upload + listing
// // Houses controller - Excel upload + listing
// // houses.controller.js
// const fs = require('fs');
// const prisma = require('../lib/prisma');
// const { readWorkbook } = require('../utils/excel');

// function normalizeKey(k) {
//   return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
// }

// const HEADER_MAP = {
//   site: 'site',
//   sitename: 'site',
//   block: 'block',
//   blocknumber: 'block',
//   house: 'houseNumber',
//   housenumber: 'houseNumber',
//   floor: 'floor',
//   bedtype: 'bedroom',
//   bedroom: 'bedroom',
//   type: 'bedroom',
//   area: 'area',
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

// exports.upload = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

//     const rows = await readWorkbook(req.file.path);
//     if (!rows.length) {
//       return res.status(400).json({ ok: false, message: 'Excel file is empty' });
//     }

//     const created = [];
//     const errors = [];

//     for (let i = 0; i < rows.length; i++) {
//       const raw = rows[i];
//       const site = String(pick(raw, 'site', 'sitename') || '').trim();
//       const block = String(pick(raw, 'block', 'blocknumber') || '').trim();
//       const houseNumber = String(pick(raw, 'house', 'housenumber') || '').trim();
//       const floor = Number(pick(raw, 'floor'));
//       const bedroom = Number(pick(raw, 'bedtype', 'bedroom', 'type') || 0);
//       const area = String(pick(raw, 'area') || '');

//       if (!site || !houseNumber || Number.isNaN(floor) || !area) {
//         errors.push({ row: i + 2, error: 'Missing required fields (site, house, floor, area)' });
//         continue;
//       }

//       const house = await prisma.house.create({
//         data: {
//           site,
//           block: block || null,
//           houseNumber,
//           floor,
//           bedroom,
//           area,
//         },
//       });
//       created.push(house);
//     }

//     try { fs.unlinkSync(req.file.path); } catch (_) {}

//     return res.json({
//       ok: true,
//       message: `Imported ${created.length} houses${errors.length ? `, ${errors.length} errors` : ''}`,
//       createdCount: created.length,
//       errorCount: errors.length,
//       errors: errors.slice(0, 50),
//     });
//   } catch (err) {
//     console.error('Upload error:', err);
//     return res.status(500).json({ ok: false, message: err.message });
//   }
// };

// // Keep your existing list, summary, removeAll functions unchanged
// exports.list = async (req, res) => {
//   try {
//     const { siteId, bedType, totalArea, status, page, limit } = req.query;
//     const where = {};
//     if (siteId) where.siteId = Number(siteId);
//     if (bedType) where.bedType = String(bedType);
//     if (totalArea) where.totalArea = Number(totalArea);

//     if (status === 'allocated') {
//       where.isAllocated = true;
//     } else if (status === 'available') {
//       where.isAllocated = false;
//     }

//     // Handle pagination
//     const p = Math.max(1, parseInt(page) || 1);
//     const l = Math.max(1, parseInt(limit) || 20);
//     const skip = (p - 1) * l;

//     const [total, houses] = await Promise.all([
//       prisma.house.count({ where }),
//       prisma.house.findMany({
//         where,
//         include: { site: true },
//         orderBy: [{ siteId: 'asc' }, { bedType: 'asc' }, { totalArea: 'asc' }, { id: 'asc' }],
//         skip,
//         take: l,
//       }),
//     ]);

//     return res.json({
//       ok: true,
//       houses,
//       pagination: {
//         total,
//         page: p,
//         limit: l,
//         totalPages: Math.ceil(total / l),
//       },
//     });
//   } catch (err) {
//     console.error('houses list error', err);
//     return res.status(500).json({ ok: false, message: err.message || 'Listing failed' });
//   }
// };

// exports.summary = async (req, res) => {
//   // Group houses by (site, bedType, totalArea) and return counts
//   const groups = await prisma.house.groupBy({
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
//   // Optional reset endpoint (dangerous, kept for admin convenience)
//   const result = await prisma.house.deleteMany({});
//   return res.json({ ok: true, deleted: result.count });
// };

// houses.controller.js
const fs = require('fs');
const prisma = require('../lib/prisma');
const { readWorkbook } = require('../utils/excel');


function normalizeKey(k) {
  return String(k || '').trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}

const HEADER_MAP = {
  site: 'site',
  sitename: 'site',
  block: 'block',
  blocknumber: 'block',
  house: 'houseNumber',
  housenumber: 'houseNumber',
  floor: 'floor',
  bedtype: 'bedroom',
  bedroom: 'bedroom',
  type: 'bedroom',
  area: 'area',
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

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

    const rows = await readWorkbook(req.file.path);
    if (!rows.length) {
      return res.status(400).json({ ok: false, message: 'Excel file is empty' });
    }

    const created = [];
    const errors = [];

    // Get all existing house numbers for fast checking
    const existingHouses = await prisma.house.findMany({
      select: { houseNumber: true }
    });
    const existingHouseNumbers = new Set(existingHouses.map(h => h.houseNumber.toString().trim()));

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];

      const site = String(pick(raw, 'site', 'sitename') || '').trim();
      const block = String(pick(raw, 'block', 'blocknumber') || '').trim();
      const houseNumber = String(pick(raw, 'house', 'housenumber') || '').trim();
      const floor = Number(pick(raw, 'floor'));
      const bedroom = Number(pick(raw, 'bedtype', 'bedroom', 'type') || 0);
      const area = String(pick(raw, 'area') || '');

      if (!site || !houseNumber || Number.isNaN(floor) || !area) {
        errors.push({ row: i + 2, error: 'Missing required fields: site, house, floor, area' });
        continue;
      }

      // Check for duplicate house number
      if (existingHouseNumbers.has(houseNumber)) {
        errors.push({ 
          row: i + 2, 
          error: `House number "${houseNumber}" already exists` 
        });
        continue;
      }

      try {
        const house = await prisma.house.create({
          data: {
            site,
            block: block || null,
            houseNumber,
            floor,
            bedroom,
            area,
          },
        });
        created.push(house);
        existingHouseNumbers.add(houseNumber); // Add to set to prevent duplicates in same upload
      } catch (createErr) {
        if (createErr.code === 'P2002') {
          errors.push({ row: i + 2, error: `House number "${houseNumber}" already exists` });
        } else {
          errors.push({ row: i + 2, error: 'Failed to create house' });
        }
      }
    }

    try { fs.unlinkSync(req.file.path); } catch (_) {}

    return res.json({
      ok: true,
      message: `Imported ${created.length} houses${errors.length ? `, ${errors.length} errors` : ''}`,
      createdCount: created.length,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};
exports.list = async (req, res) => {
  try {
    const { site, bedroom, area, status, page, limit } = req.query;

    const where = {};
    if (site) where.site = site;
    if (bedroom) where.bedroom = Number(bedroom);
    if (area) where.area = area;
    if (status) where.status = status;

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 20);
    const skip = (p - 1) * l;

    const [total, houses] = await Promise.all([
      prisma.house.count({ where }),
      prisma.house.findMany({
        where,
        orderBy: [
          { site: 'asc' },
          { bedroom: 'asc' },
          { area: 'asc' },
          { id: 'asc' }
        ],
        skip,
        take: l,
      }),
    ]);

    return res.json({
      ok: true,
      houses,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    });
  } catch (err) {
    console.error('houses list error', err);
    return res.status(500).json({ ok: false, message: err.message || 'Listing failed' });
  }
};

// exports.summary = async (req, res) => {
//   try {
//     const groups = await prisma.house.groupBy({
//       by: ['site', 'bedroom', 'area'],
//       _count: { _all: true },
//     });

//     return res.json({
//       ok: true,
//       groups: groups.map(g => ({
//         site: g.site,
//         bedroom: g.bedroom,
//         area: g.area,
//         count: g._count._all,
//       })),
//     });
//   } catch (err) {
//     console.error('summary error', err);
//     return res.status(500).json({ ok: false, message: err.message });
//   }
// };

exports.summary = async (req, res) => {
  try {
    // Group houses by site, bedroom, and area to show house inventory statistics
    const groups = await prisma.house.groupBy({
      by: ['site', 'bedroom', 'area'],
      _count: { _all: true },
    });

    return res.json({
      ok: true,
      groups: groups.map(g => ({
        site: g.site,
        bedroom: g.bedroom, // Maps directly to <span className="badge-blue">{g.bedroom}</span>
        area: g.area,
        count: g._count._all, // Maps directly to {g.count}
      })),
    });
  } catch (err) {
    console.error('Houses summary error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'Failed to generate inventory' });
  }
};
exports.removeAll = async (req, res) => {
  const result = await prisma.house.deleteMany({});
  return res.json({ ok: true, deleted: result.count });
};

exports.getSites = async (req, res) => {
  try {
    const sites = await prisma.house.findMany({
      select: { site: true },
      distinct: ['site'],
      orderBy: { site: 'asc' }
    });

    const uniqueSites = sites.map(s => s.site).filter(Boolean);

    return res.json({
      ok: true,
      sites: uniqueSites
    });
  } catch (err) {
    console.error('getSites error', err);
    return res.status(500).json({ ok: false, message: 'Failed to fetch sites' });
  }
};