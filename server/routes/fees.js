const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

const ctrl = createCrud(Fee, ['feeType']);

const router = express.Router();

// List with student populated
router.get('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    let items = await Fee.find(filter).sort({ createdAt: -1 }).lean();
    // populate student info
    const studentIds = [...new Set(items.map((f) => f.studentId).filter(Boolean))];
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const stuMap = {};
    students.forEach((s) => { stuMap[s._id.toString()] = s; });
    items = items.map((f) => {
      const s = stuMap[f.studentId?.toString()];
      return {
        ...f,
        studentName: s ? `${s.firstName} ${s.lastName}` : 'Deleted',
        studentCourse: s?.course || '—',
        studentYear: s?.year || '—',
      };
    });
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((f) =>
        (f.studentName || '').toLowerCase().includes(term) ||
        (f.feeType || '').toLowerCase().includes(term)
      );
    }
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', protect, adminOrFaculty, ctrl.getById);

// Create - auto-fill classId/sectionId from student
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { studentId, totalAmount, paidAmount } = req.body;
    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const due = Math.max(0, total - paid);
    const status = paid >= total && total > 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';
    let classId = null, sectionId = null;
    if (studentId) {
      const stu = await Student.findById(studentId).lean();
      if (stu) { classId = stu.classId || null; sectionId = stu.sectionId || null; }
    }
    const item = await Fee.create({ ...req.body, dueAmount: due, status, classId, sectionId });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', protect, adminOnly, ctrl.remove);

// Defaulters - students with due_amount > 0 grouped by student
router.get('/defaulters/list', protect, adminOrFaculty, async (req, res) => {
  try {
    const fees = await Fee.find({ dueAmount: { $gt: 0 } }).lean();
    const studentIds = [...new Set(fees.map((f) => f.studentId).filter(Boolean))];
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const stuMap = {};
    students.forEach((s) => { stuMap[s._id.toString()] = s; });
    const grouped = {};
    fees.forEach((f) => {
      const id = f.studentId?.toString();
      if (!grouped[id]) grouped[id] = { studentId: id, firstName: '', lastName: '', course: '—', year: '—', totalDue: 0 };
      grouped[id].totalDue += f.dueAmount || 0;
    });
    const defaulters = Object.values(grouped).map((d) => {
      const s = stuMap[d.studentId];
      return {
        ...d,
        firstName: s?.firstName || '—',
        lastName: s?.lastName || '',
        course: s?.course || '—',
        year: s?.year || '—',
      };
    }).sort((a, b) => b.totalDue - a.totalDue);
    res.json(defaulters);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
