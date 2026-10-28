'use client';

import { useMemo, useState } from 'react';

import type { Look } from '@/lib/lab/pushback/characters';
import { PAIRS, ROLES, type Role } from '@/lib/lab/pushback/lines';
import { createRunState } from '@/lib/lab/pushback/run';
import type { SavedRun } from '@/lib/lab/pushback/save';

import { ResultScreen } from '../result';
import { Field, field } from './controls';

/** A run that reached the Stakeholder, with made-up numbers and a glossary */
const sampleRun = (role: Role, look: Look, finished: boolean): SavedRun => {
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
const sampleGlossary = (role: Role) =>
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
        <Field label="Role">
          <select
            className={field.input}
            value={role}
            onChange={e => setRole(e.target.value as Role)}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Look">
          <select
            className={field.input}
            value={look}
            onChange={e => setLook(e.target.value as Look)}
          >
            <option value="a">a</option>
            <option value="b">b</option>
          </select>
        </Field>
        <Field label="Beaten">
          <input
            type="checkbox"
            checked={finished}
            onChange={e => setFinished(e.target.checked)}
          />
        </Field>
        <Field label="Scale">
          <select
            className={field.input}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          >
            {[2, 3].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </Field>
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
