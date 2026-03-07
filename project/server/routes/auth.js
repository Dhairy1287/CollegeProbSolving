
// const router = require('express').Router();
// const { register, login, getMe, updateProfile } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);
// router.put('/profile', protect, (req, _res, next) => { req.uploadFolder = 'avatars'; next(); }, upload.single('avatar'), updateProfile);

// module.exports = router;


const router = require('express').Router();

const { register, login, getMe, updateProfile, searchUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users/search', protect, searchUsers);
router.put('/profile', protect, (req, _res, next) => {
  req.uploadFolder = 'avatars';
  next();
}, upload.single('avatar'), updateProfile);

module.exports = router;
