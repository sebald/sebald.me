---
status: todo # todo | doing | done
step: N5 # forms and navigation
depends: [field, stepper, form-navigation, content-rhythm, divider, patterns]
pr:
---

# `pattern-form-window`: Pattern: a form window

**Problem.** An agent that builds a screen with a text field and a few choices has no reference for how they sit together: the review mocks needed a Switch, a field, a stepper and a Back all in one window, and each combination was hand-made.

**Outcome.** A pattern named for what it is, a form window: a `Window` whose `Content` holds `Field` rows (a text field, steppers), a `Divider` between groups where it helps, and `Actions` with the primary `Button` and Back. Mocked first as a hero's name and options before a run; the example in the kit is named for the pattern, not for that screen. One primary action per window; the legend says what the keys do.

**Included.** The pattern page, example, rules, the tests of its keyboard model, the legend.

**Not included.** A list in the same window (that is `pattern-pick-then-edit`). Validation beyond the control's own.

**Acceptance criteria.**

- Built only from Blip components: no raw `div` with a border, no hand-written grid where a component places it; every control used as its docs say
- Checked at 1x, at 3x and on the phone (402 × 714), each by looking at it, not only by a test passing
- Its keyboard model has a test (Up and Down, Left and Right, Enter, Esc, Tab, and the wrap at the ends), and `pnpm test:game` still passes
- An MDX page (`src/patterns/<name>/<name>.mdx`) with the guidelines, a rules sidecar and its examples in `examples/`; an agent that copies the example gets a screen that follows every rule
- Design review by the user before it is merged, because it is the reference an agent will copy
- `pnpm test`, `pnpm typecheck`, `pnpm vrt:blip-ui` in Docker (asked first), a changeset, and a fresh-context review in the pull request

**Depends on.** [`field`](field.md), [`stepper`](stepper.md), [`form-navigation`](form-navigation.md), [`content-rhythm`](content-rhythm.md), [`divider`](divider.md), [`patterns`](patterns.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
