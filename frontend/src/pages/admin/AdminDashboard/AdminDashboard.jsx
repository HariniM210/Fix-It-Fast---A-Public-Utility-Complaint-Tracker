import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaint } from '../../../context/ComplaintContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaint();

  // Calculate dashboard stats from actual complaints data
  const dashboardStats = {
    totalComplaints: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    newToday: complaints.filter(c => {
      const today = new Date().toDateString();
      const complaintDate = new Date(c.date).toDateString();
      return today === complaintDate;
    }).length
  };

  // Button click handlers
  const handleViewAllComplaints = () => {
    navigate('/admin/complaints');
  };

  const handleAssignTasks = () => {
    // For now, show available complaints that need assignment
    const pendingComplaints = complaints.filter(c => c.status === 'Pending');
    if (pendingComplaints.length === 0) {
      alert('✅ No pending complaints to assign!');
    } else {
      alert(`📋 ${pendingComplaints.length} complaints are pending assignment. Redirecting to manage complaints...`);
      navigate('/admin/complaints');
    }
  };

  const handleGenerateReports = () => {
    navigate('/admin/reports');
  };

  const handleManageUsers = () => {
    // For now, show user management info
     navigate('/admin/users');
  };

  return (
    <main className="admin-dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage complaints and monitor community issues</p>
      </header>

      {/* New Today Section */}
      <section className="new-today-section">
        <div className="new-today-card">
          <div className="today-content">
            <span className="today-label">New Today</span>
            <span className="today-number">{dashboardStats.newToday}</span>
          </div>
        </div>
      </section>

      <section className="admin-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total Complaints</h3>
            <span className="stat-number">{dashboardStats.totalComplaints}</span>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <span className="stat-number">{dashboardStats.pending}</span>
          </div>
          <div className="stat-card progress">
            <h3>In Progress</h3>
            <span className="stat-number">{dashboardStats.inProgress}</span>
          </div>
          <div className="stat-card resolved">
            <h3>Resolved</h3>
            <span className="stat-number">{dashboardStats.resolved}</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Section - Now Functional */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={handleViewAllComplaints}
          >
            View All Complaints
          </button>
          <button 
            className="btn-secondary"
            onClick={handleAssignTasks}
          >
            Assign Tasks
          </button>
          <button 
            className="btn-secondary"
            onClick={handleGenerateReports}
          >
            Generate Reports
          </button>
          <button 
            className="btn-secondary"
            onClick={handleManageUsers}
          >
            Manage Users
          </button>
        </div>
      </section>

      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {complaints.slice(0, 3).map((complaint, index) => (
            <div key={complaint.id} className="activity-item">
              <div className="activity-icon">
                {complaint.status === 'Resolved' ? '✅' : 
                 complaint.status === 'In Progress' ? '🔄' : '📝'}
              </div>
              <div className="activity-content">
                <h4>{complaint.title}</h4>
                <p>{complaint.location} - {complaint.status}</p>
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-content">
                <h4>No recent activity</h4>
                <p>Complaint activities will appear here</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="priority-alerts">
        <h2>Priority Alerts</h2>
        <div className="alerts-list">
          {complaints
            .filter(c => c.priority === 'High' || c.priority === 'Urgent')
            .slice(0, 2)
            .map((complaint) => (
              <div key={complaint.id} className={`alert-item ${complaint.priority?.toLowerCase()}`}>
                <h4>{complaint.priority} Priority: {complaint.title}</h4>
                <p>{complaint.location} - {complaint.likes || 0} likes - Requires attention</p>
              </div>
            ))}
          {complaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length === 0 && (
            <div className="alert-item medium">
              <h4>No Priority Alerts</h4>
              <p>All complaints are being handled normally</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
