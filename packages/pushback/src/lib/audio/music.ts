/**
 * The soundtrack: six pieces in one key family and on one tempo grid,
 * chosen from two rounds of playable proposals. The title, YOU WIN and
 * YOU LOSE from Night Shift FM, the duel, the boss and the result from
 * Nine to Nine. C minor throughout: the title and the result in C minor,
 * the duel in C dorian (the same tonic, lighter), the boss in F minor
 * (darker), YOU WIN in E flat major. 96 beats a minute, the boss and
 * YOU WIN at 144, half as fast again. The duel has a loop per room, one
 * groove in four moods: the open-plan floor's is the original.
 */
import type { SceneId } from '../characters';
import { type BarChord, PATTERNS, type Piece } from './notes';

/** The title's tune, a sixteenth per token over eight bars */
const NIGHT_TUNE =
  'G4 - - - - - - - C5 - - - D5 - Eb5 - C5 - - - - - - - . . . . Ab4 - C5 - Bb4 - - - - - - - G4 - - - Bb4 - Eb5 - D5 - - - - - - - - - - - . . . . G5 - - - - - - - Eb5 - - - F5 - G5 - Ab5 - - - G5 - - - Eb5 - - - C5 - - - F5 - - - Eb5 - - - C5 - - - Ab4 - - - B4 - - - D5 - - - G5 - - - - - - -';

/** The duel's tune, eight bars of funk */
const FUNK_TUNE =
  '. . E5 - G5 - . A5 - - B5 - . . . . . . . . A5 - G5 - E5 - D5 - E5 - - - . . E5 - G5 - . A5 - - B5 - D6 - B5 - C#6 - - - A5 - - - . . . . . . . . G5 - - - E5 - G5 - B5 - - - A5 - G5 - F#5 - - - D5 - F#5 - A5 - - - G5 - F#5 - E5 - - - C5 - E5 - G5 - - - F#5 - E5 - D#5 - - - F#5 - - - B5 - - - - - - -';

const BOSS_TUNE =
  'F5 - - F5 - - Ab5 - - C6 - - Bb5 - Ab5 - F5 - - - - - . . Db5 - Eb5 - F5 - Ab5 - G5 - - G5 - - Bb5 - - Eb6 - - Db6 - C6 - C6 - - - - - - - E5 - G5 - Bb5 - C6 - F6 - - Eb6 - - C6 - - Ab5 - - Bb5 - C6 - Db6 - - C6 - - Ab5 - F5 - - - Ab5 - Bb5 - Bb5 - - Ab5 - - F5 - Db5 - - - F5 - Ab5 - G5 - - - E5 - - - C5 - - - . . . .';

/** YOU WIN climbs to G, the result's first note */
const WIN_TUNE =
  'Eb5 - G5 - Bb5 - Eb6 - - - D6 - Eb6 - F6 - G6 - - - - - - - - - - - . . . .';

/** YOU LOSE falls a semitone at a time to E flat, the result's third */
const LOSE_TUNE =
  'G5 - - - F#5 - - - F5 - - - E5 - - - Eb5 - - - - - - - - - - - . . . .';

const NIGHT: BarChord[] = ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Fm', 'G'];

/** The duel's chords: C dorian, the funk tune a third down from its E */
const DUSK: BarChord[] = [
  'Cm7',
  'F7',
  'Cm7',
  'F7',
  'Abmaj7',
  'Gm7',
  'Fm7',
  'G7',
];

/** Eight bars from one bar of sixteen sixteenths each, so a short bar is easy to see */
const bars = (...bar: string[]) => bar.join(' ');

/** The meeting room: short repeated notes on the quarters, an agenda read out */
const MEETING_TUNE = bars(
  'G4 - - . G4 - - . Bb4 - - . G4 - Eb4 -',
  'C5 - - - - - . . Bb4 - G4 - . . . .',
  'F4 - - . F4 - - . Ab4 - - . F4 - C4 -',
  'D4 - - - - - . . A4 - F4 - . . . .',
  'G4 - - . G4 - - . Bb4 - - . C5 - Bb4 -',
  'G4 - - - - - Bb4 - - - G4 - Eb4 - - -',
  'F4 - A4 - C5 - - - A4 - F4 - D4 - - -',
  'B4 - - - - - D5 - - - B4 - G4 - . .',
);

