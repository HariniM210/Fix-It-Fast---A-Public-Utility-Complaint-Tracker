const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { register, login, getMe, logout } = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 0 })
    .withMessage('Phone number must be valid')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

module.exports = router;