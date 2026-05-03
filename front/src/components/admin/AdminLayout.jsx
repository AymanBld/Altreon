import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="bg-[#101412] text-[#e0e3df] min-h-screen flex antialiased dark w-full relative font-sans">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col py-8 gap-4 bg-slate-950/80 backdrop-blur-2xl text-[#8bd6b4] font-mono text-xs uppercase tracking-widest fixed left-0 h-full w-64 border-r border-slate-800/50 shadow-2xl z-40">
        <div className="px-6 pb-8">
          <h1 className="text-[#8bd6b4] font-bold tracking-tighter text-3xl">Altreon</h1>
          <p className="text-slate-400 text-[11px] mt-2 tracking-wider">Security Ops</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Link to="/admin" className={`flex items-center gap-3 px-6 py-3 transition-all duration-300 ${location.pathname === '/admin' ? 'bg-[#8bd6b4]/10 text-[#8bd6b4] border-r-2 border-[#8bd6b4]' : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-100'}`}>
            <span className="material-symbols-outlined">security</span>
            Triage
          </Link>
          <Link to="/admin/compliance" className={`flex items-center gap-3 px-6 py-3 transition-all duration-300 ${location.pathname === '/admin/compliance' ? 'bg-[#8bd6b4]/10 text-[#8bd6b4] border-r-2 border-[#8bd6b4]' : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-100'}`}>
            <span className="material-symbols-outlined">verified_user</span>
            Compliance
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">


        <Outlet />
      </div>
    </div>
  );
}
