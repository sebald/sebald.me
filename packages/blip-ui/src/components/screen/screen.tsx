import type { CSSProperties, PropsWithChildren } from 'react';

import { screen as styles } from './screen.styles';

export interface ScreenProps extends PropsWithChildren {
  /**
   * What the screen is: `default`, a column from the top down (a menu, a
   * shop, a list of saves); `centered`, one group in the middle (a title
   * card, a message)
   * @default 'default'
   */
  variant?: 'default' | 'centered';
  className?: string;
  style?: CSSProperties;
}

/**
 * The frame of a full screen, the first child of a `Stage`: it fills the
 * stage, keeps clear of the bar of controls on the tall stage, and places
 * what is in it as a column with the stage's spacing. A `ScreenTitle` in
 * it is the first row of the column, so what follows starts under it
 * whatever its size or blurb.
 */
export const Screen = ({
  variant = 'default',
  className,
  style,
  children,
}: ScreenProps) => (
  <div
    data-slot="screen"
    className={styles.root({ variant, className })}
    style={style}
  >
    {children}
  </div>
);
