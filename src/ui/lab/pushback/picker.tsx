'use client';

import { useEffect, useState } from 'react';

import { cn, cva } from '@/lib/styles.utils';

const pickerStyles = {
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

export interface PickerItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  /** Opacity of the label, 1 by default (the buddy dims wrong counters) */
  dim?: number;
  onSelect: () => void;
}

interface PickerProps {
  items: PickerItem[];
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
export const Picker = ({
  items,
  initial,
  active = true,
  label,
  className,
}: PickerProps) => {
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
    <ul className={pickerStyles.menu({ className })} aria-label={label}>
      {items.map((item, i) => (
        <li key={item.id}>
          <button
            type="button"
            disabled={item.disabled}
            aria-current={i === current ? 'true' : undefined}
            className={pickerStyles.item({ selected: i === current })}
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
                'h-[calc(var(--px)*5)] w-[calc(var(--px)*3)] shrink-0 bg-current',
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
