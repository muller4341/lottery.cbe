// // // Lottery controller - draw + results + Excel export
// // const prisma = require('../lib/prisma');
// // const ExcelJS = require('exceljs');

// // /**
// //  * Cryptographically-strong Fisher-Yates shuffle.
// //  * Returns a new array; does not mutate input.
// //  */
// // function shuffle(array) {
// //   const a = array.slice();
// //   for (let i = a.length - 1; i > 0; i--) {
// //     const j = cryptoRandomInt(0, i + 1);
// //     [a[i], a[j]] = [a[j], a[i]];
// //   }
// //   return a;
// // }

// // // Use Node's built-in webcrypto (available globally in Node 19+)
// // function cryptoRandomInt(min, max) {
// //   // inclusive of min, exclusive of max
// //   const range = max - min;
// //   if (range <= 0) return min;
// //   const cryptoObj = require('crypto').webcrypto || globalThis.crypto;
// //   // Rejection sampling for unbiased uniform integer
// //   const maxUint32 = 0xffffffff;
// //   const limit = maxUint32 - (maxUint32 % range);
// //   const buf = new Uint32Array(1);
// //   let n;
// //   // Fall back to a simple Math.random if webcrypto unavailable (shouldn't happen on modern Node)
// //   if (!cryptoObj || !cryptoObj.getRandomValues) {
// //     return min + Math.floor(Math.random() * range);
// //   }
// //   do {
// //     cryptoObj.getRandomValues(buf);
// //     n = buf[0];
// //   } while (n >= limit);
// //   return min + (n % range);
// // }

// // /**
// //  * Draw the lottery for a (site, bedType, totalArea) combination.
// //  * Rules:
// //  *  - Available houses for the combination = N
// //  *  - Total applicants for the combination = M
// //  *  - If M > N: pick N winners at random, remaining (M - N) are waitlist (also ordered randomly)
// //  *  - If M <= N: all M are winners, no waitlist
// //  * Each winner is assigned a specific house (random house from the available pool).
// //  */
// // exports.draw = async (req, res) => {
// //   try {
// //     const { siteId, bedType, totalArea } = req.body || {};
// //     if (!siteId || !bedType || totalArea === undefined || totalArea === null) {
// //       return res.status(400).json({
// //         ok: false,
// //         message: 'siteId, bedType, and totalArea are required',
// //       });
// //     }

// //     const site = await prisma.site.findUnique({ where: { id: Number(siteId) } });
// //     if (!site) return res.status(404).json({ ok: false, message: 'Site not found' });

// //     const bed = String(bedType).toLowerCase();
// //     const area = Number(totalArea);
// //     if (!['1bed', '2bed', '3bed'].includes(bed)) {
// //       return res.status(400).json({ ok: false, message: 'Invalid bedType' });
// //     }
// //     if (Number.isNaN(area) || area <= 0) {
// //       return res.status(400).json({ ok: false, message: 'Invalid totalArea' });
// //     }

// //     // Reject duplicate draw
// //     const existing = await prisma.lottery.findUnique({
// //       where: { siteId_bedType_totalArea: { siteId: site.id, bedType: bed, totalArea: area } },
// //     });
// //     if (existing) {
// //       return res.status(409).json({
// //         ok: false,
// //         message: 'Lottery has already been drawn for this (site, bedType, totalArea)',
// //         lotteryId: existing.id,
// //       });
// //     }

// //     // Fetch available houses (not already allocated to another lottery result)
// //     const availableHouses = await prisma.house.findMany({
// //       where: { siteId: site.id, bedType: bed, totalArea: area, isAllocated: false },
// //     });

// //     // Fetch applicants for this combination
// //     const applicants = await prisma.applicant.findMany({
// //       where: { siteId: site.id, bedType: bed, totalArea: area },
// //     });

// //     if (!applicants.length) {
// //       return res.status(400).json({
// //         ok: false,
// //         message: 'No applicants found for this combination',
// //       });
// //     }
// //     if (!availableHouses.length) {
// //       return res.status(400).json({
// //         ok: false,
// //         message: 'No houses available for this combination',
// //       });
// //     }

