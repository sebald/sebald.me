/**
 * The effects, classic NES chip: two pulses, the triangle and the noise
 * channel, the volume stepped once a frame. The stingers are in the
 * soundtrack's keys, YOU WIN in E flat and YOU LOSE falling to E flat.
 */
import { nesNoise, nesPulse, nesTriangle } from './synth';

export type Effect =
  | 'cursor'
  | 'confirm'
  | 'cancel'
  | 'bump'
  | 'fast'
  | 'hit'
  | 'micDrop'
  | 'tick'
  | 'flash'
  | 'win'
  | 'lose';

/** Who is talking, for the text blip */
export type BlipVoice = 'pm' | 'dev' | 'designer' | 'boss' | 'ghost';

/** Dip the music by `depth` (a gain) for `ms` */
export type Dip = (depth: number, ms: number) => void;

export const EFFECTS: Record<
  Effect,
  (out: AudioNode, time: number, dip: Dip) => void
> = {
  cursor: (out, t) => nesPulse(out, t, 0.125, 88, 0.035, 0.15),
  confirm: (out, t) => {
    nesPulse(out, t, 0.25, 83, 0.05, 0.22);
    nesPulse(out, t + 0.05, 0.25, 88, 0.1, 0.22);
  },
  cancel: (out, t) => {
    nesPulse(out, t, 0.25, 88, 0.05, 0.2);
    nesPulse(out, t + 0.05, 0.25, 81, 0.09, 0.2);
  },
  // A dull bonk: the item is off, the description box says why
  bump: (out, t) => {
    nesPulse(out, t, 0.5, 45, 0.13, 0.18, { slideTo: 41 });
    nesNoise(out, t, 0.04, 0.12, 0.3);
  },
  fast: (out, t) => {
    [84, 88, 91, 96].forEach((midi, i) =>
      nesPulse(out, t + i * 0.03, 0.125, midi, 0.05, 0.18),
    );
    nesPulse(out, t + 0.12, 0.25, 100, 0.2, 0.14, { vibrato: 0.02 });
  },
  hit: (out, t, dip) => {
    nesNoise(out, t, 0.22, 0.34, 0.5);
    nesPulse(out, t, 0.5, 72, 0.17, 0.15, { slideTo: 40 });
    dip(0.75, 200);
  },
  // The loudest: a thud, the room's noise, feedback squealing, a fall
  micDrop: (out, t, dip) => {
    nesTriangle(out, t, 50, 0.32, 0.5, 26);
    nesNoise(out, t, 0.7, 0.32, 0.18);
    [0, 0.12, 0.24, 0.36].forEach((delay, i) =>
      nesPulse(
        out,
        t + 0.05 + delay,
        0.125,
        96 + i,
        0.1,
        0.1 * (1 - i * 0.22),
        {
          vibrato: 0.03,
        },
      ),
    );
    nesPulse(out, t + 0.5, 0.25, 79, 0.4, 0.08, { slideTo: 67 });
    dip(0.55, 900);
  },
  // The stopwatch: a ping when the fast half is gone, a tick on each blink after
  flash: (out, t) => nesPulse(out, t, 0.125, 93, 0.08, 0.2, { vibrato: 0.03 }),
  tick: (out, t) => {
    nesNoise(out, t, 0.03, 0.22, 1, true);
    nesPulse(out, t, 0.5, 76, 0.025, 0.11);
  },
  win: (out, t, dip) => {
    [75, 79, 82].forEach((midi, i) => {
      nesPulse(out, t + i * 0.08, 0.25, midi, 0.075, 0.15);
      nesPulse(out, t + i * 0.08, 0.125, midi - 5, 0.075, 0.08);
    });
    nesPulse(out, t + 0.24, 0.25, 87, 0.45, 0.16, { vibrato: 0.004 });
    nesPulse(out, t + 0.24, 0.125, 82, 0.45, 0.08);
    nesTriangle(out, t + 0.24, 51, 0.45, 0.4);
    nesPulse(out, t + 0.75, 0.25, 82, 0.07, 0.15);
    nesPulse(out, t + 0.83, 0.25, 87, 0.07, 0.15);
    nesPulse(out, t + 0.91, 0.25, 91, 0.6, 0.16, { vibrato: 0.006 });
    nesPulse(out, t + 0.91, 0.125, 87, 0.6, 0.08);
    nesTriangle(out, t + 0.91, 39, 0.6, 0.4);
    dip(0.6, 1500);
  },
  lose: (out, t, dip) => {
    [67, 66, 65].forEach((midi, i) => {
      nesPulse(out, t + i * 0.26, 0.5, midi, 0.22, 0.13);
      nesTriangle(out, t + i * 0.26, midi - 24, 0.22, 0.35);
    });
    nesPulse(out, t + 0.78, 0.5, 63, 0.8, 0.13, { vibrato: 0.012 });
    nesTriangle(out, t + 0.78, 39, 0.8, 0.35);
    dip(0.6, 1600);
  },
};

/** Each role's pitch: PM in the middle, Dev low, Designer high */
const BLIP_BASE: Record<'pm' | 'dev' | 'designer', number> = {
  pm: 72,
  dev: 64,
  designer: 79,
};

/** A little melody in the letters, so a line is not one note */
const lilt = (char: string) =>
  [0, 2, 4, 0, -1, 3][char.toLowerCase().charCodeAt(0) % 6]!;

/**
 * One blip for a typed character: a square for the roles, the
 * Stakeholder typing on a phone (clicks), the ghost a breathy whistle
 */
export const blip = (
  out: AudioNode,
  time: number,
  voice: BlipVoice,
  char: string,
) => {
  if (voice === 'boss') {
    nesNoise(out, time, 0.02, 0.14, 1, true);
    nesPulse(out, time, 0.125, 96 + (lilt(char) % 2), 0.015, 0.06);
  } else if (voice === 'ghost') {
    nesTriangle(out, time, 86 + lilt(char), 0.05, 0.12);
    nesNoise(out, time, 0.05, 0.03, 0.8);
  } else {
    nesPulse(out, time, 0.5, BLIP_BASE[voice] + lilt(char), 0.03, 0.15);
  }
};
