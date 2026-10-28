'use client';

import NextImage from 'next/image';
import { useEffect, useState } from 'react';

import logo from '@/assets/lab/pushback/sheets/logo.png';
import { ATTRACT_AFTER_MS } from '@/lib/lab/pushback/attract';
import { MODE_LABELS, type Mode, STANDS } from '@/lib/lab/pushback/characters';
import { LAYOUT, viewFor } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { Room } from './frame';
import { Picker, type PickerItem } from './picker';
import { Stage, px } from './stage';
import { Loud, Muted } from './text';
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
}

/** The usual line, because the cast is nine office archetypes and nobody in particular */
const FICTION =
  'All characters are fictional. Any resemblance to actual persons or teams is coincidental.';

const MODE_BLURBS: Record<Mode, string> = {
  normal:
    'The ghost of your predecessor whispers along. Slowly. No stars with a ghost.',
  hard: 'No ghost, less time, longer menus, colleagues who tire slowly. Stars for flawless duels.',
};

/** How long the reset stays armed, waiting for the second press */
const ARMED_MS = 4000;

/** The logo's native size: the render cut on its pixel grid, keyed and trimmed */
const LOGO_NATIVE = { width: 226, height: 77 } as const;

/**
 * The logo as shown, in stage pixels: a quarter larger than its render,
 * nine tenths of the band's width. The stage scales it on, so a logo
 * pixel is three and three quarter screen pixels at 3x, which the eye
 * does not catch on a drawn mark the way it would on a sprite.
 */
const LOGO = { width: 282, height: 96 } as const;

/** Where the logo sits in the band: high on the splash, with the call to play under it; at the top with the menu open */
const LOGO_TOP = { splash: 10, menu: 4 } as const;

/** The call to play, centred in the rows the logo leaves under it */
const CALL_TOP = LOGO_TOP.splash + LOGO.height;

/** The window of the corner office the title shows: the duel's */
const VIEW = viewFor(STANDS.office);

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
 * The start screen: the corner office at night fills the band, dimmed,
 * the logo over it and an arcade line blinking under it, both in the
 * scene. Any key or a tap opens the menu: the logo slides to the top of
 * the band and the menu takes the quiet window below, so the title is
 * the start screen with its menu open, not a second screen.
 */
export const TitleScreen = ({
  mode,
  onMode,
  onStart,
  onReset,
  onAttract,
}: TitleScreenProps) => {
  const [open, setOpen] = useState(false);
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
    const onKey = (event: KeyboardEvent) => {
      if (MODIFIERS.has(event.key)) return;
      event.preventDefault();
      setOpen(true);
    };
    const onPointer = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Reset asks for a second press: the first arms it, the second does it,
  // Escape or a few seconds of nothing disarm it
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ARMED_MS);
    return () => clearTimeout(timer);
  }, [armed]);
  useKeys({ Escape: () => setArmed(false) }, armed);

  const items: PickerItem[] = [
    { id: 'start', label: 'Start', onSelect: onStart },
    {
      id: 'mode',
      label: `Mode: ${MODE_LABELS[mode]}`,
      onSelect: () => onMode(mode === 'normal' ? 'hard' : 'normal'),
    },
  ];
  if (onReset)
    items.push({
      id: 'reset',
      label: armed ? 'Reset? Press again' : 'Reset',
      onSelect: () => {
        if (armed) {
          setArmed(false);
          onReset();
        } else setArmed(true);
      },
    });

  const { panel } = LAYOUT;

  return (
    <Stage label="Pushback, title">
      {/* The corner office at night, dimmed, with the logo over it */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: px(LAYOUT.band) }}
      >
        <Room scene="office" view={VIEW} />
        <div className="absolute inset-0 bg-(--pb-bg)/60" />
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

      {open ? (
        <Window
          className="absolute"
          style={{
            left: px(panel.x),
            top: px(panel.y),
            width: px(panel.width),
            height: px(panel.height),
          }}
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
          <div className="flex min-h-0 flex-1 gap-[calc(var(--px)*4)]">
            <Picker label="Title menu" className="w-[11em]" items={items} />
            <div className="grid flex-1 content-start gap-[calc(var(--px)*2)] text-[0.85em] text-balance">
              <Muted>
                {armed
                  ? 'This forgets every run and every collected phrase.'
                  : MODE_BLURBS[mode]}
              </Muted>
              <Muted className="text-[0.8em] opacity-70">{FICTION}</Muted>
            </div>
          </div>
        </Window>
      ) : (
        <>
          {/* The arcade call to play, in the scene under the logo: a full blink, nothing between on and off */}
          <p
            aria-live="polite"
            className="absolute inset-x-0 m-0 flex items-center justify-center text-center text-[1.25em] [--blink-low:0]"
            style={{ top: px(CALL_TOP), height: px(LAYOUT.band - CALL_TOP) }}
          >
            <Loud className="font-bold tracking-[0.15em] uppercase">
              {kind === 'touch' ? 'Tap to play' : 'Press Enter to play'}
            </Loud>
          </p>
          <div
            className="absolute inset-x-0 flex flex-col items-center justify-center gap-[calc(var(--px)*4)] text-center"
            style={{ top: px(LAYOUT.band), height: px(panel.height + 2) }}
          >
            <Muted className="text-[0.85em] text-balance">
              Counter the phrase. Push the scale to your side. Full momentum
              lets you drop the mic.
            </Muted>
            <Muted className="text-[0.7em] text-balance opacity-70">
              {FICTION}
            </Muted>
          </div>
        </>
      )}
    </Stage>
  );
};
