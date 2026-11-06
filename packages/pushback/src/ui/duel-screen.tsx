'use client';

import {
  Confirm,
  Heading,
  Legend,
  Text,
  Window,
  Picker,
  PickerItem,
  PickerSetting,
  prefersReducedMotion,
  useAnyKey,
  useKeys,
  useScale,
} from '@sebald/blip-ui';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { DEMO_ACCURACY, DEMO_END_MS, DEMO_PICK_MS } from '../lib/attract';
import {
  GHOST,
  buddyLine,
  buddyRuledOut,
  buddyStep,
  ghostEnter,
} from '../lib/buddy';
import { type Look, SCENE_OF, STANDS, type SceneId } from '../lib/characters';
import {
  type DuelAction,
  type DuelState,
  type Side,
  isFlawless,
  reduce,
  showsHint,
  toLose,
  toWin,
} from '../lib/duel';
import {
  BUDDY_MISS_BARK,
  HINT,
  MENU_PROMPTS,
  VERDICTS,
  inTurn,
  pairById,
} from '../lib/lines';
import { playerName } from '../lib/save';
import { PLAYER_SHEETS } from '../lib/sprites';
import {
  type Step,
  LAYOUT,
  STAGE,
  barsLabel,
  counterText,
  holdFor,
  phraseText,
  posesFor,
  scriptFor,
  typedChars,
  typingDuration,
  viewFor,
} from '../lib/stage';
import type { BlipVoice } from './audio/effects';
import {
  cut,
  effect,
  getSettings,
  music,
  setMomentum,
  setPaused as setMusicPaused,
  speak,
  toggleSound,
} from './audio/engine';
import { BUBBLE_TAIL, Bubble } from './bubble';
import { Burst } from './burst';
import { Character } from './character';
import { Controls } from './controls';
import { DemoLabel } from './demo-label';
import { Dialogue } from './dialogue';
import type { FrameModel } from './draw';
import { Frame } from './frame';
import { Ghost } from './ghost';
import { Hud } from './hud';
import { Ledger } from './ledger';
import { RoundCall } from './round-call';
import { SILENCE_CLOCK, SilenceTimer } from './silence-timer';
import { TALL_BAR, px } from './stage';
import { cn, cva } from './styles.utils';
import { useMusic, useSoundSettings } from './use-sound';

// Styles
// ---------------

/** Where the round is called at the end of a duel, and the demo labelled: its top centre */
const CALL_AT = { x: STAGE.width / 2, y: 44 } as const;

/**
 * The hit-stop of the deciding blow: the stage holds its frame this long
 * under a white flash before the end beat runs on (two of its 8 fps steps)
 */
const HOLD_MS = 250;

/**
 * The window's height in stage pixels, from the stage's bottom: its top
 * two rows under the duellists' feet, a few rows more than the panel
 */
const WINDOW_HEIGHT = LAYOUT.panel.y + LAYOUT.panel.height - (LAYOUT.feet + 2);

/**
 * Held upright: the window's top, a little air under the room, and the
 * least it is tall in CSS pixels, enough for a phrase and most menus, so
 * it keeps its size from line to menu; a longer menu grows it to the bar
 */
const TALL_TOP = LAYOUT.band + 6;
const TALL_WINDOW = 380;

/**
 * Held upright, the rows the room and the window move down by: the two
 * centred in what the bar leaves, for a window `height` CSS pixels tall,
 * when there is more room than they need
 */
const tallLift = (rows: number, scale: number, height: number) =>
  Math.max(
    0,
    Math.floor((rows - (TALL_BAR + height) / scale - TALL_TOP - 3) / 2),
  );

const styles = {
  pause: cva({
    base: [
      'absolute inset-x-0 top-0 bottom-(--bui-bar) flex items-center justify-center bg-(--pb-bg)/80',
    ],
  }),
};

// Screen
// ---------------

export interface DuelScreenProps {
  /** A duel at `intro`, or any state the workbench constructed */
  initial: DuelState;
  /** The player's look, which picks their sheet */
  look: Look;
  onEnd: (duel: DuelState) => void;
  /** Leave; in attract mode, any key or a tap */
  onBack: () => void;
  /** Force reduced motion (the workbench); otherwise the media query */
  reducedMotion?: boolean;
  /** Fix the scale (the workbench) */
  scale?: number;
  /**
   * The ghost out on every defence from its start, without the wait and
   * without leaving after it helped (the workbench, to judge where it
   * stands); only with the buddy on
   */
  ghostAlways?: boolean;
  /** Another room than the opponent's (the workbench, to judge the scale) */
  scene?: SceneId;
  /**
   * Attract mode: the duel plays itself, the menus picked after a pause,
   * and any key or tap leaves (`onBack`); `onEnd` fires a few seconds
   * after the duel is over
   */
  auto?: boolean;
  className?: string;
}

