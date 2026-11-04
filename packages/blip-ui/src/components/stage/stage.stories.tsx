import type { Meta, StoryObj } from '@storybook/react-vite';

import { usePixels } from '../../providers/pixels';
import { Button } from '../button/button';
import { Heading, Muted } from '../text/text';
import { Stage } from './stage';

const Readout = () => {
  const { scale, tall, rows, crop, crisp, backing } = usePixels();
  return (
    <Muted className="absolute bottom-3 left-3">
      {`${scale}x, ${rows} rows, ${tall ? 'tall' : 'wide'}, crop ${crop}, backing ${backing}${crisp ? ', crisp' : ''}`}
    </Muted>
  );
};

const meta = {
  title: 'Components/Stage',
  component: Stage,
  args: {
    width: 320,
    height: 214,
    lift: 0,
    bar: 52,
    label: 'Stage',
  },
  argTypes: {
    scale: { control: { type: 'number', min: 1, max: 4, step: 0.5 } },
    width: {
      control: 'number',
      table: { defaultValue: { summary: '320' } },
    },
    height: {
      control: 'number',
      table: { defaultValue: { summary: '214' } },
    },
    lift: { control: 'number', table: { defaultValue: { summary: '0' } } },
    bar: { control: 'number', table: { defaultValue: { summary: '52' } } },
    crop: { control: 'number', table: { defaultValue: { summary: '0' } } },
    turned: { control: false },
  },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*320)] max-w-none">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stage>;

export default meta;
type Story = StoryObj<typeof meta>;

const Title = () => (
  <Stage.Center>
    <Heading>Pushback</Heading>
    <Button>Start</Button>
    <Readout />
  </Stage.Center>
);

/**
 * The stage at a fixed scale: the toolbar's, unless `scale` is set in the
 * controls. Unset in a game, it fits the viewport (see Fitted)
 */
export const Default: Story = {
  render: (args, { globals }) => (
    <Stage {...args} scale={args.scale ?? Number(globals.scale ?? 3)}>
      <Title />
    </Stage>
  ),
};

/**
 * Fitted to the viewport, as a game uses it: 3x where there is room, less
 * below, tall on a phone held upright, `turned` on one held sideways. It
 * breaks out of its column to the window's centre, so it is shown in the
 * frame on its own. Resize the preview, or use the toolbar's layout, to see
 * it follow.
 */
export const Fitted: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  decorators: [Story => <Story />],
  render: () => (
    <Stage
      label="Stage"
      turned={
        <>
          <p className="m-0 text-(--bui-primary)">Turn your phone upright.</p>
          <p className="m-0 text-(--bui-muted)">The meeting will wait.</p>
        </>
      }
    >
      <Title />
    </Stage>
  ),
};
