const express = require('express');
const { protect, adminOrFaculty, adminOrFacultyOrStudent } = require('../middleware/auth');
const { list, mark, batchMark, studentCalendar, facultyGrid, remove } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', protect, adminOrFaculty, list);
router.get('/faculty/grid', protect, adminOrFaculty, facultyGrid);
router.get('/student/:studentId/calendar', protect, adminOrFacultyOrStudent, studentCalendar);
router.post('/', protect, adminOrFaculty, mark);
router.post('/batch', protect, adminOrFaculty, batchMark);
router.delete('/:id', protect, adminOrFaculty, remove);

module.exports = router;
