const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    college: { type: String, required: true },
    department: { type: String, required: true },
    batch: { type: Number }, // e.g. 2028, only for students
    rollNumber: { type: String },
    employeeId: { type: String }, // for faculty
    avatar: { type: String, default: '' },
    helpfulnessScore: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
