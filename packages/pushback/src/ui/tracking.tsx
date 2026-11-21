'use client';

import {
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { PUSHBACK_EVENT, type PushbackEvent } from '../lib/events';

type Track = (event: PushbackEvent | null) => void;

const TrackContext = createContext<Track>(() => {});

/**
 * Tell the host about a moment (`PushbackEvent`); `null` is nothing, so a
 * builder that finds nothing to say can be passed as it is. Call it from
 * a handler, never inside a state updater, which React may run twice.
 */
export const useTrack = (): Track => useContext(TrackContext);

interface TrackingProviderProps {
  onEvent?: (event: PushbackEvent) => void;
  /** Where the DOM event (`PUSHBACK_EVENT`) is dispatched; it bubbles */
  target: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/**
 * Every event goes to `onEvent` and, as a `CustomEvent` with the event
 * as its `detail`, up from `target`. The latest `onEvent` is called, so
 * a new function each render redraws nothing, and a host's error is
 * reported without stopping the game.
 */
export const TrackingProvider = ({
  onEvent,
  target,
  children,
}: TrackingProviderProps) => {
  const latest = useRef(onEvent);
  useEffect(() => {
    latest.current = onEvent;
  }, [onEvent]);

  const track = useCallback<Track>(
    event => {
      if (!event) return;
      target.current?.dispatchEvent(
        new CustomEvent(PUSHBACK_EVENT, { detail: event, bubbles: true }),
      );
      try {
        latest.current?.(event);
      } catch (error) {
        reportError(error);
      }
    },
    [target],
  );

  return <TrackContext value={track}>{children}</TrackContext>;
};
