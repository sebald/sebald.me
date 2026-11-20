import { cva } from '../../utils/styles';

export const switchStyles = {
  /** The row's name, the track and the state in words; a tap anywhere on it changes it */
  root: cva({
    base: [
      'group inline-flex cursor-pointer items-center gap-[calc(var(--bui-px)*3)] text-(--bui-text-bright) outline-none',
      'touch:min-h-11 hover:text-(--bui-text-selected) focus-visible:bui-focus',
      'data-disabled:cursor-default data-disabled:bui-disabled data-disabled:hover:text-(--bui-text-bright)',
    ],
  }),
  /** The slot the thumb runs in: its frame is dim, lit when on */
  track: cva({
    base: [
      'relative inline-block h-[calc(var(--bui-px)*6)] w-[calc(var(--bui-px)*12)] shrink-0 bg-(--bui-ink) ring-[length:var(--bui-px)] ring-(--bui-frame-dim)',
      'group-data-checked:ring-(--bui-primary)',
    ],
  }),
  /** A square that moves from one end to the other, in whole stage pixels */
  thumb: cva({
    base: [
      'absolute top-[calc(var(--bui-px)*1)] left-[calc(var(--bui-px)*1)] block size-[calc(var(--bui-px)*4)] bg-(--bui-muted)',
      'transition-[left,background-color] duration-150 ease-bui-out motion-reduce:transition-none',
      'data-checked:left-[calc(var(--bui-px)*7)] data-checked:bg-(--bui-primary)',
    ],
  }),
  /** On or Off, the same width either way so the row does not shift */
  state: cva({
    base: 'inline-block w-[3ch] text-[0.85em] text-(--bui-muted) group-data-checked:text-(--bui-primary)',
  }),
};
