import React, { useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Dumbbell, Award, Flame } from 'lucide-react';
import { EXERCISES } from '../lib/exercises';

export default function Dashboard() {
  const { history, getLast7Days, refresh } = useWorkoutHistory();

  // Re-fetch on mount when navigating here
  useEffect(() => {
    refresh();
  }, [refresh]);

  const recentHistory = getLast7Days();

  // Calculate statistics
  const stats = useMemo(() => {
    let totalWorkouts = history.length;
    let totalReps = 0;
    const exerciseCounts: Record<string, number> = {};

    history.forEach((session) => {
      // Exclude plank from rep count as it uses seconds
      if (session.exercise !== 'plank') {
        totalReps += session.reps;
      }
      exerciseCounts[session.exercise] = (exerciseCounts[session.exercise] || 0) + 1;
    });

    let favoriteExercise = 'None';
    let maxCount = 0;
    Object.entries(exerciseCounts).forEach(([ex, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteExercise = EXERCISES[ex]?.name || ex;
      }
    });

    return { totalWorkouts, totalReps, favoriteExercise };
  }, [history]);

  // Chart Data: Group last 7 days by date (e.g. 'Mon', 'Tue')
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    recentHistory.forEach((session) => {
      const date = new Date(session.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (days[dayName] !== undefined && session.exercise !== 'plank') {
        days[dayName] += session.reps;
      }
    });

    return Object.entries(days).map(([name, reps]) => ({ name, reps }));
  }, [recentHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your fitness summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Workouts</p>
            <p className="text-3xl font-bold text-white">{stats.totalWorkouts}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Favorite Exercise</p>
            <p className="text-xl font-bold text-white truncate max-w-[150px]">{stats.favoriteExercise}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="p-4 bg-orange-500/20 text-orange-400 rounded-xl">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Reps</p>
            <p className="text-3xl font-bold text-white">{stats.totalReps}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Reps per Day (Last 7 Days)</h2>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar
                dataKey="reps"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
