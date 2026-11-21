---
status: done # todo | doing | done
step: A
depends: []
pr: https://github.com/sebald/sebald.me/pull/191
---

# `research-web-ux`: Draft rules from web UX and accessibility sources, and list the conflicts

**Problem.** Blip's accessibility sections say what each component does, not what a screen
built from them has to get right: errors, empty states, focus, dialogs.

**Outcome.** The web track's candidates in `candidates/*.blip-rules.yaml`, in the same file per
page as the game track's, numbered from 201 per page (the game track's are 101 and up), and
`conflicts.md` completed.

**Included.** Usability heuristics, WCAG 2.2, forms and errors, empty and loading states,
focus and dialogs. Conflicts between game and web conventions, each with both sources (for
example: a menu that wraps against a list that stops; a disabled item that stays reachable,
which `picker.mdx:57` already chose).

**Not included.** As `research-game-ui`.

**Acceptance criteria.**

- Every candidate has a `source`; WCAG candidates name the success criterion
- `conflicts.md` states for each conflict what Blip does today, with `path:line`, or "undecided"
- No candidate restates how a Blip component is built

**Depends on.** Nothing.

**Changes in the eval.** None directly. Feeds the rubric's unstated requirements in later task
sets.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

- **What's there.** 28 candidates in 13 page files, from 201 per page beside the game track's
  101s: 8 pages the game track opened (`feedback`, `confirm`, `navigation`, `help`, `picker`,
  `input`, `introduction`, `hud`) and 5 new (`text`, `dialog`, `stage`, and two gaps,
  `loading` and `field`). 18 `[review]`, 10 `[open]`; none names a check yet, so every one
  carries a marker. `conflicts.md`: the game track's 1 to 9 completed from the web side, 10 to
  16 added, three settled.
- **Built on `research-game-ui`.** The files are shared, so this branch starts from that
  pull request (#189) and is merged after it.
- **Each source checked against its rule.** I read every source and found the claim in its
  text, not only that the link opens. Dropped where nothing said it: an empty slot keeping
  its place (NN/g's empty-state article doesn't say it), a failed load offering a way on
  (Carbon's loading page doesn't), `aria-invalid` (GOV.UK's page uses only
  `aria-describedby`), a label that stays while typing (3.3.2 doesn't mention placeholders).
  Five rules are Blip's own call on the closest source and are `[open]`: renaming the stage
  per screen (2.4.2 speaks of a page's title), coming back to a menu on the item left from
  (the APG makes it optional), one key that closes every overlay (XAG 112 asks only for
  consistent navigation), a refusal said in text (3.3.1 covers input errors detected
  automatically, not a refused pick) and a label on every text field (3.3.2 lets
  instructions, an icon or the context do). In `conflicts.md`, the game halves of 11 (the
  pointer moves the cursor) and 15 (the cursor starts on the safe answer) have no game
  source and say they are Blip's own inference.
- **Exceptions kept.** Contrast keeps 3:1 for large text and exempts disabled items (left to
  `F-COLOUR-102`); blinking exempts the essential; focus not obscured is "entirely" and only
  for what the game lays over a screen by itself, not what the player opens; the same action
  may add what it acts on to its name (3.2.4 asks for consistent, not identical); a hover
  note need not close if it covers nothing. Reflow exempts games by name, so its candidate
  went and the conflict is settled.
- **One requirement each.** The "or" left in `A-INPUT-201` is WCAG 2.1.4's own exception (turn
  off or remap), not a second requirement.
- **Rubrics.** Read all six; no candidate penalizes what a statement requires. Scoped for
  them: the text alternative of art says what the art shows (a bar without a number reads
  "badly hurt"), so enemies' HP stays hidden; focus visible and closing overlays apply only
  to screens that take keys, so the read-only fight HUD is out. A Dialog is ruled out only
  for information unrelated to what the player is doing (NN/g's wording), so the controls
  and how-it-works dialogs the pause and help pages ask for stay.
- **No duplicates.** Against the game track's candidates and Blip's own pages, I dropped every
  draft already covered (empty states, results announced, flashes, keyboard access, time
  limits, music volume, help from the pause menu, settings kept, way back, price in the
  row, keys under a dialog (`A-PAUSE-108`), readable dates (`T-SAVES-110`), among others).
  After review also: a refusal announced (the Picker already reads a disabled row's note,
  `picker.tsx:385-387`), naming what is missing and what to do instead (`T-SHOP-101`,
  `T-PICKER-101`), no Confirm before a routine action (Confirm's own doc says what it is
  for, and it sat against `P-SHOP-104`), and a 44-pixel target (`A-CONTROLS-101`,
  `introduction.mdx:26-27`, and AAA).
- **`wcag`.** A candidate-only field naming the success criterion and level on every
  candidate that rests on WCAG.
- **Checked.** Every link returns 200, the YAML parses (124 ids, unique across both tracks),
  every rule has a marker or a check with a fix, every Blip reference in `conflicts.md` has a
  line inside its file, `oxfmt --check` passes.
- **For later, not changed here.** A Picker's cursor is `aria-current`, not the focus, so a
  screen reader may hear nothing as it moves (conflict 10, not tried with one yet); W and S
  are heard on `window` with no way to turn them off, against 2.1.4 (5); a `ruledOut` row
  fades to 25% though it can still be picked (3).
