// createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminExists = await User.findOne({ email: 'admin@gramasathi.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const adminUser = new User({
      name: 'Admin',
      email: 'admin@gramasathi.com',
      password: 'admin123', // plain text, will be hashed by pre-save hook
      role: 'admin',
      preferredLanguage: 'en'
    });

    await adminUser.save(); // this will trigger pre-save hook and hash password

    console.log('✅ Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
