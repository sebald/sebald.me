'use client';

import { useEffect, useId, useState } from 'react';

import { cn } from '@/lib/styles.utils';

import { DITHER_GRID, DITHER_PATHS } from './logo-dither';

export type PaletteName = 'mist' | 'dawn' | 'noon' | 'sunset';

export interface Palette {
  name: PaletteName;
  bg: string;
  light: string;
  mid: string;
  dark: string;
}

const MIST: Palette = {
  name: 'mist',
  bg: 'oklch(0.86 0.02 233)',
  light: 'oklch(0.74 0.03 238)',
  mid: 'oklch(0.6 0.04 250)',
  dark: 'oklch(0.48 0.05 260)',
};

const DAWN: Palette = {
  name: 'dawn',
  bg: 'oklch(0.892 0.058 10.001)',
  light: 'oklch(0.712 0.194 13.428)',
  mid: 'oklch(0.514 0.222 16.935)',
  dark: 'oklch(0.41 0.159 10.272)',
};

const NOON: Palette = {
  name: 'noon',
  bg: 'oklch(0.962 0.059 95.617)',
  light: 'oklch(0.924 0.12 95.746)',
  mid: 'oklch(0.828 0.189 84.429)',
  dark: 'oklch(0.666 0.179 58.318)',
};

const SUNSET: Palette = {
  name: 'sunset',
  bg: 'oklch(0.901 0.076 70.697)',
  light: 'oklch(0.837 0.128 66.29)',
  mid: 'oklch(0.705 0.213 47.604)',
  dark: 'oklch(0.553 0.195 38.402)',
};

const INK_ORDER = ['dark', 'mid', 'light'] as const;

export const paletteForHour = (hour: number): Palette => {
  const h = hour % 24;
  if (h >= 22 || h < 5) return MIST;
  if (h < 10) return DAWN;
  if (h < 16) return NOON;
  return SUNSET;
};

export const angleForHour = (hour: number): number => (hour % 12) * 30;

const getBerlinHour = (date: Date = new Date()): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? '0');
  return (hour % 24) + minute / 60;
};

const SSR_DEFAULT_HOUR = 12;
const TICK_MS = 60_000;
const BG_PATH = `M0 0h${DITHER_GRID}v${DITHER_GRID}h-${DITHER_GRID}`;
const FILL_TRANSITION = { transition: 'fill 2s linear' } as const;

interface TimeLogoProps {
  /**
   * Fractional hour in [0, 24). Overrides live Berlin time — useful for
   * debugging and previewing specific hours.
   */
  hour?: number;
  size?: number;
  className?: string;
}

export const TimeLogo = ({
  hour: hourProp,
  size = 32,
  className,
}: TimeLogoProps) => {
  const clipId = useId();
  const [liveHour, setLiveHour] = useState<number | null>(null);

  useEffect(() => {
    if (hourProp !== undefined) return;
    const tick = () => setLiveHour(getBerlinHour());
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [hourProp]);

  const hour = hourProp ?? liveHour ?? SSR_DEFAULT_HOUR;
  const palette = paletteForHour(hour);
  const angle = angleForHour(hour);
  const center = DITHER_GRID / 2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${DITHER_GRID} ${DITHER_GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={cn('shrink-0', className)}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={center} cy={center} r={center} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`rotate(${angle} ${center} ${center})`}>
          <path fill={palette.bg} style={FILL_TRANSITION} d={BG_PATH} />
          {DITHER_PATHS.map((p, i) => {
            const ink = INK_ORDER[i];
            return (
              <path
                key={ink}
                fill={palette[ink]}
                style={FILL_TRANSITION}
                d={p.d}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};
