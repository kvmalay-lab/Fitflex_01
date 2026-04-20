export default function WorkoutSummary({ onFinish }: { onFinish: () => void }) {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-2">Workout Complete</h1>
        <p className="text-on-surface-variant font-body">Heavy Leg Day • 65 mins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Score */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-low rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="z-10">
            <span className="text-sm font-label font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">Overall Form Score</span>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-7xl font-headline font-extrabold text-primary">87</span>
              <span className="text-xl font-headline font-medium text-on-surface-variant">/ 100</span>
            </div>
          </div>
          
          <div className="z-10 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h3 className="font-headline font-bold text-lg text-on-surface">Key Insight</h3>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <p className="font-body text-on-surface text-sm leading-relaxed">
                Form degraded by <span className="text-tertiary font-bold">14%</span> during the final two sets of Barbell Squats. Your hips were rising faster than your chest. 
                <strong className="text-primary block mt-2">Action: Reduce weight by 10lbs next session to focus on hip/chest synchronization.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-span-1 md:col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-surface-container rounded-xl p-6 flex flex-col justify-center transition-colors hover:bg-surface-container-high">
            <span className="text-xs font-label font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Total Reps</span>
            <span className="text-5xl font-headline font-extrabold text-on-surface">245</span>
          </div>
          <div className="bg-surface-container rounded-xl p-6 flex flex-col justify-center transition-colors hover:bg-surface-container-high">
            <span className="text-xs font-label font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Sets Completed</span>
            <span className="text-5xl font-headline font-extrabold text-on-surface">22</span>
          </div>
        </div>

        {/* Graph Placeholder */}
        <div className="col-span-1 md:col-span-12 bg-surface-container rounded-xl p-6 mt-2">
          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-label font-semibold tracking-widest text-on-surface-variant uppercase">Power Output vs Fatigue</span>
            <span className="text-xs font-body text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">Zone 4 Dominant</span>
          </div>
          
          <div className="h-48 flex items-end gap-2 mt-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full h-px bg-surface-container-highest"></div>
              <div className="w-full h-px bg-surface-container-highest"></div>
              <div className="w-full h-px bg-surface-container-highest"></div>
              <div className="w-full h-px bg-surface-container-highest"></div>
            </div>
            
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[30%] relative group"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-full rounded-t-sm transition-all group-hover:bg-primary/60"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[45%] relative group"><div className="absolute inset-x-0 bottom-0 bg-primary/50 h-full rounded-t-sm transition-all group-hover:bg-primary/70"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[60%] relative group"><div className="absolute inset-x-0 bottom-0 bg-primary/60 h-full rounded-t-sm transition-all group-hover:bg-primary/80"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[85%] relative group"><div className="absolute inset-x-0 bottom-0 bg-primary h-full rounded-t-sm transition-all group-hover:bg-primary-container"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[95%] relative group"><div className="absolute inset-x-0 bottom-0 bg-primary h-full rounded-t-sm transition-all group-hover:bg-primary-container"></div></div>
            
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[70%] relative group"><div className="absolute inset-x-0 bottom-0 bg-tertiary/60 h-full rounded-t-sm transition-all group-hover:bg-tertiary/80"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[50%] relative group"><div className="absolute inset-x-0 bottom-0 bg-tertiary/80 h-full rounded-t-sm transition-all group-hover:bg-tertiary"></div></div>
            <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[40%] relative group"><div className="absolute inset-x-0 bottom-0 bg-tertiary h-full rounded-t-sm transition-all group-hover:bg-tertiary-container"></div></div>
          </div>
        </div>

        {/* CTA */}
        <div className="col-span-1 md:col-span-12 mt-6">
          <button onClick={onFinish} className="w-full md:w-auto md:px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto">
              Save &amp; Finish
              <span className="material-symbols-outlined">check_circle</span>
          </button>
        </div>
      </div>
    </>
  );
}
