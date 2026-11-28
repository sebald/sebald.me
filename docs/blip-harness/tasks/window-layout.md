---
status: done # todo | doing | done
step: N2 # forms and navigation
depends: [screen-layout, window-scroll]
pr: 265
---

# `window-layout`: Windows side by side on the wide stage, stacked on the tall

**Problem.** `Screen` only has a column. A shop or a save screen wants two windows next to each other on the wide stage and one above the other on the tall one; today that is a hand-made flex row.

**Outcome.** Windows placed side by side on the wide stage and stacked on the tall, by the parent (`Screen`, or a part of it), with no layout `className` from the caller. Each window keeps its own title, its own legend and, now that a window is a menu or a form, its own keys.

**Included.** The placement in `Screen` (or its part), the page and the rule, an example of two windows, stories at the three sizes, the check that nothing spills out of `#storybook-root`.

**Not included.** More than two windows. A window that resizes to its content differently from today.

**Acceptance criteria.**

- Two windows sit side by side on the wide stage and stacked on the phone with no hand-made flex or grid
- Each window scrolls on its own (`window-scroll`) and none is cut off at the minimum scale
- The screen reader order is the visual order in both layouts
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing by role (`foundations/spacing.mdx`), motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`screen-layout`](screen-layout.md), [`window-scroll`](window-scroll.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Decided: a variant of `Screen`, `split`**, not a new part. Placing what is in the frame is the
frame's job, and the variant names what the screen is (two windows), as `centered` does. On the wide
stage it is a grid: two equal columns, `gap-x-section` (the spacing role for windows side by side),
rows `minmax(0,1fr)`, with the `ScreenTitle` spanning both when there is one. Each window stretches to
the room under the title, so the two are equally tall. Upright it is the column (`tall:flex`). No
caller writes a class for it.

**Measured** (Storybook, Chrome, `buy-and-sell`):

- At `MIN_SCALE` (2.25) the windows have the same top and bottom, Sell to the right of Buy, and
  nothing escapes or crowds a cursor.
- Upright they share a left edge, Sell under Buy, and each list scrolls on its own (scrolling Buy
  leaves Sell at 0).
- Read order: Buy then Sell, the DOM order.

**The 1x shot.** At 1x two menus on a whole stage have no room for their words, and a game never shows
a stage under `MIN_SCALE`. So `BuyAndSell` is `no-vrt-1x`, as `Compositions/Together` is, and the spec
checks it at 2.25 instead. The same reason covers `Picker`'s `ScrollingList`, which was cut at 1x
before (#263): it is `no-vrt-1x` too, and its stale 1x baseline is removed. Its room check moved from
1x to 2.25.

**The game.** No screen in Pushback puts two windows side by side by hand (`title.tsx` and the duel
have their own layouts), so nothing there changes.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
