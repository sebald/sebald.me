import { cva } from '../../utils/styles';

export const typewriter = {
  root: cva({ base: '' }),
  // Untyped yet: holds its room, unseen and unread
  rest: cva({ base: 'invisible' }),
};
