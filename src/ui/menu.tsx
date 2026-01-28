'use client';

import { Menu as Primitive } from '@base-ui/react/menu';
import type { MenuRootProps as PrimitiveRootProps } from '@base-ui/react/menu';
import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';

// Styles
// ---------------
export const styles = {
  trigger: buttonStyles,
  positioner: cva({
    base: ['z-100'],
  }),
  popup: cva({
    base: [
      'ui-panel',
      'p-1.5',
      'min-w-40',
      'transition-all duration-150',
      'data-starting-style:opacity-0 data-starting-style:scale-95',
      'data-ending-style:opacity-0 data-ending-style:scale-95',
    ],
  }),
  item: cva({
    base: [
      'flex items-center gap-2 px-3 py-2 rounded-lg',
      'text-mist-200 text-sm',
      'cursor-pointer outline-none',
      'transition-colors duration-100',
      'data-highlighted:bg-mist-500/25',
      'data-disabled:opacity-40 data-disabled:cursor-default',
    ],
  }),
  separator: cva({
    base: ['h-px my-1.5 bg-mist-500/25'],
  }),
};

// Menu.Root
// ---------------
const MenuRoot = ({ children, ...props }: PrimitiveRootProps) => (
  <Primitive.Root {...props}>{children}</Primitive.Root>
);

// Menu.Trigger
// ---------------
export interface MenuTriggerProps
  extends
    ComponentProps<typeof Primitive.Trigger>,
    VariantProps<typeof styles.trigger> {}

const MenuTrigger = ({ children, variant, ...props }: MenuTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger({ variant })}>
    {children}
  </Primitive.Trigger>
);

// Menu (Popup)
// ---------------
export interface MenuPopupProps
  extends ComponentProps<typeof Primitive.Popup> {}

const MenuPopup = ({ children, ...props }: MenuPopupProps) => (
  <Primitive.Portal>
    <Primitive.Positioner
      className={styles.positioner()}
      side="bottom"
      align="start"
      sideOffset={4}
    >
      <Primitive.Popup {...props} className={styles.popup()}>
        {children}
      </Primitive.Popup>
    </Primitive.Positioner>
  </Primitive.Portal>
);

// Menu.Item
// ---------------
export interface MenuItemProps
  extends ComponentProps<typeof Primitive.Item> {}

const MenuItem = ({ children, ...props }: MenuItemProps) => (
  <Primitive.Item {...props} className={styles.item()}>
    {children}
  </Primitive.Item>
);

// Menu.Separator
// ---------------
export interface MenuSeparatorProps
  extends ComponentProps<typeof Primitive.Separator> {}

const MenuSeparator = (props: MenuSeparatorProps) => (
  <Primitive.Separator {...props} className={styles.separator()} />
);

// Menu API
// ---------------
export const Menu = Object.assign(MenuPopup, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Item: MenuItem,
  Separator: MenuSeparator,
});
