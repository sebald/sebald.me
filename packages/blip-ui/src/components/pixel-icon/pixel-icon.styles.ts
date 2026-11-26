import { cva } from '../../utils/styles';

export const pixelIcon = {
  /** A box of its own pixels, never squeezed by the row it sits in */
  root: cva({ base: 'block shrink-0' }),
};
