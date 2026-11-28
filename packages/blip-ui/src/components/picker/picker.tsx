'use client';

import {
  Children,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  createContext,
  isValidElement,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useKeyScope, useKeydown } from '../../hooks/key-layer';
import { useInputKind } from '../../hooks/use-input-kind';
import { type Scroll, overflows, useScroll } from '../../hooks/use-scroll';
import { useAnnounce } from '../../providers/announcer';
import { useFeedback } from '../../providers/feedback';
import { usePixels } from '../../providers/pixels';
import { building } from '../../utils/dev';
import { cn } from '../../utils/styles';
import { TitleIdContext } from '../parts/parts';
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
 * sits in can cut it off; in a dialog, into the dialog, over its scrim.
 */
const useNotePlace = (
  rowRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLUListElement | null>,
  shown: boolean,
  scrollTop: number,
): NotePlace | null => {
  const { scale, tall } = usePixels();
  const [place, setPlace] = useState<NotePlace | null>(null);
  useLayoutEffect(() => {
    const row = shown ? rowRef.current : null;
    // Over the stage, or over a dialog's scrim when the menu is in one
    const root =
      row?.closest<HTMLElement>('[data-slot=dialog]') ??
      row?.closest<HTMLElement>('[data-stage]');
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
    const width = toStage(origin.width);
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
  }, [rowRef, listRef, shown, scrollTop, scale, tall]);
  return shown ? place : null;
};

/** What an item gives the picker, for the keys */
interface Entry {
  disabled: boolean;
  variant: NonNullable<PickerItemProps['variant']>;
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
  /** Another menu on the layer has the keys: no cursor, no note */
  resting: boolean;
  touch: boolean;
  overflow: boolean;
  scrollTop: number;
  listRef: RefObject<HTMLUListElement | null>;
  /** The columns' names, the name's first, where the list has columns */
  columns: readonly string[] | undefined;
  /** The items' ids in the list's order, across its groups: each row's place in it */
  ids: readonly string[];
  /** The cursor last moved by the keys: its row takes the focus with it */
  movedByKeys: RefObject<boolean>;
}

/** The column a value sits in: its name, read out before it, and whether it is the last */
const ColumnContext = createContext<
  { name: string; last: boolean } | undefined
>(undefined);

const PickerContext = createContext<PickerContextValue | null>(null);

const usePicker = () => {
  const context = use(PickerContext);
  if (!context) throw new Error('A PickerItem goes in a Picker');
  return context;
};

/**
 * The cursor's place in the list, `3 of 12`: for the eye, as each row
 * carries its own place for a screen reader (`aria-posinset`)
 */
const Position = ({
  ids,
  current,
}: {
  ids: readonly string[];
  current: string | undefined;
}) => {
  const at = current === undefined ? -1 : ids.indexOf(current);
  return (
    <p aria-hidden data-slot="picker-position" className={styles.position()}>
      {/* No cursor yet: the line keeps its height, so the list stays put */}
      {at < 0 ? '\u00a0' : `${at + 1} of ${ids.length}`}
    </p>
  );
};

