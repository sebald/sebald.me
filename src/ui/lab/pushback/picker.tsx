'use client';

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { STAGE } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { useStage } from './stage';
import { Loud } from './text';
import { Window } from './window';

const pickerStyles = {
  root: cva({ base: 'flex min-h-0' }),
  menu: cva({
    base: [
      'grid min-h-0 flex-1 content-start gap-1 overflow-y-auto',
      // The native scrollbar is off: the pixel one beside it shows the rest
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    ],
  }),
  item: cva({
    base: [
      'flex w-full items-center gap-[calc(var(--px)*3)] px-[calc(var(--px)*2)] py-[0.15em] text-left',
      'cursor-pointer transition-colors duration-100',
      'outline-none focus-visible:ui-focus',
      'aria-disabled:cursor-default',
    ],
    variants: {
      selected: {
        true: 'text-white',
        false: 'text-(--pb-text-bright) hover:text-white',
      },
      accent: {
        true: 'text-(--pb-gold) hover:text-(--pb-gold-light)',
      },
    },
    compoundVariants: [
      { selected: true, accent: true, className: 'text-(--pb-gold-light)' },
    ],
    defaultVariants: { selected: false },
  }),
  /** The rail beside a list that does not fit: an arrow, a track, an arrow */
  rail: cva({
    base: 'ml-[calc(var(--px)*2)] flex w-[calc(var(--px)*5)] shrink-0 flex-col items-center',
  }),
  arrow: cva({
    base: 'h-[calc(var(--px)*3)] w-[calc(var(--px)*5)] shrink-0',
    variants: {
      up: {
        true: '[clip-path:polygon(50%_0,100%_100%,0_100%)]',
        false: '[clip-path:polygon(0_0,100%_0,50%_100%)]',
      },
      more: { true: 'bg-(--pb-text)', false: 'bg-(--pb-empty-dots)' },
    },
  }),
  track: cva({
    base: 'relative my-[var(--px)] w-[var(--px)] flex-1 bg-(--pb-empty-dots)',
  }),
  thumb: cva({ base: 'absolute inset-x-0 bg-(--pb-steel)' }),
  /** The description box beside the menu's window */
  note: cva({
    base: 'pointer-events-none absolute z-20 text-[0.8em] leading-[1.35] text-balance',
  }),
};

export interface PickerItem {
  id: string;
  label: React.ReactNode;
  /**
   * Shown, dimmed, and reachable by the cursor, but Enter does nothing:
   * nothing in a menu is hidden, so give it a `note` that says why
   */
  disabled?: boolean;
  /**
   * What it does, or why it is off: a small window of its own beside the
   * menu's, at the item's row, while the cursor is on it
   */
  note?: string;
  /** Opacity of the label, 1 by default (the buddy dims wrong counters) */
  dim?: number;
  /**
   * The loud one: in gold, blinking at the arcade rhythm (steady under
   * reduced motion). The closer on offer, which drops the mic.
   */
  accent?: boolean;
  onSelect: () => void;
  /** Left and right on it, for an item that is a setting (the mode) */
  onStep?: (step: 1 | -1) => void;
  /** A rule above it: the first of a group apart from the rest */
  divider?: boolean;
}

interface PickerProps {
  items: PickerItem[];
  /** The item selected at first, by id */
  initial?: string;
  /** Keyboard handling on (one menu at a time) */
  active?: boolean;
  label: string;
  /** On the list itself */
  className?: string;
}

/** What a list shows of itself: for the rail beside it */
export interface Scroll {
  top: number;
  height: number;
  view: number;
}

/**
 * Measures a scrolling element: on scroll, and whenever it or its
 * children resize. `key` changes when the children do.
 */
export const useScroll = (
  ref: RefObject<HTMLElement | null>,
  key: unknown,
): Scroll => {
  const [scroll, setScroll] = useState<Scroll>({ top: 0, height: 0, view: 0 });
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () =>
      setScroll(previous => {
        const next = {
          top: list.scrollTop,
          height: list.scrollHeight,
          view: list.clientHeight,
        };
        return previous.top === next.top &&
          previous.height === next.height &&
          previous.view === next.view
          ? previous
          : next;
      });
    measure();
    list.addEventListener('scroll', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const child of list.children) observer.observe(child);
    return () => {
      list.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [ref, key]);
  return scroll;
};

/** Whether a measured list has more than it shows */
export const overflows = (scroll: Scroll) => scroll.height > scroll.view + 1;

/** The rail beside a list that does not fit: an arrow lit where there is more, the track */
export const ScrollRail = ({ scroll }: { scroll: Scroll }) => (
  <div aria-hidden className={pickerStyles.rail()}>
    <span className={pickerStyles.arrow({ up: true, more: scroll.top > 1 })} />
    <span className={pickerStyles.track()}>
      <span
        className={pickerStyles.thumb()}
        style={{
          top: `${(scroll.top / scroll.height) * 100}%`,
          height: `${(scroll.view / scroll.height) * 100}%`,
        }}
      />
    </span>
    <span
      className={pickerStyles.arrow({
        up: false,
        more: scroll.top + scroll.view < scroll.height - 1,
      })}
    />
  </div>
);

