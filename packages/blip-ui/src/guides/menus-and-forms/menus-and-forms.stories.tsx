import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { TALL_BAR } from '../../components/stage/stage';
import { Pixels, usePixels } from '../../providers/pixels';
import { MenuAndForm as MenuAndFormExample } from './examples/menu-and-form';

/** A whole stage for the screen: 320 stage pixels wide, 214 high, a phone's height upright */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="relative shrink-0 overflow-hidden bg-(--bui-ground) text-(--bui-text)"
      style={{
        width: 'calc(var(--px) * 320)',
        height: `calc(var(--px) * ${pixels.tall ? 500 : 214})`,
        ['--bui-bar' as string]: `${pixels.tall ? TALL_BAR : 0}px`,
      }}
    >
      {children}
    </Pixels>
  );
};

const meta = {
  title: 'Guides/Menus and forms',
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A menu window and a form window on one screen, side by side */
export const MenuAndForm: Story = {
  name: 'Menu and form',
  // Two windows on a whole stage have no room for their words at 1x,
  // which a game never shows (under `MIN_SCALE`, 2.25)
  tags: ['no-vrt-1x'],
  render: () => <MenuAndFormExample />,
};
