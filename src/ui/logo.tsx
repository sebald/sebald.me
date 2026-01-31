import type { CSSProperties, SVGProps } from 'react';

import { cn } from '@/lib/styles.utils';

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const LogoIcon = ({ className, size = 24, ...props }: LogoIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 833.958 1058.506"
      height={size}
      className={cn('[grid-area:1/1]', className)}
      fill="currentColor"
      {...props}
    >
      <path d="M412 1058c-15-2-32-12-41-24-11-15-14-28-13-51 1-15 2-22 5-28l3-8 1-5 5-10a1348 1348 0 0116-46 193519 193519 0 017-31 331 331 0 007-47 326 326 0 00-34-118c-8-13-20-35-33-41a99 99 0 00-17-6c-4-2-24-5-36-4-11 0-24 15 4 19l10 3 8 3 4 2 2 1 5 3 5 3 5 4 7 4 1 2 2 3c3 3 9 11 9 13l2 5 1 7v3l-24 1h-24l-8 4c-25 12-36 25-22 58l7 18c2 8 2 10 1 18-1 10-4 18-10 24-7 7-9 11-19 11-8 1-10 0-15-1-7-3-12-13-14-19-3-5-5-11-5-16 0-6 3-19 7-27 7-15 8-18 8-28-1-8-4-10-8-18-3-7-6-10-13-16-4-5-10-9-13-10-24-12-32-17-42-27a117 117 0 01-31-55c-1-2-5-2-44-2a183 183 0 01-51-4 45 45 0 01-25-28c-2-3-2-16 0-24l2-9c1-4 6-10 11-14a450 450 0 0014-8l4-1c1-1 13-2 45-2l43-1v-65l-1-9H77a561 561 0 01-47-2l-10-5c-9-6-14-13-18-24-2-6-3-9-2-15l1-8 2-6c0-3 2-6 4-9 7-8 11-12 13-12l2-2 7-3c4-1 10-2 48-2l43-1v-75H75c-24 0-45-1-47-2-4-1-13-6-13-7l-3-4c-3-2-4-4-8-13-2-5-3-6-3-17 0-13 2-18 6-25 4-5 11-12 13-12l3-2 5-3 5-1c2-2 27-3 57-2l30-1 1-6 1-10 2-8 4-10 2-8 2-2 2-4 4-8 2-4c0-2 22-24 25-25l5-3c5-3 16-9 24-11l8-3 7-2h5l1-37c0-35 0-37 2-42 4-10 12-19 20-23l8-3 2-1 10-1c8 0 9 0 16 3l12 7c5 4 11 12 11 16l2 4c1 2 2 6 2 40v37h74V69a244 244 0 013-44c0-3 12-16 18-19 14-8 27-8 43 0l7 5 4 3 8 13 1 42 1 38h74V70a304 304 0 014-45c1-5 10-15 17-19l10-5c6-1 20-2 23 0l8 3 15 12 3 4c4 5 5 10 5 50l1 37h4l6 1 5 2c3 0 13 3 14 5l5 2 5 3 3 1 5 3 5 4a143 143 0 0122 22l2 3 2 4 3 5 2 4 2 4 2 5 2 4c2 4 3 13 3 21 0 13-4 12 43 12 46 0 48 0 60 8 7 5 16 16 16 20l2 4c2 2 2 20-1 25l-2 6c0 3-11 17-16 19-10 6-11 6-58 6h-43v75h3l44 1h42l7 4c9 5 20 16 22 23l2 4c2 2 2 23 0 25l-2 3c0 2-2 6-6 11-4 6-7 9-12 12l-10 4-3 1-44 1h-43v37c0 35 0 38 2 38h86l5 3c17 9 27 22 28 40 1 8 0 9-2 16l-5 8-2 4c0 2-9 11-15 14-11 5-8 5-54 4l-43 1-1 5-1 4-1 4-2 7-3 6-1 2-2 3-3 5-4 7c-2 5-17 21-23 25-8 5-26 21-29 25a67 67 0 00-12 26c-4 11-6 22-3 34 0 4 2 5 2 7l3 8 3 9 10 24c9 23 9 24 9 35 1 11 2 14-3 23-5 10-9 16-19 21-20 10-39 10-55-7-13-12-13-26-7-50l10-33 6-21 2-10c3-13 3-8 3-19l-3-15-2-4-3-9c-2-6-4-9-9-14l-12-9-5-3h-34c-27 0-34-1-34-2-1-2 4-13 8-20a124 124 0 0131-28l9-4 10-3 4-1c1-2 6-3 21-4l12-2 6-1 8-3 6-2 4-3 4-3c3 0 15-11 22-19a77 77 0 0010-13l2-5 2-5 1-4v-4l3-8 1-11c5-51 0-102-1-153l-2-20-2-7c-2-9-17-13-19-6l-1 8-2 11-3 15-1 8a386 386 0 00-7 76l-2 21-1 25a116 116 0 01-12 38l-3 4-7 6c-5 6-13 12-16 12l-2 1-18 4a202 202 0 00-38 9c-19 4-25 25-32 39a182 182 0 01-16 27l-2 5-2 6a252 252 0 00-17 68 227 227 0 008 101l2 11a343 343 0 0013 36l9 24a125 125 0 019 70c-5 21-23 40-43 46-9 3-23 4-33 3zm6-31c4-4 4-10-2-14a77 77 0 01-16-25c-3-8-3-9-2-26l-1-18c-2-4-10 9-14 24-2 9-2 26 0 33 3 12 10 22 17 26 5 3 16 3 18 0zM204 502l2-7 1-7a404 404 0 005-46l3-41 2-28 1-44a164 164 0 013-48l1-10 2-7 1-5 1-4 2-4 3-6a100 100 0 0130-27c1-1 7-4 14-5 10-3 13-3 27-3l35-2a696 696 0 0181-2l32-2a559 559 0 0066-8l12-4c5-1 18-3 18-6 1-10-32-15-155-15-107-1-131-1-137 1-10 1-12 2-12 3l-3 1-12 5c-15 8-29 23-35 36l-3 4-2 4-1 4c-4 4-4 18-4 103l1 130 1 21 1 9c2 2 18 13 19 10zm68-126l1-3 2-4 1-5 1-5 2-4 4-15 1-3 1-3 8-16 3-4 7-8c11-13 21-21 36-28 32-16 33-16 33-24 0-6-2-7-16-10-10-2-14-2-27-2a86 86 0 00-37 8l-3 1-5 5c-8 5-15 12-19 19l-5 6-1 4-1 4-4 15-2 7a186 186 0 002 47c1 5 4 16 6 18 3 2 9 3 12 0z" />
    </svg>
  );
};

