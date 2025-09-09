const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');

// Helper: sign JWT
const signToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone, location } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const user = new User({
      name: (name || '').trim(),
      email: normalizedEmail,
      password,
      phone: phone ? String(phone).trim() : '',
      location: (location || '').trim()
    });
    await user.save();

    // Create dashboard entry for new user
    try {
      await Dashboard.create({
        user: user._id,
        totalComplaints: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0
      });
    } catch (dashboardError) {
      console.error('Failed to create dashboard for user:', user._id, dashboardError);
      // Continue with registration even if dashboard creation fails
    }

    const token = signToken(user._id, user.role);
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone
      },
      token
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id, user.role);
    const { password: _pw, ...safe } = user.toObject();

    return res.json({
      message: 'Login successful',
      user: {
        id: safe._id,
        name: safe.name,
        email: safe.email,
        role: safe.role,
        location: safe.location,
        phone: safe.phone,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load user' });
  }
};

// Optional: POST /api/auth/logout (client removes token)
const logout = async (req, res) => {
  return res.json({ message: 'Logout successful' });
};

// Export with both naming styles for safety
module.exports = {
  register,
  login,
  getMe,
  logout,
  registerUser: register,
  loginUser: login
};
