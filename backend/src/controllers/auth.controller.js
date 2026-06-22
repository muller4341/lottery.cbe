// Auth controller
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../lib/jwt');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'username and password are required' });
    }
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const token = signToken({ id: admin.id, username: admin.username });
    return res.json({
      ok: true,
      token,
      admin: { id: admin.id, username: admin.username, fullName: admin.fullName },
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(404).json({ ok: false, message: 'Not found' });
  return res.json({
    ok: true,
    admin: { id: admin.id, username: admin.username, fullName: admin.fullName },
  });
};
