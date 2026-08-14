const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { list, getById, create, update, remove } = require('../controllers/courseController');

const router = express.Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
