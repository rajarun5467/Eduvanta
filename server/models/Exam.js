const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  examType: { type: String, default: 'Internal' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  subject: { type: String, required: true },
  examDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Published'], default: 'Scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
