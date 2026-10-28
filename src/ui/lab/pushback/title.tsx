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
import {
  MODE_LABELS,
  type Mode,
  STANDS,
  nextMode,
  stepMode,
} from '@/lib/lab/pushback/characters';
import { LAYOUT, SCENE, STAGE, viewFor } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { Confirm } from './confirm';
import { Room } from './frame';
import { Picker, type PickerItem } from './picker';
import { Stage, px } from './stage';
import { Heading, Loud, Muted } from './text';
import { useInputKind } from './use-input-kind';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

interface TitleScreenProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onStart: () => void;
  /** Drop the save; the item only shows when there is something to drop */
  onReset?: () => void;
  /** Nobody has touched anything for a while: play the demo */
  onAttract?: () => void;
  /** No run and nothing collected yet: the first key explains the game */
  firstVisit?: boolean;
  /** A run or a collected phrase: switching the mode asks first */
  progress?: boolean;
}

/**
 * How the game works, for a first visit, four lines in the window under
 * the splash: the exchange, the scale, momentum and the mic drop, the
 * collecting. The ghost is the mode blurb's to explain.
 */
const HOW_TO = [
  'A colleague throws a phrase. Pick the reply that answers it before the bar runs out.',
  'Every exchange you win pushes the shared scale your way. Three steps past the middle and the duel is yours.',
  'Win on your own throw, or counter fast, and your momentum grows. Full, a gold line appears: the mic drop, worth two steps.',
  'Their phrases are collected as you counter them. What you pick up answers the next colleague, and the boss.',
] as const;

/** The usual line, because the cast is nine office archetypes and nobody in particular */
const FICTION =
  'All characters are fictional. Any resemblance to actual persons or teams is coincidental.';

/**
 * How it works, in the quiet window under the band. Stuck to the bottom
 * edge with the panel's height as a minimum: where the lines wrap on a
 * small stage, the window grows upward over the scene.
 */
