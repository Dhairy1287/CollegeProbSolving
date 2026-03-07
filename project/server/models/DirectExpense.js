const mongoose = require('mongoose');

const directExpenseSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    college: { type: String },
    settled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('DirectExpense', directExpenseSchema);
