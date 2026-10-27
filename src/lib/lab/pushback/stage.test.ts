import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RULES, STAKEHOLDER, characterById } from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import { OFFLINE, PLAYER_BARKS, PAIRS, poolOf } from './lines';
import {
  LAYOUT,
  barRects,
  barWidth,
  barsLabel,
  bob,
  BACKING,
  MIN_SCALE,
  backingFor,
  crisp,
  crispScale,
  fontSizeFor,
  PACE,
  holdFor,
  BREATH,
  breathFrame,
  poseOffset,
  posesFor,
  scaleFor,
  scriptFor,
  typedChars,
  typingDuration,
  fitFor,
  scaleTicks,
  viewFor,
} from './stage';

describe('scaleFor', () => {
  it('is 3x wherever the stage fits at 960 by 642', () => {
    assert.equal(scaleFor(960, 642), 3);
    assert.equal(scaleFor(1920, 1080), 3);
    assert.equal(scaleFor(2560, 1440), 3);
  });

  it('shrinks with the narrower side below that', () => {
    assert.equal(scaleFor(640, 600), 2);
    assert.equal(scaleFor(960, 428), 2);
    assert.equal(scaleFor(360, 800), 1.125);
    assert.ok(scaleFor(300, 800) < MIN_SCALE);
  });

  it('takes a larger cap for the workbench', () => {
    assert.equal(scaleFor(1920, 1080, 4), 4);
  });

  it('crops the ceiling of a short window before shrinking', () => {
    assert.deepEqual(fitFor(1200, 700), { scale: 3, crop: 0 });
    // 642 tall at 3x, 600 of room: 14 rows go
    assert.deepEqual(fitFor(1200, 600), { scale: 3, crop: 14 });
    // Past 60 rows the stage shrinks to fit 154 rows
    const short = fitFor(1200, 400);
    assert.equal(short.crop, 60);
    assert.ok(Math.abs(short.scale - 400 / 154) < 1e-9);
  });

  it('never goes above the maximum', () => {
    assert.equal(scaleFor(10_000, 10_000, 5), 5);
  });

  it('snaps to the device pixels on a dense screen, not on a 1x one', () => {
    assert.equal(crispScale(2.9, 2), 2.5);
    assert.equal(crispScale(2.9, 3), 2 + 2 / 3);
    assert.equal(crispScale(2.9, 1), 2.9);
    assert.equal(crispScale(3, 2), 3);
    // Never under the minimum: the fraction stays
    assert.equal(crispScale(1.4, 2), 1.4);
    assert.equal(crispScale(1.6, 2), 1.5);
    assert.deepEqual(fitFor(900, 1000, 3, 2), { scale: 2.5, crop: 0 });
    const short = fitFor(1200, 400, 3, 2);
    assert.equal(short.scale, 2.5);
    assert.equal(short.crop, 60);
  });

  it('draws the canvas at the device pixels when they are whole', () => {
    assert.equal(crisp(2.5, 2), true);
    assert.equal(crisp(2.5, 1), false);
    assert.equal(backingFor(2.5, 2), 5);
    assert.equal(backingFor(3, 3), 9);
    assert.equal(backingFor(2, 1), 2);
    assert.equal(backingFor(2.7, 1), BACKING);
  });
});

describe('fontSizeFor', () => {
  it('is 16 px at 3x with a 14 px floor', () => {
    assert.equal(fontSizeFor(1), 14);
    assert.equal(fontSizeFor(3), 16);
    assert.equal(fontSizeFor(4.5), 24);
  });
});

