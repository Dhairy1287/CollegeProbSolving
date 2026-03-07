const router = require('express').Router();
const { getAttendance, upsertSubject, deleteSubject } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student'), getAttendance);
router.post('/subject', protect, authorize('student'), upsertSubject);
router.delete('/subject', protect, authorize('student'), deleteSubject);

module.exports = router;
