import React, { useEffect, useState } from 'react'
import { useComplaint } from '../../../context/ComplaintContext'
import './CommunityFeed.css'

const CommunityFeed = () => {
  const { communityComplaints } = useComplaint();
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Trigger staggered animation after component mounts
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase().replace(' ', '-')) {
      case 'pending': return '⏳';
      case 'in-progress': return '⚙️';
      case 'resolved': return '✅';
      default: return '📋';
    }
  };

  const getRandomDelay = (index) => {
    return `${index * 0.1}s`;
  };

  return (
    <div className="communityfeed-page">
      <div className="feed-header">
        <div className="header-decoration"></div>
        <h1>Community Feed</h1>
        <p>See what your neighbors are reporting and support important issues!</p>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{communityComplaints?.length || 0}</span>
            <span className="stat-label">Active Issues</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{communityComplaints?.filter(c => c.status === 'Resolved').length || 0}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="feed-list">
        {!communityComplaints || communityComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏘️</div>
            <h3>No Community Issues Yet</h3>
            <p>Be the first to report an issue in your neighborhood!</p>
          </div>
        ) : (
          communityComplaints.map((item, index) => (
            <div
              className={`feed-card ${animateCards ? 'animate-in' : ''}`}
              key={item.id}
              style={{
                animationDelay: getRandomDelay(index)
              }}
            >
              <div className="card-glow"></div>
              <div className="feed-card-header">
                <h3>{item.title}</h3>
                <div className={`status status-${item.status.toLowerCase().replace(' ', '-')}`}>
                  <span className="status-icon">{getStatusIcon(item.status)}</span>
                  <span className="status-text">{item.status}</span>
                </div>
              </div>
              
              <p className="feed-card-desc">{item.description}</p>
              
              <div className="feed-card-meta">
                <div className="meta-item location">
                  <span className="meta-icon">📍</span>
                  <span className="meta-text">{item.location}</span>
                </div>
                <div className="meta-item likes">
                  <span className="meta-icon">👍</span>
                  <span className="meta-text">{item.likes || 0} Supports</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="support-btn">
                  <span>💙</span>
                  Support This Issue
                </button>
                <button className="share-btn">
                  <span>🔗</span>
                  Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommunityFeed