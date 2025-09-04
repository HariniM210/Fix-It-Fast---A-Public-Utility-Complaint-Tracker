import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(null);
  
  useEffect(() => {
    let intervalId;
    const ping = async () => {
      try {
        const res = await API.get('/health');
        setApiOnline(res.status === 200 && res.data?.ok === true);
      } catch (_) {
        setApiOnline(false);
      }
    };
    ping();
    intervalId = setInterval(ping, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  return (
    <nav style={{
      background: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <Link to="/" style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#667eea', 
        textDecoration: 'none' 
      }}>
        FixItFast
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user?.role === 'admin' ? (
          <>
            <Link to="/admin/dashboard" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Dashboard
            </Link>
            <Link to="/admin/complaints" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Manage Complaints
            </Link>
            <Link to="/admin/reports" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Reports
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Dashboard
            </Link>
            <Link to="/lodge-complaint" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Lodge Complaint
            </Link>
            <Link to="/track-status" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Track Status
            </Link>
            <Link to="/community-feed" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Community
            </Link>
            <Link to="/profile" style={{ 
              color: '#4a5568', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Profile
            </Link>
          </>
        )}
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid #e2e8f0'
        }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: apiOnline == null ? '#edf2f7' : apiOnline ? '#c6f6d5' : '#fed7d7',
            color: apiOnline == null ? '#4a5568' : apiOnline ? '#22543d' : '#742a2a'
          }}>
            {apiOnline == null ? 'API: ...' : apiOnline ? 'API: Online' : 'API: Offline'}
          </span>
          <span style={{ 
            color: '#718096', 
            fontSize: '0.9rem' 
          }}>
            Welcome, {user?.name}
          </span>
          <button 
            onClick={handleLogout} 
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
