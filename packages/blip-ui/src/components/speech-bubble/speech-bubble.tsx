import type { CSSProperties, HTMLAttributes } from 'react';

import { CORNERS, rounded } from '../../foundations/corners';
import { px } from '../../foundations/pixel';
import { speechBubble } from './speech-bubble.styles';

/** The tail's rows from its tip: an ink outline, then the paper inside */
const TAIL = [0, 1, 2, 3, 4];

/** How far the tail's tip reaches past the bubble's edge, in stage pixels */
export const TAIL_REACH = TAIL.length;

export interface SpeechBubbleProps extends HTMLAttributes<HTMLParagraphElement> {
  /**
   * The edge the tail sits on: `top` points up to a speaker above, `bottom`
   * down to one below
   * @default 'top'
   */
  side?: 'top' | 'bottom';
  /**
   * The corner the tail is measured from: `end` is the right edge, `start`
   * the left
   * @default 'end'
   */
  align?: 'start' | 'end';
  /**
   * How far the tail's centre sits from that edge, in stage pixels
   * @default 10
   */
  offset?: number;
}

/**
 * A comic speech bubble on the stage's pixel grid: paper, ink letters, an
 * ink outline with stepped corners, a row of dithered shade along the
 * bottom and a stair-stepped tail pointing to whoever is speaking. The tail
 * reaches `TAIL_REACH` stage pixels past the edge, leave room for it.
 */
export const SpeechBubble = ({
  side = 'top',
  align = 'end',
  offset = 10,
  className,
  style,
  children,
  ...props
}: SpeechBubbleProps) => {
  // The tail's rows count from its tip, at the top or the bottom edge
  const along = align === 'end' ? 'right' : 'left';
  return (
    <p
      data-slot="speech-bubble"
      className={speechBubble.root({ className })}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className={speechBubble.ink()}
        style={{ clipPath: rounded(CORNERS[1]) }}
      />
      <span
        aria-hidden
        className={speechBubble.paper()}
        style={{
          clipPath: rounded(CORNERS[2]),
          background: `repeating-conic-gradient(var(--bui-paper-shade) 0 25%, var(--bui-paper) 0 50%) left bottom / ${px(2)} ${px(2)} repeat-x, var(--bui-paper)`,
          backgroundSize: `${px(2)} ${px(2)}, auto`,
        }}
      />
      {/* The tail: ink rows widening from the tip, paper rows inside them,
        the last paper row cutting the outline where they meet */}
      {TAIL.map(row => (
        <span
          key={`ink-${row}`}
          aria-hidden
          className={speechBubble.tailInk()}
          style={
            {
              [along]: px(offset - row),
              [side]: px(row - 5),
              width: px(row * 2 + 1),
            } as CSSProperties
          }
        />
      ))}
      {TAIL.slice(0, 4).map(row => (
        <span
          key={`paper-${row}`}
          aria-hidden
          className={speechBubble.tailPaper()}
          style={
            {
              [along]: px(offset - row),
              [side]: px(row - 3),
              width: px(row * 2 + 1),
              height: px(row === 3 ? 2 : 1),
            } as CSSProperties
          }
        />
      ))}
      <span className={speechBubble.text()}>{children}</span>
    </p>
  );
};
