

const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth');

router.post('/login', c.login);
router.post('/signup', c.signup);

// Updated Recovery API Endpoints context loops
router.post('/forgot-password/request', c.requestResetToken);
router.post('/forgot-password/reset', c.resetPasswordWithToken);

router.get('/me', authRequired, c.me);

module.exports = router;