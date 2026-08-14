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

// TEMPORARY: Seed faculty and students
router.get('/seed-db', async (req, res) => {
  try {
    const User = require('../models/User');
    const Student = require('../models/Student');
    const Faculty = require('../models/Faculty');
    const Course = require('../models/Course');
    let output = '';

    // Check if already seeded
    const existingFaculty = await Faculty.countDocuments();
    if (existingFaculty > 0) {
      return res.set('Content-Type', 'text/plain').send('Already seeded! Faculty count: ' + existingFaculty);
    }

    // Courses
    await Course.deleteMany({});
    await Course.insertMany([
      { name: 'B.Tech CSE', department: 'Computer Science', duration: '4 Years', fee: '250000', status: 'Active', description: 'Comprehensive engineering program' },
      { name: 'B.Tech ECE', department: 'Electronics', duration: '4 Years', fee: '230000', status: 'Active', description: 'Electronics & Communication engineering' },
      { name: 'BCA', department: 'Computer Applications', duration: '3 Years', fee: '120000', status: 'Active', description: 'Bachelor of Computer Applications' },
      { name: 'MBA', department: 'Management', duration: '2 Years', fee: '350000', status: 'Active', description: 'Master of Business Administration' },
      { name: 'MCA', department: 'Computer Applications', duration: '2 Years', fee: '180000', status: 'Active', description: 'Master of Computer Applications' },
    ]);
    output += 'Courses seeded\n';

    // Faculty
    const facultyData = [
      { firstName: 'Rajesh', lastName: 'Kumar', department: 'Computer Science', designation: 'Professor', email: 'rajesh@edunex.edu.in', experience: '22', phone: '+91 98765 11111', education: 'Ph.D. in Computer Science', status: 'Active', role: 'class_teacher', salary: 120000, joiningDate: new Date('2010-06-15') },
      { firstName: 'Sunita', lastName: 'Sharma', department: 'Management', designation: 'Professor & Dean', email: 'sunita@edunex.edu.in', experience: '18', phone: '+91 98765 22222', education: 'Ph.D. in Management', status: 'Active', role: 'teacher', salary: 110000, joiningDate: new Date('2012-07-01') },
      { firstName: 'Amit', lastName: 'Verma', department: 'Electronics', designation: 'Associate Professor', email: 'amit@edunex.edu.in', experience: '15', phone: '+91 98765 33333', education: 'M.Tech in Electronics', status: 'Active', role: 'teacher', salary: 95000, joiningDate: new Date('2014-01-10') },
    ];
    const faculty = await Faculty.insertMany(facultyData);
    output += `Faculty seeded: ${faculty.length}\n`;

    // Faculty users
    const roles = ['class_teacher', 'teacher', 'teacher'];
    for (let i = 0; i < faculty.length; i++) {
      const uname = faculty[i].email.split('@')[0];
      const existing = await User.findOne({ username: uname });
      if (!existing) {
        await User.create({ username: uname, password: 'teacher123', role: roles[i], entityId: faculty[i]._id, canAccessFees: roles[i] === 'class_teacher', canAccessSalary: true, status: 'Active' });
        output += `Faculty user created: ${uname} / teacher123\n`;
      }
    }

    // Students
    await Student.deleteMany({});
    await Student.insertMany([
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@email.com', course: 'B.Tech CSE', year: '3rd Year', phone: '+91 98765 43210', status: 'Active', dob: new Date('2003-05-15'), gender: 'Male', rollNumber: 'CSE2021001' },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@email.com', course: 'MBA', year: '1st Year', phone: '+91 98765 43211', status: 'Active', dob: new Date('2002-08-20'), gender: 'Female', rollNumber: 'MBA2024001' },
      { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha@email.com', course: 'BCA', year: '2nd Year', phone: '+91 98765 43212', status: 'Active', dob: new Date('2003-01-10'), gender: 'Female', rollNumber: 'BCA2023001' },
      { firstName: 'Karan', lastName: 'Verma', email: 'karan@email.com', course: 'MCA', year: 'Final Year', phone: '+91 98765 43213', status: 'Active', dob: new Date('2001-12-05'), gender: 'Male', rollNumber: 'MCA2022001' },
    ]);
    output += 'Students seeded\n';
    output += '\n=== ALL DONE ===\n';
    output += 'Admin: admin / admin123\n';
    output += 'Faculty: rajesh / teacher123\n';
    output += 'Faculty: sunita / teacher123\n';
    output += 'Faculty: amit / teacher123\n';
    output += 'Student: rahul@email.com | DOB: 2003-05-15\n';
    output += 'Student: priya@email.com | DOB: 2002-08-20\n';
    output += 'Student: sneha@email.com | DOB: 2003-01-10\n';
    output += 'Student: karan@email.com | DOB: 2001-12-05\n';

    res.set('Content-Type', 'text/plain');
    res.send(output);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;
