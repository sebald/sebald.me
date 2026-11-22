---
'@sebald/blip-ui': patch
---

`Picker`: with several pickers on one layer (a docs page with several stories, two windows on a screen) the keys go to the one the player last pointed at, clicked or focused, the first until then. Before, every picker took Up and Down at once. A screen with one menu still works with no click, and a `Dialog` keeps its own layer.
