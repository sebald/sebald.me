import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pixels } from '../../providers/pixels';
import { IconButton, IconToggle } from '../icon-button/icon-button';
import { Controls } from './controls';

/** The usual two groups: Back at the start, fullscreen and the sound at the end */
const Groups = () => (
  <>
    <IconButton slot="leave" icon="back" label="Back" aria-label="Back (Esc)" />

    <IconToggle
      pressed={false}
      icon="fullscreen"
      pressedIcon="exitFullscreen"
      aria-label="Fullscreen"
      onPressedChange={() => {}}
    />
    <IconToggle
      pressed
      icon="soundOff"
      pressedIcon="soundOn"
      label="Sound off"
      pressedLabel="Sound on"
      aria-label="Sound (M)"
      onPressedChange={() => {}}
    />
  </>
);

const meta = {
  title: 'Components/Controls',
  component: Controls,
  args: { show: 'always', children: null },
  argTypes: {
    children: { control: false },
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
      <div className="relative h-[calc(var(--px)*107)] w-[calc(var(--px)*160)] max-w-full overflow-hidden border border-dashed border-(--bui-frame-dim) bg-(--bui-ground) tall:h-[480px] tall:w-[320px]">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => (
    <div
      className="contents"
      style={{
        ['--bui-bar' as string]: globals.layout === 'tall' ? '52px' : '0px',
      }}
    >
      <Controls {...args}>
        <Groups />
      </Controls>
    </div>
  ),
};

/** Both layouts side by side: the corners of the wide stage, the tall bar; the same JSX in each */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  // Held upright there are no corners, only the bar: the wide frame
  // would turn tall with everything around it
  render: (_, { globals }) => (
    <div className="flex flex-wrap items-start gap-8">
      <div
        hidden={globals.layout === 'tall'}
        className="relative h-[calc(var(--px)*107)] w-[calc(var(--px)*160)] border border-dashed border-(--bui-frame-dim) bg-(--bui-ground)"
      >
        <Controls show="always">
          <Groups />
        </Controls>
      </div>
      <Pixels
        scale={1}
        tall
        className="relative h-[480px] w-[320px] border border-dashed border-(--bui-frame-dim) bg-(--bui-ground)"
        style={{ ['--bui-bar' as string]: '52px' }}
      >
        <Controls>
          <Groups />
        </Controls>
      </Pixels>
    </div>
  ),
};
