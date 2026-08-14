const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const { list, getById, create, update, remove, resetPassword, toggleStatus, summary } = require('../controllers/facultyController');

const router = express.Router();

router.get('/', protect, adminOnly, list);
router.get('/summary', protect, adminOnly, summary);
router.get('/:id', protect, adminOrFaculty, getById);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/:id/reset-password', protect, adminOnly, resetPassword);
router.post('/:id/toggle-status', protect, adminOnly, toggleStatus);

module.exports = router;
