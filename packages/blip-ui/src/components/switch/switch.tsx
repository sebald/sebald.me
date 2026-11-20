'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { KeyboardEvent, ReactNode } from 'react';

import { useFeedback } from '../../providers/feedback';
import { switchStyles as styles } from './switch.styles';

export interface SwitchProps {
  /** Whether it is on; set it to control it, and keep the state with the caller */
  checked?: boolean;
  /** Whether it starts on, when the switch keeps its own state */
  defaultChecked?: boolean;
  /** Called with the state a change asks for: Left, Right, Enter, Space or a tap */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether it ignores the player; dim */
  disabled?: boolean;
  /** Identifies it when a form is submitted */
  name?: string;
  /** What it switches, the name a screen reader reads (`Music`) */
  children: ReactNode;
  className?: string;
}

/**
 * On or off, as a row: its name, a track with a square at one end, and
 * the state in words (On, Off). Left, Right, Enter, Space and a tap all
 * flip it, like a two-value Setting, and a change sounds like a value
 * stepping. Built on Base UI's Switch (the switch role, `aria-checked`,
 * the form value).
 */
export const Switch = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  name,
  children,
  className,
}: SwitchProps) => {
  const play = useFeedback();
  return (
    <BaseSwitch.Root
      data-slot="switch"
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={next => {
        play('move');
        onCheckedChange?.(next);
      }}
      disabled={disabled}
      name={name}
      className={styles.root({ className })}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
        // The arrows flip it, as they step a Setting: a choice goes round
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        // Not the browser's Alt+Left, and not a held key flipping it again
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.repeat
        )
          return;
        event.preventDefault();
        event.currentTarget.click();
      }}
    >
      {children}
      <span aria-hidden className={styles.track()}>
        <BaseSwitch.Thumb className={styles.thumb()} />
      </span>
      {/* The state in words, from the root's data attribute, so it follows
          a controlled or an uncontrolled switch alike; `aria-checked`
          already tells assistive technology */}
      <span aria-hidden className={styles.state()}>
        <span className="group-data-checked:hidden">Off</span>
        <span className="hidden group-data-checked:inline">On</span>
      </span>
    </BaseSwitch.Root>
  );
};
