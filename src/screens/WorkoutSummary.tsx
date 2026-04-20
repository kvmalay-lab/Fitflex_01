import { useNavigate } from 'react-router-dom';

export default function WorkoutSummary() {
  const navigate = useNavigate();
  
  // Read stats directly from local storage session
  const storedSession = localStorage.getItem('fitflex_last_session');
  const sessionData = storedSession ? JSON.parse(storedSession) : { reps: 0, status: 'N/A', exercise: 'bicep_curl' };

  // Generate basic feedback based on final state or rep count
  let suggestion = "Consistency is key. Great job.";
  if (sessionData.status === 'WARNING' || sessionData.status === 'INVALID') {
     suggestion = "Focus on controlling the movement slowly.";
  } else if (sessionData.reps < 5 && sessionData.reps > 0) {
     suggestion = "Try taking a slightly lower weight to increase your rep count.";
  } else if (sessionData.reps === 0) {
     suggestion = "Make sure you stand far enough back from the camera to be tracked.";
  }

  const exerciseName = (sessionData.exercise || 'Unknown').replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-2">Workout Complete</h1>
        <p className="text-on-surface-variant font-body uppercase tracking-widest text-xs font-bold">{exerciseName} • Tracking Ended</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Simple Summary */}
        <div className="bg-surface-container rounded-xl p-8 flex flex-col justify-between">
           <div>
              <span className="text-sm font-label font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Total Reps</span>
              <div className="text-8xl font-headline font-black text-on-surface mb-2 tabular-nums">
                 {sessionData.reps}
              </div>
           </div>
           
           <div className="mt-8 border-t border-outline-variant pt-6">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">AI Suggestion</span>
              <p className="font-body text-on-surface text-lg font-medium leading-relaxed">
                 {suggestion}
              </p>
           </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant flex flex-col justify-center gap-8">
           <div>
             <span className="text-xs font-label uppercase text-on-surface-variant tracking-widest block mb-2">Final Form Score</span>
             <div className="text-3xl font-bold font-headline text-tertiary uppercase tracking-wider">
                {sessionData.status === 'VALID' ? 'Excellent' : sessionData.status === 'WARNING' ? 'Fair' : sessionData.status === 'LOW_CONFIDENCE' ? 'Uncalibrated' : 'Needs Work'}
             </div>
           </div>
           <div>
             <span className="text-xs font-label uppercase text-on-surface-variant tracking-widest block mb-2">Sets Completed</span>
             <div className="text-3xl font-bold font-headline text-on-surface tabular-nums">1</div>
           </div>
           
           <div className="mt-4">
               <button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-primary to-primary-container hover:opacity-90 transition-opacity text-white font-headline font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2">
                 Return to Dashboard <span className="material-symbols-outlined">arrow_forward</span>
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}
