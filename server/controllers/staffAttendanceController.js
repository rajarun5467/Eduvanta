const StaffAttendance = require('../models/StaffAttendance');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

const populateEmployee = async (records) => {
  const userIds = [...new Set(records.map((r) => r.userId?.toString()).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const facultyIds = [...new Set(users.map((u) => u.entityId?.toString()).filter(Boolean))];
  const faculties = await Faculty.find({ _id: { $in: facultyIds } }).lean();
  const facMap = {};
  faculties.forEach((f) => { facMap[f._id.toString()] = f; });
  const userMap = {};
  users.forEach((u) => { userMap[u._id.toString()] = u; });
  return records.map((r) => {
    const u = userMap[r.userId?.toString()];
    const f = u?.entityId ? facMap[u.entityId.toString()] : null;
    return {
      ...r,
      username: u?.username || '',
      role: u?.role || 'teacher',
      employeeName: f ? `${f.firstName} ${f.lastName}` : (u?.username || 'Unknown'),
      department: f?.department || '—',
      designation: f?.designation || '',
    };
  });
};

exports.list = async (req, res) => {
  try {
    const { userId, date, month, status } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.attendanceDate = { $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()), $lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) };
    }
    if (month) {
      const [y, m] = month.split('-').map(Number);
      filter.attendanceDate = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
    }
    const records = await StaffAttendance.find(filter).sort({ attendanceDate: -1 }).lean();
    const result = await populateEmployee(records);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.mark = async (req, res) => {
  try {
    const { userId, attendanceDate, status, checkIn, checkOut } = req.body;
    const date = new Date(attendanceDate);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const existing = await StaffAttendance.findOne({ userId, attendanceDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400000) } });
    if (existing) {
      existing.status = status || existing.status;
      if (checkIn !== undefined) existing.checkIn = checkIn;
      if (checkOut !== undefined) existing.checkOut = checkOut;
      await existing.save();
      return res.json(existing);
    }
    const record = await StaffAttendance.create({ userId, attendanceDate: startOfDay, status, checkIn: checkIn || null, checkOut: checkOut || null });
    res.status(201).json(record);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.batchMark = async (req, res) => {
  try {
    const { batchDate, entries } = req.body;
    // entries: [{ userId, status, checkIn, checkOut }]
    const date = new Date(batchDate);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let count = 0;
    for (const e of entries) {
      await StaffAttendance.deleteOne({ userId: e.userId, attendanceDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400000) } });
      await StaffAttendance.create({
        userId: e.userId,
        attendanceDate: startOfDay,
        status: e.status,
        checkIn: e.checkIn || null,
        checkOut: e.checkOut || null,
      });
      count++;
    }
    res.json({ message: `Batch attendance marked for ${count} staff members!`, count });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { status, checkIn, checkOut } = req.body;
    const update = {};
    if (status) update.status = status;
    if (checkIn !== undefined) update.checkIn = checkIn || null;
    if (checkOut !== undefined) update.checkOut = checkOut || null;
    const rec = await StaffAttendance.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!rec) return res.status(404).json({ message: 'Not found' });
    res.json(rec);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.facultyCalendar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query;
    const [y, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const records = await StaffAttendance.find({ userId, attendanceDate: { $gte: start, $lt: end } }).lean();
    const data = {};
    const fullData = {};
    records.forEach(r => {
      const d = r.attendanceDate.toISOString().slice(0, 10);
      data[d] = r.status;
      fullData[d] = { status: r.status, checkIn: r.checkIn, checkOut: r.checkOut };
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
    // Today's record
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const todayRecord = await StaffAttendance.findOne({ userId, attendanceDate: { $gte: todayStart, $lt: todayEnd } }).lean();
    res.json({
      calendar: data,
      fullCalendar: fullData,
      stats: { present, absent, late, half, workingDays, percentage: pct },
      todayRecord: todayRecord ? { status: todayRecord.status, checkIn: todayRecord.checkIn, checkOut: todayRecord.checkOut } : null,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Check in (faculty self-marking)
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkInTime = now.toTimeString().slice(0, 8);
    const existing = await StaffAttendance.findOne({ userId, attendanceDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } });
    if (existing) {
      existing.checkIn = checkInTime;
      existing.status = existing.checkOut ? 'Present' : 'Late';
      await existing.save();
    } else {
      await StaffAttendance.create({ userId, attendanceDate: todayStart, status: 'Late', checkIn: checkInTime });
    }
    res.json({ message: `Checked IN at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`, checkIn: checkInTime });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// Check out
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkOutTime = now.toTimeString().slice(0, 8);
    const existing = await StaffAttendance.findOne({ userId, attendanceDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } });
    if (existing) {
      existing.checkOut = checkOutTime;
      existing.status = 'Present';
      await existing.save();
    } else {
      await StaffAttendance.create({ userId, attendanceDate: todayStart, status: 'Present', checkOut: checkOutTime });
    }
    res.json({ message: `Checked OUT at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`, checkOut: checkOutTime });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// Mark half day
exports.halfDay = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkInTime = now.toTimeString().slice(0, 8);
    const existing = await StaffAttendance.findOne({ userId, attendanceDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } });
    if (existing) {
      existing.status = 'Half Day';
      if (!existing.checkIn) existing.checkIn = checkInTime;
      await existing.save();
    } else {
      await StaffAttendance.create({ userId, attendanceDate: todayStart, status: 'Half Day', checkIn: checkInTime });
    }
    res.json({ message: 'Marked as Half Day' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try { await StaffAttendance.findByIdAndDelete(req.params.id); res.json({ message: 'Record deleted' }); }
  catch (e) { res.status(400).json({ message: e.message }); }
};
