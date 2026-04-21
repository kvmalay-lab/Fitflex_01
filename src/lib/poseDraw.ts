/**
 * Skeleton overlay drawing for MediaPipe Pose landmarks on a 2D canvas.
 */

import { LandmarkPoint } from './exercises';

const POSE_CONNECTIONS: [number, number][] = [
  [11, 13], [13, 15], [12, 14], [14, 16],         // arms
  [11, 12], [11, 23], [12, 24], [23, 24],          // torso
  [23, 25], [25, 27], [24, 26], [26, 28],          // legs
  [27, 29], [29, 31], [27, 31],                     // left foot
  [28, 30], [30, 32], [28, 32],                     // right foot
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  highlight: number[] = [],
  color: string = '#10b981',
  highlightColor: string = '#fbbf24'
) {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    if ((pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * width, pa.y * height);
    ctx.lineTo(pb.x * width, pb.y * height);
    ctx.stroke();
  }

  for (let i = 0; i < landmarks.length; i++) {
    const p = landmarks[i];
    if (!p || (p.visibility ?? 1) < 0.4) continue;
    const isHighlight = highlight.includes(i);
    ctx.fillStyle = isHighlight ? highlightColor : '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, isHighlight ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