// //     // Shuffle applicants and houses
// //     const shuffledApplicants = shuffle(applicants);
// //     const shuffledHouses = shuffle(availableHouses);

// //     const totalHouses = availableHouses.length;
// //     const totalApplicants = applicants.length;
// //     const winnersCount = Math.min(totalHouses, totalApplicants);
// //     const waitlistCount = Math.max(0, totalApplicants - totalHouses);

// //     // Pick winners (first N from shuffled list, assign them houses)
// //     const winners = shuffledApplicants.slice(0, winnersCount);
// //     const waitlist = shuffledApplicants.slice(winnersCount);

// //     // Create lottery + results in a single transaction
// //     const result = await prisma.$transaction(async (tx) => {
// //       const lottery = await tx.lottery.create({
// //         data: {
// //           siteId: site.id,
// //           bedType: bed,
// //           totalArea: area,
// //           totalHouses,
// //           totalApplicants,
// //           winnersCount,
// //           waitlistCount,
// //           drawnById: req.admin.id,
// //         },
// //       });

// //       const resultRows = [];

// //       for (let i = 0; i < winners.length; i++) {
// //         const applicant = winners[i];
// //         const house = shuffledHouses[i];
// //         const r = await tx.lotteryResult.create({
// //           data: {
// //             lotteryId: lottery.id,
// //             applicantId: applicant.id,
// //             houseId: house.id,
// //             status: 'WINNER',
// //             position: i + 1,
// //           },
// //         });
// //         await tx.house.update({
// //           where: { id: house.id },
// //           data: { isAllocated: true },
// //         });
// //         resultRows.push(r);
// //       }

// //       for (let i = 0; i < waitlist.length; i++) {
// //         const applicant = waitlist[i];
// //         const r = await tx.lotteryResult.create({
// //           data: {
// //             lotteryId: lottery.id,
// //             applicantId: applicant.id,
// //             houseId: null,
// //             status: 'WAITLIST',
// //             position: i + 1,
// //           },
// //         });
// //         resultRows.push(r);
// //       }

// //       return { lottery, results: resultRows };
// //     });

// //     return res.json({
// //       ok: true,
// //       message: 'Lottery drawn successfully',
// //       summary: {
// //         siteId: site.id,
// //         siteName: site.name,
// //         bedType: bed,
// //         totalArea: area,
// //         totalHouses,
// //         totalApplicants,
// //         winnersCount,
// //         waitlistCount,
// //       },
// //       lotteryId: result.lottery.id,
// //     });
// //   } catch (err) {
// //     console.error('lottery draw error', err);
// //     return res.status(500).json({ ok: false, message: err.message || 'Draw failed' });
// //   }
// // };

// // exports.listLotteries = async (req, res) => {
// //   const lotteries = await prisma.lottery.findMany({
// //     include: { site: true },
// //     orderBy: { drawnAt: 'desc' },
// //   });
// //   return res.json({ ok: true, lotteries });
// // };

// // exports.getResults = async (req, res) => {
// //   const id = Number(req.params.id);
// //   if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid id' });

// //   const lottery = await prisma.lottery.findUnique({
// //     where: { id },
// //     include: { site: true },
// //   });
// //   if (!lottery) return res.status(404).json({ ok: false, message: 'Not found' });

// //   const results = await prisma.lotteryResult.findMany({
// //     where: { lotteryId: id },
// //     include: {
// //       applicant: true,
// //       house: true,
// //     },
// //     orderBy: [{ status: 'asc' }, { position: 'asc' }],
// //   });

// //   return res.json({ ok: true, lottery, results });
// // };

// // exports.downloadResults = async (req, res) => {
// //   const id = Number(req.params.id);
// //   if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid id' });

// //   const lottery = await prisma.lottery.findUnique({
// //     where: { id },
// //     include: { site: true },
// //   });
// //   if (!lottery) return res.status(404).json({ ok: false, message: 'Not found' });

