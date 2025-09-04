import React from 'react';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav style={{
      background: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', textDecoration: 'none' }}>
        FixItFast
      </Link>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/signin">Sign In</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
