'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react';

/**
 * The open layers, the top one last. Keys go to the top one only: a
 * dialog over a menu takes them from it while it is open.
 */
const stack: symbol[] = [];

/** The layer a part is in; `null` is the screen under every dialog */
export const KeyLayerContext = createContext<symbol | null>(null);

/**
 * Whether the keys reach the layer a part is in: a check for the
 * moment a key comes in, not a value to render with
 */
export const useOnTop = () => {
  const layer = useContext(KeyLayerContext);
  return useCallback(() => (stack.at(-1) ?? null) === layer, [layer]);
};

/**
 * A layer of its own while `open`, above the layers open before it.
 * Give it to its parts through `KeyLayerContext`.
 */
export const useKeyLayer = (open: boolean) => {
  const [layer] = useState(() => Symbol('layer'));
  useLayoutEffect(() => {
    if (!open) return;
    stack.push(layer);
    return () => {
      // A task later: the key that closed the layer is still on its
      // way to the screen's other listeners, which must not hear it too
      setTimeout(() => {
        const at = stack.indexOf(layer);
        if (at !== -1) stack.splice(at, 1);
      });
    };
  }, [open, layer]);
  return layer;
};

/**
 * The menus listening on one layer, in the order they mounted, and the
 * one the player last pointed at or focused within
 */
interface Scope {
  members: HTMLElement[];
  claimed: HTMLElement | null;
}
const scopes = new Map<symbol | null, Scope>();

/** `Node.DOCUMENT_POSITION_FOLLOWING`, which is not there outside a page */
const FOLLOWING = 4;

/** Take part in a layer's keys; the returned function leaves again */
export const joinKeyScope = (layer: symbol | null, element: HTMLElement) => {
  const scope = scopes.get(layer) ?? { members: [], claimed: null };
  scopes.set(layer, scope);
  scope.members.push(element);
  const claim = () => {
    scope.claimed = element;
  };
  element.addEventListener('pointerdown', claim, true);
  element.addEventListener('pointerenter', claim);
  element.addEventListener('focusin', claim);
  return () => {
    element.removeEventListener('pointerdown', claim, true);
    element.removeEventListener('pointerenter', claim);
    element.removeEventListener('focusin', claim);
    scope.members.splice(scope.members.indexOf(element), 1);
    if (scope.claimed === element) scope.claimed = null;
    if (!scope.members.length) scopes.delete(layer);
  };
};

/** Whether the keys on a layer are this element's right now */
export const holdsKeys = (layer: symbol | null, element: HTMLElement) => {
  const scope = scopes.get(layer);
  if (!scope) return false;
  // Members mount in render order, which is not always the page's
  const [first] = [...scope.members].sort((a, b) =>
    a.compareDocumentPosition(b) & FOLLOWING ? -1 : 1,
  );
  return (scope.claimed ?? first) === element;
};

/**
 * Whether the keys on a layer are this part's, for parts that take
 * navigation keys (a menu) and may share a layer with others. The keys
 * go to the one the player last pointed at, pressed on or moved the focus into; until
 * the player has done either, to the first of them on the page, so a
 * screen with one menu works with no click. A check for the moment a key
 * comes in. Only while `active`; the part's own `ref` is its edge.
 */
export const useKeyScope = (
  ref: RefObject<HTMLElement | null>,
  active = true,
) => {
  const layer = useContext(KeyLayerContext);
  useEffect(() => {
    const element = ref.current;
    if (!active || !element) return;
    return joinKeyScope(layer, element);
  }, [ref, active, layer]);
  return useCallback(() => {
    const element = ref.current;
    return element ? holdsKeys(layer, element) : false;
  }, [ref, layer]);
};

/** The keys a focused widget moves along a row with, and down a column */
const ROW = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);
const COLUMN = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End']);

/** Widgets that move with the arrows when they have the focus, and which way by default */
const WIDGETS: Record<string, 'row' | 'column' | 'both'> = {
  tablist: 'row',
  toolbar: 'row',
  menubar: 'row',
  listbox: 'column',
  menu: 'column',
  radiogroup: 'both',
  slider: 'both',
  switch: 'row',
  grid: 'both',
};
const SELECTOR = Object.keys(WIDGETS)
  .map(role => `[role=${role}]`)
  .join(',');

/**
 * Whether the focused element handles this key itself: anything typed
 * in a text field, the arrows a focused tab list moves along. The kit
 * listens in the capture phase, before the focus does, so it leaves
 * those keys alone instead of doing a second thing with them; the other
 * arrows still reach it (up and down past a focused row of tabs).
 */
export const focusTakes = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target?.closest) return false;
  if (target.closest('input,textarea,select,[contenteditable=true]'))
    return true;
  // A focused switch flips on Enter and Space itself
  if (
    (event.key === 'Enter' || event.key === ' ') &&
    target.closest('[role=switch]')
  )
    return true;
  const widget = target.closest<HTMLElement>(SELECTOR);
  if (!widget) return false;
  const orientation = widget.getAttribute('aria-orientation');
  const way =
    orientation === 'vertical'
      ? 'column'
      : orientation === 'horizontal'
        ? 'row'
        : WIDGETS[widget.getAttribute('role')!];
  return (
    (way !== 'column' && ROW.has(event.key)) ||
    (way !== 'row' && COLUMN.has(event.key))
  );
};

/**
 * The kit's one way to listen for keys: `onKey` hears a key while
 * `active`, only on its layer, and never one the focus handles itself.
 * In the capture phase: a dialog's popup stops the arrow keys on their
 * way up, and the keys are the top layer's wherever the focus is. The
 * latest `onKey` hears it, without listening anew on a render.
 */
export const useKeydown = (
  onKey: (event: KeyboardEvent) => void,
  active = true,
) => {
  const onTop = useOnTop();
  const handle = useEffectEvent(onKey);
  useEffect(() => {
    if (!active) return;
    const listener = (event: KeyboardEvent) => {
      if (onTop() && !focusTakes(event)) handle(event);
    };
    window.addEventListener('keydown', listener, true);
    return () => window.removeEventListener('keydown', listener, true);
  }, [active, onTop]);
};
