/**
 * The sound of the game, one per page: the switches, one AudioContext
 * made on the first key or tap after sound is on (never before), the
 * music playing the cue the screen asks for, and the effects. Suspended
 * while the tab is hidden. Everything is a no-op until then.
 */
import { MUSIC, type Cue } from '../../lib/audio/music';
import { type Piece, type Schedule, compile } from '../../lib/audio/notes';
import {
  DEFAULT_SOUND,
  type SoundSettings,
  loadSound,
  writeSound,
} from '../../lib/audio/settings';
import { type BlipVoice, type Effect, EFFECTS, blip } from './effects';
import { filterOf, gainOf, voiceOf } from './synth';

/** The grit: fewer bits, a lower rate, the 9-bit DAC's ladder at low volume */
const GRIT = 0.6;

/** How long one piece fades out before the next starts, in seconds */
const FADE = 0.25;

/** How far ahead the notes are scheduled, and how often */
const LOOKAHEAD = 0.14;
const TICK_MS = 25;

/** The grit stage as a worklet, loaded from a Blob so it needs no file */
const CRUSH = `registerProcessor('pushback-crush', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    { name: 'bits', defaultValue: 16 }, { name: 'hold', defaultValue: 1 }, { name: 'ladder', defaultValue: 0 }
  ]; }
  constructor() { super(); this.c = 0; this.h = [0, 0]; }
  process(inputs, outputs, p) {
    const input = inputs[0], output = outputs[0];
    if (!input || !input.length) return true;
    const q = Math.pow(2, p.bits[0] - 1), hold = Math.max(1, Math.round(p.hold[0])), ladder = p.ladder[0];
    let c = this.c;
    for (let ch = 0; ch < output.length; ch++) {
      const x = input[ch] || input[0], y = output[ch];
      let h = this.h[ch] || 0; c = this.c;
      for (let n = 0; n < y.length; n++) {
        if (c % hold === 0) { const v = x[n]; h = Math.round((v + (v > 0 ? ladder : v < 0 ? -ladder : 0)) * q) / q; }
        y[n] = h; c++;
      }
      this.h[ch] = h;
    }
    this.c = c;
    return true;
  }
});`;

interface Playing {
  /** What plays: a cue of the soundtrack, or a piece the inventory auditions */
  cue: Cue | Piece;
  piece: Piece;
  schedule: Schedule;
  /** A gain per track: the momentum layers */
  tracks: GainNode[];
  level: GainNode;
  timer: ReturnType<typeof setInterval>;
}

interface Graph {
  ctx: AudioContext;
  /** Where the pieces go in: then the grit, the lowpass, the levels */
  chip: GainNode;
  /** Quieter for the demo and the pause */
  musicLevel: GainNode;
  /** Dipped by the big effects and the blips */
  duck: GainNode;
  effects: GainNode;
  reverb: AudioBuffer;
}

let graph: Graph | null = null;
let settings: SoundSettings | null = null;
const listeners = new Set<() => void>();
/** The cue the screen asks for; `null` is silence */
let wanted: Cue | null = null;
/**
 * The inventory plays a cue whatever the switches say, or a piece that
 * is not in the soundtrack (a candidate to listen to)
 */
let audition: Cue | Piece | null = null;
let playing: Playing | null = null;
let momentum = 0;
/** The game is on the page: only then do its screens make sound */
let armed = 0;
let quiet = false;
let paused = false;

const hasWindow = () => typeof window !== 'undefined';

/** Whether this browser can play anything at all */
export const canPlay = () => hasWindow() && 'AudioContext' in window;

export const getSettings = (): SoundSettings => {
  if (!hasWindow()) return DEFAULT_SOUND;
  settings ??= loadSound();
  return settings;
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Change the switches. Called from a key or a tap, so turning sound on
 * may make the context here.
 */
export const setSettings = (next: SoundSettings) => {
  settings = next;
  writeSound(next);
  for (const listener of listeners) listener();
  if (next.music || next.effects) unlock();
  apply();
};

/** The switches as they were before the last mute, to come back to */
let unmuted: SoundSettings | null = null;

/**
 * Mute or unmute: anything on turns all off, remembering what was on;
 * all off turns back on what was, or both. The speaker and the M key.
 */
export const toggleSound = () => {
  const current = getSettings();
  const on = current.music || current.effects;
  if (on) unmuted = current;
  setSettings(on ? DEFAULT_SOUND : (unmuted ?? { music: true, effects: true }));
  if (!on && getSettings().effects) effect('confirm');
};

/** A gated reverb's impulse: a short flat burst cut off hard */
const gatedImpulse = (ctx: AudioContext) => {
  const length = Math.floor(ctx.sampleRate * 0.2);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      const tail =
        i < length * 0.8 ? 1 : 1 - (i - length * 0.8) / (length * 0.2);
      data[i] = (Math.random() * 2 - 1) * 0.5 * tail;
    }
  }
  return buffer;
};

