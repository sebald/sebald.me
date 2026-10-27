'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  GHOST,
  buddyLine,
  buddyOpacity,
  buddyStep,
} from '@/lib/lab/pushback/buddy';
import { type Look, SCENE_OF, STANDS } from '@/lib/lab/pushback/characters';
import {
  type DuelAction,
  type DuelState,
  type Side,
  reduce,
  showsHint,
  toLose,
  toWin,
} from '@/lib/lab/pushback/duel';
import { BUDDY_MISS_BARK, HINT, pairById } from '@/lib/lab/pushback/lines';
import {
  PLAYER_SHEETS,
  type Swap,
  cellFor,
  ghostCell,
  swapKey,
} from '@/lib/lab/pushback/sprites';
import {
  type Step,
  FIGURE_SCALE,
  LAYOUT,
  STAGE,
  barsLabel,
  bob,
  counterText,
  figureCell,
  holdFor,
  phraseText,
  poseOffset,
  posesFor,
  scriptFor,
  typedChars,
  typingDuration,
} from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import type { FrameModel } from './draw';
import { Frame } from './frame';
import { Menu, type MenuItem } from './stage';
import { useKeys } from './use-keys';

// Styles
// ---------------
const styles = {
  box: cva({
    base: [
      // Over the drawn dialogue box; grows upward past it at 1x
      'absolute right-[calc(var(--px)*6)] bottom-[calc(var(--px)*5)] left-[calc(var(--px)*6)]',
      'min-h-[calc(var(--px)*38)] p-[calc(var(--px)*4)]',
      // Same fill and frame as the drawn box, so it grows past it seamlessly
      'bg-[#171a22] ring-[length:var(--px)] ring-[#e6e2d6] shadow-[0_0_0_calc(var(--px)*2)_#0b0d12]',
      'flex flex-col justify-end gap-[calc(var(--px)*2)]',
      'leading-tight',
    ],
  }),
  line: cva({
    base: 'flex items-start gap-[calc(var(--px)*3)]',
  }),
  speaker: cva({
    base: 'mt-[0.35em] inline-block size-[0.6em] shrink-0',
    variants: {
      side: {
        player: 'bg-[#2f8f8a]',
        opponent: 'bg-[#c0622f]',
      },
    },
  }),
  badge: cva({
    base: [
      'absolute top-[calc(var(--px)*4)] left-1/2 -translate-x-1/2',
      'rounded-sm bg-mist-50 px-[0.5em] py-[0.1em] font-semibold text-mist-950',
      '[text-shadow:none]',
    ],
  }),
  hint: cva({ base: 'text-mist-400' }),
  // The ghost's speech bubble, over its head, in its own pale colour
  bubble: cva({
    base: [
      'absolute max-w-[24em] rounded-lg px-[0.6em] py-[0.3em]',
      'bg-[#0b1516]/90 text-[0.85em] text-[#bfe8ea] ring-1 ring-[#2f5e60]',
      'transition-opacity duration-300',
    ],
  }),
  silence: cva({
    base: 'mt-[calc(var(--px)*2)] h-[var(--px)] w-full bg-mist-700',
  }),
  pause: cva({
    base: ['absolute inset-0 flex items-center justify-center bg-mist-950/80'],
  }),
  panel: cva({
    base: 'grid w-[60%] gap-4 rounded-xl bg-mist-900 p-[calc(var(--px)*6)] ring-1 ring-mist-700',
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
  onBack: () => void;
  /** Force reduced motion (the workbench); otherwise the media query */
  reducedMotion?: boolean;
  /** Fix the scale (the workbench) */
  scale?: number;
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

const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  ].join('|');

export const DuelScreen = ({
  initial,
  look,
  onEnd,
  onBack,
  reducedMotion,
  scale,
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
  const [micDrop, setMicDrop] = useState(false);
  const [clock, setClock] = useState(0);
  // The exchange the buddy's whisper started on, for the miss line
  const [whisperedOn, setWhisperedOn] = useState<number | null>(null);
  const reduced = reducedMotion ?? prefersReducedMotion();

  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

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
          if (s.phase === 'defend' && s.silence) act({ type: 'tick', ms });
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
          setCursor({ ...cursor, elapsed });
      }
    },
    [steps, cursor, reduced, advance, act],
  );

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

  const canMicDrop =
    state.phase === 'attack' && state.micDropAvailable && !state.boss;
  const toggleMicDrop = useCallback(() => setMicDrop(on => !on), []);

  useKeys(
    useMemo(
      () => ({
        Escape: () => setPaused(p => !p),
        ...(paused || step?.kind === 'menu'
          ? {}
          : { Enter: confirm, ' ': confirm }),
        ...(canMicDrop ? { m: toggleMicDrop, M: toggleMicDrop } : {}),
      }),
      [paused, step?.kind, confirm, toggleMicDrop, canMicDrop],
    ),
  );

  // The onboarding buddy
  // ---------------
  // How far the whisper has got on this defence: paced by the silence bar
  // when there is one, by its own clock otherwise
  const buddy = state.setup.buddy === true;
  const defending = state.phase === 'defend' && step?.kind === 'menu';
  const whisper =
    buddy && defending
      ? buddyStep(
          state.silence?.elapsed ?? cursor.elapsed,
          state.silence?.limit ?? null,
        )
      : 0;
  // A miss after the whisper gets the ghost's own line during the resolve
  const missedAfterWhisper =
    buddy &&
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

  // Frame model
  // ---------------
  const { character } = state.setup;
  const scene = SCENE_OF[character.role];
  const stands = STANDS[scene];
  const poses = posesFor(state, step);
  const ghost: FrameModel['ghost'] = ghostLine
    ? {
        x: figureCell(stands.left).x - GHOST.behind,
        dy: GHOST.lift + (reduced ? 0 : bob(clock, 1200)),
        cell: ghostCell(whisper, reduced ? 0 : clock),
        opacity: 1,
      }
    : undefined;
  const playerSwap: Swap = useMemo(
    () => ({ base: PLAYER_SHEETS[state.setup.role][look] }),
    [state.setup.role, look],
  );
  const shown =
    state.phase === 'resolve' && step?.kind === 'line' ? shownBefore : state;
  const bars = (side: Side) => ({
    // Until the shared scale is drawn: each side's half of it
    buyIn: Math.max(0, side === 'player' ? shown.scale : -shown.scale),
    buyInTotal: side === 'player' ? toWin(state) : toLose(state),
    momentum: shown.momentum[side],
    momentumTotal: state.rules.momentum,
    blinkOn: bob(clock) === 0,
  });
  const sprite = (side: Side) => {
    const pose = poses[side];
    const offset = reduced
      ? { dx: 0, dy: 0, lighter: false }
      : poseOffset(
          pose,
          cursor.elapsed,
          side === 'player' ? 1 : -1,
          state.exchange?.micDrop === true && state.exchange.by === side,
        );
    const swap = side === 'player' ? playerSwap : character.swap;
    return {
      x: side === 'player' ? stands.left : stands.right,
      pose,
      cell: cellFor(pose, reduced ? 0 : cursor.elapsed, !typingDone),
      swap,
      key: swapKey(swap),
      ...offset,
      mirrored: side === 'opponent',
    };
  };
  const model: FrameModel = {
    scene,
    sprites: { player: sprite('player'), opponent: sprite('opponent') },
    bars: { player: bars('player'), opponent: bars('opponent') },
    ghost,
  };

  // Overlay
  // ---------------
  const typed =
    step?.kind === 'line'
      ? typingDone
        ? step.text
        : step.text.slice(0, typedChars(cursor.elapsed, step.text))
      : '';

  const menuItems: MenuItem[] = useMemo(() => {
    if (step?.kind !== 'menu') return [];
    if (state.phase === 'attack') {
      const items: MenuItem[] = state.hand.map(id => ({
        id,
        label: pairById(id).phrase,
        onSelect: () => {
          act({ type: 'throw', phrase: id, micDrop });
          setMicDrop(false);
        },
      }));
      if (canMicDrop) {
        items.push({
          id: 'mic-drop',
          label: `Mic drop: ${micDrop ? 'on' : 'off'} (M)`,
          onSelect: toggleMicDrop,
        });
      }
      return items;
    }
    if (state.phase === 'defend') {
      const answer = state.exchange?.answer;
      return state.menu.map(id => ({
        id,
        label: pairById(id).counter,
        dim: whisper > 0 && id !== answer ? buddyOpacity(whisper) : undefined,
        onSelect: () => act({ type: 'counter', phrase: id }),
      }));
    }
    return [];
  }, [step?.kind, state, micDrop, act, toggleMicDrop, canMicDrop, whisper]);

  const micDropLabel =
    state.exchange?.micDrop === true &&
    !state.outcome?.offline &&
    (state.phase === 'defend' || state.phase === 'resolve');

  const announce = useMemo(() => {
    if (!step) return '';
    if (step.kind === 'line') {
      const who = step.speaker === 'player' ? 'You' : character.name;
      return `${who}: ${step.text}`;
    }
    if (step.kind === 'reveal') return `The reply was: ${step.text}`;
    if (step.kind === 'menu') {
      return state.phase === 'attack'
        ? 'Your turn: pick a phrase.'
        : 'Pick the counter.';
    }
    if (step.kind === 'wait') {
      return `${state.winner === 'player' ? 'You won' : 'You lost'}. ${barsLabel(state, 'player')}. Press Enter to continue.`;
    }
    return barsLabel(state, 'player');
  }, [step, state, character.name]);

  const silenceWidth =
    state.phase === 'defend' && state.silence && step?.kind === 'menu'
      ? Math.min(100, (state.silence.elapsed / state.silence.limit) * 100)
      : null;

  return (
    <Frame
      model={model}
      onStep={onStep}
      paused={paused}
      label={`Pushback, duel against ${character.name}`}
      scale={scale}
      className={className}
    >
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      {micDropLabel && (
        <div className={styles.badge()} aria-hidden>
          Mic drop!
        </div>
      )}

      {ghost && ghostLine && (
        <p
          className={styles.bubble()}
          style={{
            // Over the ghost's head, which is just under the bars
            left: `calc(var(--px) * ${ghost.x + 8})`,
            bottom: `calc(var(--px) * ${STAGE.height - LAYOUT.feet + ghost.dy + LAYOUT.cell.height * FIGURE_SCALE - 50})`,
          }}
        >
          {ghostLine}
        </p>
      )}

      {/* Tap the stage to skip typing or move on; the box is for the menus */}
      <button
        type="button"
        aria-label="Continue"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={() => !paused && step?.kind !== 'menu' && confirm()}
      />

      <div className={styles.box()}>
        {step?.kind === 'line' && (
          <p className={styles.line()}>
            <span
              className={styles.speaker({ side: step.speaker })}
              aria-hidden
            />
            <span>{typed}</span>
          </p>
        )}
        {step?.kind === 'reveal' && (
          <>
            <p className={cn(styles.line(), 'text-mist-400')}>
              <span
                className={styles.speaker({ side: 'player' })}
                aria-hidden
              />
              <span>{counterText(state.outcome?.picked ?? null)}</span>
            </p>
            <p className={styles.hint()}>The reply: {step.text}</p>
          </>
        )}
        {step?.kind === 'menu' && (
          <>
            {showsHint(state) && <p className={styles.hint()}>{HINT}</p>}
            {state.phase === 'defend' && state.exchange && (
              <p className={cn(styles.line(), 'text-mist-400')}>
                <span
                  className={styles.speaker({ side: 'opponent' })}
                  aria-hidden
                />
                <span>{phraseText(state.exchange.phrase)}</span>
              </p>
            )}
            <Menu
              label={state.phase === 'attack' ? 'Your phrases' : 'Counters'}
              items={menuItems}
              active={!paused}
              className="gap-0"
            />
            {silenceWidth !== null && (
              <div className={styles.silence()} aria-hidden>
                <div
                  className="h-full bg-mist-100"
                  style={{ width: `${silenceWidth}%` }}
                />
              </div>
            )}
          </>
        )}
        {step?.kind === 'wait' && (
          <p className={styles.hint()}>
            {state.winner === 'player' ? 'You won.' : 'You lost.'} Enter to
            continue.
          </p>
        )}
      </div>

      {paused && (
        <div className={styles.pause()}>
          <div className={styles.panel()}>
            <p className="text-center">Paused</p>
            <Menu
              label="Pause"
              items={[
                {
                  id: 'resume',
                  label: 'Resume',
                  onSelect: () => setPaused(false),
                },
                { id: 'back', label: 'Back to the roster', onSelect: onBack },
              ]}
            />
          </div>
        </div>
      )}
    </Frame>
  );
};
