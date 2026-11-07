import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Line } from '../line/line';
import { Window } from '../window/window';
import { Typewriter } from './typewriter';

const LINE = "Let's take this offline and circle back next sprint.";

const meta = {
  title: 'Components/Typewriter',
  component: Typewriter,
  args: { children: LINE, typed: 20, sound: false },
  argTypes: {
    children: { control: 'text' },
    typed: { control: { type: 'range', min: 0, max: LINE.length, step: 1 } },
    sound: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*160)] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Typewriter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** How much is typed, through the controls */
export const Default: Story = {};

const POINTS = [
  { name: 'nothing yet', typed: 0 },
  { name: 'half way', typed: Math.floor(LINE.length / 2) },
  { name: 'typed out', typed: LINE.length },
] as const;

/**
 * A line at fixed points of its typing, each in a box that keeps its size:
 * the rest of the line holds its room (what the visual tests compare)
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*260)] max-w-full gap-4">
      {POINTS.map(({ name, typed }) => (
        <div key={name} className="grid gap-1">
          <span className="text-[0.75em] text-(--bui-dim)">{name}</span>
          <Window>
            <Line>
              <Typewriter typed={typed}>{LINE}</Typewriter>
            </Line>
          </Window>
        </div>
      ))}
    </div>
  ),
};

/** A line typing, 30 characters a second, then again after a pause */
const Typing = () => {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setTyped(n => (n > LINE.length + 30 ? 0 : n + 1)),
      1000 / 30,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Window>
      <Line variant="secondary">
        <Typewriter typed={typed} sound>
          {LINE}
        </Typewriter>
      </Line>
    </Window>
  );
};

/** Typing in a dialogue line, 30 characters a second, then again */
export const Running: Story = {
  tags: ['no-vrt'],
  parameters: { controls: { disable: true } },
  render: () => <Typing />,
};
