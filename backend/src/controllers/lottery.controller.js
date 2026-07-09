

// const prisma = require('../lib/prisma');
// const ExcelJS = require('exceljs');

// function shuffle(array) {
//   const a = array.slice();
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = cryptoRandomInt(0, i + 1);
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// function cryptoRandomInt(min, max) {
//   const range = max - min;
//   if (range <= 0) return min;
//   const cryptoObj = require('crypto').webcrypto || globalThis.crypto;
//   const maxUint32 = 0xffffffff;
//   const limit = maxUint32 - (maxUint32 % range);
//   const buf = new Uint32Array(1);
//   let n;
//   if (!cryptoObj || !cryptoObj.getRandomValues) {
//     return min + Math.floor(Math.random() * range);
//   }
//   do {
//     cryptoObj.getRandomValues(buf);
//     n = buf[0];
//   } while (n >= limit);
//   return min + (n % range);
// }

// exports.draw = async (req, res) => {
//   try {
//     const { site, bedroom, area, lotteryRunId } = req.body || {};
//     if (!site || !bedroom || !area || !lotteryRunId) {
//       return res.status(400).json({ ok: false, message: 'site, bedroom, area, and lotteryRunId are required' });
//     }

//     const bedCount = Number(bedroom);
//     const searchArea = String(area).trim();

//     const existing = await prisma.lotteryResult.findFirst({
//       where: { site, bedroom: bedCount, area: searchArea }
//     });
//     if (existing) {
//       return res.status(409).json({
//         ok: false,
//         message: 'Lottery has already been drawn for this combination',
//         lotteryId: existing.lotteryRunId,
//       });
//     }

//     const availableHouses = await prisma.house.findMany({
//       where: { site, bedroom: bedCount, area: searchArea, status: 'NONE' },
//     });

//     const applicants = await prisma.applicant.findMany({
//       where: { site, bedroom: bedCount, area: searchArea },
//     });

//     if (!applicants.length) return res.status(400).json({ ok: false, message: 'No applicants found' });
//     if (!availableHouses.length) return res.status(400).json({ ok: false, message: 'No houses available' });

//     const shuffledApplicants = shuffle(applicants);
//     const shuffledHouses = shuffle(availableHouses);

//     const winnersCount = Math.min(availableHouses.length, applicants.length);
//     const winners = shuffledApplicants.slice(0, winnersCount);
//     const waitlist = shuffledApplicants.slice(winnersCount);

//     await prisma.$transaction(async (tx) => {
//       for (let i = 0; i < winners.length; i++) {
//         const app = winners[i];
//         const h = shuffledHouses[i];
//         await tx.lotteryResult.create({
//           data: {
//             lotteryRunId,
//             username: app.username,
//             site,
//             area: searchArea,
//             bedroom: bedCount,
//             floor: h.floor,
//             houseNumber: h.houseNumber,
//             status: 'WINNER',
//             houseId: h.id,
//             applicantId: app.id,
//           },
//         });
//         await tx.house.update({
//           where: { id: h.id },
//           data: { status: 'PROVIDED' },
//         });
//       }

//       for (let i = 0; i < waitlist.length; i++) {
//         const app = waitlist[i];
//         await tx.lotteryResult.create({
//           data: {
//             lotteryRunId,
//             username: app.username,
//             site,
//             area: searchArea,
//             bedroom: bedCount,
//             status: 'WAITLIST',
//             applicantId: app.id,
//           },
//         });
//       }
//     });

//     return res.json({
//       ok: true,
//       lotteryId: lotteryRunId,
//       summary: {
//         siteName: site,
//         bedType: `${bedCount} Bed`,
//         totalArea: searchArea,
//         winnersCount: winners.length,
//         waitlistCount: waitlist.length,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ ok: false, message: err.message || 'Draw failed' });
//   }
// };

// exports.listLotteries = async (req, res) => {
//   try {
//     const lotteries = await prisma.lotteryResult.findMany({
//       distinct: ['lotteryRunId'],
//       orderBy: { drawDate: 'desc' },
//     });
//     return res.json({ ok: true, lotteries });
//   } catch (err) {
//     return res.status(500).json({ ok: false, message: err.message });
//   }
// };

// exports.getResults = async (req, res) => {
//   try {
//     const results = await prisma.lotteryResult.findMany({
//       where: { lotteryRunId: req.params.id },
//       include: { applicant: true, house: true },
//       orderBy: { status: 'asc' },
//     });
//     return res.json({ ok: true, results });
//   } catch (err) {
//     return res.status(500).json({ ok: false, message: err.message });
//   }
// };

