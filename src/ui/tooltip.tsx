'use client';

import { Tooltip as Primitive } from '@base-ui/react/tooltip';
import type {
  TooltipProviderProps as PrimitiveProviderProps,
  TooltipRootProps as PrimitiveRootProps,
} from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';

import { cva, mergeClassName } from '@/lib/styles.utils';

// Styles
// ---------------
export const styles = {
  positioner: cva({
    base: ['z-100'],
  }),
  popup: cva({
    base: [
      'max-w-64 px-2.5 py-1.5 rounded-lg',
      'bg-mist-800 border border-mist-500/25 shadow-lg',
      'text-mist-200 text-xs',
      'origin-(--transform-origin)',
      'transition-all duration-150',
      'data-starting-style:opacity-0 data-starting-style:scale-95',
      'data-ending-style:opacity-0 data-ending-style:scale-95',
      // Adjacent tooltips open instantly, so skip the animation too
      'data-instant:transition-none',
    ],
  }),
};

// Tooltip.Provider
// ---------------
// Groups tooltips, once one is open its neighbours open without delay
const TooltipProvider = ({ children, ...props }: PrimitiveProviderProps) => (
  <Primitive.Provider {...props}>{children}</Primitive.Provider>
);

// Tooltip.Root
// ---------------
const TooltipRoot = ({ children, ...props }: PrimitiveRootProps) => (
  <Primitive.Root {...props}>{children}</Primitive.Root>
);

// Tooltip.Trigger
// ---------------
// Unstyled, use `render` to attach the tooltip to an existing control, e.g.
// `<Tooltip.Trigger render={<Button variant="icon" aria-label="…" />}>`.
// Tooltips are visual only: they don't show on touch and screen readers don't
// announce them. The trigger needs its own accessible name (`aria-label` for
// icon buttons), never put essential information only in the tooltip.
export interface TooltipTriggerProps extends ComponentProps<
  typeof Primitive.Trigger
> {}

const TooltipTrigger = ({ children, ...props }: TooltipTriggerProps) => (
  <Primitive.Trigger {...props}>{children}</Primitive.Trigger>
);

// Tooltip (Popup)
// ---------------
export interface TooltipPopupProps extends ComponentProps<
  typeof Primitive.Popup
> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const TooltipPopup = ({
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  className,
  ...props
}: TooltipPopupProps) => (
  <Primitive.Portal>
    <Primitive.Positioner
      className={styles.positioner()}
      side={side}
      align={align}
      sideOffset={sideOffset}
    >
      <Primitive.Popup
        {...props}
        className={mergeClassName(styles.popup(), className)}
      >
        {children}
      </Primitive.Popup>
    </Primitive.Positioner>
  </Primitive.Portal>
);

// Tooltip API
// ---------------
export const Tooltip = Object.assign(TooltipPopup, {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
});

// Individual exports for server component compatibility
export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipPopup };
