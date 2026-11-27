---
status: done # todo | doing | done
step: D+ # found testing picker-item-parts, accepted by the user (2026-11-27)
depends: [picker-item-parts]
pr: 260
---

# `text-size`: One size for a line that says less

**Problem.** "A quieter line under something" was written four ways: a field's description at
0.75em (`field.styles.ts`), a screen title's blurb as `<Text className="text-[0.85em]">`, and in
Pushback the result screen's "n missed" at 0.85em and the glossary's blurb at 0.8em, a size off the
kit's scale. `Text variant="hint"` only made it muted, so every use added a size by hand.

**Outcome.** `Text size?: 'default' | 'small'`, `small` at 0.85em, the size of a picker item's
detail. The blurb, the field's description (0.75em to 0.85em) and both of the game's lines use it.

**Not included.** `PickerItemDetail` stays the picker's part: its job is its place in the row.
A field's error keeps its own style (danger, not a hint).

**Accepted by the user (2026-11-27):** "yes to the size small variant for texts".
