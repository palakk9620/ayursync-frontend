import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ background: '#004d40', color: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>AI Symptom Analyzer</h1>
        <p>Describe your symptoms to get a potential diagnosis.</p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Enter Symptoms:</p>
          <textarea rows="4" value={symptoms} onChange={(e)=>setSymptoms(e.target.value)} placeholder="e.g. Headache, nausea..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          <button onClick={handleAnalyze} disabled={loading} style={{ marginTop: '20px', width: '100%', padding: '15px', background: '#004d40', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Analyzing...' : 'Analyze Health Condition'}
          </button>
      </div>

      {result && (
        <div style={{ marginTop: '30px', background: '#e0f2f1', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #004d40' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>POTENTIAL CONDITION</h4>
                    <h1 style={{ margin: 0, color: '#004d40' }}>{result.disease}</h1>
                </div>
                <span style={{ padding: '5px 15px', background: 'white', borderRadius: '20px', fontWeight: 'bold', color: result.risk === 'High' ? 'red' : 'green' }}>Risk: {result.risk}</span>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #b2dfdb', margin: '20px 0' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><h4 style={{ color: '#004d40', margin: '0 0 5px 0' }}>🩺 Recommended Specialist</h4><p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{result.specialty}</p></div>
                <div><h4 style={{ color: '#004d40', margin: '0 0 5px 0' }}>💊 Advice</h4><p>{result.advice}</p></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button 
                    onClick={() => navigate('/find-doctors', { state: { specialization: result.specialty, disease: result.disease } })}
                    style={{ padding: '12px 30px', background: 'white', border: '2px solid #004d40', color: '#004d40', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Find {result.specialty} Near Me &rarr;
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyzer;