---
'@sebald/blip-ui': patch
---

`Picker`: with several pickers on one layer (a docs page with several stories, two windows on a screen) the keys go to the one the player last pointed at, clicked or focused, the first until then. Before, every picker took Up and Down at once. The menu without the keys shows no cursor or note. A screen with one menu still works with no click, a `Dialog` keeps its own layer, and `Tabs` with `keys` share left and right the same way.
