import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pixels } from '../../providers/pixels';
import { IconButton, IconToggle } from '../icon-button/icon-button';
import { Controls } from './controls';

const Buttons = ({ bar }: { bar?: boolean }) => {
  const variant = bar ? 'bar' : 'corner';
  return {
    start: (
      <IconButton
        variant={variant}
        icon="back"
        label="Back"
        aria-label="Back (Esc)"
      />
    ),
    end: (
      <>
        <IconToggle
          variant={variant}
          pressed={false}
          icon="fullscreen"
          pressedIcon="exitFullscreen"
          aria-label="Fullscreen"
          onPressedChange={() => {}}
        />
        <IconToggle
          variant={variant}
          pressed
          icon="soundOff"
          pressedIcon="soundOn"
          label="Sound off"
          pressedLabel="Sound on"
          aria-label="Sound (M)"
          onPressedChange={() => {}}
        />
      </>
    ),
  };
};

const meta = {
  title: 'Components/Controls',
  component: Controls,
  args: { show: 'always' },
  argTypes: {
    start: { control: false },
    end: { control: false },
    startAt: { control: { type: 'number', min: 0, max: 100 } },
    show: {
      control: 'inline-radio',
      options: ['touch', 'always'],
      table: { defaultValue: { summary: 'touch' } },
    },
  },
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The layout follows the toolbar. `show` is `always` here so the corners
 * show without a touch screen; the default is `touch`
 */
export const Default: Story = {
  decorators: [
    Story => (
      <div className="relative h-[calc(var(--px)*107)] w-[calc(var(--px)*160)] max-w-full overflow-hidden border border-dashed border-(--bui-frame-dim) bg-(--bui-ground)">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => {
    const bar = globals.layout === 'tall';
    return (
      <div
        className="contents"
        style={{ ['--bui-bar' as string]: bar ? '52px' : '0px' }}
      >
        <Controls {...args} {...Buttons({ bar })} />
      </div>
    );
  },
};

/** Both layouts side by side: the corners of the wide stage, the tall bar */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-start gap-8">
      <div className="relative h-[calc(var(--px)*107)] w-[calc(var(--px)*160)] border border-dashed border-(--bui-frame-dim) bg-(--bui-ground)">
        <Controls show="always" {...Buttons({})} />
      </div>
      <Pixels
        scale={1}
        tall
        className="h-[480px] w-[320px] border border-dashed border-(--bui-frame-dim) bg-(--bui-ground)"
        style={{ ['--bui-bar' as string]: '52px' }}
      >
        <Controls {...Buttons({ bar: true })} />
      </Pixels>
    </div>
  ),
};
