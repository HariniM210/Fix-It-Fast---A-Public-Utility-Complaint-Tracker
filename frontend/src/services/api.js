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

// Users API calls
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => API.put(`/users/${id}/status`, { status }),
};

export default API;
