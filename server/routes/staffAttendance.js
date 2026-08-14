const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const { list, mark, batchMark, update, facultyCalendar, checkIn, checkOut, halfDay, remove } = require('../controllers/staffAttendanceController');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

const router = express.Router();

// Get employees for batch marking
router.get('/employees/list', protect, adminOrFaculty, async (req, res) => {
  try {
    const users = await User.find({ status: 'Active', role: { $in: ['admin', 'class_teacher', 'teacher'] } }).populate('entityId', 'firstName lastName department').lean();
    const result = users.map((u) => ({
      _id: u._id,
      username: u.username,
      role: u.role,
      firstName: u.entityId?.firstName || '',
      lastName: u.entityId?.lastName || '',
      department: u.entityId?.department || '',
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/', protect, adminOrFaculty, list);
router.get('/faculty/:userId/calendar', protect, adminOrFaculty, facultyCalendar);
router.post('/', protect, adminOrFaculty, mark);
router.post('/batch', protect, adminOnly, batchMark);
router.post('/checkin', protect, adminOrFaculty, checkIn);
router.post('/checkout', protect, adminOrFaculty, checkOut);
router.post('/halfday', protect, adminOrFaculty, halfDay);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
