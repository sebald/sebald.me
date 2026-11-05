import type { CSSProperties, PropsWithChildren } from 'react';

import { px } from '../../foundations/pixel';
import { BitmapText } from '../bitmap-text/bitmap-text';
import { text as styles } from './text.styles';

interface BaseProps extends PropsWithChildren {
  className?: string;
  style?: CSSProperties;
}

export interface HeadingProps extends BaseProps {
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
    <Tag
      data-slot="heading"
      className={styles.heading({ className })}
      style={style}
    >
      {children}
    </Tag>
  );
};

/** Where a screen's title sits: its top, in stage pixels */
const TITLE_TOP = 8;

export interface ScreenTitleProps {
  /** The title: letters, digits and marks from `BITMAP_GLYPHS`, in capitals */
  children: string;
  /** A hint under it saying what the screen is for */
  blurb?: string;
  className?: string;
}

/**
 * A menu screen's title, centred along the stage's top in the bitmap
 * letters (`BitmapText`), in the primary colour, with an optional line
 * under it. The heading itself is there for assistive technology; the
 * letters are drawn over it.
 */
export const ScreenTitle = ({
  blurb,
  className,
  children,
}: ScreenTitleProps) => (
  <header
    data-slot="screen-title"
    className={styles.title({ className })}
    style={{ top: px(TITLE_TOP) }}
  >
    <h2 className={styles.titleText()}>{children}</h2>
    <BitmapText>{children}</BitmapText>
    {blurb && <Text className="text-[0.85em]">{blurb}</Text>}
  </header>
);

export interface TextProps extends BaseProps {
  /**
   * What the line is for: `hint`, a quieter paragraph (a prompt over the
   * options, a blurb, a hint); `call`, the call to act right now, inline,
   * bold, in the primary colour and blinking at the arcade rhythm (half a
   * second on, half off, no fade; steady under reduced motion; how low it
   * goes is `--blink-low`, 0.6 by default)
   * @default 'hint'
   */
  variant?: 'hint' | 'call';
}

/** A line of text by what it is for: a hint, or the call to act */
export const Text = ({
  variant = 'hint',
  className,
  style,
  children,
}: TextProps) => {
  const Tag = variant === 'call' ? 'span' : 'p';
  return (
    <Tag
      data-slot="text"
      className={styles.text({ variant, className })}
      style={style}
    >
      {children}
    </Tag>
  );
};
