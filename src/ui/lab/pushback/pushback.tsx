'use client';

import { useCallback, useEffect, useState } from 'react';

import { BOSS_SLOT_INDEX, type Look } from '@/lib/lab/pushback/characters';
import type { DuelState } from '@/lib/lab/pushback/duel';
import type { Role } from '@/lib/lab/pushback/lines';
import {
  type Save,
  emptySave,
  finishDuel,
  loadSave,
  setSilence,
  startRun,
  writeSave,
} from '@/lib/lab/pushback/save';

import { DuelPlaceholder } from './duel-placeholder';
import { ResultScreen } from './result';
import { RosterScreen } from './roster';
import { SelectScreen } from './select';
import { TitleScreen } from './title';

type Screen =
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'roster'; role: Role }
  | { name: 'duel'; role: Role; index: number }
  | { name: 'result'; role: Role };

const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The screens and the save; the duel itself comes in package 3 */
export const Pushback = () => {
  // The save defaults the silence bar to off under reduced motion
  const [save, setSave] = useState<Save>(
    () => loadSave() ?? emptySave(!prefersReducedMotion()),
  );
  const [screen, setScreen] = useState<Screen>({ name: 'title' });

  useEffect(() => writeSave(save), [save]);

  const toRoster = useCallback(
    (role: Role) => setScreen({ name: 'roster', role }),
    [],
  );
  const toTitle = useCallback(() => setScreen({ name: 'title' }), []);
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
      index === BOSS_SLOT_INDEX
        ? { name: 'result', role }
        : { name: 'roster', role },
    );
  }, []);

  switch (screen.name) {
    case 'title':
      return (
        <TitleScreen
          silence={save.silence}
          onSilence={on => setSave(previous => setSilence(previous, on))}
          onStart={toSelect}
        />
      );
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
          onPlay={index =>
            setScreen({ name: 'duel', role: screen.role, index })
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
        <DuelPlaceholder
          run={run}
          index={screen.index}
          silence={save.silence}
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
      return <ResultScreen run={run} onBack={() => toRoster(screen.role)} />;
    }
  }
};
