// Sites controller
const prisma = require('../lib/prisma');

const ALLOWED_SITES = ['German', 'Ayer-tena', 'Girar'];

exports.list = async (req, res) => {
  const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } });
  return res.json({ ok: true, sites });
};

exports.ensureDefaults = async () => {
  // Make sure the 3 default sites exist
  for (const name of ALLOWED_SITES) {
    await prisma.site.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
};
