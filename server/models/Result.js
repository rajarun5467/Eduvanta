const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marks: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  remarks: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
