const express = require('express');
const { protect, adminOnly, adminOrFaculty } = require('../middleware/auth');
const { Class, Section } = require('../models/Class');
const Student = require('../models/Student');
const User = require('../models/User');

exports.listClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1 }).lean();
    const sections = await Section.find().populate('classTeacherUserId', 'username').lean();
    const students = await Student.find().lean();
    // group sections by classId
    const secByClass = {};
    sections.forEach((s) => {
      const k = s.classId?.toString();
      if (!secByClass[k]) secByClass[k] = [];
      const teacherName = s.classTeacherUserId?.username || '';
      const stuCount = students.filter((st) => st.sectionId?.toString() === s._id?.toString()).length;
      secByClass[k].push({ ...s, teacherName, studentCount: stuCount });
    });
    const result = classes.map((c) => ({
      ...c,
      sections: secByClass[c._id?.toString()] || [],
      studentCount: students.filter((st) => st.classId?.toString() === c._id?.toString()).length,
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    // unassign students
    await Student.updateMany({ classId: req.params.id }, { classId: null, sectionId: null });
    await Section.deleteMany({ classId: req.params.id });
    // unassign teachers
    await User.updateMany({ assignedClassId: req.params.id }, { assignedClassId: null, assignedSectionId: null });
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class and its sections deleted' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.listSections = async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const sections = await Section.find(filter).populate('classId', 'name department').populate('classTeacherUserId', 'username').lean();
    const students = await Student.find().lean();
    const result = sections.map((s) => ({
      ...s,
      className: s.classId?.name || '—',
      classDept: s.classId?.department || '',
      teacherName: s.classTeacherUserId?.username || '',
      studentCount: students.filter((st) => st.sectionId?.toString() === s._id?.toString()).length,
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createSection = async (req, res) => {
  try {
    const { classId, name, classTeacherUserId, status } = req.body;
    const sec = await Section.create({
      classId,
      name,
      classTeacherUserId: classTeacherUserId || null,
      status: status || 'Active',
    });
    // assign teacher role if provided
    if (classTeacherUserId) {
      await User.findByIdAndUpdate(classTeacherUserId, {
        role: 'class_teacher',
        assignedClassId: classId,
        assignedSectionId: sec._id,
        canAccessFees: true,
        canAccessSalary: true,
      });
    }
    res.status(201).json(sec);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.updateSection = async (req, res) => {
  try {
    const old = await Section.findById(req.params.id).lean();
    const sec = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sec) return res.status(404).json({ message: 'Section not found' });
    // update teacher assignment
    if (req.body.classTeacherUserId) {
      await User.findByIdAndUpdate(req.body.classTeacherUserId, {
        role: 'class_teacher',
        assignedClassId: old.classId,
        assignedSectionId: sec._id,
        canAccessFees: true,
        canAccessSalary: true,
      });
    }
    // unassign previous teacher if changed
    if (old.classTeacherUserId && old.classTeacherUserId.toString() !== req.body.classTeacherUserId) {
      await User.updateOne({ _id: old.classTeacherUserId, assignedSectionId: sec._id }, { assignedClassId: null, assignedSectionId: null });
    }
    res.json(sec);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.deleteSection = async (req, res) => {
  try {
    await Student.updateMany({ sectionId: req.params.id }, { sectionId: null });
    await User.updateMany({ assignedSectionId: req.params.id }, { assignedClassId: null, assignedSectionId: null });
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

const router = express.Router();

router.get('/teachers', protect, adminOrFaculty, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['class_teacher', 'teacher'] }, status: 'Active' }).populate('entityId', 'firstName lastName department').lean();
    const result = users.map((u) => ({
      _id: u._id,
      username: u.username,
      firstName: u.entityId?.firstName || '',
      lastName: u.entityId?.lastName || '',
      department: u.entityId?.department || '',
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.get('/', protect, adminOrFaculty, exports.listClasses);
router.post('/', protect, adminOnly, exports.createClass);
router.put('/:id', protect, adminOnly, exports.updateClass);
router.delete('/:id', protect, adminOnly, exports.deleteClass);
router.get('/sections', protect, adminOrFaculty, exports.listSections);
router.post('/sections', protect, adminOnly, exports.createSection);
router.put('/sections/:id', protect, adminOnly, exports.updateSection);
router.delete('/sections/:id', protect, adminOnly, exports.deleteSection);

module.exports = router;
