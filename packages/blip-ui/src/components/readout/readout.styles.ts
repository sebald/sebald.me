import { cva } from '../../utils/styles';

/**
 * A readout: lengths in `--bui-px`, so a phone keeps it legible. The value
 * is in the heading colour with tabular figures, as a ledger's is, so a
 * column of readouts lines up on its digits
 */
export const readout = {
  root: cva({
    base: 'm-0 inline-flex items-baseline gap-[calc(var(--bui-px)*3)]',
  }),
  /** As wide as the container's label column when it has one (`--bui-label-width`) */
  label: cva({ base: 'w-(--bui-label-width,auto) shrink-0' }),
  value: cva({ base: 'text-(--bui-heading) tabular-nums' }),
};
