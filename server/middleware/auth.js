const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }
  next();
};

const adminOnly = requireRole('admin');
const facultyOnly = requireRole('admin', 'class_teacher', 'teacher');
const studentOnly = requireRole('student');
const adminOrFaculty = requireRole('admin', 'class_teacher', 'teacher');
const adminOrStudent = requireRole('admin', 'student');
const adminOrFacultyOrStudent = requireRole('admin', 'class_teacher', 'teacher', 'student');

module.exports = { protect, requireRole, adminOnly, facultyOnly, studentOnly, adminOrFaculty, adminOrStudent, adminOrFacultyOrStudent };
