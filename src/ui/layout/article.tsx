import NextImage from 'next/image';
import type { AriaAttributes, PropsWithChildren } from 'react';

import type { Hotspot } from '@/lib/hotspots';
import { cva } from '@/lib/styles.utils';
import { Headline } from '@/ui/headline';
import type { HeadlineProps } from '@/ui/headline';
import { PixelImage } from '@/ui/pixel-image';

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
    base: [
      // Edge to edge on phones with the same gap above and below (40px),
      // rounded inside the column from `md` up
      'mt-2 mb-10 md:mt-0 md:mb-14',
      '-mx-content-padding w-[calc(100%+var(--spacing-content-padding)*2)] rounded-none',
      'md:mx-0 md:w-full md:rounded-2xl',
    ],
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
  src: string | { src: string; poster: string; hotspots?: Hotspot[] };
  aspect?: string;
}

const ImageSection = ({ src, aspect = '5/2' }: ImageSectionProps) => {
  if (typeof src === 'object') {
    return (
      <PixelImage
        src={src.src}
        poster={src.poster}
        hotspots={src.hotspots}
        aspect={aspect}
        className={styles.image()}
      />
    );
  }

  return (
    <div
      className={styles.image({
        className: 'relative overflow-hidden',
      })}
      style={{ aspectRatio: aspect }}
      aria-hidden="true"
    >
      <NextImage
        src={src}
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
