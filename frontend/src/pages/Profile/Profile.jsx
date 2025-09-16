// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCurrentUserProfile, 
  createProfile, 
  updateProfile 
} from '../../services/profileService';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state with nested location structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: {
      country: '',
      state: '',
      city: '',
      address: ''
    },
    phone: ''
  });

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getCurrentUserProfile();
      
      // Handle both null response and response with null data
      if (response === null || !response.data || response.data === null) {
        // No profile exists, show create form
        console.log('🔄 No profile found, showing create form');
        setProfile(null);
        setIsEditing(true);
        // Pre-fill with user data if available
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || ''
          }));
        }
      } else {
        // Profile exists, load it
        console.log('✅ Profile loaded:', response);
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          bio: response.data.bio || '',
          location: {
            country: response.data.location?.country || '',
            state: response.data.location?.state || '',
            city: response.data.location?.city || '',
            address: response.data.location?.address || ''
          },
          phone: response.data.phone || ''
        });
      }
    } catch (error) {
      // Only real errors reach here now (not 404)
      console.error('❌ Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      // Always use createProfile which handles both create and update via upsert
      console.log('🔄 Saving profile');
      response = await createProfile(formData);

      console.log('✅ Profile saved successfully:', response);
      
      setProfile(response.data);
      // Use the message from the backend response
      setSuccess(response.message || (profile ? 'Profile updated successfully!' : 'Profile created successfully!'));
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      // Reset form to current profile data
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location: {
          country: profile.location?.country || '',
          state: profile.location?.state || '',
          city: profile.location?.city || '',
          address: profile.location?.address || ''
        },
        phone: profile.phone || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Helper function to format location for display
  const formatLocation = (location) => {
    if (!location) return 'No location provided';
    
    const parts = [location.address, location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No location provided';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {profile && !isEditing && (
          <button 
            className="btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {/* Profile Display or Form */}
      {!isEditing && profile ? (
        // Display mode
        <div className="profile-display">
          <div className="profile-card">
            <div className="profile-field">
              <label>Name</label>
              <p>{profile.name}</p>
            </div>
            
            <div className="profile-field">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            
            <div className="profile-field">
              <label>Bio</label>
              <p>{profile.bio || 'No bio provided'}</p>
            </div>
            
            <div className="profile-field">
              <label>Location</label>
              <p>{formatLocation(profile.location)}</p>
            </div>
            
            <div className="profile-field">
              <label>Phone Number</label>
              <p>{profile.phone || 'No phone number provided'}</p>
            </div>
          </div>
        </div>
      ) : (
        // Edit/Create mode
        <div className="profile-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location Fields */}
            <fieldset className="location-fieldset">
              <legend>Location</legend>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="e.g., India"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="e.g., Tamil Nadu"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Chennai"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Gandhi Street"
                  />
                </div>
              </div>
            </fieldset>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number (e.g., +91 98765 43210)"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
              </button>
              
              {profile && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
