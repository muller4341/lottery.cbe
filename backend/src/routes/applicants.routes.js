// // Applicants routes
// const router = require('express').Router();
// const c = require('../controllers/applicants.controller');
// const { authRequired } = require('../middleware/auth');
// const { upload } = require('../middleware/upload');

// router.post('/upload', authRequired, upload.single('file'), c.upload);
// router.get('/', authRequired, c.list);
// router.get('/summary', authRequired, c.summary);
// router.delete('/', authRequired, c.removeAll);

// module.exports = router;

// Applicants routes
// Applicants routes
const router = require('express').Router();
const c = require('../controllers/applicants.controller');
const { authRequired } = require('../middleware/auth');
const { upload: multerUpload } = require('../middleware/upload');

router.post('/upload', authRequired, multerUpload.single('file'), c.upload);
router.get('/', authRequired, c.list);
router.get('/summary', authRequired, c.summary);
router.delete('/', authRequired, c.removeAll);

module.exports = router;