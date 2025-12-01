// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('userName'); // Check if user is logged in

  if (!isAuthenticated) {
    // If not logged in, kick them to Landing Page immediately
    return <Navigate to="/" replace />;
  }

  // If logged in, allow access
  return <Outlet />;
};

export default ProtectedRoute;