export interface PickerProps {
  /** Its items: `PickerItem`s and `PickerSetting`s, in `PickerGroup`s where they belong together */
  children: ReactNode;
  /** The item the cursor is on at first, by id; the first enabled one by default */
  initial?: string;
  /**
   * Keyboard handling on. With several on one layer the keys go to the
   * one the player last clicked or focused (the first until then); a
   * `Dialog` over it takes the keys by itself
   * @default true
   */
  active?: boolean;
  /**
   * The list's accessible name, only where nothing names it: in a window
   * or a dialog with a `Title`, the title is its name
   */
  label?: string;
  /**
   * Its columns' names, for a list whose rows have more than one value (a
   * shop's Item, Price, Owned): the name's column first, then one per
   * `PickerItemValue`, in the order a row writes them. A header row over
   * the list names them, each row's values line up under it, and a screen
   * reader hears each value with its column's name (`Tonic Price 25g`)
   */
  columns?: readonly string[];
  /**
   * Where the cursor is, `3 of 12`, under the list at its end: for a list
   * longer than its window, whose rail shows how far down it is but not
   * which. A short list needs none
   * @default false
   */
  position?: boolean;
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
  columns,
  position = false,
  className,
}: PickerProps) => {
  const play = useFeedback();
  const [current, setCurrent] = useState<string | undefined>(initial);
  const [entries] = useState(() => new Map<string, Entry>());
  const listRef = useRef<HTMLUListElement>(null);
  const movedByKeys = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { holds: hasKeys, resting } = useKeyScope('menu', rootRef, active);
  const scroll = useScroll(listRef, Children.count(children));
  const overflow = overflows(scroll);
  const touch = useInputKind() === 'touch';
  const titleId = use(TitleIdContext);
  const hasColumns = Boolean(columns?.length);

  /** The items' ids in the order the list shows them */
  const order = () =>
    [
      ...(listRef.current?.querySelectorAll<HTMLElement>(
        '[data-slot=picker-item]',
      ) ?? []),
    ].map(row => row.dataset.id!);

  // A menu has a name: its window's title, or its label where nothing
  // names it. Say so while building one
  useEffect(() => {
    if (!building()) return;
    const named =
      label !== undefined ||
      (titleId !== undefined && document.getElementById(titleId));
    if (!named)
      console.error(
        'Blip UI: a Picker with no name. Give its window a Title (it names the menu), or the Picker a label where nothing names it.',
      );
  }, [label, titleId]);

  // The items in the list's order, kept for each row's place in it (a
  // screen reader's `3 of 12`, across groups) and for the position
  const [ids, setIds] = useState<readonly string[]>([]);
  useLayoutEffect(() => {
    const next = order();
    // Synced with the DOM's order after every render, an item's own too
    // (one that comes or goes inside a wrapper); set only when it changed,
    // so this settles at once
    // oxlint-disable-next-line react/set-state-in-effect
    setIds(previous =>
      previous.join('\n') === next.join('\n') ? previous : next,
    );
  });

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

  // An item chosen: refused with a bump when disabled
  const choose = (entry: Entry) => {
    if (entry.disabled) {
      play('bump');
      return;
    }
    play(entry.variant === 'back' ? 'back' : 'confirm');
    entry.onSelect();
  };

  useKeydown(event => {
    // Another menu on this layer has the keys
    if (!hasKeys()) return;
    const move = (step: number) => {
      const ids = order();
      if (!ids.length) return;
      play('move');
      const at = current === undefined ? -1 : ids.indexOf(current);
      movedByKeys.current = true;
      setCurrent(ids[(at + step + ids.length) % ids.length]);
    };
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
          entry.onStep(event.key === 'ArrowLeft' || event.key === 'a' ? -1 : 1);
        }
        break;
      case 'Enter':
      case ' ':
        if (entry) {
          event.preventDefault();
          choose(entry);
        }
        break;
    }
  }, active);

  // The list and the rail beside it: under it the position, where shown
  const list = (
    <>
      <ul
        ref={listRef}
        className={styles.menu({ columned: hasColumns, className })}
        style={
          hasColumns
            ? ({ '--picker-values': columns!.length - 1 } as CSSProperties)
            : undefined
        }
        aria-label={label}
        aria-labelledby={label === undefined ? titleId : undefined}
      >
        {hasColumns && (
          // For the eye: each value says its column's name itself, and
          // the names are no item of the list
          <li
            aria-hidden
            role="presentation"
            data-slot="picker-header"
            className={styles.header()}
          >
            <span />
            {columns!.map((name, at) => (
              <span key={at}>{name}</span>
            ))}
          </li>
        )}
        {children}
      </ul>
      {overflow && <ScrollRail scroll={scroll} />}
    </>
  );

  return (
    <PickerContext
      value={{
        current,
        setCurrent,
        choose,
        entries,
        active,
        resting,
        touch,
        overflow,
        scrollTop: scroll.top,
        listRef,
        columns: hasColumns ? columns : undefined,
        ids,
        movedByKeys,
      }}
    >
      <div
        ref={rootRef}
        data-slot="picker"
        className={styles.root({ positioned: position })}
      >
        {position ? (
          <>
            <div data-slot="picker-body" className={styles.body()}>
              {list}
            </div>
            <Position ids={ids} current={current} />
          </>
        ) : (
          list
        )}
      </div>
    </PickerContext>
  );
};

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
  variant?: 'default' | 'accent' | 'back';
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

