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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    skills: []
  });
  
  // Skills input state
  const [skillInput, setSkillInput] = useState('');

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getCurrentUserProfile();
      
      if (response === null) {
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
          location: response.data.location || '',
          skills: response.data.skills || []
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (profile) {
        // Update existing profile
        console.log('🔄 Updating existing profile:', profile._id);
        response = await updateProfile(profile._id, formData);
      } else {
        // Create new profile
        console.log('🔄 Creating new profile');
        response = await createProfile(formData);
      }

      console.log('✅ Profile saved successfully:', response);
      
      setProfile(response.data);
      setSuccess(profile ? 'Profile updated successfully!' : 'Profile created successfully!');
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
        location: profile.location || '',
        skills: profile.skills || []
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
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
              <p>{profile.location || 'No location provided'}</p>
            </div>
            
            <div className="profile-field">
              <label>Skills</label>
              <div className="skills-display">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills listed</p>
                )}
              </div>
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

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, State, Country"
              />
            </div>

            <div className="form-group">
              <label>Skills</label>
              <div className="skills-input">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., JavaScript)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill(e);
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleAddSkill}
                >
                  Add
                </button>
              </div>
              
              <div className="skills-list">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag editable">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
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
