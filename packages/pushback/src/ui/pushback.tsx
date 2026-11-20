'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { demoFor } from '../lib/attract';
import { type Look, MODES } from '../lib/characters';
import { type DuelState, createDuel } from '../lib/duel';
import {
  type ScreenName,
  duelEnded,
  duelStarted,
  gameOpened,
  modeChanged,
  runContinued,
  runFinished,
  runStarted,
  saveErased,
} from '../lib/events';
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
import { useTrack } from './tracking';
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
  const [loaded] = useState(loadSave);
  const [save, setSave] = useState<Save>(() => loaded ?? emptySave());
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const track = useTrack();

  useEffect(() => writeSave(save), [save]);

  // What the player sees, for the host: a screen without a run shows
  // the select, and the demo is nobody's
  const shown: ScreenName | null =
    screen.name === 'attract'
      ? null
      : screen.name !== 'title' && screen.name !== 'select' && !save.run
        ? 'select'
        : screen.name;
  // Once per screen shown (React may run an effect twice on mount; the
  // refs stay), the game's opening before the first
  const opened = useRef(false);
  const lastShown = useRef<ScreenName | null>(null);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      track(gameOpened(loaded ?? emptySave(), loaded !== null));
    }
    if (!shown || shown === lastShown.current) return;
    lastShown.current = shown;
    track({ type: 'screen', name: shown });
  }, [shown, track, loaded]);

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
  const confirmRole = (role: Role, look: Look) => {
    track(runStarted(save, role, look));
    setSave(startRun(save, role, look));
    toRoster();
  };

  const endDuel = (index: number, duel: DuelState) => {
    const next = finishDuel(save, index, duel);
    track(duelEnded(duel));
    track(runFinished(save, next));
    setSave(next);
    setScreen(
      duel.setup.character.role === 'boss'
        ? { name: 'result' }
        : { name: 'roster' },
    );
  };

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
          onMode={mode => {
            track(modeChanged(save, mode));
            setSave(setMode(save, mode));
          }}
          onStart={toSelect}
          onContinue={() => {
            if (open) track(runContinued(open, save.mode));
            toRoster();
          }}
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
          onErase={() => {
            track(saveErased(save));
            setSave(resetSave(save));
          }}
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
          play="demo"
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
          onPlay={index => {
            track(duelStarted(run, index, save.mode));
            setScreen({ name: 'duel', index, seed: Date.now() });
          }}
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
