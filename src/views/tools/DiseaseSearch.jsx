// src/views/tools/DiseaseSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. MAPPING DICTIONARY: Disease -> Specialist
const diseaseSpecialistMap = {
  "Asthma": "Pulmonologist",
  "Bronchial Asthma": "Pulmonologist",
  "Diabetes": "Endocrinologist",
  "Diabetes Type 2": "Endocrinologist",
  "Hypertension": "Cardiologist",
  "Heart attack": "Cardiologist",
  "Migraine": "Neurologist",
  "Paralysis": "Neurologist",
  "Jaundice": "Gastroenterologist",
  "Malaria": "General Physician",
  "Dengue": "General Physician",
  "Typhoid": "General Physician",
  "Pneumonia": "Pulmonologist",
  "Arthritis": "Rheumatologist",
  "Acne": "Dermatologist",
  "Psoriasis": "Dermatologist",
  "Fungal infection": "Dermatologist",
  "GERD": "Gastroenterologist",
  "Common Cold": "General Physician",
  "Tuberculosis": "Pulmonologist",
  "(vertigo) Paroymsal Positional Vertigo": "Neurologist",
  "Urinary tract infection": "Urologist",
  "Hypothyroidism": "Endocrinologist",
};

// --- Configuration ---
// Ensure this URL is your live Render backend URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

const DiseaseSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('symptoms');

  const handleSearch = async ()=> {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
        const response = await axios.post(`${RENDER_API_URL}/api/search-disease`, { query: searchTerm });
        if (response.data.success) {
            setResult(response.data.data);
            setActiveTab('symptoms');
        } else {
            setError(response.data.message);
        }
    } catch (err) {
        setError("Network Error. Check API.");
    } finally {
        setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };

  // 2. HELPER TO GET SPECIALIST
  const getSpecialist = (diseaseName) => {
      if (diseaseSpecialistMap[diseaseName]) return diseaseSpecialistMap[diseaseName];
      const foundKey = Object.keys(diseaseSpecialistMap).find(key => diseaseName.includes(key));
      return foundKey ? diseaseSpecialistMap[foundKey] : 'General Physician';
  };

  const handleFindDoctor = () => {
      if (result) {
          const specialist = getSpecialist(result.name);
          navigate('/find-doctors', { 
              state: { 
                  specialization: specialist, 
                  disease: result.name 
              } 
          });
      }
  };

  const renderTabContent = () => {
    if (!result) return null;
    const { carePlan } = result;
    const listItemStyle = { padding:'10px 15px', borderBottom:'1px solid #eee', fontSize: '1rem' };

    switch (activeTab) {
        case 'symptoms': return <ul className="info-list" style={{listStyle:'none', padding:0}}>{carePlan.symptoms.map((item, i) => <li key={i} style={listItemStyle}>⚠️ {item}</li>)}</ul>;
        case 'diet': return <ul className="info-list" style={{listStyle:'none', padding:0}}>{carePlan.diet.map((item, i) => <li key={i} style={listItemStyle}>🥗 {item}</li>)}</ul>;
        case 'exercise': return <ul className="info-list" style={{listStyle:'none', padding:0}}>{carePlan.exercise.map((item, i) => <li key={i} style={listItemStyle}>🏃 {item}</li>)}</ul>;
        case 'yoga': return <ul className="info-list" style={{listStyle:'none', padding:0}}>{carePlan.yoga.map((item, i) => <li key={i} style={listItemStyle}>🧘 {item}</li>)}</ul>;
        default: return null;
    }
  };

  // Determine specialist for display
  const currentSpecialist = result ? getSpecialist(result.name) : 'General Physician';

  return (
    <div className="disease-search-page" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 1. COMPACT HEADER */}
      <div style={{ 
          width: '100%', 
          background: '#004d40', 
          color: 'white', 
          padding: '40px 20px', 
          textAlign: 'center', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
          marginBottom: '40px',
          borderRadius: '0 0 20px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800' }}>Disease Codes Search</h1>
            <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>NLP-Powered Search: ICD-11, NAMASTE & AI Care Plans.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ width: '100%', maxWidth: '1200px', padding: '0 30px', boxSizing: 'border-box', display:'flex', flexDirection:'column', alignItems:'center' }}>
        
        {/* 2. SEARCH BAR */}
        <div className="search-bar-wrapper" style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '40px', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '1100px', 
        }}>
            <input 
                type="text" 
                placeholder="Type a disease (e.g. Asthma, Diabetes)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ 
                    flex: 1, 
                    padding: '22px 35px', 
                    borderRadius: '50px', 
                    border: '2px solid #004d40', 
                    fontSize: '1.2rem', 
                    outline: 'none', 
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)' 
                }}
            />
            <button onClick={handleSearch} style={{ 
                padding: '22px 60px', 
                background: '#004d40', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
                transition: 'transform 0.1s',
                whiteSpace: 'nowrap'
            }}>
                {loading ? 'Searching...' : 'Search'}
            </button>
        </div>

        {error && (
            <div style={{marginTop:'30px', padding:'20px', background:'#fff5f5', border:'1px solid #fc8181', borderRadius:'10px', textAlign:'center', color:'#c53030', width: '100%', maxWidth: '900px'}}>
                <h3 style={{margin:'0 0 10px 0'}}>❌ Not Found</h3>
                <p>{error}</p>
            </div>
        )}

        {result && (
            // 3. COMPACT RESULT BOX
            <div className="results-container" style={{
                width: '100%',
                maxWidth: '900px', 
                background: 'white', 
                padding: '30px', 
                borderRadius: '15px', 
                boxShadow: '0 5px 25px rgba(0,0,0,0.08)', 
                marginBottom: '50px'
            }}>
                {/* Result Header */}
                <div style={{marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee'}}>
                    
                    {/* FIX APPLIED HERE: Use dangerouslySetInnerHTML */}
                    <h1 
                        style={{color: '#004d40', fontSize: '2.2rem', margin: '0 0 20px 0'}}
                        dangerouslySetInnerHTML={{ __html: result.name }}
                    >
                    </h1>
                    
                    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px'}}>
                        <div style={{background: '#e3f2fd', padding: '15px 20px', borderRadius: '10px', border: '1px solid #90caf9', flex: '1', minWidth: '180px'}}>
                            <span style={{display: 'block', fontSize: '0.85rem', color: '#1565c0', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px'}}>ICD-11 Code</span>
                            <span style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#0d47a1'}}>{result.codes.icd11 || "N/A"}</span>
                        </div>
                        <div style={{background: '#f3e5f5', padding: '15px 20px', borderRadius: '10px', border: '1px solid #ce93d8', flex: '1', minWidth: '180px'}}>
                            <span style={{display: 'block', fontSize: '0.85rem', color: '#7b1fa2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px'}}>NAMASTE Code</span>
                            <span style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#4a148c'}}>{result.codes.namaste || "N/A"}</span>
                        </div>
                    </div>
                    
                    <p style={{fontSize: '1.1rem', lineHeight: '1.6', color: '#333', background: '#f9f9f9', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #004d40', margin: 0}}>
                        {result.description}
                    </p>
                </div>

                {/* Tabbed Interface */}
                <div>
                    <div style={{display: 'flex', gap: '10px', borderBottom: '2px solid #eee', marginBottom: '15px'}}>
                        {['symptoms', 'diet', 'exercise', 'yoga'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 25px', background: activeTab === tab ? '#e0f2f1' : 'transparent', border: 'none', borderBottom: activeTab === tab ? '3px solid #004d40' : '3px solid transparent',
                                    color: activeTab === tab ? '#004d40' : '#888', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize', fontSize: '1rem', borderRadius: '8px 8px 0 0', transition: 'all 0.2s'
                                }}>{tab}</button>
                        ))}
                    </div>
                    <div style={{padding: '5px 0'}}>{renderTabContent()}</div>
                </div>

                {/* 4. NEW: FIND DOCTOR BUTTON (Dynamic Specialist) */}
                <div style={{marginTop: '30px', textAlign: 'center'}}>
                    <button 
                        onClick={handleFindDoctor} 
                        style={{
                            padding: '15px 40px', 
                            background: 'white', 
                            border: '2px solid #004d40', 
                            color: '#004d40', 
                            fontWeight: 'bold', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontSize: '1.1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e0f2f1'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                    >
                        Find {currentSpecialist} Near Me &rarr;
                    </button>
                </div>

                <p style={{marginTop: '20px', fontSize: '0.85rem', color: '#999', fontStyle: 'italic', textAlign:'center'}}>* AI Generated suggestion. Consult a certified Ayush practitioner.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSearch;