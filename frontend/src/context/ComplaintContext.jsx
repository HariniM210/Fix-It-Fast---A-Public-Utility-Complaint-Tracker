import React, { createContext, useContext, useState, useEffect } from 'react';
import { complaintsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext();

export const useComplaint = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaint must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch complaints when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchComplaints();
    }
  }, [isAuthenticated, user]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.getAll();
      
      if (response.data.success) {
        setComplaints(response.data.complaints);
      } else {
        throw new Error('Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.message || 'Failed to fetch complaints');
      
      // Fallback to sample data if backend is not available
      setComplaints([
        {
          id: 1,
          title: 'Street Light Not Working',
          description: 'Street light on Main Road has been off for 3 days',
          status: 'Pending',
          location: 'Main Road, Near Park',
          date: new Date('2025-08-20').toISOString(),
          user: 'John Doe',
          category: 'Street Light',
          priority: 'High',
          likes: 5
        },
        {
          id: 2,
          title: 'Water Supply Issue',
          description: 'Low water pressure affecting multiple households',
          status: 'In Progress',
          location: 'Gandhi Street',
          date: new Date('2025-08-19').toISOString(),
          user: 'Jane Smith',
          category: 'Water Supply',
          priority: 'Medium',
          likes: 12
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (complaintData) => {
    try {
      const response = await complaintsAPI.create(complaintData);
      
      if (response.data.success) {
        setComplaints(prev => [response.data.complaint, ...prev]);
        return { success: true };
      }
    } catch (err) {
      console.error('Error creating complaint:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to create complaint' };
    }
  };

  const updateComplaintStatus = async (id, status, note) => {
    try {
      const response = await complaintsAPI.updateStatus(id, status, note);
      
      if (response.data.success) {
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === id 
              ? { ...complaint, status, lastUpdated: new Date().toISOString() }
              : complaint
          )
        );
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating complaint status:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update status' };
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const value = {
    complaints,
    setComplaints,
    loading,
    error,
    stats,
    fetchComplaints,
    createComplaint,
    updateComplaintStatus
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};
