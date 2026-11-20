import { IconButton, IconToggle } from '../../icon-button/icon-button';
import { Controls, type ControlsProps } from '../controls';

/** The usual two groups: Back at the start, fullscreen and the sound at the end */
export function Toolbar(props: Partial<ControlsProps>) {
  return (
    <Controls {...props}>
      <IconButton
        slot="leave"
        icon="back"
        label="Back"
        aria-label="Back (Esc)"
      />

      <IconToggle
        pressed={false}
        icon="fullscreen"
        pressedIcon="exitFullscreen"
        aria-label="Fullscreen"
        onPressedChange={() => {}}
      />
      <IconToggle
        pressed
        icon="soundOff"
        pressedIcon="soundOn"
        label="Sound off"
        pressedLabel="Sound on"
        aria-label="Sound (M)"
        onPressedChange={() => {}}
      />
    </Controls>
  );
}
