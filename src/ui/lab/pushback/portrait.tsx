import type { SheetId } from '@/lib/lab/pushback/sprites';

import { SHEETS } from './sheets';
import { px } from './stage';

/**
 * A look's face: the head square `features.mjs` found in the idle cell,
 * as a CSS sprite at `scale` times the stage's pixels (twice on the
 * select screen), hard edges. `inset` crops that many pixels off every
 * side, for a smaller face that keeps whole pixels (the roster's rows).
 */
export const Portrait = ({
  sheet,
  scale = 2,
  mirrored = false,
  inset = 0,
}: {
  sheet: SheetId;
  /** Pixels of the portrait per stage pixel */
  scale?: number;
  /** Facing the other way: the opponent's, looking at the player */
  mirrored?: boolean;
  /** Pixels of the head square cut off each side */
  inset?: number;
}) => {
  const { image, meta } = SHEETS[sheet];
  const head = meta.features?.head ?? {
    x: 24,
    y: 32,
    width: 24,
    height: 24,
  };
  const s = scale;
  return (
    <span
      aria-hidden
      className="block [image-rendering:pixelated]"
      style={{
        width: px((head.width - 2 * inset) * s),
        height: px((head.height - 2 * inset) * s),
        backgroundImage: `url(${image.src})`,
        backgroundSize: `${px(meta.cell.width * meta.count * s)} ${px(meta.cell.height * s)}`,
        backgroundPosition: `${px(-(head.x + inset) * s)} ${px(-(head.y + inset) * s)}`,
        backgroundRepeat: 'no-repeat',
        transform: mirrored ? 'scaleX(-1)' : undefined,
      }}
    />
  );
};
