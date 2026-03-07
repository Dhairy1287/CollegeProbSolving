const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    type: { type: String, enum: ['post', 'doubt', 'note', 'announcement'], default: 'post' },
    attachments: [{ filename: String, url: String, fileType: String }],
    batch: { type: Number },
    college: { type: String, required: true },
    department: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repostOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    solved: { type: Boolean, default: false },
    solutionCommentId: { type: mongoose.Schema.Types.ObjectId },
    tags: [{ type: String }],
    helpfulnessPoints: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
