import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pixels, usePixels } from '../providers/pixels';
import { MoodBoard as Board } from './examples/mood-board';

/**
 * Every control and element of the kit on one sheet, grouped by what the
 * player does with it and captioned with its purpose and its focus mark:
 * the picture to check that the kit still looks like one set. Wider than
 * a stage, so the groups sit side by side; one column on a phone
 */
const meta = {
  title: 'Compositions/Mood board',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Sheet = () => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground) p-edge text-(--bui-text)"
      style={{
        width: pixels.tall
          ? 'calc(var(--px) * 320)'
          : 'max(calc(var(--px) * 320), 76em)',
      }}
    >
      <Board />
    </Pixels>
  );
};

/** The sheet, the menu's setting focused as by the keys: its cursor, arrows and note */
export const MoodBoard: Story = {
  render: () => <Sheet />,
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>('[data-slot=picker-item] [aria-current=true]')
      ?.focus({ focusVisible: true } as FocusOptions);
  },
};
