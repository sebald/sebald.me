---
status: done # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [look-here, stepper-cursor]
pr: 247
---

# `menu-white`: The menu row under the cursor is bright, not gold

**Problem.** Pushback mapped `--bui-text-selected` to its light gold, so the row under the cursor, and a setting's arrows on it, were yellow beside the yellow cursor: two yellow signs on one row, against `look-here` (from the options screen, 2026-11-26).

**Outcome.** Pushback's selected row is its warm white (`--pb-heading`). The kit gives a `PickerSetting`'s arrows the bright text colour explicitly, so whatever a game maps the selected colour to, the arrows never turn yellow. `colour.mdx` names the selected row as a chosen state, not yellow.

**Acceptance criteria.**

- No yellow on a menu row but the cursor (and an accent item, the next step)
- The game's screenshots looked at
