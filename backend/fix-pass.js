require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

async function fix() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.update({
    where: { username: 'admin' },
    data: { passwordHash }
  });
  console.log('Done - password is now admin123');
  prisma.$disconnect();
}
fix();
