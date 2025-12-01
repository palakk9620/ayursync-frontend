import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// LIVE URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

const SymptomAnalyzer = () => { 
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setResult(null);
    try {
        const response = await axios.post(`${RENDER_API_URL}/api/analyze-symptoms`, { symptoms });
        if (response.data.success) {
            setTimeout(() => { setResult(response.data.data); setLoading(false); }, 800);
        }
    } catch (err) { alert("Error analyzing."); setLoading(false); }
  };

  // Handle Enter Key
  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleAnalyze();
      }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 1. FULL WIDTH HEADER */}
      <div style={{ width: '100%', background: '#004d40', color: 'white', padding: '50px 20px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '3rem', fontWeight: '800' }}>AI Symptom Analyzer</h1>
        <p style={{ margin: '0', fontSize: '1.2rem', opacity: 0.9 }}>Describe your symptoms, and our AI will suggest potential conditions.</p>
      </div>

      {/* 2. WIDER CONTAINER */}
      <div style={{ width: '100%', maxWidth: '1000px', padding: '0 30px', boxSizing: 'border-box' }}>
        
        <div className="analyzer-box" style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <p style={{color: '#004d40', marginBottom: '15px', fontWeight:'bold', fontSize:'1.3rem'}}>Enter your symptoms:</p>
            
            <textarea 
                rows="4" 
                placeholder="e.g. I have a severe headache on one side and feel nauseous..." 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%', 
                    padding: '20px', 
                    borderRadius: '15px', 
                    border: '2px solid #e0e0e0', 
                    fontSize: '1.2rem', 
                    resize: 'none', 
                    outline: 'none', 
                    boxSizing:'border-box',
                    fontFamily: 'inherit'
                }}
            />
            <button onClick={handleAnalyze} disabled={loading}
                style={{
                    marginTop: '30px', 
                    width: '100%', 
                    padding: '20px', 
                    background: loading ? '#ccc' : '#004d40', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '15px', 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                }}
            >
                {loading ? 'Analyzing...' : 'Analyze Health Condition'}
            </button>
        </div>

        {result && (
            <div className="result-box" style={{marginTop: '50px', width: '100%', animation: 'fadeIn 0.5s ease', marginBottom: '50px'}}>
                <div style={{background: '#e0f2f1', padding: '40px', borderRadius: '20px', borderLeft: '10px solid #004d40'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                        <div>
                            <h4 style={{margin: 0, color: '#555', textTransform: 'uppercase', fontSize: '1rem', letterSpacing:'1px'}}>POTENTIAL CONDITION</h4>
                            <h1 style={{margin: '10px 0 0 0', color: '#004d40', fontSize: '3rem'}}>{result.disease}</h1>
                        </div>
                        <span style={{padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', background: 'white', color: result.risk === 'High' ? 'red' : '#2e7d32', fontSize:'1.1rem', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
                            Risk: {result.risk}
                        </span>
                    </div>
                    
                    <hr style={{ border: 'none', borderTop: '1px solid #b2dfdb', margin: '30px 0' }} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div><h4 style={{ color: '#004d40', margin: '0 0 10px 0', fontSize:'1.2rem' }}>🩺 Recommended Specialist</h4><p style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{result.specialty}</p></div>
                        <div><h4 style={{ color: '#004d40', margin: '0 0 10px 0', fontSize:'1.2rem' }}>💊 Advice</h4><p style={{ fontSize: '1.2rem', lineHeight:'1.6' }}>{result.advice}</p></div>
                    </div>

                    {/* 3. DYNAMIC FIND BUTTON */}
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button 
                            onClick={() => navigate('/find-doctors', { state: { specialization: result.specialty, disease: result.disease } })}
                            style={{ 
                                padding: '18px 40px', 
                                background: 'white', 
                                border: '3px solid #004d40', 
                                color: '#004d40', 
                                fontWeight: '800', 
                                borderRadius: '50px', 
                                cursor: 'pointer',
                                fontSize: '1.2rem' 
                            }}
                        >
                            Find {result.specialty} Near Me &rarr;
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