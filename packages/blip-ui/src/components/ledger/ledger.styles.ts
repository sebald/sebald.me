import { cva } from '../../utils/styles';

export const ledger = {
  root: cva({ base: 'm-0 grid gap-[calc(var(--px)*1.5)]' }),
  row: cva({ base: 'flex items-baseline gap-[calc(var(--px)*2)]' }),
  label: cva({ base: 'm-0 shrink-0' }),
  // A pixel dot every three stage pixels, on the baseline
  leader: cva({
    base: [
      'mb-[0.3em] h-(--px) min-w-[calc(var(--px)*6)] flex-1 self-end',
      'bg-[repeating-linear-gradient(90deg,var(--bui-dim)_0_var(--px),transparent_var(--px)_calc(var(--px)*3))]',
    ],
  }),
  value: cva({
    base: 'm-0 shrink-0 text-(--bui-heading) tabular-nums',
  }),
};
