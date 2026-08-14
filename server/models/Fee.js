const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  feeType: { type: String, default: 'Tuition' },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentDate: { type: Date, default: null },
  status: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
