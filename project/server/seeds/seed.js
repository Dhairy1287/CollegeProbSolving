require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const Post = require('../models/Post');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const { ExpenseGroup, Expense } = require('../models/Expense');
const DirectExpense = require('../models/DirectExpense');

const COLLEGE = 'GTU Engineering College';

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}),
        Post.deleteMany({}),
        Booking.deleteMany({}),
        Report.deleteMany({}),
        ExpenseGroup.deleteMany({}),
        Expense.deleteMany({}),
        DirectExpense.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    const pw = await bcrypt.hash('password123', 12);

    // ── Faculty ──────────────────────────────
    const faculty = await User.insertMany([
        {
            name: 'Dr. Ramesh Patel', email: 'ramesh.patel@gtu.edu', password: pw,
            role: 'faculty', college: COLLEGE, department: 'Computer Science',
            employeeId: 'FAC001', bio: 'Associate Professor with 15 years experience in AI/ML.',
            helpfulnessScore: 120, phone: '9876543201',
        },
        {
            name: 'Prof. Meena Shah', email: 'meena.shah@gtu.edu', password: pw,
            role: 'faculty', college: COLLEGE, department: 'Mechanical Engineering',
            employeeId: 'FAC002', bio: 'Expert in Thermodynamics and Fluid Mechanics.',
            helpfulnessScore: 85, phone: '9876543202',
        },
        {
            name: 'Dr. Ajay Verma', email: 'ajay.verma@gtu.edu', password: pw,
            role: 'faculty', college: COLLEGE, department: 'Electronics & Communication',
            employeeId: 'FAC003', bio: 'PhD in VLSI Design. Passionate about embedded systems.',
            helpfulnessScore: 94, phone: '9876543203',
        },
    ]);
    console.log('✅ Created ' + faculty.length + ' faculty');

    // ── Students ─────────────────────────────
    const students = await User.insertMany([
        {
            name: 'Arjun Mehta', email: 'arjun.mehta@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Computer Science',
            batch: 2027, rollNumber: 'CS210401', helpfulnessScore: 45, phone: '9876500001',
            bio: 'Full-stack developer enthusiast. Love open source.',
        },
        {
            name: 'Priya Sharma', email: 'priya.sharma@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Computer Science',
            batch: 2027, rollNumber: 'CS210402', helpfulnessScore: 72, phone: '9876500002',
            bio: 'AI/ML enthusiast. Kaggle competitor.',
        },
        {
            name: 'Ravi Kumar', email: 'ravi.kumar@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Mechanical Engineering',
            batch: 2026, rollNumber: 'ME200301', helpfulnessScore: 30, phone: '9876500003',
            bio: 'Passionate about automotive design.',
        },
        {
            name: 'Sneha Patel', email: 'sneha.patel@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Computer Science',
            batch: 2028, rollNumber: 'CS220501', helpfulnessScore: 60, phone: '9876500004',
            bio: 'Web developer. DSA enthusiast.',
        },
        {
            name: 'Karan Joshi', email: 'karan.joshi@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Electronics & Communication',
            batch: 2026, rollNumber: 'EC200201', helpfulnessScore: 18, phone: '9876500005',
            bio: 'IoT and embedded systems hobbyist.',
        },
        {
            name: 'Ananya Desai', email: 'ananya.desai@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Computer Science',
            batch: 2027, rollNumber: 'CS210403', helpfulnessScore: 88, phone: '9876500006',
            bio: 'Competitive programmer. ACM ICPC 2024 regionals.',
        },
        {
            name: 'Rohit Singh', email: 'rohit.singh@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Civil Engineering',
            batch: 2026, rollNumber: 'CE200101', helpfulnessScore: 22, phone: '9876500007',
            bio: 'Structural engineering focus.',
        },
        {
            name: 'Nisha Gupta', email: 'nisha.gupta@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Computer Science',
            batch: 2025, rollNumber: 'CS190601', helpfulnessScore: 110, phone: '9876500008',
            bio: 'Final year student. Intern at TCS. Alumni mentor.',
        },
        {
            name: 'Dev Agarwal', email: 'dev.agarwal@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Information Technology',
            batch: 2027, rollNumber: 'IT210101', helpfulnessScore: 35, phone: '9876500009',
            bio: 'React + Node developer. Hackathon winner.',
        },
        {
            name: 'Pooja Bhatt', email: 'pooja.bhatt@student.gtu.edu', password: pw,
            role: 'student', college: COLLEGE, department: 'Electronics & Communication',
            batch: 2027, rollNumber: 'EC210301', helpfulnessScore: 42, phone: '9876500010',
            bio: 'VLSI design learner. Guitar player.',
        },
    ]);
    console.log('✅ Created ' + students.length + ' students');

    // ── Community Posts ──────────────────────
    await Post.insertMany([
        {
            author: students[1]._id,
            content: '📚 Just finished Andrew Ng\'s ML course on Coursera! Highly recommend for anyone starting with machine learning. The assignments are super practical!',
            type: 'note', batch: 2027, college: COLLEGE, department: 'Computer Science',
            likes: [students[0]._id, students[3]._id, students[5]._id],
            helpfulnessPoints: 8,
        },
        {
            author: students[5]._id,
            content: '❓ DOUBT: Can someone explain the difference between BFS and DFS with a real-world example? Struggling to visualize when to use which.',
            type: 'doubt', batch: 2027, college: COLLEGE, department: 'Computer Science',
            comments: [
                { author: students[0]._id, content: 'BFS = layer by layer (like Facebook friend suggestions), DFS = go deep (maze solving). BFS uses queue, DFS uses stack/recursion.' },
                { author: students[3]._id, content: 'BFS for shortest path, DFS for cycle detection / topological sort. Simple rule!' },
            ],
            likes: [students[0]._id, students[3]._id],
            helpfulnessPoints: 5,
        },
        {
            author: faculty[0]._id,
            content: '📢 ANNOUNCEMENT: Internal exam schedules are now posted. Section A – 15 March, Section B – 17 March. Syllabus: Units 1–4. All the best! 🍀',
            type: 'announcement', batch: 2027, college: COLLEGE, department: 'Computer Science',
            likes: [students[0]._id, students[1]._id, students[3]._id, students[5]._id],
            helpfulnessPoints: 10,
        },
        {
            author: students[0]._id,
            content: '📝 Sharing my OS notes! Covered: Process Scheduling, Memory Management, File Systems, Deadlocks – made during sem 5. Hope it helps!',
            type: 'note', batch: 2027, college: COLLEGE, department: 'Computer Science',
            likes: [students[1]._id, students[5]._id, students[8]._id],
            helpfulnessPoints: 6,
        },
        {
            author: students[4]._id,
            content: 'Anyone else facing slow WiFi on 3rd floor labs? Getting < 1 Mbps. Should we raise a complaint to IT cell?',
            type: 'post', batch: 2026, college: COLLEGE, department: 'Electronics & Communication',
            comments: [{ author: students[6]._id, content: 'Same issue in mechanical block! Let\'s draft an email together.' }],
            likes: [students[6]._id],
            helpfulnessPoints: 2,
        },
    ]);
    console.log('✅ Created 5 community posts');

    // ── Expense Groups ───────────────────────
    const group1 = await ExpenseGroup.create({
        name: 'Hostel Room 204 Gang',
        members: [students[0]._id, students[1]._id, students[5]._id, students[3]._id],
        createdBy: students[0]._id, college: COLLEGE,
    });
    const group2 = await ExpenseGroup.create({
        name: 'Industrial Visit 2025',
        members: [students[0]._id, students[1]._id, students[3]._id, students[4]._id, students[8]._id],
        createdBy: students[1]._id, college: COLLEGE,
    });
    await Expense.insertMany([
        {
            group: group1._id, description: 'Monthly grocery – Big Bazaar', amount: 1820,
            paidBy: students[0]._id,
            splitAmong: [students[0]._id, students[1]._id, students[5]._id, students[3]._id],
            splitType: 'equal',
        },
        {
            group: group1._id, description: 'Electricity bill – Feb', amount: 640,
            paidBy: students[5]._id,
            splitAmong: [students[0]._id, students[1]._id, students[5]._id, students[3]._id],
            splitType: 'equal',
        },
        {
            group: group2._id, description: 'Bus rent for industrial visit', amount: 5000,
            paidBy: students[1]._id,
            splitAmong: [students[0]._id, students[1]._id, students[3]._id, students[4]._id, students[8]._id],
            splitType: 'equal',
        },
    ]);
    console.log('✅ Created 2 expense groups with 3 expenses');

    // ── Direct Expenses ──────────────────────
    await DirectExpense.insertMany([
        { from: students[2]._id, to: students[0]._id, amount: 250, description: 'Canteen lunch × 3', college: COLLEGE },
        { from: students[3]._id, to: students[1]._id, amount: 500, description: 'Return bus ticket', college: COLLEGE },
    ]);
    console.log('✅ Created 2 direct expense transactions');

    // ── Bookings ─────────────────────────────
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const slotStart = new Date(tomorrow); slotStart.setHours(9, 0, 0, 0);
    const slotEnd = new Date(tomorrow); slotEnd.setHours(10, 0, 0, 0);
    await Booking.insertMany([
        {
            user: students[0]._id, type: 'food', college: COLLEGE,
            foodItems: [{ name: 'Veg Thali', price: 60, quantity: 2 }, { name: 'Tea', price: 10, quantity: 2 }],
            pickupTime: '13:00', totalAmount: 140, status: 'confirmed',
        },
        {
            user: students[4]._id, type: 'sports', college: COLLEGE,
            ground: 'Cricket Ground', sport: 'Cricket',
            slot: { startTime: slotStart, endTime: slotEnd }, status: 'confirmed',
        },
        {
            user: students[5]._id, type: 'sports', college: COLLEGE,
            ground: 'Basketball Court', sport: 'Basketball',
            slot: { startTime: slotStart, endTime: slotEnd }, status: 'pending',
        },
    ]);
    console.log('✅ Created 3 bookings (1 food, 2 sports)');

    // ── Reports (anonymized) ─────────────────
    const anon1 = crypto.createHmac('sha256', 'anon-secret').update(students[6]._id.toString()).digest('hex');
    const anon2 = crypto.createHmac('sha256', 'anon-secret').update(students[7]._id.toString()).digest('hex');
    await Report.insertMany([
        {
            anonymousId: anon1, college: COLLEGE, type: 'ragging',
            description: 'Senior students in hostel block B were pressuring juniors to run errands and using abusive language during late nights.',
            severity: 'high', location: { address: 'Hostel Block B, 2nd Floor' }, status: 'under_review',
        },
        {
            anonymousId: anon2, college: COLLEGE, type: 'conflict',
            description: 'Dispute between two groups over seat allocation in library reading room escalated to verbal fight.',
            severity: 'medium', location: { address: 'Central Library, GTU Campus' }, status: 'pending',
        },
    ]);
    console.log('✅ Created 2 anonymized reports');

    console.log('\n🎉 SEED COMPLETE!');
    console.log('   College: ' + COLLEGE);
    console.log('   Users: 3 faculty + 10 students');
    console.log('   Password: password123');
    console.log('   Student: arjun.mehta@student.gtu.edu / password123');
    console.log('   Faculty: ramesh.patel@gtu.edu / password123');
    await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
