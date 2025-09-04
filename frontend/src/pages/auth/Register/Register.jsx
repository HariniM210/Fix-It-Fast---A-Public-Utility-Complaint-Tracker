import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration data:', formData); // Debug log
      
      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration response:', response.data); // Debug log

      if (response.status === 201) {
        alert('🎉 Registration successful! Please sign in to continue.');
        
        // Navigate to login
        navigate('/signin');
      }

    } catch (err) {
      console.error('Registration error:', err); // Debug log
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>
        ← Back to Home
      </button>

      <div style={styles.formContainer}>
        <div style={styles.brand}>
          <h1 style={styles.brandText}>FixItFast</h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join our community today</p>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Location *</label>
            <input
              type="text"
              name="location"
              placeholder="Enter your location (City, State)"
              value={formData.location}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>

          <div style={styles.loginLink}>
            Already have an account? <Link to="/signin" style={styles.link}>Sign in here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif'
  },
  backButton: {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  formContainer: {
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto'
  },
  brand: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  brandText: {
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '1.1rem'
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    border: '1px solid #feb2b2'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: '0.5rem',
    fontSize: '0.95rem'
  },
  input: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  submitButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  loginLink: {
    textAlign: 'center',
    color: '#718096',
    fontSize: '0.95rem'
  },
  link: {
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Register;
