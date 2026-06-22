require('dotenv').config();
const prisma = require('./src/lib/prisma');

(async () => {
  const sites = await prisma.site.findMany();
  const houses = await prisma.house.groupBy({
    by: ['siteId', 'bedType', 'totalArea'],
    _count: { _all: true },
  });
  const apps = await prisma.applicant.groupBy({
    by: ['siteId', 'bedType', 'totalArea'],
    _count: { _all: true },
  });
  const lots = await prisma.lottery.findMany({ include: { site: true } });

  console.log('SITES:', JSON.stringify(sites, null, 2));
  console.log('HOUSES GROUP:', JSON.stringify(houses, null, 2));
  console.log('APPS GROUP:', JSON.stringify(apps, null, 2));
  console.log('LOTTERIES:', JSON.stringify(lots, null, 2));

  // Detail for German / 1bed / 74.5
  const german = sites.find(s => s.name.toLowerCase() === 'german');
  if (german) {
    console.log('\n--- German 1bed 74.5 detail ---');
    const h = await prisma.house.findMany({
      where: { siteId: german.id, bedType: '1bed', totalArea: 74.5 },
    });
    const a = await prisma.applicant.findMany({
      where: { siteId: german.id, bedType: '1bed', totalArea: 74.5 },
    });
    const allocated = h.filter(x => x.isAllocated).length;
    console.log('Total houses for German 1bed 74.5:', h.length, 'isAllocated count:', allocated);
    console.log('Available houses:', h.length - allocated);
    console.log('Total applicants:', a.length);
    console.log('Sample house totalArea values (raw):', h.slice(0, 3).map(x => x.totalArea));
    console.log('Sample applicant totalArea values (raw):', a.slice(0, 3).map(x => x.totalArea));
  }

  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
