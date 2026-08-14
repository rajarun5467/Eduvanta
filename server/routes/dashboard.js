const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const StaffAttendance = require('../models/StaffAttendance');
const Application = require('../models/Application');
const Placement = require('../models/Placement');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const LoginActivity = require('../models/LoginActivity');

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
  const [
    totalStudents, activeStudents, totalFaculty, activeFaculty,
    totalCourses, pendingApplications, totalPlacements, totalApplications,
    pendingFees, totalNotices, activeSessions,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'Active' }),
    Faculty.countDocuments(),
    Faculty.countDocuments({ status: 'Active' }),
    Course.countDocuments(),
    Application.countDocuments({ status: { $in: ['New', 'Pending'] } }),
    Placement.countDocuments(),
    Application.countDocuments(),
    Fee.countDocuments({ status: { $ne: 'Paid' } }),
    Notice.countDocuments({ status: 'Published' }),
    LoginActivity.countDocuments({ status: 'online' }),
  ]);

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const presentToday = await Attendance.countDocuments({ attendanceDate: { $gte: startOfDay }, status: 'Present' });
  const absentToday = await Attendance.countDocuments({ attendanceDate: { $gte: startOfDay }, status: 'Absent' });
  const staffPresentToday = await StaffAttendance.countDocuments({ attendanceDate: { $gte: startOfDay }, status: 'Present' });
  const todayApps = await Application.countDocuments({ createdAt: { $gte: startOfDay } });

  const recentApplications = await Application.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentEvents = await Event.find({ eventDate: { $gte: startOfDay } }).sort({ eventDate: 1 }).limit(5).lean();

  // Fee stats
  const feeAgg = await Fee.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' }, paid: { $sum: '$paidAmount' }, due: { $sum: '$dueAmount' }, count: { $sum: 1 } } },
  ]);
  const feeStats = feeAgg[0] || { total: 0, paid: 0, due: 0, count: 0 };
  const recentFees = await Fee.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName rollNumber').lean();

  res.json({
    stats: {
      totalStudents, activeStudents, totalFaculty, activeFaculty,
      totalCourses, pendingApplications, totalPlacements, totalApplications,
      pendingFees, totalNotices, activeSessions,
      presentToday, absentToday, staffPresentToday, todayApps,
      feeTotal: feeStats.total || 0,
      feePaid: feeStats.paid || 0,
      feeDue: feeStats.due || 0,
    },
    recentApplications,
    recentEvents,
    recentFees,
  });
});

