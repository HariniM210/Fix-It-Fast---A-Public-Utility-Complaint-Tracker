import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useComplaint } from '../../../context/ComplaintContext'
import './Dashboard.css'

const Dashboard = () => {
  // Get user + stats from context
  const { user } = useAuth()
  const { complaints, stats, loading } = useComplaint()

  const statCards = [
    { label: 'Total Complaints', value: stats?.total || 0, color: '#a78bfa', icon: '📝' },
    { label: 'Pending', value: stats?.pending || 0, color: '#fbbf24', icon: '⏳' },
    { label: 'In Progress', value: stats?.inProgress || 0, color: '#60a5fa', icon: '🚧' },
    { label: 'Resolved', value: stats?.resolved || 0, color: '#34d399', icon: '✅' }
  ]

  return (
    <div className="dashboard-main">
      {/* Floating Background Blobs */}
      <div className="floating-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <div className="dashboard-container">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <h1 className="hero-title">
            Welcome, <span className="dashboard-username">{user?.name || 'User'}</span>! ✨
          </h1>
          <p className="dashboard-subhead">
            Quick stats about your civic engagement at a glance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          {statCards.map((card, index) => (
            <div 
              key={card.label} 
              className="dashboard-card glass-card"
              style={{ 
                '--card-color': card.color,
                '--animation-delay': `${index * 0.1}s`
              }}
            >
              <div className="card-content">
                <span className="card-icon floating-icon">{card.icon}</span>
                <div className="card-info">
                  <div className="card-value">{card.value}</div>
                  <div className="card-label">{card.label}</div>
                </div>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>

        {/* Recent Complaints Section */}
        <div className="dashboard-complaints-section">
          <h2 className="section-title">Your Recent Complaints</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your complaints...</p>
            </div>
          ) : complaints && complaints.length > 0 ? (
            <div className="complaints-grid">
              {complaints.slice(0, 6).map((complaint, index) => (
                <div 
                  key={complaint._id || complaint.id || index} 
                  className="complaint-card glass-card"
                  style={{ '--animation-delay': `${index * 0.1}s` }}
                >
                  <div className="complaint-header">
                    <h3 className="complaint-title">{complaint.title}</h3>
                    <span className={`status-badge status-${complaint.status?.toLowerCase().replace(' ', '-')}`}>
                      {complaint.status}
                    </span>
                  </div>
                  
                  <div className="complaint-details">
                    <p className="complaint-description">
                      {complaint.description?.length > 100 
                        ? complaint.description.substring(0, 100) + '...'
                        : complaint.description
                      }
                    </p>
                    
                    <div className="complaint-meta">
                      <span className="complaint-location">📍 {complaint.location}</span>
                      <span className="complaint-category">🏷️ {complaint.category}</span>
                      <span className="complaint-date">
                        📅 {new Date(complaint.createdAt || complaint.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {complaint.likes && complaint.likes.length > 0 && (
                    <div className="complaint-likes">
                      ❤️ {complaint.likes.length} likes
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-complaints">
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No complaints yet</h3>
                <p>You haven't submitted any complaints. Ready to make your community better?</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="dashboard-cta-section">
          <h2 className="cta-title">Need to report a new issue?</h2>
          <a className="dashboard-cta-btn" href="/lodge-complaint">
            <span className="btn-text">Lodge a Complaint</span>
            <div className="btn-ripple"></div>
            <div className="btn-glow"></div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard