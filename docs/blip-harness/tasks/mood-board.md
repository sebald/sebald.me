---
status: doing # todo | doing | done
step: N+ # a check on the kit as a whole, any time
depends: [stepper]
pr: 240
---

# `mood-board`: Every control on one sheet, to keep the kit one look

**Problem.** Each component is tuned in its own story, one at a time. Whether they still look like
one set (the same text colours, the same weight of ink, the same focus marks, the same spacing)
shows only on a whole screen, and `Compositions/Together` shows only two screens (a duel, a menu),
which leave out most controls. A change to one component can drift from the rest without anyone
seeing the two side by side: the stepper's arrows against a menu setting's, a text field's well
against a readout's value.

**Outcome.** A story, `Compositions/Mood board`, that lays out every control and element of the
kit on the window's ground, in groups by what they do (choose, set and type, act, read, speak and
tell, contain), each with a one-line caption saying what it is for and how it shows the focus.
It is part of the visual tests, wide and tall, so a change to one component shows up next to all
the others in one picture.

**Included.** The story and its example file under `src/compositions/` (or its own folder there),
built only from the kit's components as their docs say, with no styles of its own beyond laying
the groups out. Every component in `src/components/` appears, or the task file says why not.

**Not included.** A new component or a change to one; what the sheet shows is fixed in its own
task. Any eval task change.

**Acceptance criteria.**

- Every component in `src/components/` on the sheet, or listed here with the reason it is left out
- Groups by what the player does with them, each captioned with its purpose and its focus mark
- States side by side where a component has them: rest, disabled, invalid, chosen
- One control has the real focus (a `play` function), since a page shows only one
- In the visual tests, wide at 1x and 3x and tall; no text cut off, nothing outside the root
- Looked at at 1x, 3x and on the phone before it is merged

**Notes.**

- Left out, each with its reason: `Stage`, `Screen` and `Controls` frame a whole screen and are seen in `Compositions/Together`; `Dialog` and `Confirm` lie over the screen and would cover the board; `ScreenTitle` is a screen's header, placed by the screen. `IconButton` and `IconToggle` stand alone in a corner or in `Controls`, not in a window's `Actions` (`icon-button.mdx`), so they are seen in `Together`'s bar; a bare `Setting` has no keys of its own (`setting.mdx`), so the board shows its look through `PickerSetting` and `Stepper` `Window`, `Parts` (`Title`, `Content`, `Actions`), `Field` and `Form` are the board's own frame, so they are on it in every group
- The focus is on the Form's first stepper (`play`); the visual tests wait for Storybook's `finished` phase, so the shot has it, so the board shows the newest mark, the arrows; the menu shows no cursor until it is used
- First look, two things to decide in their own tasks: a `Ledger`'s rows start at the window's edge while readouts and form rows start 8 in (the cursor column); a menu setting's value sits at the row's end, a stepper's in the middle of its column
