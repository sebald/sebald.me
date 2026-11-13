---
status: todo # todo | doing | done
step: B
depends: [eval-tasks, pack-build]
pr:
---

# `template`: Build the consumer app the eval's agents work in

**Problem.** Agents need a project that looks like a real one: its own data, its own theme, a
screen that predates the design system. It must not be Pushback.

**Outcome.** `evals/blip/template/` as in spec 3.1, building against the tarball.

**Included.** Vite, React, Tailwind v4, TypeScript. `src/game/data.ts` with what `eval-tasks`
listed, and the fixtures. `state.ts`. `theme.css` with its own `--bui-*` values. `app.tsx`
with the `Stage` and the `?screen=&state=` switch. `screens/camp.tsx`, built without Blip. The
exclusions from the root `tsc`, oxlint and oxfmt (the root `tsc` includes `**/*.tsx`).

**Not included.** Any of the six screens the tasks ask for. A router. `CLAUDE.md` (written by
`eval-run`).

**Acceptance criteria.**

- With the tarball installed: `pnpm typecheck` and `pnpm build` pass
- `?screen=camp` renders wide and on a 402 px phone; `?screen=camp&state=broke` shows the
  fixture's gold
- `camp.tsx` imports nothing from `@sebald/blip-ui` and styles itself inline
- The theme is visibly not Blip's default palette
- Nothing in the template names Pushback or this repo
- `pnpm lint`, `pnpm format:check` and `pnpm typecheck` at the root ignore the template

**Depends on.** [`eval-tasks`](eval-tasks.md), [`pack-build`](pack-build.md).

**Changes in the eval.** Is the starting point of every run.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
