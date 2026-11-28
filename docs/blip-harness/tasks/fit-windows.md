---
status: doing # todo | doing | done
step: N4 # forms and navigation
depends: [window-layout, menus-and-forms-guide]
pr:
---

# `fit-windows`: A window hugs its content, a value sits by its name

**Problem.** A design review of the menu and form examples (Impeccable critique, 30/40) found two faults in the shared parts. A `Window` takes its container's width: in a `Screen` 95% of the stage for two items, in a `split` two boxes 46% wide and as tall as the stage for three rows, and examples patch it with `w-[24em]`. Every row then pushes its value to the far end: a picker setting's `flex-1` label, `Content`'s fixed 11ch label column and `1fr` control column, a stepper's `justify-end`, a text field's `w-full`. "Sound" sat 77 stage pixels from "On".

**Outcome.** A window is as wide as its rows (its legend too), as a SNES/GBA menu box is; a `Dialog` and a `Screen` held upright widen it. `Content` shares one label column, as wide as the longest label, by subgrid; values start right after it. A menu is as wide as its rows on the wide stage. No example sets a window's width.

**Not included.** The value cell's fixed six characters, the legend's contrast (`--bui-dim`, 3.1:1), a 3-row menu scrolling on the phone beside a form.

**Acceptance criteria.**

- No window in a story is wider than its longest row, except where a parent widens it
- A label and its value are at most the label column's gap apart in `Content`, and a menu setting's value ends at the menu's longest row
- Pushback's screens keep their layout (`pnpm test:game`, the game's screenshots)
- Rule C-WINDOW-4; the pages of Window, Screen, Field, Parts and Stepper say it
- `pnpm test`, `pnpm typecheck`, `pnpm lint` pass; the new baselines looked at
- Changesets for `@sebald/blip-ui` and `@sebald/pushback`
- A fresh-context review in the pull request
