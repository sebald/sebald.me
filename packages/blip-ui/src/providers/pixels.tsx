'use client';

import type { CSSProperties, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { useScale } from '../components/stage/use-scale';
import { BACKING, NATIVE, fontSizeFor } from '../foundations/scale';
import { cn } from '../utils/styles';
import { Announcer } from './announcer';

/** What a piece needs to know about the pixels it is drawn in */
export interface PixelsValue {
  /** CSS pixels per stage pixel */
  scale: number;
  /** Held upright: the tall layout of a phone in portrait */
  tall: boolean;
  /** The stage's height in stage pixels: the native height, more when tall */
  rows: number;
  /** The ceiling rows a short window takes off the top (`Stage`) */
  crop: number;
  /** Whether a stage pixel is a whole number of device pixels */
  crisp: boolean;
  /** The scale a canvas is drawn at (`backingFor`) */
  backing: number;
  /** A phone on its side, too short to play: the game asks to turn it */
  turn: boolean;
  /**
   * A window too small for the screens' words (under `MIN_SCALE`): the
   * game asks for a bigger one
   */
  small: boolean;
}

/** What a piece outside any stage sees: 3x, wide, nothing cropped */
export const DEFAULT_PIXELS: PixelsValue = {
  scale: 3,
  tall: false,
  rows: NATIVE.height,
  crop: 0,
  crisp: true,
  backing: BACKING,
  turn: false,
  small: false,
};

/** The context `Pixels` and `Stage` provide; read it with `usePixels` */
export const PixelsContext = createContext<PixelsValue>(DEFAULT_PIXELS);

/** The scale and layout of the pixels around a piece (3x, wide, outside any) */
export const usePixels = () => useContext(PixelsContext);

/**
 * The stage element a piece is in (`Stage`'s or `Pixels`' root), for
 * what is rendered over the stage itself: a dialog, a picker's note.
 * `null` on the stage's first render, before it is there; `undefined`
 * outside any stage.
 */
export const StageContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

/** The stage element a piece is in: `null` until it is there, `undefined` outside any */
export const useStage = () => useContext(StageContext);

export interface PixelsProps extends PropsWithChildren {
  /** CSS pixels per stage pixel; 3 by default */
  scale?: number;
  /** The tall layout: `data-layout="tall"` and the `tall:` variant */
  tall?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The pixel unit for everything inside: sets `--px` to the scale, the
 * text size from it, and the tall layout, and tells the pieces through
 * `usePixels`, with what the scale is on this screen (`crisp`, and the
 * `backing` a canvas is drawn at). A game's stage is one; on its own it
 * serves docs and embeds. `data-stage` gives the text normal leading
 * back.
 */
export const Pixels = ({
  scale = 3,
  tall = false,
  className,
  style,
  children,
}: PixelsProps) => {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const measured = useScale(scale);
  const value = useMemo(() => ({ ...measured, tall }), [measured, tall]);
  return (
    <PixelsContext.Provider value={value}>
      <div
        ref={setRoot}
        data-stage
        data-layout={tall ? 'tall' : undefined}
        className={cn('relative', className)}
        style={{
          ['--px' as string]: `${scale}px`,
          fontSize: fontSizeFor(scale, tall),
          ...style,
        }}
      >
        <StageContext value={root}>
          <Announcer>{children}</Announcer>
        </StageContext>
      </div>
    </PixelsContext.Provider>
  );
};
