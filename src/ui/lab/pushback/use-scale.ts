import { useLayoutEffect, useState } from 'react';

import { MIN_SCALE, fitFor } from '@/lib/lab/pushback/stage';

/** The side gutter the stage keeps to the viewport, like the site column */
export const STAGE_GUTTER = 24;

/**
 * The scale the stage is shown at: 3 wherever it fits with the gutter,
 * a fraction below that so it shrinks with the window, and `crop`, the
 * ceiling rows a short window takes off the duel's band before the
 * stage shrinks (`fitFor`). `fixed` pins the scale (the workbench).
 * `portrait` is a viewport too narrow for `MIN_SCALE`, where the
 * screens show a turn-your-phone notice.
 */
export const useScale = (fixed?: number) => {
  const [scale, setScale] = useState(fixed ?? 1);
  const [crop, setCrop] = useState(0);
  const [portrait, setPortrait] = useState(false);
  useLayoutEffect(() => {
    if (fixed) return;
    const measure = () => {
      const fit = fitFor(
        window.innerWidth - STAGE_GUTTER * 2,
        window.innerHeight - STAGE_GUTTER * 2,
      );
      setScale(Math.max(MIN_SCALE, fit.scale));
      setCrop(fit.crop);
      setPortrait(fit.scale < MIN_SCALE);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [fixed]);
  return { scale, crop, portrait };
};
