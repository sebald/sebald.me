import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stamp } from './stamp';

const meta = {
  title: 'Components/Stamp',
  component: Stamp,
  args: { word: 'SHIPPED', tone: 'danger' },
  argTypes: {
    word: { control: 'text' },
    tone: {
      control: 'inline-radio',
      options: ['danger', 'primary'],
      table: { defaultValue: { summary: 'danger' } },
    },
  },
} satisfies Meta<typeof Stamp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One stamp through the controls */
export const Default: Story = {};

const TONES = ['danger', 'primary'] as const;
const WORDS = ['DONE', 'SHIPPED', 'FLAWLESS'] as const;

/** Every tone on a few words: the tilt grows with the word's length */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(3,auto)] items-end gap-x-8 gap-y-6">
      <span />
      {WORDS.map(word => (
        <span key={word} className="text-[0.75em] text-(--bui-dim)">
          {word.length} letters
        </span>
      ))}
      {TONES.flatMap(tone => [
        <span key={tone} className="text-[0.75em] text-(--bui-dim)">
          {tone}
        </span>,
        ...WORDS.map(word => (
          <Stamp key={`${tone}-${word}`} word={word} tone={tone} />
        )),
      ])}
    </div>
  ),
};

/** On a face, the inside darkened so the word reads */
export const OnAFace: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="relative size-[calc(var(--px)*60)] bg-(--bui-paper)">
      <Stamp
        word="DONE"
        className="absolute bottom-[calc(var(--px)*6)] left-[calc(var(--px)*8)]"
      />
    </div>
  ),
};
