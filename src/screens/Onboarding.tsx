export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 relative z-10 max-w-2xl mx-auto w-full min-h-screen">
      <header className="w-full text-center mb-12">
        <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tight text-primary mb-3">FitFlex AI</h1>
        <p className="font-body text-on-surface-variant text-lg">Precision tracking, elevated performance.</p>
      </header>
      <div className="w-full space-y-6">
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col items-start shadow-[0_32px_64px_rgba(0,21,80,0.08)]">
          <h2 className="font-headline font-bold text-3xl mb-4 text-on-surface">Welcome to your new coach.</h2>
          <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6">
            Before we start calibrating your form, we need a few basics set up. This ensures the AI can accurately track your movements and provide real-time feedback.
          </p>
          <div className="w-full h-px bg-surface-container-highest my-4"></div>
          <div className="w-full pt-4">
            <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
              Camera Positioning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container rounded-lg p-5 flex items-start gap-4 hover:bg-surface-container-high transition-colors">
                <div className="bg-surface-container-highest p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">straighten</span>
                </div>
                <div>
                  <h4 className="font-headline font-semibold text-lg text-on-surface mb-1">Distance</h4>
                  <p className="font-body text-sm text-on-surface-variant">Stand approximately 6-8 feet away from the device for full-body tracking.</p>
                </div>
              </div>
              <div className="bg-surface-container rounded-lg p-5 flex items-start gap-4 hover:bg-surface-container-high transition-colors">
                <div className="bg-surface-container-highest p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">light_mode</span>
                </div>
                <div>
                   <h4 className="font-headline font-semibold text-lg text-on-surface mb-1">Lighting</h4>
                   <p className="font-body text-sm text-on-surface-variant">Ensure the room is well-lit, avoiding strong backlight behind you.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col items-start shadow-[0_32px_64px_rgba(0,21,80,0.08)]">
           <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              Data Precision &amp; Privacy
           </h3>
           <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-6">
              FitFlex AI processes your video feed locally to provide real-time form correction. We only store anonymized kinematic data to improve your coaching models over time.
           </p>
           <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-start">
                 <input className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-outline-variant bg-surface-container-highest checked:border-primary-container checked:bg-primary-container transition-all" id="consent-checkbox" type="checkbox"/>
                 <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-[18px] font-bold">check</span>
              </div>
              <span className="font-body text-sm text-on-surface-variant group-hover:text-on-surface transition-colors pt-0.5">
                  I agree to the processing of my movement data for personalized coaching and analytics.
              </span>
           </label>
        </section>
      </div>
      <div className="w-full mt-8 md:mt-12 flex flex-col items-center">
         <button onClick={onComplete} className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container hover:from-primary-fixed hover:to-primary text-on-primary-container font-headline font-bold text-lg py-4 px-12 rounded-xl shadow-[0_8px_32px_rgba(41,98,255,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2">
            Start Calibration
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
         </button>
         <p className="font-body text-xs text-on-surface-variant mt-4 opacity-60">Step 1 of 3: Setup</p>
      </div>
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none z-0"></div>
    </main>
  );
}
