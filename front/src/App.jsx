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
  const [currentView, setCurrentView] = useState('user');
  const navigate = useNavigate();

  // If we are in user view, show the user interface
  if (currentView === 'user') {
    return (
      <div className="w-screen h-screen flex flex-col bg-slate-900 overflow-hidden relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex gap-2">
          <button 
            onClick={() => setCurrentView('user')}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all bg-blue-100 text-blue-900 shadow-sm ring-1 ring-blue-300"
          >
            Frictionless Reporter
          </button>
          <button 
            onClick={() => {
              setCurrentView('admin');
              navigate('/admin');
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all text-slate-600 hover:bg-slate-100"
          >
            Triage Dashboard
          </button>
        </div>
        <div className="flex-1 w-full h-full relative">
          <ReporterWizard onComplete={() => alert('Incident reported successfully!')} />
        </div>
      </div>
    );
  }

  // Admin view uses routes
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout setCurrentView={setCurrentView} />}>
        <Route index element={<TriageCommandCenter />} />
        <Route path="compliance" element={<ComplianceVault />} />
        <Route path="incident/:id" element={<IncidentDetails />} />
        <Route path="resolution/:id" element={<ResolutionReport />} />
        <Route path="solved-incident/:id" element={<SolvedIncidentDetails />} />
      </Route>
      {/* Catch-all to redirect back to admin if in admin mode but path doesn't match */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
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
