import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    bio: user?.bio || 'Passionate about making my community better!'
  });
  
  const toggleEdit = () => {
    if (editing) {
      // Reset form data if canceling
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '9876543210',
        bio: user?.bio || 'Passionate about making my community better!'
      });
    }
    setEditing((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving profile data:', formData);
    alert('Profile updated successfully!');
    toggleEdit();
  };

  return (
    <div className="profile-page">
      {/* Floating Background Elements */}
      <div className="floating-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="header-decoration">
            <span className="decoration-star">✨</span>
            <span className="decoration-heart">💖</span>
            <span className="decoration-star">✨</span>
          </div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and preferences</p>
        </div>
        
        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar-circle">
                <span className="avatar-text">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="avatar-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </div>
            </div>
            <div className="user-info">
              <h2 className="user-name">{user?.name || 'User'}</h2>
              <p className="user-role">{user?.role === 'admin' ? '👑 Administrator' : '🏠 Community Member'}</p>
            </div>
          </div>
          
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="profile-form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-icon">👤</span>
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">📧</span>
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="phone" className="form-label">
                  <span className="label-icon">📱</span>
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="profile-form-group bio-group">
                <label htmlFor="bio" className="form-label">
                  <span className="label-icon">💭</span>
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            
            <div className="profile-form-buttons">
              {editing ? (
                <div className="button-group">
                  <button 
                    type="button"
                    className="btn btn-success" 
                    onClick={handleSave}
                  >
                    <span className="btn-icon">💾</span>
                    <span className="btn-text">Save Changes</span>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    onClick={toggleEdit}
                  >
                    <span className="btn-icon">✖️</span>
                    <span className="btn-text">Cancel</span>
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={toggleEdit}
                >
                  <span className="btn-icon">✏️</span>
                  <span className="btn-text">Edit Profile</span>
                </button>
              )}
            </div>
          </form>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-icon">📝</span>
              <div className="stat-info">
                <span className="stat-number">12</span>
                <span className="stat-label">Complaints Filed</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-number">8</span>
                <span className="stat-label">Issues Resolved</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👍</span>
              <div className="stat-info">
                <span className="stat-number">45</span>
                <span className="stat-label">Community Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