// //   const results = await prisma.lotteryResult.findMany({
// //     where: { lotteryId: id },
// //     include: { applicant: true, house: true },
// //     orderBy: [{ status: 'asc' }, { position: 'asc' }],
// //   });

// //   const wb = new ExcelJS.Workbook();
// //   wb.creator = 'Apartment Lottery System';
// //   wb.created = new Date();

// //   // Summary sheet
// //   const summary = wb.addWorksheet('Summary');
// //   summary.columns = [
// //     { header: 'Field', key: 'field', width: 25 },
// //     { header: 'Value', key: 'value', width: 35 },
// //   ];
// //   summary.addRows([
// //     { field: 'Site Name', value: lottery.site.name },
// //     { field: 'Bed Type', value: lottery.bedType },
// //     { field: 'Total Area (m²)', value: lottery.totalArea },
// //     { field: 'Total Houses', value: lottery.totalHouses },
// //     { field: 'Total Applicants', value: lottery.totalApplicants },
// //     { field: 'Winners', value: lottery.winnersCount },
// //     { field: 'Waitlist', value: lottery.waitlistCount },
// //     { field: 'Drawn At', value: lottery.drawnAt.toISOString() },
// //   ]);
// //   summary.getRow(1).font = { bold: true };

// //   // Winners sheet
// //   const winners = results.filter((r) => r.status === 'WINNER');
// //   if (winners.length) {
// //     const ws = wb.addWorksheet('Winners');
// //     ws.columns = [
// //       { header: 'Position', key: 'position', width: 10 },
// //       { header: 'Employee ID', key: 'employeeId', width: 18 },
// //       { header: 'Full Name', key: 'fullName', width: 25 },
// //       { header: 'Block', key: 'block', width: 12 },
// //       { header: 'House Number', key: 'house', width: 14 },
// //       { header: 'Floor', key: 'floor', width: 8 },
// //       { header: 'Bed Type', key: 'bedType', width: 10 },
// //       { header: 'Total Area (m²)', key: 'area', width: 16 },
// //     ];
// //     winners.forEach((r) => {
// //       ws.addRow({
// //         position: r.position,
// //         employeeId: r.applicant.employeeId,
// //         fullName: r.applicant.fullName || '',
// //         block: r.house?.blockNumber || '',
// //         house: r.house?.houseNumber || '',
// //         floor: r.house?.floorNumber ?? '',
// //         bedType: r.house?.bedType || lottery.bedType,
// //         area: r.house?.totalArea ?? lottery.totalArea,
// //       });
// //     });
// //     ws.getRow(1).font = { bold: true };
// //   }

// //   // Waitlist sheet (only if any)
// //   const waitlist = results.filter((r) => r.status === 'WAITLIST');
// //   if (waitlist.length) {
// //     const ws = wb.addWorksheet('Waitlist');
// //     ws.columns = [
// //       { header: 'Position', key: 'position', width: 10 },
// //       { header: 'Employee ID', key: 'employeeId', width: 18 },
// //       { header: 'Full Name', key: 'fullName', width: 25 },
// //       { header: 'Preferred Site', key: 'site', width: 16 },
// //       { header: 'Bed Type', key: 'bedType', width: 10 },
// //       { header: 'Preferred Area (m²)', key: 'area', width: 20 },
// //     ];
// //     waitlist.forEach((r) => {
// //       ws.addRow({
// //         position: r.position,
// //         employeeId: r.applicant.employeeId,
// //         fullName: r.applicant.fullName || '',
// //         site: lottery.site.name,
// //         bedType: lottery.bedType,
// //         area: lottery.totalArea,
// //       });
// //     });
// //     ws.getRow(1).font = { bold: true };
// //   }

// //   // Filename
// //   const safeSite = lottery.site.name.replace(/\s+/g, '-');
// //   const filename = `Lottery_${safeSite}_${lottery.bedType}_${lottery.totalArea}m2.xlsx`;

