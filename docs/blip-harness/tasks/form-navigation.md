---
status: todo # todo | doing | done
step: N4 # forms and navigation
depends: [stepper, field, picker-key-scope]
pr:
---

# `form-navigation`: Up and Down move between rows in a form window

**Problem.** In a form window the only way to move is Tab, as on the web. A game is played with a d-pad, and engines treat directional focus movement as the primary model (Unity, Godot, Unreal) and Xbox guideline 112 asks for menus to be fully usable by directional input. Per-control key handling would give every control its own idea of Left and Right.

**Outcome.** A Window-scoped form key model in the key layer, for all form controls: Up and Down move between rows (wrapping at the ends), Left and Right change the value (Space and Enter also flip a two-valued stepper), Enter submits or presses, Esc leaves a field or goes back. Rows are found by position; nothing is declared per control. Tab keeps working unchanged for browsers and screen readers. The stepper is a `row` in `focusTakes` (a `slider` is `both` today and would take Up and Down); a many-valued stepper takes Left and Right only. Moving down onto a row of buttons lands on the nearest button, accepted for now.

**Included.** The model in `key-layer.ts`, its scope (the window that holds form controls), the legend for form windows (`↑↓ next row · ←→ change · Enter press · Esc leave the field`, Tab not named), the page and rule that say what a form window is, tests for each control in the table of the research, and a story with a form window.

**Not included.** The Picker's own keys (menus keep theirs). A window that holds a Picker and a form (decided against: a window is a menu or a form). Gamepad (Q18). A smarter landing on button rows.

**Acceptance criteria.**

- Down from no focus visits each row in order and wraps at the end; Up reverses
- Tab visits every control in reading order and leaves the window (no trap), and Shift+Tab goes back; nothing changes for a screen reader
- In a text field Left and Right move the caret and Up and Down leave the row; Esc leaves the field and the next Down re-enters
- A stepper changes with Left and Right while focus stays; a two-valued one also flips on Enter and Space; a button row moves with Left and Right and presses on Enter
- Readouts and meters are skipped; a Dialog on top mutes the window below it
- The research's table is the test's table; `pnpm test:game` passes
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`stepper`](stepper.md) (a control that takes the keys), [`field`](field.md) (the rows it finds), [`picker-key-scope`](picker-key-scope.md) (so two windows on a page do not fight).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
