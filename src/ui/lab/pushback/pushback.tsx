'use client';

import { useCallback, useEffect, useState } from 'react';

import { demoFor } from '@/lib/lab/pushback/attract';
import { type Look, MODES } from '@/lib/lab/pushback/characters';
import { type DuelState, createDuel } from '@/lib/lab/pushback/duel';
import type { Role } from '@/lib/lab/pushback/lines';
import { duelSetupFor } from '@/lib/lab/pushback/run';
import {
  type Save,
  emptySave,
  finishDuel,
  hasRuns,
  loadSave,
  resetSave,
  setMode,
  startRun,
  writeSave,
} from '@/lib/lab/pushback/save';

import { DuelScreen } from './duel-screen';
import { ResultScreen } from './result';
import { RosterScreen } from './roster';
import { SelectScreen } from './select';
import { TitleScreen } from './title';

type Screen =
  | { name: 'title' }
  | { name: 'attract'; seed: number }
  | { name: 'select' }
  | { name: 'roster'; role: Role }
  | { name: 'duel'; role: Role; index: number; seed: number }
  | { name: 'result'; role: Role };

/** The screens, the save and the duel */
export const Pushback = () => {
  const [save, setSave] = useState<Save>(() => loadSave() ?? emptySave());
  const [screen, setScreen] = useState<Screen>({ name: 'title' });

  useEffect(() => writeSave(save), [save]);

  const toRoster = useCallback(
    (role: Role) => setScreen({ name: 'roster', role }),
    [],
  );
  const toTitle = useCallback(() => setScreen({ name: 'title' }), []);
  const toAttract = useCallback(
    () => setScreen({ name: 'attract', seed: Date.now() % 100_000 }),
    [],
  );
  const toSelect = useCallback(() => setScreen({ name: 'select' }), []);

  const confirmRole = useCallback(
    (role: Role, look: Look) => {
      setSave(previous => {
        const run = previous.runs[role];
        // Continue an unfinished run with the same look, else start fresh
        return run && !run.finished && run.look === look
          ? previous
          : startRun(previous, role, look);
      });
      toRoster(role);
    },
    [toRoster],
  );

  const endDuel = useCallback((role: Role, index: number, duel: DuelState) => {
    setSave(previous => finishDuel(previous, role, index, duel));
    setScreen(
      duel.setup.character.role === 'boss'
        ? { name: 'result', role }
        : { name: 'roster', role },
    );
  }, []);

  switch (screen.name) {
    case 'title':
      return (
        <TitleScreen
          mode={save.mode}
          onMode={mode => setSave(previous => setMode(previous, mode))}
          onStart={toSelect}
          onReset={hasRuns(save) ? () => setSave(resetSave) : undefined}
          firstVisit={!hasRuns(save) && save.glossary.length === 0}
          onAttract={toAttract}
        />
      );
    case 'attract': {
      const demo = demoFor(screen.seed);
      return (
        <DuelScreen
          key={`demo-${screen.seed}`}
          look={demo.look}
          initial={createDuel(demo.setup)}
          auto
          onEnd={toTitle}
          onBack={toTitle}
          onPlay={toSelect}
        />
      );
    }
    case 'select':
      return (
        <SelectScreen
          runs={save.runs}
          onConfirm={confirmRole}
          onBack={toTitle}
        />
      );
    case 'roster': {
      const run = save.runs[screen.role];
      if (!run)
        return (
          <SelectScreen
            runs={save.runs}
            onConfirm={confirmRole}
            onBack={toTitle}
          />
        );
      return (
        <RosterScreen
          run={run}
          glossary={save.glossary}
          onPlay={index =>
            setScreen({
              name: 'duel',
              role: screen.role,
              index,
              seed: Date.now(),
            })
          }
          onResult={() => setScreen({ name: 'result', role: screen.role })}
          onBack={toSelect}
        />
      );
    }
    case 'duel': {
      const run = save.runs[screen.role];
      if (!run)
        return (
          <SelectScreen
            runs={save.runs}
            onConfirm={confirmRole}
            onBack={toTitle}
          />
        );
      return (
        <DuelScreen
          key={`${screen.role}-${screen.index}-${run.attempts}`}
          look={run.look}
          initial={createDuel(
            duelSetupFor(run, screen.index, {
              seed: screen.seed,
              silence: true,
              buddy: MODES[save.mode].buddy,
              rules: MODES[save.mode].rules,
              mode: save.mode,
            }),
          )}
          onEnd={duel => endDuel(screen.role, screen.index, duel)}
          onBack={() => toRoster(screen.role)}
        />
      );
    }
    case 'result': {
      const run = save.runs[screen.role];
      if (!run)
        return (
          <SelectScreen
            runs={save.runs}
            onConfirm={confirmRole}
            onBack={toTitle}
          />
        );
      return (
        <ResultScreen
          run={run}
          glossary={save.glossary}
          onBack={() => toRoster(screen.role)}
        />
      );
    }
  }
};
