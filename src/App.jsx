// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing';
import Login from './views/Login'; 
import Dashboard from './views/Dashboard';
import Layout from './views/Layout'; // Sidebar Layout

// Tool Pages
import DiseaseSearch from './views/tools/DiseaseSearch';
import SymptomAnalyzer from './views/tools/SymptomAnalyzer';
import FindDoctor from './views/tools/FindDoctor';
import Appointment from './views/tools/Appointment';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD (Standalone - No Sidebar) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* TOOL PAGES (Wrapped in Layout - WITH Sidebar) */}
        <Route element={<Layout />}>
           <Route path="/disease-search" element={<DiseaseSearch />} />
           <Route path="/symptom-analyzer" element={<SymptomAnalyzer />} />
           <Route path="/find-doctors" element={<FindDoctor />} />
           <Route path="/appointment" element={<Appointment />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;