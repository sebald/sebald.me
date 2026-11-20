import { useEffect, useState } from 'react';

import { Line } from '../../line/line';
import { Window } from '../../window/window';
import { Typewriter } from '../typewriter';

const LINE = "Let's take this offline and circle back next sprint.";

/** Typing in a dialogue line, 30 characters a second, then again */
export function Running() {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setTyped(n => (n > LINE.length + 30 ? 0 : n + 1)),
      1000 / 30,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Window>
      <Line variant="secondary">
        <Typewriter typed={typed} sound>
          {LINE}
        </Typewriter>
      </Line>
    </Window>
  );
}
