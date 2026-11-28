'use client';

import {
  type ElementType,
  type ReactNode,
  createContext,
  useContext,
  useId,
} from 'react';

import { parts as styles } from './parts.styles';

/**
 * What a container tells the parts in it, only what they can't know
 * themselves: the element that draws a title or the content there (a
 * Dialog's are its name and description). Where
 * a part sits is not in here: the container places it by its slot.
 */
export interface PartsValue {
  /** Draws a title here; an `h2` when not given */
  title?: ElementType;
  /** Draws the content here; a `div` when not given */
  content?: ElementType;
}

/** The parts' context; a container that wires its parts provides it */
export const PartsContext = createContext<PartsValue | null>(null);

/**
 * The id of the `Title` that names the container a part is in, for a
 * list in it to take as its name (`Picker`); `undefined` outside one, and
 * in a `Content`, where a Title is only a heading
 */
export const TitleIdContext = createContext<string | undefined>(undefined);

/**
 * Lets the `Title` in it name what is in it: a container whose title is
 * its name wraps its parts in it (a window, a dialog), so a menu in it is
 * called what the title says, with no second name to keep in step
 */
export const NamedByTitle = ({ children }: { children: ReactNode }) => (
  <TitleIdContext value={useId()}>{children}</TitleIdContext>
);

export interface PartProps {
  children: ReactNode;
  className?: string;
}

/**
 * What names the container it is in: a dialog's title, a window's, and
 * the menu in it. Outside any, a heading
 */
export const Title = ({ className, children }: PartProps) => {
  const Tag: ElementType = useContext(PartsContext)?.title ?? 'h2';
  const id = useContext(TitleIdContext);
  return (
    <Tag id={id} data-slot="title" className={styles.title({ className })}>
      {children}
    </Tag>
  );
};

/**
 * What the container says: a line or two, a list. Its own content is
 * the caller's, so a Title in it is a heading, not the container's name
 */
export const Content = ({ className, children }: PartProps) => {
  const Tag: ElementType = useContext(PartsContext)?.content ?? 'div';
  return (
    <Tag data-slot="content" className={styles.content({ className })}>
      <TitleIdContext value={undefined}>
        <PartsContext value={null}>{children}</PartsContext>
      </TitleIdContext>
    </Tag>
  );
};

/** What can be done: a `Picker`, or buttons side by side */
export const Actions = ({ className, children }: PartProps) => (
  <div data-slot="actions" className={styles.actions({ className })}>
    {children}
  </div>
);
