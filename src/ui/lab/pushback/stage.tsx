'use client';

import type { CSSProperties, PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { STAGE, fontSizeFor } from '@/lib/lab/pushback/stage';
import { cva } from '@/lib/styles.utils';

import { useScale } from './use-scale';

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      // The 480 by 270 stage at a whole-number scale, as a dark panel
      // until a scene lands; text is DOM in the site's mono font, like
      // the hotspot remarks, sized from the scale (so em units inside)
      'relative overflow-hidden rounded-2xl',
      'bg-mist-950 text-mist-100',
      '[text-shadow:0_1px_0_var(--color-mist-950)]',
      'select-none',
    ],
  }),
  portrait: cva({
    base: 'rounded-2xl bg-mist-950 p-6 text-center font-mono text-sm text-mist-200',
  }),
  center: cva({
    base: 'absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center',
  }),
  title: cva({
    base: 'text-[2em] font-semibold tracking-wide text-mist-50',
  }),
  muted: cva({ base: 'text-mist-400' }),
  box: cva({
    base: [
      // The dialogue box: over the floor strip, two rows of text
      'absolute inset-x-3 bottom-3 rounded-xl p-3',
      'bg-mist-900/90 ring-1 ring-mist-700',
    ],
  }),
  corner: cva({
    base: 'absolute top-3 right-3 flex gap-2',
  }),
  menu: cva({ base: 'grid gap-1' }),
  item: cva({
    base: [
      'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left',
      'cursor-pointer transition-colors duration-100',
      'outline-none focus-visible:ui-focus',
      'disabled:cursor-default disabled:opacity-40',
    ],
    variants: {
      selected: {
        true: 'bg-mist-100 text-mist-900',
        false: 'text-mist-200 hover:bg-mist-700/60',
      },
    },
    defaultVariants: { selected: false },
  }),
};

// Stage
// ---------------
interface StageProps extends PropsWithChildren {
  className?: string;
  label?: string;
  /** Fix the scale (the workbench) instead of fitting the viewport */
  scale?: number;
}

/**
 * The scaled stage every screen sits in: 480 by 270 times a whole number,
 * breaking out of the page column to the viewport's centre. Everything
 * inside positions in native pixels through `--px` and sizes text in em.
 */
export const Stage = ({
  children,
  className,
  label,
  scale: fixed,
}: StageProps) => {
  const { scale, portrait } = useScale(fixed);
  if (portrait && !fixed) {
    return (
      <section data-stage aria-label={label} className={styles.portrait()}>
        Turn your phone sideways: the stage is 480 pixels wide.
      </section>
    );
  }
  const width = STAGE.width * scale;
  const height = STAGE.height * scale;
  const style: CSSProperties = {
    width,
    height,
    marginInline: `calc(50% - ${width / 2}px)`,
    fontSize: fontSizeFor(scale),
    ['--px' as string]: `${scale}px`,
  };
  return (
    // `data-stage`: styles.css gives the stage normal leading back (the site
    // trims every text block to its cap height)
    <section
      data-stage
      aria-label={label ?? 'Pushback'}
      className={styles.root({ className })}
      style={style}
    >
      {children}
    </section>
  );
};

const Center = ({ children, className }: StageProps) => (
  <div className={styles.center({ className })}>{children}</div>
);

const Title = ({ children, className }: StageProps) => (
  <h2 className={styles.title({ className })}>{children}</h2>
);

const Muted = ({ children, className }: StageProps) => (
  <p className={styles.muted({ className })}>{children}</p>
);

const Box = ({ children, className }: StageProps) => (
  <div className={styles.box({ className })}>{children}</div>
);

const Corner = ({ children, className }: StageProps) => (
  <div className={styles.corner({ className })}>{children}</div>
);

Stage.Center = Center;
Stage.Title = Title;
Stage.Muted = Muted;
Stage.Box = Box;
Stage.Corner = Corner;

// Menu
// ---------------
export interface MenuItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  /** Opacity of the label, 1 by default (the buddy dims wrong counters) */
  dim?: number;
  onSelect: () => void;
}

interface MenuProps {
  items: MenuItem[];
  /** The item selected at first, by id */
  initial?: string;
  /** Keyboard handling on (one menu at a time) */
  active?: boolean;
  label: string;
  className?: string;
}

/**
 * A list the player moves through with the arrow keys (or W/S), confirms
 * with Enter or Space, and taps on touch. Disabled items are skipped.
 */
export const Menu = ({
  items,
  initial,
  active = true,
  label,
  className,
}: MenuProps) => {
  const firstEnabled = Math.max(
    0,
    items.findIndex(item => (initial ? item.id === initial : !item.disabled)),
  );
  const [index, setIndex] = useState(firstEnabled);
  const current = Math.min(index, items.length - 1);

  useEffect(() => {
    if (!active) return;
    const move = (step: number) => {
      setIndex(previous => {
        let next = previous;
        for (let i = 0; i < items.length; i++) {
          next = (next + step + items.length) % items.length;
          if (!items[next]?.disabled) return next;
        }
        return previous;
      });
    };
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 's':
          event.preventDefault();
          move(1);
          break;
        case 'ArrowUp':
        case 'w':
          event.preventDefault();
          move(-1);
          break;
        case 'Enter':
        case ' ': {
          const item = items[current];
          if (item && !item.disabled) {
            event.preventDefault();
            item.onSelect();
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, items, current]);

  return (
    <ul className={styles.menu({ className })} aria-label={label}>
      {items.map((item, i) => (
        <li key={item.id}>
          <button
            type="button"
            disabled={item.disabled}
            aria-current={i === current ? 'true' : undefined}
            className={styles.item({ selected: i === current })}
            onPointerEnter={() => !item.disabled && setIndex(i)}
            onClick={() => {
              setIndex(i);
              item.onSelect();
            }}
          >
            <span aria-hidden className="w-3 shrink-0">
              {i === current ? '›' : ''}
            </span>
            <span
              className="min-w-0 flex-1 transition-opacity duration-500"
              style={item.dim === undefined ? undefined : { opacity: item.dim }}
            >
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