const build = (): Graph => {
  const ctx = new AudioContext();
  const master = gainOf(ctx, 0.3);
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.15;
  master.connect(compressor).connect(ctx.destination);
  const duck = gainOf(ctx, 1);
  duck.connect(master);
  const musicLevel = gainOf(ctx, 1);
  musicLevel.connect(duck);
  const lowpass = filterOf(ctx, 'lowpass', 20_000 - 12_500 * GRIT, 0.5);
  lowpass.connect(musicLevel);
  const chip = gainOf(ctx, 0.8);
  // Until the worklet is in, the music goes straight on
  chip.connect(lowpass);
  const blob = URL.createObjectURL(
    new Blob([CRUSH], { type: 'application/javascript' }),
  );
  ctx.audioWorklet
    ?.addModule(blob)
    .then(() => {
      const crush = new AudioWorkletNode(ctx, 'pushback-crush', {
        outputChannelCount: [2],
      });
      crush.parameters.get('bits')?.setValueAtTime(16 - 9 * GRIT, 0);
      crush.parameters.get('hold')?.setValueAtTime(1 + Math.round(3 * GRIT), 0);
      crush.parameters.get('ladder')?.setValueAtTime(0.006 * GRIT, 0);
      chip.disconnect();
      chip.connect(crush).connect(lowpass);
    })
    .catch(() => {
      // No worklet: the music plays without the grit
    })
    .finally(() => URL.revokeObjectURL(blob));
  const effects = gainOf(ctx, 0.9);
  effects.connect(master);
  return { ctx, chip, musicLevel, duck, effects, reverb: gatedImpulse(ctx) };
};

/** Make the context, or wake it: only ever from a key or a tap */
export const unlock = () => {
  if (!canPlay()) return;
  if (!graph) {
    graph = build();
    document.addEventListener('visibilitychange', () => {
      if (!graph) return;
      if (document.hidden) void graph.ctx.suspend();
      else void graph.ctx.resume();
    });
  }
  if (graph.ctx.state === 'suspended' && !document.hidden) {
    void graph.ctx.resume();
  }
  apply();
};

/**
 * The game is on the page: its screens may now make sound, and the first
 * key or tap once sound is on makes the context (it can only be made in
 * one). Returns the cleanup, which stops the music when the game goes.
 */
export const arm = () => {
  if (!hasWindow()) return () => {};
  const onGesture = () => {
    const { music, effects } = getSettings();
    if (music || effects || audition) unlock();
  };
  window.addEventListener('pointerdown', onGesture, true);
  window.addEventListener('keydown', onGesture, true);
  armed++;
  return () => {
    armed--;
    window.removeEventListener('pointerdown', onGesture, true);
    window.removeEventListener('keydown', onGesture, true);
    if (!armed) music(null);
  };
};

const fadeOut = (piece: Playing, seconds: number) => {
  if (!graph) return;
  clearInterval(piece.timer);
  const now = graph.ctx.currentTime;
  piece.level.gain.cancelScheduledValues(now);
  piece.level.gain.setValueAtTime(piece.level.gain.value, now);
  piece.level.gain.linearRampToValueAtTime(0, now + seconds);
  setTimeout(() => piece.level.disconnect(), (seconds + 3) * 1000);
};

