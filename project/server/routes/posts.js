const router = require('express').Router();
const { getFeed, createPost, toggleLike, addComment, markSolved, deletePost, getMessages, sendMessage, getLeaderboard } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getFeed);
router.post('/', protect, (req, _res, next) => { req.uploadFolder = 'posts'; next(); },
    upload.array('attachments', 5), createPost);
router.patch('/:id/like', protect, toggleLike);
router.patch('/:id', protect, require('../controllers/postController').updatePost);
router.post('/:id/comment', protect, addComment);
router.patch('/:id/solve', protect, markSolved);
router.delete('/:id', protect, deletePost);

// DM
router.get('/messages/:userId', protect, getMessages);
router.post('/messages', protect, (req, _res, next) => { req.uploadFolder = 'messages'; next(); },
    upload.single('attachment'), sendMessage);

// Leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
