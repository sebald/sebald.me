import type { SVGProps } from 'react';

import { cn, toCSSVars } from '@/lib/styles.utils';

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LogoIcon = ({ className, size = 24, ...props }: LogoIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 156.8 206.1"
      height={size}
      className={cn('shrink-0', className)}
      fill="currentColor"
      {...props}
    >
      <path d="M72 203v-4h-6l-1-10v-10h7v-40H61v13h-9v-13h-6l-1 13v14h7v13h-7v7H32v-7h-6v-13h6v-27h-6v-7h-7v-14H0v-13h19V86H0V73h19V53H0V39h19v-6h7v-7h7v-6l4-1h2V0h13v19h20V0h13v19h20V0h13v19a160 160 0 006 0v7h7v7h6v6h20v14h-20v10l1 10h19v13h-20v10l1 9h19v13h-10l-10 1v13h-6v7h-13v14h6v6l1 10v4h-20v-20h6v-7h-6v-7H85v40h7v19l-1 1h-6v7H72zm6-10v-7h-6v13h6zm40-71v-3h6V76h-6v36h-7v6h-6l-7 1v6h20zM39 86V46h6l1-3v-4h46v-6H39v6h-7v47h7z" />
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
      'size-(--logo-size) shrink-0 rounded-full p-(--logo-padding)',
      'bg-mist-700 overflow-hidden',
    )}
    style={toCSSVars({
      'logo-padding': `calc(4 * var(--spacing))`,
      'logo-size': `calc(${size}px + var(--logo-padding) * 2)`,
    })}
  >
    {/* Static icon */}
    <LogoIcon
      size={size}
      className="group-hover:animate-glitch-flash text-mist-400 mt-0.5 [grid-area:1/1]"
    />

    {/* Glitch layers */}
    <LogoIcon
      size={size}
      className="group-hover:animate-glitch-shift-slow mt-0.5 hidden text-rose-500 opacity-50 mix-blend-screen [grid-area:1/1] group-hover:block"
      style={{ clipPath: 'inset(10% 0 80% 0)' }}
    />
    <LogoIcon
      size={size}
      className="group-hover:animate-glitch-shift-fast mt-0.5 hidden text-lime-400 opacity-50 mix-blend-screen [grid-area:1/1] group-hover:block"
      style={{ clipPath: 'inset(80% 0 5% 0)' }}
    />
  </span>
);
