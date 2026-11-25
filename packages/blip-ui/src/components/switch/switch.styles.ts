import { cva } from '../../utils/styles';

export const switchStyles = {
  /** The row's name, the track and the state in words; a tap anywhere on it changes it */
  root: cva({
    base: [
      'group inline-flex cursor-pointer items-center gap-regular text-(--bui-text-bright) outline-none',
      'touch:min-h-11 hover:text-(--bui-text-selected)',
      'data-disabled:cursor-default data-disabled:bui-disabled data-disabled:hover:text-(--bui-text-bright)',
    ],
  }),
  /** The name, as wide as the container's label column when it has one (`--bui-label-width`) */
  name: cva({
    base: 'w-(--bui-label-width,auto) shrink-0 group-focus-visible:bui-focus-line',
  }),
  /** The slot the thumb runs in: its frame is dim, lit when on */
  track: cva({
    base: [
      'relative inline-block h-[calc(var(--bui-px)*6)] w-[calc(var(--bui-px)*12)] shrink-0 bg-(--bui-ink) ring-[length:var(--bui-px)] ring-(--bui-dim)',
      'transition-[box-shadow] duration-150 ease-bui-out',
      'group-data-checked:ring-(--bui-primary)',
    ],
  }),
  /** A square that moves from one end to the other, by `translate` in whole stage pixels; the frame and colour change in step with it */
  thumb: cva({
    base: [
      'absolute top-joined left-joined block size-[calc(var(--bui-px)*4)] bg-(--bui-muted)',
      'transition-[translate,background-color] duration-150 ease-bui-out motion-reduce:transition-[background-color]',
      'data-checked:translate-x-[calc(var(--bui-px)*6)] data-checked:bg-(--bui-primary)',
    ],
  }),
  /** On or Off, the same width either way so the row does not shift */
  state: cva({
    base: 'inline-block w-[3ch] text-[0.85em] text-(--bui-muted) group-data-checked:text-(--bui-primary) group-focus-visible:bui-focus-line',
  }),
};
