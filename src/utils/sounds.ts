// Utility to play simple synthesized sounds without needing audio files

const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
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
  } catch {
    // Ignore audio context errors
  }
};

export const playCorrectSound = () => {
  playTone(523.25, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 100);
  setTimeout(() => playTone(783.99, 'sine', 0.3, 0.1), 200);
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

/** كشف الامبوستر — دراما خفيفة */
export const playImposterRevealSound = () => {
  playTone(120, 'sawtooth', 0.25, 0.12);
  setTimeout(() => playTone(90, 'sawtooth', 0.35, 0.1), 120);
  setTimeout(() => playTone(220, 'square', 0.08, 0.08), 280);
  setTimeout(() => playTone(180, 'square', 0.15, 0.1), 380);
  setTimeout(() => playTone(440, 'sine', 0.2, 0.12), 520);
  setTimeout(() => playTone(330, 'sine', 0.35, 0.1), 650);
};

/** تأكيد تصويت / اختيار */
export const playVoteSound = () => {
  playTone(392, 'triangle', 0.08, 0.08);
  setTimeout(() => playTone(523.25, 'triangle', 0.12, 0.08), 80);
};

/** مرحلة سؤال جديدة */
export const playTurnSound = () => {
  playTone(587.33, 'sine', 0.06, 0.06);
  setTimeout(() => playTone(698.46, 'sine', 0.08, 0.06), 70);
};

/** فتح القفل / كشف كلمة سرية */
export const playUnlockSound = () => {
  playTone(659.25, 'sine', 0.06, 0.07);
  setTimeout(() => playTone(783.99, 'sine', 0.1, 0.07), 90);
};

/** لعبة 3 — قلب كارت */
export const playCardFlipSound = () => {
  playTone(700, 'triangle', 0.04, 0.05);
  setTimeout(() => playTone(900, 'triangle', 0.05, 0.04), 40);
};

/** لعبة 3 — تخمين صحيح */
export const playCardMatchSound = () => {
  playTone(523.25, 'sine', 0.08, 0.09);
  setTimeout(() => playTone(659.25, 'sine', 0.1, 0.09), 90);
  setTimeout(() => playTone(783.99, 'sine', 0.15, 0.08), 180);
};

/** لعبة 3 — تخمين خاطئ */
export const playCardMissSound = () => {
  playTone(200, 'sawtooth', 0.15, 0.08);
  setTimeout(() => playTone(160, 'sawtooth', 0.2, 0.07), 100);
};

/** لعبة 3 — انتهاء الدور */
export const playEndTurnSound = () => {
  playTone(440, 'triangle', 0.1, 0.06);
  setTimeout(() => playTone(349.23, 'triangle', 0.15, 0.05), 120);
};
