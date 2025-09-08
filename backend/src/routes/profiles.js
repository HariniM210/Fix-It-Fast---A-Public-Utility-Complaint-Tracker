const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

const router = express.Router();

/**
 * Validation middleware for profile creation/update
 */
const validateProfile = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot exceed 50 characters')
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/profiles
 * Fetch all profiles (simplified)
 */
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching all profiles');
    
    const profiles = await Profile.find({})
      .populate('user', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${profiles.length} profiles`);

    res.json({
      success: true,
      data: profiles,
      message: `Retrieved ${profiles.length} profiles successfully`
    });

  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/profiles/me
 * Get current authenticated user's profile
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log(`📥 Fetching profile for authenticated user: ${req.user.id}`);
    
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email role')
      .select('-__v');

    if (!profile) {
      console.log('❌ No profile found for authenticated user');
      return res.status(404).json({
        success: false,
        message: 'No profile found. Please create your profile first.',
        needsProfile: true
      });
    }

    console.log('✅ Current user profile retrieved successfully');

    res.json({
      success: true,
      data: profile,
      message: 'Your profile retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching current user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/profiles
 * Create a new profile for authenticated user
 */
router.post('/', [
  authenticateToken,
  ...validateProfile,
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Creating/Updating profile for authenticated user: ${req.user.id}`);
    console.log('Profile data:', { ...req.body, email: '[PROTECTED]' });

    // Find existing profile
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (profile) {
      // Check if new email conflicts with another user
      if (req.body.email && req.body.email !== profile.email) {
        const emailExists = await Profile.findOne({ 
          email: req.body.email, 
          _id: { $ne: profile._id } 
        });
        
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email address is already in use'
          });
        }
      }

      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { ...req.body },
        { 
          new: true,
          runValidators: true,
          select: '-__v'
        }
      ).populate('user', 'name email role');

      return res.json({
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      });
    }

    // Create new profile
    // Inside your POST route
    const newProfile = new Profile({
      user: req.user.id,  // Make sure this matches the field name in schema
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio || '',
      location: req.body.location || '',
      skills: req.body.skills || []
    });

    await newProfile.save();
    await newProfile.populate('user', 'name email role');
    
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('❌ Error handling profile:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/profiles/:id
 * Update profile by ID (for authenticated user)
 */
router.put('/:id', [
  authenticateToken,
  param('id').isMongoId().withMessage('Invalid profile ID'),
  ...validateProfile,
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Updating profile ${req.params.id} for user: ${req.user.id}`);
    
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check ownership
    if (profile.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== profile.email) {
      const emailExists = await Profile.findOne({ 
        email: req.body.email, 
        _id: { $ne: profile._id } 
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use'
        });
      }
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    ).populate('user', 'name email role');

    console.log('✅ Profile updated successfully');

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/profiles/:id
 * Fetch a specific profile by ID
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid profile ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Fetching profile with ID: ${req.params.id}`);
    
    const profile = await Profile.findById(req.params.id)
      .populate('user', 'name email role')
      .select('-__v');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    console.log('✅ Profile found and retrieved successfully');

    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/profiles/:id
 * Delete profile by ID (for authenticated user)
 */
router.delete('/:id', [
  authenticateToken,
  param('id').isMongoId().withMessage('Invalid profile ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Deleting profile ${req.params.id} for user: ${req.user.id}`);
    
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check ownership (or admin)
    if (profile.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own profile'
      });
    }

    await Profile.findByIdAndDelete(req.params.id);

    console.log('✅ Profile deleted successfully');

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router
module.exports = router;
