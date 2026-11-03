'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cva } from '@/lib/styles.utils';

import { CORNERS, rounded } from './window';

const styles = {
  root: cva({
    base: [
      'group cursor-pointer bg-(--pb-ink) p-(--px) outline-none focus-visible:ui-focus',
    ],
  }),
  // The cap's side in shade below its face; pressed, the face sinks onto
  // it and the gap above is ink
  side: cva({
    base: [
      'block bg-(--pb-gold-shade) pb-[calc(var(--px)*2)]',
      'group-active:bg-(--pb-ink) group-active:pt-[calc(var(--px)*2)] group-active:pb-0',
    ],
  }),
  face: cva({
    base: [
      'flex min-h-11 items-center justify-center px-5',
      'bg-(--pb-gold) shadow-[inset_0_var(--px)_0_var(--pb-gold-light)] group-hover:brightness-110',
      'font-semibold tracking-[0.12em] text-(--pb-ink) uppercase',
    ],
  }),
};

/**
 * A key to press, for the one action a touch screen cannot reach
 * otherwise: a gold cap that sinks under the finger. Menus stay pickers.
 */
export const Button = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={styles.root({ className })}
    // The window's rounded corners: the ink outline, the cap one ring in
    style={{ clipPath: rounded(CORNERS[0]!) }}
    {...props}
  >
    <span className={styles.side()} style={{ clipPath: rounded(CORNERS[1]!) }}>
      <span className={styles.face()}>{children}</span>
    </span>
  </button>
);
