const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  attendanceDate: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
