const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── Faculty: Create Assignment ───────────────────────────────────────────────
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, subject, batch, dueDate, maxMarks, requirePdf } = req.body;
        const assignment = await Assignment.create({
            title, description, faculty: req.user._id,
            college: req.user.college, department: req.user.department,
            batch, subject, dueDate, maxMarks, requirePdf: !!requirePdf
        });

        // Notify Students in the batch
        const students = await User.find({ role: 'student', batch, college: req.user.college });
        for (const student of students) {
            const notif = await Notification.create({
                recipient: student._id,
                sender: req.user._id,
                type: 'assignment',
                title: 'New Assignment',
                message: `New assignment: "${title}" announced by ${req.user.name}. Due: ${new Date(dueDate).toLocaleDateString()}`,
                link: '/student/assignments'
            });
            if (req.io) {
                req.io.to(`user-${student._id}`).emit('new-notification', notif);
            }
        }

        res.status(201).json({ success: true, assignment });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/assignments?batch=&subject=
exports.getAssignments = async (req, res) => {
    try {
        const { batch, subject } = req.query;
        const filter = { college: req.user.college };
        if (batch) filter.batch = batch;
        if (subject) filter.subject = subject;
        if (req.user.role === 'faculty') filter.faculty = req.user._id;
        else filter.batch = req.user.batch;

        const assignments = await Assignment.find(filter)
            .populate('faculty', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/assignments/:id/submit – student submits
exports.submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (assignment.requirePdf && !req.file) {
            return res.status(400).json({ success: false, message: 'This assignment requires a PDF upload' });
        }

        const existing = assignment.submissions.findIndex(s => s.student.toString() === req.user._id.toString());
        const submissionData = {
            student: req.user._id,
            content: req.body.content || '',
            fileUrl: req.file ? `/uploads/assignments/${req.file.filename}` : undefined,
            fileName: req.file ? req.file.originalname : undefined,
            submittedAt: new Date(),
        };
        if (existing >= 0) Object.assign(assignment.submissions[existing], submissionData);
        else assignment.submissions.push(submissionData);
        await assignment.save();

        // Notify Faculty
        const notif = await Notification.create({
            recipient: assignment.faculty,
            sender: req.user._id,
            type: 'assignment',
            title: 'New Submission',
            message: `${req.user.name} submitted ${assignment.title}`,
            link: `/faculty/assignments`
        });
        if (req.io) {
            req.io.to(`user-${assignment.faculty}`).emit('new-notification', notif);
        }

        res.json({ success: true, message: 'Assignment submitted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Plagiarism Detection (cosine similarity on word vectors) ─────────────────
function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}
function buildTF(tokens) {
    const freq = {};
    tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    return freq;
}
function cosineSimilarity(tf1, tf2) {
    const vocab = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
    let dot = 0, mag1 = 0, mag2 = 0;
    for (const word of vocab) {
        const a = tf1[word] || 0;
        const b = tf2[word] || 0;
        dot += a * b;
        mag1 += a * a;
        mag2 += b * b;
    }
    if (!mag1 || !mag2) return 0;
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// POST /api/assignments/:id/plagiarism
exports.checkPlagiarism = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('submissions.student', 'name rollNumber');
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        const subs = assignment.submissions.filter(s => s.content);
        const results = [];

        for (let i = 0; i < subs.length; i++) {
            const tf1 = buildTF(tokenize(subs[i].content));
            const matches = [];
            for (let j = 0; j < subs.length; j++) {
                if (i === j) continue;
                const tf2 = buildTF(tokenize(subs[j].content));
                const sim = cosineSimilarity(tf1, tf2);
                if (sim > 0.3) {
                    matches.push({ matchedWith: subs[j].student, similarity: +(sim * 100).toFixed(1) });
                }
            }
            // Update plagiarism data in DB
            subs[i].plagiarismScore = matches.length ? Math.max(...matches.map(m => m.similarity)) : 0;
            subs[i].plagiarismDetails = matches;
            results.push({
                student: subs[i].student,
                plagiarismScore: subs[i].plagiarismScore,
                matches,
            });
        }
        await assignment.save();
        res.json({ success: true, results });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PATCH /api/assignments/:id/submissions/:subId/rate – faculty rates
exports.rateSubmission = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        const sub = assignment.submissions.id(req.params.subId);
        if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });

        // Convert star rating (0.5–5) to marks (proportional to maxMarks)
        sub.rating = rating;
        sub.feedback = feedback;
        sub.internalMarks = +((rating / 5) * assignment.maxMarks).toFixed(1);
        await assignment.save();

        res.json({ success: true, submission: sub });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/assignments/my-results – student views their rated assignments
exports.getMyResults = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            college: req.user.college,
            batch: req.user.batch,
            'submissions.student': req.user._id,
        }).populate('faculty', 'name');

        const results = assignments.map(a => {
            const sub = a.submissions.find(s => s.student.toString() === req.user._id.toString());
            return {
                assignmentId: a._id,
                title: a.title,
                subject: a.subject,
                faculty: a.faculty,
                dueDate: a.dueDate,
                submission: sub,
            };
        });
        res.json({ success: true, results });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
