import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import AdminLayout from './components/admin/AdminLayout';
import TriageCommandCenter from './components/admin/TriageCommandCenter';
import ComplianceVault from './components/admin/ComplianceVault';
import IncidentDetails from './components/admin/IncidentDetails';
import ResolutionReport from './components/admin/ResolutionReport';
import SolvedIncidentDetails from './components/admin/SolvedIncidentDetails';

import ReporterWizard from './components/user/ReporterWizard';

function AppContent() {
  return (
    <Routes>
      {/* User / Reporter Route */}
      <Route path="/" element={
        <div className="w-screen h-screen flex flex-col bg-slate-900 overflow-hidden relative">
          <div className="flex-1 w-full h-full relative">
            <ReporterWizard onComplete={() => alert('Incident reported successfully!')} />
            
            {/* Quick Link to Admin (Dev Only) */}
            <div className="absolute top-4 right-4 z-50">
              <a 
                href="/admin" 
                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full text-xs font-medium border border-slate-700 transition-all backdrop-blur-sm"
              >
                Admin Portal →
              </a>
            </div>
          </div>
        </div>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TriageCommandCenter />} />
        <Route path="compliance" element={<ComplianceVault />} />
        <Route path="incident/:id" element={<IncidentDetails />} />
        <Route path="resolution/:id" element={<ResolutionReport />} />
        <Route path="solved-incident/:id" element={<SolvedIncidentDetails />} />
      </Route>

      {/* Catch-all to redirect back to user view or admin index */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
