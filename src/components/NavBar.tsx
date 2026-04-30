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
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="text-emerald-400 text-sm font-semibold mr-1 hover:text-emerald-300 transition-colors">
            ← {backLabel || 'Back'}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-white font-black text-[10px]">FF</div>
          <span className="text-white font-bold text-sm">{title}</span>
        </div>
      </div>
      {onLogout && (
        <button onClick={onLogout} className="text-[11px] uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors font-semibold">
          Logout
        </button>
      )}
    </div>
  );
}
