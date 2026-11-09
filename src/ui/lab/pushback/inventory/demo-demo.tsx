'use client';

import { demoFor } from '@sebald/pushback/lib/attract';
import { createDuel } from '@sebald/pushback/lib/duel';
import { DuelScreen } from '@sebald/pushback/ui/duel-screen';
import { useMemo, useState } from 'react';

import { DemoForm, field } from './controls';

/**
 * The attract mode without the twenty seconds on the title: the demo
 * duel as the game plays it, a new one from another seed on a press or
 * when it ends. Keys go to it as in the game (any key leaves), so here
 * they start the next one.
 */
export const DemoDemo = () => {
  const [seed, setSeed] = useState(1);
  const next = () => setSeed(s => s + 1);
  const demo = useMemo(() => demoFor(seed), [seed]);
  return (
    <div className="grid gap-4">
      <DemoForm>
        <button type="button" className={field.input} onClick={next}>
          Next demo
        </button>
        <span className="text-mist-400">Seed {seed}</span>
      </DemoForm>
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
