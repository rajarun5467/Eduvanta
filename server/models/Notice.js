const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetRole: { type: String, enum: ['all', 'admin', 'teacher', 'student'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
