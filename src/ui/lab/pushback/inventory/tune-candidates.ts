import { MUSIC } from '@sebald/pushback/lib/audio/music';
import {
  PATTERNS,
  type Piece,
  type Track,
} from '@sebald/pushback/lib/audio/notes';

/**
 * Candidates for the rooms' duel loops, to listen to side by side in the
 * inventory and pick from: each room's loop as it ships (A) and two
 * variations on it (B, C) that keep its chords, its tune and its momentum
 * layers and change the groove and the colour. None of these is in the
 * game: the one picked replaces the room's loop in `music.ts`.
 */
export interface Candidate {
  id: string;
  label: string;
  /** What it is like, in a line */
  about: string;
  piece: Piece;
}

export interface RoomCandidates {
  room: string;
  candidates: Candidate[];
  /** The one suggested, and why */
  suggested: string;
  why: string;
}

/** A part of a piece by what it is, to swap */
type Role = 'bass' | 'comp' | 'drums' | 'hats' | 'tune' | 'arp';

const roleOf = (track: Track): Role => {
  if (track.chip === 'dac') return 'drums';
  if (track.chip === 'noise') return 'hats';
  if (track.chip === 'psg') return 'arp';
  if (track.voice === 'bass') return 'bass';
  if ('line' in track && track.line) return 'tune';
  return 'comp';
};

/** The piece with some of its parts changed or replaced */
const vary = (
  base: Piece,
  name: string,
  parts: Partial<Record<Role, (track: Track) => Track>>,
): Piece => ({
  ...base,
  name,
  tracks: base.tracks.map(track => parts[roleOf(track)]?.(track) ?? track),
});

const { duelMeeting, duelStudio, duelOffice } = MUSIC;

export const ROOMS: RoomCandidates[] = [
  {
    room: 'The meeting room',
    candidates: [
      {
        id: 'meeting-a',
        label: 'A · Agenda',
        about:
          'As it ships: a walking bass on the quarters, comping on the offbeats, a dry kit, the tune short repeated notes like an agenda read out.',
        piece: duelMeeting,
      },
      {
        id: 'meeting-b',
        label: 'B · Stand-up',
        about:
          'Tighter and a little busier: a house bass with the octave on the offbeats, the chords on two and four, a light four on the floor and soft sixteenth hats.',
        piece: vary(duelMeeting, 'Meeting B, stand-up', {
          bass: t => ({ ...t, pattern: PATTERNS.house(31) }) as Track,
          comp: t => ({ ...t, pattern: PATTERNS.stabs(60, [4, 12]) }) as Track,
          drums: t =>
            ({
              ...t,
              drums: { snare: '....x.......x...', kick: 'x...x...x...x...' },
              velocity: 0.65,
            }) as Track,
          hats: t =>
            ({
              ...t,
              drums: { hat: 'xxxxxxxxxxxxxxxx' },
              velocity: 0.3,
            }) as Track,
        }),
      },
      {
        id: 'meeting-c',
        label: 'C · Minutes',
        about:
          'Quieter: plain eighths in the bass, the chords held soft like a pad, no snare, the kick on one and three and a hat on the quarters. The most room to read.',
        piece: vary(duelMeeting, 'Meeting C, minutes', {
          bass: t =>
            ({ ...t, pattern: PATTERNS.eighths(31), velocity: 0.65 }) as Track,
          comp: t =>
            ({ ...t, pattern: PATTERNS.hold(60), velocity: 0.4 }) as Track,
          drums: t =>
            ({
              ...t,
              drums: { kick: 'x.......x.......' },
              velocity: 0.7,
            }) as Track,
          hats: t => ({ ...t, drums: { hat: 'x...x...x...x...' } }) as Track,
        }),
      },
    ],
    suggested: 'meeting-a',
    why: 'The walking bass and the repeated notes are the most "meeting" of the three and still leave room to read. B pushes harder than a duel you read through should; C if A starts to nag.',
  },
  {
    room: 'The design studio',
    candidates: [
      {
        id: 'studio-a',
        label: 'A · Drift',
        about:
          'As it ships: a lazy bass with ghost notes, sparse chords in a roomy kit, quarter hats, the tune long and airy, drifting down from E flat.',
        piece: duelStudio,
      },
      {
        id: 'studio-b',
        label: 'B · Lo-fi',
        about:
          'Warmer and hazier: the chords held as a soft wash, the kick lazy and the hats on the offbeats, the tune an octave lower. Focus music.',
        piece: vary(duelStudio, 'Studio B, lo-fi', {
          comp: t =>
            ({ ...t, pattern: PATTERNS.hold(60), velocity: 0.5 }) as Track,
          drums: t =>
            ({
              ...t,
              drums: { snare: '....x.......x...', kick: 'x......x..x.....' },
              reverb: 0.4,
            }) as Track,
          hats: t => ({ ...t, drums: { hat: '..x...x...x...x.' } }) as Track,
          tune: t => ({ ...t, transpose: -12 }) as Track,
        }),
      },
      {
        id: 'studio-c',
        label: 'C · Daylight',
        about:
          'Brighter: a house bass, the chords as a quick square arpeggio from the start, the tune on the square lead instead of the mellow FM.',
        piece: vary(duelStudio, 'Studio C, daylight', {
          bass: t => ({ ...t, pattern: PATTERNS.house(31) }) as Track,
          arp: t => ({ ...t, layer: 0, velocity: 0.3 }) as Track,
          comp: t => ({ ...t, layer: 2 }) as Track,
          tune: t =>
            ({
              chip: 'psg',
              voice: 'lead',
              line: 'line' in t ? t.line : undefined,
              layer: 1,
              velocity: 0.5,
            }) as Track,
        }),
      },
    ],
    suggested: 'studio-b',
    why: "Of the four rooms the studio should feel most unlike the floor's funk, and the held wash with a lower tune does that most while staying calm. A is close; C is the liveliest and the most likely to fight the text.",
  },
  {
    room: 'The corner office',
    candidates: [
      {
        id: 'office-a',
        label: 'A · Night shift',
        about:
          "As it ships: half-time with the snare on three, long low roots, a held pad, the title's roomy kit, a slow sparse tune. The darkest.",
        piece: duelOffice,
      },
      {
        id: 'office-b',
        label: 'B · Heartbeat',
        about:
          'Tenser: a soft kick on every beat like a pulse, a snare only on four, the bass in plain eighths under the pad.',
        piece: vary(duelOffice, 'Office B, heartbeat', {
          bass: t =>
            ({ ...t, pattern: PATTERNS.eighths(29), velocity: 0.7 }) as Track,
          drums: t =>
            ({
              ...t,
              drums: { snare: '............x...', kick: 'x...x...x...x...' },
              velocity: 0.6,
            }) as Track,
        }),
      },
      {
        id: 'office-c',
        label: 'C · Lights low',
        about:
          'Builds the most: only the pad, the low roots and the hats at first; the kit comes in with the tune at the first momentum, the arpeggio at the second.',
        piece: vary(duelOffice, 'Office C, lights low', {
          drums: t => ({ ...t, layer: 1 }) as Track,
        }),
      },
    ],
    suggested: 'office-c',
    why: "The office is the Stakeholder's room, so its loop only plays if it opens the boss fight; C starts nearly silent and builds with momentum, which suits a lead-in to the boss piece best. Otherwise A, the darkest.",
  },
];
