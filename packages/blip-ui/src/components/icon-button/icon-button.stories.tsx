import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ICONS, type IconName } from '../pixel-icon/icons';
import { IconButton, IconToggle } from './icon-button';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    icon: 'back',
    'aria-label': 'Back (Esc)',
    variant: 'corner',
    label: 'Back',
    labelFirst: false,
    disabled: false,
  },
  argTypes: {
    icon: { control: 'select', options: Object.keys(ICONS) as IconName[] },
    variant: {
      control: 'inline-radio',
      options: ['corner', 'bar'],
      table: { defaultValue: { summary: 'corner' } },
    },
    labelFirst: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One button through the controls; the label shows on the bar variant */
export const Default: Story = {};

const Label = ({ children }: { children: string }) => (
  <span className="text-[0.75em] text-(--bui-dim)">{children}</span>
);

/**
 * Both variants, as a button and as a toggle in each state, and disabled:
 * the one place they are side by side (and what the visual tests compare)
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(4,auto)] items-center gap-x-6 gap-y-3">
      <span />
      <Label>button</Label>
      <Label>toggle off</Label>
      <Label>toggle on</Label>
      <Label>disabled</Label>
      {(['corner', 'bar'] as const).flatMap(variant => [
        <Label key={variant}>{variant}</Label>,
        <IconButton
          key={`${variant}-button`}
          variant={variant}
          icon="back"
          label="Back"
          aria-label="Back"
        />,
        <IconToggle
          key={`${variant}-off`}
          variant={variant}
          pressed={false}
          icon="soundOff"
          pressedIcon="soundOn"
          label="Sound off"
          pressedLabel="Sound on"
          aria-label="Sound"
          onPressedChange={() => {}}
        />,
        <IconToggle
          key={`${variant}-on`}
          variant={variant}
          pressed
          icon="soundOff"
          pressedIcon="soundOn"
          label="Sound off"
          pressedLabel="Sound on"
          aria-label="Sound"
          onPressedChange={() => {}}
        />,
        <IconButton
          key={`${variant}-disabled`}
          variant={variant}
          icon="pause"
          label="Pause"
          aria-label="Pause"
          disabled
        />,
      ])}
    </div>
  ),
};

const SoundDemo = () => {
  const [on, setOn] = useState(true);
  return (
    <IconToggle
      pressed={on}
      onPressedChange={setOn}
      icon="soundOff"
      pressedIcon="soundOn"
      aria-label="Sound (M)"
    />
  );
};

/** A toggle whose state lives with the caller, like the sound button */
export const SoundToggle: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SoundDemo />,
};
