const express = require('express');
const { protect } = require('../middleware/auth');
const { login, studentLogin, logout, me } = require('../controllers/authController');
const User = require('../models/User'); // ADDED THIS

const router = express.Router();

router.post('/login', login);
router.post('/student-login', studentLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// TEMPORARY ROUTE TO RESET ADMIN
router.get('/reset-admin', async (req, res) => {
  try {
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        canAccessFees: true,
        canAccessSalary: true,
        status: 'Active'
      });
    } else {
      admin.password = 'admin123';
    }
    await admin.save();
    res.send('<h1>Admin password reset successfully! You can now login with username: admin and password: admin123</h1><p>Please tell me once you login so I can remove this secure code.</p>');
  } catch (err) {
    res.status(500).send('Error resetting admin: ' + err.message);
  }
});

module.exports = router;
