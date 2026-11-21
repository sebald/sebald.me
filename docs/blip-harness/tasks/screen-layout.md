---
status: done # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr: https://github.com/sebald/sebald.me/pull/218
---

# `screen-layout`: Give a full screen its frame, so agents stop writing it by hand

**Problem.** Day zero: 21 of the 24 screens agents built for `shop`, `saves`, `fight-hud` and
`quests` start with the same hand-written block, `position: absolute; inset: 0; display: flex;
flex-direction: column; gap; padding; padding-bottom: calc(... + var(--bui-bar))`, as inline
`style` in 17 and Tailwind classes in 4 (`cli/shop-1/shop.tsx:31-40`,
`no-cli/saves-2/saves.tsx:98`). Three guessed a top padding of 22 to 24 stage pixels to clear a
`ScreenTitle` (`cli/shop-3/shop.tsx:49`). Two of the three that did not wrapped their content in
`Stage.Center` (`cli/saves-1/saves.tsx:119`; the third has no frame). The catalog ranks "Screen layout" first (5 tasks) and
Q11 left it as a day-zero decision.

**Outcome.** One component that is the frame of a full screen: it fills the stage, keeps clear of
the bottom bar and of a `ScreenTitle`, and places what is in it as a column with the stage's spacing.
Proposed name `Screen`; the decision is the user's.

**Included.** The component, its `*.styles.ts`, a page with the guidelines, one story (`Default`,
`Overview`), tests under `foundations/uniformity.test.ts`. A variant only for what two screens need
(a centred one, as `Stage.Center` does today; decide whether `Stage.Center` is then that variant).
A rule for the sidecar that a screen's top-level box is this component.

**Base UI.** No Base UI primitive fits a layout box; plain markup, as `Stage` is.

**Not included.** Changing Pushback's screens. A grid. Any harness piece.

**Acceptance criteria.**

- The `shop`, `saves`, `fight-hud` and `quests` screens day zero's agents wrote can be written with
  it and no `position`, `inset` or `--bui-bar` of their own (checked by rewriting one by hand)
- Follows `building-components.mdx`: `data-slot`, `className` merged last, spacing from `SPACE`,
  no `next/*`
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker since the
  story's look is new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`day-zero`](day-zero.md).

**Changes in the eval.** Measure 5 (raw wrappers, `style` with `inset`) should drop in `shop`,
`saves`, `fight-hud` and `quests`. The collector counts `className`, not inline `style`, and 17 of
the 21 blocks are `style`: it needs to count `style` groups first (found in `day-zero`, not fixed there).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

- **Built:** `Screen` (`packages/blip-ui/src/components/screen/`): `variant: 'default' | 'centered'`, `className`, `style`, `children`. Fills the stage's layer (`absolute inset-0`), a flex column, 6 `--bui-px` padding and 4 `--bui-px` gap; the bottom padding adds `--bui-bar`. Plain markup, no Base UI, no `next/*`.
- **Title clearance without a guessed number:** a `ScreenTitle` child is made `static` by the frame (`*:data-[slot=screen-title]:static`, the parent places it) and the frame's top padding becomes 8 stage pixels (`--s-top`, the title's own `TITLE_TOP`). The title is then the column's first row, so what follows starts under it whatever its blurb or size (default, `medium` on the tall stage). `ScreenTitle` itself is unchanged.
- **Name `Screen`**, as proposed. **Variant:** `centered` for what `Stage.Center` does (title card, message), 8 `--bui-px` around it. `Stage.Center` is **kept**, not folded in: Pushback uses it and the task says not to change Pushback; `stage.mdx` now says a screen's frame is `Screen`. Retiring it later is a separate decision for the user.
- Shared files touched, additively: `src/index.ts` (export), `uniformity.test.ts` (`PART_VARS` gets `(--s-bottom)`, `(--s-top)`, the part-length mechanism the button and tabs use), `cli/build/sidecar.test.ts` (its hard-coded page list gets `screen`), `stage.mdx` (a line naming `Stage.Center`, so the manifest keeps it on the stage's page and not on `screen`).
- Rules `C-SCREEN-1` to `-5`, all `[review]` (no check exists yet), each with a source.
- Acceptance: the `Shop` example is the day-zero shop shape written with `Screen` and no `position`, `inset` or `--bui-bar`; not a rewrite of a literal day-zero file.
- Checked: lint, format, `pnpm test` (491), blip-ui typecheck, `test:game` (27 passed; 2 timeouts under load on the first run passed on rerun), `pnpm pack` into a scratch app: `blip docs screen` has props, example and rules, and the examples type-check there.
- `pnpm vrt:blip-ui` not run (asked first, the user decides). New story ids needing baselines: `components-screen--default`, `--overview`, `--shop`, `--title-card`.
