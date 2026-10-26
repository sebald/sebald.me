// A short, dull tap, like a finger on felt: a burst of noise with the highs
// filtered out. Synthesized with the Web Audio API, so there is no file to
// load. Browsers only allow audio after a user gesture, so call it from a
// click handler.

let context: AudioContext | undefined;
let noise: AudioBuffer | undefined;

const LENGTH = 0.04; // seconds
const CUTOFF = 500; // Hz, low-pass
const VOLUME = 0.25;

export const playTap = () => {
  if (typeof AudioContext === 'undefined') return;
  context ??= new AudioContext();
  const ctx = context;
  // Suspended until the first gesture in some browsers
  if (ctx.state === 'suspended') void ctx.resume();

  // White noise, made once and replayed
  if (!noise) {
    noise = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * LENGTH),
      ctx.sampleRate,
    );
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  const at = ctx.currentTime;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = noise;
  filter.type = 'lowpass';
  filter.frequency.value = CUTOFF;
  gain.gain.setValueAtTime(VOLUME, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + LENGTH);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at);
};
