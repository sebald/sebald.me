---
status: doing # todo | doing | done
step: N+ # design adjustment from the mood board
depends: [mood-board]
pr: 243
---

# `tab-light`: The open tab continues the window's light

**Problem.** The open tab stands out of its window as a flat fill with one light line, and the window's dithered light band runs across under it, so the tab looks pasted on (from the mood board, 2026-11-25).

**Outcome.** The open tab carries the window's light (`WINDOW_LIGHT`, the window's own rows: a solid row and the fade) from its top edge, and its face runs on over the panel's top room (the window inset), so the panel's band does not cross under it: one light falling from the tab into the window. It stops at the inset, so it never covers the panel's text.

**Acceptance criteria.**

- The same dither as the window's, one source (`window.tsx`)
- Nothing in the panel's content covered, at 1x, 3x and on a phone
- Baselines looked at
