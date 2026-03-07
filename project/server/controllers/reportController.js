const crypto = require('crypto');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

const hashReporter = (userId) =>
    crypto.createHmac('sha256', process.env.JWT_SECRET).update(userId.toString()).digest('hex');

// POST /api/reports  – student submits anonymous report
exports.submitReport = async (req, res) => {
    try {
        const { type, description, latitude, longitude, address, severity } = req.body;
        const mediaFiles = req.files ? req.files.map(f => `/uploads/reports/${f.filename}`) : [];

        const report = await Report.create({
            type,
            reporterHash: hashReporter(req.user._id),
            description,
            location: { latitude, longitude, address },
            mediaFiles,
            severity: severity || 'medium',
            college: req.user.college,
        });

        // Notify all faculty/admin of this college
        const staffList = await User.find({ college: req.user.college, role: { $in: ['faculty', 'admin'] } });
        const notifications = staffList.map(s => ({
            recipient: s._id,
            title: `New ${type} report`,
            message: `A ${severity || 'medium'} severity ${type} incident was reported.`,
            type: 'report_alert',
            link: `/faculty/reports`,
        }));
        await Notification.insertMany(notifications);

        // Real-time emit
        req.io.to(`college-${req.user.college}`).emit('new-report', {
            type,
            severity: severity || 'medium',
            reportId: report._id,
        });

        res.status(201).json({ success: true, message: 'Report submitted anonymously', reportId: report.reportId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/reports  – faculty/admin view
exports.getReports = async (req, res) => {
    try {
        const { type, status, severity } = req.query;
        const filter = { college: req.user.college };
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (severity) filter.severity = severity;

        const reports = await Report.find(filter)
            .select('-reporterHash') // never expose hash
            .sort({ createdAt: -1 });
        res.json({ success: true, count: reports.length, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/reports/:id/status
exports.updateReportStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes, reviewedBy: req.user._id },
            { new: true }
        ).select('-reporterHash');
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
