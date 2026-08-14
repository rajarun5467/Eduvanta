const express = require('express');
const { protect, adminOnly, adminOrFaculty, adminOrFacultyOrStudent } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Mark = require('../models/Mark');

const ctrl = createCrud(Mark, ['subject', 'testName']);

const router = express.Router();

router.get('/', protect, adminOrFacultyOrStudent, ctrl.list);
router.get('/:id', protect, adminOrFacultyOrStudent, ctrl.getById);

// Batch save marks for a test
router.post('/batch', protect, adminOrFaculty, async (req, res) => {
  try {
    const { subject, testName, testDate, maxMarks, marks } = req.body;
    const results = [];
    for (const item of marks) {
      const existing = await Mark.findOne({ studentId: item.studentId, subject, testName });
      if (existing) {
        existing.obtainedMarks = item.obtained;
        existing.maxMarks = maxMarks;
        existing.testDate = new Date(testDate);
        await existing.save();
        results.push(existing);
      } else {
        const rec = await Mark.create({ studentId: item.studentId, subject, testName, maxMarks, obtainedMarks: item.obtained, testDate: new Date(testDate) });
        results.push(rec);
      }
    }
    res.json({ message: `Marks saved for ${results.length} students — ${testName} (${subject})`, count: results.length });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post('/', protect, adminOrFaculty, ctrl.create);
router.put('/:id', protect, adminOrFaculty, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
