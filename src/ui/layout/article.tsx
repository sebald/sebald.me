import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  HashStraightIcon,
  MarkdownLogoIcon,
} from '@phosphor-icons/react/ssr';
import type { Route } from 'next';
import Link from 'next/link';
import type { AriaAttributes, PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import type { HeadlineProps } from '@/ui/headline';
import { Headline } from '@/ui/headline';

// Styles
// ---------------
const styles = {
  root: cva({
    base: ['flex flex-col items-start', 'pt-24'],
  }),
  header: cva({
    base: ['flex flex-col gap-4'],
  }),
  nav: cva({
    base: ['flex items-center gap-2'],
  }),
  caption: cva({
    base: ['text-muted flex items-center gap-0.5 text-xs'],
  }),
  action: cva({
    base: [
      'flex items-center justify-center',
      'size-12 rounded-full',
      'bg-mist-800 text-mist-500',
      'hover:bg-mist-500/50 hover:text-mist-50',
      'transition-all duration-150',
      '[&_svg]:size-5',
    ],
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
interface TitleProps extends PropsWithChildren {
  id?: string;
  /**
   * Display style for the title
   * - 'page': Large display heading with accent variant (for full article pages)
   * - 'list': Smaller heading level 3 (for article lists/indexes)
   */
  variant?: 'page' | 'list';
}

const Title = ({ children, id, variant = 'page' }: TitleProps) => {
  let headlineProps: Omit<HeadlineProps, 'children'>;

  switch (variant) {
    case 'list':
      headlineProps = { level: '3', as: 'h2' };
      break;
    case 'page':
    default:
      headlineProps = { level: '1', as: 'h1' };
      break;
  }

  return (
    <Headline id={id} {...headlineProps}>
      {children}
    </Headline>
  );
};

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

// Article.MarkdownLink
// ---------------
interface MarkdownLinkProps extends AriaAttributes {
  href: string;
}

const MarkdownLink = ({ href, ...props }: MarkdownLinkProps) => (
  <Link
    {...props}
    href={href as Route}
    className={styles.action()}
    aria-label="View as Markdown"
  >
    <MarkdownLogoIcon weight="bold" />
  </Link>
);

// Article.Actions
// ---------------
interface ActionsProps extends PropsWithChildren, AriaAttributes {}

const Actions = ({ children, ...ariaProps }: ActionsProps) => (
  <nav className={styles.nav()} {...ariaProps}>
    <Link
      href="/"
      className={styles.action({ className: 'flex-1' })}
      aria-label="Back to home"
    >
      <ArrowLeftIcon weight="bold" />
    </Link>
    <div className="flex gap-2">{children}</div>
  </nav>
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

// Note API
// ---------------
export const Article = Object.assign(Root, {
  Header,
  Title,
  Actions,
  Content,
  Footer,
  Time,
  Topics,
  Excerpt,
  MarkdownLink,
});