/** Start a piece at `start`: its notes scheduled a little ahead, looped, or once */
const start = (cue: Cue | Piece, at: number): Playing => {
  const { ctx, chip, reverb } = graph!;
  const piece = typeof cue === 'string' ? MUSIC[cue] : cue;
  const schedule = compile(piece);
  const level = gainOf(ctx, 0);
  level.gain.setValueAtTime(0, at - 0.01);
  level.gain.linearRampToValueAtTime(piece.gain ?? 0.85, at);
  level.connect(chip);
  const dry = gainOf(ctx, 1);
  dry.connect(level);
  const convolver = ctx.createConvolver();
  convolver.buffer = reverb;
  convolver.connect(gainOf(ctx, 0.5)).connect(level);
  const tracks = piece.tracks.map(track => {
    const gain = gainOf(ctx, track.layer <= momentum ? 1 : 0);
    gain.connect(dry);
    if (track.reverb)
      gain.connect(gainOf(ctx, track.reverb)).connect(convolver);
    return gain;
  });
  const voices = piece.tracks.map(track => track.chip);
  const limit = piece.once ? schedule.steps : Infinity;
  let next = 0;
  const tick = () => {
    const horizon = ctx.currentTime + LOOKAHEAD;
    while (next < limit && at + next * schedule.stepSeconds < horizon) {
      const time = at + next * schedule.stepSeconds;
      for (const event of schedule.byStep[next % schedule.steps]!) {
        voiceOf(voices[event.track]!, event.sound)?.(
          time,
          event.midi,
          event.steps * schedule.stepSeconds * 0.9,
          event.velocity,
          tracks[event.track]!,
        );
      }
      next++;
    }
    if (next >= limit) clearInterval(timer);
  };
  const timer = setInterval(tick, TICK_MS);
  tick();
  return { cue, piece, schedule, tracks, level, timer };
};

/** Play what is wanted, if the switches and the context allow it */
const apply = () => {
  if (!graph) return;
  const cue = audition ?? (armed && getSettings().music ? wanted : null);
  const now = graph.ctx.currentTime;
  graph.musicLevel.gain.setTargetAtTime(
    audition ? 1 : (quiet ? 0.5 : 1) * (paused ? 0.35 : 1),
    now,
    0.05,
  );
  if (playing?.cue === cue) return;
  const previous = playing;
  if (previous) fadeOut(previous, FADE);
  playing = cue ? start(cue, now + (previous ? FADE : 0.05)) : null;
};

export interface MusicOptions {
  /** A little quieter: the title's music under the demo */
  quiet?: boolean;
}

/**
 * The cue this screen wants. The same cue keeps playing across screens;
 * another fades the old one out and starts after it, so nothing cuts or
 * overlaps. A jingle plays once and stays the cue until the next.
 */
export const music = (cue: Cue | null, options: MusicOptions = {}) => {
  wanted = cue;
  quiet = options.quiet ?? false;
  apply();
};

/** Stop the music at once: the deciding blow's hit-stop is silent */
export const cut = () => {
  wanted = null;
  if (playing && graph) {
    fadeOut(playing, 0.04);
    playing = null;
  }
};

/** The momentum layers of the duel and the boss: 0 to 2 */
export const setMomentum = (value: number) => {
  momentum = value;
  if (!playing || !graph) return;
  playing.piece.tracks.forEach((track, i) =>
    playing!.tracks[i]!.gain.setTargetAtTime(
      track.layer <= value ? 1 : 0,
      graph!.ctx.currentTime,
      0.08,
    ),
  );
};

/** The pause: the music goes on, quieter */
export const setPaused = (value: boolean) => {
  paused = value;
  apply();
};

const dip = (depth: number, ms: number) => {
  if (!graph) return;
  const { gain } = graph.duck;
  const now = graph.ctx.currentTime;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.setTargetAtTime(depth, now, 0.01);
  gain.setTargetAtTime(1, now + ms / 1000, 0.2);
};

const effectsOn = (force: boolean) =>
  graph !== null && (force || (armed > 0 && getSettings().effects));

/** An effect, when effects are on (or `force`, the inventory) */
export const effect = (name: Effect, force = false) => {
  if (!effectsOn(force)) return;
  EFFECTS[name](graph!.effects, graph!.ctx.currentTime + 0.01, dip);
};

/** The blip for the characters just typed: one a step, so it never chatters */
export const speak = (voice: BlipVoice, typed: string, force = false) => {
  const char = [...typed].reverse().find(c => /\p{L}/u.test(c));
  if (!char || !effectsOn(force)) return;
  blip(graph!.effects, graph!.ctx.currentTime + 0.01, voice, char);
  dip(0.6, 160);
};

/**
 * The inventory's player: plays a cue whatever the switches say, and
 * makes the context (it is called from a click); `null` stops it
 */
export const auditionMusic = (cue: Cue | Piece | null) => {
  audition = cue;
  if (cue) unlock();
  if (cue && playing?.cue === cue) {
    // Again from the top
    fadeOut(playing, 0.05);
    playing = null;
  }
  apply();
};

/** Whether the inventory is playing a cue */
export const auditioning = () => audition;
