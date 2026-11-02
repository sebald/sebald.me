/**
 * The music as data: notes, chords, the patterns the parts are built
 * from, and the schedule a piece compiles to. No Web Audio here; the
 * engine plays what `compile` returns.
 */

const PITCH: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** A note name (`C4`, `F#5`, `Bb2`) as a MIDI number */
export const midiOf = (name: string): number => {
  const match = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!match) throw new Error(`Not a note: ${name}`);
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return 12 * (Number(match[3]) + 1) + PITCH[match[1]!]! + accidental;
};

/** A MIDI number as a frequency in Hz */
export const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const QUALITY: Record<string, readonly number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
};

export interface Chord {
  /** Pitch class of the root, 0 to 11 */
  root: number;
  /** Intervals from the root, the root first */
  intervals: readonly number[];
}

/** A chord symbol (`Cm7`, `Abmaj7`, `G7`) */
export const chordOf = (name: string): Chord => {
  const match = /^([A-G])(#|b)?(.*)$/.exec(name);
  const intervals = match && QUALITY[match[3]!];
  if (!match || !intervals) throw new Error(`Not a chord: ${name}`);
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return { root: (PITCH[match[1]!]! + accidental + 12) % 12, intervals };
};

/** The chord's root at or above `base` */
export const rootAt = (chord: Chord, base: number) =>
  base + ((((chord.root - base) % 12) + 12) % 12);

/** The chord's tones from its root at or above `base`, `count` of them, up through the octaves */
export const tonesOf = (chord: Chord, base: number, count: number) => {
  const root = rootAt(chord, base);
  const { intervals } = chord;
  return Array.from(
    { length: count },
    (_, i) =>
      root +
      intervals[i % intervals.length]! +
      12 * Math.floor(i / intervals.length),
  );
};

/** The chord without its root, packed into the octave from `low` */
export const voicingOf = (chord: Chord, low: number) =>
  chord.intervals
    .slice(1)
    .map(interval => rootAt(chord, low) + interval)
    .map(midi => (midi >= low + 12 ? midi - 12 : midi))
    .sort((a, b) => a - b);

/** A sixteenth of a bar: what every part is written in */
export const STEPS_PER_BAR = 16;

/** A note: on which sixteenth, which pitch, how many sixteenths, how loud */
export type Note = readonly [
  step: number,
  midi: number,
  steps: number,
  velocity: number,
];

/**
 * A melody as text, one token per sixteenth: a note name starts a note,
 * `-` holds it, `.` rests. `transpose` in semitones.
 */
export const parseLine = (line: string, transpose = 0): Note[] => {
  const tokens = line.trim().split(/\s+/);
  const notes: Note[] = [];
  tokens.forEach((token, i) => {
    if (token === '-' || token === '.') return;
    let steps = 1;
    while (tokens[i + steps] === '-') steps++;
    notes.push([i, midiOf(token) + transpose, steps, 1]);
  });
  return notes;
};

/** How many sixteenths a melody spans */
export const lineSteps = (line: string) => line.trim().split(/\s+/).length;

/** A bar's chord: a symbol, or two for its halves */
export type BarChord = string | readonly [string, string];

/** The chord sounding on a step */
export const chordAt = (chords: readonly BarChord[], step: number): Chord => {
  const bar = chords[Math.floor(step / STEPS_PER_BAR) % chords.length]!;
  return chordOf(
    typeof bar === 'string'
      ? bar
      : bar[step % STEPS_PER_BAR < STEPS_PER_BAR / 2 ? 0 : 1],
  );
};

/** A part that follows the chords: its notes for every bar */
export type Pattern = (chords: readonly BarChord[]) => Note[];

/** A pattern written for one bar, given the chord of each half, repeated over every bar */
const perBar =
  (bar: (first: Chord, second: Chord) => Note[]): Pattern =>
  chords =>
    chords.flatMap((_, b) =>
      bar(
        chordAt(chords, b * STEPS_PER_BAR),
        chordAt(chords, b * STEPS_PER_BAR + STEPS_PER_BAR / 2),
      ).map(([step, midi, steps, velocity]): Note => [
        step + b * STEPS_PER_BAR,
        midi,
        steps,
        velocity,
      ]),
    );

const same = (a: Chord, b: Chord) =>
  a.root === b.root && a.intervals === b.intervals;

/** The patterns the parts are built from */
export const PATTERNS = {
  /** Eighths on the root, the offbeats softer */
  eighths: (base: number) =>
    perBar((first, second) =>
      Array.from({ length: 8 }, (_, i): Note => [
        i * 2,
        rootAt(i < 4 ? first : second, base),
        2,
        i % 2 ? 0.8 : 1,
      ]),
    ),
  /** Sixteenths on the root, an octave up on every third, pumping */
  pump: (base: number) =>
    perBar((first, second) =>
      Array.from({ length: 16 }, (_, i): Note => [
        i,
        rootAt(i < 8 ? first : second, base) + (i % 4 === 2 ? 12 : 0),
        1,
        i % 4 === 0 ? 1 : 0.7,
      ]),
    ),
  /** The octave on the offbeats, the root on one and three: a house bass */
  house: (base: number) =>
    perBar((first, second) => [
      ...[2, 6, 10, 14].map((step): Note => [
        step,
        rootAt(step < 8 ? first : second, base) + 12,
        2,
        0.95,
      ]),
      [0, rootAt(first, base), 1, 0.8],
      [8, rootAt(second, base), 1, 0.8],
    ]),
  /** A syncopated funk bass with octave pops and a seventh */
  funk: (base: number) =>
    perBar((first, second) => {
      const r = rootAt(first, base);
      const r2 = rootAt(second, base);
      return [
        [0, r, 2, 1],
        [3, r + 12, 1, 0.9],
        [6, r, 1, 0.8],
        [8, r2, 2, 1],
        [10, r2 + 10, 1, 0.7],
        [11, r2 + 12, 1, 0.9],
        [14, r2 + 7, 2, 0.85],
      ];
    }),
  /** The chord held for the bar, or each half for its own */
  hold: (low: number) =>
    perBar((first, second) =>
      same(first, second)
        ? voicingOf(first, low).map((midi): Note => [0, midi, 16, 1])
        : [
            ...voicingOf(first, low).map((midi): Note => [0, midi, 8, 1]),
            ...voicingOf(second, low).map((midi): Note => [8, midi, 8, 1]),
          ],
    ),
  /** Short chords on the given steps */
  stabs: (low: number, steps: readonly number[]) =>
    perBar((first, second) =>
      steps.flatMap(step =>
        voicingOf(step < 8 ? first : second, low).map((midi): Note => [
          step,
          midi,
          1,
          0.8,
        ]),
      ),
    ),
  /** The chord's tones up and round, a note every `every` sixteenths */
  arp: (base: number, every = 1) =>
    perBar((first, second) =>
      Array.from({ length: 16 / every }, (_, i): Note => {
        const step = i * every;
        const tones = tonesOf(step < 8 ? first : second, base, 4);
        return [step, tones[i % 4]!, 1, i % 4 === 0 ? 1 : 0.75];
      }),
    ),
} as const;

/** The voices of the chip, each the name of one in the engine */
export type FmVoice = 'lead' | 'pad' | 'bass' | 'epiano' | 'mellow';
export type PsgVoice = 'lead' | 'arp';
export type DacDrum = 'kick' | 'snare' | 'orch';
export type NoiseDrum = 'hat';

/** The Mega Drive's channels: six FM (the sixth plays the drum samples), three square, one noise */
export const CHIP = { fm: 6, psg: 3, noise: 1 } as const;

interface Part {
  /** 0 always on; 1 and 2 come in with momentum */
  layer: 0 | 1 | 2;
  /** Multiplies every note's velocity */
  velocity?: number;
  /** How much goes to the gated reverb */
  reverb?: number;
}

interface Tune extends Part {
  /** A melody (`line`, moved by `transpose`), or a pattern on the chords */
  line?: string;
  transpose?: number;
  pattern?: Pattern;
  /** Played this many sixteenths late: an echo of another part */
  delay?: number;
}

export type Track =
  | (Tune & { chip: 'fm'; voice: FmVoice })
  | (Tune & { chip: 'psg'; voice: PsgVoice })
  /** Drums by pattern, a character per sixteenth: `x` hit, `.` rest. One at a time: the first that hits takes the step. */
  | (Part & { chip: 'dac'; drums: Partial<Record<DacDrum, string>> })
  | (Part & { chip: 'noise'; drums: Partial<Record<NoiseDrum, string>> });

export interface Piece {
  name: string;
  bpm: number;
  chords: readonly BarChord[];
  tracks: readonly Track[];
  /** Plays once instead of looping: a jingle */
  once?: boolean;
  /** Its level in the mix */
  gain?: number;
}

/** A note of a compiled piece, on its track */
export interface Event {
  track: number;
  /** The voice or drum it plays */
  sound: string;
  midi: number;
  /** Length in sixteenths */
  steps: number;
  velocity: number;
}

export interface Schedule {
  /** Sixteenths in the piece: its bars times sixteen */
  steps: number;
  /** Seconds a sixteenth lasts */
  stepSeconds: number;
  /** Events by the sixteenth they start on */
  byStep: Event[][];
  /** Channels it holds at once, by kind */
  channels: { fm: number; psg: number; noise: number; dac: boolean };
}

/** A piece as events by sixteenth, the loop as long as its chords, and the channels it takes */
export const compile = (piece: Piece): Schedule => {
  const steps = piece.chords.length * STEPS_PER_BAR;
  const byStep: Event[][] = Array.from({ length: steps }, () => []);
  const channels = { fm: 0, psg: 0, noise: 0, dac: false };
  piece.tracks.forEach((track, index) => {
    if (track.chip === 'dac' || track.chip === 'noise') {
      const patterns = Object.entries(track.drums) as [string, string][];
      for (let step = 0; step < steps; step++) {
        const hit = patterns.find(
          ([, pattern]) => pattern[step % pattern.length] !== '.',
        );
        if (hit) {
          byStep[step]!.push({
            track: index,
            sound: hit[0],
            midi: 0,
            steps: 1,
            velocity: track.velocity ?? 0.9,
          });
        }
      }
      if (track.chip === 'dac') channels.dac = true;
      else channels.noise += 1;
      return;
    }
    const notes = track.line
      ? parseLine(track.line, track.transpose)
      : (track.pattern?.(piece.chords) ?? []);
    // As many channels as notes start together
    const together = new Map<number, number>();
    for (const [step, midi, length, velocity] of notes) {
      const at = (((step + (track.delay ?? 0)) % steps) + steps) % steps;
      together.set(at, (together.get(at) ?? 0) + 1);
      byStep[at]!.push({
        track: index,
        sound: track.voice,
        midi,
        steps: length,
        velocity: velocity * (track.velocity ?? 1),
      });
    }
    channels[track.chip] += Math.max(1, ...together.values());
  });
  return { steps, stepSeconds: 60 / piece.bpm / 4, byStep, channels };
};

/** Whether a schedule fits the chip: the drum samples take the sixth FM channel */
export const fitsChip = ({ channels }: Schedule) =>
  channels.fm + (channels.dac ? 1 : 0) <= CHIP.fm &&
  channels.psg <= CHIP.psg &&
  channels.noise <= CHIP.noise;
