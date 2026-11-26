---
status: done # todo | doing | done
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

## Notes

**Dropped (2026-11-26), with the user.** Measured in the `LongList` story before building anything, the rows the list shows:

| Stage                                                     | Rows of 12 |
| --------------------------------------------------------- | ---------- |
| 1x (the docs' and visual tests' shot)                     | 2.6        |
| 2.25x (`MIN_SCALE`, the smallest wide stage a game shows) | 11.7       |
| 3x                                                        | 13.6 (all) |
| Tall, a 402px phone                                       | 9.2        |

Below `MIN_SCALE` the game asks for a bigger window instead of showing the stage, so the cramped list happens only at 1x, a scale no player gets. A smaller title and the legend in the frame there would add a third layout case to the kit for the docs alone. The screen's docs now say this, in place of "at 1x a shop has room for two rows and a half".
