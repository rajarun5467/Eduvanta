const express = require('express');
const createCrud = require('../controllers/crudFactory');
const Event = require('../models/Event');

const ctrl = createCrud(Event, ['title', 'description', 'eventType']);

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
