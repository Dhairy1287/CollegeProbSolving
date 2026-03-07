const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportSchema = new mongoose.Schema({
    reportId: { type: String, default: () => uuidv4(), unique: true },
    type: { type: String, enum: ['ragging', 'conflict'], required: true },
    // encrypted reporter identity — stored as hash, never returned to client
    reporterHash: { type: String, required: true },
    description: { type: String, default: '' },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
    },
    mediaFiles: [{ type: String }], // file paths
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['pending', 'under_review', 'resolved', 'dismissed'], default: 'pending' },
    college: { type: String, required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
