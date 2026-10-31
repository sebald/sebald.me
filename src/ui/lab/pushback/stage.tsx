'use client';

import type { CSSProperties, FocusEvent, PropsWithChildren } from 'react';
import { createContext, useContext, useRef } from 'react';

import { BACKING, STAGE, fontSizeFor } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { paletteVars } from './palette';
import { type StageScale, useScale } from './use-scale';

/** A length in stage pixels, for inline styles: `px(3)` is three of them */
export const px = (n: number) => `calc(var(--px) * ${n})`;

// Context
// ---------------
/** The scale of the stage a piece sits in, for its canvas's backing */
const StageContext = createContext<StageScale>({
  scale: 3,
  crop: 0,
  portrait: false,
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
    ],
  }),
  portrait: cva({
    base: 'bg-(--pb-bg) p-6 text-center font-mono text-sm text-(--pb-text)',
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
 * The scaled stage every screen sits in: 480 by 270 times a whole number,
 * breaking out of the page column to the viewport's centre. Everything
 * inside positions in native pixels through `--px` and sizes text in em.
 */
export const Stage = ({
  children,
  className,
  label,
  scale: fixed,
  crop: cropProp = 0,
}: StageProps) => {
  const measured = useScale(fixed);
  const { scale, portrait } = measured;
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
  if (portrait && !fixed) {
    return (
      <section
        data-stage
        aria-label={label}
        className={styles.portrait()}
        style={paletteVars}
      >
        Turn your phone sideways: the stage needs 360 pixels.
      </section>
    );
  }
  const width = STAGE.width * scale;
  const height = (STAGE.height - crop) * scale;
  const style: CSSProperties = {
    ...paletteVars,
    width,
    height,
    marginInline: `calc(50% - ${width / 2}px)`,
    fontSize: fontSizeFor(scale),
    ['--px' as string]: `${scale}px`,
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
          style={{ top: -crop * scale, height: STAGE.height * scale }}
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
