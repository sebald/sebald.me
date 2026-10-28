import type { CSSProperties, PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';

/**
 * The letters, by role, so every screen says the same thing the same
 * way: a heading, a muted line (prompts, blurbs, hints, what the ghost
 * dims to), and the loud one. Sizes come from the caller in em, since
 * the stage sizes its text from its scale.
 */
const styles = {
  heading: cva({ base: 'm-0 font-semibold text-(--pb-heading)' }),
  muted: cva({ base: 'm-0 text-(--pb-muted)' }),
  loud: cva({
    base: [
      'font-semibold text-(--pb-gold)',
      'animate-arcade-blink motion-reduce:animate-none',
    ],
  }),
};

interface TextProps extends PropsWithChildren {
  className?: string;
  style?: CSSProperties;
}

/** A heading: the run's title, a pool's name, the chosen one's name */
export const Heading = ({
  level = 2,
  className,
  style,
  children,
}: TextProps & { level?: 2 | 3 }) => {
  const Tag = `h${level}` as const;
  return (
    <Tag className={styles.heading({ className })} style={style}>
      {children}
    </Tag>
  );
};

/** A muted line: a prompt over the options, a blurb, a hint */
export const Muted = ({ className, style, children }: TextProps) => (
  <p className={styles.muted({ className })} style={style}>
    {children}
  </p>
);

/**
 * The loud line: gold, blinking at the arcade rhythm, half a second on
 * and half off, no fade (steady under reduced motion). How low it goes
 * is `--blink-low`, 0.6 by default; the title's call to play sets it to
 * 0 for a full blink.
 */
export const Loud = ({ className, style, children }: TextProps) => (
  <span className={styles.loud({ className })} style={style}>
    {children}
  </span>
);
