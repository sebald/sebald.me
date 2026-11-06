'use client';

import {
  Pixels as BlipPixels,
  Stage as BlipStage,
  Button,
  type StageProps as BlipStageProps,
  TALL_BAR,
  canFullscreen,
  px,
  toggleFullscreen,
} from '@sebald/blip-ui';
import type { PropsWithChildren } from 'react';

import { paletteVars } from './palette';
import { cn } from './styles.utils';

/**
 * The tall stage's bar of controls along the bottom, in CSS pixels
 * (`Controls`); screens keep clear of it through `--bui-bar`, 0 elsewhere
 */
export { TALL_BAR };

/**
 * A length in stage pixels, for inline styles: `px(3)` is three of them,
 * `px(3, FLOOR)` three never finer than Blip UI's floor
 */
export { px };

/**
 * The stage's pixel unit for pieces shown outside a stage (the
 * inventory): Blip UI's `Pixels` in the game's palette and font.
 */
export const Pixels = ({
  scale,
  children,
  className,
}: PropsWithChildren<{ scale: number; className?: string }>) => (
  <BlipPixels
    scale={scale}
    className={cn('font-mono', className)}
    style={paletteVars}
  >
    {children}
  </BlipPixels>
);

/** What a phone held sideways sees: the ask to turn it, or fullscreen */
const Turned = () => (
  <>
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
  </>
);

type StageProps = Pick<
  BlipStageProps,
  'children' | 'className' | 'label' | 'scale' | 'crop' | 'lift'
>;

/**
 * The stage every screen sits in: Blip UI's, 320 by 214 at its scale
 * (tall when held upright), in the game's palette, asking a phone on its
 * side to turn upright
 */
export const Stage = ({ label = 'Pushback', ...props }: StageProps) => (
  <BlipStage label={label} style={paletteVars} turned={<Turned />} {...props} />
);

Stage.Center = BlipStage.Center;