/**
 * An item's parts sorted into the columns: the name and its tag in the
 * name's column, each value in the next column, with that column's name
 * to read out, a detail under them. Parts are the item's own children,
 * as `PickerItem` documents them
 */
const inColumns = (children: ReactNode, columns: readonly string[]) => {
  const all = Children.toArray(children);
  const isA = (child: ReactNode, part: unknown) =>
    isValidElement(child) && child.type === part;
  const values = all.filter(child => isA(child, PickerItemValue));
  const details = all.filter(child => isA(child, PickerItemDetail));
  const name = all.filter(
    child => !isA(child, PickerItemValue) && !isA(child, PickerItemDetail),
  );
  const count = columns.length - 1;
  // A value for every column, in its order: one more has no column
  if (building() && values.length > count)
    console.error(
      `Blip UI: a PickerItem with ${values.length} values in a Picker with ${count} value columns. Give the Picker a column for each, or write fewer values; the rest are left out.`,
    );
  return (
    <>
      <span data-slot="picker-item-name">{name}</span>
      {values.slice(0, count).map((value, at) => (
        <ColumnContext
          key={at}
          value={{ name: columns[at + 1]!, last: at === count - 1 }}
        >
          {value}
        </ColumnContext>
      ))}
      {details}
    </>
  );
};

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isCurrent = picker.current === id;

  // Moved here by the keys, the row takes the focus: a screen reader says
  // it as the cursor reaches it, its name and its place (`3 of 12`), as
  // the cursor is the focus. Never when the list opens or a pointer
  // moves the cursor, so a menu takes no focus the player didn't move.
  // The list scrolls itself (below), never the page
  const { movedByKeys } = picker;
  useEffect(() => {
    if (!isCurrent || !movedByKeys.current) return;
    movedByKeys.current = false;
    buttonRef.current?.focus({ preventScroll: true });
  }, [isCurrent, movedByKeys]);

  // The keys reach the item through the picker: its latest handlers
  const entry: Entry = { disabled, variant, onSelect, onStep };
  useLayoutEffect(() => {
    picker.entries.set(id, entry);
  });
  useLayoutEffect(
    () => () => {
      picker.entries.delete(id);
    },
    [picker.entries, id],
  );

  // The current item stays in view inside a list that scrolls. The list
  // is scrolled itself, never the page: `scrollIntoView` would also move
  // the page to a row off the screen (a demo picking on its own)
  const { listRef } = picker;
  useEffect(() => {
    const list = listRef.current;
    const row = rowRef.current;
    if (!isCurrent || !picker.overflow || !list || !row) return;
    // The row's place in the list's content, whatever is positioned
    const top =
      row.getBoundingClientRect().top -
      list.getBoundingClientRect().top +
      list.scrollTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight;
  }, [isCurrent, picker.overflow, listRef]);

  const shownNote =
    picker.active && !picker.resting && isCurrent && Boolean(note);
  // Read out as it shows, after the item's own name
  const announce = useAnnounce();
  useEffect(() => {
    if (shownNote && note) announce(note);
  }, [shownNote, note, announce]);
  const place = useNotePlace(
    rowRef,
    picker.listRef,
    shownNote,
    picker.scrollTop,
  );
  // Under a finger there is no cursor to move, and a marked row would read
  // as chosen already: only the row a description is about is marked
  const marked =
    isCurrent && !picker.resting && (!picker.touch || Boolean(note));

  const at = picker.ids.indexOf(id);

  const { columns } = picker;
  const parts = columns ? inColumns(children, columns) : children;
  const placed = columns ? styles.columns() : styles.parts();

  return (
    <li
      ref={rowRef}
      data-slot="picker-item"
      data-id={id}
      // Its place in the whole list, groups and all, read with its name
      aria-posinset={at >= 0 ? at + 1 : undefined}
      aria-setsize={at >= 0 ? picker.ids.length : undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-disabled={disabled || undefined}
        aria-current={isCurrent ? 'true' : undefined}
        className={styles.item({
          selected: marked,
          stepsShown: marked || picker.touch,
          variant,
          className: columns && styles.itemColumned(),
        })}
        onPointerEnter={() => picker.setCurrent(id)}
        // Tab (or any keyboard focus) puts the cursor here, so there is one
        // cursor, not the keys' and another where the focus is
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible'))
            picker.setCurrent(id);
        }}
        onClick={() => {
          picker.setCurrent(id);
          picker.choose(entry);
        }}
      >
        <span
          aria-hidden
          data-slot="cursor"
          className={styles.cursor({ shown: marked })}
        />
        <span
          data-cursor-target
          className={styles.label({
            disabled,
            // An accent item's call holds its parts, so it places them; in
            // columns it spans them, as the label does
            className:
              variant !== 'accent'
                ? placed
                : columns && 'grid grid-cols-subgrid',
          })}
          style={ruledOut ? { opacity: 1 - 0.75 * ruledOut } : undefined}
        >
          {/* The loud one blinks; the cursor beside it does not */}
          {variant === 'accent' ? (
            <Text
              variant="call"
              className={cn(placed, columns && 'col-span-full', 'text-inherit')}
            >
              {parts}
            </Text>
          ) : (
            parts
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
            <p className="m-0">{note}</p>
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

export interface PickerItemPartProps {
  children: ReactNode;
  className?: string;
}

/**
 * The space a screen reader reads between the name and a part beside it
 * (`Lantern New 12g`): the part sits in the name's line, with no space
 * written between them, so the words don't rely on how a browser builds
 * the name from inline boxes. The gap the eye sees is the part's margin
 */
const Gap = () => <span className="sr-only"> </span>;

/**
 * A second line under the item's name, quieter and smaller: who gave a
 * quest and what to do next, where a save was made, why a ware is out of
 * reach. The item's own text stays its name
 */
export const PickerItemDetail = ({
  className,
  children,
}: PickerItemPartProps) => (
  <span data-slot="picker-item-detail" className={styles.detail({ className })}>
    {children}
  </span>
);

export interface PickerItemValueProps extends PickerItemPartProps {
  /**
   * What it is: `default`, what the row is about (a price, a play time),
   * in the row's colour; `progress`, how far along it is (`3/8`), muted,
   * so the name stays what the eye reads first
   * @default 'default'
   */
  variant?: 'default' | 'progress';
}

/**
 * A value at the row's end, where every value in a window ends: a price,
 * a play time, a count. Figures keep their width as they change
 */
export const PickerItemValue = ({
  variant,
  className,
  children,
}: PickerItemValueProps) => {
  const column = use(ColumnContext);
  return (
    <span
      data-slot="picker-item-value"
      data-last-column={column?.last || undefined}
      className={styles.value({ variant, className })}
    >
      <Gap />
      {/* In columns, the column's name before it: `Price 25g` */}
      {column && <span className="sr-only">{column.name} </span>}
      {children}
    </span>
  );
};

/** Items that belong together, apart from the rest: room above them */
export const PickerGroup = ({ children }: { children: ReactNode }) => {
  const columns = use(PickerContext)?.columns;
  return (
    <li data-slot="picker-group">
      <ul className={styles.group({ columned: Boolean(columns) })}>
        {children}
      </ul>
    </li>
  );
};
