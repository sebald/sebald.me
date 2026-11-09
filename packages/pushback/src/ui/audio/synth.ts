/**
 * The chip's voices in Web Audio: four-operator FM in the YM2612's
 * algorithms, the SN76489's squares and noise with volume stepped once a
 * frame, drum samples made in 8 bits for the DAC channel, and the NES's
 * pulses and triangle for the effects. Each voice is fire and forget:
 * `(time, midi, seconds, velocity, out)`.
 */
import { hz } from '../../lib/audio/notes';

export type Voice = (
  time: number,
  midi: number,
  seconds: number,
  velocity: number,
  out: AudioNode,
) => void;

/** Shared buffers and waves, made once per context */
interface Kit {
  noise: AudioBuffer;
  /** The NES noise channel's short mode: a 93-step pattern, metallic */
  metal: AudioBuffer;
  pulses: Map<number, PeriodicWave>;
  drums: Map<string, AudioBuffer>;
}

const kits = new WeakMap<BaseAudioContext, Kit>();

const kitOf = (ctx: BaseAudioContext): Kit => {
  const known = kits.get(ctx);
  if (known) return known;
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const white = noise.getChannelData(0);
  for (let i = 0; i < white.length; i++) white[i] = Math.random() * 2 - 1;
  let register = 1;
  const pattern: number[] = [];
  for (let i = 0; i < 93; i++) {
    const bit = (register ^ (register >> 6)) & 1;
    register = (register >> 1) | (bit << 14);
    pattern.push(register & 1 ? 0.8 : -0.8);
  }
  const metal = ctx.createBuffer(1, 93 * 8, ctx.sampleRate);
  const short = metal.getChannelData(0);
  for (let i = 0; i < short.length; i++) short[i] = pattern[i >> 3]!;
  const kit = { noise, metal, pulses: new Map(), drums: new Map() };
  kits.set(ctx, kit);
  return kit;
};

const gainOf = (ctx: BaseAudioContext, value = 0) => {
  const node = ctx.createGain();
  node.gain.value = value;
  return node;
};

const filterOf = (
  ctx: BaseAudioContext,
  type: BiquadFilterType,
  frequency: number,
  q = 0.7,
) => {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  return node;
};

const oscillator = (
  ctx: BaseAudioContext,
  wave: OscillatorType | PeriodicWave,
  frequency: number,
  start: number,
  stop: number,
) => {
  const node = ctx.createOscillator();
  if (typeof wave === 'object') node.setPeriodicWave(wave);
  else node.type = wave;
  node.frequency.setValueAtTime(frequency, start);
  node.start(start);
  node.stop(stop);
  return node;
};

const noiseOf = (
  ctx: BaseAudioContext,
  start: number,
  stop: number,
  rate = 1,
  buffer = kitOf(ctx).noise,
) => {
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  node.playbackRate.value = rate;
  node.start(start, buffer === kitOf(ctx).noise ? Math.random() * 0.8 : 0);
  node.stop(stop);
  return node;
};

/** A pulse wave of a duty cycle, from its Fourier series */
const pulseOf = (ctx: BaseAudioContext, duty: number) => {
  const { pulses } = kitOf(ctx);
  const known = pulses.get(duty);
  if (known) return known;
  const real = new Float32Array(40);
  for (let n = 1; n < 40; n++) {
    real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  }
  const wave = ctx.createPeriodicWave(real, new Float32Array(40));
  pulses.set(duty, wave);
  return wave;
};

/** Attack to the peak, decay to the sustain, release after `seconds` */
const envelope = (
  node: GainNode,
  time: number,
  attack: number,
  peak: number,
  decay: number,
  sustain: number,
  seconds: number,
  release: number,
) => {
  node.gain.setValueAtTime(0, time);
  node.gain.linearRampToValueAtTime(peak, time + attack);
  if (decay) node.gain.setTargetAtTime(peak * sustain, time + attack, decay);
  node.gain.setTargetAtTime(0, time + Math.max(seconds, attack), release);
};

// FM
// ---------------

interface Operator {
  /** Frequency ratio to the note */
  ratio: number;
  /** As a carrier, its share of the output; as a modulator, its index */
  level?: number;
  detune?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  /** A saw or square stands in for the operator's feedback */
  wave?: OscillatorType;
}

