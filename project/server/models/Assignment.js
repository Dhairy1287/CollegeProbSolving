const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    fileUrl: { type: String },
    fileName: { type: String },
    submittedAt: { type: Date, default: Date.now },
    rating: { type: Number, min: 0, max: 5 }, // 0.5 increments
    feedback: { type: String, default: '' },
    internalMarks: { type: Number, default: 0 },
    plagiarismScore: { type: Number, default: 0 }, // 0-100%
    plagiarismDetails: [{ matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, similarity: Number }],
});

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    college: { type: String, required: true },
    department: { type: String, required: true },
    batch: { type: Number, required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 10 },
    requirePdf: { type: Boolean, default: false },
    submissions: [submissionSchema],
    totalRatingWeight: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
