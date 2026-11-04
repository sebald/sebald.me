'use client';

import type { ButtonHTMLAttributes, CSSProperties } from 'react';

import { useStage } from './stage';
import { cva } from './styles.utils';
import { CORNERS, rounded } from './window';

// Tones
// ---------------
/**
 * The colours a button is cut from, out of the palette: its face, the
 * light catching its top, its shade and its letters. Where the palette
 * has no light or shade, one mixed from the face toward white or the ink.
 */
const mix = (colour: string, toward: string, amount: number) =>
  `color-mix(in srgb, ${colour}, ${toward} ${amount}%)`;

const tone = (
  face: string,
  light: string,
  shade: string,
  text = 'var(--pb-ink)',
) => ({
  '--b-face': face,
  '--b-light': light,
  '--b-shade': shade,
  '--b-text': text,
});

export const TONES = {
  gold: tone('var(--pb-gold)', 'var(--pb-gold-light)', 'var(--pb-gold-shade)'),
  ember: tone(
    'var(--pb-ember)',
    'var(--pb-ember-light)',
    'var(--pb-ember-shade)',
  ),
  time: tone(
    'var(--pb-time)',
    mix('var(--pb-time)', 'white', 50),
    'var(--pb-time-shade)',
  ),
  stamp: tone(
    'var(--pb-stamp)',
    'var(--pb-stamp-light)',
    'var(--pb-stamp-shade)',
    'var(--pb-paper)',
  ),
  steel: tone(
    'var(--pb-steel)',
    'var(--pb-steel-light)',
    mix('var(--pb-steel)', 'var(--pb-ink)', 40),
  ),
  ghost: tone(
    'var(--pb-ghost)',
    'var(--pb-ghost-light)',
    mix('var(--pb-ghost)', 'var(--pb-ghost-rim)', 55),
  ),
} as const;

export type ButtonTone = keyof typeof TONES;

// Looks
// ---------------
const p = (n: number) => (n === 0 ? '0px' : `calc(var(--px) * ${n})`);

interface Look {
  /** The ring between the ink and the face, and pixels of it around the face */
  ring: string;
  ringPad: number;
  /** Pixels of the ring under the face: its side, the depth it sinks */
  lip: number;
  /** The ring's colour while pressed, over the lip the face left */
  ringDown: string;
  /** The face's colour, and whether it rounds its own corners a step in */
  face: string;
  faceCorners: boolean;
  /** The face's shadow at rest and pressed */
  rest: string;
  down: string;
  /** The letters at rest and pressed */
  text: string;
  textDown: string;
}

/**
 * The two ways a button is cut, both inside the ink line every sprite
 * and window has, with the window's stepped corners: the ink `[3, 1, 1]`,
 * the ring a pixel in `[2, 1]`.
 */
export const LOOKS = {
  /** The main action: a cap on its side that sinks onto it when pressed */
  key: {
    ring: 'var(--b-shade)',
    ringPad: 0,
    lip: 2,
    ringDown: 'var(--pb-ink)',
    face: 'var(--b-face)',
    faceCorners: false,
    rest: 'inset 0 var(--px) 0 var(--b-light)',
    down: 'inset 0 var(--px) 0 var(--b-light)',
    text: 'var(--b-text)',
    textDown: 'var(--b-text)',
  },
  /** A quieter one beside it: the frame in the tone, filled while pressed */
  outline: {
    ring: 'var(--b-face)',
    ringPad: 1,
    lip: 0,
    ringDown: 'var(--b-face)',
    // A step in like the window's fill, or it would square the frame's corners
    face: 'var(--pb-bg)',
    faceCorners: true,
    rest: 'none',
    down: 'inset 0 0 0 999px var(--b-face)',
    text: 'var(--b-face)',
    textDown: 'var(--b-text)',
  },
} satisfies Record<string, Look>;

export type ButtonLook = keyof typeof LOOKS;

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      'group inline-block cursor-pointer bg-(--pb-ink) p-(--px) align-middle outline-none',
      'focus-visible:pb-focus',
      'disabled:cursor-default disabled:opacity-50 disabled:saturate-0',
    ],
  }),
  // Pressed, the lip moves above the face: it sinks by its depth
  ring: cva({
    base: [
      'block bg-(--b-ring) p-(--b-ring-pad) pb-[calc(var(--b-ring-pad)+var(--b-lip))]',
      'group-enabled:group-active:bg-(--b-ring-down) group-enabled:group-active:pt-[calc(var(--b-ring-pad)+var(--b-lip))] group-enabled:group-active:pb-(--b-ring-pad)',
    ],
  }),
  face: cva({
    base: [
      'flex min-h-11 items-center justify-center px-5',
      'bg-(--b-face-bg) text-(--b-letters) shadow-(--b-rest)',
      'group-enabled:group-hover:brightness-110',
      'group-enabled:group-active:text-(--b-letters-down) group-enabled:group-active:shadow-(--b-down)',
      'font-semibold tracking-[0.12em] uppercase',
    ],
  }),
};

// Button
// ---------------
/** The finest a button's pixel gets, in CSS pixels: as the inventory shows it */
const MIN_PIXEL = 3;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How it is cut (`LOOKS`): the key by default, the outline beside it */
  look?: ButtonLook;
  /** What colour it is cut from (`TONES`); gold by default */
  tone?: ButtonTone;
}

/**
 * A pixel button, for the actions a touch screen cannot reach otherwise
 * (menus stay pickers): stepped corners like the windows', the key for
 * the main action or the outline for a quieter one, in one of the
 * palette's tones, on the stage's grid through `--px`.
 */
export const Button = ({
  look = 'key',
  tone: toneName = 'gold',
  className,
  style,
  children,
  ...props
}: ButtonProps) => {
  const cut: Look = LOOKS[look];
  // Its own pixel, never finer than 3 CSS pixels: on a phone's tall
  // stage a stage pixel is barely more than one, and the ink, the
  // stepped corners and the side would thin to nothing
  const { scale } = useStage();
  const vars = {
    ...TONES[toneName],
    '--px': `${Math.max(scale, MIN_PIXEL)}px`,
    '--b-ring': cut.ring,
    '--b-ring-pad': p(cut.ringPad),
    '--b-lip': p(cut.lip),
    '--b-ring-down': cut.ringDown,
    '--b-face-bg': cut.face,
    '--b-rest': cut.rest,
    '--b-down': cut.down,
    '--b-letters': cut.text,
    '--b-letters-down': cut.textDown,
  } as CSSProperties;
  return (
    <button
      type="button"
      className={styles.root({ className })}
      style={{ ...vars, clipPath: rounded(CORNERS[0]!), ...style }}
      {...props}
    >
      <span
        className={styles.ring()}
        style={{ clipPath: rounded(CORNERS[1]!) }}
      >
        <span
          className={styles.face()}
          style={
            cut.faceCorners ? { clipPath: rounded(CORNERS[2]!) } : undefined
          }
        >
          {children}
        </span>
      </span>
    </button>
  );
};
