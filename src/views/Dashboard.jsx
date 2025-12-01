// src/views/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../App.css'; 

// LIVE URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

// --- TIME OPTIONS & EDIT PROFILE MODAL (Kept same) ---
const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24 * 2; i++) {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes === 0 ? '00' : minutes;
    options.push(`${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${ampm}`);
  }
  return options;
};

const timeOptions = generateTimeOptions();

const EditProfileModal = ({ show, onClose, formData, setFormData, onSave }) => {
  if (!show) return null;
  const splitTimings = formData.timings ? formData.timings.split(' - ') : [];
  const currentStart = splitTimings[0] || '09:00 AM';
  const currentEnd = splitTimings[1] || '05:00 PM';

  const handleTimeChange = (type, value) => {
      let newStart = currentStart;
      let newEnd = currentEnd;
      if (type === 'start') newStart = value;
      if (type === 'end') newEnd = value;
      setFormData({ ...formData, timings: `${newStart} - ${newEnd}` });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth:'500px'}}>
            <h3>✏️ Edit Profile</h3>
            <button className="close-btn" onClick={onClose}>✖</button>
            <form onSubmit={onSave} style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
                <div><label>Doctor Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{width:'100%', padding:'10px'}}/></div>
                <div><label>Specialization</label><input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required style={{width:'100%', padding:'10px'}}/></div>
                <div><label>Clinic / Hospital Name</label><input type="text" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} required style={{width:'100%', padding:'10px'}}/></div>
                <div><label>Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required style={{width:'100%', padding:'10px'}}/></div>
                <div>
                    <label>Available Timings</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <select value={currentStart} onChange={(e) => handleTimeChange('start', e.target.value)} style={{ width: '45%', padding: '10px'}}>{timeOptions.map(time => <option key={time} value={time}>{time}</option>)}</select>
                        <span>-</span>
                        <select value={currentEnd} onChange={(e) => handleTimeChange('end', e.target.value)} style={{ width: '45%', padding: '10px'}}>{timeOptions.map(time => <option key={time} value={time}>{time}</option>)}</select>
                    </div>
                </div>
                <button type="submit" style={{padding:'12px', background:'#004d40', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', marginTop:'10px'}}>Save Changes</button>
            </form>
        </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('individual');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  const [stats, setStats] = useState({
    doctorCount: 0, doctorsList: [], activeAppointment: null, pastAppointments: [], totalAppCount: 0,
    allAppointments: [], patientRecords: [], systemHealth: { status: 'Operational', uptime: '100%', database: 'Connected' },
    doctorActiveAppts: [], efficacyStats: { success: 0, missed: 0 }
  });

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCurrentApptModal, setShowCurrentApptModal] = useState(false);
  const [showAdminApptList, setShowAdminApptList] = useState(false);
  const [showApptDetail, setShowApptDetail] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showMyRecordModal, setShowMyRecordModal] = useState(false);
  const [showPatientRecordsModal, setShowPatientRecordsModal] = useState(false);
  const [showDocActiveModal, setShowDocActiveModal] = useState(false);
  const [showEfficacyModal, setShowEfficacyModal] = useState(false);
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', specialization: '', hospitalName: '', address: '', timings: '09:00 AM - 05:00 PM' });

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'User';
    const storedRole = localStorage.getItem('userRole') || 'individual';
    const storedEmail = localStorage.getItem('userEmail'); 
    const welcomeType = localStorage.getItem('welcomeType'); 
    const storedHistory = JSON.parse(localStorage.getItem('userHistory')) || [];
    
    setHistory(storedHistory);
    setUserName(storedName);
    setUserRole(storedRole.toLowerCase());

    setEditFormData({
        name: storedName,
        specialization: localStorage.getItem('specialization') || 'General Physician',
        hospitalName: localStorage.getItem('hospitalName') || '',
        address: localStorage.getItem('address') || '',
        timings: localStorage.getItem('timings') || '09:00 AM - 05:00 PM'
    });

    let prefix = (welcomeType === 'back') ? "Welcome back" : "Welcome";
    if (storedRole.toLowerCase().includes('doctor')) {
        setWelcomeMessage(`Welcome, Dr. ${storedName}`);
    } else {
        setWelcomeMessage(`${prefix}, ${storedName}`);
    }

    fetchRealStats(storedRole, storedEmail);
  }, []);

  const fetchRealStats = async (role, email) => {
    try {
        const response = await axios.post(`${RENDER_API_URL}/api/dashboard-stats`, { role, email });
        if (response.data.success) {
            const data = response.data.stats;
            const deletedIds = JSON.parse(localStorage.getItem('deletedDoctorIds')) || [];
            const cleanDoctorsList = (data.active_doctors_list || []).filter(d => !deletedIds.includes(d.id));
            
            // --- LOGIC: EXPIRE APPOINTMENT IF TIME HAS PASSED ---
            let currentAppt = data.active_appointment;
            if (currentAppt && currentAppt.date && currentAppt.time) {
                const now = new Date();
                // Helper to parse time (e.g., "03:00 PM")
                const [timeStr, period] = currentAppt.time.split(' ');
                let [hours, minutes] = timeStr.split(':');
                hours = parseInt(hours);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                const apptDate = new Date(currentAppt.date);
                apptDate.setHours(hours, parseInt(minutes), 0);

                // If appointment time is in the past, remove it from "Current"
                if (now > apptDate) {
                    currentAppt = null;
                }
            }
            // ------------------------------------------------------

            setStats({
                ...data,
                doctorCount: cleanDoctorsList.length,
                doctorsList: cleanDoctorsList,
                activeAppointment: currentAppt, // Use the processed one
                pastAppointments: data.past_appointments || [],
                totalAppCount: data.total_app_count || 0,
                allAppointments: data.all_appointments || [],
                patientRecords: data.patient_records || [],
                systemHealth: data.system_health || { status: 'Operational' },
                doctorActiveAppts: data.doctor_active_appts || [],
                efficacyStats: data.efficacy_stats || { success: 0, missed: 0 }
            });
        }
    } catch (error) { console.error("Error fetching stats:", error); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };
  const goToPage = (path, name) => {
    const now = new Date();
    const newEntry = { module: name, date: now.toLocaleDateString(), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const currentHistory = history || []; 
    const updatedHistory = [newEntry, ...currentHistory].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('userHistory', JSON.stringify(updatedHistory));
    navigate(path);
  };

  const handleHeaderSearch = (e) => { if (e.key === 'Enter') navigate('/find-doctors', { state: { specialization: doctorSearch } }); };

  const handleAppointmentAction = async (apptId, status) => {
      try {
          await axios.post(`${RENDER_API_URL}/api/update-appointment-status`, { id: apptId, status: status });
          alert(`Appointment marked as ${status}`);
          setShowDocActiveModal(false);
          fetchRealStats(userRole, localStorage.getItem('userEmail'));
      } catch (err) { alert("Error updating status"); }
  };

  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      localStorage.setItem('userName', editFormData.name);
      localStorage.setItem('specialization', editFormData.specialization);
      localStorage.setItem('hospitalName', editFormData.hospitalName);
      localStorage.setItem('address', editFormData.address);
      localStorage.setItem('timings', editFormData.timings);
      localStorage.setItem('doctorDetails', JSON.stringify(editFormData));
      setUserName(editFormData.name);
      setWelcomeMessage(`Welcome, Dr. ${editFormData.name}`);
      try { await axios.post(`${RENDER_API_URL}/api/update-doctor-profile`, editFormData); } catch(err) {}
      alert("Profile Updated Successfully!");
      setShowEditProfileModal(false);
  };

  // --- UPDATED MODAL RENDERERS ---

  // 1. MY RECORDS (UPDATED LAYOUT: Wider, Date on Right)
  const MyRecordModal = () => ( 
    <div className="modal-overlay" onClick={() => setShowMyRecordModal(false)}>
        <div className="modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:'600px'}}>
            <h3>📂 My Medical Records</h3>
            <button className="close-btn" onClick={()=>setShowMyRecordModal(false)}>✖</button>
            <div className="modal-list">
                {stats.pastAppointments?.map((rec, i) => (
                    <div key={i} className="modal-item" style={{
                        background:'white', 
                        border:'1px solid #eee', 
                        borderRadius:'8px', 
                        padding:'20px', 
                        marginBottom:'15px', 
                        boxShadow:'0 2px 5px rgba(0,0,0,0.05)', 
                        borderLeft:'5px solid #004d40'
                    }}>
                        {/* Row 1: Doctor Name */}
                        <p style={{fontWeight:'bold', color:'#004d40', fontSize:'1.1rem', marginBottom:'8px'}}>
                            Dr. {rec.doctorName}
                        </p>
                        
                        {/* Row 2: Reason (Left) ----- Date (Right) */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <p style={{margin:0, fontSize:'0.95rem', color:'#555'}}>
                                <strong>Reason:</strong> {rec.disease}
                            </p>
                            <span style={{fontSize:'0.9rem', color:'#888', fontWeight:'bold'}}>
                                {rec.date}
                            </span>
                        </div>
                    </div>
                )) || <p>No records</p>}
            </div>
        </div>
    </div> 
  );

  // 2. ACTIVE DOCTORS (Same)
  const DoctorListModal = () => ( 
    <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
        <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Available Doctors</h3>
            <button className="close-btn" onClick={()=>setShowDoctorModal(false)}>✖</button>
            <div className="modal-list">
                {stats.doctorsList?.map((doc, i) => (
                    <div key={i} className="modal-item" style={{background:'white', border:'1px solid #eee', borderRadius:'8px', padding:'15px', marginBottom:'10px', borderLeft:'4px solid #2ecc71'}}>
                        <div style={{textAlign:'left'}}>
                            <h4 style={{margin:'0', color:'#004d40'}}>{doc.name}</h4>
                            <p style={{margin:'5px 0', color:'#666', fontSize:'0.9rem', fontWeight:'bold'}}>{doc.specialization}</p>
                            <small>📍 {doc.location}</small>
                        </div>
                        {userRole !== 'admin' && <button className="book-btn-small" onClick={()=>{setShowDoctorModal(false);navigate('/appointment')}}>Book</button>}
                    </div>
                )) || <p>No doctors</p>}
            </div>
        </div>
    </div> 
  );

  // 3. CURRENT APPOINTMENT (Same - Logic Handled in fetchRealStats)
  const CurrentApptModal = () => {
      let displayDate = stats.activeAppointment?.date;
      let displayTime = stats.activeAppointment?.time;

      if (displayTime && displayTime.includes(' at ')) {
          const parts = displayTime.split(' at ');
          displayDate = parts[0];
          displayTime = parts[1];
      }

      return (
        <div className="modal-overlay" onClick={() => setShowCurrentApptModal(false)}>
            <div className="modal-content" onClick={e=>e.stopPropagation()}>
                <h3>Current Appointment</h3>
                <button className="close-btn" onClick={()=>setShowCurrentApptModal(false)}>✖</button>
                <div style={{textAlign:'left', padding:'10px'}}>
                    {stats.activeAppointment ? (
                        <>
                            <div className="detail-row"><strong>Doctor:</strong> <span style={{color:'#004d40'}}>Dr. {stats.activeAppointment.doctor}</span></div>
                            <div className="detail-row"><strong>Disease:</strong> {stats.activeAppointment.disease || 'General Checkup'}</div>
                            <div className="detail-row"><strong>Date:</strong> {displayDate}</div>
                            <div className="detail-row"><strong>Time:</strong> {displayTime}</div>
                        </>
                    ) : (
                        <div style={{textAlign:'center'}}>
                            <p>No Active Appointment</p>
                            <button className="book-btn-small" onClick={()=>{setShowCurrentApptModal(false);navigate('/appointment')}}>Book New</button>
                        </div>
                    )}
                </div>
            </div>
        </div> 
      );
  };

  // 4. HISTORY (Same)
  const HistoryModal = () => ( 
    <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
        <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>History</h3>
            <button className="close-btn" onClick={()=>setShowHistoryModal(false)}>✖</button>
            <div className="modal-list">
                {stats.pastAppointments?.map((a,i) => (
                    <div key={i} className="modal-item" style={{background:'white', border:'1px solid #eee', borderRadius:'8px', padding:'15px', marginBottom:'10px', borderLeft:'4px solid #3498db', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                             <p style={{margin:0, fontWeight:'bold', color:'#004d40'}}>Dr. {a.doctorName}</p>
                             <small style={{color:'#666'}}>{a.disease || 'Consultation'}</small>
                        </div>
                        <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>{a.date}</span>
                    </div>
                )) || <p>No history</p>}
            </div>
        </div>
    </div> 
  );

  // ... [Admin Modals kept same] ...
  const AdminApptListModal = () => ( <div className="modal-overlay" onClick={() => setShowAdminApptList(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>All Appointments</h3><button className="close-btn" onClick={()=>setShowAdminApptList(false)}>✖</button><div className="modal-list">{stats.allAppointments?.map((a,i)=><div key={i} className="modal-item">{a.patient_name}</div>) || <p>No appointments</p>}</div></div></div> );
  const AdminApptDetailModal = () => ( <div className="modal-overlay" onClick={() => setShowApptDetail(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>Details</h3><button className="close-btn" onClick={()=>setShowApptDetail(false)}>✖</button></div></div> );
  const SystemHealthModal = () => ( <div className="modal-overlay" onClick={() => setShowSystemHealth(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>System Health</h3><button className="close-btn" onClick={()=>setShowSystemHealth(false)}>✖</button><div style={{textAlign:'center'}}><h2>100% Operational</h2></div></div></div> );
  const PatientRecordsModal = () => ( <div className="modal-overlay" onClick={() => setShowPatientRecordsModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>Patient Records</h3><button className="close-btn" onClick={()=>setShowPatientRecordsModal(false)}>✖</button><div className="modal-list">{stats.patientRecords?.map((r,i)=><div key={i} className="modal-item">{r.patient}</div>) || <p>No records</p>}</div></div></div> );
  const DoctorActiveModal = () => ( <div className="modal-overlay" onClick={() => setShowDocActiveModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>Active Queue</h3><button className="close-btn" onClick={()=>setShowDocActiveModal(false)}>✖</button><div className="modal-list">{stats.doctorActiveAppts?.map((a,i)=><div key={i} className="modal-item">{a.patient_name} <button onClick={()=>handleAppointmentAction(a.id, "Success")}>✅</button></div>) || <p>No active patients</p>}</div></div></div> );
  const EfficacyModal = () => ( <div className="modal-overlay" onClick={() => setShowEfficacyModal(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>Efficacy</h3><button className="close-btn" onClick={()=>setShowEfficacyModal(false)}>✖</button></div></div> );

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f8' }}>
      {showMyRecordModal && <MyRecordModal />}
      {showDoctorModal && <DoctorListModal />}
      {showCurrentApptModal && <CurrentApptModal />}
      {showHistoryModal && <HistoryModal />}
      {showAdminApptList && <AdminApptListModal />}
      {showApptDetail && <AdminApptDetailModal />}
      {showSystemHealth && <SystemHealthModal />}
      {showPatientRecordsModal && <PatientRecordsModal />}
      {showDocActiveModal && <DoctorActiveModal />}
      {showEfficacyModal && <EfficacyModal />}
      <EditProfileModal show={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} formData={editFormData} setFormData={setEditFormData} onSave={handleProfileUpdate} />

      <header style={{ background: '#004d40', color: 'white', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>🌿 AYURSYNC AI</h2>
        <div style={{ position: 'relative' }}>
            <input type="text" placeholder="🔍 Search Doctor..." value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} onKeyDown={handleHeaderSearch} style={{padding: '10px 15px', borderRadius: '20px', border: 'none', outline: 'none', width: '250px', fontSize: '0.9rem'}} />
        </div>
      </header>

      <div className="dashboard-body" style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#004d40', margin: '0 0 10px 0' }}>{welcomeMessage}</h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Integrated healthcare management system - all your medical data in one place.</p>
        </div>

        <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="module-card" onClick={() => goToPage('/disease-search', 'Disease Codes')} style={{background:'white', padding:'30px', borderRadius:'12px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', transition:'transform 0.2s'}}><div style={{fontSize:'3rem', marginBottom:'15px'}}>🧬</div><h3 style={{color:'#004d40', margin:0}}>Disease Code</h3></div>
            <div className="module-card" onClick={() => goToPage('/symptom-analyzer', 'AI Symptom Analyzer')} style={{background:'white', padding:'30px', borderRadius:'12px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', transition:'transform 0.2s'}}><div style={{fontSize:'3rem', marginBottom:'15px'}}>🤖</div><h3 style={{color:'#004d40', margin:0}}>AI Symptom Analyzer</h3></div>
            <div className="module-card" onClick={() => goToPage('/find-doctors', 'Find Doctor')} style={{background:'white', padding:'30px', borderRadius:'12px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', transition:'transform 0.2s'}}><div style={{fontSize:'3rem', marginBottom:'15px'}}>👨‍⚕️</div><h3 style={{color:'#004d40', margin:0}}>Find Doctor</h3></div>
            <div className="module-card" onClick={() => goToPage('/appointment', 'Book Appointment')} style={{background:'white', padding:'30px', borderRadius:'12px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', transition:'transform 0.2s'}}><div style={{fontSize:'3rem', marginBottom:'15px'}}>📅</div><h3 style={{color:'#004d40', margin:0}}>Book Appointment</h3></div>
        </div>

        <div className="stats-separator" style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#444', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Activity Overview</h3>
            <div className="role-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {userRole !== 'doctor' && userRole !== 'admin' && (
                    <>
                        <div className="stat-box clickable" onClick={() => setShowCurrentApptModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #004d40'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Current Appointment</h4>{stats.activeAppointment ? <h2 style={{margin:0, color:'#004d40'}}>Dr. {stats.activeAppointment.doctor}</h2> : <h2 style={{margin:0, color:'#999'}}>No Active</h2>}</div>
                        <div className="stat-box clickable" onClick={() => setShowDoctorModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #2ecc71'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Active Doctors</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.doctorCount}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowHistoryModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #3498db'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Total Appointments</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.totalAppCount}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowMyRecordModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #9b59b6'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>My Records</h4><h2 style={{margin:0}}>📂</h2></div>
                    </>
                )}
                {userRole === 'doctor' && (
                    <>
                        <div className="stat-box clickable" onClick={() => setShowDocActiveModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #004d40'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Active Appointments</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.doctorActiveAppts?.length || 0}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowEfficacyModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #2ecc71'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Efficiency Rate</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.efficacyStats.total === 0 ? 'N/A' : Math.round((stats.efficacyStats.success / stats.efficacyStats.total) * 100) + '%'}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowPatientRecordsModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #f39c12'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Patient Records</h4><h2 style={{margin:0}}>📂</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowEditProfileModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #9b59b6'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Edit Profile</h4><h2 style={{margin:0}}>✏️</h2></div>
                    </>
                )}
                {(userRole === 'admin' || userRole === 'employee') && (
                    <>
                        <div className="stat-box clickable" onClick={() => setShowAdminApptList(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #004d40'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>All Appointments</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.allAppointments?.length || 0}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowDoctorModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #2ecc71'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Active Doctors</h4><h2 style={{margin:0, color:'#004d40'}}>{stats.doctorCount}</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowSystemHealth(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #e74c3c'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>System Health</h4><h2 style={{margin:0, color:'#2ecc71'}}>100%</h2></div>
                        <div className="stat-box clickable" onClick={() => setShowPatientRecordsModal(true)} style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft:'5px solid #f39c12'}}><h4 style={{margin:'0 0 10px 0', color:'#666'}}>Patient Records</h4><h2 style={{margin:0}}>📂</h2></div>
                    </>
                )}
            </div>
        </div>

        <div className="history-section" style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', boxSizing: 'border-box'}}>
            <h3 style={{ color: '#444', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px', marginTop: 0 }}>Recent Activity History</h3>
            <div className="history-list" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                {(!history || history.length === 0) ? <p className="no-history" style={{textAlign:'center', color:'#999'}}>No recent activity.</p> : history.map((item, index) => (
                    <div key={index} className="history-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', marginBottom: '10px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #004d40', transition: 'transform 0.2s'}}>
                        <div className="history-left" style={{fontWeight:'bold', color:'#004d40'}}>{item.module}</div>
                        <div className="history-right" style={{color:'#888', fontSize:'0.85rem'}}>{item.date} • {item.time}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <footer style={{ background: '#004d40', padding: '15px', textAlign: 'center' }}><button onClick={handleLogout} style={{ background: '#c62828', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}>Logout</button></footer>
    </div>
  );
};

export default Dashboard;