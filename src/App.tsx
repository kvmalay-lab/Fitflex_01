import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './screens/Auth';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import LiveWorkout from './screens/LiveWorkout';
import WorkoutSummary from './screens/WorkoutSummary';
import Navigation from './components/Navigation';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Loading FitFlex...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/workout/:exercise" element={<LiveWorkout />} />
        <Route path="/summary" element={
          <Navigation currentTab="dashboard">
             <WorkoutSummary />
          </Navigation>
        } />
        <Route path="/" element={
          <Navigation currentTab="dashboard">
             <Dashboard />
          </Navigation>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
