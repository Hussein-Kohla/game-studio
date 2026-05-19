// Utility to play simple synthesized sounds without needing audio files

const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio context errors
  }
};

export const playCorrectSound = () => {
  playTone(523.25, 'sine', 0.1, 0.1); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
};

export const playWrongSound = () => {
  playTone(300, 'sawtooth', 0.3, 0.1);
  setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 150);
};

export const playWinSound = () => {
  playTone(440, 'square', 0.1, 0.1);
  setTimeout(() => playTone(554.37, 'square', 0.1, 0.1), 150);
  setTimeout(() => playTone(659.25, 'square', 0.4, 0.1), 300);
  setTimeout(() => playTone(880, 'square', 0.6, 0.1), 450);
};

export const playTickSound = () => {
  playTone(800, 'triangle', 0.05, 0.05);
};
