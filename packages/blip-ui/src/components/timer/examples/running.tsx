import { useEffect, useState } from 'react';

import { Timer } from '../timer';

const DURATION = 10_000;

/** Running down ten seconds, then starting over: it blinks from half on */
export function Running() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(
      () => setElapsed((performance.now() - start) % (DURATION + 1500)),
      50,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Timer duration={DURATION} remaining={Math.max(0, DURATION - elapsed)} />
  );
}
