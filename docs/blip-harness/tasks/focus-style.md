---
status: doing # todo | doing | done
step: N1 # forms and navigation
depends: []
pr: https://github.com/sebald/sebald.me/pull/226
---

# `focus-style`: One focus look per control, and it passes WCAG

**Problem.** Focus looks differ today: an orange outline (`bui-focus`) on some controls, gold (the primary colour) on others, such as `TextField`'s underline and `Picker`'s cursor. A player cannot learn one sign for "you are here", and nobody has checked each against WCAG.

**Outcome.** One focus language per control, built on the gold, which the user prefers for the game feel. Each one satisfies WCAG 2.4.7 (visible), 1.4.11 (the indicator is at least 3:1 against what is next to it) and, where it can, notes 2.4.13 (the change of contrast, AAA) without making it a gate. The contrast numbers are written down.

**Included.** A decision table in `foundations` docs (control, its focus look, the ratios against the window, the fill and the unfocused state), the change in `Button`, `IconButton`, `TextField`, the stepper (once it exists; until then its mock), `Tabs`, the `Dialog` close button, `Picker`'s cursor, and links in docs if there are any, a foundation test that fails on a focus look outside the table, and the rule in the sidecars.

**Not included.** A new focus ring token set for a game to override beyond the existing `--bui-*` roles. Focus order (that is `form-navigation`).

**Acceptance criteria.**

- One focus look is named in the foundations docs and every control above uses it or says why not
- Each look passes 2.4.7 and 1.4.11 against the window and against the control's own fill, with the ratios in the docs; 2.4.13 is noted per control (pass or fail, and why)
- Focus is never shown by colour alone: place or shape changes too (Xbox guideline 103)
- `foundations/uniformity.test.ts` (or a sibling test) fails on a focus style outside the table
- Looked at on a stage with Pushback's palette as well as the default, since the game maps its own colours
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** Nothing. It lands before `field` and `stepper` so they start on the right look; the mocks' numbers are in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md) (section 2).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).

### Worked on 2026-11-22

**Decision.** One mark: the primary colour, one `--bui-px` (3 CSS px at least) thick, inside the control's own box, so nothing is bigger focused than not. `bui-focus` is now a negative-offset outline (a frame inside the edge); `bui-focus-line` an underline; the orange `--bui-focus` token is gone. A key whose own face is primary uses its letters' colour, one pixel in (`--bui-focus-color`, `--bui-focus-inset`). The look and ratios are in `src/foundations/focus.mdx`; `uniformity.test.ts` fails on a focus style outside it and on a control missing from its table.

| Control            | Mark                                                                                         | Contrast                                            | 2.4.13 (AAA)                     |
| ------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| Button primary     | ink frame 1 px in from the face edge                                                         | ink on gold 11.55 (light row 17.10, shade row 6.02) | pass                             |
| Button destructive | cream frame, same place                                                                      | cream on danger 4.17 (on the light row 2.68)        | pass                             |
| Button secondary   | ring turns primary + 1 px primary line inside                                                | gold on window 10.51, on ground 11.92               | pass                             |
| IconButton         | primary frame at the edge on an ink fill                                                     | gold on ink 11.55, window 10.51                     | pass                             |
| TextField          | underline 1 px dim to 2 px primary; invalid 2 px danger (was 1 px, no cue)                   | gold on ink 11.55; danger on ink 4.56               | pass above about 150 CSS px wide |
| Tab                | primary underline under the label                                                            | 11.53 on a tab, 10.51 on the open one               | fail (short line)                |
| TabPanel           | frame over the window's edge                                                                 | 10.51                                               | pass                             |
| Picker row         | the cursor, now always primary; Tab puts the cursor on the row                               | 10.51                                               | fail (small)                     |
| Switch             | underline under name and state                                                               | 10.51                                               | fail                             |
| Dialog, Confirm    | no mark on the window (keys pick); the control inside shows it; a Dialog has no close button |                                                     |                                  |

No links in the kit. Pushback's palette has the same values as the defaults, so the numbers hold; its `pb-focus` (orange) is removed and the select tiles and glossary tabs use `bui-focus`.

**Found.** An outline on a parent is painted under an opaque child (the button's face, the window), so the button and the panel draw the mark on a pseudo-element of the face and the panel. A negative `outline-offset` measures to the outline's inner edge, so `-1` is the outermost pixel. TextField invalid and focused had no cue but the caret (known gap in its page); fixed by the thickness. The `Picker` cursor was white; it is primary now, so a baseline change.

**Review (fresh-context subagent), answered.** Fixed: the gold-cursor fallback on a focused row is gone (Tab sets the cursor through `onFocus`), the dead `--bui-focus` in the eval template removed, docs reworded (range 4.17 to 11.92; the icon button's ink fill darkens). Left open: after Tab, the arrow keys still move the Picker's cursor while DOM focus stays on the row Tab reached, so Enter acts natively on the focused row (existed before; belongs to `picker-key-scope`); the focus tests scan only `*.styles.ts` (not Pushback, not `peer-`/`has-` variants); `bui-focus-line` shows nothing on a wrapped label; a forced-colors check of the cursor is not done; touch plus a keyboard shows no cursor on a Tabbed row.
