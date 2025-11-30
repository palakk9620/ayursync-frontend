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
  const [filter, setFilter] = useState(passedSpecialty || ''); // Executed search term
  const [tempFilter, setTempFilter] = useState(passedSpecialty || ''); // Input field state
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // We run the fetch and filtering logic here to ensure filter is applied on load
    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/doctors');
            let docs = Array.isArray(res.data) ? res.data : [];

            // --- LOCAL STORAGE SYNC (Keep your existing logic) ---
            const localDoctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));
            const loggedInRole = localStorage.getItem('userRole');
            const loggedInEmail = localStorage.getItem('userEmail');

            if (loggedInRole === 'doctor' && localDoctorDetails) {
                docs = docs.filter(d => d.email !== loggedInEmail && d.name !== localDoctorDetails.name);
                
                const myUpdatedProfile = {
                    id: 99999,
                    name: localDoctorDetails.name,
                    specialization: localDoctorDetails.specialization || 'General Physician',
                    hospitalName: localDoctorDetails.hospitalName,
                    address: localDoctorDetails.address,
                    timings: localDoctorDetails.timings,
                    email: loggedInEmail, 
                    rating: '5.0', 
                    reviews: 0,
                    mapLink: '', 
                };
                docs.unshift(myUpdatedProfile);
            }
            // ------------------------------------------------

            const enhancedDocs = docs.map(doc => ({
                ...doc,
                rating: doc.rating || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
                reviews: doc.reviews || Math.floor(Math.random() * 100) + 20
            }));
            
            setDoctors(enhancedDocs);

        } catch (err) { 
            console.error("Error loading doctors", err); 
        }
    };
    fetchDoctors();
  }, []); // Run only on initial mount

  const handleSearchClick = () => {
      setFilter(tempFilter); // Set the executed search term
  };

  // The filtering happens whenever the 'filter' state changes (either on load or button click)
  const filteredDoctors = doctors.filter(doc => 
    (doc.specialization || '').toLowerCase().includes(filter.toLowerCase()) ||
    (doc.name || '').toLowerCase().includes(filter.toLowerCase())
  );

  const handleBookNow = (doc) => {
      navigate('/appointment', { 
        state: { 
            doctor: doc,         
            disease: passedDisease 
        } 
      });
  };

  const handleDeleteDoctor = async (doctorId) => {
      if(window.confirm("Are you sure you want to permanently remove this doctor?")) {
          try {
              const currentDeleted = JSON.parse(localStorage.getItem('deletedDoctorIds')) || [];
              if (!currentDeleted.includes(doctorId)) {
                  currentDeleted.push(doctorId);
                  localStorage.setItem('deletedDoctorIds', JSON.stringify(currentDeleted));
              }
              setDoctors(doctors.filter(doc => doc.id !== doctorId));
              alert("Doctor removed globally.");
          } catch (err) {
              alert("Error deleting doctor.");
          }
      }
  };

  return (
    <div className="find-doctor-container" style={{maxWidth: '1400px', margin: '0 auto', padding: '30px'}}>
      
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <h2 style={{color: '#004d40', fontSize: '2.5rem', marginBottom: '10px'}}>Find Specialists Near You</h2>
        
        {/* NEW: Flex Container for Search Bar and Button */}
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center', maxWidth: '700px', margin: '10px auto 0 auto'}}>
            <input 
                type="text" 
                placeholder="Search by name or specialty..." 
                value={tempFilter} 
                onChange={(e) => setTempFilter(e.target.value)} // Update temp filter state
                style={{
                    padding: '12px 20px', 
                    width: '100%', 
                    borderRadius: '25px', 
                    border: '1px solid #ccc', 
                    fontSize: '1rem', 
                    outline: 'none',
                    flexGrow: 1
                }} 
            />
            <button
                onClick={handleSearchClick} // Execute filter on button click
                style={{
                    padding: '12px 25px', 
                    background: '#004d40', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '25px', 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Find
            </button>
        </div>
        {passedDisease && <p style={{color: '#666', fontSize: '1rem', marginTop: '10px'}}>Filtering for: <strong>{passedDisease}</strong></p>}
      </div>

      <div className="doctors-list" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {filteredDoctors.length === 0 ? <p style={{textAlign:'center'}}>No doctors found.</p> : filteredDoctors.map((doc, idx) => (
            <div key={idx} className="doctor-card" style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white', 
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
                            <h3 style={{margin: 0, color: '#004d40', fontSize: '1.4rem'}}>Dr. {doc.name}</h3>
                            <p style={{margin: 0, fontWeight:'bold', color: '#555', fontSize: '1rem'}}>{doc.specialization}</p>
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
                        style={{padding: '12px', background: '#004d40', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize:'1rem', transition: 'background 0.2s'}}>
                        Book Appointment
                    </button>

                    {userRole === 'admin' && (
                        <button onClick={() => handleDeleteDoctor(doc.id)} style={{padding: '8px', background: '#c62828', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem'}}>
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