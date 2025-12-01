// src/views/Landing.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import '../App.css'; 

// --- IMPORT YOUR IMAGES ---
import aiTechImg from '../assets/ai-tech.png';
import patientCareImg from '../assets/patient-care.png';
import globalStandardsImg from '../assets/global-standards.png';

const Landing = () => {
  // State to track which feature is clicked (null means no modal is open)
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Data for the 3 features
  const features = [
    {
      id: 1,
      img: aiTechImg,
      title: "AI Analysis",
      description: "We provide smart AI-powered symptom analysis that instantly interprets your inputs using Decision Tree models and maps them to accurate ICD and Namaste Portal disease codes."
    },
    {
      id: 2,
      img: patientCareImg,
      title: "Patient Care",
      description: "We provide you a complete patient-friendly experience — from finding trusted doctors within 10km to booking appointments and tracking what you might be suffering from."
    },
    {
      id: 3,
      img: globalStandardsImg,
      title: "Global Standards",
      description: "We provide you globally aligned medical insights by matching your symptoms and conditions with internationally accepted ICD standards for accurate and reliable health results."
    }
  ];

  return (
    <div className="landing-page">
      
      {/* --- MODAL POPUP (Only shows when an image is clicked) --- */}
      {selectedFeature && (
        <div className="modal-overlay" onClick={() => setSelectedFeature(null)} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              background: 'white', padding: '40px', borderRadius: '15px',
              maxWidth: '500px', textAlign: 'center', borderTop: '6px solid #004d40',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative', animation: 'fadeIn 0.3s ease'
          }}>
            {/* Close Button */}
            <button onClick={() => setSelectedFeature(null)} style={{
                position: 'absolute', top: '10px', right: '15px', background: 'transparent',
                border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888'
            }}>×</button>

            <img src={selectedFeature.img} alt={selectedFeature.title} style={{ width: '80px', marginBottom: '20px' }} />
            <h2 style={{ color: '#004d40', marginBottom: '15px' }}>{selectedFeature.title}</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
                {selectedFeature.description}
            </p>
            <button onClick={() => setSelectedFeature(null)} style={{
                marginTop: '20px', padding: '10px 25px', background: '#004d40', 
                color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
            }}>
                Close
            </button>
          </div>
        </div>
      )}

      <Header />
      
      <section className="hero-section">
        <h1>Advanced Healthcare with Artificial Intelligence</h1>
        <p>
          AyurSync AI revolutionizes healthcare by integrating modern Decision Tree algorithms 
          with Ayurveda and ICD-11 standards. We analyze symptoms instantly, predict potential 
          health risks, and connect you with the right care at the right time.
        </p>
      </section>

      {/* SECTION 2: The 3 Clickable Pictures */}
      <section className="image-gallery">
        {features.map((feature) => (
            <div 
                key={feature.id} 
                className="gallery-item" 
                onClick={() => setSelectedFeature(feature)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <img src={feature.img} alt={feature.title} />
                <h3>{feature.title}</h3>
            </div>
        ))}
      </section>

      <section className="doctor-info-section">
        <h2>Connect with Specialized Doctors</h2>
        <div className="doctor-details">
          <p>
            Our platform bridges the gap between you and top-tier specialists. 
            Whether you need a General Physician, a Cardiologist, or an Ayurveda Expert, 
            AyurSync connects you to professionals within a 10km radius. 
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;