interface Patch {
  /** The YM2612 algorithm: which operator modulates which */
  algorithm: 0 | 4 | 5;
  volume: number;
  release: number;
  vibrato?: number;
  operators: [Operator, Operator, Operator, Operator];
}

/** [from, to], -1 the output */
const ALGORITHMS: Record<Patch['algorithm'], [number, number][]> = {
  0: [
    [3, 2],
    [2, 1],
    [1, 0],
    [0, -1],
  ],
  4: [
    [1, 0],
    [3, 2],
    [0, -1],
    [2, -1],
  ],
  5: [
    [3, 0],
    [3, 1],
    [3, 2],
    [0, -1],
    [1, -1],
    [2, -1],
  ],
};

const fm =
  (patch: Patch): Voice =>
  (time, midi, seconds, velocity, out) => {
    const ctx = out.context;
    const frequency = hz(midi);
    const end = time + seconds + patch.release * 6 + 0.05;
    const ops = patch.operators.map(op => {
      const osc = oscillator(
        ctx,
        op.wave ?? 'sine',
        frequency * op.ratio,
        time,
        end,
      );
      if (op.detune) osc.detune.value = op.detune;
      const env = gainOf(ctx);
      envelope(
        env,
        time,
        op.attack ?? 0.002,
        1,
        op.decay ?? 0,
        op.sustain ?? 1,
        seconds,
        patch.release,
      );
      osc.connect(env);
      return { osc, env, op };
    });
    let lfo: GainNode | null = null;
    if (patch.vibrato) {
      const wobble = oscillator(ctx, 'sine', 5.6, time, end);
      lfo = gainOf(ctx);
      lfo.gain.setValueAtTime(0, time);
      lfo.gain.linearRampToValueAtTime(
        frequency * patch.vibrato,
        time + Math.min(0.3, seconds),
      );
      wobble.connect(lfo);
    }
    for (const [from, to] of ALGORITHMS[patch.algorithm]) {
      const source = ops[from]!;
      if (to < 0) {
        const level = gainOf(
          ctx,
          velocity * patch.volume * (source.op.level ?? 1),
        );
        source.env.connect(level).connect(out);
        lfo?.connect(source.osc.frequency);
      } else {
        const depth = gainOf(
          ctx,
          frequency * source.op.ratio * (source.op.level ?? 1),
        );
        source.env.connect(depth).connect(ops[to]!.osc.frequency);
      }
    }
  };

/** The FM voices of the soundtrack */
export const FM: Record<string, Voice> = {
  lead: fm({
    algorithm: 4,
    volume: 0.11,
    release: 0.08,
    vibrato: 0.006,
    operators: [
      { ratio: 1, attack: 0.005, decay: 0.4, sustain: 0.85 },
      { ratio: 1, level: 1.1, wave: 'sawtooth' },
      { ratio: 2, detune: -6, level: 0.35, sustain: 0.9 },
      { ratio: 1, level: 0.9, wave: 'square', sustain: 0.8 },
    ],
  }),
  pad: fm({
    algorithm: 5,
    volume: 0.04,
    release: 0.15,
    operators: [
      { ratio: 1, detune: -9, attack: 0.08, sustain: 0.9 },
      { ratio: 1, detune: 9, attack: 0.08, sustain: 0.9, level: 0.8 },
      { ratio: 2, attack: 0.1, sustain: 0.9, level: 0.3 },
      { ratio: 1, level: 0.9, attack: 0.1, sustain: 0.9, wave: 'sawtooth' },
    ],
  }),
  bass: fm({
    algorithm: 4,
    volume: 0.3,
    release: 0.03,
    operators: [
      { ratio: 1, decay: 0.25, sustain: 0.55 },
      { ratio: 1, level: 3.2, decay: 0.05, sustain: 0.25, wave: 'sawtooth' },
      { ratio: 0.5, level: 0.55, decay: 0.3, sustain: 0.6, detune: 4 },
      { ratio: 1, level: 2.4, decay: 0.04, sustain: 0.15 },
    ],
  }),
  epiano: fm({
    algorithm: 4,
    volume: 0.1,
    release: 0.15,
    operators: [
      { ratio: 1, decay: 0.9, sustain: 0.15 },
      { ratio: 1, level: 1.3, decay: 0.2, sustain: 0.08 },
      { ratio: 1, level: 0.4, decay: 0.5, sustain: 0 },
      { ratio: 14, level: 0.7, decay: 0.02, sustain: 0 },
    ],
  }),
  mellow: fm({
    algorithm: 4,
    volume: 0.12,
    release: 0.12,
    vibrato: 0.004,
    operators: [
      { ratio: 1, attack: 0.02, decay: 0.6, sustain: 0.6 },
      { ratio: 1, level: 0.8, decay: 0.3, sustain: 0.3 },
      {
        ratio: 2,
        detune: 4,
        level: 0.2,
        attack: 0.02,
        decay: 0.4,
        sustain: 0.4,
      },
      { ratio: 1, level: 0.3, decay: 0.2, sustain: 0.1 },
    ],
  }),
};

