import type { SVGProps } from 'react';

import { cn, toCSSVars } from '@/lib/styles.utils';

import { DITHER_BG, DITHER_GRID, DITHER_PATHS } from './logo-dither';

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LogoIcon = ({ className, size = 24, ...props }: LogoIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${DITHER_GRID} ${DITHER_GRID}`}
    width={size}
    height={size}
    shapeRendering="crispEdges"
    className={cn('shrink-0 rounded-full', className)}
    {...props}
  >
    <defs>
      <clipPath id="logo-clip">
        <circle
          cx={DITHER_GRID / 2}
          cy={DITHER_GRID / 2}
          r={DITHER_GRID / 2}
        />
      </clipPath>
    </defs>
    <g clipPath="url(#logo-clip)">
      <path
        fill={DITHER_BG}
        d={`M0 0h${DITHER_GRID}v${DITHER_GRID}h-${DITHER_GRID}`}
      />
      {DITHER_PATHS.map(({ color, d }) => (
        <path key={color} fill={color} d={d} />
      ))}
    </g>
  </svg>
);

interface LogoProps {
  size?: number;
}

export const Logo = ({ size = 32 }: LogoProps) => {
  const outer = size + 32;
  return (
    <span
      className={cn(
        'group',
        'grid place-items-center',
        'size-(--logo-size) shrink-0 overflow-hidden rounded-full',
      )}
      style={toCSSVars({ 'logo-size': `${outer}px` })}
    >
      <LogoIcon
        size={outer}
        className="[grid-area:1/1] group-hover:opacity-0"
      />

      {/* Glitch layers — same dither offset & clipped; fade in on hover */}
      <LogoIcon
        size={outer}
        className="group-hover:animate-glitch-shift-slow [grid-area:1/1] opacity-0 group-hover:opacity-80"
        style={{ clipPath: 'inset(10% 0 80% 0)' }}
      />
      <LogoIcon
        size={outer}
        className="group-hover:animate-glitch-shift-fast [grid-area:1/1] opacity-0 group-hover:opacity-80"
        style={{ clipPath: 'inset(80% 0 5% 0)' }}
      />
    </span>
  );
};
