'use client';

import { Ledger, LedgerRow, Meter } from '@sebald/blip-ui';
import { Pixels } from '@sebald/pushback/ui/stage';

/** The ledger and the meter on the window's fill, at 3x */
export const LedgerDemo = () => (
  <Pixels
    scale={3}
    className="grid w-[calc(var(--px)*160)] gap-[calc(var(--px)*6)] bg-(--pb-fill) p-[calc(var(--px)*6)] leading-[1.35] text-(--pb-text)"
  >
    <Ledger>
      <LedgerRow label="Duels">6</LedgerRow>
      <LedgerRow label="Flawless">2</LedgerRow>
      <LedgerRow label="Exchanges">23–9</LedgerRow>
      <LedgerRow label="Mic drops">3</LedgerRow>
    </Ledger>
    <div className="grid gap-[calc(var(--px)*2)]">
      <Meter aria-label="Some collected" value={13} max={20} />
      <Meter aria-label="None collected" value={0} max={20} />
      <Meter aria-label="All collected" value={20} max={20} />
    </div>
  </Pixels>
);
