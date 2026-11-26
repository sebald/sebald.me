---
status: done # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [mood-board]
pr: 241
---

# `look-here`: Yellow says "look here"; buttons that stand out without it

**Problem.** Yellow is the cursor, the focus and the main button's face at once, so a screen has several yellow things and none says "here". On a window the yellow key is harsh next to everything else (from the mood board, 2026-11-25).

**Outcome.** A guideline, `foundations/colour.mdx` with its rules: yellow (`--bui-primary`) is kept for the cursor, the focus' second cue and the next step; never a button face, a frame or a large area; the game's art keeps its palette. `Button`'s `primary` is a paper key with ink letters (15.9:1 on the window, 18:1 on the stage), `secondary` its label alone. The text field keeps its dim underline at rest (the box against the window is 1.10:1, so the line is its edge, WCAG 1.4.11), yellow while typed in, red when invalid.

**Decided with the user.** Paper primary over slate (slate was 1.79:1 on the window); a text secondary; the underline stays at rest.

**Acceptance criteria.**

- The colour page and its rules sidecar, linked from `AGENTS.md`
- No yellow button face anywhere in the kit's stories or the game
- Baselines looked at, the game's screens included
