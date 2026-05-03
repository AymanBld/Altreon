import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function ComplianceVault() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResolvedIncidents();
  }, []);

  const fetchResolvedIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reports/admin/resolved`);
      if (!response.ok) {
        throw new Error(`Failed to fetch solved incidents (${response.status})`);
      }
      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching solved incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toISOString();
  };

  const getActionTaken = (incident) => {
    if (incident.final_admin_report) {
      return incident.final_admin_report;
    }
    return 'Resolved incident';
  };

  return (
    <main className="flex-1 pt-8 px-6 md:px-12 pb-12 overflow-x-hidden w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-[#e0e3df] mb-2">Compliance Vault</h2>
          <p className="text-[14px] text-[#bec9c2] max-w-2xl">Immutable audit log for all resolved incidents. Cryptographically signed and tamper-evident. Retention period: 7 Years.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Vault Table Container */}
      <div className="bg-[#272b28] rounded-xl border border-[#3f4943] overflow-hidden shadow-[0_8px_32px_0_rgba(2,8,16,0.5)]">
        {/* Table Controls / Filter Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#101412]/50 bg-[#1c201e]/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#bec9c2] uppercase tracking-wider">Vault Status:</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#a6f2cf]/10 border border-[#a6f2cf]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
              <span className="font-mono text-[11px] text-[#a6f2cf]">Sealed &amp; Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-[#bec9c2] hover:text-[#e0e3df] transition-colors rounded">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-[#bec9c2]">Loading solved incidents...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#323633]/80 backdrop-blur-md border-b border-[#3f4943] font-mono text-[11px] text-[#bec9c2] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium"><span className="material-symbols-outlined text-[14px] align-middle mr-1 opacity-50">lock</span> Timestamp (UTC)</th>
                  <th className="px-6 py-4 font-medium">Incident ID</th>
                  <th className="px-6 py-4 font-medium">Action Taken</th>
                  <th className="px-6 py-4 font-medium">Actor</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[14px] text-[#e0e3df] divide-y divide-[#101412]/50">
                {incidents.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-center text-[#bec9c2]" colSpan="4">
                      No resolved incidents found.
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/solved-incident/${incident.id}`)}
                    >
                      <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                          {formatTimestamp(incident.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">INC-{incident.id}</td>
                      <td className="px-6 py-3">{getActionTaken(incident)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">{incident.source_name || 'Unknown'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination / Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#101412]/50 bg-[#1c201e]/50 font-mono text-xs text-[#bec9c2]">
          <div>Showing 1-{incidents.length} of {incidents.length} logs</div>
          <div className="flex items-center gap-4">
            <button className="hover:text-[#a6f2cf] transition-colors disabled:opacity-50" disabled>Prev</button>
            <span className="text-[#e0e3df]">Page 1</span>
            <button className="hover:text-[#a6f2cf] transition-colors">Next</button>
          </div>
        </div>
      </div>
    </main>
  );
}
