'use client';

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useInputKind } from '../../hooks/use-input-kind';
import { type Scroll, overflows, useScroll } from '../../hooks/use-scroll';
import { type Feedback, useFeedback } from '../../providers/feedback';
import { usePixels } from '../../providers/pixels';
import { cn } from '../../utils/styles';
import { Loud } from '../text/text';
import { Window } from '../window/window';
import { picker as styles } from './picker.styles';

export interface PickerItem {
  id: string;
  label: ReactNode;
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
  /** Opacity of the label, 1 by default (to dim a wrong choice) */
  dim?: number;
  /**
   * The loud one: in the primary colour, blinking at the arcade rhythm
   * (steady under reduced motion). The closer on offer.
   */
  accent?: boolean;
  onSelect: () => void;
  /** Left and right on it, for an item that is a setting */
  onStep?: (step: 1 | -1) => void;
  /** It leaves (Back, Cancel): it sounds like stepping back, not like confirming */
  back?: boolean;
  /** Room above it: the first of a group apart from the rest */
  apart?: boolean;
}

export interface PickerProps {
  items: PickerItem[];
  /** The item selected at first, by id; the first enabled one by default */
  initial?: string;
  /**
   * Keyboard handling on (one menu at a time)
   * @default true
   */
  active?: boolean;
  /** The list's accessible name */
  label: string;
  /**
   * The stage's width in stage pixels, for placing the description box;
   * measured from the stage when not given
   */
  stageWidth?: number;
  /** On the list itself */
  className?: string;
}

/** The rail beside a list that does not fit: an arrow lit where there is more, the track */
export const ScrollRail = ({
  scroll,
  className,
}: {
  scroll: Scroll;
  className?: string;
}) => (
  <div aria-hidden className={styles.rail({ className })}>
    <span className={styles.arrow({ up: true, more: scroll.top > 1 })} />
    <span className={styles.track()}>
      <span
        className={styles.thumb()}
        style={{
          top: `${(scroll.top / scroll.height) * 100}%`,
          height: `${(scroll.view / scroll.height) * 100}%`,
        }}
      />
    </span>
    <span
      className={styles.arrow({
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
  width: number;
}

/**
 * Where the description box goes, in stage pixels: beside the window the
 * list sits in, reaching a little over its frame, at the current row's
 * height; on the right, or on the left where the right has no room. A
 * window that fills the stage has no room on either side: there it goes
 * beside the list itself, inside the window, and is kept on the stage
 * either way. Rendered into the stage itself, over everything, so no
 * window it sits in can cut it off.
 */
const useNotePlace = (
  listRef: RefObject<HTMLUListElement | null>,
  index: number,
  scrollTop: number,
  stageWidth?: number,
): NotePlace | null => {
  const { scale, tall } = usePixels();
  const [place, setPlace] = useState<NotePlace | null>(null);
  useLayoutEffect(() => {
    const row = listRef.current?.children[index] as HTMLElement | undefined;
    const root = row?.closest<HTMLElement>('[data-stage]');
    if (!row || !root) {
      setPlace(null);
      return;
    }
    const frame = row.closest<HTMLElement>('[data-window]') ?? row;
    const origin = root.getBoundingClientRect();
    const line = row.getBoundingClientRect();
    const toStage = (n: number) => Math.round(n / scale);
    // Held upright the window is as wide as the stage: the box goes
    // under it, as wide as it
    if (tall) {
      const box = frame.getBoundingClientRect();
      setPlace({
        root,
        left: toStage(box.left - origin.left),
        top: toStage(box.bottom - origin.top) + NOTE.margin,
        width: toStage(box.width),
      });
      return;
    }
    const width = stageWidth ?? toStage(origin.width);
    const max = width - NOTE.margin - NOTE.width;
    const beside = (box: DOMRect, overlap: number) => {
      const onRight = toStage(box.right - origin.left) - overlap;
      const onLeft = toStage(box.left - origin.left) + overlap - NOTE.width;
      return onRight <= max
        ? onRight
        : onLeft >= NOTE.margin
          ? onLeft
          : undefined;
    };
    setPlace({
      root,
      left:
        beside(frame.getBoundingClientRect(), NOTE.overlap) ??
        beside(listRef.current!.getBoundingClientRect(), -NOTE.margin) ??
        max,
      top: Math.max(NOTE.margin, toStage(line.top - origin.top) - 4),
      width: NOTE.width,
    });
  }, [listRef, index, scrollTop, scale, tall, stageWidth]);
  return index < 0 ? null : place;
};

/** Pick an item, with its sound: a bump for one that is off */
const choose = (item: PickerItem, play: Feedback) => {
  if (item.disabled) {
    play('bump');
    return;
  }
  play(item.back ? 'back' : 'confirm');
  item.onSelect();
};

/**
 * A list the player moves through with the arrow keys (or W/S), confirms
 * with Enter or Space, and taps on touch. Disabled items are stops too
 * (so their note can say why) but bump when chosen; an item with
 * `onStep` takes left and right (or A/D) as well. Given less room than
 * its items need, the list scrolls, keeps the current item in view, and
 * shows a pixel rail beside it: an arrow lit at each end where there is
 * more, and a track with where the list is.
 */
export const Picker = ({
  items,
  initial,
  active = true,
  label,
  stageWidth,
  className,
}: PickerProps) => {
  const play = useFeedback();
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
    const move = (step: number) => {
      play('move');
      setIndex(previous => (previous + step + items.length) % items.length);
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
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'd': {
          const item = items[current];
          if (item?.onStep && !item.disabled) {
            event.preventDefault();
            play('move');
            item.onStep(
              event.key === 'ArrowLeft' || event.key === 'a' ? -1 : 1,
            );
          }
          break;
        }
        case 'Enter':
        case ' ': {
          const item = items[current];
          if (item) {
            event.preventDefault();
            choose(item, play);
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, items, current, play]);

  // The current item stays in view; only a list that scrolls is moved,
  // so a short list never scrolls the page
  useEffect(() => {
    if (!overflow) return;
    listRef.current?.children[current]?.scrollIntoView({ block: 'nearest' });
  }, [current, overflow]);

  const note = active ? items[current]?.note : undefined;
  // Under a finger there is no cursor to move, and a marked row would read
  // as chosen already: only the row a description is about is marked
  const touch = useInputKind() === 'touch';
  const marked = (i: number) => i === current && (!touch || Boolean(note));
  const place = useNotePlace(
    listRef,
    note ? current : -1,
    scroll.top,
    stageWidth,
  );

  return (
    <>
      <div className={styles.root()}>
        <ul
          ref={listRef}
          className={styles.menu({ className })}
          aria-label={label}
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn(item.apart && 'mt-[calc(var(--bui-px)*4)]')}
            >
              <button
                type="button"
                aria-disabled={item.disabled || undefined}
                aria-current={i === current ? 'true' : undefined}
                className={styles.item({
                  selected: marked(i),
                  accent: item.accent,
                })}
                onPointerEnter={() => setIndex(i)}
                onClick={() => {
                  setIndex(i);
                  choose(item, play);
                }}
              >
                <span
                  aria-hidden
                  className={styles.cursor({ shown: marked(i) })}
                />
                <span
                  className={styles.label({ disabled: item.disabled })}
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
      {note &&
        place &&
        createPortal(
          <Window
            className={styles.note()}
            style={{
              left: `calc(var(--px) * ${place.left})`,
              top: `calc(var(--px) * ${place.top})`,
              width: `calc(var(--px) * ${place.width})`,
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
