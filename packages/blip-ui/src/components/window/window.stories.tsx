import type { Meta, StoryObj } from '@storybook/react-vite';

import { AMenu as AMenuExample } from './examples/a-menu';
import { OnTheStage as OnTheStageExample } from './examples/on-the-stage';
import { WithLegend as WithLegendExample } from './examples/with-legend';
import { Window } from './window';

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
  render: args => <WithLegendExample {...args} />,
};

/** The same legend on the stage itself: the stage puts it in its bottom right corner */
export const OnTheStage: Story = {
  parameters: { controls: { disable: true } },
  render: () => <OnTheStageExample />,
};

/** A window that is a menu: its title names the list, for a screen reader too */
export const AMenu: Story = {
  parameters: { controls: { disable: true } },
  render: () => <AMenuExample />,
};
