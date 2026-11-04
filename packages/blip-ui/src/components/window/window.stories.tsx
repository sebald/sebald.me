import type { Meta, StoryObj } from '@storybook/react-vite';

import { Muted } from '../text/text';
import { CornerLegend, Legend, Window } from './window';

const meta = {
  title: 'Components/Window',
  component: Window,
  args: {
    children: "Great idea! I've put it on the roadmap. Q4. Of next year.",
  },
  argTypes: {
    children: { control: 'text' },
    legend: { control: false },
  },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*200)] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With the control hints along the bottom: the keys, or the one line for touch */
export const WithLegend: Story = {
  args: {
    legend: (
      <Legend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'confirm'],
        ]}
        touch="Tap a line"
      />
    ),
  },
};

/** The legend on its own, in a stage's bottom right corner */
export const Corner: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="relative h-[calc(var(--px)*60)] w-[calc(var(--px)*200)] max-w-full border border-dashed border-(--bui-frame-dim)">
      <Muted className="p-3">The stage</Muted>
      <CornerLegend keys={[['Enter', 'start']]} touch="Tap to start" />
    </div>
  ),
};
