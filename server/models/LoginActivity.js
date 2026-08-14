const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['admin', 'faculty', 'student'], default: 'faculty' },
  loginAt: { type: Date, required: true },
  logoutAt: { type: Date, default: null },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  sessionId: { type: String, default: '' },
  status: { type: String, enum: ['online', 'offline'], default: 'online' },
}, { timestamps: true });

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
