import { useLayoutEffect, useState } from 'react';

import {
  BACKING,
  MIN_SCALE,
  STAGE,
  backingFor,
  crisp,
  crispScale,
  fitFor,
  scaleFor,
  tallFor,
} from '@/lib/lab/pushback/stage';

/** The side gutter the stage keeps to the viewport, like the site column */
export const STAGE_GUTTER = 24;

/** A window held upright: the stage goes tall (`tallFor`) */
export const UPRIGHT = '(orientation: portrait)';

/**
 * A phone on its side: too short for the menus with the browser's bars,
 * which a page cannot hide there, so the screens ask to turn it upright
 */
export const SIDEWAYS =
  '(orientation: landscape) and (pointer: coarse) and (max-height: 500px)';

export interface StageScale {
  /** CSS pixels per stage pixel */
  scale: number;
  /** The ceiling rows a short window takes off the duel's band (`fitFor`) */
  crop: number;
  /** Held upright: the stage is the window's width and `rows` tall */
  tall: boolean;
  /** The stage's height in stage pixels: 214, more when tall */
  rows: number;
  /** A phone on its side: the screens ask to turn it upright */
  turn: boolean;
  /** Whether a stage pixel is a whole number of device pixels */
  crisp: boolean;
  /** What the canvas is drawn at (`backingFor`) */
  backing: number;
}

/**
 * The height of the small viewport, the one with the browser's bars
 * shown: it holds still while they collapse and come back on a scroll,
 * so the tall stage does not jump with them
 */
const smallViewportHeight = () => {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;height:100svh;width:0;visibility:hidden';
  document.body.append(probe);
  const height = probe.offsetHeight || window.innerHeight;
  probe.remove();
  return height;
};

/**
 * The scale the stage is shown at. Held upright (the orientation, not a
 * width), the stage is as wide as the window and as tall as its small
 * viewport (`tallFor`). Otherwise 3 wherever it fits with the gutter,
 * below that whatever the window allows, snapped to the screen's device
 * pixels where that keeps the game large enough (`fitFor`,
 * `crispScale`). `fixed` pins the scale (the workbench). The device pixel
 * ratio is read again on resize and when it changes (another screen, a
 * page zoom).
 */
export const useScale = (fixed?: number): StageScale => {
  const [state, setState] = useState<StageScale>({
    scale: fixed ?? 1,
    crop: 0,
    tall: false,
    rows: STAGE.height,
    turn: false,
    crisp: false,
    backing: BACKING,
  });
  useLayoutEffect(() => {
    const upright = window.matchMedia(UPRIGHT);
    const sideways = window.matchMedia(SIDEWAYS);
    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      const settle = (
        scale: number,
        rest: Omit<StageScale, 'scale' | 'crisp' | 'backing'>,
      ) =>
        setState({
          scale,
          ...rest,
          crisp: crisp(scale, dpr),
          backing: backingFor(scale, dpr),
        });
      if (fixed) {
        settle(fixed, {
          crop: 0,
          tall: false,
          rows: STAGE.height,
          turn: false,
        });
        return;
      }
      if (upright.matches) {
        const tall = tallFor(window.innerWidth, smallViewportHeight(), 3, dpr);
        settle(tall.scale, {
          crop: 0,
          tall: true,
          rows: tall.rows,
          turn: false,
        });
        return;
      }
      // Fullscreen, the stage has the screen to itself: no gutter, and no
      // page to scroll, so all of it fits, uncropped; a phone on its side
      // can play
      const full = document.fullscreenElement !== null;
      const fit = full
        ? {
            scale: crispScale(
              scaleFor(window.innerWidth, window.innerHeight, 3),
              dpr,
            ),
            crop: 0,
          }
        : fitFor(
            window.innerWidth - STAGE_GUTTER * 2,
            window.innerHeight - STAGE_GUTTER * 2,
            3,
            dpr,
          );
      settle(Math.max(MIN_SCALE, fit.scale), {
        crop: fit.crop,
        tall: false,
        rows: STAGE.height,
        turn: sideways.matches && !full,
      });
    };
    // A media query that stops matching when the ratio changes; it fires
    // once, so it is set up again after each change
    let media: MediaQueryList | null = null;
    const onChange = () => {
      measure();
      watch();
    };
    const watch = () => {
      media?.removeEventListener('change', onChange);
      media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      media.addEventListener('change', onChange);
    };
    measure();
    watch();
    window.addEventListener('resize', measure);
    upright.addEventListener('change', measure);
    sideways.addEventListener('change', measure);
    document.addEventListener('fullscreenchange', measure);
    return () => {
      document.removeEventListener('fullscreenchange', measure);
      window.removeEventListener('resize', measure);
      upright.removeEventListener('change', measure);
      sideways.removeEventListener('change', measure);
      media?.removeEventListener('change', onChange);
    };
  }, [fixed]);
  return state;
};
