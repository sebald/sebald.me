import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Controls } from '../controls/controls';
import { ICONS, type IconName } from '../pixel-icon/icons';
import { IconButton, IconToggle } from './icon-button';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    icon: 'back',
    'aria-label': 'Back (Esc)',
    label: 'Back',
    disabled: false,
  },
  argTypes: {
    icon: { control: 'select', options: Object.keys(ICONS) as IconName[] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One button on its own, as in a corner: the icon alone; the label shows in the tall stage's bar */
export const Default: Story = {};

const Label = ({ children }: { children: string }) => (
  <span className="text-[0.75em] text-(--bui-dim)">{children}</span>
);

/** A button and a disabled one at the start, a toggle off and on at the end */
const States = () => (
  <>
    <IconButton slot="leave" icon="back" label="Back" aria-label="Back" />
    <IconButton
      slot="leave"
      icon="pause"
      label="Pause"
      aria-label="Pause"
      disabled
    />
    <IconToggle
      pressed={false}
      icon="soundOff"
      pressedIcon="soundOn"
      label="Sound off"
      pressedLabel="Sound on"
      aria-label="Sound"
      onPressedChange={() => {}}
    />
    <IconToggle
      pressed
      icon="soundOff"
      pressedIcon="soundOn"
      label="Sound off"
      pressedLabel="Sound on"
      aria-label="Sound"
      onPressedChange={() => {}}
    />
  </>
);

/** The wide stage's top at the story's scale, also on a phone: the corners, never the bar */
const Corner = () => {
  const { scale } = usePixels();
  return (
    <Pixels
      scale={scale}
      tall={false}
      className="relative h-[calc(var(--px)*24)] w-[calc(var(--px)*120)] max-w-full"
    >
      <Controls show="always">
        <States />
      </Controls>
    </Pixels>
  );
};

/**
 * Where it is sets its look, the JSX the same: in a corner of the wide
 * stage the icon alone, in the tall stage's bar the icon and its label;
 * a button, a toggle off and on, and disabled
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit gap-y-3">
      <Label>corner</Label>
      <Corner />
      <Label>bar</Label>
      <Pixels
        scale={1}
        tall
        className="relative h-[60px] w-[480px]"
        style={{ ['--bui-bar' as string]: '52px' }}
      >
        <Controls>
          <States />
        </Controls>
      </Pixels>
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
