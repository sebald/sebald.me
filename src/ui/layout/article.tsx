import { CalendarBlankIcon, HashStraightIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';
import type { AriaAttributes } from 'react';

import { cva } from '@/lib/styles.utils';
import type { VariantProps } from '@/lib/styles.utils';
import type { HeadlineProps } from '@/ui/headline';
import { Headline } from '@/ui/headline';

// Styles
// ---------------
const styles = {
  root: cva({
    base: ['flex flex-col items-start'],
  }),
  header: cva({
    base: ['flex flex-col-reverse items-start'],
    variants: {
      stretch: {
        full: '',
        prose: 'fit-prose',
      },
    },
  }),
  caption: cva({
    base: ['text-muted flex items-center gap-0.5 text-xs'],
  }),
  content: cva({
    base: ['prose'],
  }),
  excerpt: cva({
    base: 'text-pretty',
  }),
};

// Article.Header
// ---------------
interface HeaderProps
  extends PropsWithChildren,
    AriaAttributes,
    VariantProps<typeof styles.header> {
  className?: string;
}

const Header = ({
  children,
  stretch,
  className,
  ...ariaProps
}: HeaderProps) => (
  <header className={styles.header({ stretch, className })} {...ariaProps}>
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

// Article.Meta
// ---------------
interface MetaProps extends AriaAttributes {
  date?: Date | string;
  topics?: string[];
}

const Meta = ({ date, topics, ...ariaProps }: MetaProps) => (
  <div className="flex gap-2" {...ariaProps}>
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
  Time,
  Topics,
  Meta,
  Excerpt,
  Content,
});
