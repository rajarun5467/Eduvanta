require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Placement = require('../models/Placement');
const Application = require('../models/Application');
const { Class, Section } = require('../models/Class');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educollege');
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
      Placement.deleteMany({}),
      Application.deleteMany({}),
      Class.deleteMany({}),
      Section.deleteMany({}),
    ]);

    // Courses
    const courses = await Course.insertMany([
      { name: 'B.Tech CSE', department: 'Computer Science', duration: '4 Years', fee: '250000', status: 'Active', description: 'Comprehensive engineering program' },
      { name: 'B.Tech ECE', department: 'Electronics', duration: '4 Years', fee: '230000', status: 'Active', description: 'Electronics & Communication engineering' },
      { name: 'BCA', department: 'Computer Applications', duration: '3 Years', fee: '120000', status: 'Active', description: 'Bachelor of Computer Applications' },
      { name: 'MBA', department: 'Management', duration: '2 Years', fee: '350000', status: 'Active', description: 'Master of Business Administration' },
      { name: 'MCA', department: 'Computer Applications', duration: '2 Years', fee: '180000', status: 'Active', description: 'Master of Computer Applications' },
      { name: 'Diploma Engineering', department: 'Mechanical', duration: '3 Years', fee: '80000', status: 'Active', description: 'Practical engineering diploma' },
      { name: 'B.Sc', department: 'Sciences', duration: '3 Years', fee: '90000', status: 'Draft', description: 'Bachelor of Science' },
    ]);

    // Faculty
    const facultyData = [
      { firstName: 'Rajesh', lastName: 'Kumar', department: 'Computer Science', designation: 'Professor', email: 'rajesh@edunex.edu.in', experience: '22', phone: '+91 98765 11111', education: 'Ph.D. in Computer Science', status: 'Active', role: 'class_teacher', salary: 120000, joiningDate: new Date('2010-06-15') },
      { firstName: 'Sunita', lastName: 'Sharma', department: 'Management', designation: 'Professor & Dean', email: 'sunita@edunex.edu.in', experience: '18', phone: '+91 98765 22222', education: 'Ph.D. in Management', status: 'Active', role: 'teacher', salary: 110000, joiningDate: new Date('2012-07-01') },
      { firstName: 'Amit', lastName: 'Verma', department: 'Electronics', designation: 'Associate Professor', email: 'amit@edunex.edu.in', experience: '15', phone: '+91 98765 33333', education: 'M.Tech, Ph.D. in Electronics', status: 'Active', role: 'teacher', salary: 95000, joiningDate: new Date('2014-01-10') },
      { firstName: 'Meera', lastName: 'Nair', department: 'Placements', designation: 'Placement Head', email: 'meera@edunex.edu.in', experience: '12', phone: '+91 98765 44444', education: 'MBA, PGDM', status: 'Active', role: 'teacher', salary: 85000, joiningDate: new Date('2016-03-20') },
      { firstName: 'Sanjay', lastName: 'Gupta', department: 'Mechanical', designation: 'Assistant Professor', email: 'sanjay@edunex.edu.in', experience: '8', phone: '+91 98765 55555', education: 'M.Tech in Mechanical', status: 'Active', role: 'teacher', salary: 70000, joiningDate: new Date('2018-08-01') },
      { firstName: 'Kavitha', lastName: 'Rao', department: 'Sciences', designation: 'Assistant Professor', email: 'kavitha@edunex.edu.in', experience: '6', phone: '+91 98765 66666', education: 'M.Sc, Ph.D. in Physics', status: 'Active', role: 'teacher', salary: 60000, joiningDate: new Date('2020-02-15') },
      { firstName: 'Deepak', lastName: 'Singh', department: 'Humanities', designation: 'Lecturer', email: 'deepak@edunex.edu.in', experience: '4', phone: '+91 98765 77777', education: 'M.A. in English', status: 'On Leave', role: 'teacher', salary: 45000, joiningDate: new Date('2021-09-01') },
    ];
    const faculty = await Faculty.insertMany(facultyData);

    // Users
    const adminPass = await bcrypt.hash('admin123', 10);
    const teacherPass = await bcrypt.hash('teacher123', 10);
    const adminUser = await User.create({ username: 'admin', password: 'admin123', role: 'admin', canAccessFees: true, canAccessSalary: true, status: 'Active' });

    for (let i = 0; i < faculty.length; i++) {
      const f = faculty[i];
      const uname = f.email.split('@')[0];
      const role = i === 0 ? 'class_teacher' : 'teacher';
      await User.create({
        username: uname,
        password: 'teacher123',
        role,
        entityId: f._id,
        canAccessFees: role === 'class_teacher',
        canAccessSalary: true,
        status: 'Active',
      });
    }

    // Students
    const dob1 = await bcrypt.hash('2003-05-15', 10);
    const students = await Student.insertMany([
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@email.com', course: 'B.Tech CSE', year: '3rd Year', phone: '+91 98765 43210', status: 'Active', dob: new Date('2003-05-15'), gender: 'Male', rollNumber: 'CSE2021001' },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@email.com', course: 'MBA', year: '1st Year', phone: '+91 98765 43211', status: 'Active', dob: new Date('2002-08-20'), gender: 'Female', rollNumber: 'MBA2024001' },
      { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha@email.com', course: 'BCA', year: '2nd Year', phone: '+91 98765 43212', status: 'Active', dob: new Date('2003-01-10'), gender: 'Female', rollNumber: 'BCA2023001' },
      { firstName: 'Karan', lastName: 'Verma', email: 'karan@email.com', course: 'MCA', year: 'Final Year', phone: '+91 98765 43213', status: 'Active', dob: new Date('2001-12-05'), gender: 'Male', rollNumber: 'MCA2022001' },
      { firstName: 'Ananya', lastName: 'Singh', email: 'ananya@email.com', course: 'B.Sc', year: '2nd Year', phone: '+91 98765 43214', status: 'Suspended', dob: new Date('2003-03-25'), gender: 'Female', rollNumber: 'BSC2023001' },
      { firstName: 'Arjun', lastName: 'Reddy', email: 'arjun@email.com', course: 'B.Tech ECE', year: 'Final Year', phone: '+91 98765 43215', status: 'Active', dob: new Date('2001-07-18'), gender: 'Male', rollNumber: 'ECE2022001' },
      { firstName: 'Nisha', lastName: 'Kumar', email: 'nisha@email.com', course: 'MBA', year: '2nd Year', phone: '+91 98765 43216', status: 'Active', dob: new Date('2002-11-30'), gender: 'Female', rollNumber: 'MBA2023001' },
      { firstName: 'Vikram', lastName: 'Joshi', email: 'vikram@email.com', course: 'Diploma ME', year: '1st Year', phone: '+91 98765 43217', status: 'Inactive', dob: new Date('2004-04-12'), gender: 'Male', rollNumber: 'DME2024001' },
    ]);

    // Placements
    await Placement.insertMany([
      { studentName: 'Arjun Reddy', course: 'B.Tech CSE', company: 'Google', package: '51 LPA', role: 'SDE', placedDate: 'Jul 2024' },
      { studentName: 'Sneha Gupta', course: 'MCA', company: 'Microsoft', package: '32 LPA', role: 'Data Analyst', placedDate: 'Jul 2024' },
      { studentName: 'Karan Verma', course: 'B.Tech ECE', company: 'Amazon', package: '28 LPA', role: 'Cloud Engineer', placedDate: 'Jul 2024' },
      { studentName: 'Rahul Sharma', course: 'B.Tech CSE', company: 'TCS', package: '8 LPA', role: 'Software Engineer', placedDate: 'Jun 2024' },
      { studentName: 'Priya Patel', course: 'MBA', company: 'Infosys', package: '12 LPA', role: 'Business Analyst', placedDate: 'Jun 2024' },
      { studentName: 'Nisha Kumar', course: 'BCA', company: 'Wipro', package: '6 LPA', role: 'Web Developer', placedDate: 'Jun 2024' },
      { studentName: 'Vikram Joshi', course: 'Diploma ME', company: 'IBM', package: '5.5 LPA', role: 'Junior Engineer', placedDate: 'May 2024' },
    ]);

    // Applications
    await Application.insertMany([
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@email.com', phone: '+91 98765 43210', course: 'MBA', message: 'Interested in MBA program', status: 'Pending' },
      { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@email.com', phone: '+91 98765 43211', course: 'B.Tech CSE', message: 'Want to join CSE', status: 'Approved' },
      { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha@email.com', phone: '+91 98765 43212', course: 'BCA', message: 'BCA admission query', status: 'Pending' },
      { firstName: 'Karan', lastName: 'Verma', email: 'karan@email.com', phone: '+91 98765 43213', course: 'MCA', message: 'MCA admission', status: 'Approved' },
      { firstName: 'Ananya', lastName: 'Singh', email: 'ananya@email.com', phone: '+91 98765 43214', course: 'B.Sc', message: 'B.Sc information', status: 'Rejected' },
    ]);

    console.log('Seed complete!');
    console.log('Admin: admin / admin123');
    console.log('Teachers: <email prefix> / teacher123');
    console.log('Students: login with email + DOB (YYYY-MM-DD)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
