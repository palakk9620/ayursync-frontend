// src/views/tools/Appointment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation

const Appointment = () => {
  const location = useLocation(); // 2. Access passed state
  
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]); // Dynamic Time Slots
  
  const [formData, setFormData] = useState({
    doctorName: '',
    hospitalName: '', 
    date: '',
    time: '',
    disease: '',
    phone: ''
  });

  // Load User Data
  const patientName = localStorage.getItem('userName');

  // 1. Fetch Doctors & Handle Pre-selection from Router State
  useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const res = await axios.get('https://ayursync-backend.onrender.com/api/doctors');
            setDoctors(res.data);

            // 3. CHECK FOR DATA PASSED VIA ROUTER (New Way)
            if (location.state) {
                const { doctor, disease } = location.state;

                // Create a temporary object to hold updates
                let newFormUpdates = {};

                // A. Handle Pre-selected Doctor
                if (doctor) {
                    newFormUpdates.doctorName = doctor.name;
                    newFormUpdates.hospitalName = doctor.hospitalName;
                    generateTimeSlots(doctor.timings); // Generate slots immediately
                }

                // B. Handle Pre-filled Disease (from AI)
                if (disease) {
                    newFormUpdates.disease = disease;
                }

                // Apply updates to state
                setFormData(prev => ({
                    ...prev,
                    ...newFormUpdates
                }));
            }

        } catch (err) { console.error("Error loading doctors"); }
    };
    fetchDoctors();
  }, [location.state]); // Re-run if location state changes

  // 2. Generate Time Slots based on Doctor's Timings
  const generateTimeSlots = (timingString) => {
      // Logic: If string is "09:00 AM - 05:00 PM", generate slots every 30 mins
      const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
      setSlots(times);
  };

  // 3. Handle Doctor Selection Change (Manual selection)
  const handleDoctorChange = (e) => {
      const selectedName = e.target.value;
      const docObj = doctors.find(d => d.name === selectedName);
      
      if (docObj) {
          setFormData({
              ...formData, 
              doctorName: selectedName,
              hospitalName: docObj.hospitalName // Auto-set Hospital
          });
          generateTimeSlots(docObj.timings);
      } else {
          setFormData({...formData, doctorName: '', hospitalName: ''});
          setSlots([]);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookingData = { ...formData, patientName: patientName, userEmail: localStorage.getItem('userEmail') };

    try {
        const res = await axios.post('https://ayursync-backend.onrender.com/api/book-appointment', bookingData);
        if (res.data.success) alert("Appointment Booked Successfully!");
    } catch (err) { alert("Booking Failed."); }
  };

  return (
    <div style={{maxWidth: '700px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', borderTop:'5px solid #004d40'}}>
      <h2 style={{color: '#004d40', marginTop:0}}>Book Appointment</h2>
      <p style={{color:'#666', marginBottom:'25px'}}>Patient: <strong>{patientName}</strong></p>
      
      <form onSubmit={handleSubmit} style={{display:'grid', gap:'20px'}}>
        
        {/* Row 1: Doctor & Hospital */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Select Doctor</label>
                <select style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                    value={formData.doctorName} onChange={handleDoctorChange} required>
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.name}>Dr. {doc.name} ({doc.specialization})</option>)}
                </select>
            </div>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Hospital / Clinic</label>
                <input type="text" readOnly style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', background:'#f0f0f0', color:'#555'}}
                    value={formData.hospitalName || "Select a doctor first"} />
            </div>
        </div>

        {/* Row 2: Date & Time Slots */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Date</label>
                <input type="date" required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                    value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Available Time Slot</label>
                <select required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                    value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}>
                    <option value="">-- Select Time --</option>
                    {slots.map((slot, i) => <option key={i} value={slot}>{slot}</option>)}
                </select>
            </div>
        </div>

        {/* Row 3: Reason & Phone */}
        <div>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Disease / Symptoms</label>
            <input type="text" placeholder="e.g. High Fever, Chest Pain" required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                value={formData.disease} onChange={(e) => setFormData({...formData, disease: e.target.value})} />
        </div>
        <div>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Phone Number</label>
            <input type="tel" placeholder="+91..." required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>

        <button type="submit" style={{width:'100%', padding:'15px', background:'#004d40', color:'white', border:'none', borderRadius:'8px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer', marginTop:'10px'}}>
            Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default Appointment;