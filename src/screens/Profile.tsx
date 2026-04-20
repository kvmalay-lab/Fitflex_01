export default function Profile() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">Account &amp; Subscription</h1>
        <p className="text-on-surface-variant mt-2 font-body">Manage your pro status, data, and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Subscription Card */}
          <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-container/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface">Pro Subscription</h2>
                  <p className="text-on-surface-variant text-sm font-body">Active until Oct 24, 2024</p>
                </div>
                <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-headline text-5xl font-extrabold text-primary">$9.99</span>
                <span className="text-on-surface-variant font-body text-sm">/ month</span>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex-1 text-center font-body">Manage Plan</button>
                <button className="bg-surface-container-high text-on-surface font-semibold py-3 px-6 rounded-xl hover:bg-surface-bright transition-colors font-body">Invoices</button>
              </div>
            </div>
          </div>

          {/* Usage Stats Bento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-lg p-5 flex flex-col justify-between h-32 hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">cloud</span>
                <span className="font-body text-xs uppercase tracking-wider font-semibold">Storage</span>
              </div>
              <div>
                <div className="font-headline text-2xl font-bold text-on-surface">4.2 GB</div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container rounded-lg p-5 flex flex-col justify-between h-32 hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                <span className="font-body text-xs uppercase tracking-wider font-semibold">AI Tokens</span>
              </div>
              <div>
                <div className="font-headline text-2xl font-bold text-on-surface">8,450</div>
                <p className="text-on-surface-variant text-xs mt-1">Resets in 12 days</p>
              </div>
            </div>
          </div>

          {/* Basic Profile Info */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Personal Details</h3>
            <div className="space-y-4">
              <div className="bg-surface-container-highest p-3 rounded-lg border-b-2 border-transparent focus-within:border-primary transition-colors">
                <label className="block text-xs font-body text-on-surface-variant mb-1">Full Name</label>
                <input className="w-full bg-transparent border-none p-0 text-on-surface font-body text-sm focus:ring-0 outline-none" type="text" defaultValue="Alex Sterling"/>
              </div>
              <div className="bg-surface-container-highest p-3 rounded-lg border-b-2 border-transparent focus-within:border-primary transition-colors">
                <label className="block text-xs font-body text-on-surface-variant mb-1">Email Address</label>
                <input className="w-full bg-transparent border-none p-0 text-on-surface font-body text-sm focus:ring-0 outline-none" type="email" defaultValue="alex.s@example.com"/>
              </div>
              <div className="bg-surface-container-highest p-3 rounded-lg border-b-2 border-transparent focus-within:border-primary transition-colors">
                <label className="block text-xs font-body text-on-surface-variant mb-1">Phone Number</label>
                <input className="w-full bg-transparent border-none p-0 text-on-surface font-body text-sm focus:ring-0 outline-none" type="tel" defaultValue="+1 987 654 3210"/>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Privacy Data */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shield_lock</span>
              Privacy &amp; Data
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body text-sm font-semibold text-on-surface">Share Analytics Data</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Help improve AI coaching accuracy.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-fixed after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body text-sm font-semibold text-on-surface">Marketing Emails</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Receive offers and updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface-variant after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body text-sm font-semibold text-on-surface">Biometric Sync</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Sync with Apple Health / Google Fit.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-fixed after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-surface-container/50">
                <button className="text-error font-body text-sm font-semibold hover:text-error-container transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">delete_forever</span> Delete Account Data
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Preferences</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">language</span>
                  <span className="font-body text-sm text-on-surface">Language</span>
                </div>
                <span className="text-sm text-on-surface-variant">English</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
                  <span className="font-body text-sm text-on-surface">Theme</span>
                </div>
                <span className="text-sm text-on-surface-variant">Dark (System)</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                  <span className="font-body text-sm text-on-surface">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
