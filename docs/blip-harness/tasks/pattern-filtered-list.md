---
status: todo # todo | doing | done
step: N5 # forms and navigation
depends: [columns, list-position, window-scroll, menu-title, patterns]
pr:
---

# `pattern-filtered-list`: Pattern: a list you can filter, with columns

**Problem.** A shop or an inventory is a long list with more than one value, a way to narrow it (Show: All or Sale), a count and a price; the mocks hand-wrote the columns, the filter as a row and the count.

**Outcome.** A pattern named for what it is: a menu window whose title names the list, a header row of columns, `PickerItem`s with price and owned in those columns, a `PickerSetting` as the filter, a position ("2 of 5"), scrolling inside the window. No text search field (a field is a form's, and a window is a menu or a form). Mocked as a shop's wares.

**Included.** The pattern page, example, rules, tests of the keys (filter changes the list and the cursor stays valid), the legend.

**Not included.** A search field in the same window. Sorting.

**Acceptance criteria.**

- Built only from Blip components: no raw `div` with a border, no hand-written grid where a component places it; every control used as its docs say
- Checked at 1x, at 3x and on the phone (402 × 714), each by looking at it, not only by a test passing
- Its keyboard model has a test (Up and Down, Left and Right, Enter, Esc, Tab, and the wrap at the ends), and `pnpm test:game` still passes
- An MDX page (`src/patterns/<name>/<name>.mdx`) with the guidelines, a rules sidecar and its examples in `examples/`; an agent that copies the example gets a screen that follows every rule
- Design review by the user before it is merged, because it is the reference an agent will copy
- `pnpm test`, `pnpm typecheck`, `pnpm vrt:blip-ui` in Docker (asked first), a changeset, and a fresh-context review in the pull request

**Depends on.** [`columns`](columns.md), [`list-position`](list-position.md), [`window-scroll`](window-scroll.md), [`menu-title`](menu-title.md), [`patterns`](patterns.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
