import type { ReactNode } from 'react';

import { setting as styles } from './setting.styles';

export interface StepProps {
  /** Which way it points: `left` (back) or `right` (on) */
  points?: 'left' | 'right';
  /** Whether there is more that way; dim at the end it cannot go past */
  more?: boolean;
  className?: string;
}

/** Left or right of a setting's value: a pixel triangle, dim at an end */
export const Step = ({
  points = 'right',
  more = true,
  className,
}: StepProps) => (
  <span aria-hidden className={styles.step({ points, more, className })} />
);

export interface SettingProps {
  /** The value shown between the arrows */
  children: ReactNode;
  /** A range at its first value: the left arrow is dim. A choice goes round and leaves it unset */
  first?: boolean;
  /** A range at its last value: the right arrow is dim. A choice leaves it unset */
  last?: boolean;
  className?: string;
}

/**
 * A setting's value between its step arrows, pushed to the row's end.
 * It only shows the value: in a Picker, `PickerSetting` draws it and
 * takes the keys; elsewhere bring your own handlers.
 */
export const Setting = ({
  children,
  first = false,
  last = false,
  className,
}: SettingProps) => (
  <span data-slot="setting" className={styles.root({ className })}>
    <Step points="left" more={!first} />
    <span className={styles.value()}>{children}</span>
    <Step more={!last} />
  </span>
);
