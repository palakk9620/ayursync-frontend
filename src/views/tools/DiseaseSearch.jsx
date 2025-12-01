import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    setLoading(true); setError(''); setResult(null);
    try {
        const response = await axios.post(`${RENDER_API_URL}/api/search-disease`, { query: searchTerm });
        if (response.data.success) {
            setResult(response.data.data);
            setActiveTab('symptoms');
        } else { setError("No data found"); }
    } catch (err) { setError("Connection Error"); } 
    finally { setLoading(false); }
  };

  const renderTabContent = () => {
    if (!result) return null;
    const items = result.carePlan[activeTab] || [];
    return (
        <ul style={{listStyle:'none', padding:0}}>
            {items.map((item, i) => (
                <li key={i} style={{padding:'12px', borderBottom:'1px solid #eee', fontSize:'1rem'}}>
                    • {item}
                </li>
            ))}
        </ul>
    );
  };

  const handleFindDoctor = () => {
      navigate('/find-doctors', { state: { disease: result.name } });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ background: '#004d40', color: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Disease Codes Search</h1>
        <p>NLP-Powered Search: ICD-11, NAMASTE & AI Care Plans.</p>
      </div>

      {/* SEARCH */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input type="text" placeholder="Type a disease (e.g. Asthma)..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={{flex:1, padding:'15px', borderRadius:'50px', border:'2px solid #004d40', fontSize:'1.1rem'}} />
        <button onClick={handleSearch} style={{padding:'15px 40px', background:'#004d40', color:'white', border:'none', borderRadius:'50px', cursor:'pointer', fontWeight:'bold'}}>{loading ? '...' : 'Search'}</button>
      </div>

      {/* RESULTS */}
      {result && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
            
            {/* TITLE & CODES */}
            <h1 style={{ color: '#004d40', marginTop: 0 }} dangerouslySetInnerHTML={{__html: result.name}}></h1>
            
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                <div style={{ flex: 1, background: '#e3f2fd', padding: '15px', borderRadius: '10px' }}>
                    <small style={{fontWeight:'bold', color:'#1565c0'}}>ICD-11 CODE</small>
                    <div style={{fontSize:'1.2rem', fontWeight:'bold'}}>{result.codes.icd11}</div>
                </div>
                <div style={{ flex: 1, background: '#f3e5f5', padding: '15px', borderRadius: '10px' }}>
                    <small style={{fontWeight:'bold', color:'#7b1fa2'}}>NAMASTE CODE</small>
                    <div style={{fontSize:'1.2rem', fontWeight:'bold'}}>{result.codes.namaste}</div>
                </div>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#444', background:'#f9f9f9', padding:'15px', borderRadius:'10px' }}>
                {result.description}
            </p>

            {/* TABS */}
            <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid #eee' }}>
                    {['symptoms', 'diet', 'exercise', 'yoga'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', background: 'transparent', borderBottom: activeTab === tab ? '3px solid #004d40' : 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: activeTab===tab ? '#004d40':'#888', textTransform:'capitalize' }}>{tab}</button>
                    ))}
                </div>
                <div style={{ padding: '20px 0' }}>{renderTabContent()}</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={handleFindDoctor} style={{ padding: '12px 30px', border: '2px solid #004d40', background: 'white', color: '#004d40', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                    Find Specialist Near Me &rarr;
                </button>
            </div>

        </div>
      )}
    </div>
  );
};
export default DiseaseSearch;