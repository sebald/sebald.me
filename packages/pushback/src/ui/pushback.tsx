'use client';

import { useCallback, useEffect, useState } from 'react';

import { demoFor } from '../lib/attract';
import { type Look, MODES } from '../lib/characters';
import { type DuelState, createDuel } from '../lib/duel';
import { type Role, poolPairs } from '../lib/lines';
import { duelSetupFor } from '../lib/run';
import {
  type Save,
  emptySave,
  finishDuel,
  loadSave,
  openRun,
  resetSave,
  setMode,
  startRun,
  writeSave,
} from '../lib/save';
import { DuelScreen } from './duel-screen';
import { ResultScreen } from './result';
import { RosterScreen } from './roster';
import { SelectScreen } from './select';
import { TitleScreen } from './title';
import { useMusic, useMuteKey, useSoundArm } from './use-sound';

type Screen =
  /** `start`: what the title opens on (the menu, back from the demo) */
  | { name: 'title'; start?: 'splash' | 'menu' }
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

  // The title's music through the menus, the select and the roster, a
  // little quieter under the demo, which is still the title; the duel
  // picks its own
  useSoundArm();
  useMuteKey();
  useMusic(
    screen.name === 'duel'
      ? undefined
      : screen.name === 'result'
        ? 'result'
        : 'title',
    screen.name === 'attract',
  );

  const toRoster = useCallback(() => setScreen({ name: 'roster' }), []);
  const toTitle = useCallback(() => setScreen({ name: 'title' }), []);
  const toMenu = useCallback(
    () => setScreen({ name: 'title', start: 'menu' }),
    [],
  );
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
          start={screen.start}
          mode={save.mode}
          onMode={mode => setSave(previous => setMode(previous, mode))}
          onStart={toSelect}
          onContinue={toRoster}
          running={
            open
              ? {
                  role: open.role,
                  beaten: Object.keys(open.beaten).length,
                  slots: open.run.slots.length,
                }
              : undefined
          }
          save={{
            running: open?.role,
            shipped: Object.keys(save.shipped).length,
            lines: poolPairs(save.glossary).length,
          }}
          glossary={save.glossary}
          onErase={() => setSave(resetSave)}
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
          onBack={toMenu}
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
