'use client';

import { type RefObject, useEffect, useState } from 'react';

/** What a list shows of itself: for the rail beside it */
export interface Scroll {
  top: number;
  height: number;
  view: number;
}

/**
 * Measures a scrolling element: on scroll, and whenever it or its
 * children resize. `key` changes when the children do.
 */
export const useScroll = (
  ref: RefObject<HTMLElement | null>,
  key: unknown,
): Scroll => {
  const [scroll, setScroll] = useState<Scroll>({ top: 0, height: 0, view: 0 });
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () =>
      setScroll(previous => {
        const next = {
          top: list.scrollTop,
          height: list.scrollHeight,
          view: list.clientHeight,
        };
        return previous.top === next.top &&
          previous.height === next.height &&
          previous.view === next.view
          ? previous
          : next;
      });
    measure();
    list.addEventListener('scroll', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const child of list.children) observer.observe(child);
    return () => {
      list.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [ref, key]);
  return scroll;
};

/** Whether a measured list has more than it shows */
export const overflows = (scroll: Scroll) => scroll.height > scroll.view + 1;
