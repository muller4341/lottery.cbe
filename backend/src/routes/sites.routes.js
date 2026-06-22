// Site routes (read-only)
const router = require('express').Router();
const c = require('../controllers/sites.controller');
const { authRequired } = require('../middleware/auth');

router.get('/', authRequired, c.list);

module.exports = router;
