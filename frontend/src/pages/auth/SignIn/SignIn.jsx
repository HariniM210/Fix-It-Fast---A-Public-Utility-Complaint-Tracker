import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { success, user, error: authError } = await login({ email, password });
      if (!success) {
        setError(authError || 'Login failed. Please check your credentials.');
        return;
      }

      const redirectTo = (location.state && location.state.from && location.state.from.pathname) 
        ? location.state.from.pathname 
        : (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Demo login functions
  const loginAsAdmin = () => {
    setEmail('admin@fixitfast.com');
    setPassword('admin123');
  };

  const loginAsUser = () => {
    setEmail('user@fixitfast.com');
    setPassword('password');
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
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing In...' : 'SIGN IN'}
          </button>

          <div style={styles.demoSection}>
            <p style={styles.demoTitle}>Demo Credentials:</p>
            <div style={styles.demoButtons}>
              <button
                type="button"
                onClick={loginAsAdmin}
                style={styles.demoButtonAdmin}
                disabled={loading}
              >
                👑 Login as Admin
              </button>
              <button
                type="button"
                onClick={loginAsUser}
                style={styles.demoButtonUser}
                disabled={loading}
              >
                👤 Login as User
              </button>
            </div>
          </div>

          <div style={styles.signupLink}>
            Don't have an account? <Link to="/register" style={styles.link}>Create one here</Link>
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
    transition: 'all 0.3s ease'
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
    border: '1px solid rgba(255, 255, 255, 0.2)'
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
    transition: 'all 0.3s ease',
    marginBottom: '2rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  demoSection: {
    backgroundColor: '#f0f9ff',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #bae6fd'
  },
  demoTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#0c4a6e',
    textAlign: 'center',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  demoButtonAdmin: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  demoButtonUser: {
    padding: '0.75rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  signupLink: {
    textAlign: 'center',
    color: '#718096',
    fontSize: '0.95rem'
  },
  link: {
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default SignIn;
