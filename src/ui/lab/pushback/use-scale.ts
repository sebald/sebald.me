import { useLayoutEffect, useState } from 'react';

import {
  BACKING,
  MIN_SCALE,
  backingFor,
  crisp,
  fitFor,
} from '@/lib/lab/pushback/stage';

/** The side gutter the stage keeps to the viewport, like the site column */
export const STAGE_GUTTER = 24;

export interface StageScale {
  /** CSS pixels per stage pixel */
  scale: number;
  /** The ceiling rows a short window takes off the duel's band (`fitFor`) */
  crop: number;
  /** A viewport too narrow for `MIN_SCALE`: the screens show a notice */
  portrait: boolean;
  /** Whether a stage pixel is a whole number of device pixels */
  crisp: boolean;
  /** What the canvas is drawn at (`backingFor`) */
  backing: number;
}

/**
 * The scale the stage is shown at: 3 wherever it fits with the gutter,
 * below that whatever the window allows, snapped to the screen's device
 * pixels where that keeps the game large enough (`fitFor`, `crispScale`).
 * `fixed` pins the scale (the workbench). The device pixel ratio is read
 * again on resize and when it changes (another screen, a page zoom).
 */
export const useScale = (fixed?: number): StageScale => {
  const [state, setState] = useState<StageScale>({
    scale: fixed ?? 1,
    crop: 0,
    portrait: false,
    crisp: false,
    backing: BACKING,
  });
  useLayoutEffect(() => {
    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      if (fixed) {
        setState({
          scale: fixed,
          crop: 0,
          portrait: false,
          crisp: crisp(fixed, dpr),
          backing: backingFor(fixed, dpr),
        });
        return;
      }
      const fit = fitFor(
        window.innerWidth - STAGE_GUTTER * 2,
        window.innerHeight - STAGE_GUTTER * 2,
        3,
        dpr,
      );
      const scale = Math.max(MIN_SCALE, fit.scale);
      setState({
        scale,
        crop: fit.crop,
        portrait: fit.scale < MIN_SCALE,
        crisp: crisp(scale, dpr),
        backing: backingFor(scale, dpr),
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
    return () => {
      window.removeEventListener('resize', measure);
      media?.removeEventListener('change', onChange);
    };
  }, [fixed]);
  return state;
};
