import { useEffect, useRef, useState } from 'react';

interface RepCounterProps {
  count: number;
  stage: string;
  formScore: number;
  isPlank?: boolean;
  holdDuration?: number;
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    ready: 'READY',
    curling: 'CURLING',
    pulling: 'PULLING',
    squatting: 'SQUATTING',
    pressing: 'PRESSING',
    hinging: 'HINGING',
    hold: 'HOLDING',
    idle: 'WAITING',
    active: 'ACTIVE',
  };
  return map[stage] || stage.toUpperCase();
}

function scoreColor(score: number): string {
  if (score >= 76) return '#22c55e';
  if (score >= 51) return '#eab308';
  return '#ef4444';
}

export default function RepCounter({ count, stage, formScore, isPlank, holdDuration }: RepCounterProps) {
  const prevCount = useRef(count);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count > prevCount.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  const color = scoreColor(formScore);

  return (
    <div className="flex flex-col items-center select-none">
      {isPlank ? (
        <div className="flex flex-col items-center">
          <div style={{ color, fontSize: '5rem', fontWeight: 900, lineHeight: 1, transition: 'color 0.3s' }}
               className="font-mono tabular-nums">
            {holdDuration != null ? `${Math.floor(holdDuration)}s` : '0s'}
          </div>
          <div className="text-slate-400 text-sm font-bold tracking-widest uppercase mt-2">HOLD TIME</div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center"
          style={{ transform: pulse ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.2s ease' }}
        >
          <div style={{ color, fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 900, lineHeight: 1, transition: 'color 0.3s' }}
               className="font-mono tabular-nums leading-none">
            {count}
          </div>
          <div className="text-slate-400 text-sm font-bold tracking-widest uppercase mt-2">REPS</div>
        </div>
      )}
      <div className="mt-3 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
           style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}>
        {stageLabel(stage)}
      </div>
    </div>
  );
}
