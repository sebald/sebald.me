---
status: done # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [mood-board]
pr: 242
---

# `window-edge`: One left edge and one right edge in a window

**Problem.** The mood board showed a window's parts lining up on different edges: a `Ledger`'s rows start at the window's inner edge while readouts and form rows start 8 in, and values end in different places (a menu setting at the row's end minus the row's padding, a stepper centred in its column, a readout right after its label).

**Outcome.** Decided with the user (2026-11-25): everything in a window starts on one edge and every value ends at the row's end. A `Ledger` in a `Content` starts at the cursor column as fields and readouts do; a `Readout` in a `Content` puts its number at the row's end; a `Stepper`'s value and arrows sit at the row's end, as a menu setting's; a menu row has no right padding, so its setting ends on the same edge as a text box. The mood board shows a menu row's note.

**Acceptance criteria.**

- In the mood board, measured: labels start on one edge, values, arrows and text boxes end on one
- Docs: `parts.mdx`, `stepper.mdx`
- Baselines looked at, the game's screens included
