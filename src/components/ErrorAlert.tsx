import { useEffect, useState } from 'react';
import { FormError } from '../types/workout';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  error: FormError;
  index?: number;
}

const ERROR_COLORS: Record<string, string> = {
  lean_back: '#f97316',
  elbow_flare: '#ef4444',
  incomplete_range: '#eab308',
  swinging: '#ef4444',
  elbows_too_high: '#ef4444',
  forward_lean: '#f97316',
  incomplete_pull: '#eab308',
  wide_elbows: '#eab308',
  knees_cave: '#ef4444',
  incomplete_depth: '#eab308',
  forward_knee: '#f97316',
  incomplete_lockout: '#eab308',
  torso_lean: '#f97316',
  asymmetrical: '#eab308',
  back_rounding: '#ef4444',
  knee_drift: '#f97316',
  bar_drift: '#eab308',
  hip_sag: '#ef4444',
  shoulder_rotation: '#f97316',
  head_drop: '#eab308',
};

export default function ErrorAlert({ error, index = 0 }: ErrorAlertProps) {
  const [visible, setVisible] = useState(false);
  const color = ERROR_COLORS[error.type] || '#ef4444';

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <AlertTriangle size={16} style={{ color, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {error.type.replace(/_/g, ' ')}
        </div>
        <div className="text-xs text-slate-300 mt-0.5 truncate">{error.message}</div>
      </div>
      <div className="text-xs font-bold shrink-0" style={{ color }}>
        -{error.penalty}
      </div>
    </div>
  );
}
