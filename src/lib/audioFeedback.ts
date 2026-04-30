/**
 * Audio feedback via the Web Audio API. No external files.
 *
 * Plays a short beep when called via `playErrorBeep()`. Beeps are throttled by
 * a 3-second cooldown so the user is not spammed when the same form fault
 * persists across many frames.
 *
 * Browsers require a user gesture before AudioContext can resume; the first
 * user click on the "Start Workout" button is sufficient — call
 * `unlockAudio()` from that handler to prime the context.
 */

let ctx: AudioContext | null = null;
let lastBeepAt = 0;
const COOLDOWN_MS = 3000;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = (window.AudioContext ||
      (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Call from a user gesture handler (e.g. Start button) to unlock audio. */
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

/**
 * Play a short error beep. Returns true if a beep was actually emitted, false
 * if it was suppressed by the cooldown.
 */
export function playErrorBeep(): boolean {
  const now = performance.now();
  if (now - lastBeepAt < COOLDOWN_MS) return false;
  const c = getCtx();
  if (!c) return false;
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }

  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.25);
    lastBeepAt = now;
    return true;
  } catch {
    return false;
  }
}

/** Reset the cooldown — useful between sessions. */
export function resetAudioCooldown(): void {
  lastBeepAt = 0;
}
