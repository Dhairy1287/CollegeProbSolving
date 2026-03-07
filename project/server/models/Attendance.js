const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{
        name: { type: String, required: true },
        code: { type: String },
        totalClasses: { type: Number, default: 0 },
        attendedClasses: { type: Number, default: 0 },
        minRequired: { type: Number, default: 75 }, // percentage
    }],
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
}, { timestamps: true });

attendanceSchema.virtual('attendancePercentage').get(function () {
    return this.subjects.map(s => ({
        name: s.name,
        percentage: s.totalClasses > 0 ? ((s.attendedClasses / s.totalClasses) * 100).toFixed(2) : 0,
        safeLeaves: Math.floor(s.attendedClasses - (s.minRequired / 100) * s.totalClasses),
    }));
});

module.exports = mongoose.model('Attendance', attendanceSchema);
