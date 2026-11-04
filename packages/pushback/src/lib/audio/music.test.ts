import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUEL_LAYERS, MUSIC } from './music';
import { STEPS_PER_BAR, compile, fitsChip, lineSteps } from './notes';

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

  it('gives the duel no lead before momentum, and a layer per step of it', () => {
    const base = MUSIC.duel.tracks.filter(track => track.layer === 0);
    assert.ok(
      base.every(track => track.chip !== 'fm' || track.voice !== 'mellow'),
    );
    assert.equal(
      new Set(MUSIC.duel.tracks.map(track => track.layer)).size,
      DUEL_LAYERS.length,
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
