'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { createContext, useContext, useEffect, useRef } from 'react';

import { CORNERS, rounded } from '../../foundations/corners';
import { useFeedback } from '../../providers/feedback';
import { cn } from '../../utils/styles';
import { Step } from '../setting/setting';
import { WindowFrame } from '../window/window';
import { tabs as styles } from './tabs.styles';

/**
 * The next or previous tab that can be picked, round past the ends, as
 * a click on it; nothing when there is none
 */
const stepTab = (root: Element | null, by: number) => {
  if (!root) return false;
  const list = [
    ...root.querySelectorAll<HTMLElement>('[role=tab]:not([disabled])'),
  ];
  const at = list.findIndex(tab => tab.ariaSelected === 'true');
  const next = list[(at + by + list.length) % list.length];
  if (!next) return false;
  next.click();
  return true;
};

type Variant = 'plain' | 'window';

/** The set's look, for its list, tabs and panels */
const VariantContext = createContext<Variant>('plain');

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
  /**
   * `plain`, text tabs over the panel; `window`, a window with pages: the
   * panel is the window, the tabs hang from its top left as folder tabs,
   * with arrows that switch them
   * @default 'plain'
   */
  variant?: Variant;
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
  variant = 'plain',
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
      if (!by) return;
      // A focused tab handles the arrows itself
      if ((event.target as Element | null)?.closest('[role=tablist]')) return;
      if (stepTab(ref.current, by)) event.preventDefault();
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
      <VariantContext value={variant}>{children}</VariantContext>
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
export const TabList = ({ className, ...props }: TabListProps) => {
  const on = useContext(VariantContext);
  const ref = useRef<HTMLDivElement>(null);
  const list = (
    <BaseTabs.List
      className={styles.list({
        on,
        className: on === 'plain' ? className : undefined,
      })}
      {...props}
    />
  );
  if (on === 'plain') return list;
  // For a pointer; the keys switch the tabs already
  const arrow = (by: -1 | 1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      className={styles.arrow()}
      onClick={() => stepTab(ref.current, by)}
    >
      <Step left={by < 0} />
    </button>
  );
  return (
    <div ref={ref} className={styles.row({ className })}>
      {arrow(-1)}
      {list}
      {arrow(1)}
    </div>
  );
};

export interface TabProps extends Omit<
  BaseTabs.Tab.Props,
  'className' | 'render'
> {
  className?: string;
}

/** The rings of a window tab, as the window's: ink, frame, inner line */
const RINGS = ['var(--bui-ink)', 'var(--t-frame)', 'var(--t-inner)'];

/**
 * The feet's pixels, three by three, the left one: the frame's row, the
 * inner line's and the light row, each run on under the tab's columns
 * to where it turns up (the inner line's column on the frame's row)
 */
const foot = (side: 'left' | 'right') => ({
  [side]: 0,
  background: [
    `linear-gradient(var(--bui-frame-inner), var(--bui-frame-inner)) ${side === 'left' ? 'right' : 'left'} top / calc(100% / 3) calc(100% / 3) no-repeat`,
    'linear-gradient(to bottom, var(--bui-frame) calc(100% / 3), var(--bui-frame-inner) 0 calc(200% / 3), var(--bui-surface-light) 0)',
  ].join(', '),
});

/** One tab; its `value` names the `TabPanel` it shows */
export const Tab = ({ className, children, ...props }: TabProps) => {
  const on = useContext(VariantContext);
  if (on === 'plain')
    return (
      <BaseTabs.Tab className={cn(styles.tab({ on }), className)} {...props}>
        {children}
      </BaseTabs.Tab>
    );
  return (
    <BaseTabs.Tab className={cn(styles.tab({ on }), className)} {...props}>
      {RINGS.map((colour, i) => (
        <span
          key={colour}
          aria-hidden
          className={styles.ring()}
          style={{
            inset: `calc(var(--px) * ${i}) calc(var(--px) * ${i}) 0`,
            backgroundColor: colour,
            clipPath: rounded(CORNERS[i]!, '--px', 'top'),
          }}
        />
      ))}
      <span
        aria-hidden
        className={styles.face()}
        style={{ inset: 'var(--t-ring) var(--t-ring) 0' }}
      />
      <span aria-hidden className={styles.foot()} style={foot('left')} />
      <span aria-hidden className={styles.foot()} style={foot('right')} />
      <span className={styles.label()}>{children}</span>
    </BaseTabs.Tab>
  );
};

export interface TabPanelProps extends Omit<
  BaseTabs.Panel.Props,
  'className' | 'render'
> {
  className?: string;
}

/**
 * What a tab shows, by the same `value`. In a `window` set it is the
 * window: a `Legend` last in it sits along the window's bottom edge
 */
export const TabPanel = ({ className, children, ...props }: TabPanelProps) => {
  const on = useContext(VariantContext);
  if (on === 'plain')
    return (
      <BaseTabs.Panel className={styles.panel({ className })} {...props}>
        {children}
      </BaseTabs.Panel>
    );
  return (
    <BaseTabs.Panel className={styles.panel({ on })} {...props}>
      <WindowFrame className={cn('min-h-0 flex-1', className)}>
        {children}
      </WindowFrame>
    </BaseTabs.Panel>
  );
};
