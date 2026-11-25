// Tiny synthesized click for key presses. Off until the user turns it on.

const STORAGE_KEY = 'dfa-sound';
let ctx: AudioContext | null = null;
let enabled = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'on';

export const isSoundOn = () => enabled;

export function setSoundOn(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

export function tick(pitch: 'low' | 'high' = 'low') {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch === 'high' ? 920 : 540, t);
    osc.frequency.exponentialRampToValueAtTime(pitch === 'high' ? 620 : 360, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    /* audio unavailable */
  }
  if ('vibrate' in navigator) navigator.vibrate(6);
}
