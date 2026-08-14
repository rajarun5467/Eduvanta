const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  company: { type: String, required: true },
  package: { type: String, required: true },
  role: { type: String, default: '' },
  placedDate: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
