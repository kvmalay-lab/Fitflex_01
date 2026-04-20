import { useEffect, useRef } from 'react';

interface FormGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

function scoreColor(score: number): string {
  if (score >= 76) return '#22c55e';
  if (score >= 51) return '#eab308';
  return '#ef4444';
}

export default function FormGauge({ score, size = 'medium' }: FormGaugeProps) {
  const dims = { small: 80, medium: 130, large: 180 };
  const dim = dims[size];
  const radius = (dim / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = scoreColor(clampedScore);
  const fontSize = size === 'large' ? 28 : size === 'medium' ? 20 : 14;
  const labelSize = size === 'large' ? 11 : size === 'medium' ? 9 : 7;

  return (
    <div className="flex flex-col items-center">
      <svg width={dim} height={dim} className="drop-shadow-lg" style={{ transition: 'all 0.4s ease' }}>
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#1e293b" strokeWidth={size === 'large' ? 12 : 8}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={color} strokeWidth={size === 'large' ? 12 : 8}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
        <text x={dim / 2} y={dim / 2 - 4} textAnchor="middle" fill={color}
              fontSize={fontSize} fontWeight="bold" fontFamily="Inter, sans-serif">
          {clampedScore}
        </text>
        <text x={dim / 2} y={dim / 2 + labelSize + 4} textAnchor="middle" fill="#94a3b8"
              fontSize={labelSize} fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="2">
          FORM
        </text>
      </svg>
    </div>
  );
}
