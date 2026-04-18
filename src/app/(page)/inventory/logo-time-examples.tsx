'use client';

import { useState } from 'react';

import { angleForHour, paletteForHour, TimeLogo } from '@/ui/logo-time';
import { Text } from '@/ui/text';

const formatHour = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const PALETTE_SHOWCASE = [
  { label: 'Mist', hour: 3 },
  { label: 'Dawn', hour: 7 },
  { label: 'Noon', hour: 12 },
  { label: 'Sunset', hour: 18 },
] as const;

const SIZES = [24, 32, 48, 64, 96, 128] as const;

export const TimeLogoExamples = () => {
  const [scrubHour, setScrubHour] = useState(12);

  return (
    <div className="grid gap-12">
      <div className="grid gap-4">
        <Text variant="muted" size="caption">
          Scrub hour (interactive)
        </Text>
        <div className="flex flex-wrap items-center gap-6">
          <TimeLogo size={96} hour={scrubHour} />
          <div className="grid min-w-[16rem] flex-1 gap-2">
            <input
              type="range"
              min={0}
              max={23.99}
              step={0.1}
              value={scrubHour}
              onChange={e => setScrubHour(Number(e.target.value))}
              className="accent-mist-400 w-full"
              aria-label="Hour"
            />
            <Text variant="muted" size="caption">
              {formatHour(scrubHour)} · {paletteForHour(scrubHour).name} ·{' '}
              {angleForHour(scrubHour).toFixed(0)}°
            </Text>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Text variant="muted" size="caption">
          Live — Berlin time, ticks every minute
        </Text>
        <TimeLogo size={96} />
      </div>

      <div className="grid gap-4">
        <Text variant="muted" size="caption">
          Every hour 00 – 23
        </Text>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex flex-col items-center gap-2">
              <TimeLogo size={48} hour={h} />
              <Text variant="muted" size="caption">
                {String(h).padStart(2, '0')}:00
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <Text variant="muted" size="caption">
          Palettes
        </Text>
        <div className="flex flex-wrap gap-8">
          {PALETTE_SHOWCASE.map(({ label, hour }) => (
            <div key={hour} className="flex flex-col items-center gap-2">
              <TimeLogo size={96} hour={hour} />
              <Text variant="muted" size="caption">
                {label} · {String(hour).padStart(2, '0')}:00
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <Text variant="muted" size="caption">
          Sizes (live)
        </Text>
        <div className="flex flex-wrap items-end gap-6">
          {SIZES.map(size => (
            <div key={size} className="flex flex-col items-center gap-2">
              <TimeLogo size={size} />
              <Text variant="muted" size="caption">
                {size}px
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
