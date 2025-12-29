import type { PropsWithChildren } from 'react';
import type { AriaAttributes } from 'react';

import { Headline } from './headline';

interface HeaderProps extends PropsWithChildren, AriaAttributes {}

const Header = ({ children, ...ariaProps }: HeaderProps) => (
  <header className="mb-8 flex flex-col gap-3" {...ariaProps}>
    {children}
  </header>
);

interface TitleProps extends PropsWithChildren {
  id?: string;
}

const Title = ({ children, id }: TitleProps) => (
  <Headline level="1" as="h2" id={id}>
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
    <time dateTime={isoDate} className="text-text-muted text-sm" {...ariaProps}>
      {isoDate}
    </time>
  );
};

interface ContentProps extends PropsWithChildren, AriaAttributes {}

const Content = ({ children, ...ariaProps }: ContentProps) => (
  <div className="prose" {...ariaProps}>
    {children}
  </div>
);

interface RootProps extends PropsWithChildren, AriaAttributes {}

const Root = ({ children, ...ariaProps }: RootProps) => (
  <article className="flex flex-col" {...ariaProps}>
    {children}
  </article>
);

export const Article = Object.assign(Root, {
  Header,
  Title,
  Time,
  Content,
});
