const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  designation: { type: String, default: 'Teacher' },
  role: { type: String, default: 'teacher' },
  email: { type: String, required: true, trim: true, lowercase: true },
  experience: { type: String, default: '0' },
  phone: { type: String, default: '' },
  education: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: null },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
