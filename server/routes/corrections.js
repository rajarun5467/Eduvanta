const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const CorrectionRequest = require('../models/CorrectionRequest');
const StaffAttendance = require('../models/StaffAttendance');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

const router = express.Router();

// List with faculty info populated
router.get('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    const records = await CorrectionRequest.find(filter).sort({ createdAt: -1 }).lean();
    const userIds = [...new Set(records.map((r) => r.userId?.toString()).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const facultyIds = [...new Set(users.map((u) => u.entityId?.toString()).filter(Boolean))];
    const faculties = await Faculty.find({ _id: { $in: facultyIds } }).lean();
    const facMap = {};
    faculties.forEach((f) => { facMap[f._id.toString()] = f; });
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });
    const result = records.map((r) => {
      const u = userMap[r.userId?.toString()];
      const f = u?.entityId ? facMap[u.entityId.toString()] : null;
      return {
        ...r,
        username: u?.username || '',
        role: u?.role || 'teacher',
        facultyName: f ? `${f.firstName} ${f.lastName}` : (u?.username || 'Faculty'),
        department: f?.department || '',
      };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// My requests (faculty sees their own)
router.get('/mine', protect, adminOrFaculty, async (req, res) => {
  try {
    const records = await CorrectionRequest.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(records);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, adminOrFaculty, async (req, res) => {
  try {
    const r = await CorrectionRequest.findById(req.params.id).lean();
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create (faculty submits request)
router.post('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const cr = await CorrectionRequest.create({ ...req.body, userId: req.user.id, status: 'Pending' });
    res.status(201).json(cr);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Review (approve/reject)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const cr = await CorrectionRequest.findById(req.params.id);
    if (!cr) return res.status(404).json({ message: 'Not found' });
    if (cr.status !== 'Pending') return res.status(400).json({ message: 'Request already reviewed' });

    if (status === 'Approved') {
      // Update staff attendance
      const date = new Date(cr.requestDate);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      await StaffAttendance.deleteOne({ userId: cr.userId, attendanceDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400000) } });
      await StaffAttendance.create({
        userId: cr.userId,
        attendanceDate: startOfDay,
        status: cr.requestedStatus,
        checkIn: cr.checkIn || null,
        checkOut: cr.checkOut || null,
      });
    }

    cr.status = status;
    cr.adminResponse = adminResponse || '';
    cr.reviewedBy = req.user.id;
    cr.reviewedAt = new Date();
    await cr.save();
    res.json(cr);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await CorrectionRequest.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
