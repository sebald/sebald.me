import type { Meta, StoryObj } from '@storybook/react-vite';

import { ControlsLayout } from '../controls/controls';
import { ICONS, type IconName } from './icons';
import { PixelIcon } from './pixel-icon';

const NAMES = Object.keys(ICONS) as IconName[];

const meta = {
  title: 'Components/PixelIcon',
  component: PixelIcon,
  args: { icon: 'soundOn' },
  argTypes: {
    icon: { control: 'select', options: NAMES },
  },
} satisfies Meta<typeof PixelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One icon through the controls */
export const Default: Story = {};

/** Every icon in the set, at the stage's pixels and on the tall stage's bar, sized for a thumb */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_auto_auto] items-center gap-x-8 gap-y-4">
      <span />
      <span className="text-[0.75em] text-(--bui-dim)">stage pixels</span>
      <span className="text-[0.75em] text-(--bui-dim)">on the bar</span>
      {NAMES.flatMap(name => [
        <span key={name} className="text-[0.75em] text-(--bui-dim)">
          {name}
        </span>,
        <PixelIcon key={`${name}-stage`} icon={name} />,
        <ControlsLayout key={`${name}-bar`} value="bar">
          <PixelIcon icon={name} />
        </ControlsLayout>,
      ])}
    </div>
  ),
};
