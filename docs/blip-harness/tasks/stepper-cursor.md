---
status: doing # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [look-here, mood-board]
pr: 244
---

# `stepper-cursor`: A stepper shows its field's cursor; its arrows turn white

**Problem.** A focused stepper showed its arrows in yellow and no cursor at its label (`data-marks-focus`), the only field that did. Under the yellow rule (`look-here`) the cursor should be the row's one yellow sign. In a menu the arrows also looked crowded against a six-letter value ("Normal" fills the six-character slot exactly, 2 stage pixels from each arrow), and the mood board's menu had a note on only one row (from the mood board, 2026-11-26).

**Outcome.** A stepper's focus is its `Field`'s cursor at the label, like every other field, and its arrows turn bright (`--bui-text-bright`) as a second cue. `data-marks-focus` is gone. The arrows sit a `regular` gap (4) from the value, in a `Stepper` and a `PickerSetting` alike. Every row of the mood board's menu has a note.

**Acceptance criteria.**

- The cursor shows at a focused stepper's label; the arrows are bright, not yellow
- The arrows have the same gap in a form and in a menu
- Uniformity test, `stepper.spec.ts`, focus/stepper/field docs and AGENTS.md updated
- Baselines looked at
