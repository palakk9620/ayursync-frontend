// src/views/Landing.jsx
import React from 'react';
import Header from '../components/Header';
import '../App.css'; 

// --- IMPORT YOUR IMAGES HERE ---
// (Make sure the filenames match exactly what you saved in the assets folder!)
import aiTechImg from '../assets/ai-tech.png';
import patientCareImg from '../assets/patient-care.png';
import globalStandardsImg from '../assets/global-standards.png';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />
      
      <section className="hero-section">
        <h1>Advanced Healthcare with Artificial Intelligence</h1>
        <p>
          AyurSync AI revolutionizes healthcare by integrating modern Decision Tree algorithms 
          with ancient wisdom and ICD-11 standards. We analyze symptoms instantly, predict potential 
          health risks, and connect you with the right care at the right time.
        </p>
      </section>

      {/* SECTION 2: The 3 Pictures (Updated to use real images) */}
      <section className="image-gallery">
        <div className="gallery-item">
            {/* We use curly braces {} to use the imported variable */}
            <img src={aiTechImg} alt="AI Analysis" />
            <h3>AI Analysis</h3>
        </div>
        <div className="gallery-item">
            <img src={patientCareImg} alt="Patient Care" />
            <h3>Patient Care</h3>
        </div>
        <div className="gallery-item">
            <img src={globalStandardsImg} alt="Global Standards" />
            <h3>Global Standards</h3>
        </div>
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