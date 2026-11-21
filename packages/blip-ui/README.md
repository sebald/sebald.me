# Blip UI

A design system for small pixel-art games: a stage that scales in whole
pixels, windows, buttons, pickers, meters and bitmap text, themed through CSS
variables.

## Requirements

- React 19 (`react` and `react-dom` at the version in `peerDependencies`)
- A bundler (Vite, Next.js, …): the modules import each other without file
  extensions
- Tailwind CSS v4: the components are styled with Tailwind classes, and Blip's
  stylesheet is Tailwind source that your build compiles

## Use

Import Blip's stylesheet in your Tailwind entry, after Tailwind:

```css
@import 'tailwindcss';
@import '@sebald/blip-ui/styles.css';
```

Then put the game on a `Stage` and build its screens from the components:

```tsx
import { Button, Stage, Window } from '@sebald/blip-ui';

export const App = () => (
  <Stage label="My game">
    <Window>
      <Button>Start</Button>
    </Window>
  </Stage>
);
```

## Theming

Every colour is a `--bui-*` variable with a default. Set your own values for
the same names on the stage:

```css
[data-stage] {
  --bui-primary: #f4b860;
}
```

## Docs

The package ships its docs for agents and humans alike: `pnpm exec blip` lists
the pages, `pnpm exec blip search <words>` finds one and
`pnpm exec blip docs <page>` prints it as markdown (`--section props` prints only its
props table: every prop's type, values, default and whether it is required).
