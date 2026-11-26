---
status: doing # todo | doing | done
step: D+ # follow-up of screen-layout, before a game screen relies on Screen
depends: [screen-layout]
pr:
---

# `window-scroll`: A long list in a window scrolls instead of being cut off

**Problem.** A `Window`'s `Actions` part grows with its content and has no height limit. In a
`Screen` at 1x (a 320 × 214 stage) a shop or menu with more rows than fit runs past the stage's
bottom edge and is cut off: the rows are gone, the key legend with them, and a `Picker` still moves
its cursor onto rows nobody can see. On a phone they can't be scrolled to either. `screen-layout`
(#218) found it: its shop story only fits because its text was shortened.

**Outcome.** Inside a bounded height (a `Screen`, a stage), a window's list takes the room that is
left and scrolls; the title, the content above it and the legend stay where they are. A `Picker`
keeps its current row in view when the arrows move it, by jumping, not gliding (list navigation is
not animated, `building-components.mdx`).

**Included.** The change to `Window` and/or the shared `Actions` part, and to `Picker` for keeping
the row in view; a story with a long `Picker` in a `Screen` (so the layout check at 1x covers it);
the pages and rules sidecars updated.

**Not included.** A visible scrollbar design beyond what the stage's styles give. Any eval task
change.

**Acceptance criteria.**

- A `Screen` with a 12-row `Picker` at 1x, 3x and on the phone: nothing is cut off
  (`tests/visual/layout.ts` passes), and every row can be reached by keys, by a tap and by scrolling
- Moving the cursor past the last visible row brings it into view at once, without motion
- Windows that fit are unchanged (their baselines don't move)
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; new baselines via `pnpm vrt:update:ci`
  (asked first), looked at before they are committed
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`screen-layout`](screen-layout.md).

**2026-11-22.** Part of the forms and navigation work (step N1 in the [README](README.md#forms-and-navigation)): `window-layout` and the filtered-list pattern need it.

## Notes

2026-11-26:

- The `Picker` already scrolled, kept its row in view by setting `scrollTop` (a jump, no glide) and showed its rail; what was missing was a window that gives it less room. Two `min-h-0`s did it: the `Window` (a flex item in the `Screen`'s column) and `Actions` in its body; `Actions` holding a `Picker` is a column, so the menu shrinks in it. The window's other parts don't shrink (`shrink-0`): the title, the content and the legend keep their size
- `Screen`'s new `LongList` story: twelve rows in a shop. At 1x two and a half rows show with the rail; upright (402 / 320) the rows are a thumb high and it scrolls too
- `tests/visual/window-scroll.spec.ts`, at 1x and upright: the window stays inside the stage, its title and legend in view, the list scrolls; the arrows bring every row into view in the frame they move the cursor; scrolled to its end, a tap picks a row. `tests/visual/layout.ts` already leaves a scrolling list's clipped row alone
- Docs: `screen.mdx` (a list longer than the stage), `picker.mdx`, `window.mdx`; rule `C-WINDOW-3` (no height or overflow of one's own to fit a screen)
- The scroll by wheel or drag is the browser's: the test sets `scrollTop`, it doesn't drag
