---
'@sebald/blip-ui': patch
---

Picker: `position` shows the cursor's place under the list (`3 of 12`); each row carries its place in the whole list for a screen reader, across groups. The columns' header row is `role="presentation"` with keys by index, as #261 meant
