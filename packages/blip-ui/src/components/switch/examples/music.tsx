import { useState } from 'react';

import { Text } from '../../text/text';
import { Switch } from '../switch';

/** Music on or off, outside a Picker: the caller keeps the state and says it in words too */
export function Music() {
  const [music, setMusic] = useState(true);
  return (
    <div className="grid gap-related">
      <Switch checked={music} onCheckedChange={setMusic}>
        Music
      </Switch>
      <Text variant="hint">{music ? 'You hear the score.' : 'Silence.'}</Text>
    </div>
  );
}
