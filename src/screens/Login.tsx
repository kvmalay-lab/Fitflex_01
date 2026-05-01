import { useState } from 'react';
import { User } from '../types/workout';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKey = (digit: string) => {
    if (pin.length < 6) setPin(p => p + digit);
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));
  const handleClear = () => setPin('');

  const handleLogin = async () => {
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Invalid PIN');
        setPin('');
        return;
      }
      const data = await res.json();
      localStorage.setItem('fitflex_user', JSON.stringify(data));
      onLogin(data);
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const dots = Array.from({ length: 6 }, (_, i) => i < pin.length);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            FF
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FitFlex</h1>
          <p className="text-slate-400 text-sm mt-1">AI Gym Coaching Platform</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm text-center mb-5">Enter your gym PIN</p>

          <div className="flex justify-center gap-3 mb-6">
            {dots.map((filled, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${filled ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-slate-600'}`} />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mb-4 bg-red-400/10 py-2 px-3 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === '⌫') handleDelete();
                  else if (key === 'C') handleClear();
                  else handleKey(key);
                }}
                className={`h-14 rounded-xl font-bold text-lg transition-all duration-100 active:scale-95
                  ${key === 'C' ? 'text-red-400 bg-slate-800 hover:bg-red-400/20' :
                    key === '⌫' ? 'text-slate-300 bg-slate-800 hover:bg-slate-700' :
                    'text-white bg-slate-800 hover:bg-slate-700'}`}
              >
                {key}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || pin.length < 4}
            className="w-full h-13 py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200
              bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.98] shadow-lg shadow-emerald-500/25"
          >
            {loading ? 'Entering...' : 'Enter Gym'}
          </button>

          <p className="text-slate-600 text-xs text-center mt-4">
            Demo PINs: 1234 · 5678 · 0000
          </p>
        </div>
      </div>
    </div>
  );
}
