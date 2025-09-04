import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaint } from '../../../context/ComplaintContext';
import './LodgeComplaint.css';

const LodgeComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    location: '',
    description: '',
    files: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animateFields, setAnimateFields] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const { createComplaint } = useComplaint();

  useEffect(() => {
    setTimeout(() => setAnimateFields(true), 100);
  }, []);

  // Keep these in sync with backend accepted values
  const categories = [
    { value: 'Roads & Infrastructure', label: '🛣️ Roads & Infrastructure' },
    { value: 'Water Supply', label: '💧 Water Supply' },
    { value: 'Electricity', label: '⚡ Electricity' },
    { value: 'Sanitation', label: '🧹 Sanitation' },
    { value: 'Public Transport', label: '🚌 Public Transport' },
    { value: 'Healthcare', label: '🏥 Healthcare' },
    { value: 'Education', label: '📚 Education' },
    { value: 'Environment', label: '🌿 Environment' },
    { value: 'Safety & Security', label: '🔒 Safety & Security' },
    { value: 'Other', label: '📌 Other' }
  ];

  const priorities = [
    { value: 'Low', label: '🟢 Low' },
    { value: 'Medium', label: '🟡 Medium' },
    { value: 'High', label: '🟠 High' },
    { value: 'Critical', label: '🔴 Critical' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required ✨';
    if (!formData.category) newErrors.category = 'Please select a category 💫';
    if (!formData.priority) newErrors.priority = 'Priority level is needed 🌟';
    if (!formData.location.trim()) newErrors.location = 'Location details required 📍';
    if (!formData.description.trim()) newErrors.description = 'Description is required 📝';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + Math.random() * 22 + 8);
      });
    }, 180);
    return () => clearInterval(interval);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    // Require auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError('Please sign in to submit a complaint.');
      navigate('/signin');
      return;
    }

    setLoading(true);
    const cleanup = simulateProgress();

    try {
      // NOTE: This example sends only metadata (title, description, etc.)
      // If you also need to upload files to the backend, you’ll add FormData + backend handler.
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        location: formData.location.trim()
      };

      const result = await createComplaint(payload);
      
      if (result.success) {
        // Success flow
        setProgress(100);
        setShowSuccess(true);

        // Navigate to dashboard after showing success
        setTimeout(() => {
          setShowSuccess(false);
          clearForm();
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to submit complaint');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit complaint';
      setApiError(message);
    } finally {
      cleanup();
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
    setApiError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData(d => ({ ...d, files }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(d => ({ ...d, files }));
  };

  const clearForm = () => {
    setFormData({
      title: '',
      category: '',
      priority: 'Medium',
      location: '',
      description: '',
      files: []
    });
    setErrors({});
    setApiError('');
    setProgress(0);
  };

  return (
    <div className="lodgecomplaint-page">
      {/* Progress Bar */}
      <div className={`progress-container ${loading ? 'active' : ''}`}>
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          <div className="progress-shimmer"></div>
        </div>
      </div>

      {/* Floating Background Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Header Section */}
      <div className="page-header">
        <div className="header-decoration">
          <span className="decoration-star">✨</span>
          <span className="decoration-heart">💖</span>
          <span className="decoration-star">✨</span>
        </div>
        <h1 className="page-title">Lodge a New Complaint</h1>
        <p className="page-subtitle">Help us make your community better, one report at a time 🌟</p>
      </div>

      {/* API error (auth/validation/server) */}
      {apiError && (
        <div className="error-banner">
          <span>⚠️ {apiError}</span>
        </div>
      )}

      {/* Main Form */}
      <form className="lodgecomplaint-form" onSubmit={handleSubmit}>
        <div className="form-container">

          {/* Title */}
          <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.1s' }}>
            <label className="field-label">
              <span className="label-icon">📝</span>
              <span className="label-text">Complaint Title</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of your concern..."
                className={`form-input ${errors.title ? 'error' : ''}`}
                required
              />
              <div className="input-decoration"></div>
            </div>
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {/* Category + Priority */}
          <div className="form-row">
            <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <label className="field-label">
                <span className="label-icon">🏷️</span>
                <span className="label-text">Category</span>
                <span className="required-star">*</span>
              </label>
              <div className="select-container">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-select ${errors.category ? 'error' : ''}`}
                  required
                >
                  <option value="">Choose a category...</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.3s' }}>
              <label className="field-label">
                <span className="label-icon">⚡</span>
                <span className="label-text">Priority</span>
                <span className="required-star">*</span>
              </label>
              <div className="select-container">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`form-select ${errors.priority ? 'error' : ''}`}
                  required
                >
                  <option value="">Select priority...</option>
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
              {errors.priority && <div className="error-message">{errors.priority}</div>}
            </div>
          </div>

          {/* Location */}
          <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
            <label className="field-label">
              <span className="label-icon">📍</span>
              <span className="label-text">Location</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Specific address or area..."
                className={`form-input ${errors.location ? 'error' : ''}`}
                required
              />
              <div className="input-decoration"></div>
            </div>
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>

          {/* Description */}
          <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.5s' }}>
            <label className="field-label">
              <span className="label-icon">💬</span>
              <span className="label-text">Description</span>
              <span className="required-star">*</span>
            </label>
            <div className="textarea-container">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue..."
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                rows="4"
                required
              />
              <div className="input-decoration"></div>
            </div>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          {/* File Upload (UI only in this version) */}
          <div className={`form-field-wrapper ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.6s' }}>
            <label className="field-label">
              <span className="label-icon">📎</span>
              <span className="label-text">Supporting Files</span>
              <span className="optional-text">(Optional)</span>
            </label>
            <div
              className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <span className="primary-text">Drop files here or click to browse</span>
                <span className="secondary-text">Supports images and PDFs (Max 10MB each)</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              {formData.files.length > 0 && (
                <div className="file-preview">
                  <span className="file-count">📄 {formData.files.length} file(s) selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`form-actions ${animateFields ? 'animate-in' : ''}`} style={{ animationDelay: '0.7s' }}>
            <button
              type="button"
              onClick={clearForm}
              className="btn btn-secondary"
              disabled={loading}
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Clear Form</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span className="btn-text">Submitting...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Submit Complaint</span>
                </>
              )}
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <div className={`success-modal ${showSuccess ? 'active' : ''}`}>
        <div className="success-content">
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-checkmark">
                <svg viewBox="0 0 52 52" className="checkmark-svg">
                  <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                  <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="success-title">Complaint Submitted! 🎉</h2>
          <p className="success-message">
            Thank you for making your community better! We'll review your complaint and get back to you soon. ✨
          </p>
          <div className="success-details">
            <span className="detail-item">📧 Confirmation email sent</span>
            <span className="detail-item">⏰ Response within 24-48 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LodgeComplaint;
