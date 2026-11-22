---
status: todo # todo | doing | done
step: N5 # forms and navigation
depends: [pattern-form-window, menu-title, back-action, picker-key-scope]
pr:
---

# `pattern-pick-then-edit`: Pattern: pick an item, then edit it

**Problem.** Save slots, party members and inventory all share a flow: choose one from a list, then change something about it. Mixing the list and the editor in one window makes two keyboard models; the review mocks showed that a list beside a form needs its own window or step.

**Outcome.** A pattern named for the flow: step one is a menu window (a titled `Picker`, Back as a `PickerItem`), step two is a form window about the chosen item (`pattern-form-window`, Back as a `Button`). Where the cursor lands after the step (on the item that was edited) is part of the pattern. Mocked as naming a save slot.

**Included.** The pattern page, example, rules, tests of the flow with the keys, where focus goes on each step.

**Not included.** Doing both steps in one window (decided against). Deleting an item (a confirm dialog is its own pattern).

**Acceptance criteria.**

- Built only from Blip components: no raw `div` with a border, no hand-written grid where a component places it; every control used as its docs say
- Checked at 1x, at 3x and on the phone (402 × 714), each by looking at it, not only by a test passing
- Its keyboard model has a test (Up and Down, Left and Right, Enter, Esc, Tab, and the wrap at the ends), and `pnpm test:game` still passes
- An MDX page (`src/patterns/<name>/<name>.mdx`) with the guidelines, a rules sidecar and its examples in `examples/`; an agent that copies the example gets a screen that follows every rule
- Design review by the user before it is merged, because it is the reference an agent will copy
- `pnpm test`, `pnpm typecheck`, `pnpm vrt:blip-ui` in Docker (asked first), a changeset, and a fresh-context review in the pull request

**Depends on.** [`pattern-form-window`](pattern-form-window.md), [`menu-title`](menu-title.md), [`back-action`](back-action.md), [`picker-key-scope`](picker-key-scope.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
