const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const LoginActivity = require('../models/LoginActivity');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const router = express.Router();

// Populate user info based on userType
const populateUsers = async (records) => {
  const adminIds = [], facultyIds = [], studentIds = [];
  records.forEach((r) => {
    if (!r.userId) return;
    const id = r.userId.toString();
    if (r.userType === 'admin') adminIds.push(id);
    else if (r.userType === 'faculty') facultyIds.push(id);
    else if (r.userType === 'student') studentIds.push(id);
  });

  const [admins, faculties, students] = await Promise.all([
    adminIds.length ? User.find({ _id: { $in: adminIds } }).lean() : [],
    facultyIds.length ? User.find({ _id: { $in: facultyIds } }).populate('entityId', 'firstName lastName email department').lean() : [],
    studentIds.length ? Student.find({ _id: { $in: studentIds } }).lean() : [],
  ]);

  const userMap = {};
  admins.forEach((u) => { userMap[u._id.toString()] = { name: u.username, email: '', extra: 'Administrator' }; });
  faculties.forEach((u) => {
    const f = u.entityId;
    userMap[u._id.toString()] = { name: f ? `${f.firstName} ${f.lastName}` : u.username, email: f?.email || '', extra: f?.department || u.role };
  });
  students.forEach((s) => { userMap[s._id.toString()] = { name: `${s.firstName} ${s.lastName}`, email: s.email, extra: `${s.course} · ${s.year}` }; });

  return records.map((r) => ({
    ...r,
    displayName: userMap[r.userId?.toString()]?.name || 'Unknown',
    displayEmail: userMap[r.userId?.toString()]?.email || '',
    displayExtra: userMap[r.userId?.toString()]?.extra || '',
  }));
};

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { userType, status, userId } = req.query;
    const filter = {};
    if (userType) filter.userType = userType;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    const records = await LoginActivity.find(filter).sort({ loginAt: -1 }).limit(200).lean();
    const result = await populateUsers(records);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:id/terminate', protect, adminOnly, async (req, res) => {
  try {
    await LoginActivity.findByIdAndUpdate(req.params.id, { logoutAt: new Date(), status: 'offline' });
    res.json({ message: 'Session terminated' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await LoginActivity.findByIdAndDelete(req.params.id); res.json({ message: 'Activity record deleted' }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
