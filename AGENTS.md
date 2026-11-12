# AGENTS.md

This file provides guidance to coding agents working with code in this repository.

## Project Overview

Personal blog and portfolio built with Next.js 16, React 19, TypeScript, and Fumadocs for MDX content management. Uses Tailwind CSS v4 with custom OKLCH color tokens.

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm lint             # oxlint
pnpm format           # oxfmt formatting
pnpm format:check     # oxfmt check (no writes)
pnpm types:check      # Full type check (fumadocs + next + tsc)
pnpm typecheck        # Quick tsc --noEmit
pnpm test             # Run tests (Node test runner)
pnpm test:lib:watch   # Watch mode for tests
pnpm narrate          # Render narrations of changed notes (Python, see Narration)
pnpm narrate:check    # Fail if a note's narration is missing or outdated
pnpm test:game        # The game played through its screens (Playwright, against the dev server)
pnpm vrt:game         # The same plus a screenshot of each screen (Docker)
pnpm vrt:game:update  # Regenerate the game's screenshot baselines (Docker)
pnpm vrt              # Visual regression tests (Docker)
pnpm vrt:update       # Regenerate screenshot baselines (Docker)
pnpm vrt:update:ci    # Regenerate baselines in CI and commit them to the current branch (no Docker), Blip UI's too
pnpm storybook        # Blip UI's Storybook (port 6006)
pnpm vrt:blip-ui       # Visual regression tests of Blip UI's stories (Docker)
pnpm vrt:blip-ui:update # Regenerate Blip UI's baselines (Docker)
```

CI runs `lint`, `format:check`, `test` and, in its own job, `narrate:check` on every pull request (keep the job's command in sync with the script). Lint warnings don't fail CI; errors do. The visual regression workflow also runs on every pull request.

### The game's flows

- `tests/game/` (`playwright.game.config.ts`): Pushback played by keys (desktop) and by taps (a phone), from the title through a duel won and one lost, the pause, leaving, options, the save, the demo. Run `pnpm test:game` after any change to the game or to the Blip UI parts it uses; it reuses a running `pnpm dev` (port 3000, `GAME_PORT` for another) and the installed Chrome
- No screenshots, so it runs on macOS too. It reads only what a player and a screen reader get: the screen's region (`Pushback, …`), roles and names, `aria-current` and the live region, never a class, so it holds while the UI underneath is rebuilt
- Repeatable: the clock stands still (a run's and a duel's seed is the time) and `Math.random` is seeded; a duel is won with the counters from the game's own lines (`playDuel`), not by luck
- Every test fails on an error in the console
- A test starts deep in a run by opening the game on a save (`openWith(page, saveWith({ beaten, mode, glossary }))`): written to storage before the page loads, as a returning player's, built with the game's own save functions. No test-only code in the game
- `screens.spec.ts` (`@screens`): a screenshot of each screen's stage, desktop and phone, baselines in `tests/game/__screenshots__`. Linux only (the Playwright image or CI); on a Mac they are skipped, `GAME_SCREENS=1` runs them to try a change, never to commit its PNGs. The clock is held (`holdClock`) and moves only by `press`/`settle`, which wait for the page to rest first, so animations show the same frame every run. `pnpm vrt:update:ci` regenerates them with the site's and Blip UI's
- The "Game" workflow runs it on pull requests that touch the game, Blip UI (the screens are built from it) or the suite, and by hand (`workflow_dispatch`)

### Visual Regression Tests

- Playwright screenshot tests in `tests/visual/`, baselines committed in `tests/visual/__screenshots__/` (desktop + mobile)
- Covers `/inventory` (full page plus opened dialog/menu/toast/tooltip states), two published notes and the 404 page
- Always run through `pnpm vrt` / `pnpm vrt:update`, which use the `mcr.microsoft.com/playwright` Docker image. Baselines are Linux-only; running Playwright directly on macOS produces false diffs
- Intended style changes: run `pnpm vrt:update` and commit the updated PNGs, or, without Docker, push the branch and run `pnpm vrt:update:ci`. The script starts the "Update Visual Baselines" workflow (regenerates them in the same image and commits them to the branch), pulls the commit and approves the pull request checks GitHub holds for it
- The Docker image tag in `.github/workflows/visual.yml` and `visual-update.yml` must match the `@playwright/test` version (Renovate groups them); a Playwright bump may need `pnpm vrt:update`
- On CI failure, download the `playwright-report` artifact and open `index.html` for the diff viewer

## Architecture

### Content System

- MDX content lives in `content/notes/` (blog posts) and `content/misc/` (pages)
- Each note is a date-prefixed folder: `content/notes/2026-01-14-slug-title/index.mdx` (date stripped from URL); images live next to `index.mdx`
- Use PNG or WebP for note images, not AVIF: Vercel's image optimizer serves AVIF sources at full size instead of resizing them
- A note's link preview is `og.webp` (1200x630) in its folder, served at `/og/<slug>.webp`; without one the route falls back to a generated logo card, so add one for every note with a header image
- Frontmatter images are served by `/api/content-image` with their content hash as `?v=` (added at build time), so a regenerated image keeps its file name and still gets a new URL; the route caches versioned URLs for a year in the browser and on the CDN
- Fumadocs compiles MDX on install → generates `.source/` directory
- Content loaders in `src/lib/source.ts` expose `notesSource` and `miscSource`

### Narration

- Each note can have an audio narration at `public/audio/<slug>.mp3`; the note page shows a listen button in its toolbar only when the file exists (`narrationUrl` in `src/lib/narration.ts`)
- Rendered locally with Kokoro (voice `af_heart`) by `scripts/narrate/narrate.py`, never in CI. Needs `uv`, `ffmpeg` and `espeak-ng` (`brew install uv ffmpeg espeak-ng`); `pnpm narrate` sets up the pinned Python environment on first run
- Run `pnpm narrate` after a note's text is final and commit the MP3 together with `public/audio/narrations.json`, which records a fingerprint of each note's spoken text. Unchanged notes are skipped; `--dry-run` prints what will be read, `--force` re-renders
- CI fails when a published note has no narration or its text (or `pronunciations.json`) changed since it was rendered, even for a typo fix: run `pnpm narrate` and commit the result
- The inventory's example clip is `public/audio/examples/inventory.mp3`, rendered with `pnpm narrate --example`
- Figures (self-closing components) and code blocks are left out of the narration on purpose
- Words the voice gets wrong go into `scripts/narrate/pronunciations.json` (respelling or `[word](/phonemes/)`), then re-render
- The player loads nothing until someone presses play (`preload="none"`), files are served statically so seeking uses range requests

### Key Directories

- `src/app/` - Next.js app router pages
- `src/lib/` - Utilities, content loaders, rehype plugins
- `src/ui/` - React components using CVA for variants
- `src/css/` - Tailwind styles and theme tokens (`theme.css` defines color system)
- `content/` - MDX content files
- `packages/` - pnpm workspace packages, consumed as source (no build step; Next compiles them)

### Packages

- `packages/blip-ui` (`@sebald/blip-ui`): Blip UI, the design system for the lab's pixel games. Tokens are CSS variables only (`src/tokens.css`, `--bui-*` roles with defaults); a game sets its values for the same names on its stage. Components take `variant`, `size` (with defaults) and a `className` merged last, with their styles in a `*.styles.ts` next to them (cva). How components are built is `src/building-components.mdx` (follow it): named by what they do; a new component only for new behaviour, a different look is a `variant`; a yes or no is a boolean named for the state, never for the look, and a choice between options a string naming them (`points: 'left' | 'right'`), also in the game; parts are children, never JSX through a prop; every root has `data-slot="<name>"` and the parent places its children by it (or tells them through context), a child places nothing itself; parts that recur across containers are shared by role (`Title`, `Content`, `Actions`), the container telling them what they can't know through `PartsContext`. Colours only through `--bui-*` tokens, lengths in stage pixels (art on the grid in `--px`; spacing, controls and readouts in `--bui-px`, never finer than `--bui-min-px`), spacing from `SPACE` (1, 2, 3, 4, 6, 8), text at 0.75, 0.85, 1 or 2em, disabled as `bui-disabled`; motion by what moves: a UI element smoothly, by a transition on `ease-bui-out`/`ease-bui-in-out` with named properties and at most 300 ms, game art like a sprite, by stepped keyframes (`animate-bui-*`), and list navigation not at all (`foundations/uniformity.test.ts` fails on anything else); sounds through `useFeedback()` (the game decides what plays), the scale through `usePixels()`. Base UI is the headless layer where a primitive fits (Tabs) No game data, no assets, no `next/*`
- Blip UI's docs are its Storybook (`packages/blip-ui/.storybook`, Vite): per component a story file and an MDX page with the guidelines. Stories: one `Default` whose args are the props' defaults, one `Overview` with every variant × size and state side by side (what the visual tests cover), and otherwise only compositions; never a story per variant or size. Its visual regression tests (`packages/blip-ui/tests/visual`) screenshot every story from the built Storybook's index, wide at 3x and 1x and tall on a 402 × 714 phone at its scale (402 / 320), in the same Docker image as the site's; a story tagged `no-vrt` is left out, one tagged `no-vrt-<shot>` (`no-vrt-1x`) skips that shot. A baseline is only what the story looked like when it was taken, faults included, so each shot also fails when part of the story lies outside `#storybook-root` or its text is cut off by a container that hides its overflow (`tests/visual/layout.ts`), and new or changed baselines are looked at before they are committed. The "Blip UI Visual Regression" workflow runs them on pull requests that touch the kit
- `packages/pushback` (`@sebald/pushback`): the lab's game, built on Dither (its `styles.css` maps the palette onto Blip UI's roles), mounted at `/lab/pushback`. Its logic in `src/lib`, its UI in `src/ui`, its art in `src/assets`
- Independent of the site: no `@/` imports (its own `tsc` run, `pnpm --filter @sebald/pushback typecheck`, fails on one), its own `cn`/`cva` copy, and its own CSS (`src/styles.css`: the `tall:`/`touch:` variants, `pb-focus`, the stage's leading, the game's keyframes), which `src/css/styles.css` imports after Blip UI's
- The site imports only `Game` from the package root (and its CSS); the game's flows read its rules by subpath (`@sebald/pushback/lib/<module>`). There is no workbench page: Blip UI's pieces are tuned in its Storybook, the game's in the game
- `pnpm test` runs the packages' tests too

### Content Frontmatter (notes)

```yaml
title: Required
description: Required
date: YYYY-MM-DD (optional, extracted from filename if omitted)
image: ./hero.webp | { src: ./scene.webp, poster: ./poster.png } (pixel art pre-scaled with hard edges, usually animated; the poster replaces it for reduced motion; optional `hotspots`, hidden objects named on hover and remarked on on click, in native pixels of the scene's `native.png`; see `.claude/skills/pixel-header`) (optional)
draft: boolean (optional)
topics: string[] (optional)
```

### Styling

- Tailwind v4 with `@theme` directive in `theme.css`
- Colors use OKLCH model (mist-50 to mist-950)
- CVA for component variants (see `src/ui/button.tsx`)
- `cn()` utility from `src/lib/styles.utils.ts` for class merging
- Import `cva` from `@/lib/styles.utils` (not `'cva'`), it merges classes with tailwind-merge
- Every `src/ui` component that renders a styled element accepts `className` and merges it last:
  - Plain elements: pass it to the cva call, `styles({ variant, className })`
  - Base UI parts: `mergeClassName(styles(...), className)`, which also handles Base UI's `className={state => ...}` form

### Path Aliases

- `@/*` → `./src/*`
- `fumadocs-mdx:collections/*` → `.source/*`

## Auto-generated Files (do not edit)

- `.source/` - Fumadocs compiled collections
- `next-env.d.ts` - Next.js types
- `.next/` - Build output
- `src/ui/logo-dither.ts` - Generated logo paths (excluded from formatting)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