/** The design studio: long, airy notes with room between them */
const STUDIO_TUNE = bars(
  'G4 - - - - - - - Bb4 - - - - - C5 -',
  'D5 - - - - - - - - - A4 - - - F4 -',
  'G4 - - - Eb4 - - - G4 - - - - - Bb4 -',
  'A4 - - - - - - - - - . . . . . .',
  'Bb4 - - - - - G4 - - - Bb4 - D5 - - -',
  'C5 - - - A4 - - - F4 - - - A4 - - -',
  'Ab4 - - - C5 - - - Eb5 - - - - - D5 -',
  'D5 - - - - - Bb4 - - - F4 - - - . .',
);

/** The corner office: slow, low and sparse, a phrase to a bar or two */
const OFFICE_TUNE = bars(
  'C5 - - - - - - - G4 - - - - - Bb4 -',
  'C5 - - - Bb4 - - - G4 - - - . . . .',
  'F4 - - - - - - - Ab4 - - - C5 - - -',
  'Bb4 - - - Ab4 - - - F4 - - - . . . .',
  'Eb5 - - - - - - - C5 - - - Ab4 - - -',
  'Bb4 - - - - - - - D5 - - - G4 - - -',
  'Ab4 - - - F4 - - - C4 - - - . . . .',
  'B4 - - - D5 - - - F5 - - - D5 - . .',
);

/** The meeting room's chords: C dorian, staying on the one for a bar before it moves */
const MEETING: BarChord[] = [
  'Cm7',
  'Cm7',
  'Fm7',
  'F7',
  'Cm7',
  'Ebmaj7',
  'Dm7',
  'G7',
];

/** The studio's: drifting down from E flat, away from the one */
const STUDIO: BarChord[] = [
  'Ebmaj7',
  'Dm7',
  'Cm7',
  'F7',
  'Ebmaj7',
  'Dm7',
  'Fm7',
  'Bb7',
];

/** The office's: two bars to a chord at the start, the weight on the low end */
const OFFICE: BarChord[] = [
  'Cm7',
  'Cm7',
  'Fm7',
  'Fm7',
  'Abmaj7',
  'Gm7',
  'Fm7',
  'G7',
];

const BOSS: BarChord[] = ['Fm', 'Db', 'Eb', 'C', 'Fm', 'Db', 'Bbm', 'C'];

export type Cue =
  | 'title'
  | 'duel'
  | 'duelMeeting'
  | 'duelStudio'
  | 'duelOffice'
  | 'boss'
  | 'win'
  | 'lose'
  | 'result';

/** The duel loop of each room (the boss's fight opens on the office's) */
export const DUEL_CUES: Record<SceneId, Cue> = {
  floor: 'duel',
  meeting: 'duelMeeting',
  studio: 'duelStudio',
  office: 'duelOffice',
};

/**
 * What a duel plays: its room's loop; the Stakeholder's fight opens on
 * the office's while they look at their phone, and the boss's piece comes
 * in with the first exchange the player wins
 */
export const duelCue = ({
  scene,
  boss,
  exchangesWon,
}: {
  scene: SceneId;
  boss: boolean;
  exchangesWon: number;
}): Cue =>
  boss ? (exchangesWon > 0 ? 'boss' : DUEL_CUES.office) : DUEL_CUES[scene];

