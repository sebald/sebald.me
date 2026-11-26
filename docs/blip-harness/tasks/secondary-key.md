---
status: doing # todo | doing | done
step: N+ # found while reviewing back-action
depends: []
pr:
---

# `secondary-key`: The secondary button is a muted key again

**Problem.** Since `look-here` (#241) the secondary button is its label alone, no key. Beside the paper primary it reads as a web text link, too modern for the kit (the user, 2026-11-26).

**Outcome.** `secondary` is a key again, as before #241: a face a step lighter than the window, light letters. The primary stays paper, and no yellow comes back: the cursor still shows the focus on every variant.

**Acceptance criteria.**

- The secondary is the muted key; `button.mdx`'s variant table and `colour.mdx` say so
- `pnpm test`, `pnpm format:check`, `pnpm lint` pass; a changeset
- New baselines looked at; a fresh-context review in the pull request

## Notes

- The styles are #241's predecessor's, unchanged: face `surface-light` with 22% `neutral`, light row with 45%, shade `surface-shade`, letters `text-bright`. Its hover and press are the key's own (brighter, then a darker face with the shade on top), so the text-only hover colours went with it
- `button.mdx`'s accessibility line (letters 6.44:1 on the face, the face 1.79:1 to the window) was never changed in #241 and is right again
