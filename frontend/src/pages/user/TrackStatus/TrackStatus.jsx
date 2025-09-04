import React, { useState, useEffect } from 'react';
import { useComplaint } from '../../../context/ComplaintContext';
import './TrackStatus.css';

const TrackStatus = () => {
  const { complaints, loading } = useComplaint();
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Trigger staggered animation after component mounts
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase().replace(' ', '-')) {
      case 'pending': return '⏳';
      case 'in-progress': return '🔄';
      case 'resolved': return '✅';
      default: return '📋';
    }
  };

  const getRandomDelay = (index) => {
    return `${index * 0.15}s`;
  };

  if (loading) {
    return (
      <div className="trackstatus-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">✨ Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trackstatus-page">
      <div className="page-header">
        <div className="header-decoration">
          <span className="decoration-dot"></span>
          <span className="decoration-dot"></span>
          <span className="decoration-dot"></span>
        </div>
        <h1 className="page-title">💖 Track Your Complaints</h1>
        <p className="page-subtitle">Stay updated on the progress of your reports ✨</p>
        
        {complaints.length > 0 && (
          <div className="complaints-summary">
            <div className="summary-item">
              <span className="summary-icon">📊</span>
              <span className="summary-text">Total: {complaints.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏳</span>
              <span className="summary-text">Pending: {complaints.filter(c => c.status === 'Pending').length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">✅</span>
              <span className="summary-text">Resolved: {complaints.filter(c => c.status === 'Resolved').length}</span>
            </div>
          </div>
        )}
      </div>
      
      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌸</div>
          <h3 className="empty-title">No Complaints Yet</h3>
          <p className="empty-subtitle">Ready to make your community better?</p>
          <div className="empty-cta">
            <span className="cta-text">Go ahead and lodge your first complaint! </span>
            <span className="cta-emoji">💪✨</span>
          </div>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map((complaint, index) => (
            <div
              key={complaint.id}
              className={`complaint-card status-${complaint.status.toLowerCase().replace(' ', '-')} ${animateCards ? 'animate-in' : ''}`}
              style={{
                animationDelay: getRandomDelay(index)
              }}
            >
              <div className="card-glow"></div>
              
              <div className="card-header">
                <div className="title-section">
                  <span className="complaint-icon">💬</span>
                  <h3 className="complaint-title">{complaint.title}</h3>
                </div>
                <div className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                  <span className="status-icon">{getStatusIcon(complaint.status)}</span>
                  <span className="status-text">{complaint.status}</span>
                  <div className="status-glow"></div>
                </div>
              </div>

              <div className="card-content">
                <div className="description-section">
                  <span className="content-icon">📝</span>
                  <p className="complaint-description">{complaint.description}</p>
                </div>
              </div>

              <div className="card-footer">
                <div className="footer-item location">
                  <span className="footer-icon">📍</span>
                  <span className="footer-text">{complaint.location}</span>
                </div>
                <div className="footer-item date">
                  <span className="footer-icon">🗓️</span>
                  <span className="footer-text">{new Date(complaint.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="action-btn primary">
                  <span className="btn-icon">👁️</span>
                  <span>View Details</span>
                </button>
                <button className="action-btn secondary">
                  <span className="btn-icon">🔄</span>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackStatus;