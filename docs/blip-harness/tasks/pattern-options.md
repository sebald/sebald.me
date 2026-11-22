---
status: todo # todo | doing | done
step: N5 # forms and navigation
depends: [stepper, form-navigation, divider, window-layout, pattern-form-window]
pr:
---

# `pattern-options`: Pattern: an options screen

**Problem.** An options screen is the commonest form in a game and the one where the mocks and Pushback's own `options.tsx` differ most: On and Off as a switch here, a `PickerSetting` there, a volume as two Buttons around a `Setting`.

**Outcome.** A pattern named for what it is: a form window of `Field`s holding steppers (On and Off included), a `Divider` between groups (sound, display), and Back as a `Button`; side by side with a second window (for example a key legend or a preview) on the wide stage. At the minimum desktop scale (2.25x) only about three rows fit; the pattern says what to do with more (a second page or a scrolling `Content`) and shows it.

**Included.** The pattern page, example, rules, tests of the keys, a check against Pushback's options screen, which is moved over if it fits.

**Not included.** A menu-style options list (`PickerSetting` rows are the menu way and keep their page). Key rebinding.

**Acceptance criteria.**

- Built only from Blip components: no raw `div` with a border, no hand-written grid where a component places it; every control used as its docs say
- Checked at 1x, at 3x and on the phone (402 × 714), each by looking at it, not only by a test passing
- Its keyboard model has a test (Up and Down, Left and Right, Enter, Esc, Tab, and the wrap at the ends), and `pnpm test:game` still passes
- An MDX page (`src/patterns/<name>/<name>.mdx`) with the guidelines, a rules sidecar and its examples in `examples/`; an agent that copies the example gets a screen that follows every rule
- Design review by the user before it is merged, because it is the reference an agent will copy
- `pnpm test`, `pnpm typecheck`, `pnpm vrt:blip-ui` in Docker (asked first), a changeset, and a fresh-context review in the pull request

**Depends on.** [`stepper`](stepper.md), [`form-navigation`](form-navigation.md), [`divider`](divider.md), [`window-layout`](window-layout.md), [`pattern-form-window`](pattern-form-window.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
