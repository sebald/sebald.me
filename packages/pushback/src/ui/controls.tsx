'use client';

import {
  Controls as BlipControls,
  IconButton,
  IconToggle,
  canFullscreen,
  toggleFullscreen,
  useFullscreen,
  useInputKind,
  usePixels,
} from '@sebald/blip-ui';

import { canPlay, toggleSound } from './audio/engine';
import { px } from './stage';
import { useSoundSettings } from './use-sound';

/** What Escape does on a screen, as a button: step back, or pause the duel */
export interface Escape {
  kind: 'back' | 'pause';
  onPress: () => void;
}

const ESCAPE_LABELS = { back: 'Back', pause: 'Pause' } as const;

interface ControlsProps {
  /** Escape's job on this screen, if it has one */
  escape?: Escape;
  /**
   * On a wide stage, Escape's button sits in the top left corner, or in
   * the middle of the top at this row (the duel, whose corners hold the
   * faces)
   */
  centreAt?: number;
  /**
   * The speaker on a wide stage: for touch only (the keyboard has M), on
   * every input (the title), or not at all (the duel: its pause menu has
   * the sound)
   */
  speaker?: 'touch' | 'always' | 'none';
}

/**
 * The touch versions of Escape and M, in Blip UI's `Controls`. On the
 * tall stage its bar along the bottom: Back or Pause, fullscreen where
 * the browser has it, the sound. On a wide stage, for touch, the pixel
 * buttons in the corners (the keyboard has its keys; the title shows its
 * speaker either way).
 */
export const Controls = ({
  escape,
  centreAt,
  speaker = 'touch',
}: ControlsProps) => {
  const { tall } = usePixels();
  const touch = useInputKind() === 'touch';
  const sound = useSoundSettings();
  const full = useFullscreen();
  const centred = !tall && centreAt !== undefined;
  return (
    <BlipControls
      show={speaker === 'always' ? 'always' : 'touch'}
      // The duel's Pause, alone in the middle of the top at its row
      className={centred ? 'justify-center before:hidden' : undefined}
      style={centred ? { top: px(centreAt) } : undefined}
    >
      {escape && (tall || touch) && (
        <IconButton
          slot="leave"
          icon={escape.kind}
          label={ESCAPE_LABELS[escape.kind]}
          aria-label={`${ESCAPE_LABELS[escape.kind]} (Esc)`}
          onClick={escape.onPress}
        />
      )}
      {tall && canFullscreen() && (
        <IconToggle
          icon="fullscreen"
          pressedIcon="exitFullscreen"
          aria-label="Fullscreen"
          pressed={full}
          onPressedChange={toggleFullscreen}
        />
      )}
      {canPlay() && (tall || speaker !== 'none') && (
        <IconToggle
          icon="soundOff"
          pressedIcon="soundOn"
          label="Sound off"
          pressedLabel="Sound on"
          aria-label="Sound (M)"
          pressed={sound.music || sound.effects}
          onPressedChange={toggleSound}
        />
      )}
    </BlipControls>
  );
};
