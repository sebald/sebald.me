'use client';

import {
  Children,
  type ReactNode,
  type RefObject,
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { focusTakes, useOnTop } from '../../hooks/key-layer';
import { useInputKind } from '../../hooks/use-input-kind';
import { type Scroll, overflows, useScroll } from '../../hooks/use-scroll';
import { type Feedback, useFeedback } from '../../providers/feedback';
import { usePixels } from '../../providers/pixels';
import { Setting } from '../setting/setting';
import { Text } from '../text/text';
import { Window } from '../window/window';
import { picker as styles } from './picker.styles';

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
 * list sits in, reaching a little over its frame, at the row's height;
 * on the right, or on the left where the right has no room. A window
 * that fills the stage has no room on either side: there it goes beside
 * the list itself, inside the window, and is kept on the stage either
 * way. Rendered into the stage itself, over everything, so no window it
 * sits in can cut it off.
 */
const useNotePlace = (
  rowRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLUListElement | null>,
  shown: boolean,
  scrollTop: number,
  stageWidth?: number,
): NotePlace | null => {
  const { scale, tall } = usePixels();
  const [place, setPlace] = useState<NotePlace | null>(null);
  useLayoutEffect(() => {
    const row = shown ? rowRef.current : null;
    const root = row?.closest<HTMLElement>('[data-stage]');
    if (!row || !root) {
      setPlace(null);
      return;
    }
    const frame = row.closest<HTMLElement>('[data-slot=window]') ?? row;
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
        (listRef.current &&
          beside(listRef.current.getBoundingClientRect(), -NOTE.margin)) ??
        max,
      top: Math.max(NOTE.margin, toStage(line.top - origin.top) - 4),
      width: NOTE.width,
    });
  }, [rowRef, listRef, shown, scrollTop, scale, tall, stageWidth]);
  return shown ? place : null;
};

/** What an item gives the picker, for the keys */
interface Entry {
  disabled: boolean;
  variant: ItemVariant;
  onSelect: () => void;
  onStep?: (step: 1 | -1) => void;
}

interface PickerContextValue {
  current: string | undefined;
  setCurrent: (id: string) => void;
  /** Pick an item, with its sound: a bump for one that is off */
  choose: (entry: Entry) => void;
  entries: Map<string, Entry>;
  active: boolean;
  touch: boolean;
  overflow: boolean;
  scrollTop: number;
  stageWidth?: number;
  listRef: RefObject<HTMLUListElement | null>;
}

const PickerContext = createContext<PickerContextValue | null>(null);

const usePicker = () => {
  const context = use(PickerContext);
  if (!context) throw new Error('A PickerItem goes in a Picker');
  return context;
};

const choose = (entry: Entry, play: Feedback) => {
  if (entry.disabled) {
    play('bump');
    return;
  }
  play(entry.variant === 'back' ? 'back' : 'confirm');
  entry.onSelect();
};

export interface PickerProps {
  /** Its items: `PickerItem`s and `PickerSetting`s, in `PickerGroup`s where they belong together */
  children: ReactNode;
  /** The item the cursor is on at first, by id; the first enabled one by default */
  initial?: string;
  /**
   * Keyboard handling on (one menu at a time on a layer; a `Dialog` over
   * it takes the keys by itself)
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

/**
 * A list the player moves through with the arrow keys (or W/S), confirms
 * with Enter or Space, and taps on touch, built from `PickerItem`s and
 * `PickerSetting`s. Disabled items are stops too (so their note can say
 * why) but bump when chosen; a setting takes left and right (or A/D) as
 * well. Given less room than its items need, the list scrolls, keeps the
 * current item in view, and shows a pixel rail beside it: an arrow lit
 * at each end where there is more, and a track with where the list is.
 */
export const Picker = ({
  children,
  initial,
  active = true,
  label,
  stageWidth,
  className,
}: PickerProps) => {
  const play = useFeedback();
  const [current, setCurrent] = useState<string | undefined>(initial);
  const [entries] = useState(() => new Map<string, Entry>());
  const listRef = useRef<HTMLUListElement>(null);
  const scroll = useScroll(listRef, Children.count(children));
  const overflow = overflows(scroll);
  const touch = useInputKind() === 'touch';
  const onTop = useOnTop();

  /** The items' ids in the order the list shows them */
  const order = () =>
    [
      ...(listRef.current?.querySelectorAll<HTMLElement>(
        '[data-slot=picker-item]',
      ) ?? []),
    ].map(row => row.dataset.id!);

  // The cursor on an item that is there: the first enabled one at first,
  // and again when its item goes
  useLayoutEffect(() => {
    const ids = order();
    if (current !== undefined && ids.includes(current)) return;
    const first = ids.find(id => !entries.get(id)?.disabled) ?? ids[0];
    // The items' order is the DOM's, which is there only after a render:
    // this effect syncs with it, once, before the frame is painted
    // oxlint-disable-next-line react/set-state-in-effect
    if (first !== undefined) setCurrent(first);
  }, [children, current, entries]);

  useEffect(() => {
    if (!active) return;
    const move = (step: number) => {
      const ids = order();
      if (!ids.length) return;
      play('move');
      const at = current === undefined ? -1 : ids.indexOf(current);
      setCurrent(ids[(at + step + ids.length) % ids.length]);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!onTop() || focusTakes(event)) return;
      const entry = current === undefined ? undefined : entries.get(current);
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
        case 'd':
          if (entry?.onStep && !entry.disabled) {
            event.preventDefault();
            play('move');
            entry.onStep(
              event.key === 'ArrowLeft' || event.key === 'a' ? -1 : 1,
            );
          }
          break;
        case 'Enter':
        case ' ':
          if (entry) {
            event.preventDefault();
            choose(entry, play);
          }
          break;
      }
    };
    // In the capture phase: a dialog's popup stops the arrow keys on their
    // way up, and the keys are the top layer's wherever the focus is
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active, current, entries, play, onTop]);

  return (
    <PickerContext
      value={{
        current,
        setCurrent,
        choose: entry => choose(entry, play),
        entries,
        active,
        touch,
        overflow,
        scrollTop: scroll.top,
        stageWidth,
        listRef,
      }}
    >
      <div data-slot="picker" className={styles.root()}>
        <ul
          ref={listRef}
          className={styles.menu({ className })}
          aria-label={label}
        >
          {children}
        </ul>
        {overflow && <ScrollRail scroll={scroll} />}
      </div>
    </PickerContext>
  );
};

