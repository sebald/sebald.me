---
status: todo # todo | doing | done
step: N4 # forms and navigation
depends: [stepper, field, picker-key-scope]
pr:
---

# `form-navigation`: A `Form` that moves between its rows by Up and Down

**Problem.** In a form window the only way to move is Tab, as on the web. A game is played with a d-pad, and engines treat directional focus movement as the primary model (Unity, Godot, Unreal) and Xbox guideline 112 asks for menus to be fully usable by directional input. Per-control key handling would give every control its own idea of Left and Right.

**Outcome.** A `Form` component does it for its users; nobody hooks keys up. A game wraps a form window's controls in `<Form onSubmit>` (inside the window's `Content`) and gets the whole model: Up and Down move between rows (wrapping at the ends), Left and Right change the value (Space and Enter also flip a two-valued stepper), Enter submits or presses, Esc leaves a field or goes back. `Form` renders a native `<form>` (so `name`s, submit and screen readers work as on the web) and tells its children through context; each `Field` registers its control as a row and an `Actions` part its buttons as one row, in the order they are written, so nothing is declared per control and nothing is found by measuring positions. Tab keeps working unchanged for browsers and screen readers. The stepper is a `row` in `focusTakes` (a `slider` is `both` today and would take Up and Down); a many-valued stepper takes Left and Right only. Moving down onto a row of buttons lands on the nearest button, accepted for now. `Form` also gives the window its legend (`↑↓ next row · ←→ change · Enter press · Esc leave the field`, Tab not named).

**Included.** `Form` (its context, the registration `Field` and `Actions` use, the keys in `key-layer.ts` scoped to the form, the legend), its MDX page, rules sidecar, example and stories (a form window), tests for each control in the research's table. A mixed window (a `Picker` inside a `Form`) is refused in development with a clear message.

**Not included.** The Picker's own keys (menus keep theirs). A window that holds a Picker and a form (decided against: a window is a menu or a form). Gamepad (Q18). A smarter landing on button rows.

**Acceptance criteria.**

- A form window built as `<Window><Content><Form>…</Form></Content></Window>` needs no key code from the game, in the example and in a test
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
