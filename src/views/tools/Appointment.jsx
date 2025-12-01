// src/views/tools/Appointment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// LIVE URL
const RENDER_API_URL = 'https://ayursync-backend.onrender.com';

const Appointment = () => {
  const location = useLocation(); 
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]); 
  
  // State to toggle between Form and Receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null); 

  // NEW: Loading state to prevent double-clicks
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', 
    dob: '',      
    age: '',      
    doctorName: '',
    hospitalName: '', 
    date: '',
    time: '',
    disease: '',
    phone: '' // Will store only the 10 digits
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || '';
    setFormData(prev => ({ ...prev, fullName: storedName }));

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`${RENDER_API_URL}/api/doctors`);
            setDoctors(res.data);

            if (location.state) {
                const { doctor, disease } = location.state;
                let newFormUpdates = {};

                if (doctor) {
                    newFormUpdates.doctorName = doctor.name;
                    newFormUpdates.hospitalName = doctor.hospitalName;
                    generateTimeSlots(doctor.timings); 
                }
                if (disease) {
                    newFormUpdates.disease = disease;
                }
                setFormData(prev => ({ ...prev, ...newFormUpdates }));
            }
        } catch (err) { console.error("Error loading doctors"); }
    };
    fetchDoctors();
  }, [location.state]);

  // --- AGE CALCULATION ---
  const handleDobChange = (e) => {
      const dobValue = e.target.value;
      if (dobValue) {
          const today = new Date();
          const birthDate = new Date(dobValue);
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
          }
          setFormData(prev => ({ ...prev, dob: dobValue, age: age.toString() }));
      } else {
          setFormData(prev => ({ ...prev, dob: dobValue, age: '' }));
      }
  };

  // --- PHONE NUMBER HANDLER (Restrict to 10 digits) ---
  const handlePhoneChange = (e) => {
      const value = e.target.value;
      // Regex to allow only numbers
      if (/^\d*$/.test(value)) {
          // Stop updating if length > 10
          if (value.length <= 10) {
              setFormData({ ...formData, phone: value });
          }
      }
  };

  const generateTimeSlots = (timingString) => {
      const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
      setSlots(times);
  };

  const handleDoctorChange = (e) => {
      const selectedName = e.target.value;
      const docObj = doctors.find(d => d.name === selectedName);
      if (docObj) {
          setFormData({
              ...formData, 
              doctorName: selectedName,
              hospitalName: docObj.hospitalName 
          });
          generateTimeSlots(docObj.timings);
      } else {
          setFormData(prev => ({...prev, doctorName: '', hospitalName: ''}));
          setSlots([]);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Prevent Double Clicks
    if (loading) return;

    // 2. Validation
    if (formData.phone.length !== 10) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    // 3. Start Loading
    setLoading(true);

    const bookingPayload = { 
        patientName: formData.fullName, 
        userEmail: localStorage.getItem('userEmail'),
        ...formData,
        phone: `+91 ${formData.phone}` // Send full format to backend
    };

    try {
        const res = await axios.post(`${RENDER_API_URL}/api/book-appointment`, bookingPayload);
        if (res.data.success) {
            setBookingDetails(bookingPayload);
            setShowReceipt(true);
            // We DON'T set loading false here because the view switches to receipt
        } else {
            setLoading(false); // Allow retry if logic failed
        }
    } catch (err) { 
        alert("Booking Failed. Please try again."); 
        setLoading(false); // Allow retry on network error
    }
  };

  const handlePrint = () => {
      window.print();
  };

  // --- RENDER RECEIPT ---
  if (showReceipt && bookingDetails) {
      return (
          <div className="receipt-container" style={{maxWidth: '600px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 25px rgba(0,0,0,0.1)', borderTop:'8px solid #004d40'}}>
              <style>
                {`
                  @media print {
                    body * { visibility: hidden; }
                    .receipt-container, .receipt-container * { visibility: visible; }
                    .receipt-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; }
                    .no-print { display: none; }
                  }
                `}
              </style>

              <div style={{textAlign:'center', marginBottom:'30px'}}>
                  <h1 style={{color:'#004d40', margin:0}}>Appointment Confirmed</h1>
                  <p style={{color:'#666', fontSize:'1.1rem'}}>Booking ID: #{Math.floor(Math.random() * 1000000)}</p>
              </div>

              <div style={{display:'grid', gap:'15px', borderBottom:'2px dashed #ccc', paddingBottom:'30px', marginBottom:'30px'}}>
                  <div className="receipt-row"><strong>Patient Name:</strong> <span>{bookingDetails.fullName}</span></div>
                  <div className="receipt-row"><strong>Age / DOB:</strong> <span>{bookingDetails.age} years ({bookingDetails.dob})</span></div>
                  <div className="receipt-row"><strong>Doctor:</strong> <span>Dr. {bookingDetails.doctorName}</span></div>
                  <div className="receipt-row"><strong>Hospital/Clinic:</strong> <span>{bookingDetails.hospitalName}</span></div>
                  <div className="receipt-row"><strong>Date & Time:</strong> <span>{bookingDetails.date} at {bookingDetails.time}</span></div>
                  <div className="receipt-row"><strong>Reason:</strong> <span>{bookingDetails.disease}</span></div>
                  <div className="receipt-row"><strong>Phone:</strong> <span>{bookingDetails.phone}</span></div>
              </div>

              <div style={{textAlign:'center', marginTop:'40px'}}>
                  <h3 style={{color:'#004d40', fontStyle:'italic'}}>Booked with AyurSync AI</h3>
                  <p style={{fontSize:'0.8rem', color:'#999'}}>Please arrive 15 minutes before your scheduled time.</p>
              </div>

              <div className="no-print" style={{marginTop:'30px', display:'flex', gap:'15px', justifyContent:'center'}}>
                  <button onClick={handlePrint} style={{padding:'12px 25px', background:'#004d40', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>🖨️ Print / Save PDF</button>
                  <button onClick={() => { setShowReceipt(false); setLoading(false); }} style={{padding:'12px 25px', background:'#eee', color:'#333', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>Book Another</button>
              </div>
          </div>
      );
  }

  // --- RENDER FORM ---
  return (
    <div style={{maxWidth: '700px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', borderTop:'5px solid #004d40'}}>
      <h2 style={{color: '#004d40', marginTop:0, marginBottom:'25px'}}>Book Appointment</h2>
      
      <form onSubmit={handleSubmit} style={{display:'grid', gap:'20px'}}>
        
        {/* 1. FULL NAME */}
        <div>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Patient Full Name</label>
            <input type="text" placeholder="Enter full name" required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', fontSize:'1rem'}} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} disabled={loading} />
        </div>

        {/* 2. DOB & AGE */}
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px'}}>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Date of Birth</label>
                <input type="date" required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', fontSize:'1rem'}} value={formData.dob} onChange={handleDobChange} disabled={loading} />
            </div>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Age</label>
                <input type="text" readOnly placeholder="Auto" style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', background:'#f0f0f0', color:'#555', fontSize:'1rem'}} value={formData.age} disabled={loading} />
            </div>
        </div>

        <hr style={{border:'none', borderTop:'1px solid #eee', margin:'10px 0'}}/>

        {/* 3. Doctor & Hospital */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Select Doctor</label>
                <select style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc'}} value={formData.doctorName} onChange={handleDoctorChange} required disabled={loading}>
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.name}>Dr. {doc.name} ({doc.specialization})</option>)}
                </select>
            </div>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Hospital / Clinic</label>
                <input type="text" readOnly style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', background:'#f0f0f0', color:'#555'}} value={formData.hospitalName || "Select a doctor first"} disabled={loading} />
            </div>
        </div>

        {/* 4. Date & Time Slots */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Appointment Date</label>
                <input type="date" required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc'}} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} disabled={loading} />
            </div>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Time Slot</label>
                <select required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc'}} value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} disabled={loading}>
                    <option value="">-- Select Time --</option>
                    {slots.map((slot, i) => <option key={i} value={slot}>{slot}</option>)}
                </select>
            </div>
        </div>

        {/* 5. Reason */}
        <div>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Disease / Symptoms</label>
            <input type="text" placeholder="e.g. High Fever, Chest Pain" required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc'}} value={formData.disease} onChange={(e) => setFormData({...formData, disease: e.target.value})} disabled={loading} />
        </div>

        {/* 6. PHONE NUMBER (Fixed +91 & 10 Digits) */}
        <div>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Phone Number</label>
            <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', background:'white'}}>
                {/* Visual Prefix */}
                <span style={{
                    padding: '12px 15px', 
                    background: '#f0f0f0', 
                    borderRight: '1px solid #ccc', 
                    borderTopLeftRadius:'8px', 
                    borderBottomLeftRadius:'8px', 
                    color: '#555', 
                    fontWeight: 'bold'
                }}>
                    +91
                </span>
                
                {/* Restricted Input */}
                <input 
                    type="tel" 
                    placeholder="XXXXXXXXXX" 
                    required 
                    style={{
                        border: 'none', 
                        padding: '12px', 
                        width: '100%', 
                        outline: 'none', 
                        borderRadius: '0 8px 8px 0', 
                        fontSize:'1rem'
                    }}
                    value={formData.phone} 
                    onChange={handlePhoneChange} 
                    disabled={loading}
                />
            </div>
        </div>

        {/* UPDATED BUTTON: Disabled logic */}
        <button 
            type="submit" 
            disabled={loading}
            style={{
                width:'100%', 
                padding:'15px', 
                background: loading ? '#ccc' : '#004d40', 
                color:'white', 
                border:'none', 
                borderRadius:'8px', 
                fontSize:'1.1rem', 
                fontWeight:'bold', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                marginTop:'10px',
                transition: 'background 0.3s'
            }}
        >
            {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default Appointment;