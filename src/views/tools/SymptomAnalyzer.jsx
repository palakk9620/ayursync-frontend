import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaBrain, FaPills } from 'react-icons/fa';

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
            setTimeout(() => { setResult(response.data.data); setLoading(false); }, 500);
        }
    } catch (err) { alert("Error analyzing. Please try again."); setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', background: '#004d40', color: 'white', padding: '40px 20px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaBrain style={{ marginRight: '15px' }} /> AI Symptom Analyzer
        </h1>
        <p style={{ margin: '0', fontSize: '1.2rem', opacity: 0.9 }}>Describe your symptoms, and our AI will suggest potential conditions.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* SMALLER INPUT BOX */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', maxWidth: '700px', margin: '0 auto' }}>
            <p style={{color: '#004d40', marginBottom: '15px', fontWeight:'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center'}}>
              <FaStethoscope style={{marginRight: '10px'}}/> Enter your symptoms:
            </p>
            
            <textarea 
                rows="5" 
                placeholder="e.g. I have a severe headache on one side and feel nauseous..." 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    border: '2px solid #e0e0e0', 
                    fontSize: '1rem', 
                    resize: 'none', 
                    outline: 'none', 
                    boxSizing:'border-box',
                    fontFamily: 'inherit'
                }}
            />
            <button onClick={handleAnalyze} disabled={loading || !symptoms.trim()}
                style={{
                    marginTop: '20px', 
                    width: '100%', 
                    padding: '15px', 
                    background: loading ? '#ccc' : '#004d40', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    cursor: loading || !symptoms.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                }}
            >
                {loading ? 'Analyzing...' : 'Analyze Health Condition'}
            </button>
            <p style={{ textAlign: 'center', color: '#888', marginTop: '10px', fontSize: '0.8rem' }}>
              Press <strong>Enter</strong> to analyze
            </p>
        </div>

        {result && (
            <div style={{marginTop: '40px', width: '100%', animation: 'fadeIn 0.6s ease', marginBottom: '40px'}}>
                <div style={{background: '#fff', padding: '30px', borderRadius: '20px', borderLeft: '10px solid #004d40', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px'}}>
                        <div>
                            <h4 style={{margin: '0 0 5px 0', color: '#555', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px'}}>Potential Condition</h4>
                            <h1 style={{margin: 0, color: '#004d40', fontSize: '2.2rem'}}>{result.disease}</h1>
                        </div>
                        <span style={{padding: '8px 20px', borderRadius: '30px', fontWeight: 'bold', background: result.risk === 'High' ? '#ffebee' : '#e8f5e9', color: result.risk === 'High' ? 'red' : 'green', fontSize: '1rem'}}>
                            Risk: {result.risk}
                        </span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '25px 0' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div><h4 style={{ color: '#004d40', margin: '0 0 10px 0', fontSize:'1.1rem' }}>🩺 Recommended Specialist</h4><p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333', margin: 0 }}>{result.specialty}</p></div>
                        <div><h4 style={{ color: '#004d40', margin: '0 0 10px 0', fontSize:'1.1rem' }}>💊 Advice</h4><p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{result.advice}</p></div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '35px' }}>
                        <button 
                            onClick={() => navigate('/find-doctors', { state: { specialization: result.specialty, disease: result.disease } })}
                            style={{ padding: '15px 35px', border: 'none', background: '#004d40', color: 'white', fontWeight: 'bold', borderRadius: '50px', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 5px 15px rgba(0,77,64,0.4)' }}
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