/** The description box: its width, how far it reaches over the menu's window, the stage's margin */
const NOTE = { width: 72, overlap: 6, margin: 4 } as const;

interface NotePlace {
  root: HTMLElement;
  left: number;
  top: number;
}

/**
 * Where the description box goes, in stage pixels: beside the window the
 * list sits in, reaching a little over its frame, at the current row's
 * height; on the right, or on the left where the right has no room, and
 * kept on the stage either way. Rendered into the stage itself, over
 * everything, so no window it sits in can cut it off.
 */
const useNotePlace = (
  listRef: RefObject<HTMLUListElement | null>,
  index: number,
  scrollTop: number,
): NotePlace | null => {
  const { scale } = useStage();
  const [place, setPlace] = useState<NotePlace | null>(null);
  useLayoutEffect(() => {
    const row = listRef.current?.children[index] as HTMLElement | undefined;
    const section = row?.closest<HTMLElement>('[data-stage]');
    if (!row || !section) {
      setPlace(null);
      return;
    }
    // The stage's full area: inside the section, its first child (the
    // whole stage even when the section crops its top rows)
    const root =
      section.tagName === 'SECTION'
        ? ((section.firstElementChild as HTMLElement | null) ?? section)
        : section;
    const frame = row.closest<HTMLElement>('[data-window]') ?? row;
    const origin = root.getBoundingClientRect();
    const box = frame.getBoundingClientRect();
    const line = row.getBoundingClientRect();
    const toStage = (n: number) => Math.round(n / scale);
    const max = STAGE.width - NOTE.margin - NOTE.width;
    const onRight = toStage(box.right - origin.left) - NOTE.overlap;
    const onLeft = toStage(box.left - origin.left) + NOTE.overlap - NOTE.width;
    setPlace({
      root,
      left: onRight <= max ? onRight : onLeft >= NOTE.margin ? onLeft : max,
      top: Math.max(NOTE.margin, toStage(line.top - origin.top) - 4),
    });
  }, [listRef, index, scrollTop, scale]);
  return index < 0 ? null : place;
};

/**
 * A list the player moves through with the arrow keys (or W/S), confirms
 * with Enter or Space, and taps on touch. Disabled items are skipped;
 * an item with `onStep` takes left and right (or A/D) as well.
 * Given less room than its items need, the list scrolls, keeps the
 * current item in view, and shows a pixel rail beside it: an arrow lit
 * at each end where there is more, and a track with where the list is.
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
  const listRef = useRef<HTMLUListElement>(null);
  const scroll = useScroll(listRef, items.length);
  const overflow = overflows(scroll);

  useEffect(() => {
    if (!active) return;
    // Disabled items are stops too, so their note can say why
    const move = (step: number) =>
      setIndex(previous => (previous + step + items.length) % items.length);
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
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'd': {
          const item = items[current];
          if (item?.onStep && !item.disabled) {
            event.preventDefault();
            item.onStep(
              event.key === 'ArrowLeft' || event.key === 'a' ? -1 : 1,
            );
          }
          break;
        }
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

  // The current item stays in view; only a list that scrolls is moved,
  // so a short list never scrolls the page
  useEffect(() => {
    if (!overflow) return;
    listRef.current?.children[current]?.scrollIntoView({ block: 'nearest' });
  }, [current, overflow]);

  const note = active ? items[current]?.note : undefined;
  const place = useNotePlace(listRef, note ? current : -1, scroll.top);

  const list = (
    <div className={pickerStyles.root()}>
      <ul
        ref={listRef}
        className={pickerStyles.menu({ className })}
        aria-label={label}
      >
        {items.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              item.divider &&
                'mt-[calc(var(--px)*2)] border-t border-(--pb-frame-dim) pt-[calc(var(--px)*2)]',
            )}
          >
            <button
              type="button"
              aria-disabled={item.disabled || undefined}
              aria-current={i === current ? 'true' : undefined}
              className={pickerStyles.item({
                selected: i === current,
                accent: item.accent,
              })}
              onPointerEnter={() => setIndex(i)}
              onClick={() => {
                setIndex(i);
                if (!item.disabled) item.onSelect();
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
                className={cn(
                  'min-w-0 flex-1 transition-opacity duration-500',
                  item.disabled && 'opacity-40',
                )}
                style={
                  item.dim === undefined ? undefined : { opacity: item.dim }
                }
              >
                {/* The loud one blinks; the cursor beside it does not */}
                {item.accent ? (
                  <Loud className="text-inherit">{item.label}</Loud>
                ) : (
                  item.label
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {overflow && <ScrollRail scroll={scroll} />}
    </div>
  );
  return (
    <>
      {list}
      {note &&
        place &&
        createPortal(
          <Window
            className={pickerStyles.note()}
            style={{
              left: `calc(var(--px) * ${place.left})`,
              top: `calc(var(--px) * ${place.top})`,
              width: `calc(var(--px) * ${NOTE.width})`,
            }}
          >
            <p aria-live="polite" className="m-0">
              {note}
            </p>
          </Window>,
          place.root,
        )}
    </>
  );
};