router.get('/faculty/:id', protect, adminOrFaculty, async (req, res) => {
  try {
    const facultyId = req.params.id;
    const StudentModel = require('../models/Student');
    const Test = require('../models/Test');
    const FacultySubject = require('../models/FacultySubject');
    const Mark = require('../models/Mark');
    const Notice = require('../models/Notice');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const [totalStudents, totalSubjects, totalTests, myAttendance, facultySubjects, upcomingTests, recentMarks, todayAtt, notices] = await Promise.all([
      StudentModel.countDocuments(),
      FacultySubject.countDocuments({ facultyId }),
      Test.countDocuments({ createdBy: req.user.id }),
      StaffAttendance.find({ userId: req.user.id, attendanceDate: { $gte: monthStart, $lt: monthEnd } }).lean(),
      FacultySubject.find({ facultyId }).lean(),
      Test.find({ createdBy: req.user.id, testDate: { $gte: todayStart } }).sort({ testDate: 1 }).limit(5).lean(),
      Mark.aggregate([
        { $match: { testDate: { $gte: new Date(now.getTime() - 30 * 86400000) } } },
        { $group: { _id: { subject: '$subject', testName: '$testName', testDate: '$testDate' }, avgScore: { $avg: '$obtainedMarks' }, maxScore: { $max: '$obtainedMarks' }, minScore: { $min: '$obtainedMarks' }, maxMarks: { $first: '$maxMarks' }, count: { $sum: 1 } } },
        { $sort: { '_id.testDate': -1 } },
        { $limit: 5 },
      ]),
      StaffAttendance.findOne({ userId: req.user.id, attendanceDate: { $gte: todayStart, $lt: todayEnd } }).lean(),
      Notice.find({ targetRole: { $in: ['all', 'teacher'] }, status: 'Published' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const present = myAttendance.filter(a => a.status === 'Present').length;
    const absent = myAttendance.filter(a => a.status === 'Absent').length;
    const late = myAttendance.filter(a => a.status === 'Late').length;
    const half = myAttendance.filter(a => a.status === 'Half Day').length;
    const workingDays = (() => {
      const y = now.getFullYear();
      const m = now.getMonth();
      const dim = new Date(y, m + 1, 0).getDate();
      let wd = 0;
      for (let d = 1; d <= dim; d++) { const dn = new Date(y, m, d).getDay(); if (dn !== 0 && dn !== 6) wd++; }
      return wd;
    })();
    const attPct = workingDays > 0 ? Math.min(Math.round(((present + late) / workingDays) * 100), 100) : 0;
    const subjectNames = [...new Set(facultySubjects.map((s) => s.subject))];

    res.json({
      stats: { totalStudents, totalSubjects, totalTests, attPct, present, absent, late, half, workingDays, todayStatus: todayAtt?.status || '' },
      subjects: subjectNames,
      upcomingTests: upcomingTests.map((t) => ({
        ...t,
        daysLeft: Math.ceil((new Date(t.testDate) - now) / 86400000),
      })),
      recentMarks: recentMarks.map((m) => ({
        testName: m._id.testName,
        subject: m._id.subject,
        testDate: m._id.testDate,
        avgScore: Math.round(m.avgScore * 10) / 10,
        maxScore: m.maxScore,
        minScore: m.minScore,
        maxMarks: m.maxMarks,
      })),
      notices: notices.map((n) => ({ _id: n._id, title: n.title, description: n.description, createdAt: n.createdAt })),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/student/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const studentId = req.params.id;
    const Test = require('../models/Test');
    const Mark = require('../models/Mark');
    const Student = require('../models/Student');
    const FacultySubject = require('../models/FacultySubject');
    const Faculty = require('../models/Faculty');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const student = await Student.findById(studentId).lean();

    const [attendance, marks, upcomingTests, professors] = await Promise.all([
      Attendance.find({ studentId, attendanceDate: { $gte: monthStart, $lt: monthEnd } }).lean(),
      Mark.find({ studentId }).sort({ testDate: -1 }).lean(),
      student ? Test.find({ course: student.course, year: student.year, testDate: { $gte: todayStart } }).sort({ testDate: 1 }).lean() : [],
      student ? FacultySubject.find({ course: student.course, year: student.year }).lean() : [],
    ]);

    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    const totalMarked = attendance.length;
    const attPct = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 0;

    // Marks grouped by year
    const marksByYear = {};
    marks.forEach((m) => {
      const yr = m.year || 'Current';
      if (!marksByYear[yr]) marksByYear[yr] = [];
      marksByYear[yr].push(m);
    });

    // Per-year stats
    const yearOrder = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4, 'Final Year': 5 };
    const yearStats = {};
    let allMax = 0, allObt = 0;
    Object.keys(marksByYear).forEach((yr) => {
      const ml = marksByYear[yr];
      let yMax = 0, yObt = 0;
      const ySubjects = {};
      ml.forEach((m) => { yMax += m.maxMarks; yObt += m.obtainedMarks; ySubjects[m.subject] = true; });
      const yPct = yMax > 0 ? Math.round((yObt / yMax) * 100 * 10) / 10 : 0;
      const yGrade = yPct >= 90 ? 'A+' : yPct >= 80 ? 'A' : yPct >= 70 ? 'B+' : yPct >= 60 ? 'B' : yPct >= 50 ? 'C' : yPct >= 40 ? 'D' : 'F';
      yearStats[yr] = { max: yMax, obt: yObt, pct: yPct, grade: yGrade, subjects: Object.keys(ySubjects).length, tests: ml.length };
      allMax += yMax; allObt += yObt;
    });
    // Sort yearStats by year order
    const sortedYearStats = {};
    Object.keys(yearStats).sort((a, b) => (yearOrder[a] || 99) - (yearOrder[b] || 99)).forEach((k) => { sortedYearStats[k] = yearStats[k]; });

    const overallPct = allMax > 0 ? Math.round((allObt / allMax) * 100 * 10) / 10 : 0;
    const overallGrade = overallPct >= 90 ? 'A+' : overallPct >= 80 ? 'A' : overallPct >= 70 ? 'B+' : overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C' : overallPct >= 40 ? 'D' : 'F';
    const overallCgpa = Math.round((overallPct / 9.5) * 100) / 100;

    // Professor info
    const facultyIds = [...new Set(professors.map((p) => p.facultyId?.toString()).filter(Boolean))];
    const faculties = await Faculty.find({ _id: { $in: facultyIds } }).lean();
    const facMap = {};
    faculties.forEach((f) => { facMap[f._id.toString()] = f; });
    const professorList = professors.map((p) => {
      const f = facMap[p.facultyId?.toString()];
      return { subject: p.subject, name: f ? `${f.firstName} ${f.lastName}` : 'Unknown', department: f?.department || '', email: f?.email || '' };
    }).sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      student: student ? { firstName: student.firstName, lastName: student.lastName, course: student.course, year: student.year, email: student.email, rollNumber: student.rollNumber, phone: student.phone } : null,
      stats: { attPct, present, absent, late, totalMarked, overallPct, overallGrade, overallCgpa, totalMarks: allObt, maxMarks: allMax, yearCount: Object.keys(marksByYear).length },
      yearStats: sortedYearStats,
      upcomingTests: upcomingTests.map((t) => ({ ...t, daysLeft: Math.ceil((new Date(t.testDate) - now) / 86400000) })).slice(0, 3),
      professors: professorList,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
