'use client';

import type { CSSProperties, FocusEvent, PropsWithChildren } from 'react';
import { createContext, useContext, useRef } from 'react';

import { BACKING, STAGE, fontSizeFor } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { Button } from './button';
import { canFullscreen, toggleFullscreen } from './fullscreen';
import { paletteVars } from './palette';
import { type StageScale, useScale } from './use-scale';

/**
 * The tall stage's bar of controls along the bottom, in CSS pixels
 * (`Controls`); screens keep clear of it through `--pb-bar`, 0 elsewhere
 */
export const TALL_BAR = 52;

/** A length in stage pixels, for inline styles: `px(3)` is three of them */
export const px = (n: number) => `calc(var(--px) * ${n})`;

// Context
// ---------------
/** The scale of the stage a piece sits in, for its canvas's backing */
const StageContext = createContext<StageScale>({
  scale: 3,
  crop: 0,
  tall: false,
  rows: STAGE.height,
  turn: false,
  crisp: true,
  backing: BACKING,
});

export const useStage = () => useContext(StageContext);

/**
 * A bare provider of the stage's pixel unit, for pieces shown outside a
 * stage (the inventory): sets `--px` and the font size for a scale.
 */
export const Pixels = ({
  scale: fixed,
  children,
  className,
}: PropsWithChildren<{ scale: number; className?: string }>) => {
  const measured = useScale(fixed);
  return (
    <StageContext.Provider value={measured}>
      <div
        // `data-stage`: normal leading, like the stage (styles.css)
        data-stage
        className={cn('font-mono', className)}
        style={{
          ...paletteVars,
          fontSize: fontSizeFor(fixed),
          ['--px' as string]: `${fixed}px`,
        }}
      >
        {children}
      </div>
    </StageContext.Provider>
  );
};

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      // The 320 by 214 stage at its scale, the panel's dark ground until
      // a scene lands; text is DOM in the site's mono font, like the
      // hotspot remarks, sized from the scale (so em units inside), smooth
      // and without a shadow
      'relative overflow-hidden outline-none',
      'bg-(--pb-bg) text-(--pb-text)',
      'select-none',
      // A game, not a page: no double-tap zoom, no tap flash, no
      // long-press menu on a face
      'touch-manipulation [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]',
    ],
  }),
  turn: cva({
    base: 'grid min-h-[60svh] place-content-center gap-2 bg-(--pb-bg) p-6 text-center font-mono text-sm text-(--pb-text)',
  }),
  center: cva({
    base: 'absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center',
  }),
};

// Stage
// ---------------
interface StageProps extends PropsWithChildren {
  className?: string;
  label?: string;
  /** Fix the scale (the workbench) instead of fitting the viewport */
  scale?: number;
  /**
   * Crop rows off the top: a number, or `fit`, the ceiling rows a short
   * window takes off (the duel's frame)
   */
  crop?: number | 'fit';
}

/**
 * The scaled stage every screen sits in: 320 by 214 times its scale,
 * breaking out of the page column to the viewport's centre. Held
 * upright it is tall instead: the window's width and the height of its
 * small viewport, `rows` stage pixels down (`data-layout="tall"`, the
 * `tall:` variant), with the text at 16 px or more. Everything inside
 * positions in native pixels through `--px` and sizes text in em.
 */
export const Stage = ({
  children,
  className,
  label,
  scale: fixed,
  crop: cropProp = 0,
}: StageProps) => {
  const measured = useScale(fixed);
  const { scale, tall, rows, turn } = measured;
  const crop = cropProp === 'fit' ? measured.crop : cropProp;
  const ref = useRef<HTMLElement>(null);
  // Focusing the game (a tap on it, or focus arriving from the page)
  // centres the stage in the viewport
  const centre = () =>
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (fixed) return;
    const from = event.relatedTarget as Node | null;
    if (!from || !ref.current?.contains(from)) centre();
  };
  const onPointerDown = () => {
    if (fixed) return;
    const active = document.activeElement;
    if (!active || !ref.current?.contains(active)) ref.current?.focus();
  };
  if (turn && !fixed) {
    return (
      <section
        data-stage
        aria-label={label}
        className={styles.turn()}
        style={{ ...paletteVars, ['--px' as string]: '2px' }}
      >
        <p className="m-0 text-(--pb-gold)">Turn your phone upright.</p>
        <p className="m-0 text-(--pb-muted)">
          {canFullscreen()
            ? 'Or have the screen to itself, sideways.'
            : 'The meeting will wait.'}
        </p>
        {canFullscreen() && (
          <Button className="mx-auto mt-4 w-fit" onClick={toggleFullscreen}>
            Play fullscreen
          </Button>
        )}
      </section>
    );
  }
  const width = STAGE.width * scale;
  const height = (tall ? rows : STAGE.height - crop) * scale;
  const style: CSSProperties = {
    ...paletteVars,
    width,
    height,
    marginInline: `calc(50% - ${width / 2}px)`,
    fontSize: fontSizeFor(scale, tall),
    ['--px' as string]: `${scale}px`,
    ['--pb-bar' as string]: `${tall ? TALL_BAR : 0}px`,
  };
  return (
    // `data-stage`: styles.css gives the stage normal leading back (the site
    // trims every text block to its cap height). The pointer handler only
    // moves focus; the game itself is keyboard and touch playable through
    // its menus.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      ref={ref}
      data-stage
      data-layout={tall ? 'tall' : undefined}
      tabIndex={-1}
      aria-label={label ?? 'Pushback'}
      className={styles.root({ className })}
      style={style}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
    >
      {/* The full stage, its top rows above the section when cropped */}
      <StageContext.Provider value={measured}>
        <div
          className="absolute inset-x-0"
          style={{
            top: -crop * scale,
            height: (tall ? rows : STAGE.height) * scale,
          }}
        >
          {children}
        </div>
      </StageContext.Provider>
    </section>
  );
};

const Center = ({ children, className }: StageProps) => (
  <div className={styles.center({ className })}>{children}</div>
);

Stage.Center = Center;
