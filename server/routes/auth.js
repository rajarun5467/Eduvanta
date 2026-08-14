const express = require('express');
const { protect } = require('../middleware/auth');
const { login, studentLogin, logout, me } = require('../controllers/authController');
const User = require('../models/User'); // ADDED THIS

const router = express.Router();

router.post('/login', login);
router.post('/student-login', studentLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// TEMPORARY: Reset all passwords
router.get('/reset-all-passwords', async (req, res) => {
  try {
    const User = require('../models/User');
    const Student = require('../models/Student');
    let output = '';

    // Reset admin
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({ username: 'admin', password: 'admin123', role: 'admin', canAccessFees: true, canAccessSalary: true, status: 'Active' });
    } else {
      admin.password = 'admin123';
    }
    await admin.save();
    output += 'Admin reset: admin / admin123\n';

    // Reset all faculty
    const users = await User.find({ role: { $in: ['teacher', 'class_teacher'] } });
    for (const u of users) {
      u.password = 'teacher123';
      await u.save();
      output += `Faculty reset: ${u.username} / teacher123\n`;
    }

    // List students
    const students = await Student.find({});
    output += '\n--- STUDENTS (login with email + DOB) ---\n';
    for (const s of students) {
      const dob = s.dob ? new Date(s.dob).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : 'NO DOB';
      output += `Email: ${s.email} | DOB: ${dob} | Status: ${s.status}\n`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(output);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;
