const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Admission = require('../models/Admission');

const ctrl = createCrud(Admission, ['firstName', 'lastName', 'email', 'course']);

const router = express.Router();

router.get('/', protect, adminOnly, ctrl.list);
router.get('/:id', protect, adminOnly, ctrl.getById);
router.post('/', protect, adminOnly, ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
