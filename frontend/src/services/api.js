// frontend/src/service/api.js
import axios from 'axios';

// Resolve API base URL across Vite and CRA-style envs
const resolveApiBaseUrl = () => {
  const viteUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;
  const craUrl = typeof process !== 'undefined' ? (process.env?.REACT_APP_API_URL || process.env?.REACT_APP_BACKEND_URL) : undefined;
  const fallback = 'http://localhost:5000/api';
  return viteUrl || craUrl || fallback;
};

// Create axios instance with base configuration
const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug base URL once at startup
try {
  // eslint-disable-next-line no-console
  console.log('API baseURL:', API.defaults.baseURL);
} catch (_) {}

// Request interceptor to add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

// Complaints API calls
export const complaintsAPI = {
  getAll: (params) => API.get('/complaints', { params }),
  create: (complaintData) => API.post('/complaints', complaintData),
  update: (id, data) => API.put(`/complaints/${id}`, data),
  updateStatus: (id, status, note) => API.put(`/complaints/${id}/status`, { status, note }),
  delete: (id) => API.delete(`/complaints/${id}`),
  like: (id) => API.post(`/complaints/${id}/like`),
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics for the logged-in user
  getDashboardData: async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      const response = await API.get('/dashboard/me');
      console.log('✅ Dashboard data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get admin dashboard statistics (admin only)
  getAdminStats: async () => {
    try {
      console.log('🔄 Fetching admin dashboard stats...');
      const response = await API.get('/dashboard/admin/stats');
      console.log('✅ Admin dashboard data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Contact API calls
export const contactAPI = {
  // Send contact message (public)
  sendMessage: async (data) => {
    try {
      console.log('🔄 Sending contact message...');
      const response = await API.post('/contact', data);
      console.log('✅ Contact message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending contact message:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all contact messages (admin only)
  getMessages: async (params = {}) => {
    try {
      console.log('🔄 Fetching contact messages...');
      const response = await API.get('/contact', { params });
      console.log('✅ Contact messages fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching contact messages:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update contact message status (admin only)
  updateStatus: async (id, status, adminResponse = '') => {
    try {
      console.log(`🔄 Updating contact status for ID: ${id}`);
      const response = await API.put(`/contact/${id}/status`, { status, adminResponse });
      console.log('✅ Contact status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating contact status:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get contact statistics (admin only)
  getStats: async () => {
    try {
      console.log('🔄 Fetching contact statistics...');
      const response = await API.get('/contact/stats');
      console.log('✅ Contact statistics fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching contact statistics:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Users API calls
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => API.put(`/users/${id}/status`, { status }),
};

// API Helper functions
export const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.errors?.[0] || 
                     `Server error: ${error.response.status}`;
      return { message, status: error.response.status };
    } else if (error.request) {
      return { message: 'Network error - please check your connection', status: 0 };
    } else {
      return { message: error.message || 'An unexpected error occurred', status: -1 };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// Legacy export for backward compatibility
export const sendContactMessage = contactAPI.sendMessage;

export default API;