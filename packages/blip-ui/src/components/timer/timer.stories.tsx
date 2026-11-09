import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Timer } from './timer';

const DURATION = 10_000;

const meta = {
  title: 'Components/Timer',
  component: Timer,
  args: {
    duration: DURATION,
    remaining: 7_000,
    warnAt: 0.5,
    criticalAt: 0.25,
    paused: false,
    sound: false,
  },
  argTypes: {
    duration: { control: { type: 'number', min: 1000, step: 1000 } },
    remaining: { control: { type: 'number', min: 0, step: 500 } },
    warnAt: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { defaultValue: { summary: '0.5' } },
    },
    criticalAt: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { defaultValue: { summary: '0.25' } },
    },
    paused: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    sound: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof Timer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Set the time left through the controls */
export const Default: Story = {};

const POINTS = [
  { name: 'full', remaining: DURATION },
  { name: 'under 50% left', remaining: 0.45 * DURATION },
  { name: 'under 25% left', remaining: 0.2 * DURATION },
  { name: 'zero', remaining: 0 },
] as const;

/**
 * The timer at fixed points of its time, paused so nothing blinks: the
 * phases side by side (and what the visual tests compare)
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-6">
      {POINTS.map(point => (
        <div key={point.name} className="flex flex-col items-center gap-2">
          <Timer duration={DURATION} remaining={point.remaining} paused />
          <span className="text-[0.75em] text-(--bui-dim)">{point.name}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Running down ten seconds, then starting over: it blinks from half on.
 * A live clock, so the visual tests leave it out (`no-vrt`); Overview
 * shows the same phases at fixed points.
 */
export const Running: Story = {
  tags: ['no-vrt'],
  parameters: { controls: { disable: true } },
  render: () => {
    const Run = () => {
      const [elapsed, setElapsed] = useState(0);
      useEffect(() => {
        const start = performance.now();
        const id = setInterval(
          () => setElapsed((performance.now() - start) % (DURATION + 1500)),
          50,
        );
        return () => clearInterval(id);
      }, []);
      return (
        <Timer
          duration={DURATION}
          remaining={Math.max(0, DURATION - elapsed)}
        />
      );
    };
    return <Run />;
  },
};
