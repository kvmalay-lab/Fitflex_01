import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types/workout';
import Login from './screens/Login';
import LiveDashboard from './screens/LiveDashboard';
import RepBreakdown from './screens/RepBreakdown';
import SessionSummary from './screens/SessionSummary';
import Progress from './screens/Progress';

function ProtectedRoute({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fitflex_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem('fitflex_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 font-black text-2xl animate-pulse">FitFlex</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <LiveDashboard user={user!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/rep-breakdown" element={
          <ProtectedRoute user={user}>
            <RepBreakdown />
          </ProtectedRoute>
        } />
        <Route path="/summary" element={
          <ProtectedRoute user={user}>
            <SessionSummary />
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute user={user}>
            <Progress user={user!} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}
