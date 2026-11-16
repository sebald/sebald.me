---
status: doing # todo | doing | done
step: A
depends: []
pr:
---

# `pack-build`: Pack Blip into a tarball that holds only what a consumer gets

**Problem.** `pnpm pack` works today but ships everything: `src`, stories, tests and 154
baseline screenshots, 1.2 MB, with `exports` pointing at TypeScript source. An agent in an eval
run would read Blip's source and stories, which no real consumer has.

**Outcome.** `pnpm --filter @sebald/blip-ui pack` produces a tarball with `dist/` (`.js`,
`.d.ts`, `styles.css`, `tokens.css`), `README.md` and `package.json`. Inside the repo nothing
changes.

**Included.** `tsconfig.build.json` and a `prepack` script (spec 2.1). `files`. `publishConfig`
with `exports` on `dist/`. A short `README.md`: what Blip is, the import, the CSS line, that it
needs a bundler and Tailwind v4. `dist/` ignored by git, oxlint and oxfmt and excluded from the
root `tsc`.

**Not included.** `docs/`, the CLI, `bin` (`cli-lookup`). Compiling the CSS (**Q4**). A
published package.

**Acceptance criteria.**

- The tarball lists no `.mdx`, `.stories.`, `.test.`, `.png` and no `src/`
- A new Vite, React and Tailwind v4 app outside the repo installs the tarball, type-checks, and
  shows a `Stage` with a `Window` and a `Button`, styled
- `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:game` pass unchanged
- The pull request states the tarball's size and file count

**Depends on.** Nothing.

**Changes in the eval.** Makes the fixed Blip version a file: every run installs a tarball,
and its hash goes into `results.json`.

## Notes

**Changed.** `packages/blip-ui/tsconfig.build.json` extends the package's `tsconfig.json`
(`noEmit: false`, `declaration`, `outDir: dist`, `rootDir: src`, no `types`), takes
`src/**/*.ts(x)` and leaves out `*.stories.tsx` and `*.test.ts(x)`. `prepack` empties `dist/`,
runs it and copies `styles.css` and `tokens.css` next to the emitted files, so `@source './'`
scans `dist/`. `files: ["dist"]`; `publishConfig.exports` points `.` at `dist/index.{js,d.ts}`
and `./styles.css` at `dist/styles.css`, and pnpm swaps them in only when packing.
`packages/blip-ui/dist/` is in `.gitignore`, both oxc configs' `ignorePatterns` and the root
`tsconfig.json`'s `exclude`. New `README.md`.

**Numbers** (2026-11-16, `pnpm --filter @sebald/blip-ui pack`). 130 files: 126 in `dist/`
(63 `.js`, 63 `.d.ts`), `styles.css`, `tokens.css`, `README.md`, `package.json`. 71 KB packed,
244 KB unpacked (was 1.2 MB packed). `tsc` emits `dist/` in 0.6 s. No `.mdx`, `.stories.`,
`.test.`, `.png` or `src/` in the listing.

**Checked.** A Vite 8, React 19.3.1, Tailwind 4.3.3 app in the scratchpad, outside the repo,
installs the tarball (`file:`), type-checks with `skipLibCheck: false`, builds, and shows a
`Stage` with a `Window` and a `Button`, styled (screenshot via Playwright). The only setup it
needs beyond the README is the app's own `vite/client` types. With `dist/` present,
`pnpm typecheck` (root, Blip, Pushback), `pnpm lint`, `pnpm format:check`, `pnpm test` (327
pass), `pnpm build` and `pnpm test:game` (29 pass, 29 skipped by device as on `main`) pass.

**Decisions.** No `build` script, only `prepack`: a `build` in the package would look like
something the site needs. `tailwindcss` is not added as a peer dependency (it would change the
workspace install); the README says it is required. `tokens.css` is not exported on its own,
`styles.css` imports it. The packed `package.json` keeps `private: true`, `scripts` and
`devDependencies`, harmless for a `file:` install.

**Review** (subagent, fresh context, against the task, spec 2.1, Q3, Q4 and `AGENTS.md`).
Nothing blocking. Minor points, all left as they are: `prepack` uses POSIX `rm` and `cp` (the
repo builds on macOS and Linux only); no top-level `main`/`types` for `moduleResolution: node`
(the README requires a bundler); `skipLibCheck` is inherited by the build (the outside app
type-checks the `.d.ts` with it off); the README doesn't name `@types/react`.
