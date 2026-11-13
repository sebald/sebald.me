---
status: todo # todo | doing | done
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

Filled in while the task is worked on: what changed, decisions, numbers.
