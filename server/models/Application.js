const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, default: 'New' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
