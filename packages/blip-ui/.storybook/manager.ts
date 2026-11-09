import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Blip UI',
    appBg: '#07080d',
    appContentBg: '#0b0d16',
    barBg: '#0b0d16',
    colorPrimary: '#f2c14e',
    colorSecondary: '#f2c14e',
    fontCode: "'Fira Code Variable', ui-monospace, monospace",
  }),
});
