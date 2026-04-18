import { type SVGProps, useId } from 'react';

import { cn } from '@/lib/styles.utils';

import { DITHER_BG, DITHER_GRID, DITHER_PATHS } from './logo-dither';

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const LogoIcon = ({ className, size = 24, ...props }: LogoIconProps) => {
  const clipId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${DITHER_GRID} ${DITHER_GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={cn('shrink-0', className)}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <circle
            cx={DITHER_GRID / 2}
            cy={DITHER_GRID / 2}
            r={DITHER_GRID / 2}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
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
};

interface LogoProps {
  size?: number;
}

export const Logo = ({ size = 32 }: LogoProps) => (
  <span
    className={cn(
      'group',
      'grid place-items-center',
      'shrink-0 overflow-hidden rounded-full',
    )}
    style={{ width: size, height: size }}
  >
    <LogoIcon size={size} className="[grid-area:1/1] group-hover:opacity-0" />
    <LogoIcon
      size={size}
      className="group-hover:animate-glitch-shift-slow [grid-area:1/1] opacity-0 group-hover:opacity-80"
      style={{ clipPath: 'inset(10% 0 80% 0)' }}
    />
    <LogoIcon
      size={size}
      className="group-hover:animate-glitch-shift-fast [grid-area:1/1] opacity-0 group-hover:opacity-80"
      style={{ clipPath: 'inset(80% 0 5% 0)' }}
    />
  </span>
);
