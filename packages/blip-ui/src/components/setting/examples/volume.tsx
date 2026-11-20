import { useState } from 'react';

import { Button } from '../../button/button';
import { Setting } from '../setting';

/** A range outside a Picker, stepped by buttons: the arrow it cannot follow is dim at each end */
export function Volume() {
  const [volume, setVolume] = useState(5);
  return (
    <div className="flex items-center gap-[calc(var(--bui-px)*2)] text-(--bui-text-bright)">
      <Button
        size="small"
        variant="secondary"
        disabled={volume === 0}
        onClick={() => setVolume(volume - 1)}
      >
        Quieter
      </Button>
      Volume
      <Setting first={volume === 0} last={volume === 10}>
        {volume}
      </Setting>
      <Button
        size="small"
        variant="secondary"
        disabled={volume === 10}
        onClick={() => setVolume(volume + 1)}
      >
        Louder
      </Button>
    </div>
  );
}
