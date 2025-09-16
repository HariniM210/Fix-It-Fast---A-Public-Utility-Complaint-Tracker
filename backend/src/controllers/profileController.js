
const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Get profile by user ID (logged-in user)
 * GET /api/profile/me
 */
const getProfileByUserId = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticateToken middleware
    console.log('🔍 getProfileByUserId called for userId:', userId);
    
    const profile = await Profile.findOne({ user: userId }).populate('user', 'email username');
    
    if (!profile) {
      return res.status(200).json({
        success: true,
        message: 'Profile not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update or create profile - BULLETPROOF approach using upsert
 * POST /api/profile
 */
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id; // From authenticateToken middleware
    const { name, bio, location, phone } = req.body;
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare profile data
    const profileData = {
      user: userId,
      name,
      bio: bio || '',
      location: {
        country: location?.country || '',
        state: location?.state || '',
        city: location?.city || '',
        address: location?.address || ''
      },
      phone: phone || ''
    };

    // Check if profile already exists before upsert
    const existingProfile = await Profile.findOne({ user: userId });
    console.log('🔍 Existing profile check:', existingProfile ? 'Found' : 'Not found');

    // Use findOneAndUpdate with upsert - this is BULLETPROOF
    // It will update if exists, create if doesn't exist, and never cause duplicates
    console.log('🔄 Performing upsert operation...');
    const profile = await Profile.findOneAndUpdate(
      { user: userId }, // Find by user ID
      profileData, // Update/insert this data
      { 
        new: true,
        upsert: true,  // Return the updated document
        runValidators: true, // Run schema validations
        // Create if doesn't exist, update if exists
        setDefaultsOnInsert: true // Apply default values when creating
      }
    ).populate('user', 'email username');

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: profile
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);

    // Handle duplicate key error (should not happen with upsert, but just in case)
    if (error.code === 11000 && error.keyPattern?.user) {
      return res.status(400).json({
        success: false, 
        message: 'A profile for this user already exists',
        error: 'Duplicate profile entry'
      });
    }
      }

    // Handle validation error with detailed messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      console.error('❌ Validation errors:', validationErrors);
      
      const errorMessage = validationErrors.length === 1 
        ? validationErrors[0].message
        : `Multiple validation errors: ${validationErrors.map(e => e.message).join(', ')}`;
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: validationErrors,
        details: 'Please check your input and try again'
      });
    }

    // Handle cast errors (type conversion issues)
    if (error.name === 'CastError') {
      console.error('❌ Cast error:', error);
      return res.status(400).json({
        success: false,
        message: `Invalid data type for field '${error.path}'. Expected ${error.kind}, received ${typeof error.value}`,
        error: 'Data type mismatch',
        field: error.path,
        details: 'Please check your input format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }

/**
 * Get all profiles (admin functionality - optional)
 * GET /api/profile/all
 */
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('user', 'email username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Profiles retrieved successfully',
      data: profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};

/**
 * Delete profile (optional)
 * DELETE /api/profile
 */
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOneAndDelete({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};

module.exports = {
  getProfileByUserId,
  updateProfile,
  getAllProfiles,
  deleteProfile
};
