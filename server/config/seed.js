const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing seed users
    await User.deleteMany({
      email: { $in: ['hr@test.com', 'employee@test.com'] }
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    const users = [
      {
        name: 'HR Manager',
        email: 'hr@test.com',
        passwordHash,
        role: 'hr',
      },
      {
        name: 'John Employee',
        email: 'employee@test.com',
        passwordHash,
        role: 'employee',
      }
    ];

    await User.insertMany(users);
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
