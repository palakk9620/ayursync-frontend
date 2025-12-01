// src/views/tools/FindDoctor.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const FindDoctor = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const passedSpecialty = location.state?.specialization || '';
  const passedDisease = location.state?.disease || '';

  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState(passedSpecialty || '');      
  const [tempFilter, setTempFilter] = useState(passedSpecialty || ''); 
  
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const res = await axios.get('https://ayursync-backend.onrender.com/api/doctors');
            let docs = Array.isArray(res.data) ? res.data : [];

            // --- 1. REMOVE HARDCODED/DELETED DOCTORS ---
            const deletedIds = JSON.parse(localStorage.getItem('deletedDoctorIds')) || [];
            docs = docs.filter(d => !deletedIds.includes(d.id));
            
            // --- 2. FORCE SHOW CURRENT DOCTOR (THE FIX) ---
            if (userRole === 'doctor') {
                // A. Try to find myself in the database list
                const myDbProfileIndex = docs.findIndex(d => d.email === userEmail || d.name === userName);
                let myProfile = null;

                if (myDbProfileIndex !== -1) {
                    // Found in DB! Remove from list so we can add to top later
                    myProfile = docs[myDbProfileIndex];
                    docs.splice(myDbProfileIndex, 1);
                } else {
                    // Not found in DB? (Maybe fresh register). Create a fallback card.
                    // Check if we have local edits
                    const localDetails = JSON.parse(localStorage.getItem('doctorDetails'));
                    
                    myProfile = {
                        id: 99999, // Temporary ID
                        name: localDetails?.name || userName,
                        specialization: localDetails?.specialization || 'General Physician',
                        hospitalName: localDetails?.hospitalName || 'Your Clinic (Update Profile)',
                        address: localDetails?.address || 'Bhopal',
                        timings: localDetails?.timings || '09:00 AM - 05:00 PM',
                        rating: '5.0',
                        reviews: 0
                    };
                }

                // B. Add myself to the VERY TOP
                if (myProfile) {
                    // Ensure local edits override DB if they exist
                    const localDetails = JSON.parse(localStorage.getItem('doctorDetails'));
                    if (localDetails) {
                        myProfile = { ...myProfile, ...localDetails };
                    }
                    docs.unshift(myProfile);
                }
            }
            // ------------------------------------------------

            // Add fake ratings to others if missing
            const enhancedDocs = docs.map(doc => ({
                ...doc,
                rating: doc.rating || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
                reviews: doc.reviews || Math.floor(Math.random() * 100) + 20
            }));
            
            setDoctors(enhancedDocs);

        } catch (err) { console.error("Error loading doctors", err); }
    };
    fetchDoctors();
  }, [userRole, userEmail, userName]);

  // Update input if navigating from another page
  useEffect(() => { 
      if (passedSpecialty) {
          setFilter(passedSpecialty);
          setTempFilter(passedSpecialty);
      }
  }, [passedSpecialty]);

  const handleSearchClick = () => {
      setFilter(tempFilter);
  };

  const handleKeyPress = (e) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.specialization || '').toLowerCase().includes(filter.toLowerCase()) ||
    (doc.name || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleBookNow = (doc) => {
      navigate('/appointment', { state: { doctor: doc, disease: passedDisease } });
  };

  const handleDeleteDoctor = async (doc) => {
      // PREVENT DELETING YOURSELF
      if (doc.email === userEmail) {
          alert("You cannot delete your own profile from here.");
          return;
      }

      if(window.confirm("Are you sure you want to permanently remove this doctor?")) {
          const currentDeleted = JSON.parse(localStorage.getItem('deletedDoctorIds')) || [];
          if (!currentDeleted.includes(doc.id)) {
              currentDeleted.push(doc.id);
              localStorage.setItem('deletedDoctorIds', JSON.stringify(currentDeleted));
          }
          setDoctors(doctors.filter(d => d.id !== doc.id));
      }
  };

  return (
    <div className="find-doctor-container" style={{maxWidth: '1400px', margin: '0 auto', padding: '30px'}}>
      
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <h2 style={{color: '#004d40', fontSize: '2.5rem', marginBottom: '10px'}}>Find Specialists Near You</h2>
        
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center', maxWidth: '800px', margin: '0 auto'}}>
            <input 
                type="text" 
                placeholder="Search by name or specialty..." 
                value={tempFilter} 
                onChange={(e) => setTempFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                    padding: '15px 30px', 
                    width: '100%', 
                    borderRadius: '50px', 
                    border: '1px solid #ccc', 
                    fontSize: '1.1rem', 
                    outline: 'none', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    flexGrow: 1
                }} 
            />
            <button 
                onClick={handleSearchClick}
                style={{
                    padding: '15px 40px', 
                    background: '#004d40', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '50px', 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
            >
                Find
            </button>
        </div>

        {passedDisease && (
            <p style={{color: '#666', fontSize: '1rem', marginTop: '15px'}}>
                Filtering for: <strong dangerouslySetInnerHTML={{ __html: passedDisease }} style={{color: '#004d40'}} />
            </p>
        )}
      </div>

      <div className="doctors-list" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {filteredDoctors.length === 0 ? <p style={{textAlign:'center', fontSize:'1.2rem', color:'#666', marginTop:'20px'}}>No doctors found.</p> : filteredDoctors.map((doc, idx) => (
            <div key={idx} className="doctor-card" style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                background: doc.email === userEmail ? '#e8f5e9' : 'white', // Highlight self with light green bg
                padding: '20px', 
                borderRadius: '15px', 
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)', 
                borderLeft: '8px solid #004d40', 
                position: 'relative'
            }}>
                
                <div style={{flex: 1, paddingRight: '20px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'10px'}}>
                        <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#e0f2f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem'}}>👨‍⚕️</div>
                        <div>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <h3 style={{margin: 0, color: '#004d40', fontSize: '1.4rem'}}>
                                    Dr. {doc.name} {doc.email === userEmail && "(You)"}
                                </h3>
                                {/* AVAILABLE BADGE */}
                                <span style={{background:'#c8e6c9', color:'#2e7d32', padding:'2px 8px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:'bold'}}>● Available</span>
                            </div>
                            <p style={{margin: '5px 0 0 0', fontWeight:'bold', color: '#555', fontSize: '1rem'}}>{doc.specialization}</p>
                        </div>
                    </div>
                    <div style={{fontSize:'0.95rem', color:'#666', lineHeight:'1.5'}}>
                        <p style={{display:'flex', alignItems:'center', gap:'10px', margin: '5px 0'}}>🏥 <strong>{doc.hospitalName}</strong></p>
                        <p style={{display:'flex', alignItems:'center', gap:'10px', margin: '5px 0'}}>📍 {doc.address}</p>
                        <p style={{display:'flex', alignItems:'center', gap:'10px', margin: '5px 0'}}>🕒 {doc.timings}</p>
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <span style={{color: '#f1c40f', fontSize: '1rem'}}>★ {doc.rating}</span> <span style={{color:'#999', fontSize:'0.8rem'}}>({doc.reviews} reviews)</span>
                    </div>
                </div>

                <div style={{width: '350px', display:'flex', flexDirection:'column', gap:'10px'}}>
                    <iframe 
                        width="100%" 
                        height="120" 
                        style={{border:0, borderRadius:'10px'}} 
                        loading="lazy"
                        title={`Map for ${doc.hospitalName}`}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((doc.hospitalName || "") + " " + (doc.address || ""))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    >
                    </iframe>
                    
                    <button onClick={() => handleBookNow(doc)}
                        style={{padding: '10px', background: '#004d40', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize:'1rem', transition: 'background 0.2s'}}>
                        Book Appointment
                    </button>

                    {userRole === 'admin' && (
                        <button onClick={() => handleDeleteDoctor(doc)} style={{padding: '8px', background: '#c62828', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem'}}>
                            🗑️ Delete
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default FindDoctor;