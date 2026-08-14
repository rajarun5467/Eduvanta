const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  eventDate: { type: Date, required: true },
  eventType: { type: String, default: 'General' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
