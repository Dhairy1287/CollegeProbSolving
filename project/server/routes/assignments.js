const router = require('express').Router();
const { createAssignment, getAssignments, submitAssignment, checkPlagiarism, rateSubmission, getMyResults } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('faculty'), createAssignment);
router.get('/', protect, getAssignments);
router.get('/my-results', protect, authorize('student'), getMyResults);
router.post('/:id/submit', protect, authorize('student'),
    (req, _res, next) => { req.uploadFolder = 'assignments'; next(); }, upload.single('file'), submitAssignment);
router.post('/:id/plagiarism', protect, authorize('faculty'), checkPlagiarism);
router.patch('/:id/submissions/:subId/rate', protect, authorize('faculty'), rateSubmission);

module.exports = router;
