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
    
    const response = await API.get('/profiles/me');
    
    console.log('✅ Current user profile fetched successfully:', response.data);
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
 * Create a new profile
 * @param {Object} profileData - The profile data to create
 * @returns {Promise} API response with created profile
 */
export const createProfile = async (profileData) => {
  try {
    console.log('📝 Creating new profile:', { ...profileData, email: '[PROTECTED]' });
    
    const response = await API.post('/profiles', profileData);
    
    console.log('✅ Profile created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
};

// Note: The /profiles/me PUT route has been replaced with create/update by ID
// Use createProfile for new profiles or updateProfile with profile ID for updates

/**
 * Update a specific profile by ID
 * @param {string} profileId - The profile ID to update
 * @param {Object} profileData - The updated profile data
 * @returns {Promise} API response with updated profile
 */
export const updateProfile = async (profileId, profileData) => {
  try {
    console.log(`📝 Updating profile ${profileId}:`, { ...profileData, email: '[PROTECTED]' });
    
    const response = await API.put(`/profiles/${profileId}`, profileData);
    
    console.log('✅ Profile updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating profile ${profileId}:`, error);
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
  location: "Mumbai, Maharashtra, India",
  skills: ["JavaScript", "React", "Node.js", "MongoDB", "Problem Solving"]
};

// Sample JSON for profile creation request:
export const sampleCreateRequest = {
  name: "Jane Smith",
  email: "jane.smith@email.com",
  bio: "Full-stack developer with 3+ years experience",
  location: "Delhi, India",
  skills: ["Python", "Django", "PostgreSQL", "Vue.js"]
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
    location: "Delhi, India",
    skills: ["Python", "Django", "PostgreSQL", "Vue.js"],
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
  deleteProfile,
  exampleProfileData,
  sampleCreateRequest,
  sampleCreateResponse
};
