import { useNavigate } from 'react-router-dom';

export default function ComplianceVault() {
  const navigate = useNavigate();
  return (
    <main className="flex-1 pt-8 px-6 md:px-12 pb-12 overflow-x-hidden w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-[#e0e3df] mb-2">Compliance Vault</h2>
          <p className="text-[14px] text-[#bec9c2] max-w-2xl">Immutable audit log for all system-level actions. Cryptographically signed and tamper-evident. Retention period: 7 Years.</p>
        </div>
      </div>

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
              <tr 
                className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                onClick={() => navigate('/admin/solved-incident/INC-9942-A')}
              >
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                    2023-10-27T08:14:02Z
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">INC-9942-A</td>
                <td className="px-6 py-3">Privilege Escalation Blocked</td>
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">System_Auto_Guard</td>
              </tr>
              <tr 
                className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                onClick={() => navigate('/admin/solved-incident/REQ-8110-C')}
              >
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                    2023-10-27T07:55:18Z
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">REQ-8110-C</td>
                <td className="px-6 py-3">Firewall Rule Modified (Port 443)</td>
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">J.Doe [Admin]</td>
              </tr>
              <tr 
                className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                onClick={() => navigate('/admin/solved-incident/SYS-AUTO-01')}
              >
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                    2023-10-27T06:30:00Z
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">SYS-AUTO-01</td>
                <td className="px-6 py-3">Daily Encrypted Backup Executed</td>
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">Cron_Daemon</td>
              </tr>
              <tr 
                className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                onClick={() => navigate('/admin/solved-incident/INC-9941-F')}
              >
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                    2023-10-27T04:12:44Z
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-[#ffb4ab]">INC-9941-F</td>
                <td className="px-6 py-3 text-[#ffb4ab]">Unauthorized Access Attempt (DB_Main)</td>
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">Unknown [IP: 192.168.x.x]</td>
              </tr>
              <tr 
                className="hover:bg-[#1c201e]/50 transition-colors group cursor-pointer"
                onClick={() => navigate('/admin/solved-incident/AUDIT-EOD')}
              >
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2] group-hover:text-[#a6f2cf] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#89938c] opacity-30">lock</span>
                    2023-10-26T23:59:59Z
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">AUDIT-EOD</td>
                <td className="px-6 py-3">End of Day Log Seal Generated</td>
                <td className="px-6 py-3 whitespace-nowrap text-[#bec9c2]">System_Vault</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination / Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#101412]/50 bg-[#1c201e]/50 font-mono text-xs text-[#bec9c2]">
          <div>Showing 1-5 of 8,492 logs</div>
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
