const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['food', 'sports'], required: true },
    college: { type: String, required: true },
    // Food order fields
    foodItems: [{
        name: String,
        quantity: Number,
        price: Number,
    }],
    pickupTime: { type: String },
    // Sports booking fields
    ground: { type: String },
    sport: { type: String },
    slot: { startTime: { type: Date }, endTime: { type: Date } },
    // Common
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    totalAmount: { type: Number, default: 0 },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
