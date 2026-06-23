// // Seed script - creates default admin and ensures sites exist
// require('dotenv').config();
// const bcrypt = require('bcryptjs');
// const prisma = require('../src/lib/prisma');
// const { ensureDefaults } = require('../src/controllers/sites.controller');

// async function main() {
//   await ensureDefaults();

//   const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
//   const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
//   const fullName = process.env.DEFAULT_ADMIN_FULLNAME || 'System Administrator';

//   const passwordHash = await bcrypt.hash(password, 10);

//   const admin = await prisma.admin.upsert({
//     where: { username },
//     update: { passwordHash, fullName },
//     create: { username, passwordHash, fullName },
//   });

//   console.log(`Admin ready: ${admin.username} (id=${admin.id})`);
//   console.log(`Default password: ${password}  (change in production!)`);
// }

// main()
//   .catch((e) => { console.error(e); process.exit(1); })
//   .finally(async () => { await prisma.$disconnect(); });


// Seed script - creates default admin (User model)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function main() {
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const fullName = process.env.DEFAULT_ADMIN_FULLNAME || 'System Administrator';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: { 
      password: passwordHash, 
      fullName 
    },
    create: { 
      username, 
      password: passwordHash, 
      fullName,
      email: `${username}@example.com`   // required field
    },
  });

  console.log(`✅ Admin ready: ${user.username} (id=${user.id})`);
  console.log(`🔑 Default password: ${password}  (change in production!)`);
  console.log(`📧 Email: ${user.email}`);
}

main()
  .catch((e) => { 
    console.error('❌ Seed failed:', e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });