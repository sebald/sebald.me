---
status: doing # todo | doing | done
step: B
depends: [eval-tasks, pack-build]
pr: https://github.com/sebald/sebald.me/pull/197
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
- The two assumptions the tickets rely on (`evals/blip/README.md`) hold, or the rubrics'
  `note`s change with them: `buy`, `sell` and `rest` refuse what the state doesn't allow
  and return the reason; `camp.tsx` takes arrow keys and Enter in a `keydown` listener on
  `window`, which a Blip `Dialog` opened over it does not silence
- Every name and fixture in `evals/blip/README.md` ("What the template holds for the tasks")
  exists with the values it lists, and `state.ts` exports `buy`, `sell`, `save`, `load`,
  `rest`, `setOption` and `leaveRun`; each of the seven fixtures opens on `?screen=camp`
- The theme is visibly not Blip's default palette
- Nothing in the template names Pushback or this repo
- `pnpm lint`, `pnpm format:check` and `pnpm typecheck` at the root ignore the template

**Depends on.** [`eval-tasks`](eval-tasks.md), [`pack-build`](pack-build.md).

**Changes in the eval.** Is the starting point of every run.

## Notes

**Changed.** `evals/blip/template/`: `package.json` (scripts `dev`, `typecheck`, `build`,
`preview`; Blip as `file:./blip-ui.tgz`; `react`/`react-dom` 19.3.1, the exact peer), Vite 8.3.5,
Tailwind and `@tailwindcss/vite` 4.3.3, TypeScript 7.0.2 (Blip's own versions), `tsconfig.json`
(`skipLibCheck: false`, `vite/client` types), `index.html`, `src/main.tsx`, `src/styles.css`
(Tailwind, Blip's stylesheet, then `theme.css`), `src/theme.css` (every `--bui-*` role on
`[data-stage]`, a marsh green and sand palette), `src/app.tsx` (a `Stage` with `turned`/`small`
asks and the `?screen=&state=` switch; default `camp` on `start`; an unknown screen shows a
message, an unknown state falls back to `start`), `src/screens/index.ts`, `src/screens/camp.tsx`,
`src/game/data.ts` and `state.ts`. Root `tsconfig.json` `exclude` and both oxc configs'
`ignorePatterns` list `evals/blip/template`. `evals/blip/README.md` got a short "Building the
template" section.

**Decisions.**

- Kept out of the workspace by its own `pnpm-workspace.yaml` (only `allowBuilds`), so pnpm treats
  the folder as its own root; the root install and lockfile are untouched. The tarball
  (`blip-ui.tgz`), `node_modules`, `dist` and `pnpm-lock.yaml` are git-ignored (`run.mjs` keeps a
  lockfile per run, a tarball hash would churn it).
- No `@vitejs/plugin-react`: Vite 8 transforms JSX itself with the automatic runtime.
- Package name `ford-game`, title "Ford"; nothing names Pushback or this repo.
- State is a module-level store read through `useSyncExternalStore` (`useGame`); `openFixture`
  copies a fixture in. Actions return `{ ok: true }` or `{ ok: false, reason: 'gold' | 'none' }`:
  `buy` (gold, unknown item), `sell` (none in the pack), `rest` (gold), `load` (empty slot),
  `save` (bad slot). `save` stores place, leader, level, play time and `new Date()`; `load`
  restores place and play time (a slot holds no more). `leaveRun` returns to the `empty` fixture.
  `setOption` clamps the volumes to 0 to 10.
- Values beyond the README's list (steps of Wolves and Herbs, descriptions, item texts, saves
  in slots 2 and 3 of `full`: Hollow Gate in slot 2, Reedmarsh in slot 3) are invented;
  `start`'s Herbs quest is `done` on its last step (index 1).
- `camp.tsx`: raw `div`s, inline styles in `calc(var(--px) * n)` and `em`, hard-coded greens, no
  Blip import. Its `keydown` listener is on `window`, bubble phase.

**Checked.** With the tarball (130 files, from `pnpm pack`): template `pnpm typecheck` and
`pnpm build` pass (the build only warns about `"use client"` in Base UI). Root: `pnpm lint`,
`pnpm format:check`, `pnpm test` (355 pass) pass; root `pnpm typecheck` shows 34 errors, all in
`src/ui` and none under `evals/` (environmental, as in the worktree without Next types).
Playwright against `vite preview`: `?screen=camp` at 1280 and 402 px wide renders the stage
(scaled, tall on the phone); all seven fixtures open on `?screen=camp` with their own gold and
HP (start 120, exact 25, broke 5, empty 50 at full HP/MP, full 120, fight 120, fallen 120 with
Pim 0/38); `state=broke` shows 5 gold. A tsx script asserted the refusals and results: `buy`
too dear (`gold`), unknown (`none`), `sell` of an item not held (`none`), `rest` at 5 gold
(`gold`, nothing changes), `load` of an empty slot (`none`), the sell prices (4, 6, 7, 12, 30,
75), seven fixtures.

**The window-listener assumption, tested.** A throwaway screen put a Blip `Dialog` over `Camp`.
Enter still reached the camp's listener (it ran the selected line). ArrowDown did not: Base UI's
popup stops arrow keys on their way up while focus is inside it. So the camp is not silenced by
a `Dialog` (Enter, Escape and the rest reach it), but arrows from inside the dialog never get
there for an unrelated reason. A pause built from something that does not stop arrows (a `Window`
and a menu) would let them through. The `pause` rubric note ("does not stop that listener on its
own") is true as written; it just isn't true of the arrow keys under a focused `Dialog`.

**Review** (subagent, fresh context, against the task, spec 3.1, `evals/blip/README.md`, the
rubrics and `AGENTS.md`). Nothing blocking; every name and value matched. Minor: `in` lookups of
`?state=` and `?screen=` also matched inherited keys (`constructor`), now `Object.hasOwn`; `buy`
and `sell` moved an item's pack entry to the end, now entries keep their place; `camp.tsx`
re-subscribes its listener on each arrow press, left as it is. It also asked to confirm the
`pause` note against the `Dialog` finding above, which is stated there.
