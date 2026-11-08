import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUEL_CUES, DUEL_LAYERS, MUSIC, duelCue } from './music';
import {
  STEPS_PER_BAR,
  chordOf,
  compile,
  fitsChip,
  lineSteps,
  parseLine,
} from './notes';

describe('the soundtrack', () => {
  for (const [cue, piece] of Object.entries(MUSIC)) {
    it(`${cue} fits a Mega Drive`, () => {
      assert.ok(
        fitsChip(compile(piece)),
        JSON.stringify(compile(piece).channels),
      );
    });

    it(`${cue} has its melodies as long as its bars`, () => {
      const steps = piece.chords.length * STEPS_PER_BAR;
      for (const track of piece.tracks) {
        if ('line' in track && track.line) {
          assert.equal(lineSteps(track.line), steps);
        }
      }
    });
  }

  it('keeps one tempo grid, 96 and half as fast again', () => {
    for (const piece of Object.values(MUSIC)) {
      assert.ok([96, 144].includes(piece.bpm), piece.name);
    }
  });

  it('plays the jingles once and loops the rest', () => {
    assert.equal(MUSIC.win.once, true);
    assert.equal(MUSIC.lose.once, true);
    for (const cue of ['title', 'duel', 'boss', 'result'] as const) {
      assert.notEqual(MUSIC[cue].once, true);
    }
  });

  it('gives every room a duel loop of its own, in the same groove', () => {
    const cues = Object.values(DUEL_CUES);
    assert.deepEqual(Object.keys(DUEL_CUES).sort(), [
      'floor',
      'meeting',
      'office',
      'studio',
    ]);
    assert.equal(new Set(cues).size, 4);
    assert.equal(DUEL_CUES.floor, 'duel');
    for (const cue of cues) {
      assert.equal(MUSIC[cue].bpm, 96, cue);
      assert.equal(MUSIC[cue].chords.length, 8, cue);
      assert.notEqual(MUSIC[cue].once, true, cue);
    }
    // No two rooms share a tune
    const tunes = cues.map(cue =>
      JSON.stringify(
        MUSIC[cue].tracks.map(track => ('line' in track ? track.line : '')),
      ),
    );
    assert.equal(new Set(tunes).size, 4);
  });

  it('keeps each duel loop to C dorian and its Ab major seventh', () => {
    const dorian = new Set([0, 2, 3, 5, 7, 8, 9, 10]);
    for (const cue of Object.values(DUEL_CUES)) {
      for (const chord of MUSIC[cue].chords) {
        const { root, intervals } = chordOf(chord as string);
        // Every chord tone is in the scale (and the Ab of the Abmaj7), bar the G7's leading tone
        for (const interval of intervals) {
          const pitch = (root + interval) % 12;
          assert.ok(
            dorian.has(pitch) || (chord === 'G7' && pitch === 11),
            `${cue} ${chord}`,
          );
        }
      }
      for (const track of MUSIC[cue].tracks) {
        if (!('line' in track) || !track.line) continue;
        for (const [, midi] of parseLine(track.line, track.transpose)) {
          const pitch = midi % 12;
          assert.ok(dorian.has(pitch) || pitch === 11, `${cue} ${midi}`);
        }
      }
    }
  });

  it('gives each duel loop no lead before momentum, and a layer per step of it', () => {
    for (const cue of Object.values(DUEL_CUES)) {
      const tracks = MUSIC[cue].tracks;
      const base = tracks.filter(track => track.layer === 0);
      assert.ok(
        base.every(track => track.chip !== 'fm' || track.voice !== 'mellow'),
        cue,
      );
      assert.equal(
        new Set(tracks.map(track => track.layer)).size,
        DUEL_LAYERS.length,
        cue,
      );
    }
  });

  it("plays the room's loop, and opens the boss's fight on the office's until an exchange is won", () => {
    for (const scene of ['floor', 'meeting', 'studio'] as const)
      assert.equal(
        duelCue({ scene, boss: false, exchangesWon: 3 }),
        DUEL_CUES[scene],
      );
    assert.equal(
      duelCue({ scene: 'office', boss: true, exchangesWon: 0 }),
      'duelOffice',
    );
    assert.equal(
      duelCue({ scene: 'office', boss: true, exchangesWon: 1 }),
      'boss',
    );
  });

  it('hands the jingles over to the result on G and E flat', () => {
    const last = (line: string) =>
      line
        .trim()
        .split(/\s+/)
        .filter(t => !'-.'.includes(t))
        .at(-1);
    const win = MUSIC.win.tracks[0]!;
    const lose = MUSIC.lose.tracks[0]!;
    assert.ok('line' in win && 'line' in lose);
    assert.equal(last(win.line!), 'G6');
    assert.equal(last(lose.line!), 'Eb5');
  });
});
