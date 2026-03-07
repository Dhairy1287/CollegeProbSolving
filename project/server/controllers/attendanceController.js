const Attendance = require('../models/Attendance');

// GET or create attendance record
exports.getAttendance = async (req, res) => {
    try {
        const { semester, academicYear } = req.query;
        let record = await Attendance.findOne({ student: req.user._id, semester, academicYear });
        if (!record) {
            record = await Attendance.create({ student: req.user._id, semester: semester || 1, academicYear: academicYear || '2024-25', subjects: [] });
        }
        // Calculate stats for each subject
        const stats = record.subjects.map(s => {
            const percent = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
            const minAttend = Math.ceil((s.minRequired / 100) * s.totalClasses);
            const safeLeaves = Math.max(0, Math.floor(s.attendedClasses - (s.minRequired / 100) * s.totalClasses));
            // Classes needed to reach minRequired (if below)
            const classesNeeded = percent < s.minRequired
                ? Math.ceil((s.minRequired * s.totalClasses / 100 - s.attendedClasses) / (1 - s.minRequired / 100))
                : 0;
            return {
                ...s.toObject(),
                percentage: +percent.toFixed(2),
                safeLeaves,
                classesNeeded,
                status: percent >= s.minRequired ? 'safe' : 'danger',
            };
        });
        res.json({ success: true, record: { ...record.toObject(), subjects: stats } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST – add/update a subject
exports.upsertSubject = async (req, res) => {
    try {
        const { semester, academicYear, name, code, totalClasses, attendedClasses, minRequired } = req.body;
        let record = await Attendance.findOne({ student: req.user._id, semester, academicYear });
        if (!record) record = new Attendance({ student: req.user._id, semester, academicYear, subjects: [] });

        const idx = record.subjects.findIndex(s => s.code === code || s.name === name);
        if (idx >= 0) {
            Object.assign(record.subjects[idx], { name, code, totalClasses, attendedClasses, minRequired });
        } else {
            record.subjects.push({ name, code, totalClasses, attendedClasses, minRequired });
        }
        await record.save();
        res.json({ success: true, record });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE a subject
exports.deleteSubject = async (req, res) => {
    try {
        const { semester, academicYear, subjectCode } = req.body;
        const record = await Attendance.findOne({ student: req.user._id, semester, academicYear });
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        record.subjects = record.subjects.filter(s => s.code !== subjectCode);
        await record.save();
        res.json({ success: true, record });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
