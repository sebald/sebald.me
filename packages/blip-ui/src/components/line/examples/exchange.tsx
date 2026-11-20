import { Line } from '../line';

/** An exchange: the line being answered is past, the reply is live */
export function Exchange() {
  return (
    <div className="grid w-[calc(var(--px)*200)] max-w-full gap-3">
      <Line variant="secondary" past>
        Let’s take this offline.
      </Line>
      <Line variant="primary">Offline is where ideas go to die.</Line>
    </div>
  );
}
