import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import API, { authAPI } from '../services/api';

const AuthContext = createContext();

// API baseURL and interceptors are configured in services/api.js

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Optional local check for expiry to avoid an extra request if obviously expired
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
        } catch (_) {
          // If decode fails, proceed to server validation
        }

        // services/api attaches Authorization from localStorage automatically
        const response = await authAPI.getMe();
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('User restored from token:', response.data.user);
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError('');
    
    try {
      // Normalize email on client side
      const payload = {
        email: (credentials.email || '').trim().toLowerCase(),
        password: credentials.password || ''
      };
      const response = await authAPI.login(payload);
      
      if (response.status === 200) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // API instance reads token from localStorage via interceptor
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        setError('');
        
        console.log('Login successful:', user);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      
      // Remove invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    setError('');
    
    console.log('User logged out');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
