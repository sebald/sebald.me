import type { PropsWithChildren, ReactNode } from 'react';

import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
const style = {
  root: cva({ base: [] }),
  caption: cva({
    base: ['pt-3 text-center', 'text-sm text-muted-foreground', 'italic'],
  }),
};

// Props
// ---------------
export interface FigureProps extends PropsWithChildren {
  /**
   * Caption below the content
   */
  caption?: ReactNode;
  className?: string;
}

// Component
// ---------------
export const Figure = ({ caption, children, className }: FigureProps) => (
  <figure className={style.root({ className })}>
    {children}
    {caption && <figcaption className={style.caption()}>{caption}</figcaption>}
  </figure>
);
