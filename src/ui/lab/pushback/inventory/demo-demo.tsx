'use client';

import { useState } from 'react';

import { demoFor } from '@/lib/lab/pushback/attract';
import { createDuel } from '@/lib/lab/pushback/duel';

import { DuelScreen } from '../duel-screen';
import { field } from './controls';

/**
 * The attract mode without the twenty seconds on the title: the demo
 * duel as the game plays it, a new one from another seed on a press or
 * when it ends. Keys go to it as in the game (any key leaves), so here
 * they start the next one.
 */
export const DemoDemo = () => {
  const [seed, setSeed] = useState(1);
  const next = () => setSeed(s => s + 1);
  const demo = demoFor(seed);
  return (
    <div className="grid gap-4">
      <div className={field.form}>
        <button type="button" className={field.input} onClick={next}>
          Next demo
        </button>
        <span className="text-mist-400">Seed {seed}</span>
      </div>
      <DuelScreen
        key={seed}
        look={demo.look}
        initial={createDuel(demo.setup)}
        auto
        scale={2}
        onEnd={next}
        onBack={next}
      />
    </div>
  );
};
