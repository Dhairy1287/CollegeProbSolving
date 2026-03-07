const router = require('express').Router();
const { submitReport, getReports, updateReportStatus } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, (req, _res, next) => { req.uploadFolder = 'reports'; next(); },
    upload.array('media', 5), submitReport);
router.get('/', protect, authorize('faculty', 'admin'), getReports);
router.patch('/:id/status', protect, authorize('faculty', 'admin'), updateReportStatus);

module.exports = router;
