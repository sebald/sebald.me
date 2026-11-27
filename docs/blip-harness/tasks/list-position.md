---
status: done # todo | doing | done
step: N2 # forms and navigation
depends: [picker-key-scope]
pr: PENDING
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
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing by role (`foundations/spacing.mdx`), motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`picker-key-scope`](picker-key-scope.md), so the cursor it follows is the active menu's.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Decided: a prop of `Picker`, `position`**, not a `Readout` variant. The place belongs to the list's
cursor, which only the Picker knows; a Readout would need the game to keep the cursor's index and
pass it in. The prop draws `3 of 12` under the list at its end (0.85em, muted, `tabular-nums`,
`mt-related`), and wraps with the cursor. It is the same story structure without it: the list and
its rail move into a body `div` only when `position` is on, so no other Picker changes.

**Reading.** Every row (`li`) carries `aria-posinset` and `aria-setsize` from the list's order across
groups, also without `position`. A Back in a `PickerGroup` was the first of one; now it is the fourth
of four. The line under the list is `aria-hidden`: the row says it with its name. The Picker still
says nothing as the cursor moves (as before); a screen reader reads a row's place where it reads
the row.

**Where.** `ScrollingList` turns it on: twelve colleagues, a window of five or six rows. Measured
(Storybook, Chrome): `1 of 12` at first, `2 of 12` after Down, `12 of 12` after Up from the first;
the shop's Back is `4/4`. The tall shot of that story was already wider than the phone before this
(its stage is 320 stage px plus the story's padding); not changed here.

**Also.** One part of #261's review fix had not landed: the columns' header `li` still had
`key={name}` and no `role="presentation"`. Done here, said on #261.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
