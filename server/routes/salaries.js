const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const Salary = require('../models/Salary');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

const router = express.Router();

// List with employee info populated
router.get('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 }).lean();
    const userIds = [...new Set(salaries.map((s) => s.userId).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const facultyIds = [...new Set(users.map((u) => u.entityId).filter(Boolean))];
    const faculties = await Faculty.find({ _id: { $in: facultyIds } }).lean();
    const facMap = {};
    faculties.forEach((f) => { facMap[f._id.toString()] = f; });
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });
    const result = salaries.map((s) => {
      const u = userMap[s.userId?.toString()];
      const f = u?.entityId ? facMap[u.entityId.toString()] : null;
      return {
        ...s,
        username: u?.username || '',
        role: u?.role || 'teacher',
        employeeName: f ? `${f.firstName} ${f.lastName}` : (u?.username || 'Unknown'),
        department: f?.department || '—',
        designation: f?.designation || '',
        monthlySalary: f?.salary || 0,
      };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, adminOrFaculty, async (req, res) => {
  try {
    const s = await Salary.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ message: 'Not found' });
    const u = await User.findById(s.userId).lean();
    const f = u?.entityId ? await Faculty.findById(u.entityId).lean() : null;
    res.json({
      ...s,
      username: u?.username || '',
      role: u?.role || 'teacher',
      employeeName: f ? `${f.firstName} ${f.lastName}` : (u?.username || 'Unknown'),
      department: f?.department || '—',
      designation: f?.designation || '',
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Generate payslip
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { userId, salaryMonth, basicAmount, deductions } = req.body;
    const basic = Number(basicAmount) || 0;
    const ded = Number(deductions) || 0;
    const net = basic - ded;
    const sal = await Salary.create({ userId, salaryMonth, basicAmount: basic, deductions: ded, netAmount: net, status: 'Generated' });
    res.status(201).json(sal);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Mark paid
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sal = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sal) return res.status(404).json({ message: 'Not found' });
    res.json(sal);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Salary.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// Get employees for dropdown
router.get('/employees/list', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ status: 'Active', role: { $in: ['admin', 'class_teacher', 'teacher'] } }).populate('entityId', 'firstName lastName salary department').lean();
    const result = users.map((u) => ({
      _id: u._id,
      username: u.username,
      role: u.role,
      firstName: u.entityId?.firstName || '',
      lastName: u.entityId?.lastName || '',
      department: u.entityId?.department || '',
      salary: u.entityId?.salary || 0,
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
