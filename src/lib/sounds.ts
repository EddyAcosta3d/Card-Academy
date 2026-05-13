export const initAudio = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  const ctx = new AudioContextClass();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
};

// Singleton context to avoid creating too many and getting blocked
let sharedCtx: AudioContext | null = null;
const getCtx = () => {
  if (!sharedCtx) {
    sharedCtx = initAudio();
  }
  if (sharedCtx && sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
};

export const playTearSound = (initOnly?: boolean) => {
  const ctx = getCtx();
  if (!ctx || initOnly) return;

  const duration = 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise for tearing paper
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  
  const filter2 = ctx.createBiquadFilter();
  filter2.type = "peaking";
  filter2.frequency.value = 4000;
  filter2.Q.value = 1.0;
  filter2.gain.value = 5;

  const gainNode = ctx.createGain();
  // Simulate fast tearing
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(filter2);
  filter2.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(ctx.currentTime);
};

export const playCoinSound = () => {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Classic pure tone triangle wave for that clean ding sound
  osc.type = 'triangle';
  
  // High pitched like a coin (B6 to C7)
  osc.frequency.setValueAtTime(1975.53, ctx.currentTime);
  osc.frequency.setValueAtTime(2093.00, ctx.currentTime + 0.05); // B6 to C7

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
};

export const playSuccessSound = () => {
  const ctx = getCtx();
  if (!ctx) return;

  // Triumphant magical arpeggio
  const notes = [
    { freq: 523.25, time: 0 },    // C5
    { freq: 659.25, time: 0.1 },  // E5
    { freq: 783.99, time: 0.2 },  // G5
    { freq: 1046.50, time: 0.3 }, // C6
    { freq: 1318.51, time: 0.4 }, // E6
    { freq: 1567.98, time: 0.5 }, // G6
  ];

  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Sine wave for bell-like pure chime
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 1.2);

    // Filter to soften the high end of the chimes slightly
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + 1.2);
  });
};
