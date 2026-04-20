export default function Analytics() {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2">Analytics</h1>
        <p className="font-body text-on-surface-variant text-sm md:text-base">Weekly performance overview and trends.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero Metric */}
        <section className="md:col-span-2 bg-surface-container-low rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-variant/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <h2 className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1">Consistency Score</h2>
              <div className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-surface">92<span className="text-2xl text-on-surface-variant">%</span></div>
            </div>
            <div className="bg-surface-container-highest rounded-full px-3 py-1 flex items-center gap-1 shadow-[0_4px_12px_rgba(0,21,80,0.1)]">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              <span className="font-label text-xs text-primary font-bold">+4% vs last week</span>
            </div>
          </div>
          
          <div className="relative z-10 h-24 flex items-end gap-2 mt-auto">
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[60%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[45%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[80%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[50%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[90%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-surface-container-highest rounded-t-sm h-[75%] hover:bg-surface-variant transition-colors"></div>
            <div className="w-full bg-gradient-to-t from-primary-container to-primary rounded-t-sm h-[95%] shadow-[0_0_15px_rgba(182,196,255,0.3)]"></div>
          </div>
        </section>

        {/* Intensity Focus */}
        <section className="bg-surface-variant/60 backdrop-blur-xl rounded-xl p-6 flex flex-col shadow-[0_8px_32px_rgba(0,21,80,0.08)]">
          <h2 className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            Intensity Focus
          </h2>
          <div className="flex-grow flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between text-xs font-body text-on-surface-variant mb-2">
                <span>Aerobic Base</span>
                <span className="text-on-surface font-medium">45%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full transition-all" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-body text-on-surface-variant mb-2">
                <span>Anaerobic Peak</span>
                <span className="text-on-surface font-medium">30%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-body text-on-surface-variant mb-2">
                <span>Recovery/Zone 1</span>
                <span className="text-on-surface font-medium">25%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full transition-all" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Volume Breakdown List */}
        <section className="md:col-span-3 bg-surface-container-low rounded-xl p-6 mt-2">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant">Volume Breakdown</h2>
            <button className="text-xs font-medium text-primary hover:text-primary-fixed transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">fitness_center</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface">Squat (Barbell)</h3>
                  <p className="font-body text-xs text-on-surface-variant">Lower Body • Strength</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline font-bold text-lg text-on-surface">12,450 <span className="text-xs text-on-surface-variant font-body">lbs</span></div>
                <div className="text-xs text-primary font-medium flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[10px]">arrow_upward</span> 8%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">sports_gymnastics</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface">Deadlift</h3>
                  <p className="font-body text-xs text-on-surface-variant">Poster Chain • Power</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline font-bold text-lg text-on-surface">9,200 <span className="text-xs text-on-surface-variant font-body">lbs</span></div>
                <div className="text-xs text-on-surface-variant font-medium flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[10px]">horizontal_rule</span> 0%
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
