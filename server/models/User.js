const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'class_teacher', 'teacher'], default: 'teacher' },
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', default: null },
  assignedClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  assignedSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  canAccessFees: { type: Boolean, default: false },
  canAccessSalary: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLogin: { type: Date, default: null },
  lastLogout: { type: Date, default: null },
}, { timestamps: true });

userSchema.methods.matchPassword = function (enteredPassword) {
  const bcrypt = require('bcryptjs');
  let hash = this.password;
  // PHP password_hash uses $2y$ prefix; bcryptjs expects $2a$/$2b$
  if (hash && hash.startsWith('$2y$')) hash = '$2a$' + hash.slice(4);
  return bcrypt.compare(enteredPassword, hash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Skip re-hashing if the password is already a bcrypt hash (e.g. migrated from PHP)
  if (this.password && /^\$2[ayb]\$\d{2}\$/.test(this.password)) return next();
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
