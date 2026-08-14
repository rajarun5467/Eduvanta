const mongoose = require('mongoose');

const facultySubjectSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  subject: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FacultySubject', facultySubjectSchema);
