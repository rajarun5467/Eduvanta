const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const FacultySubject = require('../models/FacultySubject');

exports.list = async (req, res) => {
  const { studentId, classId, sectionId, date, month, status } = req.query;
  const filter = {};
  if (studentId) filter.studentId = studentId;
  if (classId) filter.classId = classId;
  if (sectionId) filter.sectionId = sectionId;
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    filter.attendanceDate = { $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()), $lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) };
  }
  if (month) {
    const [y, m] = month.split('-').map(Number);
    filter.attendanceDate = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }
  const records = await Attendance.find(filter).populate('studentId', 'firstName lastName email course year rollNumber').sort({ attendanceDate: 1 }).lean();
  res.json(records);
};

exports.mark = async (req, res) => {
  const { studentId, attendanceDate, status, classId, sectionId } = req.body;
  const date = new Date(attendanceDate);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const existing = await Attendance.findOne({ studentId, attendanceDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400000) } });
  if (existing) {
    existing.status = status;
    if (classId) existing.classId = classId;
    if (sectionId) existing.sectionId = sectionId;
    existing.markedBy = req.user.id;
    await existing.save();
    return res.json(existing);
  }
  const record = await Attendance.create({ studentId, attendanceDate: startOfDay, status, classId, sectionId, markedBy: req.user.id });
  res.status(201).json(record);
};

exports.batchMark = async (req, res) => {
  const { date, classId, sectionId, attendance } = req.body;
  const results = [];
  for (const item of attendance) {
    const d = new Date(date);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const existing = await Attendance.findOne({ studentId: item.studentId, attendanceDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400000) } });
    if (existing) {
      existing.status = item.status;
      existing.markedBy = req.user.id;
      await existing.save();
      results.push(existing);
    } else {
      const rec = await Attendance.create({ studentId: item.studentId, attendanceDate: startOfDay, status: item.status, classId, sectionId, markedBy: req.user.id });
      results.push(rec);
    }
  }
  res.json({ message: `${results.length} records processed`, results });
};

exports.studentCalendar = async (req, res) => {
  const { studentId } = req.params;
  const { month } = req.query;
  const [y, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const records = await Attendance.find({ studentId, attendanceDate: { $gte: start, $lt: end } }).lean();
  const data = {};
  records.forEach(r => {
    const d = r.attendanceDate.toISOString().slice(0, 10);
    data[d] = r.status;
  });
  const daysInMonth = new Date(y, m, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayName = new Date(y, m - 1, d).getDay();
    if (dayName !== 0 && dayName !== 6) workingDays++;
  }
  let present = 0, absent = 0, late = 0, half = 0;
  Object.values(data).forEach(s => {
    if (s === 'Present') present++;
    else if (s === 'Absent') absent++;
    else if (s === 'Late') late++;
    else if (s === 'Half Day') half++;
  });
  const pct = workingDays > 0 ? Math.min(Math.round(((present + late + half * 0.5) / workingDays) * 100), 100) : 0;
  res.json({ calendar: data, stats: { present, absent, late, half, workingDays, percentage: pct } });
};

exports.remove = async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.json({ message: 'Attendance record deleted' });
};

// Faculty attendance grid: returns assigned course/year combos, students, and monthly attendance
exports.facultyGrid = async (req, res) => {
  try {
    const facultyId = req.user.entityId || req.user.id;
    const { course, year, month } = req.query;
    const selMonth = month || new Date().toISOString().slice(0, 7);
    const [y, m] = selMonth.split('-').map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 1);
    const daysInMonth = new Date(y, m, 0).getDate();

    // Get faculty's assigned course/year combos
    const subjects = await FacultySubject.find({ facultyId }).lean();
    const courseYears = [];
    const seen = new Set();
    subjects.forEach((s) => {
      const key = `${s.course}|${s.year}`;
      if (!seen.has(key)) { seen.add(key); courseYears.push({ course: s.course, year: s.year, subject: s.subject }); }
    });

    if (!course || !year) {
      return res.json({ courseYears, students: [], attendance: {}, daysInMonth, month: selMonth });
    }

    // Get students for selected course+year
    const students = await Student.find({ course, year }).sort({ firstName: 1, lastName: 1 }).lean();

    // Get attendance for all these students for the month
    const studentIds = students.map((s) => s._id);
    const records = await Attendance.find({ studentId: { $in: studentIds }, attendanceDate: { $gte: monthStart, $lt: monthEnd } }).lean();
    const attMap = {};
    records.forEach((r) => {
      const sid = r.studentId.toString();
      const d = r.attendanceDate.toISOString().slice(0, 10);
      if (!attMap[sid]) attMap[sid] = {};
      attMap[sid][d] = r.status;
    });

    res.json({ courseYears, students, attendance: attMap, daysInMonth, month: selMonth });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
