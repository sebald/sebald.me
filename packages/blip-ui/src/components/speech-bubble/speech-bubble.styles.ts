import { cva } from '../../utils/styles';

/**
 * The bubble's parts: the paper's box with its text, the ink outline and
 * the paper cut inside it (both clipped to stepped corners), and the
 * tail's rows, one pixel high each.
 */
export const speechBubble = {
  root: cva({
    base: 'relative m-0 px-[1em] pt-[0.7em] pb-[0.9em] text-[0.85em] leading-snug text-(--bui-paper-foreground)',
  }),
  ink: cva({ base: 'absolute inset-0 bg-(--bui-ink)' }),
  paper: cva({ base: 'absolute inset-(--px)' }),
  tailInk: cva({ base: 'absolute h-(--px) bg-(--bui-ink)' }),
  tailPaper: cva({ base: 'absolute bg-(--bui-paper)' }),
  text: cva({ base: 'relative' }),
};
