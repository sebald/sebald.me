import type { ImgHTMLAttributes } from 'react';

import { cn, toCSSVars } from '@/lib/styles.utils';

interface LogoIconProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'alt' | 'width' | 'height'
  > {
  size?: number;
}

export const LogoIcon = ({ className, size = 24, ...props }: LogoIconProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/logo.svg"
    alt=""
    width={size}
    height={size}
    className={cn('shrink-0 rounded-full', className)}
    {...props}
  />
);

interface LogoProps {
  size?: number;
}

export const Logo = ({ size = 32 }: LogoProps) => {
  // Preserve the original outer badge size: inner icon + symmetric padding.
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

      {/* Glitch layers — same dither offset & clipped; opacity fades in on hover */}
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