// //   res.setHeader(
// //     'Content-Type',
// //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// //   );
// //   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

// //   await wb.xlsx.write(res);
// //   res.end();
// // };

// // exports.stats = async (req, res) => {
// //   const [houses, applicants, lotteries, sites] = await Promise.all([
// //     prisma.house.count(),
// //     prisma.applicant.count(),
// //     prisma.lottery.count(),
// //     prisma.site.count(),
// //   ]);
// //   return res.json({ ok: true, stats: { houses, applicants, lotteries, sites } });
// // };


// // Lottery controller - draw + results + Excel export
// const { prisma } = require('../lib/prisma'); // Fixed import to destructure prisma
// const ExcelJS = require('exceljs');

// /**
//  * Cryptographically-strong Fisher-Yates shuffle.
//  * Returns a new array; does not mutate input.
//  */
// function shuffle(array) {
//   const a = array.slice();
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = cryptoRandomInt(0, i + 1);
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// // Use Node's built-in webcrypto (available globally in Node 19+)
// function cryptoRandomInt(min, max) {
//   // inclusive of min, exclusive of max
//   const range = max - min;
//   if (range <= 0) return min;
//   const cryptoObj = require('crypto').webcrypto || globalThis.crypto;
//   // Rejection sampling for unbiased uniform integer
//   const maxUint32 = 0xffffffff;
//   const limit = maxUint32 - (maxUint32 % range);
//   const buf = new Uint32Array(1);
//   let n;
//   // Fall back to a simple Math.random if webcrypto unavailable (shouldn't happen on modern Node)
//   if (!cryptoObj || !cryptoObj.getRandomValues) {
//     return min + Math.floor(Math.random() * range);
//   }
//   do {
//     cryptoObj.getRandomValues(buf);
//     n = buf[0];
//   } while (n >= limit);
//   return min + (n % range);
// }

// /**
//  * Draw the lottery for a (site, bedType, totalArea) combination.
//  * Rules:
//  * - Available houses for the combination = N
//  * - Total applicants for the combination = M
//  * - If M > N: pick N winners at random, remaining (M - N) are waitlist (also ordered randomly)
//  * - If M <= N: all M are winners, no waitlist
//  * Each winner is assigned a specific house (random house from the available pool).
//  */
// exports.draw = async (req, res) => {
//   try {
//     const { siteId, bedType, totalArea } = req.body || {};
//     if (!siteId || !bedType || totalArea === undefined || totalArea === null) {
//       return res.status(400).json({
//         ok: false,
//         message: 'siteId, bedType, and totalArea are required',
//       });
//     }

//     const site = await prisma.site.findUnique({ where: { id: Number(siteId) } });
//     if (!site) return res.status(404).json({ ok: false, message: 'Site not found' });

//     const bed = String(bedType).toLowerCase();
//     const area = Number(totalArea);
//     if (!['1bed', '2bed', '3bed'].includes(bed)) {
//       return res.status(400).json({ ok: false, message: 'Invalid bedType' });
//     }
//     if (Number.isNaN(area) || area <= 0) {
//       return res.status(400).json({ ok: false, message: 'Invalid totalArea' });
//     }

//     // Reject duplicate draw
//     const existing = await prisma.lottery.findUnique({
//       where: { siteId_bedType_totalArea: { siteId: site.id, bedType: bed, totalArea: area } },
//     });
//     if (existing) {
//       return res.status(409).json({
//         ok: false,
//         message: 'Lottery has already been drawn for this (site, bedType, totalArea)',
//         lotteryId: existing.id,
//       });
//     }

//     // Fetch available houses (not already allocated to another lottery result)
//     const availableHouses = await prisma.house.findMany({
//       where: { siteId: site.id, bedType: bed, totalArea: area, isAllocated: false },
//     });

//     // Fetch applicants for this combination
//     const applicants = await prisma.applicant.findMany({
//       where: { siteId: site.id, bedType: bed, totalArea: area },
//     });

