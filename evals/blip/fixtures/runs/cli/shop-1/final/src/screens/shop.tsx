import { Button, Frobnicate, Window } from '@sebald/blip-ui';

import { Camp } from './camp';

export const Shop = () => (
  <Window>
    <div
      className="flex gap-2"
      style={{ inset: 0, display: 'flex', gap: 6, position: 'absolute' }}
    >
      <Button className="bg-red-700 text-white">Buy</Button>
      <button className="px-2 text-sm">Sell</button>
    </div>
    <Camp />
  </Window>
);
