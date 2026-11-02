'use client';

import NextImage from 'next/image';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import logo from '@/assets/lab/pushback/sheets/logo.png';
import { ATTRACT_AFTER_MS } from '@/lib/lab/pushback/attract';
import type { Mode } from '@/lib/lab/pushback/characters';
import {
  PAIRS,
  type PairId,
  ROLES,
  ROLE_LABELS,
  type Role,
  poolPairs,
} from '@/lib/lab/pushback/lines';
import { STAGE, roomBox } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { canPlay, effect, toggleSound } from './audio/engine';
import { Confirm } from './confirm';
import { Room } from './frame';
import { Glossary } from './glossary';
import { Options, type SaveSummary } from './options';
import { PALETTE } from './palette';
import { Picker, type PickerItem } from './picker';
import { Stage, px } from './stage';
import { Heading, Loud } from './text';
import { useInputKind } from './use-input-kind';
import { useKeys } from './use-keys';
import { useSoundSettings } from './use-sound';
import { Legend, Window } from './window';

interface TitleScreenProps {
  /** Open on the menu, the splash skipped: back from the demo */
  menu?: boolean;
  mode: Mode;
  onMode: (mode: Mode) => void;
  /** Pick a role for a new run; with a run in play, it asks first */
  onStart: () => void;
  /** Back to the run in play; off while there is none */
  onContinue: () => void;
  /** The run in play, unfinished, for the Continue line */
  running?: { role: Role; beaten: number; slots: number };
  /** What is in the save, for what the options' Erase save deletes */
  save: SaveSummary;
  /** Every pair collected in any run, for the glossary */
  glossary: readonly PairId[];
  /** Delete everything but the mode, from the options */
  onErase: () => void;
  /** Nobody has touched anything for a while: play the demo */
  onAttract?: () => void;
}

/**
 * How the game works, behind `How to play` in the menu, five lines: the
 * exchange, the scale, momentum and the mic drop, the collecting, and
 * what the three modes change.
 */
const HOW_TO = [
  'A colleague throws a phrase. Pick the reply that answers it before the bar runs out.',
  'Every exchange you win pushes the shared scale your way. Three steps past the middle and the duel is yours.',
  'Win on your own throw, or counter fast, and your momentum grows. Full, a gold line appears: the mic drop, worth two steps.',
  'Their phrases are collected as you counter them. What you pick up answers the next colleague, and the boss.',
  'Easy: a ghost helps and nothing rushes you. Normal: a bar times you from the second colleague on. Hard: less time, longer menus, double score.',
] as const;

/** The usual line, because the cast is nine office archetypes and nobody in particular */
const FICTION =
  'All characters are fictional. Any resemblance to actual persons or teams is coincidental.';

/**
 * How it works, in a window over the dimmed room in place of the logo
 * and the menu: a lot of text, so it gets the stage to itself and the
 * full text size, centred, growing both ways where the lines wrap.
 */
