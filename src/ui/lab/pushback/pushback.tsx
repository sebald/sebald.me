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
  hasProgress,
  loadSave,
  openRun,
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
  | { name: 'roster' }
  | { name: 'duel'; index: number; seed: number }
  | { name: 'result' };

/** The screens, the save and the duel */
export const Pushback = () => {
  const [save, setSave] = useState<Save>(() => loadSave() ?? emptySave());
  const [screen, setScreen] = useState<Screen>({ name: 'title' });

  useEffect(() => writeSave(save), [save]);

  const toRoster = useCallback(() => setScreen({ name: 'roster' }), []);
  const toTitle = useCallback(() => setScreen({ name: 'title' }), []);
  const toAttract = useCallback(
    () => setScreen({ name: 'attract', seed: Date.now() % 100_000 }),
    [],
  );
  const toSelect = useCallback(() => setScreen({ name: 'select' }), []);

  // A role picked is a new run: it replaces the one in play
  const confirmRole = useCallback(
    (role: Role, look: Look) => {
      setSave(previous => startRun(previous, role, look));
      toRoster();
    },
    [toRoster],
  );

  const endDuel = useCallback((index: number, duel: DuelState) => {
    setSave(previous => finishDuel(previous, index, duel));
    setScreen(
      duel.setup.character.role === 'boss'
        ? { name: 'result' }
        : { name: 'roster' },
    );
  }, []);

  const select = (
    <SelectScreen
      shipped={save.shipped}
      onConfirm={confirmRole}
      onBack={toTitle}
    />
  );
  const open = openRun(save);
  const { run } = save;

  switch (screen.name) {
    case 'title':
      return (
        <TitleScreen
          mode={save.mode}
          onMode={mode => setSave(previous => setMode(previous, mode))}
          onStart={toSelect}
          onContinue={open ? toRoster : undefined}
          running={
            open
              ? {
                  role: open.role,
                  beaten: Object.keys(open.beaten).length,
                  slots: open.run.slots.length,
                }
              : undefined
          }
          onReset={hasProgress(save) ? () => setSave(resetSave) : undefined}
          progress={hasProgress(save)}
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
      return select;
    case 'roster':
      if (!run) return select;
      return (
        <RosterScreen
          run={run}
          glossary={save.glossary}
          onPlay={index => setScreen({ name: 'duel', index, seed: Date.now() })}
          onResult={() => setScreen({ name: 'result' })}
          onBack={toTitle}
        />
      );
    case 'duel':
      if (!run) return select;
      return (
        <DuelScreen
          key={`${screen.index}-${run.attempts}`}
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
          onEnd={duel => endDuel(screen.index, duel)}
          onBack={toRoster}
        />
      );
    case 'result':
      if (!run) return select;
      return (
        <ResultScreen
          run={run}
          glossary={save.glossary}
          onBack={toRoster}
          onNewRun={run.finished ? toSelect : undefined}
        />
      );
  }
};
