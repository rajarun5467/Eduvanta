require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educollege');
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('Admin user not found. Creating a new admin user...');
      admin = new User({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin',
        canAccessFees: true,
        canAccessSalary: true,
        status: 'Active'
      });
    } else {
      console.log('Admin user found. Resetting password...');
      admin.password = 'admin123'; // Will be hashed by pre-save hook
    }

    await admin.save();
    console.log('Admin password has been set to: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin:', err);
    process.exit(1);
  }
};

resetAdmin();
