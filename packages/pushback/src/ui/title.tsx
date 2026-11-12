'use client';

import {
  BitmapText,
  Confirm,
  Heading,
  Legend,
  Picker,
  PickerItem,
  Text,
  Window,
  useAnnounce,
  useAnyKey,
  useIdle,
  useInputKind,
  usePixels,
  useScale,
} from '@sebald/blip-ui';
import NextImage from 'next/image';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import logo from '../assets/sheets/logo.png';
import { ATTRACT_AFTER_MS } from '../lib/attract';
import type { Mode } from '../lib/characters';
import {
  PAIRS,
  type PairId,
  ROLES,
  ROLE_LABELS,
  type Role,
  poolPairs,
} from '../lib/lines';
import { SHEET_IDS } from '../lib/sprites';
import { STAGE, TITLE_VIEW } from '../lib/stage';
import { effect } from './audio/engine';
import { Controls } from './controls';
import { endMask } from './dither';
import { Room } from './frame';
import { Glossary } from './glossary';
import { Options, type SaveSummary } from './options';
import { preloadSprites } from './sheets';
import { Stage, TALL_BAR, px } from './stage';
import { cn } from './styles.utils';

interface TitleScreenProps {
  /** What it opens on: the splash, or the menu (back from the demo) */
  start?: 'splash' | 'menu';
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
  'Easy: a ghost helps and nothing rushes you. Normal: a bar times you from the second colleague on. Hard: less time, longer menus, double score. M mutes the sound, anywhere.',
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
  <div className="absolute inset-x-0 top-0 bottom-(--bui-bar) flex items-center justify-center bg-(--pb-bg)/60 p-[calc(var(--px)*6)]">
    <Window className="w-full">
      <Heading>How it works</Heading>
      <ol className="m-0 mt-[calc(var(--px)*3)] grid list-none gap-[calc(var(--px)*2.5)] p-0 leading-[1.4]">
        {HOW_TO.map((line, i) => (
          <li key={i} className="flex gap-[1ch]">
            <span className="shrink-0 text-(--pb-gold)">{i + 1}.</span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
      {legend}
    </Window>
  </div>
);

/**
 * The call to play: the kit's call drawn in the bitmap letters, the
 * words for a screen reader beside them. A letter pixel is one stage
 * pixel on the wide stage, two held upright, where the stage pixel is
 * small and one would not read.
 */
const Call = ({ children }: { children: string }) => {
  const { tall } = usePixels();
  return (
    <Text variant="call">
      <BitmapText size={tall ? 'default' : 'small'}>
        {children.toUpperCase()}
      </BitmapText>
      <span className="sr-only">{children}</span>
    </Text>
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
 * Held upright, the room is a header the logo sits in, both staying put
 * when the menu opens: the menu's window goes under the room, over the
 * rows where it fades into the dark
 */
const TALL = { logo: 52, menu: STAGE.height - 18, fade: 48 } as const;

/**
 * Under the office's last row, to the stage's bottom: the floor's darkest
 * flat colour, as the room's own pixels would go on
 */
const FLOOR = '#131623';
/** The room's last rows, dithered into the floor's colour */
const FLOOR_FADE = 8;

/**
 * What the title shows: the splash, the menu, or what the menu opened
 * (How to play, Options, the glossary, the question before a new run)
 */
type TitleView = 'splash' | 'menu' | 'how' | 'options' | 'glossary' | 'confirm';

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
  start = 'splash',
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
  const [view, setView] = useState<TitleView>(start);
  // The item the cursor goes back to, once the menu is shown again: the
  // one whose view was closed (How to play, Options, Glossary are named
  // as their items)
  const [returned, setReturned] = useState<string>();
  const close = useCallback(() => {
    setReturned(view);
    setView('menu');
  }, [view]);
  const open = view !== 'splash';
  // How to play and the options take the menu's place; the glossary and
  // the question before a new run go over it
  const over = view === 'how' || view === 'options';
  const covered = over || view === 'glossary';
  // Any key or a tap goes back (on the tap's click, so the rest of it
  // does not land on the menu that comes back under the finger; not the
  // press that opened it)
  useAnyKey(() => {
    effect('cancel');
    close();
  }, view === 'how');
  const kind = useInputKind();
  // The call to play, said on the splash as well as blinking
  const call = kind === 'touch' ? 'Tap to play' : 'Press Enter to play';
  const say = useAnnounce();
  useEffect(() => {
    if (!open) say(call);
  }, [open, call, say]);
  const { tall } = useScale();

  // While the title waits for a key: the whole cast (about 90 KB), so
  // Pick a role and the first duel open on drawn figures and faces
  useEffect(() => preloadSprites(SHEET_IDS), []);

  // Attract mode: a key or a tap resets the clock, silence starts the demo
  useIdle(ATTRACT_AFTER_MS, () => onAttract?.(), Boolean(onAttract));

  // The splash: any key or a tap opens the menu (Blip UI's any key: on
  // the tap's click, and not the key that brought the title up)
  useAnyKey(() => {
    effect('confirm');
    setView('menu');
  }, !open);

  // Start always works; with a run in play it asks first. Continue is
  // under it only with a run, and the cursor starts on it then.
  // The glossary is here and not in a run because it outlives the runs.
  const collected = poolPairs(glossary).length;

  return (
    <Stage label="Pushback, title">
      {/* The corner office at night, one room pixel a stage pixel (so it
          is as crisp as the duel's band), dimmed a little, its floor run on
          to the stage's bottom; held upright, the stage's first 214 rows,
          fading into the dark */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{
          height: px(STAGE.height),
          ...(tall && {
            maskImage: endMask(STAGE.height, TALL.fade),
            maskSize: `${px(4)} ${px(STAGE.height)}`,
            maskRepeat: 'repeat-x',
          }),
        }}
      >
        <div className="absolute inset-0" style={{ background: FLOOR }} />
        <div
          className="absolute inset-x-0 top-0 overflow-hidden"
          style={{
            height: px(TITLE_VIEW.rows),
            maskImage: endMask(TITLE_VIEW.rows, FLOOR_FADE),
            maskSize: `${px(4)} ${px(TITLE_VIEW.rows)}`,
            maskRepeat: 'repeat-x',
          }}
        >
          <Room scene="office" view={TITLE_VIEW} />
        </div>
        <div className="absolute inset-0 bg-(--pb-bg)/15" />
      </div>
      {/* As wide as the logo: placed from the middle, a heading would
          only get half the stage, and the logo would be squeezed to it.
          How to play takes its place: hidden, not moved, so it is back
          at once where it was when the window closes */}
      <h2
        className={cn(
          // Up to the menu across the stage, by its top: a transform
          // would draw the logo between device pixels at a scale like 2.25
          'absolute left-1/2 m-0 w-max -translate-x-1/2 transition-[top] duration-300 ease-bui-in-out motion-reduce:transition-none',
          view === 'how' && 'invisible',
        )}
        style={{
          top: px(tall ? TALL.logo : open ? LOGO_TOP.menu : LOGO_TOP.splash),
        }}
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

      {view === 'how' ? (
        <HowTo
          legend={<Legend keys={[['Enter', 'back']]} touch="Tap to go back" />}
        />
      ) : view === 'options' ? (
        <Options
          mode={mode}
          onMode={onMode}
          save={save}
          onErase={onErase}
          onClose={close}
        />
      ) : open ? (
        <Window
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: px(tall ? TALL.menu : MENU_TOP) }}
        >
          <Picker
            label="Title menu"
            className="w-[14em]"
            initial={returned ?? (running ? 'continue' : 'start')}
            active={view === 'menu'}
          >
            <PickerItem
              id="start"
              onSelect={() => (running ? setView('confirm') : onStart())}
            >
              Start
            </PickerItem>
            {/* Only with a run to go back to: a role picked starts one */}
            {running && (
              <PickerItem id="continue" onSelect={onContinue}>
                <span className="flex items-center gap-[1ch]">
                  Continue
                  <span className="ml-auto text-[0.8em] text-(--pb-muted)">
                    {running.beaten}/{running.slots}
                  </span>
                </span>
              </PickerItem>
            )}
            <PickerItem
              id="glossary"
              disabled={collected === 0}
              note={
                collected === 0
                  ? 'Nothing collected yet. Counter a phrase in a duel and it lands here, for every run after.'
                  : undefined
              }
              onSelect={() => setView('glossary')}
            >
              <span className="flex items-center gap-[1ch]">
                Glossary
                <span className="ml-auto text-[0.8em] text-(--pb-muted)">
                  {collected}/{PAIRS.length}
                </span>
              </span>
            </PickerItem>
            <PickerItem id="how" onSelect={() => setView('how')}>
              How to play
            </PickerItem>
            <PickerItem id="options" onSelect={() => setView('options')}>
              Options
            </PickerItem>
          </Picker>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
      ) : (
        /* The arcade call to play, under the logo: a full blink, nothing
           between on and off */
        <p
          className="absolute inset-x-0 m-0 flex items-center justify-center [--blink-low:0]"
          style={{
            top: px(tall ? TALL.logo + LOGO.height + 4 : CALL.top),
            height: px(CALL.height),
          }}
        >
          <Call>{call}</Call>
        </p>
      )}
      {!over && (
        <p
          className="absolute inset-x-0 m-0 px-[calc(var(--px)*6)] text-center text-[0.7em] text-balance text-(--pb-text)"
          style={{
            bottom: tall ? `calc(${TALL_BAR}px + var(--px) * 6)` : px(4),
          }}
        >
          {FICTION}
        </p>
      )}
      {/* The sound: the speaker in the corner, or the bar held upright,
          which stays under what is open and has its Back */}
      {(tall || !covered) && (
        <Controls
          speaker="always"
          escape={
            covered
              ? {
                  kind: 'back',
                  onPress: () => {
                    effect('cancel');
                    close();
                  },
                }
              : undefined
          }
        />
      )}
      {view === 'glossary' && (
        <Glossary
          glossary={glossary}
          role={running?.role ?? ROLES[0]!}
          onClose={close}
        />
      )}
      {view === 'confirm' && running && (
        <Confirm
          title={`Abandon your run as ${ROLE_LABELS[running.role]}?`}
          confirm="Start a new run"
          onCancel={() => setView('menu')}
          onConfirm={() => {
            setView('menu');
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
