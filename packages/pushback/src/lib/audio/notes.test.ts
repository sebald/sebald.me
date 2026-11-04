import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CHIP,
  PATTERNS,
  type Piece,
  chordAt,
  chordOf,
  compile,
  fitsChip,
  hz,
  lineSteps,
  midiOf,
  parseLine,
  rootAt,
  voicingOf,
} from './notes';

describe('notes', () => {
  it('reads note names as MIDI numbers', () => {
    assert.equal(midiOf('C4'), 60);
    assert.equal(midiOf('A4'), 69);
    assert.equal(midiOf('F#5'), 78);
    assert.equal(midiOf('Bb2'), 46);
    assert.throws(() => midiOf('H2'));
  });

  it('tunes A4 to 440 Hz', () => {
    assert.equal(hz(69), 440);
    assert.equal(Math.round(hz(81)), 880);
  });

  it('reads chord symbols', () => {
    assert.deepEqual(chordOf('Cm7'), { root: 0, intervals: [0, 3, 7, 10] });
    assert.equal(chordOf('Abmaj7').root, 8);
    assert.equal(chordOf('Bbm').root, 10);
    assert.throws(() => chordOf('Csus9'));
  });

  it('places a root and a voicing without it', () => {
    assert.equal(rootAt(chordOf('G'), 36), 43);
    assert.equal(rootAt(chordOf('C'), 36), 36);
    assert.deepEqual(voicingOf(chordOf('Cm7'), 60), [63, 67, 70]);
  });

  it('turns a line into notes held by its dashes', () => {
    assert.deepEqual(parseLine('C4 - - . E4 -'), [
      [0, 60, 3, 1],
      [4, 64, 2, 1],
    ]);
    assert.deepEqual(parseLine('C4', 12), [[0, 72, 1, 1]]);
    assert.equal(lineSteps('C4 - . E4'), 4);
  });

  it('finds the chord of a step, a half bar each for a split bar', () => {
    const chords = ['C', ['F', 'G']] as const;
    assert.equal(chordAt(chords, 0).root, 0);
    assert.equal(chordAt(chords, 16).root, 5);
    assert.equal(chordAt(chords, 24).root, 7);
    // and round again
    assert.equal(chordAt(chords, 32).root, 0);
  });

  it('writes patterns bar by bar', () => {
    const notes = PATTERNS.eighths(36)(['C', 'G']);
    assert.equal(notes.length, 16);
    assert.deepEqual(notes[8], [16, 43, 2, 1]);
  });
});

describe('compile', () => {
  const piece: Piece = {
    name: 'Test',
    bpm: 120,
    chords: ['C', 'C'],
    tracks: [
      { chip: 'fm', voice: 'lead', line: 'C5 - E5 -', layer: 0 },
      { chip: 'fm', voice: 'pad', pattern: PATTERNS.hold(55), layer: 1 },
      {
        chip: 'dac',
        drums: { snare: '....x...', kick: 'x...x...' },
        layer: 0,
      },
    ],
  };

  it('loops for as many sixteenths as its bars', () => {
    const schedule = compile(piece);
    assert.equal(schedule.steps, 32);
    assert.equal(schedule.byStep.length, 32);
    assert.equal(schedule.stepSeconds, 0.125);
  });

  it('puts every note on its step and track', () => {
    const { byStep } = compile(piece);
    assert.deepEqual(
      byStep[2]!.map(e => [e.track, e.sound, e.midi, e.steps]),
      [[0, 'lead', 76, 2]],
    );
  });

  it('plays one drum sample at a time, the first listed winning', () => {
    const { byStep } = compile(piece);
    assert.deepEqual(
      byStep[4]!.filter(e => e.track === 2).map(e => e.sound),
      ['snare'],
    );
    assert.deepEqual(
      byStep[0]!.filter(e => e.track === 2).map(e => e.sound),
      ['kick'],
    );
  });

  it('counts the channels a piece holds at once', () => {
    const { channels } = compile(piece);
    // The lead, and the pad's two notes together
    assert.equal(channels.fm, 3);
    assert.equal(channels.dac, true);
    assert.ok(fitsChip(compile(piece)));
  });

  it('refuses a piece the chip cannot play', () => {
    const crowded: Piece = {
      ...piece,
      tracks: Array.from({ length: CHIP.psg + 1 }, () => ({
        chip: 'psg' as const,
        voice: 'arp' as const,
        line: 'C5',
        layer: 0 as const,
      })),
    };
    assert.equal(fitsChip(compile(crowded)), false);
  });

  it('delays an echo, wrapping round the loop', () => {
    const echo: Piece = {
      ...piece,
      tracks: [{ chip: 'psg', voice: 'lead', line: 'C5', delay: 33, layer: 0 }],
    };
    assert.equal(compile(echo).byStep[1]![0]!.midi, 72);
  });
});
