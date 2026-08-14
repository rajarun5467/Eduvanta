const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  testName: { type: String, required: true },
  maxMarks: { type: Number, default: 100 },
  obtainedMarks: { type: Number, default: 0 },
  testDate: { type: Date, required: true },
  year: { type: String, default: '' },
  semester: { type: Number, default: 1 },
  subjectCode: { type: String, default: '' },
  subjectType: { type: String, default: 'Theory' },
  credits: { type: Number, default: 4 },
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
