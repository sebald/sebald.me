import type { CSSProperties, PropsWithChildren } from 'react';

import { px } from '../../foundations/pixel';
import { text as styles } from './text.styles';

interface TextProps extends PropsWithChildren {
  className?: string;
  style?: CSSProperties;
}

export interface HeadingProps extends TextProps {
  /** The heading level; the stage's own title is the page's h1 */
  level?: 2 | 3;
}

/** A heading: a screen's title in a window, a pool's name, a chosen name */
export const Heading = ({
  level = 2,
  className,
  style,
  children,
}: HeadingProps) => {
  const Tag = `h${level}` as const;
  return (
    <Tag className={styles.heading({ className })} style={style}>
      {children}
    </Tag>
  );
};

/** Where a screen's title sits: its top, in stage pixels */
const TITLE_TOP = 8;

export interface ScreenTitleProps extends PropsWithChildren {
  /** A muted line under it saying what the screen is for */
  blurb?: string;
  className?: string;
}

/**
 * A menu screen's title, centred along the stage's top in capitals in
 * the primary colour, with an optional line under it
 */
export const ScreenTitle = ({
  blurb,
  className,
  children,
}: ScreenTitleProps) => (
  <header
    className={styles.title({ className })}
    style={{ top: px(TITLE_TOP) }}
  >
    <h2 className={styles.titleText()}>{children}</h2>
    {blurb && <Muted className="text-[0.8em]">{blurb}</Muted>}
  </header>
);

/** A muted line: a prompt over the options, a blurb, a hint */
export const Muted = ({ className, style, children }: TextProps) => (
  <p className={styles.muted({ className })} style={style}>
    {children}
  </p>
);

/**
 * The loud line: in the primary colour, blinking at the arcade rhythm,
 * half a second on and half off, no fade (steady under reduced motion).
 * How low it goes is `--blink-low`, 0.6 by default.
 */
export const Loud = ({ className, style, children }: TextProps) => (
  <span className={styles.loud({ className })} style={style}>
    {children}
  </span>
);