type ItemVariant = 'default' | 'accent' | 'back';

export interface PickerItemProps {
  /** Names the item, for `initial` */
  id: string;
  /** The label */
  children: ReactNode;
  /**
   * What kind of item: `accent`, the loud one, in the primary colour and
   * blinking (the closer on offer); `back`, it leaves (Back, Cancel), and
   * sounds like stepping back, not like confirming
   * @default 'default'
   */
  variant?: ItemVariant;
  /**
   * Shown, dimmed, and reachable by the cursor, but picking it bumps:
   * nothing in a menu is hidden, so give it a `note` that says why
   * @default false
   */
  disabled?: boolean;
  /**
   * What it does, or why it is off: a small window of its own beside the
   * menu's, at its row, while the cursor is on it
   */
  note?: string;
  /**
   * How far a hint has ruled it out, from 0 (not at all) to 1: it fades
   * as the hint grows, still there to be picked
   * @default 0
   */
  ruledOut?: number;
  onSelect: () => void;
}

/** The row itself, for an item and a setting */
const Row = ({
  id,
  children,
  variant = 'default',
  disabled = false,
  note,
  ruledOut = 0,
  onSelect,
  onStep,
}: PickerItemProps & { onStep?: (step: 1 | -1) => void }) => {
  const picker = usePicker();
  const rowRef = useRef<HTMLLIElement>(null);
  const isCurrent = picker.current === id;

  // The keys reach the item through the picker: its latest handlers
  useLayoutEffect(() => {
    picker.entries.set(id, { disabled, variant, onSelect, onStep });
  });
  useLayoutEffect(
    () => () => {
      picker.entries.delete(id);
    },
    [picker.entries, id],
  );

  // The current item stays in view; only a list that scrolls is moved,
  // so a short list never scrolls the page
  useEffect(() => {
    if (isCurrent && picker.overflow)
      rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isCurrent, picker.overflow]);

  const shownNote = picker.active && isCurrent && Boolean(note);
  const place = useNotePlace(
    rowRef,
    picker.listRef,
    shownNote,
    picker.scrollTop,
    picker.stageWidth,
  );
  // Under a finger there is no cursor to move, and a marked row would read
  // as chosen already: only the row a description is about is marked
  const marked = isCurrent && (!picker.touch || Boolean(note));

  return (
    <li ref={rowRef} data-slot="picker-item" data-id={id}>
      <button
        type="button"
        aria-disabled={disabled || undefined}
        aria-current={isCurrent ? 'true' : undefined}
        className={styles.item({ selected: marked, variant })}
        onPointerEnter={() => picker.setCurrent(id)}
        onClick={() => {
          picker.setCurrent(id);
          picker.choose({ disabled, variant, onSelect, onStep });
        }}
      >
        <span aria-hidden className={styles.cursor({ shown: marked })} />
        <span
          className={styles.label({ disabled })}
          style={ruledOut ? { opacity: 1 - 0.75 * ruledOut } : undefined}
        >
          {/* The loud one blinks; the cursor beside it does not */}
          {variant === 'accent' ? (
            <Text variant="call" className="text-inherit">
              {children}
            </Text>
          ) : (
            children
          )}
        </span>
      </button>
      {shownNote &&
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
    </li>
  );
};

/** One item of a Picker: something to pick */
export const PickerItem = (props: PickerItemProps) => <Row {...props} />;

export interface PickerSettingProps extends Omit<
  PickerItemProps,
  'variant' | 'onSelect'
> {
  /** The setting's name */
  children: ReactNode;
  /** The value shown between the arrows */
  value: ReactNode;
  /** Left or right on it: the value a step that way */
  onStep: (step: 1 | -1) => void;
  /** Enter or a tap; a step to the right by default, so it goes round */
  onSelect?: () => void;
  /** A range at its first value (a volume at 0): the left arrow is dim. A choice goes round and leaves it unset */
  first?: boolean;
  /** A range at its last value: the right arrow is dim */
  last?: boolean;
}

/**
 * A setting in a Picker: its name, and its value between the step
 * arrows at the row's end; left and right step it. A choice goes round
 * (both arrows lit); a range stops at its ends (`first`, `last`)
 */
export const PickerSetting = ({
  children,
  value,
  onStep,
  onSelect = () => onStep(1),
  first,
  last,
  ...props
}: PickerSettingProps) => (
  <Row {...props} onSelect={onSelect} onStep={onStep}>
    <span className={styles.setting()}>
      {children}
      <Setting first={first} last={last}>
        {value}
      </Setting>
    </span>
  </Row>
);

/** Items that belong together, apart from the rest: room above them */
export const PickerGroup = ({ children }: { children: ReactNode }) => (
  <li data-slot="picker-group">
    <ul className={styles.group()}>{children}</ul>
  </li>
);
