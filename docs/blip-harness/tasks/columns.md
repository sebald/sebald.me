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
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing by role (`foundations/spacing.mdx`), motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`picker-item-parts`](picker-item-parts.md): the price slot it adds is the first column.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Decided: a prop of `Picker`, `columns`** (`['Item', 'Price', 'Owned']`), not a `PickerItem` variant
and not `Ledger`. A list's columns belong to the list: one place names them, and the rows stay
written as before, the price slot of `picker-item-parts` its first value column. A variant of the
item would let two rows of one list disagree; `Ledger` is a `dl` of one value per term, not a list
to move through. Strings, not a header part: the values need the names to be read with them.

**Layout.** CSS subgrid. The list is a grid of the cursor's column, the name's (`minmax(0,1fr)`)
and one `auto` column per value. Every row, group and the header take those columns as their own,
so a column is as wide as its widest value, with no measuring in script. No gap between columns
at any depth: a subgrid with a gap of its own shifts its cells by half the difference, which put
the header 2px off. The cursor's room is its margin and a value's room is its padding instead. In
columns a row sorts its own children into a name cell (the text and its `Tag`), its values and
then its details. A row with no values (Back, a setting) spans the whole width.

**Reading.** Each value reads its column's name first, as a hidden word (`Tonic Price 25g Owned 3`).
The header row is `aria-hidden`, so it is not counted as an item of the list. A list whose items
read their names was chosen over a table: the list's keys, cursor and sounds stay the same.

**Measured** (Storybook, Chrome): the name, Price and Owned cells match the header's to the pixel
in every row at 3x, at 1x and on the phone (`tests/visual/picker-columns.spec.ts`). An accent row
in columns keeps its values in place. The name starts at the same x as in the plain shop.

**Left out.** The header scrolls with the list. Keeping it in place belongs to `window-scroll`.
`blip`'s docs build already fails on `blip-harness` with `compositions/examples/mood-board.tsx: there
is no page "compositions"` (since #249). This branch doesn't touch that file.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