interface Cursor {
  /** The script this cursor belongs to; a different key means step 0 */
  key: string;
  index: number;
  /** Ms into the current step */
  elapsed: number;
  /** Typing was skipped */
  skipped: boolean;
}

const atStart = (key: string): Cursor => ({
  key,
  index: 0,
  elapsed: 0,
  skipped: false,
});

interface Wrapped {
  duel: DuelState;
  before: DuelState;
}

/** The reducer plus a snapshot of the state before each move (not ticks) */
const wrapped = (state: Wrapped, action: DuelAction): Wrapped => ({
  duel: reduce(state.duel, action),
  before: action.type === 'tick' ? state.before : state.duel,
});

/** A key that changes whenever the script does, so the cursor resets */
const scriptKey = (state: DuelState) =>
  [
    state.phase,
    state.exchanges,
    state.turn,
    state.exchange?.phrase ?? '',
    state.outcome?.picked ?? '',
    state.hand.join(','),
    state.closer ?? '',
  ].join('|');

/** What the menu is for: attack, attack with a closer on offer, or defend */
const prompt = (state: DuelState) =>
  state.phase === 'attack'
    ? MENU_PROMPTS[state.closer ? 'micDrop' : 'attack']
    : MENU_PROMPTS.defend;

export const DuelScreen = ({
  initial,
  look,
  onEnd,
  onBack,
  reducedMotion,
  scale,
  ghostAlways = false,
  scene: sceneProp,
  auto = false,
  className,
}: DuelScreenProps) => {
  // The duel, and the state before the last exchange resolved: the bars
  // stay on the old numbers until the beat
  const [{ duel: state, before: shownBefore }, act] = useReducer(
    wrapped,
    initial,
    duel => ({ duel, before: duel }),
  );
  const [storedCursor, setCursor] = useState<Cursor>(() =>
    atStart(scriptKey(initial)),
  );
  const [paused, setPaused] = useState(false);
  // Leaving from the pause asks first
  const [leaving, setLeaving] = useState(false);
  const [clock, setClock] = useState(0);
  // The exchange the buddy's whisper started on, for the miss line and
  // for sending it away afterwards
  const [whisperedOn, setWhisperedOn] = useState<number | null>(null);
  // The ghost's entrance or exit in progress, by the clock it started at
  const [ghostAnim, setGhostAnim] = useState<{
    since: number;
    leaving: boolean;
  } | null>(null);
  const reduced = reducedMotion ?? prefersReducedMotion();
  // The ceiling rows a short window crops: the HUD and the names move down.
  // Held upright the room and the window sit centred instead (`tallLift`).
  const { crop, tall, rows, scale: shownScale } = useScale(scale);
  const sound = useSoundSettings();

  const stateRef = useRef(state);
  const clockRef = useRef(clock);
  useLayoutEffect(() => {
    stateRef.current = state;
    clockRef.current = clock;
  });

  // Centre the stage in the viewport when the duel starts, so the panel
  // is never below the fold
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scale !== undefined) return;
    // After the stage has measured itself and taken its size
    const frame = requestAnimationFrame(() => {
      rootRef.current
        ?.closest('[data-stage]')
        ?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => cancelAnimationFrame(frame);
  }, [scale]);

  const steps = useMemo(() => scriptFor(state), [state]);
  // A new script starts at step 0 in the same render, so a stale elapsed
  // time can never skip through it before an effect resets it
  const key = scriptKey(state);
  const cursor = storedCursor.key === key ? storedCursor : atStart(key);

  const step: Step | undefined =
    steps[Math.min(cursor.index, steps.length - 1)];
  const typingDone =
    !step ||
    step.kind !== 'line' ||
    reduced ||
    cursor.skipped ||
    cursor.elapsed >= typingDuration(step.text);

  const advance = useCallback(() => {
    if (cursor.index + 1 < steps.length) {
      setCursor({ ...atStart(key), index: cursor.index + 1 });
      return;
    }
    const { phase } = stateRef.current;
    if (phase === 'intro') act({ type: 'begin' });
    else if (phase === 'resolve') act({ type: 'continue' });
  }, [steps.length, cursor.index, key, act]);

  // One step of the loop: typing, holds, beats, silence ticks
  const onStep = useCallback(
    (ms: number) => {
      setClock(c => c + ms);
      const current = steps[Math.min(cursor.index, steps.length - 1)];
      if (!current) return;
      const elapsed = cursor.elapsed + ms;
      switch (current.kind) {
        case 'line': {
          const typed = reduced ? 0 : typingDuration(current.text);
          const done = cursor.skipped ? cursor.elapsed : typed;
          if (elapsed >= done + holdFor(current.text, current.hold)) advance();
          else setCursor({ ...cursor, elapsed });
          break;
        }
        case 'reveal':
        case 'beat':
          if (elapsed >= current.ms) advance();
          else setCursor({ ...cursor, elapsed });
          break;
        case 'menu': {
          const s = stateRef.current;
          if (
            auto &&
            elapsed >= DEMO_PICK_MS &&
            cursor.elapsed < DEMO_PICK_MS
          ) {
            // The demo's player: the closer when one is on offer, else a
            // phrase from the hand; the answer most of the time, a decoy
            // otherwise
            if (s.phase === 'attack' && s.hand.length) {
              const phrase =
                s.closer ?? s.hand[Math.floor(Math.random() * s.hand.length)]!;
              act({ type: 'throw', phrase });
            } else if (s.phase === 'defend' && s.exchange) {
              const answer = s.exchange.answer;
              const decoys = s.menu.filter(id => id !== answer);
              const phrase =
                Math.random() < DEMO_ACCURACY || decoys.length === 0
                  ? answer
                  : decoys[Math.floor(Math.random() * decoys.length)]!;
              act({ type: 'counter', phrase });
            }
          }
          // Ticks run the silence bar and the answer time the score's
          // speed points come from, timer or not
          if (s.phase === 'defend') act({ type: 'tick', ms });
          // The buddy's whisper has started on this exchange (the frame
          // loop is the event, so the resolve can look it up)
          if (
            s.phase === 'defend' &&
            s.setup.buddy === true &&
            buddyStep(s.silence?.elapsed ?? elapsed, s.silence?.limit ?? null) >
              0
          ) {
            setWhisperedOn(s.exchanges);
          }
          setCursor({ ...cursor, elapsed });
          break;
        }
        case 'wait':
          if (auto && elapsed >= DEMO_END_MS) onEnd(stateRef.current);
          else setCursor({ ...cursor, elapsed });
      }
    },
    [steps, cursor, reduced, advance, act, auto, onEnd],
  );

  // Attract mode: any key or tap leaves the demo, for the title's menu;
  // a tap on its click, so the rest of it does not land on that menu
  useAnyKey(onBack, auto);

  // Confirm: skip typing, or move on, or leave at the end
  const confirm = useCallback(() => {
    if (!step) return;
    if (step.kind === 'line' && !typingDone) {
      setCursor({ ...cursor, skipped: true });
    } else if (
      step.kind === 'line' ||
      step.kind === 'reveal' ||
      step.kind === 'beat'
    ) {
      advance();
    } else if (step.kind === 'wait') {
      onEnd(stateRef.current);
    }
  }, [step, typingDone, cursor, advance, onEnd]);

  useKeys(
    useMemo(
      () => ({
        Escape: () => {
          effect(paused ? 'cancel' : 'confirm');
          setPaused(!paused);
        },
        ...(paused || step?.kind === 'menu'
          ? {}
          : { Enter: confirm, ' ': confirm }),
      }),
      [paused, step?.kind, confirm],
    ),
    !auto && !leaving,
    true,
  );

  // The onboarding buddy
  // ---------------
  // How far the whisper has got on this defence: paced by the silence bar
  // when there is one, by its own clock otherwise
  const buddyOn = state.setup.buddy === true;
  // The ghost helps once a duel: after the exchange it whispered on it
  // leaves, and the counters stop dimming
  const buddy =
    buddyOn &&
    (ghostAlways || whisperedOn === null || whisperedOn === state.exchanges);
  const defending = state.phase === 'defend' && step?.kind === 'menu';
  const whisper =
    buddy && defending
      ? Math.max(
          ghostAlways ? 1 : 0,
          buddyStep(
            state.silence?.elapsed ?? cursor.elapsed,
            state.silence?.limit ?? null,
          ),
        )
      : 0;
  // A miss after the whisper gets the ghost's own line during the resolve
  const missedAfterWhisper =
    buddyOn &&
    state.phase === 'resolve' &&
    whisperedOn === state.exchanges - 1 &&
    state.exchange?.by === 'opponent' &&
    state.outcome?.winner === 'opponent';
  const ghostLine: string | null = defending
    ? whisper > 0
      ? buddyLine(state.exchanges, state.setup.seed)
      : null
    : missedAfterWhisper
      ? BUDDY_MISS_BARK
      : null;
  // Out of the black hole when it has something to say, back into it
  // when it is done
  const ghostWanted = ghostLine !== null;
  useEffect(() => {
    setGhostAnim(previous => {
      if (ghostWanted) {
        return previous && !previous.leaving
          ? previous
          : { since: clockRef.current, leaving: false };
      }
      return previous && !previous.leaving
        ? { since: clockRef.current, leaving: true }
        : previous;
    });
  }, [ghostWanted]);
  let enter = 1;
  let ghostShown = ghostWanted;
  if (ghostAnim && !reduced) {
    const progress = ghostEnter(clock - ghostAnim.since);
    if (ghostAnim.leaving) {
      enter = 1 - progress;
      ghostShown = progress < 1;
    } else {
      enter = progress;
    }
  }

  // Frame model
  // ---------------
  const { character } = state.setup;
  const scene = sceneProp ?? SCENE_OF[character.role];
  const stands = STANDS[scene];
  // The mic-drop burst between the duellists: pulsing while the phrase is
  // thrown (with a flash and a shake of the room) and again when it lands,
  // popped when it is countered
  const thrower = state.exchange?.micDrop === true ? state.exchange.by : null;
  const burstShown =
    thrower !== null &&
    !state.outcome?.offline &&
    (state.phase === 'defend' || state.phase === 'resolve');
  const throwing =
    burstShown &&
    state.phase === 'defend' &&
    step?.kind === 'line' &&
    step.speaker === thrower;
  const landed =
    burstShown &&
    state.phase === 'resolve' &&
    state.outcome !== null &&
    state.outcome.winner === thrower;
  const popped = burstShown && state.phase === 'resolve' && !landed;
  const pulse =
    !reduced &&
    (throwing ||
      (landed &&
        (step?.kind === 'reveal' || step?.kind === 'beat') &&
        cursor.elapsed < 900));
  const shake =
    !reduced && throwing && cursor.elapsed < 250
      ? cursor.elapsed < 125
        ? 2
        : -2
      : 0;
  const flash = !reduced && throwing && cursor.elapsed < 125;
  const steady = viewFor(stands);
  const view = { x: steady.x + shake, y: steady.y };
  const standX: Record<Side, number> = {
    player: stands.left - view.x,
    opponent: stands.right - view.x,
  };
  const poses = posesFor(state, step);
  // The ghost's line over its head, once it is out of its hole
  const bubble = ghostShown && ghostLine && enter >= 1;
  const playerSheet = PLAYER_SHEETS[state.setup.role][look];
  const shown =
    state.phase === 'resolve' && step?.kind === 'line' ? shownBefore : state;
  const model: FrameModel = { scene, view };
  const micDropBy = (side: Side) =>
    state.exchange?.micDrop === true && state.exchange.by === side;
  const band = (
    <>
      {burstShown && (
        <Burst
          x={Math.round(
            (standX.player + standX.opponent + LAYOUT.cell.width) / 2 - 48,
          )}
          y={LAYOUT.feet - LAYOUT.cell.height + 8}
          cell={popped ? 2 : 0}
          pulse={pulse}
        />
      )}
      {flash && <div aria-hidden className="absolute inset-0 bg-white/60" />}
      <Character
        sheet={playerSheet}
        pose={poses.player}
        typing={!typingDone}
        micDrop={micDropBy('player')}
        x={standX.player}
        still={reduced}
        side="player"
      />
      <Character
        sheet={character.sheet}
        pose={poses.opponent}
        typing={!typingDone}
        micDrop={micDropBy('opponent')}
        mirrored
        x={standX.opponent}
        still={reduced}
        side="opponent"
      />
    </>
  );

  // Overlay
  // ---------------
  const typedLength =
    step?.kind === 'line'
      ? typingDone
        ? step.text.length
        : typedChars(cursor.elapsed, step.text)
      : 0;
  // The rest of the line holds its room, so it never rewraps or grows
  // the window as it types
  const typed =
    step?.kind === 'line' ? (
      <>
        {step.text.slice(0, typedLength)}
        {typedLength < step.text.length && (
          <span className="invisible">{step.text.slice(typedLength)}</span>
        )}
      </>
    ) : null;

  // The defence is one screen: the phrase types out in the window the
  // counters already stand in, hidden until it has been said, so nothing
  // moves when the menu opens
  const asking =
    state.phase === 'defend' &&
    state.exchange !== null &&
    (step?.kind === 'line' || step?.kind === 'menu');

  // What the menu offers: the hand on attack (the closer on offer under
  // it, in gold: throwing it drops the mic), the counters on defence (the
  // ghost ruling out the wrong ones as it whispers)
  const menu = (() => {
    if (step?.kind !== 'menu' && !asking) return null;
    if (state.phase === 'attack') {
      const { closer } = state;
      return (
        <>
          {state.hand.map(id => (
            <PickerItem
              key={id}
              id={id}
              onSelect={() => act({ type: 'throw', phrase: id })}
            >
              {pairById(id).phrase}
            </PickerItem>
          ))}
          {closer && (
            <PickerItem
              id={closer}
              variant="accent"
              onSelect={() => act({ type: 'throw', phrase: closer })}
            >
              {pairById(closer).phrase}
            </PickerItem>
          )}
        </>
      );
    }
    if (state.phase === 'defend') {
      const answer = state.exchange?.answer;
      return state.menu.map(id => (
        <PickerItem
          key={id}
          id={id}
          ruledOut={id !== answer ? buddyRuledOut(whisper) : 0}
          onSelect={() => act({ type: 'counter', phrase: id })}
        >
          {pairById(id).counter}
        </PickerItem>
      ));
    }
    return null;
  })();

  const announce = useMemo(() => {
    if (!step) return '';
    if (step.kind === 'line') {
      const who = step.speaker === 'player' ? 'You' : character.name;
      return `${who}: ${step.text}`;
    }
    if (step.kind === 'reveal') return `The reply was: ${step.text}`;
    if (step.kind === 'menu') return showsHint(state) ? HINT : prompt(state);
    if (step.kind === 'wait') {
      return `${state.winner === 'player' ? 'You won' : 'You lost'}. ${barsLabel(state, 'player')}. Press Enter to continue.`;
    }
    return barsLabel(state, 'player');
  }, [step, state, character.name]);

  const silenceWidth =
    state.phase === 'defend' && state.silence && step?.kind === 'menu'
      ? Math.min(100, (state.silence.elapsed / state.silence.limit) * 100)
      : null;
  const timing = silenceWidth !== null && state.silence ? state.silence : null;

  // The window's height: one for the lines and every menu that fits,
  // its top clear of the duellists' feet, so nothing jumps from line to
  // menu; a longer menu (hard mode, a mic drop) grows it smoothly, and
  // the counters show once it has grown
  const roomRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLSpanElement>(null);
  const [room, setRoom] = useState<{
    need: number;
    fixed: number;
  } | null>(null);
  useEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setRoom({
        need: el.offsetHeight,
        fixed: heightRef.current?.offsetHeight ?? 0,
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const growing = !reduced && room !== null && room.need > room.fixed + 1;
  // Held upright, the tallest the window has needed this duel: the room
  // and the window centre on that, so they settle once (on the first long
  // menu) instead of moving with every one (set while rendering, React's
  // way to follow a value)
  const [tallest, setTallest] = useState(TALL_WINDOW);
  if (room && room.need > tallest) setTallest(room.need);

  // The control hints along the window's bottom edge: only what works now
  const legend = auto ? (
    <Legend keys={[['Any key', 'menu']]} touch="Tap for the menu" />
  ) : step?.kind === 'menu' ? (
    <Legend
      keys={[
        ['↑↓', 'choose'],
        ['Enter', 'confirm'],
      ]}
      touch="Tap a line"
    />
  ) : step?.kind === 'line' ||
    step?.kind === 'reveal' ||
    step?.kind === 'wait' ? (
    <Legend keys={[['Enter', 'continue']]} touch="Tap to continue" />
  ) : null;

  // The end of the duel: the deciding blow held under a flash, then the
  // round called over the room, staying through the last lines; the
  // window then gives the verdict and the numbers. The demo has its own
  // label where the call would go.
  const won = state.winner === 'player';
  const flawless = isFlawless(state) && state.setup.buddy !== true;
  const verdict = inTurn(
    VERDICTS[!won ? 'lose' : flawless ? 'flawless' : 'win'],
    state.setup.encounter,
  );
  const { exchangesWon, exchangesLost, micDrops } = state.stats;
  const learned = state.collected.length - state.setup.collected.length;

  // The deciding blow: the flash and the held frame as the end beat starts
  const blow = state.phase === 'end' && step?.kind === 'beat' && !auto;
  // (once a duel: the screen is mounted afresh for every duel)
  const [released, setReleased] = useState(false);
  const holding = blow && !reduced && !released;
  useEffect(() => {
    if (!holding) return;
    const timer = setTimeout(() => setReleased(true), HOLD_MS);
    return () => clearTimeout(timer);
  }, [holding]);
  const called =
    state.phase === 'end' &&
    !auto &&
    (step?.kind !== 'beat' || released || reduced);

  // Sound
  // ---------------
  // The duel's music, the boss's for the boss, momentum bringing in its
  // layers and the pause turning it down. The deciding blow cuts it for
  // the hit-stop; the round's jingle plays with the call, or with the
  // music off the stinger. The demo leaves the title's music playing and
  // makes no sound of its own.
  useMusic(
    auto || state.phase === 'end' ? undefined : state.boss ? 'boss' : 'duel',
  );
  useEffect(() => {
    if (!auto) setMomentum(state.momentum.player);
  }, [auto, state.momentum.player]);
  useEffect(() => {
    if (auto) return;
    setMusicPaused(paused);
    return () => setMusicPaused(false);
  }, [auto, paused]);
  useEffect(() => {
    if (!blow) return;
    cut();
    effect('hit');
  }, [blow]);
  useEffect(() => {
    if (!called) return;
    if (getSettings().music) music(won ? 'win' : 'lose');
    else effect(won ? 'win' : 'lose');
  }, [called, won]);
  // A hit when the loser flinches, a sparkle on top for a fast counter
  // against the stopwatch
  const flinching =
    !auto &&
    state.phase === 'resolve' &&
    state.outcome !== null &&
    (step?.kind === 'reveal' || step?.kind === 'beat');
  const fastCounter =
    state.outcome?.fast === true &&
    state.outcome.winner === 'player' &&
    state.exchange?.by === 'opponent' &&
    state.setup.slot.silence !== null;
  useEffect(() => {
    if (!flinching) return;
    effect('hit');
    if (fastCounter) effect('fast');
  }, [flinching, fastCounter, state.exchanges]);
  // The mic drop as it is said
  const micDropSaid =
    !auto && burstShown && step?.kind === 'line' && step.speaker === thrower;
  useEffect(() => {
    if (micDropSaid) effect('micDrop');
  }, [micDropSaid, state.exchanges]);
  // A blip for what each step of the typing adds, in the speaker's voice
  const opponentVoice: BlipVoice =
    character.role === 'boss' ? 'boss' : character.role;
  const voice: BlipVoice | null =
    step?.kind === 'line'
      ? step.speaker === 'player'
        ? state.setup.role
        : opponentVoice
      : null;
  const lineId = `${key}:${cursor.index}`;
  const spokenRef = useRef({ id: '', length: 0 });
  useEffect(() => {
    if (auto || !voice || step?.kind !== 'line') return;
    const spoken = spokenRef.current;
    const from = spoken.id === lineId ? spoken.length : 0;
    spokenRef.current = { id: lineId, length: typedLength };
    if (typedLength > from) speak(voice, step.text.slice(from, typedLength));
  }, [auto, voice, step, lineId, typedLength]);
  // The ghost, as its bubble appears
  const ghostSpeaks = !auto && Boolean(bubble);
  useEffect(() => {
    if (ghostSpeaks && ghostLine) speak('ghost', ghostLine);
  }, [ghostSpeaks, ghostLine]);

  // What the window says; `sizing` for the unseen copy that measures it
  const promptLine =
    state.phase === 'attack' ? prompt(state) : showsHint(state) ? HINT : null;
  const contents = (sizing: boolean) => (
    <>
      {step?.kind === 'line' && !asking && (
        <Dialogue speaker={step.speaker}>{typed}</Dialogue>
      )}
      {step?.kind === 'reveal' && (
        <>
          <Dialogue speaker="player" muted>
            {counterText(state.outcome?.picked ?? null)}
          </Dialogue>
          <Text className="tall:mt-[calc(var(--px)*5)]">
            The reply: {step.text}
          </Text>
        </>
      )}
      {(step?.kind === 'menu' || asking) && (
        <>
          {/* The phrase being answered, at full strength: it is what the
              player reads to pick, and the question, so a defence needs
              no prompt. Typed out first, then kept. */}
          {asking && state.exchange && (
            <Dialogue
              speaker="opponent"
              // Clear of the stopwatch in the corner
              style={{ paddingRight: px(SILENCE_CLOCK.width + 4) }}
            >
              {step?.kind === 'line'
                ? typed
                : phraseText(state.exchange.phrase)}
            </Dialogue>
          )}
          <div
            className={cn(
              'flex min-h-0 flex-col',
              // Held upright, more air between the phrase and the answers
              !promptLine &&
                'mt-[calc(var(--px)*2)] tall:mt-[calc(var(--px)*12+8px)]',
              step?.kind !== 'menu'
                ? 'invisible'
                : // A menu that grows the window shows once it has grown
                  growing &&
                    !sizing &&
                    'animate-appear [animation-delay:200ms]',
            )}
          >
            {/* The prompt sits above the options, with room on both sides */}
            {promptLine && (
              <Text className="my-[calc(var(--px)*4)] tall:mt-[calc(var(--px)*8+8px)] tall:mb-[calc(var(--px)*10)]">
                {promptLine}
              </Text>
            )}
            <Picker
              label={state.phase === 'attack' ? 'Your phrases' : 'Counters'}
              active={!sizing && step?.kind === 'menu' && !paused && !auto}
              // Tighter than the menus' rows, so six fit the window; held
              // upright a row is a thumb's height or more, and a longer
              // list scrolls, with the rail beside it
              className="gap-0 tall:gap-1 [&_button]:py-[0.1em] tall:[&_button]:py-[0.25em] tall:[&_button]:leading-[1.2]"
            >
              {menu}
            </Picker>
          </div>
        </>
      )}
      {step?.kind === 'wait' && (
        <>
          <Heading
            className={
              won
                ? 'tracking-[0.1em] text-(--pb-gold) uppercase'
                : 'tracking-[0.1em] text-(--pb-stamp) uppercase'
            }
          >
            {verdict}
          </Heading>
          <Ledger
            className="mt-[calc(var(--px)*3)] w-[24em] tall:mt-[calc(var(--px)*6)] tall:w-full"
            rows={[
              [
                'Exchanges won',
                `${exchangesWon}/${exchangesWon + exchangesLost}`,
              ],
              ['Mic drops', micDrops],
              ['Lines collected', learned > 0 ? `+${learned}` : 'none'],
            ]}
          />
        </>
      )}
    </>
  );

  return (
    <Frame
      model={model}
      band={band}
      onStep={onStep}
      paused={paused || holding}
      label={`Pushback, duel against ${character.name}`}
      scale={scale}
      lift={tall ? tallLift(rows, shownScale, tallest) : 0}
      // The stage jolts as the call lands
      className={cn(
        called &&
          (won ? 'animate-stage-shake' : 'animate-stage-thud') +
            ' motion-reduce:animate-none',
        className,
      )}
    >
      <div ref={rootRef} aria-live="polite" className="sr-only">
        {announce}
      </div>

      {/* The bars, at the top of what is shown when the ceiling is cropped;
          through a resolve line they show the state before it */}
      <Hud
        scale={shown.scale}
        toWin={toWin(state)}
        toLose={toLose(state)}
        momentum={shown.momentum}
        momentumTotal={state.rules.momentum}
        names={{
          player: playerName(state.setup.role, look),
          opponent: character.name,
        }}
        heads={{ player: playerSheet, opponent: character.sheet }}
        crop={crop}
        still={reduced}
      />

      {/* The demo label over the room, where the round is called */}
      {auto && <DemoLabel y={CALL_AT.y} />}

      {/* The deciding blow's flash, over the room and the bars */}
      {blow && !reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-end-flash bg-(--pb-spark)"
        />
      )}

      {/* The round called over the room, between the duellists' heads;
          centred by its wrapper, since the call moves its own `translate` */}
      {called && (
        <div
          className="pointer-events-none absolute -translate-x-1/2"
          style={{ left: px(CALL_AT.x), top: px(CALL_AT.y) }}
        >
          <RoundCall won={won} flawless={flawless} />
        </div>
      )}

      {/* Tap the stage to skip typing or move on; the panel is for the menus */}
      <button
        type="button"
        aria-label="Continue"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={() => !paused && step?.kind !== 'menu' && confirm()}
      />

      {/* The window and the ghost perched on its corner, which moves
          up with it when a long menu grows the window */}
      <div
        className="absolute flex flex-col transition-[height] duration-200 ease-out motion-reduce:transition-none"
        style={
          tall
            ? {
                left: px(LAYOUT.panel.x),
                right: px(LAYOUT.panel.x),
                top: px(TALL_TOP),
                height: room
                  ? `max(${tallest}px, ${room.need}px)`
                  : TALL_WINDOW,
                maxHeight: `calc(100% - ${px(TALL_TOP + 3)} - var(--bui-bar))`,
              }
            : {
                left: px(LAYOUT.panel.x),
                right: px(LAYOUT.panel.x),
                bottom: px(
                  STAGE.height - (LAYOUT.panel.y + LAYOUT.panel.height),
                ),
                height: room
                  ? `max(${px(WINDOW_HEIGHT)}, ${room.need}px)`
                  : px(WINDOW_HEIGHT),
                // A long menu grows the window up over the room, never
                // over the bars: past that the list scrolls
                maxHeight: px(
                  STAGE.height - LAYOUT.panel.x - crop - LAYOUT.hud,
                ),
              }
        }
      >
        <Window className="min-h-0 flex-1">
          {/* The silence bar: a stopwatch in the corner, beside the
              phrase being answered */}
          {timing && (
            <SilenceTimer
              elapsed={timing.elapsed}
              limit={timing.limit}
              still={reduced}
              ticking={!auto}
              className="absolute"
              style={{ top: px(2), right: 'calc(var(--px) * 3 + 4px)' }}
            />
          )}
          {contents(false)}
          {legend}
        </Window>
        {/* The same window unseen at its natural height: what the shown
            one grows to when this is more than its own */}
        <div
          ref={roomRef}
          aria-hidden
          className="invisible absolute inset-x-0 bottom-0 flex flex-col"
        >
          <span
            ref={heightRef}
            className="absolute"
            style={{ height: px(WINDOW_HEIGHT) }}
          />
          <Window>
            {contents(true)}
            {legend}
          </Window>
        </div>
        {ghostShown && (
          <span
            className="pointer-events-none absolute"
            style={{
              // The figure's right edge `corner.right` in from the
              // window's, its bottom `corner.overlap` down into it
              right: px(
                GHOST.corner.right -
                  (LAYOUT.cell.width - GHOST.figure.left - GHOST.figure.width),
              ),
              bottom: `calc(100% - ${px(GHOST.corner.overlap)})`,
            }}
          >
            <Ghost step={whisper} enter={enter} still={reduced} mirrored />
          </span>
        )}
        {bubble && (
          <Bubble
            point="down"
            // The tail over the middle of the figure's head
            tail={
              GHOST.corner.right + GHOST.figure.width / 2 - GHOST.bubble.right
            }
            className="pointer-events-none absolute max-w-[55%] text-balance"
            style={{
              right: px(GHOST.bubble.right),
              // Above the figure: its top is the cell's height less where
              // the figure starts in it, over the corner it sinks into,
              // and the tail hangs below the bubble's edge
              bottom: `calc(100% - ${px(GHOST.corner.overlap)} + ${px(LAYOUT.cell.height - GHOST.figure.top + GHOST.bubble.gap + BUBBLE_TAIL)})`,
            }}
          >
            {ghostLine}
          </Bubble>
        )}
      </div>

      {/* Escape and M for touch: Pause under the beam on a wide stage, the
          bar held upright; nothing to pause in the demo */}
      <Controls
        escape={
          auto || paused
            ? undefined
            : {
                kind: 'pause',
                onPress: () => {
                  effect('confirm');
                  setPaused(true);
                },
              }
        }
        centreAt={crop + LAYOUT.names.y - 1}
        speaker="none"
      />

      {paused && leaving && (
        <Confirm
          title="Leave the duel?"
          confirm="Leave"
          onCancel={() => setLeaving(false)}
          onConfirm={onBack}
        >
          Back to the roster. The duel counts as neither a win nor a loss.
        </Confirm>
      )}
      {paused && !leaving && (
        <div className={styles.pause()}>
          <Window className="w-[60%]">
            <Text className="mb-[calc(var(--px)*3)] text-center">Paused</Text>
            <Picker label="Pause">
              <PickerItem id="resume" onSelect={() => setPaused(false)}>
                Resume
              </PickerItem>
              {/* The touch version of M, and where a player looks for it */}
              <PickerSetting
                id="sound"
                value={sound.music || sound.effects ? 'On' : 'Off'}
                onSelect={toggleSound}
                onStep={toggleSound}
              >
                Sound
              </PickerSetting>
              <PickerItem id="back" onSelect={() => setLeaving(true)}>
                Back to the roster
              </PickerItem>
            </Picker>
            <Legend keys={[['Esc', 'resume']]} touch="Tap Resume" />
          </Window>
        </div>
      )}
    </Frame>
  );
};
