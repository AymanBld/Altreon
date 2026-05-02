import { Link } from 'react-router-dom';

export default function TriageCommandCenter() {
  return (
    <main className="flex-1 pt-8 px-6 pb-12 overflow-y-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-[#e0e3df]">Active Incidents</h2>
          <p className="text-base text-[#bec9c2] mt-2">Monitoring 14 ongoing threats across 3 distinct zones.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1c201e] border border-[#3f4943] text-[#e0e3df] px-4 py-2 rounded font-mono text-[11px] uppercase tracking-wider hover:border-[#a6f2cf] hover:text-[#a6f2cf] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="bg-[#1c201e] border border-[#3f4943] text-[#e0e3df] px-4 py-2 rounded font-mono text-[11px] uppercase tracking-wider hover:border-[#a6f2cf] hover:text-[#a6f2cf] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">sort</span> Sort
          </button>
        </div>
      </div>
      
      {/* Triage List */}
      <div className="flex flex-col gap-3">
        {/* Critical Row */}
        <div className="bg-[#1c201e]/50 backdrop-blur-md border border-[#3f4943]/30 rounded-lg p-4 flex items-center gap-6 hover:border-[#a6f2cf]/50 transition-all group cursor-pointer">
          <div className="w-24">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] font-mono text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
              CRITICAL
            </span>
          </div>
          <div className="w-32 font-mono text-[14px] text-[#bec9c2]">
            INC-9921
          </div>
          <div className="flex-1">
            <Link to="/admin/incident/9921" className="block hover:opacity-80">
              <p className="text-base text-[#e0e3df] group-hover:text-[#a6f2cf] transition-colors line-clamp-2 font-medium">Detected sequence of failed auth attempts followed by successful access to sensitive internal subnet 10.0.5.x.</p>
            </Link>
          </div>
          <div className="w-48 hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bec9c2] text-sm">dns</span>
              <span className="font-mono text-[14px] text-[#bec9c2]">DB-Prod-Cluster-02</span>
            </div>
          </div>
          <div className="w-24 text-right font-mono text-[14px] text-[#ffb4ab] animate-pulse">
            2m ago
          </div>
          <div>
            <button className="text-[#bec9c2] hover:text-[#a6f2cf] p-2">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* High Row */}
        <div className="bg-[#1c201e]/50 backdrop-blur-md border border-[#3f4943]/30 rounded-lg p-4 flex items-center gap-6 hover:border-[#a6f2cf]/50 transition-all group cursor-pointer">
          <div className="w-24">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fedeaa]/10 text-[#fedeaa] font-mono text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fedeaa]"></span>
              HIGH
            </span>
          </div>
          <div className="w-32 font-mono text-[14px] text-[#bec9c2]">
            INC-9920
          </div>
          <div className="flex-1">
            <Link to="/admin/incident/9920" className="block hover:opacity-80">
              <p className="text-base text-[#e0e3df] group-hover:text-[#a6f2cf] transition-colors line-clamp-2 font-medium">Unusual spike in outbound traffic (4.2GB) over port 443 to known malicious IP range.</p>
            </Link>
          </div>
          <div className="w-48 hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bec9c2] text-sm">router</span>
              <span className="font-mono text-[14px] text-[#bec9c2]">Edge-Gateway-A</span>
            </div>
          </div>
          <div className="w-24 text-right font-mono text-[14px] text-[#fedeaa]">
            15m ago
          </div>
          <div>
            <button className="text-[#bec9c2] hover:text-[#a6f2cf] p-2">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Medium Row */}
        <div className="bg-[#1c201e]/50 backdrop-blur-md border border-[#3f4943]/30 rounded-lg p-4 flex items-center gap-6 hover:border-[#a6f2cf]/50 transition-all group cursor-pointer">
          <div className="w-24">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a6f2cf]/10 text-[#a6f2cf] font-mono text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6f2cf]"></span>
              MEDIUM
            </span>
          </div>
          <div className="w-32 font-mono text-[14px] text-[#bec9c2]">
            INC-9918
          </div>
          <div className="flex-1">
            <Link to="/admin/incident/9918" className="block hover:opacity-80">
              <p className="text-base text-[#e0e3df] group-hover:text-[#a6f2cf] transition-colors line-clamp-2 font-medium">PowerShell execution with obfuscated arguments flagged by endpoint protection.</p>
            </Link>
          </div>
          <div className="w-48 hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bec9c2] text-sm">laptop_mac</span>
              <span className="font-mono text-[14px] text-[#bec9c2]">WS-JDOE-01</span>
            </div>
          </div>
          <div className="w-24 text-right font-mono text-[14px] text-[#bec9c2]">
            1h ago
          </div>
          <div>
            <button className="text-[#bec9c2] hover:text-[#a6f2cf] p-2">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
