import React from 'react';

const Reports = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '3rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          📊 Reports & Analytics
        </h1>

        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #667eea'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#667eea'}}>Total Complaints</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2c3e50'}}>156</p>
              <small style={{color: '#28a745', fontWeight: 'bold'}}>+12% this month</small>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #28a745'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#28a745'}}>Resolution Rate</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2c3e50'}}>78%</p>
              <small style={{color: '#28a745', fontWeight: 'bold'}}>+5% this month</small>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #ffc107'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#ffc107'}}>Avg Response Time</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2c3e50'}}>2.3 days</p>
              <small style={{color: '#28a745', fontWeight: 'bold'}}>-0.5 days improvement</small>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #dc3545'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#dc3545'}}>User Satisfaction</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#2c3e50'}}>4.2/5</p>
              <small style={{color: '#28a745', fontWeight: 'bold'}}>+0.3 this month</small>
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '3rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h2 style={{color: '#2c3e50', marginBottom: '2rem'}}>📈 Advanced Analytics Coming Soon</h2>
            <p style={{color: '#666', fontSize: '1.1rem', marginBottom: '2rem'}}>
              Detailed charts and reports will be available here
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Export Data
              </button>
              <button style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
