'use client';

import { Ledger, Meter } from '../ledger';
import { Pixels } from '../stage';

/** The ledger and the meter on the window's fill, at 3x */
export const LedgerDemo = () => (
  <Pixels
    scale={3}
    className="grid w-[calc(var(--px)*160)] gap-[calc(var(--px)*6)] bg-(--pb-fill) p-[calc(var(--px)*6)] leading-[1.35] text-(--pb-text)"
  >
    <Ledger
      rows={[
        ['Duels', '6'],
        ['Flawless', '2'],
        ['Exchanges', '23–9'],
        ['Mic drops', '3'],
      ]}
    />
    <div className="grid gap-[calc(var(--px)*2)]">
      <Meter value={13} total={20} />
      <Meter value={0} total={20} />
      <Meter value={20} total={20} />
    </div>
  </Pixels>
);
