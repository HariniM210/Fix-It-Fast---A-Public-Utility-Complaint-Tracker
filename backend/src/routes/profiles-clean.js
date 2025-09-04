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
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('First name must be between 2 and 30 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Last name must be between 2 and 30 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required and must be between 2 and 50 characters'),
  
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State is required and must be between 2 and 50 characters'),
  
  body('address.pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender option'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL')
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
 * Fetch all profiles
 */
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching profiles with query:', req.query);
    
    const {
      page = 1,
      limit = 10,
      city,
      state,
      isPublic = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (isPublic !== 'false') {
      query.isPublic = true;
    }
    
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .populate('userId', 'name email role status')
        .select('-__v')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limitNum)
        .skip(skipNum)
        .lean(),
      Profile.countDocuments(query)
    ]);

    console.log(`✅ Found ${profiles.length} profiles (${total} total)`);

    res.json({
      success: true,
      profiles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
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
    
    const profile = await Profile.findOne({ userId: req.user.id, isActive: true })
      .populate('userId', 'name email role status lastLogin')
      .select('-__v');

    if (!profile) {
      console.log('❌ No profile found for authenticated user');
      return res.status(404).json({
        success: false,
        message: 'No profile found. Please create your profile first.',
        needsProfile: true
      });
    }

    // Update last active timestamp
    await profile.updateLastActive();

    console.log('✅ Current user profile retrieved successfully');

    res.json({
      success: true,
      profile,
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
 * PUT /api/profiles/me
 * Update current authenticated user's profile
 */
router.put('/me', [
  authenticateToken,
  ...validateProfile,
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Updating profile for authenticated user: ${req.user.id}`);
    console.log('Update data:', { ...req.body, email: '[PROTECTED]' });

    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      // If no profile exists, create one
      console.log('📝 No existing profile found, creating new one');
      
      const profileData = {
        userId: req.user.id,
        ...req.body
      };

      profile = new Profile(profileData);
      await profile.save();
      await profile.populate('userId', 'name email role status');
      
      console.log('✅ New profile created successfully');
      
      return res.status(201).json({
        success: true,
        profile,
        message: 'Profile created successfully'
      });
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== profile.email) {
      const emailExists = await Profile.findOne({ 
        email: req.body.email, 
        _id: { $ne: profile._id } 
      });
      
      if (emailExists) {
        console.log('❌ Email already in use');
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use'
        });
      }
    }

    // Update profile
    const updateData = {
      ...req.body,
      lastActive: new Date()
    };

    const updatedProfile = await Profile.findByIdAndUpdate(
      profile._id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    ).populate('userId', 'name email role status');

    console.log('✅ Profile updated successfully');

    res.json({
      success: true,
      profile: updatedProfile,
      message: 'Your profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    
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
      message: 'Failed to update your profile',
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
      .populate('userId', 'name email role status lastLogin')
      .select('-__v');

    if (!profile) {
      console.log('❌ Profile not found');
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if profile is public
    if (!profile.isPublic) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({
          success: false,
          message: 'This profile is private'
        });
      }
    }

    console.log('✅ Profile found and retrieved successfully');

    res.json({
      success: true,
      profile,
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
 * PATCH /api/profiles/:id/privacy
 * Update profile privacy settings
 */
router.patch('/:id/privacy', [
  authenticateToken,
  param('id').isMongoId().withMessage('Invalid profile ID'),
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean'),
  body('showEmail').optional().isBoolean().withMessage('showEmail must be a boolean'),
  body('showPhone').optional().isBoolean().withMessage('showPhone must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log(`📥 Updating privacy for profile: ${req.params.id}`);
    
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check ownership
    if (profile.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile privacy settings'
      });
    }

    const { isPublic, showEmail, showPhone } = req.body;
    
    const updateData = { lastActive: new Date() };
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (showEmail !== undefined) updateData.showEmail = showEmail;
    if (showPhone !== undefined) updateData.showPhone = showPhone;

    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-__v' }
    ).populate('userId', 'name email role');

    console.log('✅ Privacy settings updated successfully');

    res.json({
      success: true,
      profile: updatedProfile,
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/profiles/stats
 * Get profile statistics
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📥 Fetching profile statistics');
    
    const [totalProfiles, activeProfiles, publicProfiles, verifiedProfiles] = await Promise.all([
      Profile.countDocuments(),
      Profile.countDocuments({ isActive: true }),
      Profile.countDocuments({ isPublic: true, isActive: true }),
      Profile.countDocuments({ isVerified: true, isActive: true })
    ]);

    // Get top cities by user count
    const topCities = await Profile.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { city: '$_id', count: 1, _id: 0 } }
    ]);

    const stats = {
      totalProfiles,
      activeProfiles,
      publicProfiles,
      verifiedProfiles,
      topCities
    };

    console.log('✅ Profile statistics retrieved:', stats);

    res.json({
      success: true,
      stats,
      message: 'Profile statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching profile statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router
module.exports = router;
