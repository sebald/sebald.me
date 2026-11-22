---
status: todo # todo | doing | done
step: N2 # forms and navigation
depends: [screen-layout, window-scroll]
pr:
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
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`screen-layout`](screen-layout.md), [`window-scroll`](window-scroll.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
