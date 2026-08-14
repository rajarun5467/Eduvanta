const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  course: { type: String, required: true },
  year: { type: String, required: true },
  admissionDate: { type: Date, required: true },
  feeAmount: { type: String, default: '' },
  status: { type: String, enum: ['Admitted', 'Cancelled'], default: 'Admitted' },
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
