// src/views/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../App.css'; 

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      
      {/* 1. MOBILE HEADER (Only visible on small screens via CSS) */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
        <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>AyurSync AI</span>
      </div>

      {/* 2. SIDEBAR WRAPPER */}
      {/* On mobile, this becomes a drawer that slides in */}
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'active' : ''}`}>
        <Sidebar />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="main-content" onClick={() => setIsMobileMenuOpen(false)}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;