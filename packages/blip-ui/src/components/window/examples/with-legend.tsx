import type { ReactNode } from 'react';

import { Legend, Window } from '../window';

/** With the control hints along the bottom: the keys, or the one line for touch */
export function WithLegend({ children }: { children?: ReactNode }) {
  return (
    <Window>
      {children}
      <Legend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'confirm'],
        ]}
        touch="Tap a line"
      />
    </Window>
  );
}
