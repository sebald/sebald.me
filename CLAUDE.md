# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog and portfolio built with Next.js 16, React 19, TypeScript, and Fumadocs for MDX content management. Uses Tailwind CSS v4 with custom OKLCH color tokens.

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier formatting
pnpm types:check      # Full type check (fumadocs + next + tsc)
pnpm typecheck        # Quick tsc --noEmit
pnpm test             # Run tests (Node test runner)
pnpm test:lib:watch   # Watch mode for tests
```

## Architecture

### Content System
- MDX content lives in `content/notes/` (blog posts) and `content/misc/` (pages)
- Notes use date-prefix naming: `2026-01-14-slug-title.mdx` (date stripped from URL)
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
- Colors use OKLCH model (mist-50 to mist-950, black-50 to black-950)
- CVA for component variants (see `src/ui/button.tsx`)
- `cn()` utility from `src/lib/styles.utils.ts` for class merging

### Path Aliases
- `@/*` → `./src/*`
- `fumadocs-mdx:collections/*` → `.source/*`

## Auto-generated Files (do not edit)
- `.source/` - Fumadocs compiled collections
- `next-env.d.ts` - Next.js types
- `.next/` - Build output
