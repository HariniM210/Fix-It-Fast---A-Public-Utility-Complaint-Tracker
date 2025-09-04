import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './ManageUsers.css';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock user data - in real app, this would come from your backend
  const mockUsers = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@fixitfast.com',
      role: 'admin',
      status: 'active',
      joinDate: '2025-01-15',
      lastLogin: '2025-08-22',
      complaintsCount: 0,
      location: 'Main Office'
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'user@fixitfast.com',
      role: 'user',
      status: 'active',
      joinDate: '2025-02-10',
      lastLogin: '2025-08-21',
      complaintsCount: 5,
      location: 'Gandhi Street'
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2025-03-05',
      lastLogin: '2025-08-20',
      complaintsCount: 3,
      location: 'Main Road'
    },
    {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2025-01-20',
      lastLogin: '2025-07-15',
      complaintsCount: 8,
      location: 'Station Road'
    },
    {
      id: 5,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'moderator',
      status: 'active',
      joinDate: '2025-02-01',
      lastLogin: '2025-08-22',
      complaintsCount: 2,
      location: 'MG Road'
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch users
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      alert('❌ You cannot change your own role!');
      return;
    }

    setUpdatingUserId(userId);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      );

      setUsers(updatedUsers);
      alert(`✅ User role updated to "${newRole}" successfully!`);

    } catch (error) {
      alert('❌ Failed to update user role. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (userId) => {
    if (userId === currentUser?.id) {
      alert('❌ You cannot change your own status!');
      return;
    }

    setUpdatingUserId(userId);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedUsers = users.map(user =>
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      );

      setUsers(updatedUsers);
      alert('✅ User status updated successfully!');

    } catch (error) {
      alert('❌ Failed to update user status. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'moderator': return '#ffc107';
      case 'user': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#28a745' : '#6c757d';
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    moderators: users.filter(u => u.role === 'moderator').length
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h1>👥 Manage Users</h1>
        <p>View and manage all registered users, roles, and activities</p>
      </div>

      {/* User Statistics */}
      <div className="user-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{userStats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{userStats.active}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          <div className="stat-card inactive">
            <div className="stat-icon">⏸️</div>
            <div className="stat-info">
              <div className="stat-number">{userStats.inactive}</div>
              <div className="stat-label">Inactive Users</div>
            </div>
          </div>
          <div className="stat-card admins">
            <div className="stat-icon">👑</div>
            <div className="stat-info">
              <div className="stat-number">{userStats.admins}</div>
              <div className="stat-label">Administrators</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search users by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="moderator">Moderators</option>
            <option value="user">Regular Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h3>All Registered Users</h3>
          <p>Click on any user to view detailed information</p>
        </div>
        
        <div className="users-table">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No Users Found</h3>
              <p>No users match your current search criteria.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Complaints</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.id === currentUser?.id ? 'current-user' : ''}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.name} 
                            {user.id === currentUser?.id && <span className="you-badge">You</span>}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUserId === user.id || user.id === currentUser?.id}
                        className="role-select"
                        style={{ color: getRoleColor(user.role) }}
                      >
                        <option value="user">👤 User</option>
                        <option value="moderator">👮 Moderator</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={`status-badge ${user.status}`}
                        style={{ backgroundColor: getStatusColor(user.status) }}
                        onClick={() => handleStatusToggle(user.id)}
                        disabled={updatingUserId === user.id || user.id === currentUser?.id}
                        title="Click to toggle status"
                      >
                        {user.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                      </button>
                    </td>
                    <td>
                      <span className="complaints-count">
                        📝 {user.complaintsCount}
                      </span>
                    </td>
                    <td>
                      <span className="last-login">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-info"
                          onClick={() => openUserModal(user)}
                        >
                          👁️ View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button className="modal-close" onClick={closeUserModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-profile">
                <div className="profile-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <div className="profile-badges">
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                    >
                      {selectedUser.role === 'admin' ? '👑' : selectedUser.role === 'moderator' ? '👮' : '👤'} 
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                    >
                      {selectedUser.status === 'active' ? '✅' : '⏸️'} {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="user-activity">
                <h4>📊 Activity Report</h4>
                <div className="activity-grid">
                  <div className="activity-item">
                    <strong>Join Date:</strong>
                    <span>{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="activity-item">
                    <strong>Last Login:</strong>
                    <span>{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                  </div>
                  <div className="activity-item">
                    <strong>Total Complaints:</strong>
                    <span>{selectedUser.complaintsCount}</span>
                  </div>
                  <div className="activity-item">
                    <strong>Location:</strong>
                    <span>{selectedUser.location}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeUserModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
