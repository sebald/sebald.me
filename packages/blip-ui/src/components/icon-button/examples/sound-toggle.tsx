import { useState } from 'react';

import { IconToggle } from '../icon-button';

/** A toggle whose state lives with the caller, like the sound button */
export function SoundToggle() {
  const [on, setOn] = useState(true);
  return (
    <IconToggle
      pressed={on}
      onPressedChange={setOn}
      icon="soundOff"
      pressedIcon="soundOn"
      aria-label="Sound (M)"
    />
  );
}
