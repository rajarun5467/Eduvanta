const mongoose = require('mongoose');

const classSubjectSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  subject: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

classSubjectSchema.index({ classId: 1, sectionId: 1, day: 1, startTime: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('ClassSubject', classSubjectSchema);
