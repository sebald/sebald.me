---
status: doing # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [field-ground]
pr:
---

# `help-column`: Every description and error in a form starts on one edge

**Problem.** In a window's form, a `Stepper`'s description and error started at the label and a `TextField`'s at the control column, so a form with both had two left edges for its hints (from the mood board, 2026-11-26).

**Outcome.** A stepper's words take the same areas as a text field's: in `Content` on a wide stage they start at the control column. The stepper-only areas in `Content` are removed. On a tall stage nothing changes: there is no label column, and the words take the row's width.

**Acceptance criteria.**

- Compared label edge (B), control column (C) and right-aligned (D) in the browser; the user chose C
- No layout code left only for the old placement
- Baselines looked at
