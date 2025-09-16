const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getProfileByUserId,
  updateProfile,
  getAllProfiles,
  deleteProfile
} = require('../controllers/profileController');

const router = express.Router();

/**
 * Validation middleware for profile creation/update
 */
const validateProfile = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  /*body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'), */
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  
  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[0-9\s\-\(\)]{7,20}$/)
    .withMessage('Please enter a valid phone number (7-20 characters, digits, spaces, +, -, (, ) allowed)')
];

/**
 * GET /api/profile/me
 * Get current authenticated user's profile
 */
router.get('/me', authenticateToken, getProfileByUserId);

/**
 * POST /api/profile
 * Create or update profile for authenticated user
 */
router.post('/', [
  authenticateToken,
  ...validateProfile
], updateProfile);

/**
 * PUT /api/profile
 * Create or update profile for authenticated user (alternative endpoint)
 */
router.put('/', [
  authenticateToken,
  ...validateProfile
], updateProfile);

/**
 * GET /api/profile/all
 * Get all profiles (admin functionality - optional)
 */
router.get('/all', authenticateToken, getAllProfiles);

/**
 * DELETE /api/profile
 * Delete current user's profile
 */
router.delete('/', authenticateToken, deleteProfile);

module.exports = router;
