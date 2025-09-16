// src/services/profileService.js
import API from './api';

/**
 * Profile API Service
 * Handles all profile-related API calls to the backend
 */

/**
 * Get all profiles with optional filtering
 * @param {Object} filters - Query parameters (page, limit, city, state, etc.)
 * @returns {Promise} API response with profiles list and pagination
 */
export const getAllProfiles = async (filters = {}) => {
  try {
    console.log('🔍 Fetching all profiles with filters:', filters);
    
    const response = await API.get('/profiles', { params: filters });
    
    console.log('✅ Profiles fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    throw error;
  }
};

/**
 * Get a specific profile by ID
 * @param {string} profileId - The profile ID to fetch
 * @returns {Promise} API response with profile data
 */
export const getProfileById = async (profileId) => {
  try {
    console.log(`🔍 Fetching profile with ID: ${profileId}`);
    
    const response = await API.get(`/profiles/${profileId}`);
    
    console.log('✅ Profile fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching profile ${profileId}:`, error);
    throw error;
  }
};

/**
 * Get current authenticated user's profile
 * @returns {Promise} API response with current user's profile or null if no profile exists
 */
export const getCurrentUserProfile = async () => {
  try {
    console.log('🔍 Fetching current user profile');
    
    const response = await API.get('/profile/me');
    
    console.log('✅ Current user profile fetched successfully:', response.data);
    
    // Check if profile data exists, return null if no profile found
    if (response.data.success && !response.data.data) {
      console.log('📝 No profile data found (this is normal for new users)');
      return null;
    }
    
    return response.data;
  } catch (error) {
    // Handle 404 gracefully - user doesn't have a profile yet
    if (error.response?.status === 404) {
      console.log('📝 No profile found for current user (this is normal for new users)');
      return null;
    }
    
    // For other errors, log and throw
    console.error('❌ Error fetching current user profile:', error);
    throw error;
  }
};

/**
 * Create or update profile (unified function)
 * @param {Object} profileData - The profile data to create or update
 * @returns {Promise} API response with profile data
 */
export const createProfile = async (profileData) => {
  try {
    console.log('📝 Creating profile:', { ...profileData, email: '[PROTECTED]' });
    
    // Transform frontend form data to backend expected format
    const transformedData = {
      name: profileData.name || '',
      bio: profileData.bio || '',
      // Transform address to location format expected by backend
      location: {
        country: profileData.location?.country || '',
        state: profileData.location?.state || '',
        city: profileData.location?.city || '',
        address: profileData.location?.address|| ''
      },
      phone: profileData.phone || ''
    };
    
    console.log('🔄 Transformed data for backend:', { ...transformedData, email: '[PROTECTED]' });
    
    // Use POST endpoint for create/update
    const response = await API.post('/profile', transformedData);
    
    console.log('✅ Profile created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
};

/**
 * Update profile (alias for createProfile - same function)
 * @param {string} profileId - Ignored (kept for compatibility)
 * @param {Object} profileData - The profile data to update
 * @returns {Promise} API response with updated profile
 */
export const updateProfile = async (profileId, profileData) => {
  // Use the unified create/update function
  return createProfile(profileData);
};

/**
 * Update current user's profile (transforms frontend data to backend format)
 * @param {Object} profileData - The profile data from frontend form
 * @returns {Promise} API response with updated profile
 */
export const updateCurrentUserProfile = async (profileData) => {
  try {
    console.log('📝 Updating current user profile:', { ...profileData, email: '[PROTECTED]' });
    
    // Transform frontend form data to backend expected format
    const transformedData = {
      name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),

      bio: profileData.bio || '',
      // Transform address to location format expected by backend
      location: {
        country: profileData.address?.country || '',
        state: profileData.address?.state || '',
        city: profileData.address?.city || '',
        address: profileData.address?.street || ''
      },
      phone: profileData.phone || ''
    };
    
    console.log('🔄 Transformed data for backend:', { ...transformedData, email: '[PROTECTED]' });
    
    // Use POST endpoint for create/update with upsert
    const response = await API.post('/profile', transformedData);
    
    console.log('✅ Profile updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

/**
 * Delete a profile by ID
 * @param {string} profileId - The profile ID to delete
 * @returns {Promise} API response confirmation
 */
export const deleteProfile = async (profileId) => {
  try {
    console.log(`🗑️ Deleting profile: ${profileId}`);
    
    const response = await API.delete(`/profiles/${profileId}`);
    
    console.log('✅ Profile deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting profile ${profileId}:`, error);
    throw error;
  }
};

// Note: Privacy and stats endpoints have been removed in simplified version
// Use the basic profile update route for any profile modifications

// Example Profile Data Structure for reference (simplified version):
export const exampleProfileData = {
  name: "John Doe",
  email: "john.doe@example.com",
  bio: "Passionate about making communities better through technology.",
  location: {
    country: "India",
    state: "Maharashtra", 
    city: "Mumbai",
    address: "123 Marine Drive"
  },
  phone: "+91 98765 43210"
};

// Sample JSON for profile creation request:
export const sampleCreateRequest = {
  name: "Jane Smith",
  email: "jane.smith@email.com",
  bio: "Full-stack developer with 3+ years experience",
  location: {
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    address: "456 Connaught Place"
  },
  phone: "+91 87654 32109"
};

// Sample JSON response after profile creation:
export const sampleCreateResponse = {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    user: "507f1f77bcf86cd799439010",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    bio: "Full-stack developer with 3+ years experience",
    location: {
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      address: "456 Connaught Place"
    },
    phone: "+91 87654 32109",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z"
  },
  message: "Profile created successfully"
};

// Export all functions as default object and individual exports
export default {
  getAllProfiles,
  getProfileById,
  getCurrentUserProfile,
  createProfile,
  updateProfile,
  updateCurrentUserProfile,
  deleteProfile,
  exampleProfileData,
  sampleCreateRequest,
  sampleCreateResponse
};
