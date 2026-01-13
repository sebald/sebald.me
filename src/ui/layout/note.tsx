import {
  CalendarBlankIcon,
  HashStraightIcon,
  MarkdownLogoIcon,
} from '@phosphor-icons/react/ssr';
import type { Route } from 'next';
import Link from 'next/link';
import type { AriaAttributes, PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import type { VariantProps } from '@/lib/styles.utils';
import type { HeadlineProps } from '@/ui/headline';
import { Headline } from '@/ui/headline';

// Styles
// ---------------
const styles = {
  root: cva({
    base: ['flex flex-col items-start'],
    variants: {
      stretch: {
        full: '',
        prose: 'fit-prose',
      },
    },
  }),
  header: cva({
    base: [
      'grid',
      'grid-cols-2',
      'gap-x-4',
      'items-start',
      '[grid-template-areas:"meta_meta""actions_actions""title_title"] min-[500px]:[grid-template-areas:"meta_actions""title_title"]',
    ],
  }),
  caption: cva({
    base: ['text-muted flex items-center gap-0.5 text-xs'],
  }),
  action: cva({
    base: [
      'text-muted flex items-center gap-0.5 text-xs',
      'ensure-hitbox',
      'hover:text-link-hover',
    ],
  }),
  content: cva({
    base: ['prose'],
  }),
  excerpt: cva({
    base: 'text-pretty text-base',
  }),
};

// Article.Header
// ---------------
interface HeaderProps
  extends
    PropsWithChildren,
    AriaAttributes,
    VariantProps<typeof styles.header> {
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
      headlineProps = { level: 'display', variant: 'accent' };
      break;
  }

  return (
    <Headline id={id} {...headlineProps} className="[grid-area:title]">
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
  <Link {...props} href={href as Route} className={styles.action()}>
    <MarkdownLogoIcon size={16} />
    View as Markdown
  </Link>
);

// Article.Actions
// ---------------
interface ActionsProps extends PropsWithChildren, AriaAttributes {}

const Actions = ({ children, ...ariaProps }: ActionsProps) => (
  <div className="justify-self-end [grid-area:actions]" {...ariaProps}>
    {children}
  </div>
);

// Article.Meta
// ---------------
interface MetaProps extends AriaAttributes {
  date?: Date | string;
  topics?: string[];
}

const Meta = ({ date, topics, ...ariaProps }: MetaProps) => (
  <div className="flex gap-2 [grid-area:meta]" {...ariaProps}>
    {date && <Time date={date} />}
    {date && topics && topics.length > 0 && (
      <span className="text-muted text-sm">·</span>
    )}
    {topics && topics.length > 0 && <Topics topics={topics} />}
  </div>
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
interface RootProps
  extends PropsWithChildren, AriaAttributes, VariantProps<typeof styles.root> {
  className?: string;
}

const Root = ({ children, className, stretch, ...ariaProps }: RootProps) => (
  <article className={styles.root({ className, stretch })} {...ariaProps}>
    {children}
  </article>
);

// Note API
// ---------------
export const Note = Object.assign(Root, {
  Header,
  Title,
  Time,
  Topics,
  Meta,
  Actions,
  Excerpt,
  Content,
  MarkdownLink,
});
