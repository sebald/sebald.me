'use client';

import { type HTMLAttributes, useEffect, useRef } from 'react';

import { useFeedback } from '../../providers/feedback';
import { typewriter } from './typewriter.styles';

export interface TypewriterProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** The whole line */
  children: string;
  /** How many of its characters are typed so far, clamped to the line */
  typed: number;
  /**
   * Play `type` through `useFeedback()` with the text each step adds
   * @default false
   */
  sound?: boolean;
}

/**
 * A line typing itself out, the way a game's dialogue does. The rest of
 * the line holds its room, unseen, so the text never rewraps or grows its
 * box as it types. It is controlled: you own the clock, pass how much is
 * `typed`, and pass the whole line under reduced motion.
 */
export const Typewriter = ({
  children,
  typed,
  sound = false,
  className,
  ...props
}: TypewriterProps) => {
  const play = useFeedback();
  const shown = Math.max(0, Math.min(children.length, Math.floor(typed)));
  // What was typed before this render: a new line starts from nothing,
  // one already on screen when this mounts makes no sound for it
  const before = useRef({ line: children, shown });
  useEffect(() => {
    const last = before.current;
    const from = last.line === children ? last.shown : 0;
    before.current = { line: children, shown };
    if (sound && shown > from) play('type', children.slice(from, shown));
  }, [sound, children, shown, play]);
  return (
    <span
      data-slot="typewriter"
      className={typewriter.root({ className })}
      {...props}
    >
      {children.slice(0, shown)}
      {shown < children.length && (
        <span className={typewriter.rest()}>{children.slice(shown)}</span>
      )}
    </span>
  );
};
