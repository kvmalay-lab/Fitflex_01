import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types/workout';
import Login from './screens/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutSession from './pages/WorkoutSession';
import History from './pages/History';

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
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />

        <Route path="/" element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/workout" element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout}>
              <WorkoutSession user={user} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout}>
              <History />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
