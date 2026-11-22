---
status: todo # todo | doing | done
step: N1 # forms and navigation
depends: []
pr:
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