// PSG
// ---------------

/** The SN76489's volume: sixteen steps of 2 dB, the last silent */
const attenuation = (steps: number) =>
  steps >= 15 ? 0 : Math.pow(10, (-2 * steps) / 20);

/**
 * Volume set once a frame (60 Hz), the way the sound drivers wrote it:
 * down a step every `perStep` frames to `floor`, then released to silence
 */
const stepped = (
  node: GainNode,
  time: number,
  seconds: number,
  peak: number,
  perStep: number,
  floor: number,
  release: number,
) => {
  const frames = Math.ceil((seconds + release) * 60);
  for (let i = 0; i <= frames; i++) {
    const at = time + i / 60;
    const steps =
      at >= time + seconds
        ? Math.min(
            15,
            floor +
              Math.ceil(
                ((at - time - seconds) * 15) / Math.max(1 / 60, release),
              ),
          )
        : Math.min(floor, Math.floor(i / perStep));
    node.gain.setValueAtTime(peak * attenuation(steps), at);
  }
  node.gain.setValueAtTime(0, time + seconds + release + 1 / 60);
};

export const PSG: Record<string, Voice> = {
  lead: (time, midi, seconds, velocity, out) => {
    const ctx = out.context;
    const env = gainOf(ctx);
    stepped(env, time, seconds, velocity * 0.07, 6, 3, 0.05);
    oscillator(ctx, 'square', hz(midi), time, time + seconds + 0.2)
      .connect(env)
      .connect(out);
  },
  arp: (time, midi, seconds, velocity, out) => {
    const ctx = out.context;
    const env = gainOf(ctx);
    stepped(env, time, Math.max(seconds, 0.09), velocity * 0.05, 1, 15, 0.02);
    oscillator(ctx, 'square', hz(midi), time, time + seconds + 0.2)
      .connect(env)
      .connect(out);
  },
};

export const NOISE: Record<string, Voice> = {
  hat: (time, _midi, _seconds, velocity, out) => {
    const ctx = out.context;
    const env = gainOf(ctx);
    stepped(env, time, 0.05, velocity * 0.12, 1, 15, 0.02);
    noiseOf(ctx, time, time + 0.12)
      .connect(filterOf(ctx, 'highpass', 5000))
      .connect(env)
      .connect(out);
  },
};

// DAC
// ---------------

/** The rate the drum samples are made at, in 8 bits */
const DAC_RATE = 13_000;

/**
 * A drum sample, made once: `shape` gives each sample and carries a
 * phase; quantised to 8 bits, then held up to the output rate, so it
 * keeps its steps instead of being smoothed
 */
const sampleOf = (
  ctx: BaseAudioContext,
  name: string,
  seconds: number,
  shape: (t: number, phase: number) => [number, number],
) => {
  const { drums } = kitOf(ctx);
  const known = drums.get(name);
  if (known) return known;
  const length = Math.floor(seconds * DAC_RATE);
  const low = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const [value, next] = shape(i / DAC_RATE, phase);
    phase = next;
    low[i] = Math.round(Math.max(-1, Math.min(1, value)) * 127) / 127;
  }
  const ratio = ctx.sampleRate / DAC_RATE;
  const buffer = ctx.createBuffer(
    1,
    Math.floor(length * ratio),
    ctx.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = low[Math.floor(i / ratio)]!;
  drums.set(name, buffer);
  return buffer;
};

const noisy = () => Math.random() * 2 - 1;

