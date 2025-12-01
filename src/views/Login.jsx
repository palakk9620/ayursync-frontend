// src/views/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 

// --- Configuration ---
const RENDER_API_URL = 'https://ayursync-backend.onrender.com'; 

// Helper to generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24 * 2; i++) {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes === 0 ? '00' : minutes;
    options.push(`${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${ampm}`);
  }
  return options;
};

const timeOptions = generateTimeOptions();

const initialFormData = {
  name: '', 
  email: '', 
  password: '', 
  confirmPassword: '',
  hospitalId: '', 
  specialization: '', 
  hospitalName: '', 
  address: '', 
  startTime: '09:00 AM', 
  endTime: '05:00 PM'   
};

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('individual');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true); 
  const [loading, setLoading] = useState(false); 

  const [formData, setFormData] = useState(initialFormData);

  const validatePassword = (pass) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return regex.test(pass);
  };

  const switchTab = (loginStatus) => {
    setIsLogin(loginStatus);
    setFormData(initialFormData); 
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordValid(true);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password' && !isLogin) {
        setIsPasswordValid(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double clicks
    if (loading) return;

    // Start Loading
    setLoading(true);

    try {
      if (!isLogin) {
        // --- REGISTER LOGIC ---
        
        if (!validatePassword(formData.password)) {
            alert("Password must be at least 8 characters, include a number and a special character.");
            setIsPasswordValid(false);
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) { 
            alert("Passwords don't match"); 
            setLoading(false);
            return; 
        }
        
        let dataToSend = { ...formData, role: role };
        
        if (role === 'doctor') {
            dataToSend.timings = `${formData.startTime} - ${formData.endTime}`;
            delete dataToSend.startTime;
            delete dataToSend.endTime;
        }

        const response = await axios.post(`${RENDER_API_URL}/api/register`, dataToSend);
        
        if (response.data.success) {
          alert("Registration Successful! Please Login.");
          setFormData(initialFormData); 
          setIsLogin(true); 
        }
        
      } else {
        // --- LOGIN LOGIC ---
        
        const response = await axios.post(`${RENDER_API_URL}/api/login`, {
            email: formData.email, password: formData.password
        });

        if (response.data.success) {
            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('userRole', response.data.user.role || 'individual');
            localStorage.setItem('userEmail', response.data.user.email);
            
            const userEmail = formData.email;
            const hasVisitedBefore = localStorage.getItem('visited_' + userEmail);
            if (hasVisitedBefore) localStorage.setItem('welcomeType', 'back'); 
            else { localStorage.setItem('welcomeType', 'first'); localStorage.setItem('visited_' + userEmail, 'true'); }

            // Navigate immediately
            navigate('/dashboard'); 
            return; 
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Connection Error");
    } finally {
        // Stop loading unless successful login redirected
        if (!isLogin || (isLogin && !localStorage.getItem('userEmail'))) {
             setLoading(false);
        }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{maxWidth: role === 'doctor' && !isLogin ? '500px' : '400px'}}>
        <div className="tab-header">
          <button className={isLogin ? "active-tab" : ""} onClick={() => !loading && switchTab(true)} disabled={loading}>Login</button>
          <button className={!isLogin ? "active-tab" : ""} onClick={() => !loading && switchTab(false)} disabled={loading}>Register</button>
        </div>
        
        <h2 style={{ marginBottom: '25px' }}>{isLogin ? "Welcome Back" : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}</h2>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          {!isLogin && (
            <div className="form-group">
              <label>Select Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading} required>
                <option value="individual">Individual</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
                <input type="text" name="name" value={formData.name} placeholder="Full Name" onChange={handleChange} required disabled={loading} />
            </div>
          )}

          {!isLogin && role === 'doctor' && (
            <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'8px', marginBottom:'15px', border:'1px solid #eee'}}>
                <h4 style={{margin:'0 0 10px 0', color:'#004d40'}}>Clinic / Hospital Details</h4>
                <div className="form-group">
                    <input type="text" name="specialization" value={formData.specialization} placeholder="Specialization (e.g. Cardiologist)" onChange={handleChange} required disabled={loading} />
                </div>
                <div className="form-group">
                    <input type="text" name="hospitalName" value={formData.hospitalName} placeholder="Clinic / Hospital Name" onChange={handleChange} required disabled={loading} />
                </div>
                <div className="form-group">
                    <input type="text" name="address" value={formData.address} placeholder="Full Address (For Maps)" onChange={handleChange} required disabled={loading} />
                </div>
                
                <div className="form-group">
                    <label style={{fontSize:'0.8rem', color:'#666', display: 'block', marginBottom: '5px'}}>Available Timings:</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <select name="startTime" value={formData.startTime} onChange={handleChange} style={{ width: '45%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} required disabled={loading}>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                      <span style={{ margin: '0 10px', fontWeight: 'bold' }}>-</span>
                      <select name="endTime" value={formData.endTime} onChange={handleChange} style={{ width: '45%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} required disabled={loading}>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                    </div>
                </div>
            </div>
          )}

          {!isLogin && role !== 'individual' && (
            <div className="form-group">
                <input type="text" name="hospitalId" value={formData.hospitalId} placeholder="Hospital ID" onChange={handleChange} required disabled={loading} />
            </div>
          )}

          <div className="form-group">
            <input type="email" name="email" value={formData.email} placeholder="Email Address" onChange={handleChange} required autoComplete="off" disabled={loading} />
          </div>

          {!isLogin && (
            <div style={{ fontSize: '0.75rem', color: isPasswordValid ? '#666' : 'red', marginBottom: '5px', textAlign:'left' }}>
               Password: 8+ chars, 1 number, 1 special char
            </div>
          )}

          <div className="form-group" style={{position:'relative'}}>
            <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                autoComplete="new-password"
                style={{ border: !isLogin && !isPasswordValid ? '1px solid red' : '' }}
                disabled={loading}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:'10px', top:'10px', cursor:'pointer'}}>👁️</span>
          </div>
          
          {!isLogin && (
            <div className="form-group" style={{position:'relative'}}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  placeholder="Confirm Password" 
                  onChange={handleChange} 
                  required 
                  autoComplete="new-password"
                  disabled={loading}
                />
                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{position:'absolute', right:'10px', top:'10px', cursor:'pointer'}}>👁️</span>
            </div>
          )}

          {/* BUTTON WITH LOADING STATE */}
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
            style={{ 
                opacity: loading ? 0.7 : 1, 
                cursor: loading ? 'not-allowed' : 'pointer',
                position: 'relative'
            }}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;