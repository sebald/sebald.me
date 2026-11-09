'use client';

import {
  Stage as BlipStage,
  Button,
  type StageProps as BlipStageProps,
  TALL_BAR,
  canFullscreen,
  fullscreenFits,
  px,
  toggleFullscreen,
} from '@sebald/blip-ui';

import { paletteVars } from './palette';

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

/** Fullscreen, where the browser has it and the screen is big enough */
const offersFullscreen = () => canFullscreen() && fullscreenFits();

/** The ask instead of the stage, with fullscreen as the way out where it fits */
const Ask = ({ ask, or }: { ask: string; or: string }) => (
  <>
    <p className="m-0 text-(--pb-gold)">{ask}</p>
    <p className="m-0 text-(--pb-muted)">
      {offersFullscreen() ? or : 'The meeting will wait.'}
    </p>
    {offersFullscreen() && (
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
 * side to turn upright and a window too small for the menus to grow
 */
export const Stage = ({ label = 'Pushback', ...props }: StageProps) => (
  <BlipStage
    label={label}
    style={paletteVars}
    turned={
      <Ask
        ask="Turn your phone upright."
        or="Or have the screen to itself, sideways."
      />
    }
    small={
      <Ask
        ask="Make the window bigger to play."
        or="Or have the screen to itself."
      />
    }
    {...props}
  />
);

Stage.Center = BlipStage.Center;
