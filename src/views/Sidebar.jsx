// src/views/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../App.css'; 

const Sidebar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: 'white',
    padding: '12px 15px',
    borderRadius: '8px',
    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    marginBottom: '5px' // Space between items
  });

  return (
    <div className="sidebar" style={{
        width: '250px', 
        height: '100%', 
        background: '#004d40', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }}>
      {/* BRANDING */}
      <h2 style={{ marginBottom: '20px', textAlign: 'center', borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'20px', margin: '0 0 20px 0' }}>
        🌿 AyurSync AI
      </h2>

      {/* NAVIGATION LINKS - Moved UP (removed flex:1 and justifyContent:center) */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        
        <NavLink to="/dashboard" className="nav-link" style={navLinkStyle}>
          <span>📊</span> Dashboard
        </NavLink>
        
        <NavLink to="/disease-search" className="nav-link" style={navLinkStyle}>
          <span>🧬</span> Disease Codes
        </NavLink>

        <NavLink to="/symptom-analyzer" className="nav-link" style={navLinkStyle}>
          <span>🤖</span> AI Symptom Analyzer
        </NavLink>

        <NavLink to="/find-doctors" className="nav-link" style={navLinkStyle}>
          <span>👨‍⚕️</span> Find Doctor
        </NavLink>

        <NavLink to="/appointment" className="nav-link" style={navLinkStyle}>
          <span>📅</span> Book Appointment
        </NavLink>

      </nav>

      {/* USER & LOGOUT (Footer - Pushed to bottom) */}
      <div style={{ marginTop: 'auto', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:'20px' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.8 }}>Logged in as: <strong>{userName}</strong></p>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;