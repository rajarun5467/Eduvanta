const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  username: { type: String, default: '', trim: true },
  password: { type: String, default: '' },
  course: { type: String, required: true },
  year: { type: String, required: true },
  phone: { type: String, default: '' },
  dob: { type: Date, default: null },
  status: { type: String, enum: ['Active', 'Suspended', 'Inactive'], default: 'Active' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  rollNumber: { type: String, default: '' },
  gender: { type: String, default: '' },
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  parentEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

studentSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return false;
  const bcrypt = require('bcryptjs');
  let hash = this.password;
  if (hash.startsWith('$2y$')) hash = '$2a$' + hash.slice(4);
  return bcrypt.compare(enteredPassword, hash);
};

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  if (/^\$2[ayb]\$\d{2}\$/.test(this.password)) return next();
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Student', studentSchema);
