'use client';

import type { CSSProperties, ReactNode } from 'react';

import { px } from '../../foundations/pixel';
import { useInputKind } from '../../hooks/use-input-kind';
import { usePixels } from '../../providers/pixels';
import { cn } from '../../utils/styles';
import { controls } from './controls.styles';

export interface ControlsProps {
  /**
   * The buttons at the start: the top left corner of the wide stage, the
   * left of the bar on the tall one. Usually Back or Pause
   */
  start?: ReactNode;
  /**
   * The buttons at the end: the top right corner, the right of the bar.
   * Usually the sound and fullscreen
   */
  end?: ReactNode;
  /**
   * On the wide stage: show the corners for touch only (the keyboard has
   * its keys), or on every input. The tall bar always shows
   * @default 'touch'
   */
  show?: 'touch' | 'always';
  /**
   * On the wide stage, put `start` in the middle of the top at this row
   * (stage pixels) instead of in the corner, where a game's corners hold
   * something else
   */
  startAt?: number;
  className?: string;
}

/**
 * The touch versions of a game's keys. On the tall stage a bar along the
 * bottom, `--bui-bar` tall and sized for a thumb: `start` on the left,
 * `end` on the right. On a wide stage, for touch, small pixel buttons in
 * the corners. Pass `IconButton`s and `IconToggle`s; give them
 * `variant="bar"` for the bar.
 *
 * Controls knows no keys. The game binds Esc and M (see `useKeys`) and
 * its buttons call the same actions.
 */
export const Controls = ({
  start,
  end,
  show = 'touch',
  startAt,
  className,
}: ControlsProps) => {
  const { tall } = usePixels();
  const kind = useInputKind();

  if (tall) {
    return (
      <div className={controls.bar({ className })}>
        {start ? <span className={controls.slot()}>{start}</span> : <span />}
        {end && <span className={controls.slot()}>{end}</span>}
      </div>
    );
  }

  if (show === 'touch' && kind !== 'touch') return null;
  const startStyle: CSSProperties =
    startAt === undefined
      ? { top: px(5), left: px(5) }
      : { top: px(startAt), left: '50%' };
  return (
    <>
      {start && (
        <span
          className={controls.corner({
            className: cn(
              startAt !== undefined && '-translate-x-1/2',
              className,
            ),
          })}
          style={startStyle}
        >
          {start}
        </span>
      )}
      {end && (
        <span
          className={controls.corner({ className })}
          style={{ top: px(5), right: px(5) }}
        >
          {end}
        </span>
      )}
    </>
  );
};
