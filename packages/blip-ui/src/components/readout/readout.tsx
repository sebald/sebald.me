'use client';

import { Meter } from '@base-ui/react/meter';
import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';

import { useAnnounce } from '../../providers/announcer';
import { LOCALE, announcement, formatNumber } from './readout.announce';
import { readout } from './readout.styles';

export interface ReadoutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** The number */
  value: number;
  /** What it is out of; the readout then shows `value/max` and is a meter for a screen reader */
  max?: number;
  /**
   * Keep a change from being said to a screen reader, for a number that
   * moves too often to be told each time
   * @default false
   */
  silent?: boolean;
  /** The label: `Gold`, `HP` */
  children: ReactNode;
}

/**
 * One number with its label, `Gold 120` or `HP 42/50`: what a screen shows
 * the player to read at a glance. When the value changes it says so to a
 * screen reader itself (politely, through the stage's live region), never
 * when it first appears. With a `max` it is a meter (Base UI's Meter) so
 * the current value out of the maximum is announced; without one it is
 * plain text. A bar is `Meter`; rows of numbers are a `Ledger`.
 */
export const Readout = ({
  value,
  max,
  silent = false,
  className,
  children,
  ...props
}: ReadoutProps) => {
  const announce = useAnnounce();
  const label = useRef<HTMLSpanElement>(null);
  const previous = useRef<number>(undefined);

  useEffect(() => {
    const said = announcement({
      previous: previous.current,
      value,
      max,
      label: label.current?.textContent ?? '',
    });
    previous.current = value;
    if (said && !silent) announce(said);
  }, [value, max, silent, announce]);

  if (max === undefined)
    return (
      <div
        data-slot="readout"
        className={readout.root({ className })}
        {...props}
      >
        <span ref={label} className={readout.label()}>
          {children}
        </span>
        <span className={readout.value()}>{formatNumber(value)}</span>
      </div>
    );

  return (
    <Meter.Root
      data-slot="readout"
      value={value}
      max={max}
      locale={LOCALE}
      // Base UI formats the value, `formatNumber` the max: both en-US
      format={{}}
      getAriaValueText={formatted => `${formatted} of ${formatNumber(max)}`}
      className={readout.root({ className })}
      {...props}
    >
      <Meter.Label ref={label} className={readout.label()}>
        {children}
      </Meter.Label>
      <Meter.Value className={readout.value()}>
        {formatted => `${formatted}/${formatNumber(max)}`}
      </Meter.Value>
    </Meter.Root>
  );
};