// exports.stats = async (req, res) => {
//   try {
//     // Group by lotteryRunId to find the number of unique lottery draws executed
//     const [houses, applicants, runGroups] = await Promise.all([
//       prisma.house.count(),
//       prisma.applicant.count(),
//       prisma.lotteryResult.groupBy({
//         by: ['lotteryRunId'],
//       }),
//     ]);

//     return res.json({ 
//       ok: true, 
//       stats: { 
//         houses, 
//         applicants, 
//         lotteries: runGroups.length // The count of unique runs
//       } 
//     });
//   } catch (err) {
//     console.error('Stats fetch error:', err);
//     return res.status(500).json({ ok: false, message: 'Failed to fetch database stats' });
//   }
// };

// exports.downloadResults = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Load results along with relational applicant models
//     const results = await prisma.lotteryResult.findMany({
//       where: { lotteryRunId: id },
//       include: { applicant: true, house: true },
//       orderBy: [{ status: 'asc' }],
//     });

//     if (!results.length) return res.status(404).json({ ok: false, message: 'No results found for this run' });

//     const metadata = results[0];
//     const wb = new ExcelJS.Workbook();
//     wb.creator = 'Apartment Lottery System';
//     wb.created = new Date();

//     // 1. Summary Sheet
//     const summarySheet = wb.addWorksheet('Summary');
//     summarySheet.columns = [
//       { header: 'Field', key: 'field', width: 25 },
//       { header: 'Value', key: 'value', width: 35 },
//     ];
//     summarySheet.addRows([
//       { field: 'Site Name', value: metadata.site },
//       { field: 'Bed Type', value: `${metadata.bedroom} Bed` },
//       { field: 'Total Area (m²)', value: metadata.area },
//       { field: 'Total Winners', value: results.filter(r => r.status === 'WINNER').length },
//       { field: 'Total Waitlist', value: results.filter(r => r.status === 'WAITLIST').length },
//       { field: 'Drawn At', value: metadata.drawDate.toISOString() },
//     ]);
//     summarySheet.getRow(1).font = { bold: true };

//     // 2. Winners Sheet Layout (Applicant ID, Full Name, Bed Type, Area (m²), Site, House Number, Floor)
//     const winners = results.filter((r) => r.status === 'WINNER');
//     if (winners.length) {
//       const ws = wb.addWorksheet('Winners');
//       ws.columns = [
//         { header: 'Applicant ID', key: 'applicantId', width: 18 },
//         { header: 'Full Name', key: 'fullName', width: 25 },
//         { header: 'Bed Type', key: 'bedType', width: 12 },
//         { header: 'Area (m²)', key: 'area', width: 14 },
//         { header: 'Site', key: 'site', width: 16 },
//         { header: 'House Number', key: 'houseNumber', width: 16 },
//         { header: 'Floor', key: 'floor', width: 10 },
//       ];
//       winners.forEach((r) => {
//         ws.addRow({
//           applicantId: r.applicant?.idCode || '—',
//           fullName: r.username || '—',
//           bedType: `${r.bedroom} Bed`,
//           area: r.area || '—',
//           site: r.site || '—',
//           houseNumber: r.houseNumber || '—',
//           floor: r.floor ?? '—',
//         });
//       });
//       ws.getRow(1).font = { bold: true };
//     }

//     // 3. Waitlist Sheet Layout (Applicant ID, Full Name, Bed Type, Area (m²), Site)
//     const waitlist = results.filter((r) => r.status === 'WAITLIST');
//     if (waitlist.length) {
//       const ws = wb.addWorksheet('Waitlist');
//       ws.columns = [
//         { header: 'Applicant ID', key: 'applicantId', width: 18 },
//         { header: 'Full Name', key: 'fullName', width: 25 },
//         { header: 'Bed Type', key: 'bedType', width: 12 },
//         { header: 'Area (m²)', key: 'area', width: 14 },
//         { header: 'Site', key: 'site', width: 16 },
//       ];
//       waitlist.forEach((r) => {
//         ws.addRow({
//           applicantId: r.applicant?.idCode || '—',
//           fullName: r.username || '—',
//           bedType: `${r.bedroom} Bed`,
//           area: r.area || '—',
//           site: r.site || '—',
//         });
//       });
//       ws.getRow(1).font = { bold: true };
//     }