const HowTo = ({ legend }: { legend: ReactNode }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-(--pb-bg)/60 p-[calc(var(--px)*6)]">
    <Window className="w-full" legend={legend}>
      <Heading>How it works</Heading>
      <ol className="m-0 mt-[calc(var(--px)*3)] grid list-none gap-[calc(var(--px)*2.5)] p-0 leading-[1.4]">
        {HOW_TO.map((line, i) => (
          <li key={i} className="flex gap-[1ch]">
            <span className="text-(--pb-gold)">{i + 1}.</span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </Window>
  </div>
);

/** The logo's native size: the render cut on its pixel grid, keyed and trimmed */
const LOGO_NATIVE = { width: 226, height: 77 } as const;

/**
 * The logo as shown, in stage pixels: a quarter larger than its render,
 * nine tenths of the band's width. The stage scales it on, so a logo
 * pixel is three and three quarter screen pixels at 3x, which the eye
 * does not catch on a drawn mark the way it would on a sprite.
 */
const LOGO = { width: 282, height: 96 } as const;

/**
 * Where the logo sits: on the splash, the logo and the call to play
 * under it centred on the stage; with the menu open, near the top with
 * the menu under it
 */
const LOGO_TOP = { splash: 44, menu: 14 } as const;

/** The call to play, in the rows under the logo */
const CALL = { top: LOGO_TOP.splash + LOGO.height + 4, height: 22 } as const;

/** The menu's window, under the logo */
const MENU_TOP = LOGO_TOP.menu + LOGO.height + 6;

/** The corner office's room inside its padded render */
const OFFICE = roomBox('office');

/**
 * The corner office the title shows: its picture scaled to cover the
 * stage, a hair more so no padding shows at an edge, and centred; cut
 * off a little at the sides, smooth rather than on the art's pixels,
 * which is fine for a backdrop
 */
const ROOM_SCALE =
  Math.max(STAGE.width / OFFICE.width, STAGE.height / OFFICE.height) * 1.02;
const VIEW = {
  x: OFFICE.x + OFFICE.width / 2 - STAGE.width / ROOM_SCALE / 2,
  y: OFFICE.y + OFFICE.height / 2 - STAGE.height / ROOM_SCALE / 2,
} as const;

/**
 * The speaker, pixel for pixel (at `SPEAKER_DOT`), in yellow so it is
 * found on the dark room: a box and a cone in an ink outline (`K`), lit
 * on top (`Y`), gold (`G`), in shade below (`O`), and beside it two
 * waves (`W`), or a red cross (`X`) when the sound is off
 */
const SPEAKER = {
  on: [
    '.........K......',
    '........KK...W..',
    '.......KYK....W.',
    '......KYYK.W...W',
    'KKKKKKYYGK..W..W',
    'KYYYYKYGGK..W..W',
    'KGGGGKGGGK..W..W',
    'KOOOOKGOOK..W..W',
    'KKKKKKOOOK..W..W',
    '......KOOK.W...W',
    '.......KOK....W.',
    '........KK...W..',
    '.........K......',
  ],
  off: [
    '.........K......',
    '........KK......',
    '.......KYK......',
    '......KYYK......',
    'KKKKKKYYGK.X...X',
    'KYYYYKYGGK..X.X.',
    'KGGGGKGGGK...X..',
    'KOOOOKGOOK..X.X.',
    'KKKKKKOOOK.X...X',
    '......KOOK......',
    '.......KOK......',
    '........KK......',
    '.........K......',
  ],
} as const;

/** A pixel of the speaker in stage pixels, as fine as the stopwatch's */
const SPEAKER_DOT = 2 / 3;

const SPEAKER_COLOURS: Record<string, string> = {
  K: PALETTE.bg,
  Y: PALETTE.goldLight,
  G: PALETTE.gold,
  O: PALETTE.goldShade,
  W: PALETTE.goldLight,
  X: PALETTE.stamp,
};

/**
 * The sound in a corner of the title: a speaker that turns the music and
 * the effects on or off together (Options has each on its own). A tap
 * on it is the gesture the browser needs before anything can play. M
 * does the same on every screen (`useMuteKey`).
 */
const SpeakerButton = () => {
  const sound = useSoundSettings();
  const on = sound.music || sound.effects;
  if (!canPlay()) return null;
  return (
    <button
      type="button"
      aria-label="Sound (M)"
      aria-pressed={on}
      className="absolute top-[calc(var(--px)*5)] right-[calc(var(--px)*5)] z-10 cursor-pointer p-[calc(var(--px)*2)] outline-none hover:brightness-125 focus-visible:ui-focus"
      // Not a tap that opens the menu or resets the demo's clock
      onPointerDown={event => event.stopPropagation()}
      onClick={toggleSound}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${SPEAKER.on[0].length} ${SPEAKER.on.length}`}
        shapeRendering="crispEdges"
        className="block"
        style={{
          width: px(SPEAKER.on[0].length * SPEAKER_DOT),
          height: px(SPEAKER.on.length * SPEAKER_DOT),
        }}
      >
        {SPEAKER[on ? 'on' : 'off'].flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === '.' ? null : (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={SPEAKER_COLOURS[cell]}
              />
            ),
          ),
        )}
      </svg>
    </button>
  );
};

/** Keys that only modify: not a press that opens the menu */
const MODIFIERS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'Tab',
]);

/**
 * The start screen: the corner office at night fills the whole stage,
 * dimmed a little, the logo over it and an arcade line blinking under
 * it. Any key or a tap opens the menu: the logo slides up and a small
 * window under it holds the menu, so the title is the start screen with
 * its menu open, not a second screen. The menu: `Start`, which asks
 * first with a run in play; `Continue` under it, off without one;
 * `How to play`, how the game works; and `Options`, the mode and
 * erasing the save.
 */
export const TitleScreen = ({
  menu = false,
  mode,
  onMode,
  onStart,
  onContinue,
  running,
  save,
  onErase,
  onAttract,
  glossary,
}: TitleScreenProps) => {
  const [open, setOpen] = useState(menu);
  // How it works, from the menu; Enter, Escape or a tap goes back
  const [reading, setReading] = useState(false);
  // The options, from the menu; Escape or Back goes back
  const [setting, setSetting] = useState(false);
  // The glossary, from the menu; Tab, Escape or its close goes back
  const [browsing, setBrowsing] = useState(false);
  // Start over a run in play asks first
  const [asking, setAsking] = useState(false);
  // The item the cursor goes back to, once the menu is shown again
  const [returned, setReturned] = useState<string>();
  const closeHowTo = useCallback(() => {
    setReading(false);
    setReturned('how');
  }, []);
  const closeGlossary = useCallback(() => {
    setBrowsing(false);
    setReturned('glossary');
  }, []);
  const closeOptions = useCallback(() => {
    setSetting(false);
    setReturned('options');
  }, []);
  useKeys(
    useMemo(() => ({ Enter: closeHowTo, Escape: closeHowTo }), [closeHowTo]),
    reading,
  );
  useEffect(() => {
    if (!reading) return;
    window.addEventListener('pointerdown', closeHowTo);
    return () => window.removeEventListener('pointerdown', closeHowTo);
  }, [reading, closeHowTo]);
  const kind = useInputKind();

  // Attract mode: a key or a tap resets the clock, silence starts the demo
  useEffect(() => {
    if (!onAttract) return;
    let timer = setTimeout(onAttract, ATTRACT_AFTER_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onAttract, ATTRACT_AFTER_MS);
    };
    window.addEventListener('keydown', reset);
    window.addEventListener('pointerdown', reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('pointerdown', reset);
    };
  }, [onAttract]);

  // The splash: any key or a tap opens the menu
  useEffect(() => {
    if (open) return;
    const go = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if (MODIFIERS.has(event.key)) return;
      event.preventDefault();
      effect('confirm');
      go();
    };
    const onPointer = go;
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Start always works; with a run in play it asks first. Continue is
  // under it, off without a run, and the cursor starts on it with one.
  // The glossary is here and not in a run because it outlives the runs.
  const collected = poolPairs(glossary).length;
  const items: PickerItem[] = [
    {
      id: 'start',
      label: 'Start',
      onSelect: () => (running ? setAsking(true) : onStart()),
    },
    {
      id: 'continue',
      label: (
        <span className="flex items-center gap-[1ch]">
          Continue
          {running && (
            <span className="ml-auto text-[0.8em] text-(--pb-muted)">
              {ROLE_LABELS[running.role]} · {running.beaten}/{running.slots}
            </span>
          )}
        </span>
      ),
      disabled: !running,
      note: running
        ? undefined
        : 'No run in progress yet. Start one and pick a role.',
      onSelect: onContinue,
    },
    {
      id: 'glossary',
      label: (
        <span className="flex items-center gap-[1ch]">
          Glossary
          <span className="ml-auto text-[0.8em] text-(--pb-muted)">
            {collected}/{PAIRS.length}
          </span>
        </span>
      ),
      disabled: collected === 0,
      note:
        collected === 0
          ? 'Nothing collected yet. Counter a phrase in a duel and it lands here, for every run after.'
          : undefined,
      onSelect: () => setBrowsing(true),
    },
    {
      id: 'how',
      label: 'How to play',
      onSelect: () => setReading(true),
    },
    {
      id: 'options',
      label: 'Options',
      onSelect: () => setSetting(true),
    },
  ];

  return (
    <Stage label="Pushback, title">
      {/* The corner office at night, the whole stage, dimmed a little */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Room scene="office" view={VIEW} scale={ROOM_SCALE} />
        <div className="absolute inset-0 bg-(--pb-bg)/15" />
      </div>
      <h2
        className={cn(
          'absolute left-1/2 m-0 -translate-x-1/2 transition-[top] duration-500 ease-out motion-reduce:transition-none',
        )}
        style={{ top: px(open ? LOGO_TOP.menu : LOGO_TOP.splash) }}
      >
        <NextImage
          src={logo}
          alt="Pushback"
          width={LOGO_NATIVE.width}
          height={LOGO_NATIVE.height}
          unoptimized
          priority
          draggable={false}
          className="block [image-rendering:pixelated]"
          style={{ width: px(LOGO.width), height: px(LOGO.height) }}
        />
      </h2>

      {open && reading ? (
        <HowTo
          legend={<Legend keys={[['Enter', 'back']]} touch="Tap to go back" />}
        />
      ) : open && setting ? (
        <Options
          mode={mode}
          onMode={onMode}
          save={save}
          onErase={onErase}
          onClose={closeOptions}
        />
      ) : open ? (
        <Window
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: px(MENU_TOP) }}
          legend={
            <Legend
              keys={[
                ['↑↓', 'choose'],
                ['Enter', 'confirm'],
              ]}
              touch="Tap a line"
            />
          }
        >
          <Picker
            label="Title menu"
            className="w-[15em]"
            items={items}
            initial={returned ?? (running ? 'continue' : 'start')}
            active={!asking && !browsing}
          />
        </Window>
      ) : (
        /* The arcade call to play, under the logo: a full blink, nothing between on and off */
        <p
          aria-live="polite"
          className="absolute inset-x-0 m-0 flex items-center justify-center text-center text-[1.25em] [--blink-low:0]"
          style={{ top: px(CALL.top), height: px(CALL.height) }}
        >
          <Loud className="font-bold tracking-[0.15em] uppercase">
            {kind === 'touch' ? 'Tap to play' : 'Press Enter to play'}
          </Loud>
        </p>
      )}
      {!reading && !setting && (
        <p className="absolute inset-x-0 bottom-[calc(var(--px)*4)] m-0 text-center text-[0.7em] text-balance text-(--pb-text)">
          {FICTION}
        </p>
      )}
      {!reading && !setting && !browsing && <SpeakerButton />}
      {browsing && (
        <Glossary
          glossary={glossary}
          role={running?.role ?? ROLES[0]!}
          onClose={closeGlossary}
        />
      )}
      {asking && running && (
        <Confirm
          title={`Abandon your run as ${ROLE_LABELS[running.role]}?`}
          confirm="Start a new run"
          onCancel={() => setAsking(false)}
          onConfirm={() => {
            setAsking(false);
            onStart();
          }}
        >
          One run at a time: picking a role for a new one ends this one. Your
          glossary and the roles you shipped stay.
        </Confirm>
      )}
    </Stage>
  );
};