const HowTo = ({ legend }: { legend: ReactNode }) => {
  const { panel } = LAYOUT;
  return (
    <Window
      className="absolute"
      style={{
        left: px(panel.x),
        bottom: px(STAGE.height - panel.y - panel.height),
        width: px(panel.width),
        minHeight: px(panel.height),
      }}
      legend={legend}
    >
      <Heading className="text-[0.85em]">How it works</Heading>
      <ol className="m-0 mt-[calc(var(--px)*2)] grid list-none gap-[calc(var(--px)*1)] p-0 text-[0.85em]">
        {HOW_TO.map((line, i) => (
          <li key={i} className="flex gap-[1ch]">
            <span className="text-(--pb-gold)">{i + 1}.</span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </Window>
  );
};

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

/**
 * The corner office the title shows: the duel's columns, and all of the
 * scene's rows the stage has room for, down to its floor, so the room
 * fills the whole screen
 */
const VIEW = {
  x: viewFor(STANDS.office).x,
  y: SCENE.height - STAGE.height,
} as const;

/** Left or right of the mode: a pixel triangle, dim at the end it cannot go past */
const Step = ({ left, more }: { left: boolean; more: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'inline-block h-[calc(var(--px)*5)] w-[calc(var(--px)*3)] bg-current',
      left
        ? '[clip-path:polygon(100%_0,0_50%,100%_100%)]'
        : '[clip-path:polygon(0_0,100%_50%,0_100%)]',
      more ? 'opacity-100' : 'opacity-25',
    )}
  />
);

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
 * its menu open, not a second screen. On a first visit that key shows
 * how the game works first, in four lines; `How to play` in the menu
 * shows them again. The mode is switched with left and right on it.
 */
export const TitleScreen = ({
  mode,
  onMode,
  onStart,
  onReset,
  onAttract,
  firstVisit = false,
  progress = false,
}: TitleScreenProps) => {
  const [open, setOpen] = useState(false);
  // How it works: on a first visit's first key, or from the menu; Enter,
  // Escape or a tap goes on to the menu, the cursor back where it was
  const [reading, setReading] = useState<'splash' | 'menu' | null>(null);
  const [returned, setReturned] = useState(false);
  const closeHowTo = useCallback(() => {
    setReading(previous => {
      if (previous === 'menu') setReturned(true);
      return null;
    });
  }, []);
  useKeys(
    useMemo(() => ({ Enter: closeHowTo, Escape: closeHowTo }), [closeHowTo]),
    reading !== null,
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

  // The splash: any key or a tap opens the menu, on a first visit after
  // how the game works
  useEffect(() => {
    if (open) return;
    const go = () => {
      setOpen(true);
      if (firstVisit) setReading('splash');
    };
    const onKey = (event: KeyboardEvent) => {
      if (MODIFIERS.has(event.key)) return;
      event.preventDefault();
      go();
    };
    const onPointer = go;
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open, firstVisit]);

  // Reset, and a mode switch with progress at stake, ask in a dialog
  const [asking, setAsking] = useState<'reset' | Mode | null>(null);
  const cancel = useCallback(() => setAsking(null), []);
  const switchTo = (target: Mode) => {
    if (target === mode) return;
    if (progress) setAsking(target);
    else onMode(target);
  };
  // The legend says what works on the item the cursor is on
  const [current, setCurrent] = useState('start');

  const items: PickerItem[] = [
    { id: 'start', label: 'Start', onSelect: onStart },
    {
      id: 'mode',
      label: (
        <span className="flex items-center gap-[1ch]">
          Mode
          <span className="ml-auto flex items-center gap-[calc(var(--px)*2)]">
            <Step left more={mode !== 'easy'} />
            <span className="w-[6ch] text-center">{MODE_LABELS[mode]}</span>
            <Step left={false} more={mode !== 'hard'} />
          </span>
        </span>
      ),
      // Enter or a tap goes round; left and right stop at the ends
      onSelect: () => switchTo(nextMode(mode)),
      onStep: step => switchTo(stepMode(mode, step)),
    },
    { id: 'how', label: 'How to play', onSelect: () => setReading('menu') },
  ];
  if (onReset)
    items.push({
      id: 'reset',
      label: 'Reset',
      onSelect: () => setAsking('reset'),
    });

  return (
    <Stage label="Pushback, title">
      {/* The corner office at night, the whole stage, dimmed a little */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Room scene="office" view={VIEW} />
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
          legend={
            <Legend
              keys={[['Enter', reading === 'splash' ? 'continue' : 'back']]}
              touch={
                reading === 'splash' ? 'Tap to continue' : 'Tap to go back'
              }
            />
          }
        />
      ) : open ? (
        <Window
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: px(MENU_TOP) }}
          legend={
            <Legend
              keys={
                current === 'mode'
                  ? [
                      ['←→', 'mode'],
                      ['Enter', 'confirm'],
                    ]
                  : [
                      ['↑↓', 'choose'],
                      ['Enter', 'confirm'],
                    ]
              }
              touch="Tap a line"
            />
          }
        >
          <Picker
            label="Title menu"
            className="w-[15em]"
            items={items}
            initial={returned ? 'how' : undefined}
            active={asking === null}
            onCurrent={setCurrent}
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
      {!reading && (
        <Muted className="absolute inset-x-0 bottom-[calc(var(--px)*4)] text-center text-[0.65em] text-balance opacity-70">
          {FICTION}
        </Muted>
      )}
      {asking !== null && asking !== 'reset' && (
        <Confirm
          title={`Switch to ${MODE_LABELS[asking].toLowerCase()}?`}
          confirm={`Switch to ${MODE_LABELS[asking].toLowerCase()}`}
          onCancel={cancel}
          onConfirm={() => {
            setAsking(null);
            onMode(asking);
          }}
        >
          A run is played in one mode, so switching starts over: every run and
          every collected phrase is gone.
        </Confirm>
      )}
      {asking === 'reset' && onReset && (
        <Confirm
          title="Reset the game?"
          confirm="Reset"
          onCancel={cancel}
          onConfirm={() => {
            setAsking(null);
            onReset();
          }}
        >
          This forgets every run and every collected phrase. The mode stays.
        </Confirm>
      )}
    </Stage>
  );
};
