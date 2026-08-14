const express = require('express');
const { protect } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Notice = require('../models/Notice');

const ctrl = createCrud(Notice, ['title', 'description']);

const router = express.Router();

router.get('/', protect, ctrl.list);
router.get('/:id', protect, ctrl.getById);
router.post('/', protect, ctrl.create);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
