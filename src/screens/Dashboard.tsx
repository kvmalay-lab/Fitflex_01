export default function Dashboard({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-1">Today's Session</p>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">Overview</h2>
        </div>
        <p className="font-body text-sm text-on-surface-variant text-right">Last synced: Just now</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero Card */}
        <div className="md:col-span-2 bg-surface-container rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high transition-colors duration-300 min-h-[320px]">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
          
          <div className="z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary-container/30 px-3 py-1 rounded-full border border-outline-variant/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-body text-xs font-semibold text-on-secondary-container uppercase tracking-wider">System Optimal</span>
              </div>
              <h3 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-2">Ready to Start</h3>
              <p className="font-body text-base text-on-surface-variant max-w-md">Your biometric sensors are calibrated. Today's focus is Upper Body Hypertrophy.</p>
            </div>
            <div className="hidden md:flex bg-surface-container-highest p-4 rounded-xl border border-outline-variant/15">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            </div>
          </div>

          <div className="z-10 mt-8 flex flex-col sm:flex-row gap-4 items-center w-full">
            <button onClick={onStart} className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg px-8 py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_32px_rgba(41,98,255,0.2)] flex justify-center items-center gap-2">
              Start Workout
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="w-full sm:w-auto bg-surface-container-highest text-on-surface font-body font-medium px-6 py-4 rounded-xl hover:bg-surface-variant transition-colors flex justify-center items-center gap-2 border border-outline-variant/20">
              Skip Warmup
            </button>
          </div>
        </div>

        {/* Quick Stat: Reps */}
        <div className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Daily Volume</span>
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter">124</span>
              <span className="font-body text-sm text-on-surface-variant">reps</span>
            </div>
            <div className="mt-4 h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: '65%' }}></div>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-2 text-right">65% of daily goal</p>
          </div>
        </div>

        {/* Quick Stat: Active Machine */}
        <div className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Connected Equipment</span>
            <span className="material-symbols-outlined text-primary-fixed">sensors</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-3xl text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bike</span>
            </div>
            <div>
              <h4 className="font-headline text-xl font-bold text-on-surface">Peloton Bike+</h4>
              <p className="font-body text-sm text-primary flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Syncing Data
              </p>
            </div>
          </div>
        </div>

        {/* Last Workout Summary */}
        <div className="md:col-span-2 bg-surface-container rounded-2xl p-6 hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-center mb-6">
            <span className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Previous Session</span>
            <button className="font-body text-sm text-primary hover:underline">View Log</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <span className="block font-body text-xs text-on-surface-variant mb-1">Duration</span>
              <span className="font-headline text-2xl font-bold text-on-surface">45<span className="text-sm font-medium text-on-surface-variant ml-1">min</span></span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <span className="block font-body text-xs text-on-surface-variant mb-1">Avg Heart Rate</span>
              <span className="font-headline text-2xl font-bold text-tertiary">142<span className="text-sm font-medium text-on-surface-variant ml-1">bpm</span></span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <span className="block font-body text-xs text-on-surface-variant mb-1">Calories</span>
              <span className="font-headline text-2xl font-bold text-on-surface">420<span className="text-sm font-medium text-on-surface-variant ml-1">kcal</span></span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <span className="block font-body text-xs text-on-surface-variant mb-1">Intensity</span>
              <div className="flex items-end h-8 gap-1">
                <div className="w-full bg-surface-container-highest rounded-t-sm h-1/4"></div>
                <div className="w-full bg-surface-container-highest rounded-t-sm h-2/4"></div>
                <div className="w-full bg-primary rounded-t-sm h-full"></div>
                <div className="w-full bg-primary rounded-t-sm h-3/4"></div>
                <div className="w-full bg-surface-container-highest rounded-t-sm h-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
