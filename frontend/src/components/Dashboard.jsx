import React, { useState, useEffect } from 'react';
import { dashboardAPI, complaintsAPI, apiHelpers } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await dashboardAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorInfo = apiHelpers.handleError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h3>❌ Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="no-data-message">
          <h3>📊 No Dashboard Data</h3>
          <p>Unable to load dashboard statistics.</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const { user, statistics, statusBreakdown, categoryBreakdown, priorityBreakdown, recentComplaints } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>👋 Welcome back, {user.name}!</h1>
          <p className="user-location">📍 {user.location}</p>
        </div>
        <button 
          onClick={refreshDashboard} 
          className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{statistics.totalComplaints}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{statistics.pendingComplaints}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{statistics.inProgressComplaints}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{statistics.resolvedComplaints}</h3>
            <p>Resolved</p>
          </div>
        </div>

        {statistics.rejectedComplaints > 0 && (
          <div className="stat-card rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{statistics.rejectedComplaints}</h3>
              <p>Rejected</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts and Breakdowns */}
      <div className="dashboard-charts">
        {/* Status Breakdown */}
        <div className="chart-card">
          <h3>📊 Status Breakdown</h3>
          <div className="breakdown-list">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="breakdown-item">
                <span className={`status-indicator ${status.toLowerCase().replace(' ', '-')}`}></span>
                <span className="breakdown-label">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </span>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <h3>🏷️ Categories</h3>
          <div className="breakdown-list">
            {Object.entries(categoryBreakdown).length === 0 ? (
              <p className="no-data">No complaints yet</p>
            ) : (
              Object.entries(categoryBreakdown).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="category-indicator"></span>
                  <span className="breakdown-label">{category}</span>
                  <span className="breakdown-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="chart-card">
          <h3>⚡ Priority Levels</h3>
          <div className="breakdown-list">
            {Object.entries(priorityBreakdown).length === 0 ? (
              <p className="no-data">No complaints yet</p>
            ) : (
              Object.entries(priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="breakdown-item">
                  <span className={`priority-indicator ${priority.toLowerCase()}`}></span>
                  <span className="breakdown-label">{priority}</span>
                  <span className="breakdown-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="recent-complaints">
        <div className="section-header">
          <h3>🕐 Recent Complaints</h3>
          {statistics.totalComplaints > 5 && (
            <span className="view-all-link">View All ({statistics.totalComplaints})</span>
          )}
        </div>
        
        {recentComplaints.length === 0 ? (
          <div className="no-complaints">
            <p>📝 No complaints yet. Lodge your first complaint to get started!</p>
            <button className="lodge-complaint-button" onClick={() => {
              // Navigate to complaint form - adjust based on your routing
              window.location.href = '/lodge-complaint';
            }}>
              Lodge Complaint
            </button>
          </div>
        ) : (
          <div className="complaints-list">
            {recentComplaints.map((complaint) => (
              <div key={complaint._id} className="complaint-item">
                <div className="complaint-header">
                  <h4>{complaint.title}</h4>
                  <span className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="complaint-description">{complaint.description}</p>
                <div className="complaint-meta">
                  <span className="category">{complaint.category}</span>
                  <span className={`priority ${complaint.priority.toLowerCase()}`}>
                    {complaint.priority} Priority
                  </span>
                  <span className="location">📍 {complaint.location}</span>
                  <span className="date">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={() => {
              // Navigate to complaint form - adjust based on your routing
              window.location.href = '/lodge-complaint';
            }}
          >
            📝 Lodge New Complaint
          </button>
          <button 
            className="action-button secondary"
            onClick={() => {
              // Navigate to complaints list - adjust based on your routing
              window.location.href = '/my-complaints';
            }}
          >
            📋 View All Complaints
          </button>
          <button 
            className="action-button secondary"
            onClick={() => {
              // Navigate to profile - adjust based on your routing
              window.location.href = '/profile';
            }}
          >
            👤 Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
