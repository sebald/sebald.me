---
status: doing # todo | doing | done
step: N1 # forms and navigation
depends: []
pr:
---

# `content-rhythm`: Content sets the gap between its rows

**Problem.** `Content` has no row gap of its own and takes no `style`. Every pattern, and the `TextField` example `options-rows.tsx`, hand-writes `grid gap-[calc(var(--bui-px)*4)]`, which measure 5 counts against the agent and which each screen then spells a little differently.

**Outcome.** `Content` owns the rhythm between its rows, from `SPACE`, so a pattern places controls as children and writes no grid. Decided here: this stays its own small task rather than folding into `field`, because `Content` also holds `Readout`, `Meter`, `Text` and `Ledger` rows that have nothing to do with a field; `field` and `form-navigation` build on it.

**Included.** The gap in `Content` (a prop only if two real values are needed, otherwise one value), the MDX page and rule, the examples and patterns that hand-write the gap moved onto it, the story, tests.

**Not included.** Placement of a label column (that is `field`). Window layout (that is `window-layout`).

**Acceptance criteria.**

- `Content`'s rows are `SPACE` apart with no `className` or `style` from the caller
- No example, story or pattern in the kit writes `grid gap-[calc(var(--bui-px)*4)]` any more (a test greps for it)
- Pushback's screens that wrote the same gap are moved over, and `pnpm test:game` passes
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** Nothing.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).

### Worked 2026-11-22

- `Content` is now `grid` with `gap-[calc(var(--bui-px)*4)]`: one value, no prop. 4 is what the one hand-written copy (`options-rows.tsx`) used, what `Actions` and `Picker` already put between their children, and the window's own padding, so a title, rows and actions share one rhythm. 3 would have been the title's room, which the window's body already places by slot. Grid rather than flex so a row (a field) takes the full width like before
- Moved onto it: `text-field/examples/options-rows.tsx` (gap, and the `mt-3` under the heading, now a `Title` so the window places it) and `name-hero.tsx` (the same `mt-3`). No other example, story or pattern hand-spaced a `Content`; `dialog` and `parts` stories have one child per `Content`, so the gap does not show. Pushback does not use `Content` and wrote no such gap, so no game screen changes; `pnpm test:game` passes (33 passed, 33 screen shots skipped on macOS)
- `parts.mdx` has a Do and a Don't for it; new `parts.blip-rules.yaml` (C-PARTS-1, C-PARTS-2, a when-not to `picker`), so `blip docs parts` and `blip rules parts` say it
- `parts.test.ts`: `Content` renders the gap, and no source in `packages/blip-ui/src` writes `grid gap-[calc(var(--bui-px)*4)]` outside `parts.styles.ts`
- Looked at in Storybook at 3x, 1x and the phone (402 x 714, scale 402/320): textfield default, overview, options-rows, naming-the-hero, dialog default and overview, confirm, parts default and overview, menu-screen. Every screenshot is byte-identical to before (30 of 30), child rects equal; `escapes()` finds nothing. So no story's look changes and `pnpm vrt:blip-ui` is not needed
