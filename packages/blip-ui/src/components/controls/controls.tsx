'use client';

import { type ReactNode, createContext } from 'react';

import { useInputKind } from '../../hooks/use-input-kind';
import { usePixels } from '../../providers/pixels';
import { controls } from './controls.styles';

type Layout = 'bar' | 'corner';

/**
 * How the controls are laid out, for the buttons in them: in the tall
 * stage's bar, or in the wide stage's corners (also a button outside
 * `Controls`)
 */
export const ControlsLayout = createContext<Layout>('corner');

export interface ControlsProps {
  /**
   * Its buttons (`IconButton`, `IconToggle`), each with the `slot` it
   * fills: `leave` (Back, Pause) or `system` (the sound, fullscreen)
   */
  children: ReactNode;
  /**
   * On the wide stage: show the corners for touch only (the keyboard has
   * its keys), or on every input. The tall bar always shows
   * @default 'touch'
   */
  show?: 'touch' | 'always';
  className?: string;
}

/**
 * The touch versions of a game's keys. Each button says what it is by
 * its `slot`, and Controls places it: what leaves (`leave`: Back, Pause)
 * at the start, the game's switches (`system`: the sound, fullscreen) at
 * the end. On the tall stage a bar along the bottom, `--bui-bar` tall and
 * sized for a thumb; on a wide stage, for touch, small pixel buttons in
 * the top corners. The buttons take their look from where they are.
 *
 * Controls knows no keys. The game binds Esc and M (see `useKeys`) and
 * its buttons call the same actions.
 */
export const Controls = ({
  children,
  show = 'touch',
  className,
}: ControlsProps) => {
  const { tall } = usePixels();
  const kind = useInputKind();
  const layout: Layout = tall ? 'bar' : 'corner';
  if (layout === 'corner' && show === 'touch' && kind !== 'touch') return null;
  return (
    <ControlsLayout value={layout}>
      <div
        data-slot="controls"
        data-layout={layout}
        className={controls.root({ layout, className })}
      >
        {children}
      </div>
    </ControlsLayout>
  );
};
