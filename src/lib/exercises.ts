/**
 * Exercise definitions: MediaPipe Pose landmark indices and rep-counting thresholds.
 * Landmark IDs follow MediaPipe Pose convention.
 * https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
 */

export type LandmarkPoint = { x: number; y: number; z?: number; visibility?: number };

export interface ExerciseDef {
  id: string;
  name: string;
  isTimer?: boolean;
  /** Compute the primary tracked angle from landmarks. Returns null if visibility too low. */
  computeAngle: (lm: LandmarkPoint[]) => number | null;
  /** Returns true when angle indicates the "low/down/curled" phase */
  thresholdLow: number;
  /** Returns true when angle indicates the "high/up/extended" phase */
  thresholdHigh: number;
  /** Direction: which threshold transition completes a rep. */
  startState: 'UP' | 'DOWN';
  cues: {
    startCue: string;
    endCue: string;
  };
  /** Optional form error checks. */
  detectErrors?: (lm: LandmarkPoint[], angle: number) => { type: string; message: string; penalty: number }[];
  /** Skeleton landmarks to highlight (for overlay drawing). */
  highlightLandmarks: number[];
}

const MIN_VIS = 0.5;

function visible(p: LandmarkPoint | undefined): boolean {
  return !!p && (p.visibility ?? 1) >= MIN_VIS;
}

