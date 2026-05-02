import { Link, useParams } from 'react-router-dom';

export default function IncidentDetails() {
  const { id } = useParams();

  return (
    <main className="flex-1 pt-8 p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full relative font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded bg-[#ffb4ab]/10 text-[#ffb4ab] font-mono text-xs uppercase tracking-wider">CRITICAL</span>
            <h1 className="text-2xl font-semibold text-[#e0e3df] m-0">Ransomware Alert #INC-{id || '9902'}</h1>
          </div>
          <p className="text-[#bec9c2] text-sm">Detected anomalous encryption activity across multiple endpoints.</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/admin/resolution/${id || '9902'}`} className="px-4 py-2 rounded bg-[#a6f2cf] text-[#002115] text-sm hover:bg-[#8bd6b4] transition-colors shadow-sm inline-flex items-center">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">REPORTER</span>
                <span className="block text-[#e0e3df] text-[14px]">Automated Detection (EDR)</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">DATE / TIME</span>
                <span className="block text-[#e0e3df] font-mono text-[14px]">2023-10-27T08:14:32Z</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">CATEGORY</span>
                <span className="block text-[#e0e3df] font-mono text-[14px]">Phishing / Credential Theft</span>
              </div>
              <div>
                <span className="block text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider mb-1">SECURITY LEVEL</span>
                <span className="block text-[#ffb4ab] font-mono text-[14px]">Critical (SEV-1)</span>
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
              {/* User Message */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider px-2">User</span>
                <div className="bg-[#272b28] border border-[#3f4943] text-[#e0e3df] p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                  I'm seeing a weird popup saying my files are encrypted, and I can't open any of my financial reports.
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[#a6f2cf] font-mono text-[11px] uppercase tracking-wider px-2">CyberBase AI</span>
                <div className="bg-[#1b6b4f]/20 border border-[#1b6b4f]/40 text-[#e0e3df] p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed">
                  I understand. This sounds like a potential ransomware event. Did you enter your password on any unfamiliar sites recently, or did you just click a link?
                </div>
              </div>

              {/* User Message */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider px-2">User</span>
                <div className="bg-[#272b28] border border-[#3f4943] text-[#e0e3df] p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                  No, I just clicked a link in an email I thought was from HR.
                </div>
              </div>

              {/* AI Message */}
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[#a6f2cf] font-mono text-[11px] uppercase tracking-wider px-2">CyberBase AI</span>
                <div className="bg-[#1b6b4f]/20 border border-[#1b6b4f]/40 text-[#e0e3df] p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed">
                  Thank you for the details. I have escalated this immediately to the security operations team as a Critical SEV-1 incident. Please disconnect your computer from the network if possible, and do not reboot it.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar Actions/Comments) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
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
                  <span className="text-sm font-semibold text-[#a6f2cf]">J. Doe (L2 Analyst)</span>
                  <span className="font-mono text-[14px] text-xs text-[#bec9c2]">10 mins ago</span>
                </div>
                <p className="text-sm text-[#e0e3df]">I've isolated SRV-FIN-01 and 02 from the network. Pulling memory dumps now for further analysis.</p>
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
