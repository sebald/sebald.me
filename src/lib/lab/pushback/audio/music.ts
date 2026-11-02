/**
 * The soundtrack: six pieces in one key family and on one tempo grid,
 * chosen from two rounds of playable proposals. The title, YOU WIN and
 * YOU LOSE from Night Shift FM, the duel, the boss and the result from
 * Nine to Nine. C minor throughout: the title and the result in C minor,
 * the duel in C dorian (the same tonic, lighter), the boss in F minor
 * (darker), YOU WIN in E flat major. 96 beats a minute, the boss and
 * YOU WIN at 144, half as fast again.
 */
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

const BOSS: BarChord[] = ['Fm', 'Db', 'Eb', 'C', 'Fm', 'Db', 'Bbm', 'C'];

export type Cue = 'title' | 'duel' | 'boss' | 'win' | 'lose' | 'result';

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
    name: 'Duel',
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

/** What the duel's momentum layers add, for the inventory */
export const DUEL_LAYERS = [
  'A groove with no lead: round FM bass, electric piano, a soft kit',
  'A mellow FM lead plays the tune low, under the text',
  'A quiet square-wave arpeggio in eighths',
] as const;
