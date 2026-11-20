---
status: doing # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr:
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
