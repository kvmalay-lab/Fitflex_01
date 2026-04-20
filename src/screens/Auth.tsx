import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join FitFlex Arena'}
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-2">
              {isLogin ? 'Sign in to sync your AI workout data.' : 'Create an account to start tracking.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-body border border-error/20">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="athlete@fitflex.ai"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-headline font-bold text-base py-3 rounded-xl transition-opacity mt-4 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-body text-on-surface-variant">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }} 
                className="text-primary font-semibold hover:underline bg-transparent"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
