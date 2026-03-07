const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, college, department, batch, rollNumber, employeeId } = req.body;

        // Validate rollNumber for students
        if (role === 'student') {
            if (!rollNumber || !rollNumber.trim()) {
                return res.status(400).json({ success: false, message: 'Roll Number is required for student registration' });
            }
            const dup = await User.findOne({ rollNumber: rollNumber.trim(), college });
            if (dup) return res.status(400).json({ success: false, message: 'Roll Number already registered at this college' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name, email, password, role, college, department, batch, rollNumber: rollNumber?.trim(), employeeId });
        const token = signToken(user._id);
        res.status(201).json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = signToken(user._id);
        const userData = user.toJSON(); // strips password
        res.json({ success: true, token, user: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, department, batch, phone, bio } = req.body;
        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
        const updates = {};
        if (name) updates.name = name;
        if (department) updates.department = department;
        if (batch) updates.batch = batch;
        if (phone !== undefined) updates.phone = phone;
        if (bio !== undefined) updates.bio = bio;
        if (avatar) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/users/search?q=
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ success: true, users: [] });

        const users = await User.find({
            college: req.user.college,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('name email avatar role').limit(10);

        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
