const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const LoginActivity = require('../models/LoginActivity');
const jwt = require('jsonwebtoken');

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, username: user.username || user.email, role, entityId: user.entityId || null },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.status !== 'Active') return res.status(403).json({ message: 'Account inactive' });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  user.lastLogin = new Date();
  await user.save();

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const activity = await LoginActivity.create({
    userId: user._id,
    userType: user.role === 'admin' ? 'admin' : 'faculty',
    loginAt: new Date(),
    ipAddress: ip,
    userAgent: ua,
    sessionId: '',
    status: 'online',
  });

  let facultyData = null;
  if (user.entityId) {
    facultyData = await Faculty.findById(user.entityId).lean();
  }

  const token = generateToken(user, user.role);
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      entityId: user.entityId,
      assignedClassId: user.assignedClassId,
      assignedSectionId: user.assignedSectionId,
      canAccessFees: user.canAccessFees,
      canAccessSalary: user.canAccessSalary,
      facultyName: facultyData ? `${facultyData.firstName} ${facultyData.lastName}` : user.username,
      facultyDept: facultyData ? facultyData.department : '',
      activityId: activity._id,
    },
  });
};

exports.studentLogin = async (req, res) => {
  const { email, dob } = req.body;
  if (!email || !dob) return res.status(400).json({ message: 'Email and date of birth required' });

  const student = await Student.findOne({ email: email.toLowerCase().trim() });
  if (!student) return res.status(401).json({ message: 'Student not found' });
  if (student.status !== 'Active') return res.status(403).json({ message: 'Account suspended/inactive' });

  if (student.password) {
    const isMatch = await student.matchPassword(dob);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  } else {
    // Fix timezone issue: compare date parts only, accounting for IST offset
    const dobStr = dob.slice(0, 10); // user input is already YYYY-MM-DD
    const studentDob = student.dob ? new Date(student.dob).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : null;
    if (dobStr !== studentDob) return res.status(401).json({ message: 'Invalid date of birth' });
  }

  student.lastLogin = new Date();
  await student.save();

  const token = jwt.sign(
    { id: student._id, username: student.email, role: 'student' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );

  res.json({
    token,
    student: {
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      course: student.course,
      year: student.year,
    },
  });
};

exports.logout = async (req, res) => {
  const { activityId } = req.body;
  if (activityId) {
    await LoginActivity.findByIdAndUpdate(activityId, { logoutAt: new Date(), status: 'offline' });
  }
  if (req.user) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { lastLogout: new Date() });
  }
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  if (req.user.role === 'student') {
    const student = await Student.findById(req.user.id).lean();
    return res.json({ user: student, role: 'student' });
  }
  const user = await User.findById(req.user.id).lean();
  let faculty = null;
  if (user.entityId) faculty = await Faculty.findById(user.entityId).lean();
  res.json({ user, faculty, role: user.role });
};
