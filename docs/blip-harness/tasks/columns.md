---
status: todo # todo | doing | done
step: N2 # forms and navigation
depends: [picker-item-parts]
pr:
---

# `columns`: Column headers for a list with more than one value

**Problem.** A shop's wares have a name, a price and how many you own; today the price is written into the item's text, and nothing names the columns. SNES lists used column headers (Item, Price, Owned) or fixed positions.

**Outcome.** Column headers and a columned row for lists such as wares: a header row that names the columns and a `PickerItem` whose parts sit in those columns (name left, price and owned right, aligned down the list), placed by the parent through `data-slot`s and context, not by each child.

**Included.** The header and the columned row (decide in the task whether it is a part of `Picker`, a variant of `PickerItem` or a `Ledger` feature, following `picker-item-parts`' price slot), page, sidecar, example, stories, a screen-reader reading (a table of rows, or a list whose items read their column names).

**Not included.** Sorting or filtering (that is `pattern-filtered-list`). Scrolling (`window-scroll`).

**Acceptance criteria.**

- A list with three values shows a header row and aligned columns at 1x, 3x and on the phone, without a hand-written grid
- A screen reader hears each value with its column's name
- The keys, the cursor and the sounds of `Picker` are unchanged
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`picker-item-parts`](picker-item-parts.md): the price slot it adds is the first column.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
