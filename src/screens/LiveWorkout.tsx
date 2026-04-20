import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutTracking } from '../hooks/useWorkoutTracking';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// BoundingBox Component for Calibration
function BoundingBoxOverlay({ status }: { status: string }) {
  const isBad = status === 'LOW_CONFIDENCE' || status === 'INVALID';
  const color = isBad ? 'border-error' : status === 'WARNING' ? 'border-[#f59e0b]' : 'border-tertiary';
  return (
    <div className={cn("absolute inset-[10%] lg:inset-[20%] border-4 border-dashed rounded-3xl pointer-events-none transition-colors duration-300 opacity-50", color)}></div>
  );
}

export default function LiveWorkout() {
  const { exercise } = useParams();
  const navigate = useNavigate();
  const { stats, isLoading, frameUrl } = useWorkoutTracking(exercise || 'bicep_curl');
  const { playBeep, playBuzz, initAudio } = useAudioFeedback();
  
  const [isPaused, setIsPaused] = useState(false);
  const [eyesFree, setEyesFree] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true); // Toggle logic for UI trust

  // Monitor Reps & Form to Trigger Audio
  const previousReps = useRef(stats.rep_count);
  const previousStatus = useRef(stats.form_status);

  useEffect(() => {
    // Rep increment detection
    if (stats.rep_count > previousReps.current) {
      if (eyesFree || !isPaused) playBeep();
      previousReps.current = stats.rep_count;
    }
    
    // Form degradation detection
    if ((stats.form_status === 'WARNING' || stats.form_status === 'INVALID') && previousStatus.current === 'VALID') {
       if (eyesFree || !isPaused) playBuzz();
    }
    previousStatus.current = stats.form_status;
  }, [stats.rep_count, stats.form_status, playBeep, playBuzz, eyesFree, isPaused]);

  // Audio interaction requires a user click, trigger on load or on interaction
  useEffect(() => { initAudio(); }, [initAudio]);

  const handleEnd = () => {
    // Persistence
    localStorage.setItem('fitflex_last_session', JSON.stringify({
      exercise,
      reps: stats.rep_count,
      status: stats.form_status,
      date: new Date().toISOString()
    }));
    // Cumulative metrics
    const totals = parseInt(localStorage.getItem('fitflex_last_reps') || '0', 10);
    localStorage.setItem('fitflex_last_reps', (totals + stats.rep_count).toString());
    
    navigate('/summary');
  };

  // Border color based on status
  const containerBorderColor =
    stats.form_status === 'INVALID' || stats.form_status === 'LOW_CONFIDENCE'
      ? 'border-error'
      : stats.form_status === 'WARNING'
      ? 'border-[#f59e0b]'
      : 'border-tertiary';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Immersive Workout View (V2) */}
      <div 
        className={cn(
           "relative w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row transition-all duration-500",
           // Only add thick borders when tracking is active and not paused
           !isLoading && !isPaused ? `border-8 ${containerBorderColor} rounded-3xl m-2 lg:m-4` : 'border-0'
        )}
      >
        
        {/* Header Overlay Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-8 flex justify-between items-start z-50 pointer-events-none">
          <div className="bg-surface-container/60 backdrop-blur-md px-4 py-2 rounded-full border border-outline pointer-events-auto flex gap-4">
             <button onClick={() => setEyesFree(!eyesFree)} className={cn("text-on-surface px-2 rounded-full font-bold text-xs uppercase tracking-widest", eyesFree ? "text-primary" : "opacity-50")}>
               <span className="material-symbols-outlined align-middle mr-1 text-sm">{eyesFree ? 'volume_up' : 'volume_off'}</span> Eyes-Free
             </button>
             <button onClick={() => setShowSkeleton(!showSkeleton)} className={cn("text-on-surface px-2 rounded-full font-bold text-xs uppercase tracking-widest", showSkeleton ? "text-tertiary" : "opacity-50")}>
               <span className="material-symbols-outlined align-middle mr-1 text-sm">{showSkeleton ? 'visibility' : 'visibility_off'}</span> Skeleton
             </button>
          </div>
          
          <button onClick={handleEnd} className="bg-error hover:bg-error-container text-white px-6 py-3 rounded-full font-bold tracking-widest uppercase pointer-events-auto shadow-2xl transition-colors">
            Exit
          </button>
        </div>

        {/* Camera Feed Background (Fills entire container) */}
        <div className="absolute inset-0 bg-surface z-0 overflow-hidden rounded-2xl">
          {isLoading ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
               <span className="material-symbols-outlined text-5xl animate-spin mb-4">progress_activity</span>
               <p className="font-headline text-lg tracking-widest uppercase">Connecting Tracker</p>
             </div>
          ) : (
             <>
               <img 
                  src={frameUrl} 
                  alt="Live Camera Feed Stream" 
                  className={cn("w-full h-full object-cover", !showSkeleton && "contrast-[1.1] grayscale-[0.2]")}
               />
               <BoundingBoxOverlay status={stats.form_status} />
             </>
          )}
        </div>

        {/* Massive Centered Stats Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none drop-shadow-2xl">
          {!isLoading && (
            <>
              <div 
                 className={cn(
                   "text-[12rem] lg:text-[18rem] leading-none font-black font-headline tabular-nums tracking-tighter drop-shadow-2xl transition-colors duration-200", 
                   stats.form_status === 'VALID' ? "text-white" : stats.form_status === 'WARNING' ? "text-[#f59e0b]" : "text-error"
                 )}
              >
                {stats.rep_count}
              </div>
              
              <div className={cn(
                "px-8 py-3 rounded-full backdrop-blur-xl border-2 font-headline font-bold text-2xl uppercase tracking-widest mt-4 transition-all duration-300",
                stats.form_status === 'VALID' ? "bg-tertiary/20 text-tertiary border-tertiary" : 
                stats.form_status === 'WARNING' ? "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]" : 
                stats.form_status === 'LOW_CONFIDENCE' ? "bg-on-surface/20 text-on-surface border-on-surface" :
                "bg-error/20 text-error border-error animate-pulse"
              )}>
                {stats.form_status === 'VALID' ? 'Good Form' : 
                 stats.form_status === 'LOW_CONFIDENCE' ? 'Step Back' : 
                 stats.feedback || 'Fix Posture'}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
