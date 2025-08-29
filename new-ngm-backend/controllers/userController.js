const User = require('../models/userModel');
const responseHelpers = require('../utils/responseHelpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
exports.registerUser = async (req, res) => {

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(responseHelpers.error('Oops! It looks like this email is already registered. Try logging in instead. 📧'));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        message: responseHelpers.messages.registered(user.name),
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token,
      });
    } else {
      res.status(400).json(responseHelpers.error('Hmm, we couldn\'t create your account. Please check your information and try again. 🤔'));
    }
  } catch (error) {
    res.status(500).json(responseHelpers.serverError(error));
  }
};

// @desc    Login user
exports.loginUser = async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.warn('Login failed: user not found for email', email);
      return res.status(401).json(responseHelpers.error('Hmm, we couldn\'t find an account with that email. Want to create one instead? 📧'));
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.warn('Login failed: password mismatch for email', email);
        return res.status(401).json(responseHelpers.error('That password doesn\'t seem right. Want to try again or reset it? 🔒'));
      } else {
        const token = generateToken(user._id);
        res.json({
          success: true,
          message: responseHelpers.messages.loggedIn(user.name),
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: token,
        });
      }
    }
  } catch (error) {
    res.status(500).json(responseHelpers.serverError(error));
  }
};

// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(responseHelpers.success('User profile retrieved successfully', user));
    } else {
      res.status(404).json(responseHelpers.notFound('User'));
    }
  } catch (error) {
    res.status(500).json(responseHelpers.serverError(error));
  }
};
