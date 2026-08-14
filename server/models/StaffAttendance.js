const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendanceDate: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'Not Marked'], default: 'Present' },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
}, { timestamps: true });

staffAttendanceSchema.index({ userId: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
