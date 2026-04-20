import { useState, useEffect } from 'react';
import { useWorkoutTracking } from '../hooks/useWorkoutTracking';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function LiveWorkout({ exerciseType = 'bicep_curl', onEnd }: { exerciseType?: string, onEnd: () => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'VALID'|'WARNING'|'INVALID'|'LOW_CONFIDENCE'} | null>(null);
  const { stats, isLoading, error, frameUrl } = useWorkoutTracking(exerciseType);

  useEffect(() => {
    if (stats.form_status !== 'VALID' && stats.form_status !== 'LOW_CONFIDENCE') {
      setToast({ message: stats.feedback, type: stats.form_status });
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [stats.feedback, stats.form_status]);

  const formattedTime = "Live • " + (exerciseType.replace('_', ' ').toUpperCase());

  // Angle calculated into SVG Dasharray (max 180deg)
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (stats.current_angle / 180) * circumference;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-outline-variant bg-surface-container-low shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
            <span className="material-symbols-outlined icon-fill">videocam</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-on-surface">Tracking Session</h2>
            <p className="text-secondary text-xs uppercase tracking-wider font-label animate-pulse">{formattedTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined icon-fill">{isPaused ? 'play_arrow' : 'pause'}</span>
          </button>
          <button 
            onClick={onEnd}
            className="px-6 py-3 rounded-full bg-error text-white font-headline font-bold hover:bg-error-container transition-colors tracking-wide"
          >
            END
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative">
        <div className="relative w-full h-full min-h-[500px] border border-outline-variant bg-surface-container rounded-xl overflow-hidden flex flex-col">
           {isLoading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-low shadow-none">
               <span className="material-symbols-outlined text-4xl animate-spin mb-4">progress_activity</span>
               <p className="font-body tracking-wider text-sm">Connecting to Tracking Service...</p>
             </div>
           ) : (
             <div className="relative flex-1 bg-black overflow-hidden shadow-none border-none">
                <img 
                  src={frameUrl} 
                  alt="Live Camera Feed Stream" 
                  className="w-full h-full object-cover shadow-none border-none"
                />

                {toast && (
                  <div className={cn(
                    "absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full border shadow-2xl backdrop-blur-md z-50 flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-top-4",
                    toast.type === 'INVALID' ? "bg-error/90 border-error text-white" : "bg-[#f59e0b]/90 border-[#f59e0b] text-white"
                  )}>
                     <span className="material-symbols-outlined icon-fill text-lg">warning</span>
                     <span className="font-body font-bold text-sm tracking-wide">{toast.message}</span>
                  </div>
                )}

                <div className="absolute bottom-6 right-6 p-5 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant shadow-2xl min-w-[200px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Live Form</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase",
                      stats.form_status === 'VALID' ? "bg-tertiary/20 text-tertiary" : 
                      stats.form_status === 'WARNING' ? "bg-[#f59e0b]/20 text-[#f59e0b]" : 
                      "bg-error/20 text-error"
                    )}>
                      {stats.form_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant mb-1">Reps</div>
                      <div className="text-5xl font-headline font-black text-on-surface tabular-nums leading-none">{stats.rep_count}</div>
                    </div>
                    
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-highest" />
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="text-primary transition-all duration-[33ms] ease-linear" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-label text-on-surface-variant">deg</span>
                        <span className="text-sm font-headline font-bold text-on-surface leading-tight tabular-nums">{Math.round(stats.current_angle)}&deg;</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           )}
        </div>

        <div className="flex flex-col gap-6">
           <div className="bg-surface-container rounded-xl p-6 border border-outline-variant flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error relative">
               <span className="material-symbols-outlined icon-fill text-2xl animate-pulse">favorite</span>
             </div>
             <div>
               <div className="text-xs font-label uppercase text-on-surface-variant tracking-widest mb-1">Heart Rate</div>
               <div className="text-4xl font-headline font-bold text-on-surface">142 <span className="text-sm text-secondary font-body">bpm</span></div>
             </div>
           </div>

           <div className="flex-1 bg-surface-container rounded-xl border border-outline-variant p-6 flex flex-col">
              <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">Current Set Sequence</h3>
              <div className="flex-1 space-y-4">
                 {[...Array(Math.min(5, Math.max(1, stats.rep_count)))].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-highest">
                       <span className="font-body text-sm text-on-surface font-semibold">Rep {i + 1}</span>
                       <div className="flex items-center gap-2 text-xs">
                          <span className="text-secondary font-medium">Recorded</span>
                          <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                       </div>
                    </div>
                 )).reverse()}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
