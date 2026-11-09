import type { Decorator, Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';

import { Pixels } from '../src/providers/pixels';
import './preview.css';

/**
 * Every story on a stage pixel: the scale and the layout picked in the
 * toolbar, 3x and wide unless a story says otherwise
 */
const withPixels: Decorator = (Story, { globals }) => (
  <Pixels
    scale={Number(globals.scale ?? 3)}
    tall={globals.layout === 'tall'}
    style={{ padding: 24 }}
  >
    <Story />
  </Pixels>
);

const preview: Preview = {
  decorators: [withPixels],
  globalTypes: {
    scale: {
      description: 'Stage pixels per CSS pixel',
      toolbar: {
        title: 'Scale',
        icon: 'zoom',
        items: [
          { value: '1', title: '1x, the tall stage on a phone' },
          { value: '2', title: '2x' },
          { value: '3', title: '3x, a desktop' },
          { value: '4', title: '4x' },
        ],
        dynamicTitle: true,
      },
    },
    layout: {
      description:
        'Wide (a desktop, a phone sideways) or tall (a phone upright)',
      toolbar: {
        title: 'Layout',
        icon: 'mobile',
        items: [
          { value: 'wide', title: 'Wide' },
          { value: 'tall', title: 'Tall, a phone upright' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { scale: '3', layout: 'wide' },
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: { theme: themes.dark },
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
};

export default preview;
