const express = require('express');
const { protect } = require('../middleware/auth');
const { login, studentLogin, logout, me } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/student-login', studentLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
