const router = require('express').Router();
const { createBooking, getMyBookings, getAvailableSlots, updateBookingStatus, getAllBookings, cancelBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/slots', protect, getAvailableSlots);
router.patch('/:id/status', protect, authorize('faculty', 'admin'), updateBookingStatus);
router.delete('/:id', protect, cancelBooking);
router.get('/:id', protect, require('../controllers/bookingController').getBookingById);
router.get('/all', protect, authorize('faculty', 'admin'), getAllBookings);

module.exports = router;

