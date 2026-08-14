const express = require('express');
const createCrud = require('../controllers/crudFactory');
const Placement = require('../models/Placement');

const ctrl = createCrud(Placement, ['studentName', 'company', 'course']);

// Override list to sort by createdAt ASC (matches PHP's ORDER BY id ASC)
const list = async (req, res) => {
  try {
    const items = await Placement.find().sort({ createdAt: 1 }).lean();
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const router = express.Router();

router.get('/', list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
