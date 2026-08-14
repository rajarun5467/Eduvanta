function createCrudController(Model, searchFields = []) {
  return {
    list: async (req, res) => {
      const { search, status } = req.query;
      const filter = {};
      if (search && searchFields.length > 0) {
        const rx = new RegExp(search, 'i');
        filter.$or = searchFields.reduce((acc, f) => { acc.push({ [f]: rx }); return acc; }, []);
      }
      if (status) filter.status = status;
      const items = await Model.find(filter).sort({ createdAt: -1 }).lean();
      res.json(items);
    },
    getById: async (req, res) => {
      const item = await Model.findById(req.params.id).lean();
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    },
    create: async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    },
    update: async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    },
    remove: async (req, res) => {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted' });
    },
  };
}

module.exports = createCrudController;
