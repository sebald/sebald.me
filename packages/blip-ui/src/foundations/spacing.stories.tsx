import type { Meta, StoryObj } from '@storybook/react-vite';

import { FLOOR, SPACING, type SpacingRole, px } from './pixel';

const meta = {
  title: 'Foundations/Spacing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const GROUPS: { name: string; roles: SpacingRole[] }[] = [
  { name: 'Gap', roles: ['joined', 'related', 'regular', 'section'] },
  { name: 'Inset', roles: ['control', 'control-x', 'window', 'edge'] },
  {
    name: 'Cursor',
    roles: ['cursor', 'cursor-clear', 'cursor-apart', 'cursor-column'],
  },
];

/** Every role as a bar of its length in stage pixels, the cursor's in the primary colour */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-section text-[0.85em] text-(--bui-text)">
      {GROUPS.map(group => (
        <div key={group.name} className="grid gap-related">
          <div className="text-(--bui-muted)">{group.name}</div>
          {group.roles.map(role => (
            <div
              key={role}
              className="grid grid-cols-[max-content_2ch_auto] items-center gap-x-regular whitespace-nowrap"
            >
              <code>{role}</code>
              <span className="text-right text-(--bui-dim)">
                {SPACING[role]}
              </span>
              <span
                aria-hidden
                className={
                  group.name === 'Cursor'
                    ? 'bg-(--bui-primary)'
                    : 'bg-(--bui-text)'
                }
                style={{
                  width: px(SPACING[role], FLOOR),
                  height: px(3, FLOOR),
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
