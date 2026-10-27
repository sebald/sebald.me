import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RULES, STAKEHOLDER, characterById } from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import { OFFLINE, PLAYER_BARKS, poolOf } from './lines';
import {
  LAYOUT,
  barRects,
  barWidth,
  barsLabel,
  bob,
  fontSizeFor,
  holdFor,
  poseOffset,
  posesFor,
  scaleFor,
  scriptFor,
  typedChars,
  typingDuration,
} from './stage';

describe('scaleFor', () => {
  it('picks the largest whole number that fits both sides', () => {
    assert.equal(scaleFor(1440, 900), 3);
    assert.equal(scaleFor(1920, 1080), 4);
    assert.equal(scaleFor(2560, 1440), 4);
    assert.equal(scaleFor(960, 600), 2);
    assert.equal(scaleFor(700, 400), 1);
  });

  it('never goes below one', () => {
    assert.equal(scaleFor(300, 200), 1);
  });

  it('never goes above the maximum', () => {
    assert.equal(scaleFor(10_000, 10_000, 5), 5);
  });
});

describe('fontSizeFor', () => {
  it('has a 12 px floor', () => {
    assert.equal(fontSizeFor(1), 12);
    assert.equal(fontSizeFor(2), 12);
    assert.equal(fontSizeFor(3), 18);
  });
});

describe('bars', () => {
  it('lays boxes out with gaps and fills the first ones', () => {
    const rects = barRects({
      x: 10,
      y: 5,
      count: 3,
      filled: 2,
      ...LAYOUT.buyIn,
    });
    assert.deepEqual(
      rects.map(r => [r.x, r.filled]),
      [
        [10, true],
        [22, true],
        [34, false],
      ],
    );
    assert.equal(barWidth(3, LAYOUT.buyIn), 34);
  });
});

describe('typing', () => {
  it('reveals characters at the speed', () => {
    assert.equal(typedChars(0, 'hello'), 0);
    assert.equal(typedChars(100, 'hello'), 3);
    assert.equal(typedChars(5000, 'hello'), 5);
    assert.equal(typingDuration('hello world!'), 400);
  });

  it('holds longer lines a little longer, capped', () => {
    assert.ok(holdFor('Hi.') < holdFor('A much longer line of dialogue.'));
    assert.equal(holdFor('x'.repeat(500)), 1800);
  });
});

describe('poses', () => {
  it('bobs one pixel on the period', () => {
    assert.equal(bob(0), 0);
    assert.equal(bob(300), -1);
    assert.equal(bob(600), 0);
  });

  it('steps towards the opponent on a taunt and back on a flinch', () => {
    assert.equal(poseOffset('taunt', 1000, 1).dx, 2);
    assert.equal(poseOffset('taunt', 1000, 1, true).dx, 4);
    assert.equal(poseOffset('taunt', 1000, -1).dx, -2);
    assert.equal(poseOffset('flinch', 0, 1).dx, -2);
    assert.ok(poseOffset('flinch', 0, 1).lighter);
    assert.ok(!poseOffset('flinch', 500, 1).lighter);
    assert.equal(poseOffset('lose', 300, 1).dy, 0);
  });
});

const pmPool = poolOf('pm').map(p => p.id);

const start = (boss = false): DuelState =>
  createDuel({
    role: 'pm',
    character: boss ? STAKEHOLDER : characterById('junior'),
    slot: boss
      ? { tier: 'boss', accuracy: 1, menu: 6, decoys: 'all', silence: null }
      : { tier: 1, accuracy: 0, menu: 4, decoys: 'any', silence: null },
    attempt: 'first',
    collected: pmPool,
    seed: 3,
    silence: false,
  });

describe('scriptFor', () => {
  it('opens with the intro bark', () => {
    const [step] = scriptFor(start());
    assert.deepEqual(step, {
      kind: 'line',
      speaker: 'opponent',
      text: characterById('junior').intro,
    });
  });

  it('types the phrase then shows the menu on defence', () => {
    const s = reduce(start(), { type: 'begin' });
    const steps = scriptFor(s);
    assert.equal(steps.length, 2);
    assert.equal(steps[0]?.kind, 'line');
    assert.equal(steps[1]?.kind, 'menu');
    assert.deepEqual(posesFor(s, steps[0]), {
      player: 'idle',
      opponent: 'talk',
    });
  });

  it('reveals the right counter after a miss, then taunt and flinch', () => {
    let s = reduce(start(), { type: 'begin' });
    const wrong = s.menu.find(id => id !== s.exchange!.answer)!;
    s = reduce(s, { type: 'counter', phrase: wrong });
    const steps = scriptFor(s);
    assert.deepEqual(
      steps.map(step => step.kind),
      ['line', 'reveal', 'beat'],
    );
    assert.deepEqual(posesFor(s, steps[2]), {
      player: 'flinch',
      opponent: 'taunt',
    });
  });

  it('types the thrown phrase and the answer on attack', () => {
    let s = reduce(start(), { type: 'begin' });
    s = reduce(s, { type: 'counter', phrase: s.exchange!.answer });
    s = reduce(s, { type: 'continue' });
    s = reduce(s, { type: 'throw', phrase: s.hand[0]! });
    const steps = scriptFor(s);
    assert.deepEqual(
      steps.map(step => step.kind),
      ['line', 'line', 'beat'],
    );
    assert.equal((steps[0] as { speaker: string }).speaker, 'player');
    assert.equal((steps[1] as { speaker: string }).speaker, 'opponent');
  });

  it('says offline on the interrupt', () => {
    let s = reduce(start(true), { type: 'begin' });
    for (let i = 0; i < 3; i++) {
      s = reduce(s, { type: 'counter', phrase: s.exchange!.answer });
      s = reduce(s, { type: 'continue' });
    }
    assert.equal(s.phase, 'attack');
    s = reduce(s, { type: 'throw', phrase: s.hand[0]! });
    const texts = scriptFor(s).flatMap(step =>
      step.kind === 'line' ? [step.text] : [],
    );
    assert.ok(texts.includes(OFFLINE));
  });

  it('ends with the barks and a wait', () => {
    let s = reduce(start(), { type: 'begin' });
    for (let guard = 0; guard < 20 && s.phase !== 'end'; guard++) {
      if (s.phase === 'defend')
        s = reduce(s, { type: 'counter', phrase: s.exchange!.answer });
      else if (s.phase === 'attack')
        s = reduce(s, { type: 'throw', phrase: s.hand[0]! });
      else s = reduce(s, { type: 'continue' });
    }
    const steps = scriptFor(s);
    assert.equal(steps.at(-1)?.kind, 'wait');
    const bark = steps.find(step => step.kind === 'line');
    assert.equal((bark as { text: string }).text, PLAYER_BARKS.pm.win);
    assert.deepEqual(posesFor(s, steps.at(-1)), {
      player: 'win',
      opponent: 'lose',
    });
  });
});

describe('barsLabel', () => {
  it('reads the bars in words', () => {
    const s = start();
    assert.equal(barsLabel(s, 'player'), 'Buy-in 0 of 3, momentum 0 of 3');
    const full = { ...s, momentum: { ...s.momentum, player: RULES.momentum } };
    assert.equal(barsLabel(full, 'player'), 'Buy-in 0 of 3, momentum full');
  });
});
