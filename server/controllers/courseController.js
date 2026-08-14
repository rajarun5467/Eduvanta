const Course = require('../models/Course');

exports.list = async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (search) {
    const rx = new RegExp(search, 'i');
    filter.$or = [{ name: rx }, { department: rx }];
  }
  if (status) filter.status = status;
  const courses = await Course.find(filter).sort({ createdAt: 1 }).lean();
  res.json(courses);
};

exports.getById = async (req, res) => {
  const id = req.params.id;
  let course = null;
  // If it's a valid ObjectId, look up by id; otherwise treat as slug
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    course = await Course.findById(id).lean();
  }
  if (!course) {
    // slug fallback: match by slug field or normalized name
    const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    course = await Course.findOne({ slug }).lean();
  }
  if (!course) {
    // try matching name (case-insensitive) for common slugs like btech, bca
    const nameMap = {
      btech: 'b.tech', bca: 'bca', mba: 'mba', mca: 'mca', bsc: 'b.sc',
      diploma: 'diploma', 'diploma-engineering': 'diploma',
    };
    const nameGuess = nameMap[id.toLowerCase()] || id;
    const rx = new RegExp('^' + nameGuess.replace('.', '\\.') + '$', 'i');
    course = await Course.findOne({ name: rx }).lean();
  }
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

exports.create = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

exports.update = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

exports.remove = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted' });
};
