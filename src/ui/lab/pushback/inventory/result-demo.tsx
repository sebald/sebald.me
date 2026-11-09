'use client';

import type { Look } from '@sebald/pushback/lib/characters';
import { PAIRS, ROLES, type Role } from '@sebald/pushback/lib/lines';
import { createRunState } from '@sebald/pushback/lib/run';
import type { SavedRun } from '@sebald/pushback/lib/save';
import { ResultScreen } from '@sebald/pushback/ui/result';
import { useMemo, useState } from 'react';

import { Field, ScaleSelect, Select, field } from './controls';

/** A run that reached the Stakeholder, with made-up numbers and a glossary */
export const sampleRun = (
  role: Role,
  look: Look,
  finished: boolean,
): SavedRun => {
  const run = createRunState(role, look, 7);
  return {
    ...run,
    look,
    finished,
    mode: 'normal',
    attempts: 6,
    buddy: false,
    beaten: {
      0: { flawless: true, score: 2460 },
      1: { flawless: false, score: 1830 },
      2: { flawless: true, score: 2950 },
      3: { flawless: false, score: 4170 },
    },
    stats: {
      ...run.stats,
      exchangesWon: 23,
      exchangesLost: 9,
      micDrops: 3,
      missesByPool: { pm: 0, dev: 4, designer: 1 },
    },
  };
};

/** Some of every pool, more of the own one */
export const sampleGlossary = (role: Role) =>
  PAIRS.filter((pair, i) =>
    pair.role === role ? i % 8 !== 3 : i % 3 !== 0 && i % 5 !== 0,
  ).map(pair => pair.id);

/** The end of a run, at a fixed scale, for any role and look */
export const ResultDemo = () => {
  const [role, setRole] = useState<Role>('pm');
  const [look, setLook] = useState<Look>('a');
  const [finished, setFinished] = useState(true);
  const [scale, setScale] = useState(3);
  const run = useMemo(
    () => sampleRun(role, look, finished),
    [role, look, finished],
  );
  const glossary = useMemo(() => sampleGlossary(role), [role]);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Select label="Role" value={role} options={ROLES} onChange={setRole} />
        <Select
          label="Look"
          value={look}
          options={['a', 'b'] as const}
          onChange={setLook}
        />
        <Field label="Beaten">
          <input
            type="checkbox"
            checked={finished}
            onChange={e => setFinished(e.target.checked)}
          />
        </Field>
        <ScaleSelect value={scale} scales={[2, 3]} onChange={setScale} />
      </form>
      <ResultScreen
        run={run}
        glossary={glossary}
        onBack={() => {}}
        scale={scale}
      />
    </div>
  );
};
