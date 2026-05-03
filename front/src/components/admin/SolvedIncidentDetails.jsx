import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function SolvedIncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/incident/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch incident (${response.status})`);
      }
      const data = await response.json();
      setIncident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-5xl mx-auto w-full relative font-sans">
        <div className="text-center text-[#bec9c2] py-10">Loading resolved incident...</div>
      </main>
    );
  }

  if (error || !incident) {
    return (
      <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-5xl mx-auto w-full relative font-sans">
        <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded-lg px-4 py-3">
          {error || 'Resolved incident not found'}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-5xl mx-auto w-full relative font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-2 py-1 rounded bg-[#a6f2cf]/10 text-[#a6f2cf] font-mono text-xs uppercase tracking-wider border border-[#a6f2cf]/20">{incident.status || 'resolved'}</span>
            <h1 className="text-2xl font-semibold text-[#e0e3df] m-0">Incident Record #{incident.id}</h1>
          </div>
          <p className="text-[#bec9c2] text-sm">Official post-incident resolution report.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/compliance" className="px-4 py-2 rounded bg-[#323633] text-[#e0e3df] text-sm hover:bg-[#3f4943] transition-colors border border-[#3f4943] inline-flex items-center">
            Back to Vault
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Incident Information */}
        <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)]">
          <div className="border-b border-[#3f4943]/30 pb-4 mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#e0e3df] m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bec9c2]">info</span>
              Incident Metadata
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">REPORTER</span>
              <span className="block text-[#e0e3df] text-[14px]">{incident.source_name || 'Unknown'}</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">DATE RESOLVED</span>
              <span className="block text-[#e0e3df] font-mono text-[14px]">{incident.timestamp || 'Unknown'}</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">CATEGORY</span>
              <span className="block text-[#e0e3df] font-mono text-[14px]">{incident.initial_severity || 'Medium'}</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">SECURITY LEVEL</span>
              <span className="block text-[#a6f2cf] font-mono text-[14px]">{incident.final_severity || incident.initial_severity || 'Medium'}</span>
            </div>
          </div>
        </section>

        {/* Detailed Solution */}
        <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)]">
          <div className="border-b border-[#3f4943]/30 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-[#e0e3df] m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a6f2cf]">task_alt</span>
              Detailed Solution Implemented
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#181c1a] border border-[#3f4943]/30 p-4 rounded-lg">
              <p className="text-[#e0e3df] text-[14px] leading-relaxed italic opacity-80 mb-4">
                {incident.routing_info?.final_admin_report || incident.ai_summary?.executive_summary || incident.description || 'No resolution summary available.'}
              </p>

              <div className="text-sm text-[#bec9c2]">
                Incident resolved and locked in compliance vault.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
