import { User } from 'lucide-react';

interface NavBarProps {
  title: string;
  userName?: string;
  onLogout?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export default function NavBar({ title, userName, onLogout, onBack, backLabel }: NavBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-emerald-400 text-sm font-semibold mr-1 hover:text-emerald-300 transition-colors">
            ← {backLabel || 'Back'}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">FF</div>
          <span className="text-white font-bold text-base">{title}</span>
        </div>
      </div>
      {(userName || onLogout) && (
        <div className="flex items-center gap-3">
          {userName && (
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <User size={14} />
              <span>{userName}</span>
            </div>
          )}
          {onLogout && (
            <button onClick={onLogout} className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium">
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}
