import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    // GitHub tables in the pages, as the pack step's Markdown has them
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  // Tailwind compiles the kit's classes, as in the site
  viteFinal: config => mergeConfig(config, { plugins: [tailwindcss()] }),
};

export default config;
