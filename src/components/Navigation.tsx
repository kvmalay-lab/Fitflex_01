export default function Navigation({ currentTab, setTab, children }: { currentTab: string, setTab: (t: string) => void, children: React.ReactNode }) {
  const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuB5kq88DqK_TYuZxLdwKrUzeuCXT-oqq_kP_r2088bVvTFxZ3iSFqFtbBv58wVER6Dncw6klMKJKyyeIb6hH6n0lscKNx8LID6vSmBBFOzGfo69z0e9Mm5nfyKKUrdrVUbWkscHe0Gtd-B53qGElvc7Rm4vgccGTLydvniyv1PZL3jcj_oXXCgJ1j_oeBcqH9j3Rxjeq9ktQYyvzECZTDH5WNgnabavq1wEx-8NgRM-vyYFzet4CI6buzHwJ6_MoDVADNvbtm1EuikY";

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row pb-24 md:pb-0 overflow-x-hidden">
      {/* TopAppBar (Mobile) */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#191c22]/60 backdrop-blur-xl md:hidden transition-all duration-200">
        <div className="flex items-center gap-4">
          <img alt="User Profile" className="w-8 h-8 rounded-full object-cover" src={userAvatar} />
          <span className="text-xl font-black text-[#b6c4ff] font-headline tracking-tight">FitFlex AI</span>
        </div>
        <button className="text-[#b6c4ff] hover:bg-[#272a31] transition-colors p-2 rounded-full active:scale-95 duration-200">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* NavigationDrawer (Desktop) */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 py-8 w-72 bg-[#10131a] border-r border-[#ffffff]/10 z-40 transition-transform duration-300">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-black text-[#b6c4ff] font-headline tracking-tight">FitFlex AI</h1>
        </div>
        <div className="px-6 mb-8 flex items-center gap-4">
          <img alt="User Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-surface-container" src={userAvatar} />
          <div>
            <div className="font-headline font-bold text-on-surface text-base">Alex Sterling</div>
            <div className="font-body text-xs text-on-surface-variant">Pro Athlete • Level 42</div>
          </div>
        </div>
        <div className="flex-1 px-4 space-y-2">
          <button onClick={() => setTab('dashboard')} className={`w-full flex items-center gap-3 ${currentTab === 'dashboard' ? 'bg-gradient-to-r from-[#2962ff] to-[#b6c4ff] text-white' : 'text-[#c3c5d8] hover:bg-[#1d2026]'} rounded-r-full py-3 px-6 font-headline text-sm font-medium transition-all group`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">{currentTab === 'dashboard' ? 'dashboard' : 'grid_view'}</span>
            Dashboard
          </button>
          <button onClick={() => setTab('training')} className={`w-full flex items-center gap-3 ${currentTab === 'training' ? 'bg-gradient-to-r from-[#2962ff] to-[#b6c4ff] text-white' : 'text-[#c3c5d8] hover:bg-[#1d2026]'} rounded-r-full py-3 px-6 font-headline text-sm font-medium transition-all group`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">event_note</span>
            Training Plans
          </button>
          <button onClick={() => setTab('analytics')} className={`w-full flex items-center gap-3 ${currentTab === 'analytics' ? 'bg-gradient-to-r from-[#2962ff] to-[#b6c4ff] text-white' : 'text-[#c3c5d8] hover:bg-[#1d2026]'} rounded-r-full py-3 px-6 font-headline text-sm font-medium transition-all group`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">insights</span>
            Performance
          </button>
          <button onClick={() => setTab('community')} className={`w-full flex items-center gap-3 ${currentTab === 'community' ? 'bg-gradient-to-r from-[#2962ff] to-[#b6c4ff] text-white' : 'text-[#c3c5d8] hover:bg-[#1d2026]'} rounded-r-full py-3 px-6 font-headline text-sm font-medium transition-all group`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
            Community
          </button>
        </div>
        <div className="px-4 mt-auto">
          <button onClick={() => setTab('settings')} className={`w-full flex items-center gap-3 ${currentTab === 'settings' ? 'bg-gradient-to-r from-[#2962ff] to-[#b6c4ff] text-white' : 'text-[#c3c5d8] hover:bg-[#1d2026]'} rounded-r-full py-3 px-6 font-headline text-sm font-medium transition-all group`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
            Settings
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-20 md:pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full min-h-screen">
        {children}
      </main>

      {/* Bottom NavBar (Mobile) */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 md:hidden bg-[#191c22]/80 backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_24px_rgba(0,21,80,0.08)]">
        <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform ${currentTab === 'dashboard' ? 'bg-[#2962ff] text-white' : 'text-[#c3c5d8] hover:text-[#b6c4ff]'}`}>
          <span className="material-symbols-outlined mb-1 text-[20px]" style={{ fontVariationSettings: currentTab === 'dashboard' ? "'FILL' 1" : undefined }}>fitness_center</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-semibold mt-1">Workout</span>
        </button>
        <button onClick={() => setTab('analytics')} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform ${currentTab === 'analytics' ? 'bg-[#2962ff] text-white' : 'text-[#c3c5d8] hover:text-[#b6c4ff]'}`}>
          <span className="material-symbols-outlined mb-1 text-[20px]" style={{ fontVariationSettings: currentTab === 'analytics' ? "'FILL' 1" : undefined }}>leaderboard</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-semibold mt-1">Analytics</span>
        </button>
        <button onClick={() => setTab('coach')} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform ${currentTab === 'coach' ? 'bg-[#2962ff] text-white' : 'text-[#c3c5d8] hover:text-[#b6c4ff]'}`}>
          <span className="material-symbols-outlined mb-1 text-[20px]" style={{ fontVariationSettings: currentTab === 'coach' ? "'FILL' 1" : undefined }}>psychology</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-semibold mt-1">AI Coach</span>
        </button>
        <button onClick={() => setTab('profile')} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform ${currentTab === 'profile' ? 'bg-[#2962ff] text-white' : 'text-[#c3c5d8] hover:text-[#b6c4ff]'}`}>
          <span className="material-symbols-outlined mb-1 text-[20px]" style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : undefined }}>person</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-semibold mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
