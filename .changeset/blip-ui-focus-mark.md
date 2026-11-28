---
'@sebald/blip-ui': minor
---

One focus mark: the primary colour, one pixel thick, inside the control's own box, so a focused control is never bigger than an unfocused one. `bui-focus` is now that frame (the orange `--bui-focus` token is gone), `bui-focus-line` an underline for a line of text. `Button` shows the menus' cursor left of it, the same on every variant, `IconButton` gets a frame, `Tabs` an underline (the panel a frame), `Switch` an underline, `TextField`'s underline stays (invalid is unchanged: the red caret alone shows focus), and a `Picker` row reached by Tab takes the cursor, now always in the primary colour. A new Foundations page, `focus`, holds each control's look with its contrast ratios and WCAG 2.4.13 note, and a test fails on a focus style outside it.

`Button`'s `secondary` is a key now too, a step lighter than the window with light letters, no longer an outline. `Actions` sets its buttons 8 stage pixels apart and, holding buttons, starts 8 in, room for the cursor (a `Dialog` keeps its actions centred). `TextField` is lower: two stage pixels above and below the text, no longer a `Button`'s height
