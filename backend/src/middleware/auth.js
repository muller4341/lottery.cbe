// Auth middleware - requires Bearer token
const { verifyToken } = require('../lib/jwt');

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Authentication required' });
    }
    const decoded = verifyToken(token);
    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
  }
}

module.exports = { authRequired };
