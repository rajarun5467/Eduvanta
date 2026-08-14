const express = require('express');
const { protect, adminOrFaculty } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Exam = require('../models/Exam');

const ctrl = createCrud(Exam, ['name', 'subject', 'examType']);

const router = express.Router();

router.get('/', protect, adminOrFaculty, ctrl.list);
router.get('/:id', protect, adminOrFaculty, ctrl.getById);
router.post('/', protect, adminOrFaculty, ctrl.create);
router.put('/:id', protect, adminOrFaculty, ctrl.update);
router.delete('/:id', protect, adminOrFaculty, ctrl.remove);

module.exports = router;
