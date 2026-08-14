const express = require('express');
const { protect, adminOrFaculty } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Test = require('../models/Test');

const ctrl = createCrud(Test, ['subject', 'testName', 'course']);

const router = express.Router();

// Faculty's own tests with stats
router.get('/mine', protect, adminOrFaculty, async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user.id }).sort({ testDate: -1 }).lean();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const total = tests.length;
    const upcoming = tests.filter((t) => new Date(t.testDate) >= todayStart).length;
    const done = total - upcoming;
    res.json({ tests, stats: { total, upcoming, done } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/', protect, adminOrFaculty, ctrl.list);
router.get('/:id', protect, adminOrFaculty, ctrl.getById);
router.post('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const rec = await Test.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(rec);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/:id', protect, adminOrFaculty, ctrl.update);
router.delete('/:id', protect, adminOrFaculty, ctrl.remove);

module.exports = router;
