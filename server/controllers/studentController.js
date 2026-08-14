const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Placement = require('../models/Placement');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

exports.list = async (req, res) => {
  const { search, year, course, status, classId, sectionId } = req.query;
  const filter = {};
  if (search) {
    const rx = new RegExp(search, 'i');
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { username: rx }, { rollNumber: rx }];
  }
  if (year) filter.year = year;
  if (course) filter.course = course;
  if (status) filter.status = status;
  if (classId) filter.classId = classId;
  if (sectionId) filter.sectionId = sectionId;
  const students = await Student.find(filter).sort({ year: 1, course: 1, createdAt: 1 }).lean();
  res.json(students);
};

exports.getById = async (req, res) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

exports.create = async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
};

exports.update = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

exports.remove = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Student deleted' });
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const newPass = Math.random().toString(36).slice(-8);
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPass, salt);
  await Student.findByIdAndUpdate(id, { password: hashed });
  res.json({ message: `Password reset. New password: ${newPass}` });
};

exports.changeUsername = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const existing = await Student.findOne({ username, _id: { $ne: id } });
  if (existing) return res.status(400).json({ message: 'Username already taken' });
  await Student.findByIdAndUpdate(id, { username });
  res.json({ message: 'Username updated' });
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Student.findByIdAndUpdate(id, { status });
  res.json({ message: `Status set to ${status}` });
};

exports.summary = async (req, res) => {
  const total = await Student.countDocuments();
  const active = await Student.countDocuments({ status: 'Active' });
  const inactive = await Student.countDocuments({ status: { $ne: 'Active' } });
  res.json({ total, active, inactive });
};

exports.profile = async (req, res) => {
  const student = await Student.findById(req.params.id).populate('classId', 'name').populate('sectionId', 'name').lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const [fees, attendance, marks, placement] = await Promise.all([
    Fee.find({ studentId: student._id }).sort({ createdAt: -1 }).lean(),
    Attendance.find({ studentId: student._id }).sort({ attendanceDate: 1 }).lean(),
    Mark.find({ studentId: student._id }).sort({ year: 1, subject: 1, testDate: 1 }).lean(),
    Placement.findOne({ studentName: `${student.firstName} ${student.lastName}` }).lean(),
  ]);

  // Fee stats
  const feeStats = fees.reduce((acc, f) => {
    acc.total += f.totalAmount || 0;
    acc.paid += f.paidAmount || 0;
    acc.due += f.dueAmount || 0;
    return acc;
  }, { total: 0, paid: 0, due: 0 });

  // Attendance stats
  const attSummary = { Present: 0, Absent: 0, Late: 0 };
  const attCalendar = {};
  attendance.forEach((a) => {
    const ds = new Date(a.attendanceDate).toISOString().slice(0, 10);
    attCalendar[ds] = a.status;
    if (attSummary[a.status] !== undefined) attSummary[a.status]++;
  });
  const totalAtt = attSummary.Present + attSummary.Absent + attSummary.Late;
  const attPct = totalAtt > 0 ? Math.round(((attSummary.Present + attSummary.Late) / totalAtt) * 100) : 0;

  // Marks grouped by year then subject
  const yearOrder = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4, 'Final Year': 5 };
  const marksByYearSubject = {};
  const marksBySubject = {};
  let totalMax = 0, totalObtained = 0;
  marks.forEach((m) => {
    const yr = m.year || 'Current';
    if (!marksByYearSubject[yr]) marksByYearSubject[yr] = {};
    if (!marksByYearSubject[yr][m.subject]) marksByYearSubject[yr][m.subject] = [];
    marksByYearSubject[yr][m.subject].push(m);
    if (!marksBySubject[m.subject]) marksBySubject[m.subject] = [];
    marksBySubject[m.subject].push(m);
    totalMax += m.maxMarks || 0;
    totalObtained += m.obtainedMarks || 0;
  });
  const sortedYears = Object.keys(marksByYearSubject).sort((a, b) => (yearOrder[a] || 99) - (yearOrder[b] || 99));
  const sortedMarksByYear = {};
  sortedYears.forEach((yr) => { sortedMarksByYear[yr] = marksByYearSubject[yr]; });

  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;
  const grade = overallPct >= 90 ? 'A+' : overallPct >= 80 ? 'A' : overallPct >= 70 ? 'B+' : overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C' : overallPct >= 40 ? 'D' : 'F';
  const resultStatus = overallPct >= 40 ? 'PASS' : 'FAIL';
  const cgpa = Math.round((overallPct / 9.5) * 100) / 100;

  // Available months from attendance
  const availMonths = [...new Set(attendance.map((a) => new Date(a.attendanceDate).toISOString().slice(0, 7)))].sort().reverse();

  res.json({
    student,
    fees,
    feeStats,
    attendance,
    attSummary,
    attPct,
    attCalendar,
    marks: sortedMarksByYear,
    marksBySubject,
    totalMax,
    totalObtained,
    overallPct,
    grade,
    resultStatus,
    cgpa,
    placement,
    availMonths,
  });
};