//     if (!applicants.length) {
//       return res.status(400).json({
//         ok: false,
//         message: 'No applicants found for this combination',
//       });
//     }
//     if (!availableHouses.length) {
//       return res.status(400).json({
//         ok: false,
//         message: 'No houses available for this combination',
//       });
//     }

//     // Shuffle applicants and houses
//     const shuffledApplicants = shuffle(applicants);
//     const shuffledHouses = shuffle(availableHouses);

//     const totalHouses = availableHouses.length;
//     const totalApplicants = applicants.length;
//     const winnersCount = Math.min(totalHouses, totalApplicants);
//     const waitlistCount = Math.max(0, totalApplicants - totalHouses);

//     // Pick winners (first N from shuffled list, assign them houses)
//     const winners = shuffledApplicants.slice(0, winnersCount);
//     const waitlist = shuffledApplicants.slice(winnersCount);

//     // Create lottery + results in a single transaction
//     const result = await prisma.$transaction(async (tx) => {
//       const lottery = await tx.lottery.create({
//         data: {
//           siteId: site.id,
//           bedType: bed,
//           totalArea: area,
//           totalHouses,
//           totalApplicants,
//           winnersCount,
//           waitlistCount,
//           drawnById: req.admin.id,
//         },
//       });

//       const resultRows = [];

//       for (let i = 0; i < winners.length; i++) {
//         const applicant = winners[i];
//         const house = shuffledHouses[i];
//         const r = await tx.lotteryResult.create({
//           data: {
//             lotteryId: lottery.id,
//             applicantId: applicant.id,
//             houseId: house.id,
//             status: 'WINNER',
//             position: i + 1,
//           },
//         });
//         await tx.house.update({
//           where: { id: house.id },
//           data: { isAllocated: true },
//         });
//         resultRows.push(r);
//       }

//       for (let i = 0; i < waitlist.length; i++) {
//         const applicant = waitlist[i];
//         const r = await tx.lotteryResult.create({
//           data: {
//             lotteryId: lottery.id,
//             applicantId: applicant.id,
//             houseId: null,
//             status: 'WAITLIST',
//             position: i + 1,
//           },
//         });
//         resultRows.push(r);
//       }

//       return { lottery, results: resultRows };
//     });

//     return res.json({
//       ok: true,
//       message: 'Lottery drawn successfully',
//       summary: {
//         siteId: site.id,
//         siteName: site.name,
//         bedType: bed,
//         totalArea: area,
//         totalHouses,
//         totalApplicants,
//         winnersCount,
//         waitlistCount,
//       },
//       lotteryId: result.lottery.id,
//     });
//   } catch (err) {
//     console.error('lottery draw error', err);
//     return res.status(500).json({ ok: false, message: err.message || 'Draw failed' });
//   }
// };

// exports.listLotteries = async (req, res) => {
//   try {
//     const lotteries = await prisma.lottery.findMany({
//       include: { site: true },
//       orderBy: { drawnAt: 'desc' },
//     });
//     return res.json({ ok: true, lotteries });
//   } catch (err) {
//     console.error('List lotteries error:', err);
//     return res.status(500).json({ ok: false, message: 'Failed to retrieve lotteries' });
//   }
// };

// exports.getResults = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid id' });

//     const lottery = await prisma.lottery.findUnique({
//       where: { id },
//       include: { site: true },
//     });
//     if (!lottery) return res.status(404).json({ ok: false, message: 'Not found' });

//     const results = await prisma.lotteryResult.findMany({
//       where: { lotteryId: id },
//       include: {
//         applicant: true,
//         house: true,
//       },
//       orderBy: [{ status: 'asc' }, { position: 'asc' }],
//     });

//     return res.json({ ok: true, lottery, results });
//   } catch (err) {
//     console.error('Get results error:', err);
//     return res.status(500).json({ ok: false, message: 'Failed to retrieve results' });
//   }
// };

// exports.downloadResults = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid id' });

//     const lottery = await prisma.lottery.findUnique({
//       where: { id },
//       include: { site: true },
//     });
//     if (!lottery) return res.status(404).json({ ok: false, message: 'Not found' });

