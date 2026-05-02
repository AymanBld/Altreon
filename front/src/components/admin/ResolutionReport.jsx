import { useParams } from 'react-router-dom';

export default function ResolutionReport() {
  const { id } = useParams();

  return (
    <main className="flex-1 pt-8 p-6 md:p-8 xl:p-10 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="mb-8 border-b border-[#323633] pb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#ffb4ab] bg-[#ffb4ab]/10 px-2 py-0.5 rounded-sm font-mono text-[11px] uppercase tracking-wider border border-[#ffb4ab]/20">SEV-1</span>
            <span className="text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider">INC-{id || '2023-0892'}</span>
          </div>
          <h1 className="text-4xl font-bold text-[#e0e3df]">Incident Resolution Report</h1>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-[#bec9c2] text-sm">Status</div>
          <div className="text-[#a6f2cf] font-mono text-[14px]">Pending Closure</div>
        </div>
      </div>

      {/* Form Grid */}
      <form className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Inputs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Root Cause Analysis */}
          <div className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)]">
            <div className="flex items-center gap-2 border-b border-[#323633] pb-2 mb-4">
              <span className="material-symbols-outlined text-[#bec9c2]">troubleshoot</span>
              <h2 className="text-xl font-semibold text-[#e0e3df]">Root Cause Analysis</h2>
            </div>
            <p className="text-sm text-[#bec9c2] mb-4">Provide a detailed technical breakdown of the vulnerability or failure point that led to the incident.</p>
            <textarea 
              className="w-full h-40 bg-[#272b28] border border-[#3f4943] focus:border-[#a6f2cf] focus:ring-1 focus:ring-[#a6f2cf] rounded-lg p-4 text-[#e0e3df] font-mono text-[14px] resize-y outline-none transition-all duration-200" 
              placeholder="Describe technical root cause here..."
            ></textarea>
          </div>

          {/* Resolution Summary */}
          <div className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)]">
            <div className="flex items-center gap-2 border-b border-[#323633] pb-2 mb-4">
              <span className="material-symbols-outlined text-[#bec9c2]">build_circle</span>
              <h2 className="text-xl font-semibold text-[#e0e3df]">Resolution Summary</h2>
            </div>
            <p className="text-sm text-[#bec9c2] mb-4">Outline the definitive actions taken to neutralize the threat and restore normal operations.</p>
            <textarea 
              className="w-full h-32 bg-[#272b28] border border-[#3f4943] focus:border-[#a6f2cf] focus:ring-1 focus:ring-[#a6f2cf] rounded-lg p-4 text-[#e0e3df] font-mono text-[14px] resize-y outline-none transition-all duration-200" 
              placeholder="Summarize resolution actions..."
            ></textarea>
          </div>
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Final Status & Submission */}
          <div className="bg-[rgba(10,30,51,0.7)] backdrop-blur-[16px] border border-[rgba(137,147,140,0.1)] rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)] mt-auto">

            <button className="w-full bg-[#A7F3D0] hover:bg-[#8bd6b4] text-[#051424] text-xl font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group" type="submit">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
              Submit &amp; Lock Record
            </button>
            <p className="text-sm text-[#bec9c2] mt-2 text-center">This action will append to the immutable audit log.</p>
          </div>
        </div>
      </form>
    </main>
  );
}
