import { Button } from '../button';

/** A screen's actions: the main one first, the quieter one beside it */
export function Pair() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Start</Button>
      <Button variant="secondary">Back</Button>
    </div>
  );
}
