import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaCarrot, FaRunning, FaOm, FaSearch } from 'react-icons/fa'; // Added icons

// Use the live backend URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

const DiseaseSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('symptoms');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
        const response = await axios.post(`${RENDER_API_URL}/api/search-disease`, { query: searchTerm });
        if (response.data.success) {
            setResult(response.data.data);
            setActiveTab('symptoms'); // Reset to first tab
        } else {
            setError("No data found for this condition.");
        }
    } catch (err) {
        setError("Failed to get data. Please check connection.");
    } finally {
        setLoading(false);
    }
  };

  // Handle 'Enter' key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderTabContent = () => {
    if (!result) return null;
    const items = result.carePlan[activeTab] || [];
    
    // Icon mapping for tabs
    const tabIcons = {
      symptoms: <FaStethoscope style={{ color: '#e74c3c', marginRight: '10px' }} />,
      diet: <FaCarrot style={{ color: '#e67e22', marginRight: '10px' }} />,
      exercise: <FaRunning style={{ color: '#3498db', marginRight: '10px' }} />,
      yoga: <FaOm style={{ color: '#9b59b6', marginRight: '10px' }} />
    };

    return (
        <ul style={{ listStyle: 'none', padding: '0' }}>
            {items.map((item, i) => (
                <li key={i} style={{ 
                    padding: '12px 15px', 
                    borderBottom: '1px solid #f0f0f0', 
                    fontSize: '1.05rem', 
                    display: 'flex', 
                    alignItems: 'center',
                    background: i % 2 === 0 ? '#fafafa' : 'white', // Zebra striping
                    borderRadius: '8px',
                    marginBottom: '5px'
                }}>
                    {tabIcons[activeTab]}
                    {item}
                </li>
            ))}
        </ul>
    );
  };

  const handleFindDoctor = () => {
      // Pass the disease and specialist name to the Find Doctors page
      navigate('/find-doctors', { 
        state: { 
          disease: result.name,
          specialization: result.specialist 
        } 
      });
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Full-width HEADER */}
      <div style={{ background: '#004d40', color: 'white', padding: '40px 20px', textAlign: 'center', width: '100%' }}>
        <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 'bold' }}>Disease Codes & Care Plans</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Search for a condition to get ICD-11, Namaste codes, and AI-powered care advice.</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        {/* Wider SEARCH BAR */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#004d40' }} />
            <input 
              type="text" 
              placeholder="e.g. Viral Fever, Migraine, Diabetes..." 
              value={searchTerm} 
              onChange={(e)=>setSearchTerm(e.target.value)} 
              onKeyPress={handleKeyPress}
              style={{
                width: '100%', 
                padding: '18px 18px 18px 50px', 
                borderRadius: '50px', 
                border: '2px solid #004d40', 
                fontSize: '1.1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          <button onClick={handleSearch} disabled={loading} style={{
            padding:'18px 50px', 
            background: loading ? '#ccc' : '#004d40', 
            color:'white', 
            border:'none', 
            borderRadius:'50px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight:'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(0,77,64,0.3)',
            transition: 'background 0.3s'
          }}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '10px', textAlign: 'center', marginBottom: '30px' }}>{error}</div>}

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              
              {/* TITLE & CODES */}
              <h1 style={{ color: '#004d40', marginTop: 0, fontSize: '2.5rem', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>{result.name}</h1>
              
              <div style={{ display: 'flex', gap: '20px', margin: '30px 0', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', background: '#e3f2fd', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(33,150,243,0.2)' }}>
                      <small style={{fontWeight:'bold', color:'#1565c0', textTransform:'uppercase'}}>ICD-11 Code</small>
                      <div style={{fontSize:'1.5rem', fontWeight:'bold', marginTop: '5px'}}>{result.codes.icd11}</div>
                  </div>
                  <div style={{ flex: '1 1 200px', background: '#f3e5f5', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(156,39,176,0.2)' }}>
                      <small style={{fontWeight:'bold', color:'#7b1fa2', textTransform:'uppercase'}}>Namaste Code</small>
                      <div style={{fontSize:'1.5rem', fontWeight:'bold', marginTop: '5px'}}>{result.codes.namaste}</div>
                  </div>
              </div>

              <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#333', background:'#f9f9f9', padding:'25px', borderRadius:'15px', fontStyle: 'italic' }}>
                  {result.description}
              </p>

              {/* TABS */}
              <div style={{ marginTop: '40px' }}>
                  <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
                      {['symptoms', 'diet', 'exercise', 'yoga'].map(tab => (
                          <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            style={{ 
                                padding: '15px 25px', 
                                background: activeTab === tab ? '#e0f2f1' : 'transparent', 
                                borderBottom: activeTab === tab ? '3px solid #004d40' : '3px solid transparent', 
                                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                fontWeight: 'bold', 
                                cursor: 'pointer', 
                                color: activeTab === tab ? '#004d40' : '#888', 
                                textTransform:'capitalize',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s',
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px'
                            }}
                          >
                              {tabIcons[tab]} {tab}
                          </button>
                      ))}
                  </div>
                  <div style={{ padding: '10px 0' }}>{renderTabContent()}</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button onClick={handleFindDoctor} style={{ 
                      padding: '15px 40px', 
                      border: 'none', 
                      background: '#004d40', 
                      color: 'white', 
                      fontWeight: 'bold', 
                      borderRadius: '50px', 
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      boxShadow: '0 5px 15px rgba(0,77,64,0.4)',
                      transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                      Find {result.specialist || 'Specialist'} near you {'->'}
                  </button>
              </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSearch;