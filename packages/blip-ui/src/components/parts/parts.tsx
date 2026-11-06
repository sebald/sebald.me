'use client';

import {
  type ElementType,
  type ReactNode,
  createContext,
  useContext,
} from 'react';

import { parts as styles } from './parts.styles';

/**
 * What a container tells the parts in it, only what they can't know
 * themselves: the element that draws a title or the content there (a
 * Dialog's are its name and description) and the heading level. Where
 * a part sits is not in here: the container places it by its slot.
 */
export interface PartsValue {
  /** Draws a title here; a heading of `level` when not given */
  title?: ElementType;
  /** Draws the content here; a `div` when not given */
  content?: ElementType;
  /**
   * The heading level of a title here
   * @default 2
   */
  level?: 2 | 3;
}

/** The parts' context; a container that wires its parts provides it */
export const PartsContext = createContext<PartsValue | null>(null);

export interface PartProps {
  children: ReactNode;
  className?: string;
}

/**
 * What names the container it is in: a dialog's title, a window's.
 * Outside any, a heading
 */
export const Title = ({ className, children }: PartProps) => {
  const { title, level = 2 } = useContext(PartsContext) ?? {};
  const Tag: ElementType = title ?? `h${level}`;
  return (
    <Tag data-slot="title" className={styles.title({ className })}>
      {children}
    </Tag>
  );
};

/**
 * What the container says: a line or two, a list. Its own content is
 * the caller's, so a Title in it is a heading, not the container's name
 */
export const Content = ({ className, children }: PartProps) => {
  const { content } = useContext(PartsContext) ?? {};
  const Tag: ElementType = content ?? 'div';
  return (
    <Tag data-slot="content" className={styles.content({ className })}>
      <PartsContext value={null}>{children}</PartsContext>
    </Tag>
  );
};

/** What can be done: a `Picker`, or buttons side by side */
export const Actions = ({ className, children }: PartProps) => (
  <div data-slot="actions" className={styles.actions({ className })}>
    {children}
  </div>
);
