---
'@sebald/blip-ui': minor
---

One focus mark: the primary colour, one pixel thick, inside the control's own box, so a focused control is never bigger than an unfocused one. `bui-focus` is now that frame (the orange `--bui-focus` token is gone), `bui-focus-line` an underline for a line of text. `Button` and `IconButton` get a frame, `Tabs` an underline (the panel a frame), `Switch` an underline, `TextField`'s underline stays and is two pixels thick when invalid too, and a `Picker` row reached by Tab takes the cursor, now always in the primary colour. A new Foundations page, `focus`, holds each control's look with its contrast ratios and WCAG 2.4.13 note, and a test fails on a focus style outside it
