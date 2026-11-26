---
status: todo # todo | doing | done
step: N+ # found while finishing window-scroll
depends: [window-scroll]
pr:
---

# `short-stage-room`: A list gets more rows on the short stage

**Problem.** At 1x the stage is 214 stage pixels high. In a `Screen`, the screen's title (bitmap letters), the window's title and the legend under the list take most of it: after `window-scroll` (#252) a long shop shows two and a half rows, the three-item shop two. Nothing is cut off, but a list through a slot that small is cramped.

**Outcome.** On the short stage the frame gives the list more room, by two changes the user agreed to (2026-11-26):

1. The screen's title is smaller on the short stage (its bitmap letters a size down, or its blurb dropped), about one row more
2. The legend sits in the window's bottom frame instead of a row of its own, a little more

**Acceptance criteria.**

- The `LongList` story at 1x shows at least four rows; the 3x and tall shots don't get worse
- Nothing cut off (`tests/visual/layout.ts`), the legend still readable (contrast, size not below 0.75em)
- `pnpm test`, `pnpm test:game` pass; new baselines looked at
- A fresh-context review in the pull request