//     // Parse values safely to build: result_site_area_bedtype.xlsx
//     const safeSite = metadata.site ? metadata.site.replace(/\s+/g, '-') : 'Site';
//     const areaValue = metadata.area ? String(metadata.area).trim() : '0m2';
//     const bedTypeValue = metadata.bedroom ? `${metadata.bedroom}Bed` : '0Bed';
//     const filename = `result_${safeSite}_${areaValue}_${bedTypeValue}.xlsx`;

//     // Force strict filename headers so browser security contexts parse it cleanly
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encode大量Component(filename)}`);
//     res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose header to frontend fetch context

//     await wb.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error('Download results error:', err);
//     if (!res.headersSent) {
//       return res.status(500).json({ ok: false, message: 'Failed to export Excel file' });
//     }
//   }
// };

// // Simple helper utility to guarantee characters encode properly without breaking HTTP headers
// function encode大量Component(str) {
//   return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
// }

// exports.getUnallocatedSummary = async (req, res) => {
//   try {
//     // 1. Fetch ALL raw houses where status is explicitly NONE
//     const unallocatedHouses = await prisma.house.findMany({
//       where: { status: 'NONE' },
//       select: { site: true, bedroom: true, area: true }
//     });

//     // 2. Aggregate counts manually to bypass nullable field bugs in Prisma groupBy
//     const map = {};
//     unallocatedHouses.forEach((h) => {
//       const bed = h.bedroom !== null && h.bedroom !== undefined ? h.bedroom : 0;
//       const key = `${h.site}|${bed}|${String(h.area).trim()}`;
      
//       if (!map[key]) {
//         map[key] = {
//           site: h.site,
//           bedroom: bed,
//           area: String(h.area).trim(),
//           count: 0
//         };
//       }
//       map[key].count += 1;
//     });

//     const groups = Object.values(map);

//     return res.json({ ok: true, groups });
//   } catch (err) {
//     console.error('Unallocated summary fallback calculations failed:', err);
//     return res.status(500).json({ ok: false, message: 'Failed to look up unallocated pools' });
//   }
// };
// exports.clearDatabaseAll = async (req, res) => {
//   try {
//     // Delete in explicit sequential order to respect database relational foreign key constraints
//     await prisma.$transaction([
//       prisma.lotteryResult.deleteMany(),
//       prisma.applicant.deleteMany(),
//       prisma.house.deleteMany(),
//     ]);

//     return res.json({ ok: true, message: 'Database wiped clean successfully. Ready for fresh imports.' });
//   } catch (err) {
//     console.error('System database truncation error:', err);
//     return res.status(500).json({ ok: false, message: 'Wipe request failed' });
//   }
// };


const prisma = require('../lib/prisma');
const ExcelJS = require('exceljs');

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cryptoRandomInt(min, max) {
  const range = max - min;
  if (range <= 0) return min;
  const cryptoObj = require('crypto').webcrypto || globalThis.crypto;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);
  const buf = new Uint32Array(1);
  let n;
  if (!cryptoObj || !cryptoObj.getRandomValues) {
    return min + Math.floor(Math.random() * range);
  }
  do {
    cryptoObj.getRandomValues(buf);
    cryptoObj.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return min + (n % range);
}

exports.draw = async (req, res) => {
  try {
    const { site, bedroom, area, lotteryRunId } = req.body || {};
    if (!site || !bedroom || !area || !lotteryRunId) {
      return res.status(400).json({ ok: false, message: 'site, bedroom, area, and lotteryRunId are required' });
    }

    const bedCount = Number(bedroom);
    const searchArea = String(area).trim();

    const existing = await prisma.lotteryResult.findFirst({
      where: { site, bedroom: bedCount, area: searchArea }
    });
    if (existing) {
      return res.status(409).json({
        ok: false,
        message: 'Lottery has already been drawn for this combination',
        lotteryId: existing.lotteryRunId,
      });
    }

    const availableHouses = await prisma.house.findMany({
      where: { site, bedroom: bedCount, area: searchArea, status: 'NONE' },
    });

    // ✅ VALIDATION FIX: Filter strictly to ensure only untouched applicants play
    const applicants = await prisma.applicant.findMany({
      where: { 
        site, 
        bedroom: bedCount, 
        area: searchArea,
        status: 'NONE' // This strictly blocks 'WINNER' and 'WAITLIST' states
      },
    });

    if (!applicants.length) return res.status(400).json({ ok: false, message: 'No eligible applicants found with status NONE' });
    if (!availableHouses.length) return res.status(400).json({ ok: false, message: 'No houses available' });

    // Store the exact total count of houses available before shuffling and slicing
    const totalHousesCountInPool = availableHouses.length;

    const shuffledApplicants = shuffle(applicants);
    const shuffledHouses = shuffle(availableHouses);

    const winnersCount = Math.min(availableHouses.length, applicants.length);
    const winners = shuffledApplicants.slice(0, winnersCount);
    const waitlist = shuffledApplicants.slice(winnersCount);

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < winners.length; i++) {
        const app = winners[i];
        const h = shuffledHouses[i];
        await tx.lotteryResult.create({
          data: {
            lotteryRunId,
            username: app.username,
            site,
            subcity: h.subcity || '', 
            area: searchArea,
            bedroom: bedCount,
            floor: h.floor,
            block: h.block || '',
            houseNumber: h.houseNumber,
            netarea: h.netarea || '',
            proportionalarea: h.proportionalarea || '',
            commonarea: h.commonarea || '',
            totalarea: h.totalarea || '',
            status: 'WINNER',
            houseId: h.id,
            applicantId: app.id,
          },
        });
        
        // Update house to allocated status
        await tx.house.update({
          where: { id: h.id },
          data: { status: 'PROVIDED' },
        });

        // ✅ Update applicant status to WINNER so they can't play again
        await tx.applicant.update({
          where: { id: app.id },
          data: { status: 'WINNER' },
        });
      }

      for (let i = 0; i < waitlist.length; i++) {
        const app = waitlist[i];
        await tx.lotteryResult.create({
          data: {
            lotteryRunId,
            username: app.username,
            site,
            area: searchArea,
            bedroom: bedCount,
            status: 'WAITLIST',
            applicantId: app.id,
          },
        });

        // ✅ Update applicant status to WAITLIST so they don't get selected elsewhere
        await tx.applicant.update({
          where: { id: app.id },
          data: { status: 'WAITLIST' },
        });
      }
    });

    return res.json({
      ok: true,
      lotteryId: lotteryRunId,
      summary: {
        siteName: site,
        bedType: `${bedCount} Bed`,
        totalArea: searchArea,
        totalHouses: totalHousesCountInPool,
        winnersCount: winners.length,
        waitlistCount: waitlist.length,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message || 'Draw failed' });
  }
};

exports.listLotteries = async (req, res) => {
  try {
    const lotteries = await prisma.lotteryResult.findMany({
      distinct: ['lotteryRunId'],
      orderBy: { drawDate: 'desc' },
    });
    return res.json({ ok: true, lotteries });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: req.params.id },
      include: { applicant: true, house: true },
      orderBy: { status: 'asc' },
    });
    return res.json({ ok: true, results });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const [houses, applicants, runGroups] = await Promise.all([
      prisma.house.count(),
      prisma.applicant.count(),
      prisma.lotteryResult.groupBy({ by: ['lotteryRunId'] }),
    ]);
    return res.json({ ok: true, stats: { houses, applicants, lotteries: runGroups.length } });
  } catch (err) {
    console.error('Stats fetch error:', err);
    return res.status(500).json({ ok: false, message: 'Failed to fetch database stats' });
  }
};

exports.downloadResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Load results along with relational applicant models
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: id },
      include: { applicant: true, house: true },
      orderBy: [{ status: 'asc' }],
    });

    if (!results.length) return res.status(404).json({ ok: false, message: 'No results found for this run' });

    const metadata = results[0];
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Apartment Lottery System';
    wb.created = new Date();

    // 1. Summary Sheet Layout (With Subcity line completely removed)
    const summarySheet = wb.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 35 },
    ];
    summarySheet.addRows([
      { field: 'Site Name', value: metadata.site },
      { field: 'Bed Type', value: `${metadata.bedroom} Bed` },
      { field: 'House Area (m²)', value: metadata.area || '—' },
      { field: 'Total Winners', value: results.filter(r => r.status === 'WINNER').length },
      { field: 'Total Waitlist', value: results.filter(r => r.status === 'WAITLIST').length },
      { field: 'Drawn At', value: metadata.drawDate.toISOString() },
    ]);
    summarySheet.getRow(1).font = { bold: true };

    // 2. Updated Winners Sheet Layout Matrix Columns Mapping Rules
    const winners = results.filter((r) => r.status === 'WINNER');
    if (winners.length) {
      const ws = wb.addWorksheet('Winners');
      ws.columns = [
        { header: 'Applicant ID', key: 'applicantId', width: 18 },
        { header: 'Bed Type', key: 'bedType', width: 14 },
        { header: 'Site', key: 'site', width: 18 },
        { header: 'Subcity', key: 'subcity', width: 16 },
        { header: 'Block', key: 'block', width: 12 },
        { header: 'House Number', key: 'houseNumber', width: 16 },
        { header: 'Floor', key: 'floor', width: 10 },
        { header: 'Net area (m²)', key: 'netarea', width: 14 },
        { header: 'Proportional area (m²)', key: 'proportionalarea', width: 14 },
        { header: 'Common area (m²)', key: 'commonarea', width: 14 },
        { header: 'Total area (m²)', key: 'totalarea', width: 14 },
        { header: 'House area (m²)', key: 'area', width: 14 },

      ];
      winners.forEach((r) => {
        ws.addRow({
          applicantId: r.applicant?.idCode || '—',
          fullName: r.username || '—',
          bedType: `${r.bedroom} Bed`,
          site: r.site || '—',
          subcity: r.subcity || '—',
          block: r.block || '—',
          houseNumber: r.houseNumber || '—',
          floor: r.floor ?? '—',
          netarea: r.netarea || '—',
          proportionalarea: r.proportionalarea || '—',
          commonarea: r.commonarea || '—',
          totalarea: r.totalarea || '—',
          area: r.area || '—',
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    // 3. Waitlist Sheet Layout (Kept completely as it is)
    const waitlist = results.filter((r) => r.status === 'WAITLIST');
    if (waitlist.length) {
      const ws = wb.addWorksheet('Waitlist');
      ws.columns = [
        { header: 'Applicant ID', key: 'applicantId', width: 18 },
        { header: 'Bed Type', key: 'bedType', width: 12 },
        { header: 'House Area (m²)', key: 'area', width: 14 },
        { header: 'Site', key: 'site', width: 16 },
      ];
      waitlist.forEach((r) => {
        ws.addRow({
          applicantId: r.applicant?.idCode || '—',
          fullName: r.username || '—',
          bedType: `${r.bedroom} Bed`,
          area: r.area || '—',
          site: r.site || '—',
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    // 4. RESTORED ORIGINAL COMBINATION FILENAME PATTERN
const safeSite = metadata.site ? metadata.site.replace(/\s+/g, '-') : 'Site';
const areaValue = metadata.area ? String(metadata.area).trim() : '0m2';
const bedTypeValue = metadata.bedroom ? `${metadata.bedroom}Bed` : '0Bed';
const filename = `result_${safeSite}_${areaValue}_${bedTypeValue}.xlsx`;

res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
// FIXED: Changed encode大量Component to encodeURIComponent
res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

await wb.xlsx.write(res);
res.end();
  } catch (err) {
    console.error('Download results error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, message: 'Failed to export Excel file' });
    }
  }
};

function encode大量Component(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

exports.getUnallocatedSummary = async (req, res) => {
  try {
    const unallocatedHouses = await prisma.house.findMany({
      where: { status: 'NONE' },
      select: { site: true, bedroom: true, area: true }
    });

    const map = {};
    unallocatedHouses.forEach((h) => {
      const bed = h.bedroom !== null && h.bedroom !== undefined ? h.bedroom : 0;
      const key = `${h.site}|${bed}|${String(h.area).trim()}`;
      
      if (!map[key]) {
        map[key] = {
          site: h.site,
          bedroom: bed,
          area: String(h.area).trim(),
          count: 0
        };
      }
      map[key].count += 1;
    });

    return res.json({ ok: true, groups: Object.values(map) });
  } catch (err) {
    console.error('Unallocated summary failed:', err);
    return res.status(500).json({ ok: false, message: 'Failed to look up unallocated pools' });
  }
};

exports.clearDatabaseAll = async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.lotteryResult.deleteMany(),
      prisma.applicant.deleteMany(),
      prisma.house.deleteMany(),
    ]);
    return res.json({ ok: true, message: 'Database wiped clean successfully.' });
  } catch (err) {
    console.error('Database truncation error:', err);
    return res.status(500).json({ ok: false, message: 'Wipe request failed' });
  }
};