export const Logo = ({ className, size = 24, ...props }: LogoIconProps) => {
  return (
    <span
      className={cn(
        'relative grid items-center justify-center',
        'size-(--logo-size) shrink-0 rounded-full',
        'text-mist-300/70 overflow-hidden',
        className,
      )}
      style={
        {
          '--logo-padding': `calc(4 * var(--spacing))`,
          '--logo-size': `calc(${size}px + var(--logo-padding) * 2)`,
        } as CSSProperties
      }
    >
      {/* Background with noise texture and gradient */}
      <svg
        className="absolute inset-0 size-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <linearGradient id="bg-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              style={{
                stopColor: 'oklch(from var(--color-mist-900) l c h / 0.9',
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor: 'oklch(from var(--color-mist-700) l c h / 0.7',
              }}
            />
          </linearGradient>
        </defs>
        <circle cx="50%" cy="50%" r="50%" fill="url(#bg-gradient)" />
        <circle
          cx="50%"
          cy="50%"
          r="50%"
          fill="white"
          filter="url(#noise-filter)"
          style={{ mixBlendMode: 'overlay' }}
          opacity="0.5"
        />
      </svg>

      {/* Logo icon on top */}
      <LogoIcon size={size} className="relative z-10 mt-1" {...props} />
    </span>
  );
};
