import { CalendarBlankIcon, HashStraightIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';
import type { AriaAttributes } from 'react';

import { cva } from '@/lib/styles.utils';

import { Headline } from './headline';

const styles = {
  header: cva({
    base: ['pb-24 flex flex-col gap-3'],
  }),
  caption: cva({
    base: ['text-muted flex items-center gap-1.5 text-xs'],
  }),
  content: cva({
    base: ['prose'],
  }),
  root: cva({
    base: ['flex flex-col'],
  }),
};

interface HeaderProps extends PropsWithChildren, AriaAttributes {}

const Header = ({ children, ...ariaProps }: HeaderProps) => (
  <header className={styles.header()} {...ariaProps}>
    {children}
  </header>
);

interface TitleProps extends PropsWithChildren {
  id?: string;
}

const Title = ({ children, id }: TitleProps) => (
  <Headline id={id} level="display" variant="accent">
    {children}
  </Headline>
);

interface TimeProps extends AriaAttributes {
  date: Date | string;
}

const Time = ({ date, ...ariaProps }: TimeProps) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isoDate = dateObj.toISOString().split('T')[0];

  return (
    <time dateTime={isoDate} className={styles.caption()} {...ariaProps}>
      <CalendarBlankIcon size={16} />
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
      <HashStraightIcon size={16} />
      {topics.join(', ')}
    </div>
  );
};

interface ContentProps extends PropsWithChildren, AriaAttributes {}

const Content = ({ children, ...ariaProps }: ContentProps) => (
  <div className={styles.content()} {...ariaProps}>
    {children}
  </div>
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
  Content,
});
