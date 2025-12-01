import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaBrain, FaPills } from 'react-icons/fa';

// Use the live backend URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

const SymptomAnalyzer = () => { 
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); 
    setResult(null);
    try {
        const response = await axios.post(`${RENDER_API_URL}/api/analyze-symptoms`, { symptoms });
        if (response.data.success) {
            // Add a small delay for smoother transition
            setTimeout(() => { 
                setResult(response.data.data); 
                setLoading(false); 
            }, 500);
        }
    } catch (err) { 
        alert("Error analyzing. Please try again."); 
        setLoading(false); 
    }
  };

  // Handle 'Enter' key press in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleAnalyze();
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Full-width HEADER */}
      <div style={{ width: '100%', background: '#004d40', color: 'white', padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaBrain style={{ marginRight: '15px' }} /> AI Symptom Analyzer
        </h1>
        <p style={{ margin: '0', fontSize: '1.2rem', opacity: 0.9 }}>Describe your symptoms, and our AI will suggest potential conditions and advice.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', padding: '30px 20px', boxSizing: 'border-box' }}>
        
        {/* Wider INPUT BOX */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <p style={{color: '#004d40', marginBottom: '20px', fontWeight:'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center'}}>
              <FaStethoscope style={{marginRight: '10px'}}/> Enter your symptoms:
            </p>
            
            <textarea 
                rows="6" 
                placeholder="e.g. I've had a severe headache on one side of my head for two days, and I feel nauseous and sensitive to light..." 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%', 
                    padding: '20px', 
                    borderRadius: '15px', 
                    border: '2px solid #e0e0e0', 
                    fontSize: '1.1rem', 
                    resize: 'vertical', 
                    outline: 'none', 
                    boxSizing:'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#004d40'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button onClick={handleAnalyze} disabled={loading || !symptoms.trim()}
                style={{
                    marginTop: '25px', 
                    width: '100%', 
                    padding: '18px', 
                    background: loading || !symptoms.trim() ? '#ccc' : '#004d40', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '15px', 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: '0 5px 15px rgba(0,77,64,0.3)',
                    transition: 'background 0.3s'
                }}
            >
                {loading ? 'Analyzing...' : 'Analyze Health Condition'}
            </button>
            <p style={{ textAlign: 'center', color: '#888', marginTop: '15px', fontSize: '0.9rem' }}>
              Press <strong>Enter</strong> to analyze
            </p>
        </div>

        {/* RESULTS SECTION */}
        {result && (
            <div style={{marginTop: '40px', width: '100%', animation: 'fadeIn 0.6s ease'}}>
                <div style={{background: '#fff', padding: '40px', borderRadius: '20px', borderLeft: '10px solid #004d40', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px'}}>
                        <div>
                            <h4 style={{margin: '0 0 5px 0', color: '#555', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '1px'}}>Potential Condition</h4>
                            <h1 style={{margin: 0, color: '#004d40', fontSize: '2.5rem'}}>{result.disease}</h1>
                        </div>
                        <span style={{
                            padding: '8px 20px', 
                            borderRadius: '30px', 
                            fontWeight: 'bold', 
                            background: result.risk === 'High' ? '#ffebee' : result.risk === 'Moderate' ? '#fff3e0' : '#e8f5e9', 
                            color: result.risk === 'High' ? '#c62828' : result.risk === 'Moderate' ? '#ef6c00' : '#2e7d32',
                            fontSize: '1rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            Risk: {result.risk}
                        </span>
                    </div>
                    
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div style={{ background: '#f0f2f5', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#004d40', margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
                                <FaStethoscope style={{marginRight: '10px'}}/> Recommended Specialist
                            </h3>
                            <p style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#333', margin: 0 }}>{result.specialty}</p>
                        </div>
                        <div style={{ background: '#e0f7fa', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#00796b', margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
                                <FaPills style={{marginRight: '10px'}}/> Immediate Advice
                            </h3>
                            <p style={{ fontSize: '1.15rem', color: '#333', lineHeight: '1.6', margin: 0 }}>{result.advice}</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button 
                            onClick={() => navigate('/find-doctors', { state: { specialization: result.specialty, disease: result.disease } })}
                            style={{ 
                                padding: '15px 40px', 
                                border: 'none', 
                                background: '#004d40', 
                                color: 'white', 
                                fontWeight: 'bold', 
                                borderRadius: '50px', 
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                boxShadow: '0 5px 15px rgba(0,77,64,0.4)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Find {result.specialty} near you {'->'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SymptomAnalyzer;