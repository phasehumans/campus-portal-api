const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { applyMiddleware } = require('./middleware/commonMiddleware');


const authRoutes = require('./routes/auth.route.js');
const announcementRoutes = require('./routes/announcements');
const resultRoutes = require('./routes/results');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const eventRoutes = require('./routes/events');
const enrollmentRoutes = require('./routes/enrollments');
const attendanceRoutes = require('./routes/attendance');

const app = express();


connectDB();

applyMiddleware(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);


app.get('/api', (req, res) => {
  res.json({
    message: 'Campus Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      announcements: '/api/announcements',
      results: '/api/results',
      courses: '/api/courses',
      admin: '/api/admin',
      notifications: '/api/notifications',
    },
    documentation: '/docs',
  });
});


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
