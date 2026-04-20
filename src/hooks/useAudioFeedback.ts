import { useCallback, useRef } from 'react';

export function useAudioFeedback() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.5) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  // Soft, high tone for a successful rep
  const playBeep = useCallback(() => playTone(600, 'sine', 0.3, 0.5), [playTone]); 
  
  // Harsh, low tone for an invalid/warning form status
  const playBuzz = useCallback(() => playTone(150, 'sawtooth', 0.5, 0.2), [playTone]);

  return { playBeep, playBuzz, initAudio };
}
