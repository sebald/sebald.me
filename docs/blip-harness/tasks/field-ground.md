---
status: done # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [stepper-cursor]
pr: 245
---

# `field-ground`: A text field is a line to write on, a pixel taller

**Problem.** Beside the steppers and buttons on the mood board, a text field looked a little small. Its dark ink ground was 1.10:1 against the window, so it added nothing WCAG 1.4.11 counts, and with the `Field`'s cursor at the label it said nothing the underline didn't (from the mood board, 2026-11-26).

**Outcome.** The field has no ground of its own and no inset at the sides: its text, its underline and the words under it start on one edge. It has four stage pixels above and below its text instead of two, a new `field` inset role (one step up the 1, 2, 4, 8 ladder; 3 is the cursor's). The underline, dim at rest (3.05:1 against the window), is its only edge, as before.

**Acceptance criteria.**

- Options compared in the browser (ink, none, lighter); the user chose none
- Contrast figures in `text-field.mdx` and `focus.mdx` are against the window
- Baselines looked at
- A `Field`'s characters left stay muted when full, never yellow (user, 2026-11-26)
