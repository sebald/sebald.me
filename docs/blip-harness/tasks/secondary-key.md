---
status: doing # todo | doing | done
step: N+ # found while reviewing back-action
depends: []
pr: 251
---

# `secondary-key`: The secondary button is a muted key again

**Problem.** Since `look-here` (#241) the secondary button is its label alone, no key. Beside the paper primary it reads as a web text link, too modern for the kit (the user, 2026-11-26).

**Outcome.** `secondary` is a key again, its bevel visible on the bare stage too, and the primary a step down from paper so it doesn't glare beside it;, as before #241: a face a step lighter than the window, light letters. The primary stays paper, and no yellow comes back: the cursor still shows the focus on every variant.

**Acceptance criteria.**

- The secondary is the muted key; `button.mdx`'s variant table and `colour.mdx` say so
- `pnpm test`, `pnpm format:check`, `pnpm lint` pass; a changeset
- New baselines looked at; a fresh-context review in the pull request

## Notes

- The styles are #241's predecessor's, unchanged: face `surface-light` with 22% `neutral`, light row with 45%, shade `surface-shade`, letters `text-bright`. Its hover and press are the key's own (brighter, then a darker face with the shade on top), so the text-only hover colours went with it
- `button.mdx`'s accessibility line (the face 1.79:1 to the window) went untouched in #241, wrong while the secondary had no face, right again; the letters are 6.47:1 (it said 6.44)
- Review: no important findings; the `--b-ink` fallback #241 added for the transparent secondary is gone with it
- The user, on the docs page: the secondary's bottom looked cut off. Its shade row (`surface-shade`, #0a0d1a) and the ink under it are the stage's own dark (#07080d, 1.03:1), so on the bare stage only the light row showed. The shade row is now halfway from the face to `surface-shade` (1.32:1 to the stage), and the bevel shows on the stage and in a window
- Asked with it: the primary a step darker. The face is paper mixed 55% toward `paper-shade` (#e1dccd), full paper its light row, `paper-shade` 22% toward ink its shade. Letters 14.1:1 (were 18.6), the face 12.9:1 to the window and 14.6:1 to the stage (were 15.9 and 18)
- Both mix tokens in the component, as the secondary already did before #241; `tokens.css` says no component should. A key ramp of its own (`--bui-key-*`) would be the clean form, later if a game wants to set it
