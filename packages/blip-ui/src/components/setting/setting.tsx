import type { ReactNode } from 'react';

import { setting as styles } from './setting.styles';

export interface StepProps {
  /** Points left (back) instead of right */
  left?: boolean;
  /** Whether there is more that way; dim at the end it cannot go past */
  more?: boolean;
  className?: string;
}

/** Left or right of a setting's value: a pixel triangle, dim at an end */
export const Step = ({ left = false, more = true, className }: StepProps) => (
  <span aria-hidden className={styles.step({ left, more, className })} />
);

export interface SettingProps {
  /** The value shown between the arrows */
  children: ReactNode;
  /** At the first value: the left arrow is dim */
  first?: boolean;
  /** At the last value: the right arrow is dim */
  last?: boolean;
  className?: string;
}

/**
 * A setting's value between its step arrows, pushed to the row's end.
 * It only shows the value: the keys are the Picker's `onStep` (or your
 * own handlers). Put it inside a Picker item's label.
 */
export const Setting = ({
  children,
  first = false,
  last = false,
  className,
}: SettingProps) => (
  <span className={styles.root({ className })}>
    <Step left more={!first} />
    <span className={styles.value()}>{children}</span>
    <Step more={!last} />
  </span>
);
