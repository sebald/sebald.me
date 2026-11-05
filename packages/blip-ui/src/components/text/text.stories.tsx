import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading, ScreenTitle, Text } from './text';

const meta = {
  title: 'Components/Text',
  component: Text,
  args: { children: 'Pick your counter.', variant: 'hint' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['hint', 'call'],
      table: { defaultValue: { summary: 'hint' } },
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A line through the controls */
export const Default: Story = {};

const Label = ({ children }: { children: string }) => (
  <span className="text-[0.75em] text-(--bui-dim)">{children}</span>
);

/** The letters by role side by side: a heading, both variants of Text, a screen's title */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*260)] max-w-full grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3">
      <Label>Heading</Label>
      <Heading>Your run as the PM</Heading>
      <Label>hint</Label>
      <Text>Pick your counter.</Text>
      <Label>call</Label>
      <Text variant="call">Press Enter to play</Text>
      <Label>ScreenTitle</Label>
      {/* Its top, the bitmap letters (18 stage pixels) and the blurb under them */}
      <div className="relative h-[calc(var(--px)*26+var(--bui-px)*2+1.5em)]">
        <ScreenTitle blurb="Whose side are you on today?">
          Pick a role
        </ScreenTitle>
      </div>
    </div>
  ),
};
