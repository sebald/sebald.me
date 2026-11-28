import { Actions } from '../../parts/parts';
import { Button } from '../button';

/**
 * A screen's actions: the main one first, the quieter one beside it, in
 * `Actions`, which leaves room for the focus cursor between them
 */
export function Pair() {
  return (
    <Actions>
      <Button>Start</Button>
      <Button variant="secondary">Back</Button>
    </Actions>
  );
}
