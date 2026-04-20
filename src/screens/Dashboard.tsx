import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // In a real app backend, fetch today's cumulative stats
  const totalRepsToday = parseInt(localStorage.getItem('fitflex_last_reps') || '0', 10) || 0;

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">Executive Summary</h1>
        <p className="text-on-surface-variant mt-2 font-body">Welcome back. Your total volume is up 4.2% today.</p>
      </header>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container rounded-xl p-6">
          <div className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Total Reps Today</div>
          <div className="text-4xl font-headline font-bold">{totalRepsToday > 0 ? totalRepsToday : 0}</div>
          <div className="text-xs text-tertiary mt-1">+12.4% this month</div>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <div className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Active Sessions</div>
          <div className="text-4xl font-headline font-bold">1</div>
          <div className="text-xs text-on-surface-variant mt-1">Available today</div>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <div className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">AI Insights</div>
          <div className="text-4xl font-headline font-bold">2</div>
          <div className="text-xs text-tertiary mt-1">New opportunities</div>
        </div>
      </div>

      {/* Start Workout Section */}
      <div className="bg-surface-container-low rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-headline font-bold">Start Workout</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => navigate('/workout/bicep_curl')} className="w-full text-left bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary text-xl font-bold">
               BC
            </div>
            <div>
               <div className="text-sm font-bold">Bicep Curl</div>
               <div className="text-xs text-on-surface-variant">Focus: Arms</div>
            </div>
            <div className="ml-auto text-xs text-tertiary font-bold">+2.4%</div>
          </button>
          
          <button onClick={() => navigate('/workout/squat')} className="w-full text-left bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary text-xl font-bold">
               SQ
            </div>
            <div>
               <div className="text-sm font-bold">Squat</div>
               <div className="text-xs text-on-surface-variant">Focus: Legs</div>
            </div>
            <div className="ml-auto text-xs text-error font-bold">-1.2%</div>
          </button>
          
          <button onClick={() => navigate('/workout/push_up')} className="w-full text-left bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary text-xl font-bold">
               PU
            </div>
            <div>
               <div className="text-sm font-bold">Push Up</div>
               <div className="text-xs text-on-surface-variant">Focus: Chest</div>
            </div>
             <div className="ml-auto text-xs text-tertiary font-bold">+4.0%</div>
          </button>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
        <h3 className="text-sm font-bold mb-4">Hardware Connectivity</h3>
        <div className="flex items-center justify-center h-24">
           <div className="text-center">
              <div className="text-2xl font-bold text-on-surface-variant">No External Machine Connected</div>
              <div className="text-xs text-on-surface-variant mt-1">Using Device Camera for Tracking</div>
           </div>
        </div>
      </div>
    </>
  );
}
