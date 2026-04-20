import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Clean Dashboard Layout Sidebar
export default function Navigation({ children, currentTab }: { children: React.ReactNode, currentTab: string }) {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
    { id: 'summary', label: 'Last Recap', icon: 'history', path: '/summary' }
  ];

  const isActive = (path: string) => {
     if (path === '/' && location.pathname !== '/') return false;
     return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-on-surface font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface-container flex-col p-6 border-r border-outline-variant z-20">
        <div className="flex items-center gap-3 font-headline font-bold text-xl tracking-tight mb-12 text-on-surface">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container shadow-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">fitness_center</span>
          </div>
          FIT<span className="font-light text-primary tracking-normal ml-0.5">FLEX</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.id} 
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                isActive(link.path)
                  ? "bg-surface-container-highest text-on-surface font-medium"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <span className={cn("material-symbols-outlined transition-colors", isActive(link.path) ? "icon-fill text-primary" : "")}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Mini Profile */}
        <div className="mt-auto bg-surface-container-high p-4 rounded-xl flex items-center gap-3 border border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div className="flex-1 overflow-hidden">
             <div className="font-bold text-sm text-on-surface truncate">{user?.email?.split('@')[0] || 'Athlete'}</div>
             <div className="text-[10px] text-tertiary uppercase tracking-widest font-bold">Pro Active</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-container border-b border-outline-variant sticky top-0 z-20">
          <div className="flex items-center gap-2 font-headline font-bold text-lg text-on-surface">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
               <span className="material-symbols-outlined text-[20px]">fitness_center</span>
             </div>
             FITFLEX
          </div>
           {/* Display tiny user generic avatar */}
           <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
             <span className="material-symbols-outlined text-sm">person</span>
           </div>
        </header>

        <div className="p-4 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant pb-safe z-50">
        <div className="flex items-center justify-around p-2">
          {navLinks.map((link) => (
            <Link 
              key={link.id} 
              to={link.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors rounded-xl",
                isActive(link.path) ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <span className={cn("material-symbols-outlined", isActive(link.path) && "icon-fill")}>
                {link.icon}
              </span>
              <span className={cn("text-[10px] font-label font-bold tracking-wider", isActive(link.path) && "text-on-surface")}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
