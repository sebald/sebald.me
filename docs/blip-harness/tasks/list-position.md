---
status: todo # todo | doing | done
step: N2 # forms and navigation
depends: [picker-key-scope]
pr:
---

# `list-position`: Say where you are in a list: 2 of 5

**Problem.** A list that is longer than the window gives no sign of where the cursor is. `Readout` with a max shows `3/3` without words, and a screen reader has no position to read.

**Outcome.** A "2 of 5" position for a list, drawn with the list (a part of `Picker` or a `Readout` variant: decide in the task) and read as the position to a screen reader (`aria-posinset` and `aria-setsize` where the roles allow).

**Included.** The position readout, its page, sidecar, example, stories, tests.

**Not included.** A scroll bar. Paging.

**Acceptance criteria.**

- The readout follows the cursor and shows the number in the stage's font at the allowed sizes
- A screen reader hears the position with the item
- It is optional: a short list needs none, and the page says when to use it
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`picker-key-scope`](picker-key-scope.md), so the cursor it follows is the active menu's.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
