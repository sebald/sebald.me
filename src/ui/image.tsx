import { Image as FumaImage } from 'fumadocs-core/framework';
import type { ComponentProps } from 'react';

import { cva } from '@/lib/styles.utils';
import { Figure } from '@/ui/figure';

// Styles
// ---------------
const style = {
  image: cva({
    base: ['rounded-lg'],
  }),
};

// Props
// ---------------
export interface ImageProps extends ComponentProps<typeof FumaImage> {
  /**
   * Image title to be displayed as a caption below the image
   */
  title?: string;
  alt: string;
}

// Component
// ---------------
export const Image = ({ title, alt, className, ...props }: ImageProps) => {
  const img = (
    <FumaImage {...props} alt={alt} className={style.image({ className })} />
  );

  return title ? <Figure caption={title}>{img}</Figure> : img;
};
