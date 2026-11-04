import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading, Loud, Muted, ScreenTitle } from './text';

const meta = {
  title: 'Components/Text',
  component: Heading,
  args: { children: 'Your run as the PM', level: 2 },
  argTypes: {
    level: {
      control: 'inline-radio',
      options: [2, 3],
      table: { defaultValue: { summary: '2' } },
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingStory: Story = { name: 'Heading' };

/** A muted line: a prompt, a blurb, a hint */
export const MutedStory: Story = {
  name: 'Muted',
  render: ({ children }) => <Muted>{children}</Muted>,
  args: { children: 'Pick your counter.' },
};

/** The loud line, blinking at the arcade rhythm */
export const LoudStory: Story = {
  name: 'Loud',
  render: ({ children }) => <Loud>{children}</Loud>,
  args: { children: "I haven't said no since 2015." },
};

/** A menu screen's title along the stage's top */
export const ScreenTitleStory: Story = {
  name: 'ScreenTitle',
  render: ({ children }) => (
    <div className="relative h-[calc(var(--px)*8+4.5em)]">
      <ScreenTitle blurb="Whose side are you on today?">{children}</ScreenTitle>
    </div>
  ),
  args: { children: 'Pick a role' },
};
