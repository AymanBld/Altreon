import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function TriageCommandCenter() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState(new Set(['Critical', 'High', 'Medium', 'Low']));
  const activeIncidents = incidents.filter((incident) => (incident.status || 'not resolved') !== 'resolved');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reports/admin/all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch incidents (${response.status})`);
      }
      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getSeverityStyles = (severity) => {
    const severityMap = {
      'Critical': { bg: 'bg-[#ffb4ab]/10', text: 'text-[#ffb4ab]', dot: 'bg-[#ffb4ab]', label: 'CRITICAL' },
      'High': { bg: 'bg-[#fedeaa]/10', text: 'text-[#fedeaa]', dot: 'bg-[#fedeaa]', label: 'HIGH' },
      'Medium': { bg: 'bg-[#a6f2cf]/10', text: 'text-[#a6f2cf]', dot: 'bg-[#a6f2cf]', label: 'MEDIUM' },
      'Low': { bg: 'bg-[#6fd3e7]/10', text: 'text-[#6fd3e7]', dot: 'bg-[#6fd3e7]', label: 'LOW' },
    };
    return severityMap[severity] || severityMap['Medium'];
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const allLevels = ['Critical', 'High', 'Medium', 'Low'];
  const filteredIncidents = activeIncidents.filter((incident) => {
    const sev = incident.base_severity || incident.final_severity || 'Medium';
    if (selectedLevels.size === 0) return true; // no filter => show all
    return selectedLevels.has(sev);
  });

  return (
    <main className="flex-1 pt-8 px-6 pb-12 overflow-y-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-[#e0e3df]">Active Incidents</h2>
          <p className="text-base text-[#bec9c2] mt-2">Monitoring {filteredIncidents.length} incidents from the system.</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button onClick={() => setShowFilter((s) => !s)} className="bg-[#1c201e] border border-[#3f4943] text-[#e0e3df] px-4 py-2 rounded font-mono text-[11px] uppercase tracking-wider hover:border-[#a6f2cf] hover:text-[#a6f2cf] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0f1412] border border-[#2f3a34] rounded shadow-lg p-3 z-20">
                <div className="text-xs text-[#bec9c2] mb-2">Severity</div>
                {allLevels.map((lvl) => {
                  const active = selectedLevels.has(lvl);
                  return (
                    <label key={lvl} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={active} onChange={() => toggleLevel(lvl)} className="w-4 h-4" />
                      <span className="text-[#e0e3df]">{lvl}</span>
                    </label>
                  );
                })}
                <div className="flex justify-between mt-2">
                  <button onClick={() => setSelectedLevels(new Set(allLevels))} className="text-xs text-[#a6f2cf]">Select All</button>
                  <button onClick={() => setSelectedLevels(new Set())} className="text-xs text-[#ffb4ab]">Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Triage List */}
      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-center py-8 text-[#bec9c2]">Loading incidents...</div>
        )}

        {error && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] rounded-lg p-4 text-[#ffb4ab]">
            Error: {error}
          </div>
        )}

        {!loading && filteredIncidents.length === 0 && (
          <div className="text-center py-8 text-[#bec9c2]">No incidents found</div>
        )}

        {!loading && filteredIncidents.map((incident) => {
          const severity = incident.base_severity || incident.final_severity || 'Medium';
          const severityStyles = getSeverityStyles(severity);
          const relativeTime = getRelativeTime(incident.timestamp);

          return (
            <div key={incident.id} className="bg-[#1c201e]/50 backdrop-blur-md border border-[#3f4943]/30 rounded-lg p-4 flex items-center gap-6 hover:border-[#a6f2cf]/50 transition-all group cursor-pointer">
              <div className="w-24">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${severityStyles.bg} ${severityStyles.text} font-mono text-[11px] uppercase tracking-wider`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${severityStyles.dot}`}></span>
                  {severityStyles.label}
                </span>
              </div>
              <div className="w-32 flex flex-col gap-1">
                <span className="font-mono text-[14px] text-[#bec9c2]">INC-{incident.id}</span>
                <span className="text-[10px] text-[#bec9c2]/60 uppercase tracking-tighter">{incident.source_name || 'System'}</span>
              </div>
              <div className="flex-1">
                <Link to={`/admin/incident/${incident.id}`} className="block hover:opacity-80">
                  <div className="flex items-center gap-2 mb-1">
                    {incident.ai_summary?.includes('CORRELATION') && (
                      <span className="bg-[#a6f2cf]/10 text-[#a6f2cf] text-[9px] px-1.5 py-0.5 rounded border border-[#a6f2cf]/30 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">link</span>
                        CORRELATED
                      </span>
                    )}
                  </div>
                  <p className="text-base text-[#e0e3df] group-hover:text-[#a6f2cf] transition-colors line-clamp-2 font-medium">
                    {incident.description || 'No description available'}
                  </p>
                </Link>
              </div>
              <div className={`w-24 text-right font-mono text-[14px] ${severityStyles.text}`}>
                {relativeTime}
              </div>
              <div>
                <button className="text-[#bec9c2] hover:text-[#a6f2cf] p-2">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
