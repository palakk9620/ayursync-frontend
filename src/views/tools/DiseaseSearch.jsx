// src/views/tools/DiseaseSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaCarrot, FaRunning, FaOm, FaSearch } from 'react-icons/fa';

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
            setActiveTab('symptoms');
        } else {
            setError("No data found.");
        }
    } catch (err) {
        setError("Connection Error.");
    } finally {
        setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const renderTabContent = () => {
    if (!result) return null;
    const items = result.carePlan[activeTab] || [];
    const icons = { symptoms: <FaStethoscope />, diet: <FaCarrot />, exercise: <FaRunning />, yoga: <FaOm /> };

    return (
        <ul style={{listStyle:'none', padding:0}}>
            {items.map((item, i) => (
                <li key={i} style={{
                    padding:'12px 15px', 
                    borderBottom:'1px solid #f0f0f0', 
                    fontSize:'1rem', 
                    display:'flex', 
                    alignItems:'center', 
                    gap:'10px',
                    background: i % 2 === 0 ? '#fff' : '#fafafa'
                }}>
                    <span style={{color: '#004d40', fontSize: '1.1rem'}}>{icons[activeTab]}</span>
                    {item}
                </li>
            ))}
        </ul>
    );
  };

  const handleFindDoctor = () => {
      const specialist = result.specialist || 'General Physician';
      navigate('/find-doctors', { state: { specialization: specialist, disease: result.name } });
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', background: '#004d40', color: 'white', padding: '40px 20px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800' }}>Disease Codes Search</h1>
        <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>NLP-Powered Search: ICD-11, NAMASTE & AI Care Plans.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', padding: '0 20px', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'center' }}>
            <div style={{position:'relative', flex:1}}>
                <FaSearch style={{position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', color:'#004d40', fontSize:'1rem'}}/>
                <input 
                    type="text" 
                    placeholder="Type a disease (e.g. Asthma, Diabetes)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '50px', border: '2px solid #004d40', fontSize: '1rem', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', boxSizing:'border-box' }}
                />
            </div>
            <button onClick={handleSearch} style={{ padding: '15px 40px', background: '#004d40', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                {loading ? '...' : 'Search'}
            </button>
        </div>

        {error && <div style={{textAlign:'center', color:'red', fontSize:'1.1rem'}}>{error}</div>}

        {result && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 25px rgba(0,0,0,0.08)', marginBottom: '40px', maxWidth: '800px', margin: '0 auto' }}>
                
                <div style={{borderBottom: '2px solid #eee', paddingBottom:'20px', marginBottom:'20px'}}>
                    <h1 style={{color: '#004d40', fontSize: '2.2rem', margin: '0 0 15px 0'}} dangerouslySetInnerHTML={{ __html: result.name }}></h1>
                    
                    <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                        <div style={{background: '#e3f2fd', padding: '15px', borderRadius: '10px', flex: 1}}>
                            <small style={{color:'#1565c0', fontWeight:'bold'}}>ICD-11</small>
                            <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#0d47a1'}}>{result.codes.icd11}</div>
                        </div>
                        <div style={{background: '#f3e5f5', padding: '15px', borderRadius: '10px', flex: 1}}>
                            <small style={{color:'#7b1fa2', fontWeight:'bold'}}>NAMASTE</small>
                            <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#4a148c'}}>{result.codes.namaste}</div>
                        </div>
                    </div>
                    <p style={{fontSize: '1rem', lineHeight: '1.5', color: '#444', background: '#f8f9fa', padding: '15px', borderRadius: '10px', fontStyle:'italic'}}>{result.description}</p>
                </div>

                <div>
                    <div style={{display: 'flex', gap: '10px', borderBottom: '2px solid #eee', marginBottom: '0'}}>
                        {['symptoms', 'diet', 'exercise', 'yoga'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 20px', 
                                    background: activeTab === tab ? '#004d40' : 'transparent', 
                                    color: activeTab === tab ? 'white' : '#666', 
                                    border: 'none', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    textTransform: 'capitalize', 
                                    fontSize: '1rem', 
                                    borderRadius: '10px 10px 0 0'
                                }}>{tab}</button>
                        ))}
                    </div>
                    <div style={{padding: '15px', background:'#fff', border:'1px solid #eee', borderTop:'none', borderRadius:'0 0 10px 10px'}}>{renderTabContent()}</div>
                </div>

                <div style={{textAlign: 'center', marginTop: '30px'}}>
                    <button onClick={handleFindDoctor} style={{
                        padding: '15px 30px', 
                        background: 'white', 
                        border: '2px solid #004d40', 
                        color: '#004d40', 
                        fontWeight: '800', 
                        borderRadius: '50px', 
                        cursor: 'pointer', 
                        fontSize: '1.1rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#004d40'; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#004d40'; }}
                    >
                        Find {result.specialist || 'Specialist'} Near You &rarr;
                    </button>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSearch;