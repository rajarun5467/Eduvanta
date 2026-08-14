const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true },
  category: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Download', downloadSchema);
