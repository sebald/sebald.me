// A short, soft tap, like a fingertip on a cushion: a burst of noise with the
// highs filtered out, faded in so it has no hard edge. Synthesized with the
// Web Audio API, so there is no file to load. Browsers only allow audio after
// a user gesture, so call it from a click handler.

let context: AudioContext | undefined;
let noise: AudioBuffer | undefined;

const LENGTH = 0.06; // seconds
const ATTACK = 0.008; // seconds, an instant start sounds like a click
const CUTOFF = 360; // Hz, low-pass
const Q = 0.5;
const VOLUME = 0.18;

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
  filter.Q.value = Q;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(VOLUME, at + ATTACK);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + LENGTH);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at);
};
