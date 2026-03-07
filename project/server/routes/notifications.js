const router = require('express').Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markRead);
router.patch('/:id/unread', protect, require('../controllers/notificationController').markUnread);
router.patch('/read-all', protect, markAllRead);
router.delete('/clear-all', protect, require('../controllers/notificationController').clearAll);

module.exports = router;
