import { Meter } from '../meter';

/** Both sides' momentum, the other side in the secondary colour; a full meter blinks */
export function Momentum({ mine, theirs }: { mine: number; theirs: number }) {
  return (
    <div className="grid w-[calc(var(--px)*80)] gap-2">
      <Meter aria-label="Momentum" value={mine} max={5} blink={mine === 5} />
      <Meter
        aria-label="Their momentum"
        value={theirs}
        max={5}
        variant="secondary"
        blink={theirs === 5}
      />
    </div>
  );
}
