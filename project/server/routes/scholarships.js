const router = require('express').Router();
const { findScholarships } = require('../controllers/scholarshipController');
const { protect } = require('../middleware/auth');

router.get('/', protect, findScholarships);

module.exports = router;
