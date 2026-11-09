import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bossIndex } from './characters';
import { PAIRS } from './lines';
import { CARD, type CardPart, partBox, resultCard } from './result-card';
import { createRunState } from './run';

const run = (finished: boolean) => {
  const state = createRunState('pm', 'a', 1);
  const colleagues = bossIndex(state.run);
  return {
    ...state,
    look: 'a' as const,
    finished,
    attempts: 4,
    beaten: Object.fromEntries(
      Array.from({ length: finished ? colleagues + 1 : colleagues }, (_, i) => [
        i,
        { flawless: i === 0, score: 1000 },
      ]),
    ),
  };
};

const texts = (parts: CardPart[]) =>
  Object.fromEntries(
    parts.flatMap(part =>
      part.kind === 'text' ? [[part.name, part.text] as const] : [],
    ),
  );

describe('resultCard', () => {
  it('names the player, the verdict, the result and the score', () => {
    const card = texts(resultCard({ run: run(true) }));
    assert.equal(card.name, 'JO');
    assert.equal(card.role, 'PM');
    assert.match(card.verdict!, /\.$/);
    assert.equal(card.result, 'STAKEHOLDER BEATEN');
    assert.equal(card.score, '4,000');
    assert.equal(card['value Duels'], '4');
    assert.equal(card['value Flawless'], '1');
  });

  it('says a lost run was taken offline, in red', () => {
    const parts = resultCard({ run: run(false) });
    assert.equal(texts(parts).result, 'TAKEN OFFLINE');
    const verdict = parts.find(
      part => part.kind === 'text' && part.name === 'verdict',
    );
    assert.equal(verdict?.kind === 'text' && verdict.tone, 'red');
  });

  it('counts the glossary, all of it and by pool', () => {
    const all = PAIRS.map(pair => pair.id);
    const card = texts(resultCard({ run: run(true), glossary: all }));
    assert.equal(card['glossary count'], `${all.length}/${all.length}`);
    assert.equal(card['pool pm count'], '20/20');
  });

  it('draws the room first and keeps everything else inside the panel', () => {
    const parts = resultCard({ run: run(true) });
    assert.equal(parts[0]!.kind, 'room');
    const panel = partBox(parts[1]!)!;
    assert.ok(panel.x + panel.width <= CARD.width);
    assert.ok(panel.y + panel.height <= CARD.height);
    for (const part of parts.slice(2)) {
      const box = partBox(part)!;
      const what = part.kind === 'text' ? part.name : part.kind;
      assert.ok(box.x >= panel.x && box.y >= panel.y, `${what} starts inside`);
      assert.ok(
        box.x + box.width <= panel.x + panel.width &&
          box.y + box.height <= panel.y + panel.height,
        `${what} ends inside`,
      );
    }
  });

  it('lets no two texts overlap', () => {
    const boxes = resultCard({ run: run(true) }).flatMap(part =>
      part.kind === 'text' ? [part] : [],
    );
    for (const a of boxes)
      for (const b of boxes) {
        if (a === b) continue;
        const apart =
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y;
        assert.ok(apart, `${a.name} and ${b.name} overlap`);
      }
  });

  it('fits the longest verdict on its line', () => {
    for (const attempts of [0, 1, 2]) {
      for (const finished of [true, false]) {
        const parts = resultCard({ run: { ...run(finished), attempts } });
        const verdict = parts.find(
          (part): part is Extract<CardPart, { kind: 'text' }> =>
            part.kind === 'text' && part.name === 'verdict',
        )!;
        assert.ok(verdict.x + verdict.width <= 390 - 12, verdict.text);
      }
    }
  });
});