const SAMPLES: Record<string, (ctx: BaseAudioContext) => AudioBuffer> = {
  kick: ctx =>
    sampleOf(ctx, 'kick', 0.3, (t, phase) => {
      const next = phase + (45 + 110 * Math.exp(-t * 28)) / DAC_RATE;
      return [
        Math.sin(2 * Math.PI * next) * Math.exp(-t * 9) * 1.1 +
          (t < 0.004 ? noisy() * 0.6 : 0),
        next,
      ];
    }),
  snare: ctx =>
    sampleOf(ctx, 'snare', 0.22, (t, phase) => {
      const next = phase + 185 / DAC_RATE;
      return [
        noisy() * Math.exp(-t * 15) * 0.75 +
          Math.sin(2 * Math.PI * next) * Math.exp(-t * 28) * 0.55,
        next,
      ];
    }),
  // An orchestra hit, the console's favourite: a chord of saws and a burst
  orch: ctx =>
    sampleOf(ctx, 'orch', 0.6, t => {
      const saws = [311.1, 392, 466.2, 622.3, 155.6].reduce(
        (sum, f) => sum + ((t * f) % 1) * 2 - 1,
        0,
      );
      return [
        (saws / 4) * Math.exp(-t * 5.5) + noisy() * Math.exp(-t * 40) * 0.4,
        0,
      ];
    }),
};

export const DAC: Record<string, Voice> = Object.fromEntries(
  Object.entries(SAMPLES).map(([name, sample]) => [
    name,
    (
      time: number,
      _midi: number,
      _seconds: number,
      velocity: number,
      out: AudioNode,
    ) => {
      const ctx = out.context;
      const source = ctx.createBufferSource();
      source.buffer = sample(ctx);
      source.connect(gainOf(ctx, velocity * 0.62)).connect(out);
      source.start(time);
    },
  ]),
);

// NES
// ---------------

/** A pulse, its volume stepped down once a frame; slid or wobbling */
export const nesPulse = (
  out: AudioNode,
  time: number,
  duty: number,
  midi: number,
  seconds: number,
  volume: number,
  { slideTo, vibrato }: { slideTo?: number; vibrato?: number } = {},
) => {
  const ctx = out.context;
  const frequency = hz(midi);
  const end = time + seconds + 0.06;
  const osc = oscillator(ctx, pulseOf(ctx, duty), frequency, time, end);
  const env = gainOf(ctx);
  const frames = Math.max(1, Math.round(seconds * 60));
  for (let i = 0; i <= frames; i++) {
    env.gain.setValueAtTime(
      volume * Math.max(0, 1 - Math.floor((i / frames) * 15) / 16),
      time + i / 60,
    );
  }
  env.gain.setValueAtTime(0, time + seconds);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(hz(slideTo), time + seconds);
  }
  if (vibrato) {
    const wobble = oscillator(ctx, 'sine', 11, time, end);
    wobble.connect(gainOf(ctx, frequency * vibrato)).connect(osc.frequency);
  }
  osc.connect(env).connect(out);
};

/** The triangle: no volume control, on or off */
export const nesTriangle = (
  out: AudioNode,
  time: number,
  midi: number,
  seconds: number,
  volume: number,
  slideTo?: number,
) => {
  const ctx = out.context;
  const osc = oscillator(
    ctx,
    'triangle',
    hz(midi),
    time,
    time + seconds + 0.05,
  );
  const env = gainOf(ctx, 0);
  env.gain.setValueAtTime(volume, time);
  env.gain.setValueAtTime(0, time + seconds);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(hz(slideTo), time + seconds);
  }
  osc.connect(env).connect(out);
};

/** The noise channel, at a rate (lower is darker), short mode for `metal` */
export const nesNoise = (
  out: AudioNode,
  time: number,
  seconds: number,
  volume: number,
  rate: number,
  metal = false,
) => {
  const ctx = out.context;
  const source = noiseOf(
    ctx,
    time,
    time + seconds + 0.05,
    rate,
    metal ? kitOf(ctx).metal : kitOf(ctx).noise,
  );
  const env = gainOf(ctx);
  const frames = Math.max(1, Math.round(seconds * 60));
  for (let i = 0; i <= frames; i++) {
    env.gain.setValueAtTime(volume * (1 - i / (frames + 1)), time + i / 60);
  }
  env.gain.setValueAtTime(0, time + seconds);
  source.connect(env).connect(out);
};

/** Every voice of the music, by the chip it is on and its name */
export const voiceOf = (chip: string, name: string): Voice | undefined =>
  (chip === 'fm' ? FM : chip === 'psg' ? PSG : chip === 'dac' ? DAC : NOISE)[
    name
  ];

/** Shared nodes for the effects that build on them */
export { filterOf, gainOf };
