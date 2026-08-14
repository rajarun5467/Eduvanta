const mongoose = require('mongoose');

const correctionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', default: null },
  requestDate: { type: Date, required: true },
  requestedStatus: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminResponse: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('CorrectionRequest', correctionSchema);
