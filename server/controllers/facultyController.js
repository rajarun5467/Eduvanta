const Faculty = require('../models/Faculty');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.list = async (req, res) => {
  const { search, department, status } = req.query;
  const filter = {};
  if (search) {
    const rx = new RegExp(search, 'i');
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { department: rx }];
  }
  if (department) filter.department = department;
  if (status) filter.status = status;
  const faculty = await Faculty.find(filter).sort({ createdAt: 1 }).lean();
  const users = await User.find({ role: { $in: ['class_teacher', 'teacher'] } }).lean();
  const userMap = {};
  users.forEach(u => { if (u.entityId) userMap[u.entityId.toString()] = u; });
  const result = faculty.map(f => ({ ...f, user: userMap[f._id.toString()] || null }));
  res.json(result);
};

exports.getById = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).lean();
  if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
  const user = await User.findOne({ entityId: req.params.id }).lean();
  res.json({ ...faculty, user });
};

exports.create = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    // Create login account (like PHP does)
    const uname = (req.body.email || '').split('@')[0].toLowerCase();
    if (uname) {
      const existing = await User.findOne({ username: uname });
      if (!existing) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('teacher123', salt);
        const role = req.body.role || 'teacher';
        await User.create({
          username: uname,
          password: hashed,
          role,
          entityId: faculty._id,
          canAccessFees: ['admin', 'class_teacher'].includes(role),
          canAccessSalary: true,
          status: 'Active',
        });
      }
    }
    res.status(201).json(faculty);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
  res.json(faculty);
};

exports.remove = async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id);
  await User.deleteOne({ entityId: req.params.id });
  res.json({ message: 'Faculty deleted' });
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ entityId: id });
  if (!user) return res.status(404).json({ message: 'User account not found' });
  const newPass = Math.random().toString(36).slice(-8);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPass, salt);
  await user.save();
  res.json({ message: `Password reset. New password: ${newPass}` });
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await User.findOne({ entityId: id });
  if (user) {
    user.status = status;
    await user.save();
  }
  await Faculty.findByIdAndUpdate(id, { status: status === 'Active' ? 'Active' : 'Inactive' });
  res.json({ message: `Status set to ${status}` });
};

exports.summary = async (req, res) => {
  const total = await Faculty.countDocuments();
  const active = await Faculty.countDocuments({ status: 'Active' });
  res.json({ total, active, inactive: total - active });
};
