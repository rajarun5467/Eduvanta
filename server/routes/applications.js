const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Application = require('../models/Application');

const ctrl = createCrud(Application, ['firstName', 'lastName', 'email', 'course']);

const router = express.Router();

router.get('/', protect, adminOnly, ctrl.list);
router.get('/:id', protect, adminOnly, ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
