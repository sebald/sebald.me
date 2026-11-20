import { useState } from 'react';

import { Setting } from '../setting';

/** A range outside a Picker: the arrow it cannot follow is dim at each end */
export function Volume() {
  const [volume, setVolume] = useState(5);
  return (
    <div className="flex w-[calc(var(--px)*80)] items-center gap-[1ch] text-(--bui-text-bright)">
      <button type="button" onClick={() => setVolume(Math.max(0, volume - 1))}>
        Quieter
      </button>
      Volume
      <Setting first={volume === 0} last={volume === 10}>
        {volume}
      </Setting>
      <button type="button" onClick={() => setVolume(Math.min(10, volume + 1))}>
        Louder
      </button>
    </div>
  );
}
