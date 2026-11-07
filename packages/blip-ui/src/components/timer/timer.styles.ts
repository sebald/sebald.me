import { cva } from '../../utils/styles';

export const timer = {
  root: cva({ base: 'block' }),
  // The blink drops to nothing, not to the kit's default 0.6
  watch: cva({
    base: '',
    variants: {
      blinking: {
        true: 'animate-bui-blink [--blink-low:0] motion-reduce:animate-none',
        false: '',
      },
    },
  }),
  /** The wedge's colours by phase: the face and its part in the rim's shadow */
  phase: {
    fast: { main: 'var(--bui-info)', shade: 'var(--bui-info-shade)' },
    warning: {
      main: 'var(--bui-secondary)',
      shade: 'var(--bui-secondary-shade)',
    },
    critical: { main: 'var(--bui-danger)', shade: 'var(--bui-danger-shade)' },
  },
};
