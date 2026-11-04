import type { Decorator, Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';

import './preview.css';

/** The stage's font size at a scale, as the game sizes it */
const fontSizeFor = (scale: number) =>
  Math.max(14, Math.round((16 * scale) / 3));

/**
 * Every story on a stage pixel: `--px` and the font size of the scale
 * picked in the toolbar, 3x unless a story says otherwise
 */
const withPixels: Decorator = (Story, { globals }) => {
  const scale = Number(globals.scale ?? 3);
  return (
    <div
      style={{
        ['--px' as string]: `${scale}px`,
        fontSize: fontSizeFor(scale),
        padding: 24,
      }}
    >
      <Story />
    </div>
  );
};

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
  },
  initialGlobals: { scale: '3' },
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: { theme: themes.dark },
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
};

export default preview;
