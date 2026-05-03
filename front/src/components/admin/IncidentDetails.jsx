import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function IncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedIncidents, setRelatedIncidents] = useState([]);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  useEffect(() => {
    if (incident?.ai_summary?.includes('Related Incidents:')) {
      const part = incident.ai_summary.split('Related Incidents:').pop();
      const ids = part.split(',').map(s => s.trim()).filter(Boolean);
      fetchRelated(ids);
    }
  }, [incident]);

  const fetchRelated = async (ids) => {
    try {
      const results = await Promise.all(ids.map(rid => 
        fetch(`${API_BASE_URL}/incident/${rid}`).then(r => r.json())
      ));
      setRelatedIncidents(results.filter(r => r && r.id));
    } catch (err) {
      console.error('Error fetching related:', err);
    }
  };

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
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    const severityMap = {
      'Critical': { bg: 'bg-[#ffb4ab]/10', text: 'text-[#ffb4ab]', label: 'CRITICAL' },
      'High': { bg: 'bg-[#fedeaa]/10', text: 'text-[#fedeaa]', label: 'HIGH' },
      'Medium': { bg: 'bg-[#a6f2cf]/10', text: 'text-[#a6f2cf]', label: 'MEDIUM' },
      'Low': { bg: 'bg-[#6fd3e7]/10', text: 'text-[#6fd3e7]', label: 'LOW' },
    };
    return severityMap[severity] || severityMap['Medium'];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
        <div className="text-center text-[#bec9c2]">Loading incident...</div>
      </main>
    );
  }

  if (error || !incident) {
    return (
      <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
        <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] rounded-lg p-4 text-[#ffb4ab]">
          Error: {error || 'Incident not found'}
        </div>
      </main>
    );
  }

  const severityStyle = getSeverityStyle(incident.base_severity || incident.final_severity);
  const conversationLog = Array.isArray(incident.conversation_log) ? incident.conversation_log : [];

  return (
    <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full relative font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded ${severityStyle.bg} ${severityStyle.text} font-mono text-xs uppercase tracking-wider`}>
              {severityStyle.label}
            </span>
            <h1 className="text-2xl font-semibold text-[#e0e3df] m-0">Incident #INC-{incident.id}</h1>
          </div>
          <p className="text-[#bec9c2] text-sm">{incident.description || 'No description'}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/admin/resolution/${incident.id}`} className="px-4 py-2 rounded bg-[#a6f2cf] text-[#002115] text-sm hover:bg-[#8bd6b4] transition-colors shadow-sm inline-flex items-center">
            Resolve Incident
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (Main Details) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Incident Information */}
          <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)]">
            <div className="border-b border-[#3f4943]/30 pb-4 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e0e3df] m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bec9c2]">info</span>
                Incident Information
              </h2>
            </div>

            {incident.ai_summary && (
              <div className={`mb-6 p-4 rounded-lg border ${incident.ai_summary.includes('CORRELATION') ? 'bg-[#1b6b4f]/10 border-[#1b6b4f]/40' : 'bg-[#3f4943]/10 border-[#3f4943]/30'}`}>
                <div className="flex items-center gap-2 mb-2 text-[#a6f2cf]">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI Analysis Report</span>
                </div>
                <p className="text-sm text-[#e0e3df] leading-relaxed whitespace-pre-wrap">
                  {incident.ai_summary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">REPORTER</span>
                <span className="block text-[#e0e3df] text-[14px]">{incident.source_type === 'user' ? 'Employee' : 'System'} ({incident.source_name})</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">DATE / TIME</span>
                <span className="block text-[#e0e3df] font-mono text-[14px]">{formatDate(incident.timestamp)}</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">DEVICE IP</span>
                <span className="block text-[#e0e3df] font-mono text-[14px]">{incident.device_ip || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">SECURITY LEVEL</span>
                <span className={`block font-mono text-[14px] ${severityStyle.text}`}>{severityStyle.label}</span>
              </div>
            </div>
          </section>

          {/* AI Conversation Log */}
          <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)]">
            <div className="border-b border-[#3f4943]/30 pb-4 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e0e3df] m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a6f2cf]">forum</span>
                AI Conversation Log
              </h2>
            </div>
            <div className="space-y-4">
              {conversationLog.length === 0 ? (
                <p className="text-[#bec9c2]">No conversation log available</p>
              ) : (
                conversationLog.map((msg, idx) => (
                  msg.role === 'user' ? (
                    <div key={idx} className="flex flex-col gap-1 items-end">
                      <span className="text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider px-2">User</span>
                      <div className="bg-[#272b28] border border-[#3f4943] text-[#e0e3df] p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex flex-col gap-1 items-start">
                      <span className="text-[#a6f2cf] font-mono text-[11px] uppercase tracking-wider px-2">Altreon AI</span>
                      <div className="bg-[#1b6b4f]/20 border border-[#1b6b4f]/40 text-[#e0e3df] p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar Actions/Comments) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Related Incidents */}
          {relatedIncidents.length > 0 && (
            <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#a6f2cf]/30 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)]">
              <div className="border-b border-[#3f4943]/30 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#a6f2cf] m-0 flex items-center gap-2">
                  <span className="material-symbols-outlined">link</span>
                  Related Incident Logs
                </h2>
              </div>
              <div className="space-y-6">
                {relatedIncidents.map((related) => (
                  <div key={related.id} className="p-4 bg-[#272b28] border border-[#3f4943] rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-[#a6f2cf]">INC-# {related.id}</span>
                      <span className="text-[11px] font-mono text-[#bec9c2]">{formatDate(related.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[#e0e3df] mb-3 leading-relaxed">{related.description}</p>
                    {related.conversation_log && (
                      <div className="mt-2 pt-2 border-t border-[#3f4943]/50">
                        <span className="text-[10px] font-mono text-[#bec9c2] block mb-1">CONVERSATION SNIPPET:</span>
                        <div className="bg-black/20 p-2 rounded text-[12px] text-[#bec9c2] italic">
                          "{related.conversation_log[0]?.content.substring(0, 100)}..."
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comment Section */}
          <section className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_12px_32px_0_rgba(2,8,16,0.6)] flex-1 flex flex-col">
            <div className="border-b border-[#3f4943]/30 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-[#e0e3df] m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bec9c2]">chat</span>
                Investigation Notes
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[200px] mb-4 space-y-4">
              <div className="bg-[#181c1a] p-3 rounded-lg border border-[#3f4943]/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#a6f2cf]">System</span>
                  <span className="font-mono text-[14px] text-xs text-[#bec9c2]">Just now</span>
                </div>
                <p className="text-sm text-[#e0e3df]">Incident created from {incident.source_name} report. Status: {incident.is_processed ? 'Processed' : 'Pending Review'}</p>
              </div>
            </div>
            <div className="mt-auto">
              <label className="sr-only" htmlFor="comment">Add Comment</label>
              <textarea 
                className="w-full bg-[#323633] border border-[#3f4943] rounded-lg p-3 text-[#e0e3df] text-sm focus:outline-none focus:border-[#a6f2cf] focus:ring-1 focus:ring-[#a6f2cf] resize-none" 
                id="comment" 
                placeholder="Add investigation notes or commands..." 
                rows="3"
              ></textarea>
              <div className="flex justify-end mt-3">
                <button className="px-4 py-2 rounded bg-[#323633] text-[#e0e3df] text-sm border border-[#3f4943] hover:bg-[#89938c] transition-colors">Post Note</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
