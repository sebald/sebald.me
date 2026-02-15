import {
  CalendarBlankIcon,
  HashStraightIcon,
} from '@phosphor-icons/react/ssr';
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
  caption: cva({
    base: ['text-muted-foreground flex items-center gap-0.5 text-xs'],
  }),
  content: cva({
    base: ['prose'],
  }),
  footer: cva({
    base: ['flex', 'list-separator'],
  }),
  excerpt: cva({
    base: 'text-pretty text-base',
  }),
  image: cva({
    base: ['pb-8'],
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

const Title = ({ children, ...props }: TitleProps) => (
  <div className={styles.title()}>
    <Headline {...props}>{children}</Headline>
  </div>
);

// Article.Time
// ---------------
interface TimeProps extends AriaAttributes {
  date: Date | string;
}

const Time = ({ date, ...ariaProps }: TimeProps) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isoDate = dateObj.toISOString().split('T')[0];

  return (
    <time dateTime={isoDate} className={styles.caption()} {...ariaProps}>
      <CalendarBlankIcon size={14} />
      {isoDate}
    </time>
  );
};

// Article.Topics
// ---------------
interface TopicsProps extends AriaAttributes {
  topics: string[];
}

const Topics = ({ topics, ...ariaProps }: TopicsProps) => {
  return (
    <div className={styles.caption()} {...ariaProps}>
      {/* Optical correction for the hash icon */}
      <HashStraightIcon size={14} className="-mr-px" />
      {topics.join(', ')}
    </div>
  );
};

// Article.Footer
// ---------------
interface FooterProps extends PropsWithChildren, AriaAttributes {}

const Footer = ({ children, ...ariaProps }: FooterProps) => (
  <footer className={styles.footer()} {...ariaProps}>
    {children}
  </footer>
);

// Article
// ---------------
interface ContentProps extends PropsWithChildren, AriaAttributes {}

const Content = ({ children, ...ariaProps }: ContentProps) => (
  <div className={styles.content()} {...ariaProps}>
    {children}
  </div>
);

// Article.Excerpt
// ---------------
interface ExcerptProps extends PropsWithChildren, AriaAttributes {}

const Excerpt = ({ children, ...ariaProps }: ExcerptProps) => (
  <p className={styles.excerpt()} {...ariaProps}>
    {children}
  </p>
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
      <div className={styles.image()} aria-hidden="true">
        <ParallaxImage
          aspect={aspect}
          className="rounded-2xl"
          layers={images.map((url, i, arr) => ({
            id: url,
            src: url,
            alt: '',
            fill: true,
            config: {
              xMove: `${i === arr.length - 1 ? 4 : (i + 1) * 1}cqi`,
              yMove: `${i === arr.length - 1 ? 2 : (i + 1) * 0.5}cqi`,
            },
          }))}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.image({
        className: 'relative w-full rounded-2xl overflow-hidden',
      })}
      style={{ aspectRatio: aspect }}
      aria-hidden="true"
    >
      <NextImage src={images[0]} alt="" fill className="object-cover" />
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
  Footer,
  Time,
  Topics,
  Excerpt,
});
