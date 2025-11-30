// src/views/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar is always visible in this layout */}
      <div className="sidebar-container" style={{ width: '250px', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* The Tool Page loads here */}
      <div className="main-content" style={{ flex: 1, overflowY: 'auto', background: '#f4f6f8', padding: '20px' }}>
        <Outlet /> 
      </div>
    </div>
  );
};

export default Layout;