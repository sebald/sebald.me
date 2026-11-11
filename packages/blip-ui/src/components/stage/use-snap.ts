'use client';

import { useLayoutEffect } from 'react';

import { crisp, snapOffset } from '../../foundations/scale';

/**
 * Keep the stage's origin on a whole device pixel. The scale is snapped
 * so a stage pixel is a whole number of device pixels (`crispScale`), but
 * where the stage starts is up to the page: the centring, what sits
 * above it, and the scroll, which Chrome keeps in whole CSS pixels (at
 * 1.25 or 1.5 those are not whole device pixels). Off the grid, every
 * edge in the game falls between two device pixels and the art goes soft.
 *
 * The stage is moved by the remainder with `translate`, measured in the
 * viewport and again after every scroll, resize, change of the device
 * pixel ratio and change of the page's size. Scroll events and the
 * resize observer already come at most once a frame, after layout, so
 * each measures straight away (a frame of its own on top kept the
 * held-clock screen tests from seeing the title's first render in
 * time). A translate needs no layout and changes no size the observer
 * watches, so following the scroll costs one read and one write. Nothing inside the stage is `position: fixed`; what is laid
 * over it (dialogs, notes) is absolute inside it and moves with it.
 *
 * Only where it helps: a stage pixel that is not a whole number of
 * device pixels is soft wherever it starts, and at 1x the browser snaps
 * the box itself.
 */
export const useSnap = (root: HTMLElement | null, scale: number) => {
  useLayoutEffect(() => {
    if (!root) return;
    // What is applied now, taken off a measurement so shifts never add up
    let shift = { x: 0, y: 0 };
    const apply = (x: number, y: number) => {
      if (x === shift.x && y === shift.y) return;
      shift = { x, y };
      root.style.translate = x || y ? `${x}px ${y}px` : '';
    };
    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      if (dpr <= 1 || !crisp(scale, dpr)) {
        apply(0, 0);
        return;
      }
      const box = root.getBoundingClientRect();
      apply(
        snapOffset(box.left - shift.x, dpr),
        snapOffset(box.top - shift.y, dpr),
      );
    };
    // The ratio changes on another screen or a page zoom; the query fires
    // once, so it is set up again after each change
    let media: MediaQueryList | null = null;
    const watch = () => {
      media?.removeEventListener('change', onRatio);
      media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      media.addEventListener('change', onRatio);
    };
    const onRatio = () => {
      measure();
      watch();
    };
    measure();
    watch();
    // Any scroller, the page's or one around the game (captured: scroll
    // does not bubble)
    document.addEventListener('scroll', measure, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', measure);
    // What sits above it settling (a font, an image) moves it too
    const resize = new ResizeObserver(() => measure());
    resize.observe(document.documentElement);
    resize.observe(root);
    return () => {
      document.removeEventListener('scroll', measure, { capture: true });
      window.removeEventListener('resize', measure);
      media?.removeEventListener('change', onRatio);
      resize.disconnect();
      root.style.translate = '';
    };
  }, [root, scale]);
};
