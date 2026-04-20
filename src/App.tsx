import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './screens/Auth';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import LiveWorkout from './screens/LiveWorkout';
import WorkoutSummary from './screens/WorkoutSummary';
import Analytics from './screens/Analytics';
import Profile from './screens/Profile';
import Navigation from './components/Navigation';

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('main'); // default mapping changed
  const [tab, setTab] = useState('dashboard');
  const [selectedExercise, setSelectedExercise] = useState('bicep_curl');

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Loading FitFlex Arena...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const navigate = (newScreen: string) => setScreen(newScreen);

  if (screen === 'main' || screen === 'workoutSummary') {
    return (
      <Navigation currentTab={tab} setTab={setTab}>
        {screen === 'workoutSummary' ? (
          <WorkoutSummary onFinish={() => setScreen('main')} />
        ) : (
          <>
            {tab === 'dashboard' && <Dashboard onStart={() => setScreen('exerciseSelect')} />}
            {tab === 'analytics' && <Analytics />}
            {tab === 'profile' && <Profile />}
            {(tab === 'coach' || tab === 'training' || tab === 'community' || tab === 'settings') && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">construction</span>
                <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Coming Soon</h2>
                <p className="text-on-surface-variant font-body">This feature is currently under development.</p>
              </div>
            )}
          </>
        )}
      </Navigation>
    );
  }

  return (
    <>
      {screen === 'exerciseSelect' && (
        <div className="min-h-screen bg-background p-8 text-on-surface">
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate('main')} className="text-secondary font-medium hover:underline flex items-center mb-6">
               <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
               Back
            </button>
            <h1 className="text-4xl font-headline font-bold">Select Exercise</h1>
            <p className="text-on-surface-variant font-body">Choose an exercise to start your live tracking session.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
               <div onClick={() => { setSelectedExercise('bicep_curl'); navigate('liveWorkout'); }} className="cursor-pointer bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">fitness_center</span>
                 </div>
                 <div>
                    <h3 className="font-headline font-bold text-lg">Bicep Curl</h3>
                    <p className="font-body text-xs text-on-surface-variant">Focus: Arms • Hypertrophy</p>
                 </div>
               </div>
               <div onClick={() => { setSelectedExercise('squat'); navigate('liveWorkout'); }} className="cursor-pointer bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined">sports_gymnastics</span>
                 </div>
                 <div>
                    <h3 className="font-headline font-bold text-lg">Squat</h3>
                    <p className="font-body text-xs text-on-surface-variant">Focus: Legs • Strength</p>
                 </div>
               </div>
               <div onClick={() => { setSelectedExercise('push_up'); navigate('liveWorkout'); }} className="cursor-pointer bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl p-6 border border-outline-variant flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined">line_weight</span>
                 </div>
                 <div>
                    <h3 className="font-headline font-bold text-lg">Push Up</h3>
                    <p className="font-body text-xs text-on-surface-variant">Focus: Chest • Endurance</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
      {screen === 'onboarding' && <Onboarding onComplete={() => navigate('main')} />}
      {screen === 'liveWorkout' && <LiveWorkout exerciseType={selectedExercise} onEnd={() => navigate('workoutSummary')} />}
    </>
  );
}
