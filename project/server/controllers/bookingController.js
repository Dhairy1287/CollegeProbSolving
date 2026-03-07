const Booking = require('../models/Booking');

// POST /api/bookings – place food or sports booking
exports.createBooking = async (req, res) => {
    try {
        const { type, foodItems, pickupTime, ground, sport, slot, notes } = req.body;

        // Conflict check for sports
        if (type === 'sports' && slot) {
            const conflict = await Booking.findOne({
                type: 'sports',
                college: req.user.college,
                ground,
                status: { $in: ['pending', 'confirmed'] },
                'slot.startTime': { $lt: new Date(slot.endTime) },
                'slot.endTime': { $gt: new Date(slot.startTime) },
            });
            if (conflict) return res.status(409).json({ success: false, message: 'Time slot already booked' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            type,
            college: req.user.college,
            foodItems,
            pickupTime,
            ground,
            sport,
            slot: slot ? { startTime: new Date(slot.startTime), endTime: new Date(slot.endTime) } : undefined,
            totalAmount: type === 'food' ? (foodItems || []).reduce((s, i) => s + i.price * i.quantity, 0) : 0,
            notes,
        });

        // Notify via socket
        if (req.io) {
            req.io.to(`college-${req.user.college}`).emit('new-booking', { type, bookingId: booking._id });
        }
        res.status(201).json({ success: true, booking });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/bookings – user's own bookings
exports.getMyBookings = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;
        const bookings = await Booking.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/bookings/slots?ground=&date=
exports.getAvailableSlots = async (req, res) => {
    try {
        const { ground, date } = req.query;
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        const booked = await Booking.find({
            type: 'sports', college: req.user.college, ground,
            status: { $in: ['pending', 'confirmed'] },
            'slot.startTime': { $gte: start, $lte: end },
        }).select('slot');

        // Generate hourly slots 6am–10pm
        const allSlots = [];
        for (let h = 6; h < 22; h++) {
            const slotStart = new Date(date); slotStart.setHours(h, 0, 0, 0);
            const slotEnd = new Date(date); slotEnd.setHours(h + 1, 0, 0, 0);
            const conflict = booked.some(b =>
                new Date(b.slot.startTime) < slotEnd && new Date(b.slot.endTime) > slotStart
            );
            allSlots.push({ startTime: slotStart, endTime: slotEnd, available: !conflict });
        }
        res.json({ success: true, slots: allSlots });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/bookings/:id/status – canteen/admin updates
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const Notification = require('../models/Notification');
        let title = 'Booking Update';
        let message = `Your ${booking.type} booking status is now: ${status}`;

        if (booking.type === 'food' && status === 'ready') {
            title = '🍔 Food Ready for Pickup!';
            message = 'Your food order is hot and ready at the canteen. Please collect it soon.';
        } else if (booking.type === 'sports' && status === 'confirmed') {
            title = '🏟️ Ground Booking Confirmed';
            message = `Your slot at ${booking.ground} for ${booking.sport} is confirmed.`;
        }

        // Create notification entry
        const notif = await Notification.create({
            recipient: booking.user,
            type: 'booking',
            title,
            message,
            link: '/bookings'
        });

        if (req.io) {
            req.io.to(`user-${booking.user}`).emit('booking-update', { bookingId: booking._id, status, notification: notif });
        }
        res.json({ success: true, booking });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/bookings/:id – cancel own booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
        }
        booking.status = 'cancelled';
        await booking.save();

        if (req.io) {
            req.io.to(`user-${req.user._id}`).emit('booking-update', { bookingId: booking._id, status: 'cancelled' });
            // For food, notify college/vendor too
            if (booking.type === 'food') {
                req.io.to(`college-${req.user.college}`).emit('booking-cancelled', { bookingId: booking._id });
            }
        }
        res.json({ success: true, message: 'Booking cancelled successfully', booking });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/bookings/:id – get single booking details
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name rollNumber email phone');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/bookings/all – faculty/admin view all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const { type, status } = req.query;
        const filter = { college: req.user.college };
        if (type) filter.type = type;
        if (status) filter.status = status;
        const bookings = await Booking.find(filter).populate('user', 'name rollNumber').sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
