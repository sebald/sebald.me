import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stage } from '../stage/stage';
import { Text } from '../text/text';
import { Legend, Window } from './window';

const meta = {
  title: 'Components/Window',
  component: Window,
  args: {
    children: "Great idea! I've put it on the roadmap. Q4. Of next year.",
  },
  argTypes: {
    children: { control: 'text' },
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
  render: args => (
    <Window {...args}>
      {args.children}
      <Legend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'confirm'],
        ]}
        touch="Tap a line"
      />
    </Window>
  ),
};

/** The same legend on the stage itself: the stage puts it in its bottom right corner */
export const OnTheStage: Story = {
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => (
    <Stage scale={Number(globals.scale) || 3} width={200} height={60}>
      <Text className="p-3">The stage</Text>
      <Legend keys={[['Enter', 'start']]} touch="Tap to start" />
    </Stage>
  ),
};
