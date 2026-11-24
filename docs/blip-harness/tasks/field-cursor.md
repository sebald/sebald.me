---
status: done # todo | doing | done
step: N2 # forms and navigation
depends: [field, focus-style]
pr: 233
---

# `field-cursor`: The cursor is the focus mark of every control, fields too

**Problem.** The menus' cursor marks focus on a `Picker` row, a `Button` and an `IconButton`, but a field shows it by its underline alone, and an invalid field (red underline, focused or not) only by its blinking red caret, short of WCAG 2.4.7. A player stepping through a form follows two signs.

**Outcome.** A `Field` shows the cursor 3 stage pixels left of its label while its control has the keyboard's focus; the control's own look (a `TextInput`'s underline) stays as a second cue. `Content` starts its form rows 8 in, the cursor column a `Picker` and `Actions` have, so the cursor has its room and labels, menu items and buttons line up. The controls that can't hold a cursor yet are listed as exceptions.

**Acceptance criteria.**

- The cursor shows on a focused field from the keyboard, never under a finger, and meets the cursor's room in every story (the Blip visual tests)
- An invalid focused field shows the cursor; the "red caret only" exception is gone from the docs
- `foundations/focus.mdx`, `building-components.mdx`, `focus.blip-rules.yaml`, `AGENTS.md` and the pages of `TextField`, `Field`, `Switch`, `Tabs`, `Parts` say the cursor is the mark and name the exceptions
- `uniformity.test.ts` catches focus variants written as a group's `has-[:focus-visible]`, a named group or `data-[focused]`
- A changeset naming `@sebald/blip-ui`

## Notes

Decided with the user, 2026-11-24, after research by three subagents (games, WCAG and design systems, an audit of the kit):

- **At the label**, not the input: games keep the pointer at a row's name whatever the row holds, the cursors stay in one column, and beside the input it would sit next to its own label's text, against the cursor's room
- **Underline kept** as a second cue: XAG 113 asks for redundant cues. **No longer thickens** (the user, after review: "looks weird"): it stays one pixel and only turns gold, so 2.4.13's area, which the 2 px line passed, now fails for fields; AAA, noted, not a gate. The caret counts for 2.4.7 (W3C's Understanding page) but blinks, which a mark may not
- **Hidden under a finger**, as a `Picker`'s and a `Button`'s: the open keyboard, the caret and the underline show it
- **Exceptions for now**: `Tab` (no room: 9 stage px per side needed, tabs closer, closer still on a tall stage), `TabPanel` (marks a whole window), `Switch` (replaced by the stepper, which gets the cursor), Pushback's role tiles and glossary tabs (8 apart, not 12)

Found on the way: Tailwind's `not-touch:` on the kit's `touch` media variant compiles to `@media not all`, which never matches; the cursor uses the complement written out, `[@media(hover:hover),(pointer:fine)]:`. The focus test's variant pattern missed `group-has-[:focus-visible]/field:` and `data-[focused]:`; widened.
