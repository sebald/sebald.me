'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useEffect, useRef } from 'react';

import { useFeedback } from '../../providers/feedback';
import { cn } from '../../utils/styles';
import { tabs as styles } from './tabs.styles';

export interface TabsProps extends Omit<
  BaseTabs.Root.Props,
  'className' | 'render' | 'onValueChange'
> {
  /** The active tab's value (controlled) */
  value?: BaseTabs.Tab.Value;
  /** The tab active at first (uncontrolled); the first one by default */
  defaultValue?: BaseTabs.Tab.Value;
  onValueChange?: (value: BaseTabs.Tab.Value) => void;
  /**
   * Left and right (or A and D) switch the tab from anywhere on the
   * screen, as in a game where no tab has focus; they wrap around.
   * Arrow keys on a focused tab work either way.
   * @default false
   */
  keys?: boolean;
  className?: string;
}

/**
 * Tabs for a screen with pages: a row of tabs, the active one underlined
 * in the primary colour, and a panel under it. Built on Base UI's Tabs
 * (roles, focus, arrow keys); `keys` adds the game's global left and
 * right.
 */
export const Tabs = ({
  keys = false,
  className,
  onValueChange,
  children,
  ...props
}: TabsProps) => {
  const play = useFeedback();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!keys) return;
    const onKey = (event: KeyboardEvent) => {
      const by =
        event.key === 'ArrowLeft' || event.key === 'a'
          ? -1
          : event.key === 'ArrowRight' || event.key === 'd'
            ? 1
            : 0;
      const root = ref.current;
      if (!by || !root) return;
      // A focused tab handles the arrows itself
      if ((event.target as Element | null)?.closest('[role=tablist]')) return;
      const list = [
        ...root.querySelectorAll<HTMLElement>('[role=tab]:not([disabled])'),
      ];
      const at = list.findIndex(tab => tab.ariaSelected === 'true');
      const next = list[(at + by + list.length) % list.length];
      if (!next) return;
      event.preventDefault();
      next.click();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys]);
  return (
    <BaseTabs.Root
      ref={ref}
      className={styles.root({ className })}
      onValueChange={value => {
        play('move');
        onValueChange?.(value);
      }}
      {...props}
    >
      {children}
    </BaseTabs.Root>
  );
};

export interface TabListProps extends Omit<
  BaseTabs.List.Props,
  'className' | 'render'
> {
  className?: string;
}

/** The row of tabs; give it an accessible name with `aria-label` */
export const TabList = ({ className, ...props }: TabListProps) => (
  <BaseTabs.List className={styles.list({ className })} {...props} />
);

export interface TabProps extends Omit<
  BaseTabs.Tab.Props,
  'className' | 'render'
> {
  className?: string;
}

/** One tab; its `value` names the `TabPanel` it shows */
export const Tab = ({ className, ...props }: TabProps) => (
  <BaseTabs.Tab className={cn(styles.tab(), className)} {...props} />
);

export interface TabPanelProps extends Omit<
  BaseTabs.Panel.Props,
  'className' | 'render'
> {
  className?: string;
}

/** What a tab shows, by the same `value` */
export const TabPanel = ({ className, ...props }: TabPanelProps) => (
  <BaseTabs.Panel className={styles.panel({ className })} {...props} />
);
