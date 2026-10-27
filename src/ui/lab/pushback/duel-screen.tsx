'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  GHOST,
  buddyKeeps,
  buddyLine,
  buddyOpacity,
  buddyStep,
  ghostEnter,
} from '@/lib/lab/pushback/buddy';
import { type Look, SCENE_OF, STANDS } from '@/lib/lab/pushback/characters';
import {
  type DuelAction,
  type DuelState,
  type Side,
  reduce,
  showsComposureHint,
  showsHint,
  toLose,
  toWin,
} from '@/lib/lab/pushback/duel';
import {
  BUDDY_MISS_BARK,
  COMPOSURE_HINT,
  HINT,
  MENU_PROMPTS,
  pairById,
} from '@/lib/lab/pushback/lines';
import { playerName } from '@/lib/lab/pushback/save';
import { PLAYER_SHEETS, type Swap } from '@/lib/lab/pushback/sprites';
import {
  type Step,
  LAYOUT,
  STAGE,
  barsLabel,
  bob,
  counterText,
  holdFor,
  phraseText,
  posesFor,
  scriptFor,
  typedChars,
  typingDuration,
  viewFor,
} from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { Character } from './character';
import { Dialogue } from './dialogue';
import type { FrameModel } from './draw';
import { Frame } from './frame';
import { Ghost } from './ghost';
import { Picker, type PickerItem } from './picker';
import { useKeys } from './use-keys';
import { useScale } from './use-scale';
import { Legend, Window } from './window';

