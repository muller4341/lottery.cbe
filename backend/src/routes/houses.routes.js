// // Houses routes
// const router = require('express').Router();
// const c = require('../controllers/houses.controller');
// const { authRequired } = require('../middleware/auth');
// const { upload } = require('../middleware/upload');

// router.post('/upload', authRequired, upload.single('file'), c.upload);
// router.get('/', authRequired, c.list);
// router.get('/summary', authRequired, c.summary);
// router.delete('/', authRequired, c.removeAll);

// module.exports = router;
// Houses routes
const router = require('express').Router();
const c = require('../controllers/houses.controller');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/upload', authRequired, upload.single('file'), c.upload);
router.get('/', authRequired, c.list);
router.get('/summary', authRequired, c.summary);
router.get('/sites', authRequired, c.getSites);     // ← Add this line
router.delete('/', authRequired, c.removeAll);

module.exports = router;