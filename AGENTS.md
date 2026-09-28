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
pnpm vrt              # Visual regression tests (Docker)
pnpm vrt:update       # Regenerate screenshot baselines (Docker)
pnpm vrt:update:ci    # Regenerate baselines in CI and commit them to the current branch (no Docker)
```

CI runs `lint`, `format:check` and `test` on every pull request. Lint warnings don't fail CI; errors do. The visual regression workflow also runs on every pull request.

### Visual Regression Tests

- Playwright screenshot tests in `tests/visual/`, baselines committed in `tests/visual/__screenshots__/` (desktop + mobile)
- Covers `/inventory` (full page plus opened dialog/menu/toast/tooltip states) and the two published notes
- Always run through `pnpm vrt` / `pnpm vrt:update`, which use the `mcr.microsoft.com/playwright` Docker image. Baselines are Linux-only; running Playwright directly on macOS produces false diffs
- Intended style changes: run `pnpm vrt:update` and commit the updated PNGs, or, without Docker, push the branch and run `pnpm vrt:update:ci`. The script starts the "Update Visual Baselines" workflow (regenerates them in the same image and commits them to the branch), pulls the commit and approves the pull request checks GitHub holds for it
- The Docker image tag in `.github/workflows/visual.yml` and `visual-update.yml` must match the `@playwright/test` version (Renovate groups them); a Playwright bump may need `pnpm vrt:update`
- On CI failure, download the `playwright-report` artifact and open `index.html` for the diff viewer

## Architecture

### Content System

- MDX content lives in `content/notes/` (blog posts) and `content/misc/` (pages)
- Each note is a date-prefixed folder: `content/notes/2026-01-14-slug-title/index.mdx` (date stripped from URL); images live next to `index.mdx`
- Use PNG or WebP for note images, not AVIF: Vercel's image optimizer serves AVIF sources at full size instead of resizing them
- Fumadocs compiles MDX on install → generates `.source/` directory
- Content loaders in `src/lib/source.ts` expose `notesSource` and `miscSource`

### Key Directories

- `src/app/` - Next.js app router pages
- `src/lib/` - Utilities, content loaders, rehype plugins
- `src/ui/` - React components using CVA for variants
- `src/css/` - Tailwind styles and theme tokens (`theme.css` defines color system)
- `content/` - MDX content files

### Content Frontmatter (notes)

```yaml
title: Required
description: Required
date: YYYY-MM-DD (optional, extracted from filename if omitted)
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

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