export const MUSIC: Record<Cue, Piece> = {
  // Dark: a synth lead and FM pads over a half-time beat, the snare on three
  title: {
    name: 'Title',
    bpm: 96,
    chords: NIGHT,
    gain: 0.82,
    tracks: [
      { chip: 'fm', voice: 'lead', line: NIGHT_TUNE, layer: 0, reverb: 0.25 },
      { chip: 'fm', voice: 'pad', pattern: PATTERNS.hold(55), layer: 0 },
      { chip: 'fm', voice: 'bass', pattern: PATTERNS.eighths(36), layer: 0 },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(72),
        layer: 0,
        velocity: 0.8,
      },
      {
        chip: 'dac',
        drums: { snare: '........x.......', kick: 'x.........x.....' },
        layer: 0,
        reverb: 0.7,
      },
      { chip: 'noise', drums: { hat: '..x...x...x...x.' }, layer: 0 },
    ],
  },
  // A relaxed groove to think over: no lead until the player earns one,
  // and the layers add lift, never tempo
  duel: {
    name: 'Duel, the floor',
    bpm: 96,
    chords: DUSK,
    gain: 1,
    tracks: [
      {
        chip: 'fm',
        voice: 'bass',
        pattern: PATTERNS.funk(31),
        layer: 0,
        velocity: 0.8,
      },
      {
        chip: 'fm',
        voice: 'epiano',
        pattern: PATTERNS.stabs(60, [0, 6, 10]),
        layer: 0,
        velocity: 0.75,
      },
      {
        chip: 'dac',
        drums: { snare: '....x.......x...', kick: 'x.....x...x.....' },
        layer: 0,
        reverb: 0.35,
        velocity: 0.75,
      },
      {
        chip: 'noise',
        drums: { hat: 'x.x.x.x.x.x.x.x.' },
        layer: 0,
        velocity: 0.55,
      },
      // The tune, low and mellow, under the text
      {
        chip: 'fm',
        voice: 'mellow',
        line: FUNK_TUNE,
        transpose: -16,
        layer: 1,
        reverb: 0.2,
      },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(72, 2),
        layer: 2,
        velocity: 0.45,
      },
    ],
  },
  // The meeting room: the same groove held in, a walking bass and comping
  // on the offbeats, the kit dry and square
  duelMeeting: {
    name: 'Duel, the meeting room',
    bpm: 96,
    chords: MEETING,
    gain: 1,
    tracks: [
      {
        chip: 'fm',
        voice: 'bass',
        pattern: PATTERNS.walk(31),
        layer: 0,
        velocity: 0.8,
      },
      {
        chip: 'fm',
        voice: 'epiano',
        pattern: PATTERNS.stabs(60, [2, 6, 10, 14]),
        layer: 0,
        velocity: 0.55,
      },
      {
        chip: 'dac',
        drums: { snare: '....x.......x...', kick: 'x.......x.x.....' },
        layer: 0,
        reverb: 0.15,
        velocity: 0.75,
      },
      {
        chip: 'noise',
        drums: { hat: 'x.x.x.x.x.x.x.x.' },
        layer: 0,
        velocity: 0.5,
      },
      {
        chip: 'fm',
        voice: 'mellow',
        line: MEETING_TUNE,
        layer: 1,
        reverb: 0.1,
      },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(72, 4),
        layer: 2,
        velocity: 0.45,
      },
    ],
  },
  // The design studio: warm and hazy, focus music. A lazy bass under the
  // chords held as a soft wash, the kick lazy and the hats on the offbeats,
  // the tune an octave down
  duelStudio: {
    name: 'Duel, the design studio',
    bpm: 96,
    chords: STUDIO,
    gain: 1,
    tracks: [
      {
        chip: 'fm',
        voice: 'bass',
        pattern: PATTERNS.sway(31),
        layer: 0,
        velocity: 0.8,
      },
      {
        chip: 'fm',
        voice: 'epiano',
        pattern: PATTERNS.hold(60),
        layer: 0,
        velocity: 0.5,
        reverb: 0.3,
      },
      {
        chip: 'dac',
        drums: { snare: '....x.......x...', kick: 'x......x..x.....' },
        layer: 0,
        reverb: 0.4,
        velocity: 0.7,
      },
      {
        chip: 'noise',
        drums: { hat: '..x...x...x...x.' },
        layer: 0,
        velocity: 0.45,
      },
      {
        chip: 'fm',
        voice: 'mellow',
        line: STUDIO_TUNE,
        transpose: -12,
        layer: 1,
        reverb: 0.4,
      },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(76, 2),
        layer: 2,
        velocity: 0.4,
      },
    ],
  },
  // The corner office at night: half-time, a held pad over long low roots,
  // the title's kit grown into the groove
  duelOffice: {
    name: 'Duel, the corner office',
    bpm: 96,
    chords: OFFICE,
    gain: 1,
    tracks: [
      {
        chip: 'fm',
        voice: 'bass',
        pattern: PATTERNS.pedal(29),
        layer: 0,
        velocity: 0.85,
      },
      {
        chip: 'fm',
        voice: 'pad',
        pattern: PATTERNS.hold(55),
        layer: 0,
        velocity: 0.6,
      },
      {
        chip: 'dac',
        drums: { snare: '........x.......', kick: 'x.......x.x.....' },
        layer: 0,
        reverb: 0.7,
        velocity: 0.75,
      },
      {
        chip: 'noise',
        drums: { hat: '..x...x...x...x.' },
        layer: 0,
        velocity: 0.5,
      },
      {
        chip: 'fm',
        voice: 'mellow',
        line: OFFICE_TUNE,
        layer: 1,
        reverb: 0.3,
      },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(72, 2),
        layer: 2,
        velocity: 0.4,
      },
    ],
  },
  // The one intense fight
  boss: {
    name: 'Boss',
    bpm: 144,
    chords: BOSS,
    tracks: [
      {
        chip: 'fm',
        voice: 'lead',
        line: BOSS_TUNE,
        transpose: -12,
        layer: 0,
        reverb: 0.2,
      },
      { chip: 'fm', voice: 'bass', pattern: PATTERNS.pump(29), layer: 0 },
      {
        chip: 'dac',
        drums: { snare: '....x.......x...', kick: 'x...x...x...x...' },
        layer: 0,
        reverb: 0.6,
      },
      { chip: 'noise', drums: { hat: 'xxxxxxxxxxxxxxxx' }, layer: 0 },
      { chip: 'fm', voice: 'pad', pattern: PATTERNS.hold(55), layer: 1 },
      { chip: 'psg', voice: 'arp', pattern: PATTERNS.arp(77), layer: 2 },
      // The tune again an octave up, a sixteenth late
      {
        chip: 'psg',
        voice: 'lead',
        line: BOSS_TUNE,
        delay: 1,
        layer: 2,
        velocity: 0.6,
      },
    ],
  },
  win: {
    name: 'YOU WIN',
    bpm: 144,
    chords: ['Eb', 'Eb'],
    once: true,
    tracks: [
      { chip: 'fm', voice: 'lead', line: WIN_TUNE, layer: 0, reverb: 0.3 },
      {
        chip: 'fm',
        voice: 'pad',
        line: 'G4 - - - - - - - - - - - - - - - Bb4 - - - - - - - - - - - . . . .',
        layer: 0,
      },
      {
        chip: 'fm',
        voice: 'bass',
        line: 'Eb2 - Eb3 - Eb2 - Eb3 - Eb2 - Eb3 - Eb2 - Eb3 - Eb2 - - - - - - - - - - - . . . .',
        layer: 0,
      },
      {
        chip: 'psg',
        voice: 'arp',
        line: 'Eb6 G6 Bb6 Eb6 G6 Bb6 Eb6 G6 Bb6 Eb6 G6 Bb6 Eb6 G6 Bb6 Eb6 . . . . . . . . . . . . . . . .',
        layer: 0,
        velocity: 0.7,
      },
      {
        chip: 'dac',
        drums: {
          orch: 'x...............................',
          snare: '................x...............',
        },
        layer: 0,
        reverb: 0.6,
      },
    ],
  },
  lose: {
    name: 'YOU LOSE',
    bpm: 96,
    chords: ['Cm', 'Cm'],
    once: true,
    tracks: [
      {
        chip: 'fm',
        voice: 'lead',
        line: LOSE_TUNE,
        transpose: -12,
        layer: 0,
        reverb: 0.3,
      },
      {
        chip: 'fm',
        voice: 'pad',
        line: 'Eb4 - - - - - - - - - - - - - - - C4 - - - - - - - - - - - . . . .',
        layer: 0,
      },
      {
        chip: 'fm',
        voice: 'bass',
        line: 'C2 - - - - - - - B1 - - - - - - - Ab1 - - - - - - - - - - - . . . .',
        layer: 0,
      },
      {
        chip: 'dac',
        drums: { snare: 'x...............x...............' },
        layer: 0,
        reverb: 0.7,
        velocity: 0.6,
      },
    ],
  },
  // Quiet enough to read the ledger over; it opens on G
  result: {
    name: 'Result',
    bpm: 96,
    chords: NIGHT.slice(0, 4),
    gain: 0.85,
    tracks: [
      {
        chip: 'fm',
        voice: 'epiano',
        line: NIGHT_TUNE.split(/\s+/).slice(0, 64).join(' '),
        layer: 0,
        reverb: 0.3,
      },
      { chip: 'fm', voice: 'pad', pattern: PATTERNS.hold(55), layer: 0 },
      {
        chip: 'fm',
        voice: 'bass',
        pattern: PATTERNS.house(36),
        layer: 0,
        velocity: 0.7,
      },
      {
        chip: 'psg',
        voice: 'arp',
        pattern: PATTERNS.arp(72, 2),
        layer: 0,
        velocity: 0.6,
      },
      {
        chip: 'dac',
        drums: { kick: 'x.......x.......', snare: '............x...' },
        layer: 0,
        reverb: 0.6,
        velocity: 0.7,
      },
    ],
  },
};
