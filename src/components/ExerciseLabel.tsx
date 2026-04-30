interface ExerciseLabelProps {
  exercise: string;
  status: string;
}

const EXERCISE_NAMES: Record<string, string> = {
  bicep_curl: 'Bicep Curl',
  lat_pulldown: 'Lat Pulldown',
  squat: 'Squat',
  shoulder_press: 'Shoulder Press',
  deadlift: 'Deadlift',
  plank: 'Plank',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: '#22c55e22', text: '#22c55e', label: 'ACTIVE' },
  IDLE: { bg: '#94a3b822', text: '#94a3b8', label: 'IDLE' },
  ENDED: { bg: '#ef444422', text: '#ef4444', label: 'ENDED' },
  ENDING: { bg: '#eab30822', text: '#eab308', label: 'ENDING' },
};

export default function ExerciseLabel({ exercise, status }: ExerciseLabelProps) {
  const name = EXERCISE_NAMES[exercise] || exercise.replace(/_/g, ' ');
  const style = STATUS_STYLES[status] || STATUS_STYLES.IDLE;

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs font-semibold uppercase">SESSION:</span>
      <h2 className="text-white font-bold text-sm leading-none uppercase">{name}</h2>
      <span
        className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full ml-1"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    </div>
  );
}