export function calculateAngle(a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function avgAngle(left: number | null, right: number | null): number | null {
  if (left == null && right == null) return null;
  if (left == null) return right;
  if (right == null) return left;
  return (left + right) / 2;
}

export const EXERCISES: Record<string, ExerciseDef> = {
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    thresholdLow: 65,
    thresholdHigh: 165,
    startState: 'UP',
    cues: { startCue: 'Extend your arms', endCue: 'Curl up' },
    highlightLandmarks: [11, 13, 15, 12, 14, 16],
    computeAngle: (lm) => {
      const ls = lm[11], le = lm[13], lw = lm[15];
      const rs = lm[12], re = lm[14], rw = lm[16];
      const left = visible(ls) && visible(le) && visible(lw) ? calculateAngle(ls, le, lw) : null;
      const right = visible(rs) && visible(re) && visible(rw) ? calculateAngle(rs, re, rw) : null;
      return avgAngle(left, right);
    },
    detectErrors: (lm) => {
      const errors: { type: string; message: string; penalty: number }[] = [];
      const ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24];
      if (visible(ls) && visible(rs) && visible(lh) && visible(rh)) {
        const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
        const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
        const lean = Math.abs(shoulderMid.x - hipMid.x);
        if (lean > 0.08) errors.push({ type: 'lean_back', message: 'Keep your back straight', penalty: 5 });
      }
      return errors;
    },
  },

  squat: {
    id: 'squat',
    name: 'Squat',
    thresholdLow: 90,
    thresholdHigh: 170,
    startState: 'UP',
    cues: { startCue: 'Stand tall', endCue: 'Go deeper' },
    highlightLandmarks: [23, 25, 27, 24, 26, 28],
    computeAngle: (lm) => {
      const lh = lm[23], lk = lm[25], la = lm[27];
      const rh = lm[24], rk = lm[26], ra = lm[28];
      const left = visible(lh) && visible(lk) && visible(la) ? calculateAngle(lh, lk, la) : null;
      const right = visible(rh) && visible(rk) && visible(ra) ? calculateAngle(rh, rk, ra) : null;
      return avgAngle(left, right);
    },
    detectErrors: (lm) => {
      const errors: { type: string; message: string; penalty: number }[] = [];
      const lk = lm[25], rk = lm[26], la = lm[27], ra = lm[28];
      if (visible(lk) && visible(rk) && visible(la) && visible(ra)) {
        const kneeWidth = Math.abs(lk.x - rk.x);
        const ankleWidth = Math.abs(la.x - ra.x);
        if (ankleWidth > 0 && kneeWidth < ankleWidth * 0.7) {
          errors.push({ type: 'knees_caving', message: 'Keep knees aligned over toes', penalty: 5 });
        }
      }
      return errors;
    },
  },

  deadlift: {
    id: 'deadlift',
    name: 'Deadlift',
    thresholdLow: 110,
    thresholdHigh: 170,
    startState: 'DOWN',
    cues: { startCue: 'Hinge at hips', endCue: 'Stand tall, lock out' },
    highlightLandmarks: [11, 23, 25, 12, 24, 26],
    computeAngle: (lm) => {
      const ls = lm[11], lh = lm[23], lk = lm[25];
      const rs = lm[12], rh = lm[24], rk = lm[26];
      const left = visible(ls) && visible(lh) && visible(lk) ? calculateAngle(ls, lh, lk) : null;
      const right = visible(rs) && visible(rh) && visible(rk) ? calculateAngle(rs, rh, rk) : null;
      return avgAngle(left, right);
    },
    detectErrors: (lm) => {
      const errors: { type: string; message: string; penalty: number }[] = [];
      const ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24];
      if (visible(ls) && visible(rs) && visible(lh) && visible(rh)) {
        const shoulderMid = { x: (ls.x + rs.x) / 2 };
        const hipMid = { x: (lh.x + rh.x) / 2 };
        if (shoulderMid.x < hipMid.x - 0.06) {
          errors.push({ type: 'rounded_back', message: 'Keep back straight', penalty: 6 });
        }
      }
      return errors;
    },
  },

  shoulder_press: {
    id: 'shoulder_press',
    name: 'Shoulder Press',
    thresholdLow: 90,
    thresholdHigh: 170,
    startState: 'DOWN',
    cues: { startCue: 'Lower to shoulders', endCue: 'Press overhead' },
    highlightLandmarks: [11, 13, 15, 12, 14, 16],
    computeAngle: (lm) => {
      const ls = lm[11], le = lm[13], lw = lm[15];
      const rs = lm[12], re = lm[14], rw = lm[16];
      const left = visible(ls) && visible(le) && visible(lw) ? calculateAngle(ls, le, lw) : null;
      const right = visible(rs) && visible(re) && visible(rw) ? calculateAngle(rs, re, rw) : null;
      return avgAngle(left, right);
    },
  },

  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    thresholdLow: 45,
    thresholdHigh: 160,
    startState: 'UP',
    cues: { startCue: 'Reach up', endCue: 'Pull down to chest' },
    highlightLandmarks: [11, 13, 15, 12, 14, 16],
    computeAngle: (lm) => {
      const ls = lm[11], le = lm[13], lw = lm[15];
      const rs = lm[12], re = lm[14], rw = lm[16];
      const left = visible(ls) && visible(le) && visible(lw) ? calculateAngle(ls, le, lw) : null;
      const right = visible(rs) && visible(re) && visible(rw) ? calculateAngle(rs, re, rw) : null;
      return avgAngle(left, right);
    },
  },

  plank: {
    id: 'plank',
    name: 'Plank',
    isTimer: true,
    thresholdLow: 0,
    thresholdHigh: 15,
    startState: 'UP',
    cues: { startCue: 'Hold your form', endCue: 'Keep body straight' },
    highlightLandmarks: [11, 23, 27, 12, 24, 28],
    computeAngle: (lm) => {
      // Returns deviation from straight (0 = perfectly straight, larger = more sag/rise)
      const ls = lm[11], lh = lm[23], la = lm[27];
      const rs = lm[12], rh = lm[24], ra = lm[28];
      const sx = visible(ls) && visible(rs) ? (ls.x + rs.x) / 2 : null;
      const sy = visible(ls) && visible(rs) ? (ls.y + rs.y) / 2 : null;
      const hx = visible(lh) && visible(rh) ? (lh.x + rh.x) / 2 : null;
      const hy = visible(lh) && visible(rh) ? (lh.y + rh.y) / 2 : null;
      const ax = visible(la) && visible(ra) ? (la.x + ra.x) / 2 : null;
      const ay = visible(la) && visible(ra) ? (la.y + ra.y) / 2 : null;
      if (sx == null || hx == null || ax == null) return null;
      // Angle at hip (shoulder-hip-ankle) — 180 = perfectly straight
      const angle = calculateAngle({ x: sx!, y: sy! }, { x: hx, y: hy! }, { x: ax, y: ay! });
      return Math.abs(180 - angle); // deviation from straight
    },
    detectErrors: (lm) => {
      const errors: { type: string; message: string; penalty: number }[] = [];
      const ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24];
      if (visible(ls) && visible(rs) && visible(lh) && visible(rh)) {
        const shoulderY = (ls.y + rs.y) / 2;
        const hipY = (lh.y + rh.y) / 2;
        if (hipY > shoulderY + 0.05) errors.push({ type: 'hips_sagging', message: 'Lift your hips', penalty: 4 });
        else if (hipY < shoulderY - 0.05) errors.push({ type: 'hips_high', message: 'Lower your hips', penalty: 4 });
      }
      return errors;
    },
  },
};

export const EXERCISE_LIST = Object.values(EXERCISES);
