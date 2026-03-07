// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');

// const connectDB = require('./config/db');

// // Route imports
// const authRoutes = require('./routes/auth');
// const reportRoutes = require('./routes/reports');
// const expenseRoutes = require('./routes/expenses');
// const attendanceRoutes = require('./routes/attendance');
// const postRoutes = require('./routes/posts');
// const bookingRoutes = require('./routes/bookings');
// const assignmentRoutes = require('./routes/assignments');
// const notificationRoutes = require('./routes/notifications');
// const scholarshipRoutes = require('./routes/scholarships');

// // Connect DB
// connectDB();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: process.env.CLIENT_URL || 'http://localhost:5173',
//         methods: ['GET', 'POST'],
//     },
// });

// // Middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Static uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Attach io to req for use in controllers
// app.use((req, _res, next) => { req.io = io; next(); });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/scholarships', scholarshipRoutes);

// // Health check
// app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// // Error handler
// app.use((err, _req, res, _next) => {
//     console.error(err.stack);
//     res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
// });

// // Socket.io rooms + events
// io.on('connection', (socket) => {
//     console.log('🔌 Socket connected:', socket.id);

//     socket.on('join-room', (roomId) => socket.join(roomId));
//     socket.on('leave-room', (roomId) => socket.leave(roomId));

//     socket.on('send-message', (data) => {
//         io.to(data.roomId).emit('receive-message', data);
//     });

//     socket.on('disconnect', () => {
//         console.log('🔌 Socket disconnected:', socket.id);
//     });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const expenseRoutes = require('./routes/expenses');
const attendanceRoutes = require('./routes/attendance');
const postRoutes = require('./routes/posts');
const bookingRoutes = require('./routes/bookings');
const assignmentRoutes = require('./routes/assignments');
const notificationRoutes = require('./routes/notifications');
const scholarshipRoutes = require('./routes/scholarships');
const contactRoutes = require('./routes/contact');

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000'
        ],
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow multiple frontend origins
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req for use in controllers
app.use((req, _res, next) => { req.io = io; next(); });

// Root route for testing
app.get('/', (req, res) => {
    res.send('API is running 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Socket.io rooms + events
io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('join-room', (roomId) => socket.join(roomId));
    socket.on('leave-room', (roomId) => socket.leave(roomId));

    socket.on('send-message', (data) => {
        io.to(data.roomId).emit('receive-message', data);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
