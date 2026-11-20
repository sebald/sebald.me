import { Meter } from '../../meter/meter';
import { Ledger, LedgerRow } from '../ledger';

/** Values can be any content, a meter for one */
export function WithMeter() {
  return (
    <Ledger>
      <LedgerRow label="Momentum">
        <Meter aria-label="Momentum" value={3} max={5} />
      </LedgerRow>
      <LedgerRow label="Their momentum">
        <Meter
          aria-label="Their momentum"
          value={2}
          max={5}
          variant="secondary"
        />
      </LedgerRow>
      <LedgerRow label="Score">4,200</LedgerRow>
    </Ledger>
  );
}