//     const results = await prisma.lotteryResult.findMany({
//       where: { lotteryId: id },
//       include: { applicant: true, house: true },
//       orderBy: [{ status: 'asc' }, { position: 'asc' }],
//     });

//     const wb = new ExcelJS.Workbook();
//     wb.creator = 'Apartment Lottery System';
//     wb.created = new Date();

//     // Summary sheet
//     const summary = wb.addWorksheet('Summary');
//     summary.columns = [
//       { header: 'Field', key: 'field', width: 25 },
//       { header: 'Value', key: 'value', width: 35 },
//     ];
//     summary.addRows([
//       { field: 'Site Name', value: lottery.site.name },
//       { field: 'Bed Type', value: lottery.bedType },
//       { field: 'Total Area (m²)', value: lottery.totalArea },
//       { field: 'Total Houses', value: lottery.totalHouses },
//       { field: 'Total Applicants', value: lottery.totalApplicants },
//       { field: 'Winners', value: lottery.winnersCount },
//       { field: 'Waitlist', value: lottery.waitlistCount },
//       { field: 'Drawn At', value: lottery.drawnAt ? lottery.drawnAt.toISOString() : new Date().toISOString() },
//     ]);
//     summary.getRow(1).font = { bold: true };

//     // Winners sheet
//     const winners = results.filter((r) => r.status === 'WINNER');
//     if (winners.length) {
//       const ws = wb.addWorksheet('Winners');
//       ws.columns = [
//         { header: 'Position', key: 'position', width: 10 },
//         { header: 'Employee ID', key: 'employeeId', width: 18 },
//         { header: 'Full Name', key: 'fullName', width: 25 },
//         { header: 'Block', key: 'block', width: 12 },
//         { header: 'House Number', key: 'house', width: 14 },
//         { header: 'Floor', key: 'floor', width: 8 },
//         { header: 'Bed Type', key: 'bedType', width: 10 },
//         { header: 'Total Area (m²)', key: 'area', width: 16 },
//       ];
//       winners.forEach((r) => {
//         ws.addRow({
//           position: r.position,
//           employeeId: r.applicant?.employeeId || '',
//           fullName: r.applicant?.fullName || '',
//           block: r.house?.blockNumber || '',
//           house: r.house?.houseNumber || '',
//           floor: r.house?.floorNumber ?? '',
//           bedType: r.house?.bedType || lottery.bedType,
//           area: r.house?.totalArea ?? lottery.totalArea,
//         });
//       });
//       ws.getRow(1).font = { bold: true };
//     }

//     // Waitlist sheet (only if any)
//     const waitlist = results.filter((r) => r.status === 'WAITLIST');
//     if (waitlist.length) {
//       const ws = wb.addWorksheet('Waitlist');
//       ws.columns = [
//         { header: 'Position', key: 'position', width: 10 },
//         { header: 'Employee ID', key: 'employeeId', width: 18 },
//         { header: 'Full Name', key: 'fullName', width: 25 },
//         { header: 'Preferred Site', key: 'site', width: 16 },
//         { header: 'Bed Type', key: 'bedType', width: 10 },
//         { header: 'Preferred Area (m²)', key: 'area', width: 20 },
//       ];
//       waitlist.forEach((r) => {
//         ws.addRow({
//           position: r.position,
//           employeeId: r.applicant?.employeeId || '',
//           fullName: r.applicant?.fullName || '',
//           site: lottery.site.name,
//           bedType: lottery.bedType,
//           area: lottery.totalArea,
//         });
//       });
//       ws.getRow(1).font = { bold: true };
//     }

//     // Filename
//     const safeSite = lottery.site.name.replace(/\s+/g, '-');
//     const filename = `Lottery_${safeSite}_${lottery.bedType}_${lottery.totalArea}m2.xlsx`;

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     await wb.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error('Download results error:', err);
//     if (!res.headersSent) {
//       return res.status(500).json({ ok: false, message: 'Failed to export Excel file' });
//     }
//   }
// };

