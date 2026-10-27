'use client';

import type { CSSProperties, FocusEvent, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

import { STAGE, fontSizeFor } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { useScale } from './use-scale';

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      // The 320 by 214 stage at its scale, the panel's dark ground until
      // a scene lands; text is DOM in the site's mono font, like the
      // hotspot remarks, sized from the scale (so em units inside), smooth
      // and without a shadow
      'relative overflow-hidden outline-none',
      'bg-[#07080d] text-[#c9c4b4]',
      'select-none',
    ],
  }),
  portrait: cva({
    base: 'bg-[#07080d] p-6 text-center font-mono text-sm text-[#c9c4b4]',
  }),
  center: cva({
    base: 'absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center',
  }),
  title: cva({
    base: 'text-[2em] font-semibold tracking-wide text-[#f3eedc]',
  }),
  muted: cva({ base: 'text-[#8a92b8]' }),
  box: cva({
    base: [
      // A window like the duel's panel, for the menu screens
      'absolute inset-x-3 bottom-3 p-3',
      'bg-[#131829] ring-[length:var(--px)] ring-[#b7b09d] shadow-[0_0_0_calc(var(--px)*2)_#0b0d16]',
    ],
  }),
  corner: cva({
    base: 'absolute top-3 right-3 flex gap-2',
  }),
  menu: cva({ base: 'grid gap-1' }),
  item: cva({
    base: [
      'flex w-full items-center gap-[calc(var(--px)*3)] px-[calc(var(--px)*2)] py-[0.15em] text-left',
      'cursor-pointer transition-colors duration-100',
      'outline-none focus-visible:ui-focus',
      'disabled:cursor-default disabled:opacity-40',
    ],
    variants: {
      selected: {
        true: 'text-white',
        false: 'text-[#d6d1c2] hover:text-white',
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
  /** Crop this many rows off the top (the duel's frame in a short window) */
  crop?: number;
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
  crop = 0,
}: StageProps) => {
  const { scale, portrait } = useScale(fixed);
  const ref = useRef<HTMLElement>(null);
  // Focusing the game (a tap on it, or focus arriving from the page)
  // centres the stage in the viewport
  const centre = () =>
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (fixed) return;
    const from = event.relatedTarget as Node | null;
    if (!from || !ref.current?.contains(from)) centre();
  };
  const onPointerDown = () => {
    if (fixed) return;
    const active = document.activeElement;
    if (!active || !ref.current?.contains(active)) ref.current?.focus();
  };
  if (portrait && !fixed) {
    return (
      <section data-stage aria-label={label} className={styles.portrait()}>
        Turn your phone sideways: the stage needs 360 pixels.
      </section>
    );
  }
  const width = STAGE.width * scale;
  const height = (STAGE.height - crop) * scale;
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
      ref={ref}
      data-stage
      tabIndex={-1}
      aria-label={label ?? 'Pushback'}
      className={styles.root({ className })}
      style={style}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
    >
      {/* The full stage, its top rows above the section when cropped */}
      <div
        className="absolute inset-x-0"
        style={{ top: -crop * scale, height: STAGE.height * scale }}
      >
        {children}
      </div>
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
            {/* The cursor: a pixel triangle on the stage's grid */}
            <span
              aria-hidden
              className={cn(
                'h-[calc(var(--px)*7)] w-[calc(var(--px)*4)] shrink-0 bg-current',
                '[clip-path:polygon(0_0,100%_50%,0_100%)]',
                i === current ? 'opacity-100' : 'opacity-0',
              )}
            />
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
