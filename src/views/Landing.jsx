// src/views/Landing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

// Images (Ensure these match your assets folder)
import aiImg from '../assets/ai-tech.png'; 
import patientImg from '../assets/patient-care.png'; 
import globalImg from '../assets/global-standards.png'; 

const Landing = () => {
  const navigate = useNavigate();

  // State for the Feature Modal
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 1,
      img: aiImg,
      title: "AI Analysis",
      description: "We provide smart AI-powered symptom analysis that instantly interprets your inputs using advanced Decision Tree models, mapping them accurately to ICD-11 and Namaste Portal disease codes for precise identification."
    },
    {
      id: 2,
      img: patientImg,
      title: "Patient Care",
      description: "Experience a complete, patient-friendly journey—from identifying potential conditions to finding trusted specialists within 10km and booking appointments seamlessly. Your health journey, simplified."
    },
    {
      id: 3,
      img: globalImg,
      title: "Global Standards",
      description: "We align your health insights with global medical standards by matching your symptoms and conditions against internationally accepted ICD protocols, ensuring your results are accurate, reliable, and universally understood."
    }
  ];

  return (
    <div className="landing-container">
      
      {/* --- FEATURE MODAL (Popup) --- */}
      {selectedFeature && (
        <div className="modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="modal-content feature-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px', textAlign: 'center', padding: '40px'}}>
            <h2 style={{color: '#004d40', marginBottom: '20px', fontSize: '2rem'}}>{selectedFeature.title}</h2>
            <img src={selectedFeature.img} alt={selectedFeature.title} style={{width: '80px', height: '80px', marginBottom: '20px', objectFit: 'contain'}} />
            <p style={{fontSize: '1.1rem', lineHeight: '1.6', color: '#555'}}>
              {selectedFeature.description}
            </p>
            <button 
              onClick={() => setSelectedFeature(null)}
              style={{
                marginTop: '30px',
                padding: '12px 30px',
                background: '#004d40',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="landing-header">
        <div className="logo">AYURSYNC AI: An Intelligent Health Manager using Decision Tree</div>
        <button className="login-btn" onClick={() => navigate('/login')}>Login / Signup</button>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="main-title">Advanced Healthcare with Artificial Intelligence</h1>
        <p className="sub-title">
          AyurSync AI revolutionizes healthcare by integrating modern Decision Tree algorithms 
          with ancient wisdom and ICD-11 standards. We analyze symptoms instantly, 
          predict potential health risks, and connect you with the right care at the right time.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="features-grid">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="feature-card"
            onClick={() => setSelectedFeature(feature)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Image Container */}
            <div className="image-container">
               <img src={feature.img} alt={feature.title} />
            </div>
            
            {/* Title at Bottom */}
            <div className="card-title">{feature.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;