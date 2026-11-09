import { cva } from '../../utils/styles';

export const stamp = {
  root: cva({
    base: 'block',
    variants: {
      /** The ink: the danger colour for a job done, the primary for one done without a scratch */
      variant: {
        danger: 'text-(--bui-danger)',
        primary: 'text-(--bui-primary)',
      },
    },
    defaultVariants: { variant: 'danger' },
  }),
  // The frame and the letters
  ink: cva({ base: 'fill-current' }),
  // The inside, darkened so the word reads over a face
  air: cva({ base: 'fill-(--bui-ink) opacity-70' }),
};
