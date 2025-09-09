import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, complaintsAPI, apiHelpers } from '../services/api';
import { useComplaint } from '../context/ComplaintContext';
import './Dashboard.css';

const DashboardWithUpdates = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get complaint context to listen for updates
  const { complaints, createComplaint } = useComplaint();

  // Memoized fetch function to avoid infinite re-renders
  const fetchDashboardData = useCallback(async () => {
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
  }, []);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard when complaints change
  useEffect(() => {
    if (complaints && complaints.length > 0) {
      // Small delay to ensure backend has processed the complaint
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [complaints.length, fetchDashboardData]);

  // Enhanced complaint submission that refreshes dashboard
  const handleCreateComplaint = async (complaintData) => {
    try {
      // Create complaint using context
      const result = await createComplaint(complaintData);
      
      if (result.success) {
        // Show success message
        console.log('✅ Complaint created successfully');
        
        // Refresh dashboard after successful creation
        setTimeout(() => {
          refreshDashboard();
        }, 500);
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  };

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
        <div className="header-actions">
          <button 
            onClick={refreshDashboard} 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <small>Live Updates</small>
          </div>
        </div>
      </div>

      {/* Statistics Overview with Animation */}
      <div className="stats-overview">
        <div className="stat-card total" data-count={statistics.totalComplaints}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{statistics.totalComplaints}</h3>
            <p>Total Complaints</p>
            {statistics.totalComplaints > 0 && (
              <small>Updated automatically</small>
            )}
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

      {/* Progress Ring for Resolution Rate */}
      {statistics.totalComplaints > 0 && (
        <div className="resolution-progress">
          <div className="progress-card">
            <h3>📈 Resolution Rate</h3>
            <div className="progress-ring">
              <div className="progress-content">
                <span className="progress-percentage">
                  {Math.round((statistics.resolvedComplaints / statistics.totalComplaints) * 100)}%
                </span>
                <small>Resolved</small>
              </div>
            </div>
            <p>{statistics.resolvedComplaints} of {statistics.totalComplaints} complaints resolved</p>
          </div>
        </div>
      )}

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
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ 
                      width: statistics.totalComplaints > 0 
                        ? `${(count / statistics.totalComplaints) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
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
              Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a) // Sort by count descending
                .map(([category, count]) => (
                  <div key={category} className="breakdown-item">
                    <span className="category-indicator"></span>
                    <span className="breakdown-label">{category}</span>
                    <span className="breakdown-count">{count}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: statistics.totalComplaints > 0 
                            ? `${(count / statistics.totalComplaints) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
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
              ['Critical', 'High', 'Medium', 'Low']
                .filter(priority => priorityBreakdown[priority] > 0)
                .map(priority => (
                  <div key={priority} className="breakdown-item">
                    <span className={`priority-indicator ${priority.toLowerCase()}`}></span>
                    <span className="breakdown-label">{priority}</span>
                    <span className="breakdown-count">{priorityBreakdown[priority]}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: statistics.totalComplaints > 0 
                            ? `${(priorityBreakdown[priority] / statistics.totalComplaints) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints with Real-time Indicator */}
      <div className="recent-complaints">
        <div className="section-header">
          <h3>🕐 Recent Complaints</h3>
          <div className="section-actions">
            {statistics.totalComplaints > 5 && (
              <span className="view-all-link">View All ({statistics.totalComplaints})</span>
            )}
            <div className="auto-refresh-indicator">
              <span className="pulse-dot"></span>
              <small>Auto-refresh enabled</small>
            </div>
          </div>
        </div>
        
        {recentComplaints.length === 0 ? (
          <div className="no-complaints">
            <p>📝 No complaints yet. Lodge your first complaint to get started!</p>
            <button 
              className="lodge-complaint-button" 
              onClick={() => {
                // You can pass the handleCreateComplaint function to your complaint form
                // or navigate to complaint form page
                window.location.href = '/lodge-complaint';
              }}
            >
              Lodge Complaint
            </button>
          </div>
        ) : (
          <div className="complaints-list">
            {recentComplaints.map((complaint, index) => (
              <div key={complaint._id} className="complaint-item" data-index={index}>
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
            📋 View All Complaints ({statistics.totalComplaints})
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
          <button 
            className="action-button secondary"
            onClick={refreshDashboard}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Dashboard Footer Info */}
      <div className="dashboard-footer">
        <p>
          <span className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <span className="auto-refresh-info">
            • Dashboard auto-refreshes when you create new complaints
          </span>
        </p>
      </div>
    </div>
  );
};

export default DashboardWithUpdates;
