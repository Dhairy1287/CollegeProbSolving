const mongoose = require('mongoose');

// NetOwe – Group Expense Simplifier
const expenseGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    college: { type: String },
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseGroup', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
    customSplits: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: Number }],
    settled: { type: Boolean, default: false },
}, { timestamps: true });

const ExpenseGroup = mongoose.model('ExpenseGroup', expenseGroupSchema);
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = { ExpenseGroup, Expense };
