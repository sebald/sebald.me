'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

type Announce = (message: string) => void;

const AnnounceContext = createContext<Announce | null>(null);

/**
 * Say something to a screen reader, politely, after what it is reading:
 * a line of dialogue, a description box, the round's result. A game draws
 * on a stage, so what changes there is not always text in its place.
 */
export const useAnnounce = (): Announce =>
  useContext(AnnounceContext) ?? NOTHING;

const NOTHING: Announce = () => {};

/**
 * The one live region of a stage, hidden; `Stage` and `Pixels` hold
 * one, so `useAnnounce` works in every piece inside them. Inside
 * another, it is that one: one region a stage
 */
export const Announcer = ({ children }: PropsWithChildren) =>
  useContext(AnnounceContext) ? children : <Region>{children}</Region>;

const Region = ({ children }: PropsWithChildren) => {
  const [message, setMessage] = useState('');
  // The same words again are a change too: a space after every other one
  const announce = useCallback<Announce>(
    next => setMessage(previous => (previous === next ? `${next} ` : next)),
    [],
  );
  return (
    <AnnounceContext value={announce}>
      {children}
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </AnnounceContext>
  );
};
