const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  testName: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  testDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
