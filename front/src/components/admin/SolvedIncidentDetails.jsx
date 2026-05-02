import { Link, useParams } from 'react-router-dom';

export default function SolvedIncidentDetails() {
  const { id } = useParams();

  return (
    <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-5xl mx-auto w-full relative font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded bg-[#a6f2cf]/10 text-[#a6f2cf] font-mono text-xs uppercase tracking-wider border border-[#a6f2cf]/20">RESOLVED</span>
            <h1 className="text-2xl font-semibold text-[#e0e3df] m-0">Incident Record #{id || '9942-A'}</h1>
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
              <span className="block text-[#e0e3df] text-[14px]">System_Auto_Guard</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">DATE RESOLVED</span>
              <span className="block text-[#e0e3df] font-mono text-[14px]">2023-10-27</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">CATEGORY</span>
              <span className="block text-[#e0e3df] font-mono text-[14px]">Access Violation</span>
            </div>
            <div>
              <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">SECURITY LEVEL</span>
              <span className="block text-[#a6f2cf] font-mono text-[14px]">High</span>
            </div>
          </div>
        </section>

        {/* Simplified Detailed Solution */}
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
                "Detected and blocked an attempted privilege escalation via a legacy database connector vulnerability."
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[#e0e3df] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
                  Immediate disabling of compromised source credentials.
                </li>
                <li className="flex items-center gap-3 text-[#e0e3df] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
                  Global perimeter firewall IP blacklisting of origin source.
                </li>
                <li className="flex items-center gap-3 text-[#e0e3df] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
                  Legacy database connector successfully replaced with a secure encrypted alternative.
                </li>
                <li className="flex items-center gap-3 text-[#e0e3df] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
                  Full system scan completed with zero additional anomalies found.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
