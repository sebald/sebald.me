import type { Meta, StoryObj } from '@storybook/react-vite';

import { ICONS, type IconName } from './icons';
import { PixelIcon } from './pixel-icon';

const NAMES = Object.keys(ICONS) as IconName[];

const meta = {
  title: 'Components/PixelIcon',
  component: PixelIcon,
  args: { icon: 'soundOn' },
  argTypes: {
    icon: { control: 'select', options: NAMES },
    dot: {
      control: { type: 'number', min: 1, max: 4, step: 0.5 },
      description:
        'CSS pixels per icon pixel; unset, an icon pixel is two thirds of a stage pixel',
    },
  },
} satisfies Meta<typeof PixelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One icon through the controls */
export const Default: Story = {};

/** Every icon in the set, at the stage's pixels and at a thumb's bar size */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_auto_auto] items-center gap-x-8 gap-y-4">
      <span />
      <span className="text-[0.75em] text-(--bui-dim)">stage pixels</span>
      <span className="text-[0.75em] text-(--bui-dim)">dot 1.5</span>
      {NAMES.flatMap(name => [
        <span key={name} className="text-[0.75em] text-(--bui-dim)">
          {name}
        </span>,
        <PixelIcon key={`${name}-stage`} icon={name} />,
        <PixelIcon key={`${name}-bar`} icon={name} dot={1.5} />,
      ])}
    </div>
  ),
};
