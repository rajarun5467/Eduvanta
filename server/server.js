require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const staffAttendanceRoutes = require('./routes/staffAttendance');
const marksRoutes = require('./routes/marks');
const testRoutes = require('./routes/tests');
const classRoutes = require('./routes/classes');
const feeRoutes = require('./routes/fees');
const salaryRoutes = require('./routes/salaries');
const noticeRoutes = require('./routes/notices');
const eventRoutes = require('./routes/events');
const examRoutes = require('./routes/exams');
const resultRoutes = require('./routes/results');
const placementRoutes = require('./routes/placements');
const applicationRoutes = require('./routes/applications');
const admissionRoutes = require('./routes/admissions');
const loginActivityRoutes = require('./routes/loginActivity');
const downloadRoutes = require('./routes/downloads');
const dashboardRoutes = require('./routes/dashboard');
const correctionRoutes = require('./routes/corrections');
const facultySubjectRoutes = require('./routes/facultySubjects');
const classSubjectRoutes = require('./routes/classSubjects');

const { notFound, errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/staff-attendance', staffAttendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/login-activity', loginActivityRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/corrections', correctionRoutes);
app.use('/api/faculty-subjects', facultySubjectRoutes);
app.use('/api/class-subjects', classSubjectRoutes);

// Serve client build in production (single deploy on Render)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback: all non-API routes serve index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
