import NextImage from 'next/image';
import type { AriaAttributes, PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import { Headline } from '@/ui/headline';
import type { HeadlineProps } from '@/ui/headline';
import { ParallaxImage } from '@/ui/parallax-image';

// Styles
// ---------------
const styles = {
  root: cva({
    base: ['flex flex-col'],
  }),
  header: cva({
    base: ['flex flex-col pb-8'],
  }),
  title: cva({
    base: ['flex flex-col'],
  }),
  content: cva({
    base: ['prose'],
  }),
  image: cva({
    base: ['mb-14 rounded-2xl'],
  }),
};

// Article.Header
// ---------------
interface HeaderProps extends PropsWithChildren, AriaAttributes {
  className?: string;
}

const Header = ({ children, className, ...ariaProps }: HeaderProps) => (
  <header className={styles.header({ className })} {...ariaProps}>
    {children}
  </header>
);

// Article.Title
// ---------------
interface TitleProps extends HeadlineProps {}

// `className` goes to the headline, the wrapper only handles layout
const Title = ({ children, ...props }: TitleProps) => (
  <div className={styles.title()}>
    <Headline {...props}>{children}</Headline>
  </div>
);

// Article
// ---------------
interface ContentProps extends PropsWithChildren, AriaAttributes {
  className?: string;
}

const Content = ({ children, className, ...ariaProps }: ContentProps) => (
  <div className={styles.content({ className })} {...ariaProps}>
    {children}
  </div>
);

// Article.Image
// ---------------
interface ImageSectionProps {
  src: string | string[];
  aspect?: string;
}

const ImageSection = ({ src, aspect = '5/2' }: ImageSectionProps) => {
  const images = Array.isArray(src) ? [...src].reverse() : [src];

  if (images.length > 1) {
    return (
      <ParallaxImage
        aspect={aspect}
        // Layers are 115% of the content column (max 720px)
        sizes="(min-width: 768px) 828px, 115vw"
        className={styles.image()}
        layers={images.map((src, i, arr) => {
          const depth = i / (arr.length - 1);
          return {
            src,
            xMove: `${(0.5 + depth ** 1.5 * 3.5).toFixed(1)}cqi`,
            yMove: `${(0.25 + depth ** 1.5 * 1.75).toFixed(1)}cqi`,
          };
        })}
      />
    );
  }

  return (
    <div
      className={styles.image({
        className: 'relative w-full overflow-hidden rounded-2xl',
      })}
      style={{ aspectRatio: aspect }}
      aria-hidden="true"
    >
      <NextImage
        src={images[0]}
        alt=""
        fill
        preload
        // Content column, max 720px
        sizes="(min-width: 768px) 720px, 100vw"
        className="object-cover"
      />
    </div>
  );
};

// Article.Root
// ---------------
interface RootProps extends PropsWithChildren, AriaAttributes {
  className?: string;
}

const Root = ({ children, className, ...ariaProps }: RootProps) => (
  <article className={styles.root({ className })} {...ariaProps}>
    {children}
  </article>
);

// Article API
// ---------------
export const Article = Object.assign(Root, {
  Header,
  Title,
  Image: ImageSection,
  Content,
});
