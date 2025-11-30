// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>AYURSYNC AI: An Intelligent Health Manager using Decision Tree</h2>
      </div>
      <div className="navbar-right">
        {/* When clicked, go to /login */}
        <button className="login-btn" onClick={() => navigate('/login')}>
          Login / Signup
        </button>
      </div>
    </header>
  );
};

// --- THIS IS THE KEY LINE THAT WAS MISSING ---
export default Header;