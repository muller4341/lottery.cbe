// // Auth routes
// const router = require('express').Router();
// const c = require('../controllers/auth.controller');

// router.post('/login', c.login);

// module.exports = router;

// Auth routes
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth');

// Public route
router.post('/login', c.login);

// Protected route - needed for AuthContext
router.get('/me', authRequired, c.me);

module.exports = router;