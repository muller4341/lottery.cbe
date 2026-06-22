require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

async function resetPassword() {
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.admin.update({
    where: { username: 'admin' },
    data: { passwordHash }
  });
  
  console.log('Password reset! New password: admin123');
  prisma.$disconnect();
}
resetPassword();
