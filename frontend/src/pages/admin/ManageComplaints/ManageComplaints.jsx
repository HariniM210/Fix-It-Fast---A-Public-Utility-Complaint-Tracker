import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { complaintsAPI } from '../../../services/api';
import './ManageComplaints.css';

const ManageComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const statusOptions = ['Pending', 'In Progress', 'Resolved'];

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      params.limit = 100;
      const { data } = await complaintsAPI.getAll(params);
      const list = data?.complaints || [];
      const filtered = search
        ? list.filter((c) => c.user?.name?.toLowerCase().includes(search.toLowerCase()))
        : list;
      setComplaints(filtered);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const id = setTimeout(fetchComplaints, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await complaintsAPI.updateStatus(id, newStatus);
      await fetchComplaints();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await complaintsAPI.delete(id);
      await fetchComplaints();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <div className="manage-complaints-container">
      <div className="page-header">
        <h1>Manage Complaints</h1>
        <p>Admin can review, update, and delete complaints</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by user name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <option value="">All Categories</option>
          <option value="Roads">Roads</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={fetchComplaints} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f7fafc' }}>Refresh</button>
      </div>

      {error && <div style={{ color: '#c53030', marginBottom: '0.5rem' }}>{error}</div>}

      <div style={{ overflowX: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Complaint ID</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>User Name</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Description</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '12px' }}>Loading...</td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '12px' }}>No complaints found</td></tr>
            ) : (
              complaints.map((c) => (
                <tr key={c._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>{c._id}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>{c.user?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>{c.category}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>
                    <select value={c.status} disabled={updatingId === c._id} onChange={(e) => handleStatusChange(c._id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px' }}>
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #edf2f7' }}>
                    <button onClick={() => handleDelete(c._id)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageComplaints;
