'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
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
