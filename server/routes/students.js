const express = require('express');
const { protect, adminOnly, adminOrFaculty, adminOrFacultyOrStudent } = require('../middleware/auth');
const { list, getById, create, update, remove, resetPassword, changeUsername, toggleStatus, summary, profile } = require('../controllers/studentController');

const router = express.Router();

router.get('/', protect, adminOnly, list);
router.get('/summary', protect, adminOnly, summary);
router.get('/:id/profile', protect, adminOrFaculty, profile);
router.get('/:id', protect, adminOrFacultyOrStudent, getById);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/:id/reset-password', protect, adminOnly, resetPassword);
router.post('/:id/change-username', protect, adminOnly, changeUsername);
router.post('/:id/toggle-status', protect, adminOnly, toggleStatus);

module.exports = router;
