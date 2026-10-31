'use client';

import { useState } from 'react';

import { demoFor } from '@/lib/lab/pushback/attract';
import { type DuelState, createDuel } from '@/lib/lab/pushback/duel';

import { DuelScreen } from '../duel-screen';
import { Field, field } from './controls';

type Ending = 'win' | 'flawless' | 'lose';

const ENDINGS: Record<Ending, string> = {
  win: 'Win',
  flawless: 'Flawless',
  lose: 'Lose',
};

/** A duel at its end, with a few exchanges' worth of numbers */
const ended = (seed: number, ending: Ending, encounter: number): DuelState => {
  const { setup } = demoFor(seed);
  const duel = createDuel({ ...setup, buddy: false, encounter });
  const won = ending !== 'lose';
  return {
    ...duel,
    phase: 'end',
    winner: won ? 'player' : 'opponent',
    scale: won ? 4 : -4,
    exchange: null,
    menu: [],
    hand: [],
    // Two lines learned on the way
    stats: {
      ...duel.stats,
      exchangesWon: won ? 4 : 2,
      exchangesLost: ending === 'win' ? 1 : ending === 'lose' ? 4 : 0,
      micDrops: won ? 1 : 0,
    },
    collected: [...duel.collected, ...setup.deck.slice(0, 2)],
  };
};

/**
 * A duel at its end, as the game plays it: the beat, the stamp coming
 * down, the last lines (Enter or a tap), then the verdict window. A win,
 * a flawless win or a loss against a colleague picked by the seed; each
 * replay takes the next verdict in turn.
 */
export const EndDemo = () => {
  const [ending, setEnding] = useState<Ending>('win');
  const [seed, setSeed] = useState(1);
  const [play, setPlay] = useState(0);
  const replay = () => setPlay(n => n + 1);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Ending">
          <select
            className={field.input}
            value={ending}
            onChange={e => {
              setEnding(e.target.value as Ending);
              replay();
            }}
          >
            {Object.entries(ENDINGS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <button type="button" className={field.input} onClick={replay}>
          Replay
        </button>
        <button
          type="button"
          className={field.input}
          onClick={() => {
            setSeed(s => s + 1);
            replay();
          }}
        >
          Next colleague
        </button>
        <span className="text-mist-400">Enter or tap moves on</span>
      </form>
      <DuelScreen
        key={`${seed}-${ending}-${play}`}
        look={demoFor(seed).look}
        initial={ended(seed, ending, play)}
        scale={2}
        onEnd={replay}
        onBack={replay}
      />
    </div>
  );
};
