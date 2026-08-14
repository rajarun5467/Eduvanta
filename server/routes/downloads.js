const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const createCrud = require('../controllers/crudFactory');
const Download = require('../models/Download');

const ctrl = createCrud(Download, ['title', 'category']);

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', protect, adminOnly, ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
