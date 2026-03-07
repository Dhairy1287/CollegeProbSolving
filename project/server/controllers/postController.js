const Post = require('../models/Post');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/posts?batch=&college=&type=
exports.getFeed = async (req, res) => {
    try {
        const { batch, college, type, page = 1, limit = 20 } = req.query;
        const filter = { batch: batch || req.user.batch, college: college || req.user.college };
        if (type) filter.type = type;
        const posts = await Post.find(filter)
            .populate('author', 'name avatar helpfulnessScore role')
            .populate('comments.author', 'name avatar')
            .populate('repostOf')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(+limit);
        res.json({ success: true, posts });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/posts
exports.createPost = async (req, res) => {
    try {
        const { content, type, tags, repostOf } = req.body;
        const attachments = req.files ? req.files.map(f => ({
            filename: f.originalname,
            url: `/uploads/posts/${f.filename}`,
            fileType: f.mimetype,
        })) : [];

        const post = await Post.create({
            author: req.user._id,
            content, type, tags, attachments,
            batch: req.user.batch || req.body.batch,
            college: req.user.college,
            department: req.user.department,
            repostOf: repostOf || undefined,
        });

        // Star Reward: give author stars for posting, and original author stars for repost
        await User.findByIdAndUpdate(req.user._id, { $inc: { helpfulnessScore: 5 } });
        if (repostOf) {
            const original = await Post.findById(repostOf);
            if (original) {
                original.reposts.push(req.user._id);
                original.helpfulnessPoints += 2;
                await original.save();
                await User.findByIdAndUpdate(original.author, { $inc: { helpfulnessScore: 2 } });
            }
        }
        await post.populate('author', 'name avatar helpfulnessScore role');

        // Notify Batch/College members
        const recipients = await User.find({
            college: req.user.college,
            batch: post.batch,
            _id: { $ne: req.user._id }
        });

        if (recipients.length > 0) {
            const notifTitle = req.user.role === 'faculty'
                ? `Prof. ${req.user.name} posted in Community`
                : `${req.user.name} posted`;

            const notifs = recipients.map(r => ({
                recipient: r._id,
                sender: req.user._id,
                type: 'general',
                title: notifTitle,
                message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                link: `/${req.user.role}/feed?post=${post._id}`
            }));

            const createdNotifs = await Notification.insertMany(notifs);
            if (req.io) {
                createdNotifs.forEach(n => {
                    req.io.to(`user-${n.recipient}`).emit('new-notification', n);
                });
            }
        }

        res.status(201).json({ success: true, post });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/posts/:id/like
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        const uid = req.user._id.toString();
        const isSelf = uid === post.author.toString();
        const liked = post.likes.map(l => l.toString()).includes(uid);
        if (liked) {
            post.likes = post.likes.filter(l => l.toString() !== uid);
            // Undo point if not self-like
            if (!isSelf) await User.findByIdAndUpdate(post.author, { $inc: { helpfulnessScore: -1 } });
        } else {
            post.likes.push(req.user._id);
            // Award point only if not liking own post
            if (!isSelf) {
                await User.findByIdAndUpdate(post.author, { $inc: { helpfulnessScore: 1 } });
                await User.findByIdAndUpdate(req.user._id, { $inc: { helpfulnessScore: 1 } }); // Liker gets 1 star
            }
        }
        await post.save();

        if (!liked && !isSelf) {
            const notif = await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'general',
                title: 'New Like',
                message: `${req.user.name} liked your post`,
                link: `/${req.user.role === 'faculty' ? 'student' : 'faculty'}/feed?post=${post._id}`
            });
            if (req.io) req.io.to(`user-${post.author}`).emit('new-notification', notif);
        }

        res.json({ success: true, likes: post.likes.length });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({ author: req.user._id, content: req.body.content });
        const isSelf = req.user._id.toString() === post.author.toString();

        if (!isSelf) {
            // post.helpfulnessPoints += 1;
            await User.findByIdAndUpdate(req.user._id, { $inc: { helpfulnessScore: 2 } }); // Commenter gets 2 stars

            // Notification to author
            const notif = await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'general',
                title: 'New Comment',
                message: `${req.user.name} commented: "${req.body.content.substring(0, 40)}${req.body.content.length > 40 ? '...' : ''}"`,
                link: `/${req.user.role === 'faculty' ? 'student' : 'faculty'}/feed?post=${post._id}`
            });
            if (req.io) req.io.to(`user-${post.author}`).emit('new-notification', notif);
        }

        await post.save();
        await post.populate('comments.author', 'name avatar role');
        res.json({ success: true, comments: post.comments });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/posts/:id/solve – mark doubt as solved
exports.markSolved = async (req, res) => {
    try {
        const { commentId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only post author can mark as solved' });
        }

        post.solved = true;

        if (commentId) {
            post.solutionCommentId = commentId;
            const comment = post.comments.id(commentId);
            if (comment) {
                // Award 10 points to the person who solved it
                await User.findByIdAndUpdate(comment.author, { $inc: { helpfulnessScore: 10 } });

                // Notify the solver
                const Notification = require('../models/Notification');
                await Notification.create({
                    recipient: comment.author,
                    sender: req.user._id,
                    type: 'general',
                    title: 'Your Answer was Marked as Solution! 🌟',
                    message: `Congratulations! ${req.user.name} marked your comment as the solution. You earned 10 points.`,
                    link: `/faculty/reports`,
                });
            }
        }

        await post.save();
        res.json({ success: true, post });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ success: true, message: 'Post deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/posts/:id
exports.updatePost = async (req, res) => {
    try {
        const { content, type, tags } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        post.content = content || post.content;
        post.type = type || post.type;
        post.tags = tags || post.tags;

        await post.save();
        await post.populate('author', 'name avatar helpfulnessScore role');
        res.json({ success: true, post });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Direct Messages ──────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id },
            ]
        }).sort({ createdAt: 1 }).populate('sender receiver', 'name avatar');
        res.json({ success: true, messages });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const attachment = req.file ? `/uploads/messages/${req.file.filename}` : undefined;
        const msg = await Message.create({
            sender: req.user._id, receiver: receiverId, content, attachment,
        });
        await msg.populate('sender receiver', 'name avatar');

        // Real-time
        const roomId = [req.user._id.toString(), receiverId].sort().join('-');
        req.io.to(roomId).emit('receive-message', msg);
        res.status(201).json({ success: true, message: msg });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({ college: req.user.college, batch: req.user.batch })
            .select('name avatar helpfulnessScore batch department')
            .sort({ helpfulnessScore: -1 })
            .limit(20);
        res.json({ success: true, leaderboard: users });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
