const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'ngm@service.com';
    const password = 'Adaezegift';

    let user = await User.findOne({ email });
    if (user) {
      user.isAdmin = true;
      // Set the password in plain text; pre-save hook will hash it
      user.password = password;
      await user.save();
      console.log('Admin user updated!');
    } else {
      user = new User({
        name: 'Admin',
        email,
        password: password, // Let pre-save hook hash it
        isAdmin: true,
      });
      await user.save();
      console.log('Admin user created!');
    }
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
