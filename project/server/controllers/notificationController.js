const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, notifications: notifs });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markUnread = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: false });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