// Styles
// ---------------
const styles = {
  name: cva({
    base: [
      'absolute font-semibold tracking-wide uppercase',
      'bg-[#0b0d16]/85 px-[calc(var(--px)*2)] py-[calc(var(--px)*0.5)]',
      'shadow-[0_0_0_var(--px)_#0b0d16]',
    ],
    variants: {
      side: {
        player: 'text-[#f2c14e]',
        opponent: 'text-right text-[#f0a36f]',
      },
    },
  }),
  badge: cva({
    base: [
      'absolute left-1/2 -translate-x-1/2',
      'bg-[#f2c14e] px-[0.5em] py-[0.1em] font-semibold text-[#0b0d16]',
    ],
  }),
  hint: cva({ base: 'text-[#8a92b8]' }),
  // The ghost's speech bubble, over its head, in its own pale colour
  bubble: cva({
    base: [
      'absolute max-w-[24em] px-[0.6em] py-[0.3em]',
      'bg-[#0b1516]/90 text-[0.85em] text-[#bfe8ea] ring-1 ring-[#2f5e60]',
      'transition-opacity duration-300',
    ],
  }),
  silence: cva({
    base: [
      'mt-[calc(var(--px)*2)] h-[calc(var(--px)*2)] w-full',
      'bg-[#0b0e1a] shadow-[0_0_0_var(--px)_#0b0d16]',
    ],
  }),
  pause: cva({
    base: ['absolute inset-0 flex items-center justify-center bg-[#07080d]/80'],
  }),
  pausePanel: cva({
    base: [
      'grid w-[60%] gap-4 bg-[#131829] p-[calc(var(--px)*6)]',
      'ring-[length:var(--px)] ring-[#b7b09d] shadow-[0_0_0_calc(var(--px)*2)_#0b0d16]',
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

const px = (n: number) => `calc(var(--px) * ${n})`;

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
  // The exchange the buddy's whisper started on, for the miss line and
  // for sending it away afterwards
  const [whisperedOn, setWhisperedOn] = useState<number | null>(null);
  // The ghost's entrance or exit in progress, by the clock it started at
  const [ghostAnim, setGhostAnim] = useState<{
    since: number;
    leaving: boolean;
  } | null>(null);
  const reduced = reducedMotion ?? prefersReducedMotion();
  // The ceiling rows a short window crops: the HUD and the names move down
  const { crop } = useScale(scale);

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
  const buddyOn = state.setup.buddy === true;
  // The ghost helps once a duel: after the exchange it whispered on it
  // leaves, and the counters stop dimming
  const buddy =
    buddyOn && (whisperedOn === null || whisperedOn === state.exchanges);
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
  const scene = SCENE_OF[character.role];
  const stands = STANDS[scene];
  const view = viewFor(stands);
  const standX: Record<Side, number> = {
    player: stands.left - view.x,
    opponent: stands.right - view.x,
  };
  const poses = posesFor(state, step);
  const ghostX = standX.player - GHOST.behind;
  const playerSwap: Swap = useMemo(
    () => ({ base: PLAYER_SHEETS[state.setup.role][look] }),
    [state.setup.role, look],
  );
  // The colleagues are drawn without their props: pasted at the hand they
  // dangled, so the prop is shown on the roster instead
  const opponentSwap: Swap = useMemo(
    () => ({ base: character.swap.base }),
    [character.swap.base],
  );
  const shown =
    state.phase === 'resolve' && step?.kind === 'line' ? shownBefore : state;
  const hud: FrameModel['hud'] = {
    scale: shown.scale,
    toWin: toWin(state),
    toLose: toLose(state),
    momentum: shown.momentum,
    momentumTotal: state.rules.momentum,
    composure: 1 - state.rules.fatigue * shown.exchanges,
    blinkOn: bob(clock) === 0,
    crop,
  };
  const model: FrameModel = { scene, view, hud };
  const micDropBy = (side: Side) =>
    state.exchange?.micDrop === true && state.exchange.by === side;
  const band = (
    <>
      {ghostShown && (
        <Ghost x={ghostX} step={whisper} enter={enter} still={reduced} />
      )}
      <Character
        swap={playerSwap}
        pose={poses.player}
        typing={!typingDone}
        micDrop={micDropBy('player')}
        x={standX.player}
        still={reduced}
        side="player"
      />
      <Character
        swap={opponentSwap}
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
  const typed =
    step?.kind === 'line'
      ? typingDone
        ? step.text
        : step.text.slice(0, typedChars(cursor.elapsed, step.text))
      : '';

  const menuItems: PickerItem[] = useMemo(() => {
    if (step?.kind !== 'menu') return [];
    if (state.phase === 'attack') {
      const items: PickerItem[] = state.hand.map(id => ({
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
      // The ghost leaves one decoy bright: the last call stays the player's
      const kept = buddyKeeps(
        state.menu,
        answer,
        state.turn + state.setup.seed,
      );
      return state.menu.map(id => ({
        id,
        label: pairById(id).counter,
        dim:
          whisper > 0 && id !== answer && id !== kept
            ? buddyOpacity(whisper)
            : undefined,
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
      return showsHint(state)
        ? HINT
        : MENU_PROMPTS[state.phase === 'attack' ? 'attack' : 'defend'];
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

  // The control hints along the window's bottom edge: only what works now
  const legend =
    step?.kind === 'menu' ? (
      <Legend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'confirm'],
          ...(canMicDrop ? ([['M', 'mic drop']] as [string, string][]) : []),
        ]}
        touch="Tap a line"
      />
    ) : step?.kind === 'line' || step?.kind === 'reveal' ? (
      <Legend keys={[['Enter', 'continue']]} touch="Tap to continue" />
    ) : null;

  return (
    <Frame
      model={model}
      band={band}
      onStep={onStep}
      paused={paused}
      label={`Pushback, duel against ${character.name}`}
      scale={scale}
      className={className}
    >
      <div ref={rootRef} aria-live="polite" className="sr-only">
        {announce}
      </div>

      <span
        className={styles.name({ side: 'player' })}
        style={{ left: px(LAYOUT.names.x), top: px(LAYOUT.names.y + crop) }}
        aria-hidden
      >
        {playerName(state.setup.role, look)}
      </span>
      <span
        className={styles.name({ side: 'opponent' })}
        style={{ right: px(LAYOUT.names.x), top: px(LAYOUT.names.y + crop) }}
        aria-hidden
      >
        {character.name}
      </span>

      {micDropLabel && (
        <div
          className={styles.badge()}
          style={{ top: px(LAYOUT.ticks.y + LAYOUT.ticks.height + 6 + crop) }}
          aria-hidden
        >
          Mic drop!
        </div>
      )}

      {ghostShown && ghostLine && enter >= 1 && (
        <p
          className={styles.bubble()}
          style={{
            // Over the ghost's head, kept inside the stage: never past the
            // left edge (the ghost can stand off it), wrapped before the
            // right one, and under the bars when the ceiling is cropped
            left: px(Math.max(2, ghostX + 4)),
            maxWidth: `calc(100% - ${px(Math.max(2, ghostX + 4) + 2)})`,
            top: px(Math.max(crop + 14, LAYOUT.feet - LAYOUT.cell.height + 2)),
          }}
        >
          {ghostLine}
        </p>
      )}

      {/* Tap the stage to skip typing or move on; the panel is for the menus */}
      <button
        type="button"
        aria-label="Continue"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={() => !paused && step?.kind !== 'menu' && confirm()}
      />

      <Window
        className="absolute"
        legend={legend}
        style={{
          left: px(LAYOUT.panel.x),
          right: px(LAYOUT.panel.x),
          bottom: px(STAGE.height - (LAYOUT.panel.y + LAYOUT.panel.height)),
          minHeight: px(LAYOUT.panel.height),
        }}
      >
        {step?.kind === 'line' && (
          <Dialogue speaker={step.speaker}>{typed}</Dialogue>
        )}
        {step?.kind === 'reveal' && (
          <>
            <Dialogue speaker="player" muted>
              {counterText(state.outcome?.picked ?? null)}
            </Dialogue>
            <p className={styles.hint()}>The reply: {step.text}</p>
          </>
        )}
        {step?.kind === 'menu' && (
          <>
            {showsComposureHint(state) && (
              <p className={styles.hint()}>{COMPOSURE_HINT}</p>
            )}
            {state.phase === 'defend' && state.exchange && (
              <Dialogue speaker="opponent" muted>
                {phraseText(state.exchange.phrase)}
              </Dialogue>
            )}
            {/* The prompt sits right above the options, after a gap */}
            <p className={cn(styles.hint(), 'mt-[calc(var(--px)*4)]')}>
              {showsHint(state)
                ? HINT
                : MENU_PROMPTS[state.phase === 'attack' ? 'attack' : 'defend']}
            </p>
            <Picker
              label={state.phase === 'attack' ? 'Your phrases' : 'Counters'}
              items={menuItems}
              active={!paused}
              className="gap-0"
            />
            {silenceWidth !== null && (
              <div className={styles.silence()} aria-hidden>
                <div
                  className="h-full bg-[#ddb65a]"
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
      </Window>

      {paused && (
        <div className={styles.pause()}>
          <div className={styles.pausePanel()}>
            <p className="text-center">Paused</p>
            <Picker
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
