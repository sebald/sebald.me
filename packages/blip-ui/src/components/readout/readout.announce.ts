/** The numbers as a player reads them: `1,200`, the same in every locale */
export const LOCALE = 'en-US';

const formatter = new Intl.NumberFormat(LOCALE);

export const formatNumber = (value: number) => formatter.format(value);

/** How a value is said, with and without a `max`: `HP 42 of 50`, `Gold 120` */
export const say = (label: string, value: number, max?: number) =>
  max === undefined
    ? `${label} ${formatNumber(value)}`
    : `${label} ${formatNumber(value)} of ${formatNumber(max)}`;

/**
 * What to say to a screen reader after a render, or `null` for nothing:
 * not on the first render (`previous` is `undefined`: a screen that opens
 * is read by walking it) and not when the value stayed the same, only when
 * it changed
 */
export const announcement = ({
  previous,
  value,
  max,
  label,
}: {
  previous: number | undefined;
  value: number;
  max?: number;
  label: string;
}): string | null =>
  previous === undefined || Object.is(previous, value)
    ? null
    : say(label.trim(), value, max);
