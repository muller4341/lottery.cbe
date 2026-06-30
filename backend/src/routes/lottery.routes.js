// Lottery routes (mounted at /api/lottery)
const router = require('express').Router();
const c = require('../controllers/lottery.controller');
const { authRequired } = require('../middleware/auth');
router.get('/unallocated-summary', authRequired, c.getUnallocatedSummary);

router.get('/stats', authRequired, c.stats);
router.post('/draw', authRequired, c.draw);
router.get('/lotteries', authRequired, c.listLotteries);
router.get('/lotteries/:id', authRequired, c.getResults);
router.get('/download/:id', authRequired, c.downloadResults);

module.exports = router;

router.post('/clear-database', authRequired, c.clearDatabaseAll);