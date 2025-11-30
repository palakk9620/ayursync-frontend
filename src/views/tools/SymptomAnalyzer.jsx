// src/views/tools/SymptomAnalyzer.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        const response = await axios.post('https://ayursync-backend.onrender.com/api/analyze-symptoms', { symptoms });
        if (response.data.success) {
            setTimeout(() => {
                setResult(response.data.data);
                setLoading(false);
            }, 1000);
        }
    } catch (err) {
        alert("Analysis failed. Try again.");
        setLoading(false);
    }
  };

  const handleFindDoctorClick = () => {
      if (result) {
        navigate('/find-doctors', { state: { specialization: result.specialty, disease: result.disease } });
      }
  };

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 1. GREEN HEADER BLOCK */}
      <div style={{ width: '100%', background: '#004d40', color: 'white', padding: '40px 20px', borderRadius: '0 0 20px 20px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800' }}>AI Symptom Analyzer</h1>
        <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>Describe your symptoms, and our AI will suggest potential conditions.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '800px', padding: '0 20px' }}>
        <div className="analyzer-box" style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
            {/* CHANGED TEXT HERE */}
            <p style={{color: '#666', marginBottom: '20px', fontWeight:'bold'}}>Enter symptoms:</p>
            
            <textarea 
                rows="5" placeholder="e.g. I have a severe headache on one side and feel nauseous..." value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #eee', fontSize: '1rem', resize: 'none', outline: 'none', boxSizing:'border-box'}}
            />
            <button onClick={handleAnalyze} disabled={loading}
                style={{marginTop: '20px', width: '100%', padding: '15px', background: loading ? '#ccc' : '#004d40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'}}
            >
                {loading ? 'Analyzing...' : 'Analyze Health Condition'}
            </button>
        </div>

        {result && (
            <div className="result-box" style={{marginTop: '40px', width: '100%', animation: 'fadeIn 0.5s ease', marginBottom: '40px'}}>
                <div style={{background: '#e0f2f1', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #004d40'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <div>
                            <h4 style={{margin: 0, color: '#555', textTransform: 'uppercase', fontSize: '0.9rem'}}>Potential Condition</h4>
                            <h1 style={{margin: 0, color: '#004d40', fontSize: '2.5rem'}}>{result.disease}</h1>
                        </div>
                        <div style={{padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', background: result.risk === 'High' ? '#ffebee' : '#e8f5e9', color: result.risk === 'High' ? '#c62828' : '#2e7d32'}}>
                            Risk: {result.risk}
                        </div>
                    </div>
                    <hr style={{border: 'none', borderTop: '1px solid #b2dfdb', margin: '20px 0'}} />
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                        <div><h4 style={{color: '#004d40', marginBottom: '10px'}}>🩺 Recommended Specialist</h4><p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{result.specialty}</p></div>
                        <div><h4 style={{color: '#004d40', marginBottom: '10px'}}>💊 Advice</h4><p style={{fontSize: '1rem', color: '#444'}}>{result.advice}</p></div>
                    </div>
                    <div style={{marginTop: '30px', textAlign: 'center'}}>
                        <button onClick={handleFindDoctorClick} style={{padding: '12px 30px', background: 'white', border: '2px solid #004d40', color: '#004d40', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>
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