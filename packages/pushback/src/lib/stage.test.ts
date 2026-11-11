import { bitmapTextSize } from '@sebald/blip-ui';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { RULES, STAKEHOLDER, type SceneId, characterById } from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import { OFFLINE, PLAYER_BARKS, PAIRS, poolOf } from './lines';
import {
  LAYOUT,
  STAGE,
  roomBox,
  barsLabel,
  bob,
  PACE,
  holdFor,
  BREATH,
  breathFrame,
  poseOffset,
  posesFor,
  scriptFor,
  typedChars,
  typingDuration,
  scaleBeam,
  viewFor,
} from './stage';

describe('bars', () => {
  it('draws the scale as a beam clash, the spark pushed toward the loser', () => {
    const even = scaleBeam({ scale: 0, toWin: 3, toLose: 3 });
    assert.equal(even.steps, 6);
    assert.equal(even.width, 6 * even.step);
    // Between the faces in the corners, as wide as whole steps allow
    assert.equal(even.step, 44);
    // Centred on the stage, the spark in the middle
    assert.equal(even.x * 2 + even.width, 320);
    assert.equal(even.spark, 160);

    // Two steps ahead: the gold beam is two steps longer
    const ahead = scaleBeam({ scale: 2, toWin: 3, toLose: 3 });
    assert.equal(ahead.spark, 160 + 2 * ahead.step);
    // At the win the spark is at the far end
    const won = scaleBeam({ scale: 3, toWin: 3, toLose: 3 });
    assert.equal(won.spark, won.x + won.width);

    // The Stakeholder: further to push, the start off centre toward them
    const boss = scaleBeam({ scale: 0, toWin: 4, toLose: 3 });
    assert.equal(boss.steps, 7);
    assert.equal(boss.spark, boss.x + 3 * boss.step);
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
  });

  it('flickers a flinch for a second after the flash', () => {
    assert.ok(!poseOffset('flinch', 0, 1).hidden);
    assert.ok(poseOffset('flinch', 125, 1).hidden);
    assert.ok(!poseOffset('flinch', 250, 1).hidden);
    assert.ok(poseOffset('flinch', 875, 1).hidden);
    assert.ok(!poseOffset('flinch', 1125, 1).hidden);
    assert.ok(!poseOffset('taunt', 125, 1).hidden);
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
      text: characterById('junior').intros[0],
    });
  });

  it('picks the intro in turn by the encounter', () => {
    const later = { ...start(), setup: { ...start().setup, encounter: 4 } };
    const [step] = scriptFor(later);
    assert.equal(
      (step as { text: string }).text,
      characterById('junior').intros[1],
    );
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
    assert.equal((bark as { text: string }).text, PLAYER_BARKS.pm.win[0]);
    // Held from the beat through the bark to the wait
    for (const step of steps)
      assert.deepEqual(posesFor(s, step), {
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

describe('the round call', () => {
  // BitmapText's sizes, in stage pixels a letter pixel
  const MEDIUM = 3;
  const DEFAULT = 2;

  it('keeps FLAWLESS on the line of the call, inside the stage', () => {
    const line =
      bitmapTextSize('YOU WIN', MEDIUM).width +
      LAYOUT.call.line +
      bitmapTextSize('FLAWLESS', DEFAULT).width;
    const inside = STAGE.width - 2 * LAYOUT.heads.x;
    assert.ok(line <= inside, `${line} px in ${inside}`);
  });

  it("stays in the bars' rows, above the tallest head", () => {
    const height = Math.max(
      ...['YOU WIN', 'YOU LOSE', 'OFFLINE'].map(
        word => bitmapTextSize(word, MEDIUM).height,
      ),
    );
    const bottom = LAYOUT.call.y + height;
    assert.ok(bottom <= LAYOUT.hud, `the call ends at row ${bottom}`);
    // The tallest head the sheets allow (`sheets.test.ts`)
    assert.ok(bottom <= LAYOUT.feet - 96, `the call ends at row ${bottom}`);
  });
});

describe('viewFor', () => {
  it('centres the window on the duellists and puts the floor on the feet line', () => {
    assert.deepEqual(viewFor({ left: 124, right: 284 }), { x: 80, y: 102 });
    // Clamped to the render
    assert.equal(viewFor({ left: 0, right: 60 }).x, 0);
    assert.equal(viewFor({ left: 400, right: 408 }).x, 160);
    assert.equal(viewFor({ left: 145, right: 297, view: 101 }).x, 101);
  });

  it("puts a scene's own feet row on the feet line", () => {
    assert.equal(viewFor({ left: 124, right: 284, feet: 242 }).y, 114);
  });
});

describe('roomBox', () => {
  // The first frame of a scene's 1x loop, raw RGB
  const frame = async (scene: SceneId) => {
    // sharp comes with Next, as in the scene scripts
    const local = createRequire(import.meta.url);
    const sharp = createRequire(local.resolve('next/package.json'))(
      'sharp',
    ) as (
      file: string,
      options: { page: number },
    ) => {
      removeAlpha(): {
        raw(): {
          toBuffer(options: { resolveWithObject: true }): Promise<{
            data: Buffer;
            info: { width: number; height: number };
          }>;
        };
      };
    };
    const file = fileURLToPath(
      new URL(`../assets/scenes/${scene}/scene-1x.webp`, import.meta.url),
    );
    const { data, info } = await sharp(file, { page: 0 })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const at = (x: number, y: number) => {
      const i = (y * info.width + x) * 3;
      return [data[i]!, data[i + 1]!, data[i + 2]!];
    };
    return { data, width: info.width, height: info.height, at };
  };

  for (const scene of ['floor', 'meeting', 'studio', 'office'] as const) {
    it(`matches the room in the ${scene} scene's files`, async () => {
      const box = roomBox(scene);
      const { width, height, at } = await frame(scene);
      const right = box.x + box.width - 1;
      const bottom = box.y + box.height - 1;
      const same = (a: number[], b: number[]) => a.join() === b.join();
      // Round the room, every pixel repeats the room's nearest edge pixel
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          if (x >= box.x && x <= right && y >= box.y && y <= bottom) continue;
          const near = at(
            Math.min(right, Math.max(box.x, x)),
            Math.min(bottom, Math.max(box.y, y)),
          );
          assert.ok(
            same(at(x, y), near),
            `${x},${y} is not padding: the room is larger than rooms.json says`,
          );
        }
      // And the room reaches its box: its outer rows and columns differ
      // from the ones a few pixels in somewhere (a render's own padding,
      // two rows at most from `scene.mjs`, stays within that)
      const IN = 3;
      const differs = (
        n: number,
        a: (i: number) => number[],
        b: (i: number) => number[],
      ) => Array.from({ length: n }, (_, i) => i).some(i => !same(a(i), b(i)));
      const edges = {
        left: differs(
          box.height,
          i => at(box.x, box.y + i),
          i => at(box.x + IN, box.y + i),
        ),
        right: differs(
          box.height,
          i => at(right, box.y + i),
          i => at(right - IN, box.y + i),
        ),
        top: differs(
          box.width,
          i => at(box.x + i, box.y),
          i => at(box.x + i, box.y + IN),
        ),
        bottom: differs(
          box.width,
          i => at(box.x + i, bottom),
          i => at(box.x + i, bottom - IN),
        ),
      };
      for (const [edge, ok] of Object.entries(edges))
        assert.ok(
          ok,
          `the ${edge} edge is padding: the room is smaller than rooms.json says`,
        );
    });

    // What a smooth shrink leaves on an edge: a pixel whose colour lies
    // between its two different neighbours in a row or a column, on every
    // channel and clearly on one (`settleEdges` in `shrink.mjs`)
    it(`gives the ${scene} room hard edges`, async () => {
      const box = roomBox(scene);
      const { at } = await frame(scene);
      const between = (a: number[], m: number[], b: number[]) => {
        let clearly = false;
        for (let c = 0; c < 3; c++) {
          const lo = Math.min(a[c]!, b[c]!);
          const hi = Math.max(a[c]!, b[c]!);
          if (m[c]! < lo || m[c]! > hi) return false;
          if (hi - lo > 24 && m[c]! > lo + 4 && m[c]! < hi - 4) clearly = true;
        }
        return clearly;
      };
      let meetings = 0;
      let soft = 0;
      // Along the rows, then down the columns
      for (const dx of [1, 0] as const) {
        const outer = dx ? box.height : box.width;
        const inner = dx ? box.width : box.height;
        for (let o = 0; o < outer; o++) {
          let run = 1;
          for (let i = 1; i < inner; i++) {
            const p = (k: number) =>
              dx ? at(box.x + k, box.y + o) : at(box.x + o, box.y + k);
            if (p(i).join() === p(i - 1).join()) {
              run++;
              continue;
            }
            meetings++;
            if (run === 1 && i >= 2 && between(p(i - 2), p(i - 1), p(i)))
              soft++;
            run = 1;
          }
        }
      }
      const share = (100 * soft) / meetings;
      assert.ok(share <= 4, `${share.toFixed(1)} % of the edges are soft`);
    });
  }
});
