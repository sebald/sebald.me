'use client';

import { Banner } from '../banner';
import { Pixels } from '../stage';

/**
 * The demo's banner across a stage-wide strip at 2x (the column is narrower than 3x), over a light wall
 * and a dark one, so its stripe shows it reads over either
 */
export const BannerDemo = () => (
  <Pixels scale={2} className="max-w-full overflow-hidden leading-[1.35]">
    <div
      className="relative w-[calc(var(--px)*320)] bg-[linear-gradient(90deg,#e9e4d6_0_50%,#2a2f45_50%_100%)]"
      style={{ height: 'calc(var(--px) * 50)' }}
    >
      <Banner y={10} />
    </div>
  </Pixels>
);
