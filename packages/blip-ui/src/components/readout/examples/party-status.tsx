import { useState } from 'react';

import { Button } from '../../button/button';
import { Readout } from '../readout';

/**
 * A shop's gold and a party member's HP and MP: each number is one
 * readout, and a change to it is said to a screen reader on its own
 */
export function PartyStatus() {
  const [gold, setGold] = useState(120);
  const [hp, setHp] = useState(42);
  return (
    <div className="grid w-fit gap-[calc(var(--bui-px)*3)]">
      <Readout value={gold}>Gold</Readout>
      <div className="flex gap-[calc(var(--bui-px)*4)]">
        <Readout value={hp} max={50}>
          HP
        </Readout>
        <Readout value={6} max={10}>
          MP
        </Readout>
      </div>
      <div className="flex gap-[calc(var(--bui-px)*2)]">
        <Button size="small" onClick={() => setGold(gold + 30)}>
          Sell
        </Button>
        <Button size="small" onClick={() => setHp(Math.max(0, hp - 8))}>
          Hit
        </Button>
      </div>
    </div>
  );
}
