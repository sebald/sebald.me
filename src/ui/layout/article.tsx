import {
  CalendarBlankIcon,
  HashStraightIcon,
  HouseSimpleIcon,
} from '@phosphor-icons/react/ssr';
import NextImage from 'next/image';
import type { AriaAttributes, PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import { Headline } from '@/ui/headline';
import type { HeadlineProps } from '@/ui/headline';
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuSeparator,
} from '@/ui/layout/article-action-menu';
import { Link } from '@/ui/link';

// Styles
// ---------------
const styles = {
  root: cva({
    base: ['flex flex-col', 'pt-32'],
  }),
  header: cva({
    base: [
      'grid items-center pb-8 w-full',
      'grid-cols-[auto_1fr]',
      '[grid-template-areas:"back_actions"_"title_title"]',
      'gap-y-20',
    ],
  }),
  back: cva({
    base: ['[grid-area:back]'],
  }),
  actions: cva({
    base: ['[grid-area:actions]', 'justify-self-end'],
  }),
  title: cva({
    base: ['[grid-area:title]', 'flex flex-col'],
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
  imageSection: cva({
    base: ['flex gap-4 pb-8'],
  }),
  image: cva({
    base: ['relative aspect-video w-full rounded-lg overflow-hidden'],
  }),
};

// Article.Header
// ---------------
interface HeaderProps extends PropsWithChildren, AriaAttributes {
  className?: string;
}

const Header = ({ children, className, ...ariaProps }: HeaderProps) => (
  <header className={styles.header({ className })} {...ariaProps}>
    <div className={styles.back()}>
      <Link href="/" variant="icon" aria-label="Back to home">
        <HouseSimpleIcon weight="bold" />
      </Link>
    </div>
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

// Article.Actions (wraps client ActionMenu with grid positioning)
// ---------------
const Actions = ({ children }: PropsWithChildren) => (
  <div className={styles.actions()}>
    <ActionMenu>{children}</ActionMenu>
  </div>
);

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
}

const ImageSection = ({ src }: ImageSectionProps) => {
  const images = Array.isArray(src) ? src : [src];

  return (
    <div className={styles.imageSection()} aria-hidden="true">
      {images.map(url => (
        <div key={url} className={styles.image()}>
          <NextImage src={url} alt="" fill className="object-cover" />
        </div>
      ))}
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
  Actions,
  ActionsItem: ActionMenuItem,
  ActionsSeparator: ActionMenuSeparator,
  Image: ImageSection,
  Content,
  Footer,
  Time,
  Topics,
  Excerpt,
});
