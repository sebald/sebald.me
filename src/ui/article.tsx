import { CalendarBlankIcon, HashStraightIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';
import type { AriaAttributes } from 'react';

import { cva } from '@/lib/styles.utils';
import type { VariantProps } from '@/lib/styles.utils';

import { Headline } from './headline';
import type { HeadlineProps } from './headline';

const styles = {
  header: cva({
    base: ['flex flex-col'],
    variants: {
      flow: {
        default: 'gap-3 pb-24',
        reverse: 'flex-col-reverse gap-0 pb-2',
      },
    },
    defaultVariants: {
      flow: 'default',
    },
  }),
  caption: cva({
    base: ['text-muted flex items-center gap-1 text-xs'],
  }),
  content: cva({
    base: ['prose'],
  }),
  excerpt: cva({
    base: '',
  }),
  root: cva({
    base: ['flex flex-col'],
  }),
};

interface HeaderProps
  extends PropsWithChildren,
    AriaAttributes,
    VariantProps<typeof styles.header> {}

const Header = ({ children, flow, ...ariaProps }: HeaderProps) => (
  <header className={styles.header({ flow })} {...ariaProps}>
    {children}
  </header>
);

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

interface TopicsProps extends AriaAttributes {
  topics: string[];
}

const Topics = ({ topics, ...ariaProps }: TopicsProps) => {
  return (
    <div className={styles.caption()} {...ariaProps}>
      <HashStraightIcon size={14} />
      {topics.join(', ')}
    </div>
  );
};

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

interface ContentProps extends PropsWithChildren, AriaAttributes {}

const Content = ({ children, ...ariaProps }: ContentProps) => (
  <div className={styles.content()} {...ariaProps}>
    {children}
  </div>
);

interface ExcerptProps extends PropsWithChildren, AriaAttributes {}

const Excerpt = ({ children, ...ariaProps }: ExcerptProps) => (
  <p className={styles.excerpt()} {...ariaProps}>
    {children}
  </p>
);

interface RootProps extends PropsWithChildren, AriaAttributes {}

const Root = ({ children, ...ariaProps }: RootProps) => (
  <article className={styles.root()} {...ariaProps}>
    {children}
  </article>
);

export const Article = Object.assign(Root, {
  Header,
  Title,
  Time,
  Topics,
  Meta,
  Excerpt,
  Content,
});
