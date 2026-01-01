import { Image as FumaImage } from 'fumadocs-core/framework';
import type { ComponentProps } from 'react';

import { cva } from '@/lib/styles.utils';

const style = {
  image: cva({
    base: ['rounded-lg'],
  }),
  caption: cva({
    base: ['pt-1 text-center', 'text-xs text-muted', 'italic'],
  }),
};

export interface ImageProps extends ComponentProps<typeof FumaImage> {
  /**
   * Image title to be displayed as a caption below the image
   */
  title?: string;
  alt: string;
}

export const Image = ({ title, alt, className, ...props }: ImageProps) => {
  const img = (
    <FumaImage
      {...props}
      alt={alt}
      className={`${style.image()} ${className ?? ''}`}
    />
  );

  return title ? (
    <figure>
      {img}
      <figcaption className={style.caption()}>{title}</figcaption>
    </figure>
  ) : (
    img
  );
};