describe('bars', () => {
  it('lays boxes out with gaps and fills the first ones', () => {
    const rects = barRects({
      x: 10,
      y: 5,
      count: 3,
      filled: 2,
      width: LAYOUT.ticks.width,
      height: LAYOUT.ticks.height,
      gap: LAYOUT.ticks.gap,
    });
    assert.deepEqual(
      rects.map(r => [r.x, r.filled]),
      [
        [10, true],
        [22, true],
        [34, false],
      ],
    );
    assert.equal(barWidth(3, LAYOUT.ticks), 34);
  });

  it('draws the scale as ticks, the player on the left, lit to the marker', () => {
    const even = scaleTicks({ scale: 0, toWin: 3, toLose: 3 });
    assert.equal(even.length, 7);
    assert.deepEqual(
      even.map(t => t.side),
      ['player', 'player', 'player', null, 'opponent', 'opponent', 'opponent'],
    );
    assert.equal(
      even.findIndex(t => t.marker),
      3,
    );
    assert.ok(even.every(t => !t.lit));
    // Centred on the stage
    assert.equal(even[0]!.x + even[6]!.x + even[6]!.width, 320);

    const ahead = scaleTicks({ scale: 2, toWin: 3, toLose: 3 });
    assert.deepEqual(
      ahead.map(t => t.lit),
      [false, true, true, false, false, false, false],
    );
    assert.equal(
      ahead.findIndex(t => t.marker),
      1,
    );

    const boss = scaleTicks({ scale: -1, toWin: 4, toLose: 3 });
    assert.equal(boss.length, 8);
    assert.equal(
      boss.findIndex(t => t.marker),
      5,
    );
    assert.equal(boss[5]!.lit, true);
  });
});

describe('typing', () => {
  it('reveals characters at the speed', () => {
    assert.equal(typedChars(0, 'hello'), 0);
    assert.equal(typedChars(120, 'hello'), 3);
    assert.equal(typedChars(5000, 'hello'), 5);
    assert.equal(typingDuration('hello world!'), 480);
  });

  it('holds a line long enough to read it once more, capped', () => {
    assert.ok(holdFor('Hi.') < holdFor('A much longer line of dialogue.'));
    // Seventy characters, the line limit: about 3.5 s at 20 a second
    assert.ok(holdFor('x'.repeat(70)) >= 3000);
    assert.equal(holdFor('x'.repeat(500)), PACE.holdMax);
    assert.equal(holdFor('x'.repeat(500), 700), 700);
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

  it('breathes idle, chuckles on a taunt, sobs on a loss, holds a flinch', () => {
    assert.equal(breathFrame('idle', 0), 0);
    assert.equal(breathFrame('idle', BREATH.period / 2), 1);
    assert.equal(breathFrame('taunt', BREATH.chuckle / 2), 1);
    assert.equal(breathFrame('taunt', BREATH.chuckle), 0);
    assert.equal(breathFrame('lose', BREATH.sob / 2), 1);
    assert.equal(breathFrame('lose', BREATH.period / 2), 0);
    assert.equal(breathFrame('flinch', BREATH.period / 2), 0);
  });
});

const pmPool = poolOf('pm').map(p => p.id);
const deck = PAIRS.map(p => p.id);

const start = (boss = false): DuelState =>
  createDuel({
    role: 'pm',
    character: boss ? STAKEHOLDER : characterById('junior'),
    slot: boss
      ? { tier: 'boss', accuracy: 1, menu: 6, decoys: 'all', silence: false }
      : { tier: 1, accuracy: 0, menu: 4, decoys: 'any', silence: false },
    attempt: 'first',
    deck,
    repertoire: deck,
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
    for (let i = 0; i < RULES.momentum; i++) {
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
    assert.equal(barsLabel(s, 'player'), 'Even, momentum 0 of 2');
    const full = { ...s, momentum: { ...s.momentum, player: RULES.momentum } };
    assert.equal(barsLabel(full, 'player'), 'Even, momentum full');
    assert.equal(
      barsLabel({ ...s, scale: 2 }, 'player'),
      'You lead, 2 of 3, momentum 0 of 2',
    );
    assert.equal(
      barsLabel({ ...s, scale: -1 }, 'player'),
      'They lead, 1 of 3, momentum 0 of 2',
    );
  });
});

describe('viewFor', () => {
  it('centres the window on the duellists and puts the floor on the feet line', () => {
    assert.deepEqual(viewFor({ left: 124, right: 284 }), { x: 80, y: 102 });
    // Clamped to the render
    assert.equal(viewFor({ left: 0, right: 60 }).x, 0);
    assert.equal(viewFor({ left: 400, right: 408 }).x, 160);
  });
});
