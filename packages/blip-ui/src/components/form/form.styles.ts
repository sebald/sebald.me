import { cva } from '../../utils/styles';
import { rows } from '../parts/parts.styles';

export const form = {
  /**
   * Its rows as a `Content`'s, 4 stage pixels apart, the fields in the
   * window's label column (the `Content`'s columns, by subgrid): a form
   * inside a `Content` looks as the window's own rows. `Actions` in it
   * start 8 in, as anywhere
   */
  root: cva({
    base: ['m-0 grid gap-regular not-tall:grid-cols-subgrid', ...rows],
  }),
};