// exports.stats = async (req, res) => {
//   try {
//     const [houses, applicants, lotteries, sites] = await Promise.all([
//       prisma.house.count(),
//       prisma.applicant.count(),
//       prisma.lottery.count(),
//       prisma.site.count(),
//     ]);
//     return res.json({ ok: true, stats: { houses, applicants, lotteries, sites } });
//   } catch (err) {
//     console.error('Stats fetch error:', err);
//     return res.status(500).json({ ok: false, message: 'Failed to fetch database stats' });
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

    const applicants = await prisma.applicant.findMany({
      where: { site, bedroom: bedCount, area: searchArea },
    });

    if (!applicants.length) return res.status(400).json({ ok: false, message: 'No applicants found' });
    if (!availableHouses.length) return res.status(400).json({ ok: false, message: 'No houses available' });

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
            area: searchArea,
            bedroom: bedCount,
            floor: h.floor,
            houseNumber: h.houseNumber,
            status: 'WINNER',
            houseId: h.id,
            applicantId: app.id,
          },
        });
        await tx.house.update({
          where: { id: h.id },
          data: { status: 'PROVIDED' },
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
      }
    });

    return res.json({
      ok: true,
      lotteryId: lotteryRunId,
      summary: {
        siteName: site,
        bedType: `${bedCount} Bed`,
        totalArea: searchArea,
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
    // Group by lotteryRunId to find the number of unique lottery draws executed
    const [houses, applicants, runGroups] = await Promise.all([
      prisma.house.count(),
      prisma.applicant.count(),
      prisma.lotteryResult.groupBy({
        by: ['lotteryRunId'],
      }),
    ]);

    return res.json({ 
      ok: true, 
      stats: { 
        houses, 
        applicants, 
        lotteries: runGroups.length // The count of unique runs
      } 
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    return res.status(500).json({ ok: false, message: 'Failed to fetch database stats' });
  }
};

exports.downloadResults = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: id },
      orderBy: [{ status: 'asc' }],
    });

    if (!results.length) return res.status(404).json({ ok: false, message: 'No results found for this run' });

    const metadata = results[0];
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Apartment Lottery System';
    wb.created = new Date();

    // Summary Sheet
    const summarySheet = wb.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 35 },
    ];
    summarySheet.addRows([
      { field: 'Site Name', value: metadata.site },
      { field: 'Bed Type', value: `${metadata.bedroom} Bed` },
      { field: 'Total Area (m²)', value: metadata.area },
      { field: 'Total Winners', value: results.filter(r => r.status === 'WINNER').length },
      { field: 'Total Waitlist', value: results.filter(r => r.status === 'WAITLIST').length },
      { field: 'Drawn At', value: metadata.drawDate.toISOString() },
    ]);
    summarySheet.getRow(1).font = { bold: true };

    // Winners Sheet
    const winners = results.filter((r) => r.status === 'WINNER');
    if (winners.length) {
      const ws = wb.addWorksheet('Winners');
      ws.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 18 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'House Number', key: 'house', width: 14 },
        { header: 'Floor', key: 'floor', width: 8 },
      ];
      winners.forEach((r) => {
        ws.addRow({
          employeeId: r.idCode || '',
          fullName: r.username || '',
          house: r.houseNumber || '',
          floor: r.floor ?? '',
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    // Waitlist Sheet
    const waitlist = results.filter((r) => r.status === 'WAITLIST');
    if (waitlist.length) {
      const ws = wb.addWorksheet('Waitlist');
      ws.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 18 },
        { header: 'Full Name', key: 'fullName', width: 25 },
      ];
      waitlist.forEach((r) => {
        ws.addRow({
          employeeId: r.idCode || '',
          fullName: r.username || '',
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    const safeSite = metadata.site.replace(/\s+/g, '-');
    const filename = `Lottery_${safeSite}_${metadata.bedroom}Bed_${metadata.area}m2.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Download results error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, message: 'Failed to export Excel file' });
    }
  }
};