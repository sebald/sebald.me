import { useLayoutEffect, useState } from 'react';

import { STAGE, scaleFor } from '@/lib/lab/pushback/stage';

/** The side gutter the stage keeps to the viewport, like the site column */
export const STAGE_GUTTER = 24;

/**
 * The whole-number scale the stage is shown at: the largest that fits the
 * viewport with the gutter, capped by `scaleFor` so the game looks the
 * same on every screen that is big enough. `fixed` pins it (the
 * workbench). `portrait` is a viewport too narrow for even 1x, where the
 * screens show a turn-your-phone notice instead.
 */
export const useScale = (fixed?: number) => {
  const [scale, setScale] = useState(fixed ?? 1);
  const [portrait, setPortrait] = useState(false);
  useLayoutEffect(() => {
    if (fixed) return;
    const measure = () => {
      const width = window.innerWidth - STAGE_GUTTER * 2;
      const height = window.innerHeight - 160;
      setScale(scaleFor(width, Math.max(height, STAGE.height)));
      setPortrait(window.innerWidth < STAGE.width + STAGE_GUTTER * 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [fixed]);
  return { scale, portrait };
};
