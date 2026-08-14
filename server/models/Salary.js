const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salaryMonth: { type: String, required: true },
  basicAmount: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  payslipPath: { type: String, default: '' },
  status: { type: String, enum: ['Generated', 'Paid'], default: 'Generated' },
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
