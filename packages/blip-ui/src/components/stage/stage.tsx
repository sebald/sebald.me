'use client';

import type {
  CSSProperties,
  FocusEvent,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { useState } from 'react';

import { NATIVE, fontSizeFor } from '../../foundations/scale';
import { Announcer } from '../../providers/announcer';
import { PixelsContext, StageContext } from '../../providers/pixels';
import { stage } from './stage.styles';
import { useScale } from './use-scale';

/**
 * The tall stage's bar of controls along the bottom, in CSS pixels
 * (`Controls`); screens keep clear of it through `--bui-bar`, 0 elsewhere
 */
export const TALL_BAR = 52;

export interface StageProps extends PropsWithChildren {
  className?: string;
  /**
   * Inline styles for the stage (and for what shows when it is turned):
   * a game's own variables, its palette. The stage's size and scale win
   * over them
   */
  style?: CSSProperties;
  /** The stage's name for assistive technology */
  label?: string;
  /**
   * The native width in stage pixels
   * @default 320
   */
  width?: number;
  /**
   * The native height in stage pixels
   * @default 214
   */
  height?: number;
  /**
   * Fix the scale (docs, a workbench) instead of fitting the viewport.
   * Fixed, the stage is never tall and never asks to be turned
   */
  scale?: number;
  /**
   * Crop rows off the top: a number, or `fit`, the ceiling rows a short
   * window takes off (`usePixels().crop`)
   * @default 0
   */
  crop?: number | 'fit';
  /**
   * Held upright, stage pixels to move everything but the bar down by, so
   * a screen's group sits centred in the rows it does not need
   * @default 0
   */
  lift?: number;
  /**
   * The height of the bar of controls on the tall stage, in CSS pixels,
   * written to `--bui-bar` (0 on the wide one)
   * @default 52
   */
  bar?: number;
  /**
   * What a phone held sideways sees instead of the stage: the game's ask
   * to turn it upright, and a button for fullscreen if it has one. Without
   * it the stage is shown whatever the orientation
   */
  turned?: ReactNode;
}

/**
 * The scaled stage every screen sits in: the native size (320 by 214)
 * times its scale, breaking out of the page column to the viewport's
 * centre. Held upright it is tall instead: the window's width and the
 * height of its small viewport, `rows` stage pixels down
 * (`data-layout="tall"`, the `tall:` variant), with the text at 17 px or
 * more. Everything inside positions in stage pixels through `--px` and
 * sizes text in em. It provides what it measures through `usePixels`.
 */
export const Stage = ({
  children,
  className,
  style: styleProp,
  label,
  width: nativeWidth = NATIVE.width,
  height: nativeHeight = NATIVE.height,
  scale: fixed,
  crop: cropProp = 0,
  lift: liftProp = 0,
  bar = TALL_BAR,
  turned,
}: StageProps) => {
  const measured = useScale(fixed, {
    width: nativeWidth,
    height: nativeHeight,
  });
  const { scale, tall, rows, turn } = measured;
  const crop = cropProp === 'fit' ? measured.crop : cropProp;
  const lift = tall ? liftProp : 0;
  // The section, for the focus and for what renders into the stage
  const [root, setRoot] = useState<HTMLElement | null>(null);
  // Focusing the game (a tap on it, or focus arriving from the page)
  // centres the stage in the viewport
  const centre = () =>
    root?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (fixed) return;
    const from = event.relatedTarget as Node | null;
    if (!from || !root?.contains(from)) centre();
  };
  const onPointerDown = () => {
    if (fixed) return;
    const active = document.activeElement;
    if (!active || !root?.contains(active)) root?.focus();
  };
  if (turn && !fixed && turned) {
    return (
      <section
        data-stage
        aria-label={label}
        className={stage.turned()}
        style={{ ...styleProp, ['--px' as string]: '2px' }}
      >
        {turned}
      </section>
    );
  }
  const widthPx = nativeWidth * scale;
  const style: CSSProperties = {
    ...styleProp,
    width: widthPx,
    height: (tall ? rows : nativeHeight - crop) * scale,
    marginInline: `calc(50% - ${widthPx / 2}px)`,
    fontSize: fontSizeFor(scale, tall),
    ['--px' as string]: `${scale}px`,
    ['--bui-bar' as string]: `${tall ? bar : 0}px`,
  };
  return (
    // `data-stage`: normal leading, like the kit's `Pixels` (the site trims
    // every text block to its cap height). The pointer handler only moves
    // focus; a game is keyboard and touch playable through its menus.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      ref={setRoot}
      data-stage
      data-layout={tall ? 'tall' : undefined}
      tabIndex={-1}
      aria-label={label}
      data-slot="stage"
      className={stage.root({ className })}
      style={style}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
    >
      {/* The full stage, its top rows above the section when cropped;
          lifted, it starts lower and ends at the same bottom (the bar) */}
      <PixelsContext.Provider value={measured}>
        <StageContext value={root}>
          <Announcer>
            <div
              className={stage.layer()}
              style={{
                top: (lift - crop) * scale,
                height: (tall ? rows - lift : nativeHeight) * scale,
              }}
            >
              {children}
            </div>
          </Announcer>
        </StageContext>
      </PixelsContext.Provider>
    </section>
  );
};

/** Content in the middle of the stage: a title card, a message */
const Center = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={stage.center({ className })}>{children}</div>
);

Stage.Center = Center;
