---
'@sebald/blip-ui': minor
---

The focus cursor gets its room. `IconButton` shows focus with the menus' cursor too, like `Button`, instead of a frame on an ink fill. Every cursor is 3 stage pixels from what it points at, and nothing else it could point at is closer than 6: `Actions` sets its buttons 12 apart (12 is a new `SPACE` step), `Controls` sets corner buttons 8 apart and at least 6 from the stage's left edge, bar buttons have 6 stage pixels at their sides and 2 more between two. The cursor is an element now (`data-slot="cursor"`), and the visual tests check its room in every story (`cursorRoom`)
