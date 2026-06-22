// Reset script - clears all data except admin user
require('dotenv').config();
const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  // Clear all data from each model (order matters for foreign keys)
  const modelsToClear = [
    'LotteryResult',  // references Lottery, Applicant, House
    'Lottery',        // references Site, Admin
    'Applicant',      // references Site
    'House',          // references Site
    'Site',           // standalone
  ];

  for (const model of modelsToClear) {
    try {
      const result = await prisma[model].deleteMany();
      console.log(`Cleared: ${model} (${result.count} records)`);
    } catch (e) {
      console.log(`Error clearing ${model}: ${e.message}`);
    }
  }

  // Ensure admin user exists
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const fullName = process.env.DEFAULT_ADMIN_FULLNAME || 'System Administrator';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash, fullName },
    create: { username, passwordHash, fullName },
  });
  console.log(`Admin user ensured: ${username}`);

  console.log('\nDatabase reset complete!');
}

resetDatabase()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
