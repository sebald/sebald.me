---
status: doing # todo | doing | done
step: A
depends: []
pr: https://github.com/sebald/sebald.me/pull/189
---

# `research-game-ui`: Catalog game UI elements and draft rules from game UX sources

**Problem.** Blip's pages describe the components Pushback needed. Which elements a small game
needs beyond those, and what the rules for them are, is not written down anywhere.

**Outcome.** In `packages/blip-ui/research/`: `catalog.md`, `candidates/*.blip-rules.yaml`,
and the game half of `conflicts.md`.

**Included.** Menus and navigation, HUD, inventory and shops, dialogue, save and load,
onboarding, feedback, input across keyboard, gamepad and touch, readability at pixel scale. Per
catalog entry: when to use, when not, the Blip component that covers it or "gap". Candidate
rules in the sidecar format (spec 2.2), each with a `source` link.

**Not included.** Moving any candidate into a sidecar. Building components. The tarball
(`research/` is not in `files`).

**Acceptance criteria.**

- Every catalog entry names a Blip page or says "gap"
- Every candidate rule has an id by kind, one requirement, and a `source` that opens
- A candidate that no tool could check is marked `[review]`, an unsettled one `[open]`
- The entries the six eval tasks touch are all present

**Depends on.** Nothing. Reads [`eval-tasks`](eval-tasks.md) if it is there.

**Changes in the eval.** None directly. With day zero's results it decides which components
get built and which gaps stay open.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

- **What's there.** `catalog.md`: 64 entries in the nine areas, each with use, not, a Blip
  page or "gap", the tasks that touch them and its candidates, plus a table per eval task
  (read from each ticket and rubric, so an entry a ticket doesn't ask for is not listed) and the
  gaps ranked by how many tasks touch them. `candidates/`: 24 files, 96 candidates (3 with a
  proposed check and a fix, 73 `[review]`, 20 `[open]`). `conflicts.md`: 9 conflicts, each with
  both sources and Blip's `path:line` or "undecided".
- **Sources.** The Game Accessibility Guidelines, the Xbox Accessibility Guidelines 3.2,
  AbleGamers' APX, Apple's HIG for games and game controls, the Steam Deck review, a Game
  Developer article on HUDs, Nielsen Norman Group (heuristics, empty states, error messages),
  WCAG 2.2 (focus not obscured, headings and labels, status messages, focus visible), MDN.
  Each source was opened and read against the claim of its rule on 2026-11-16, not only
  loaded. Where the page didn't say what the rule says, the rule got a source that does, was
  narrowed to what the source says, or became `[open]` with a note that the rule is Blip's own
  call (11 rules, among them the checked `C-PICKER-101`, `F-LENGTH-101`, `F-MOTION-102` and
  `A-FEEDBACK-101`, whose checks wait until they are settled). Apple's HIG pages render in the
  browser, so they were read from the JSON behind them.
- **One file per page.** A candidates file is named for the page its rules would move into,
  with that `page:`, so moving a rule is a cut and paste. Pattern pages that don't exist yet
  get a name: `shop`, `saves`, `pause`, `hud`, `quests`, `title`, `navigation`, `options`,
  `empty`, `feedback`, `dialogue`, `help`, `input`, `grid`. F rules go to `introduction`
  (Q9).
- **Candidate ids start at 101 per page.** The `rule-extraction-*` tasks number the pages'
  own rules from 1 (and Q9's `F-COLOUR-1` and the rest), so a candidate keeps its id and its
  `source` when it moves into a sidecar, the catalog's references stay right, and no id is
  reused.
- **No restatements.** Candidates that only repeated a page's own Do or Don't (a disabled
  row's note, one call at a time, naming the confirm option) were dropped: the
  `rule-extraction-*` tasks turn those into rules.
- **Checks named, not written.** `foundations-text-size`, `no-shrink-target`,
  `arrow-alternative`. The pack step would fail on them today; candidates aren't packed.
- **One sentence, one requirement.** Rules that held two (`P-SAVES-101`, `P-PAUSE-103`,
  `A-INPUT-101`, `P-INPUT-101`, `P-SHOP-104`, `A-FEEDBACK-102`, `P-SHOP-106`, `C-METER-101`,
  `P-HUD-102`, `P-QUESTS-102`, `P-SAVES-103`) were split; the new ids continue after the
  page's highest. `F-LENGTH-102` and `P-HUD-108` said the same thing; `P-HUD-108` is gone
  (its id is not reused).
- **Gaps most tasks touch:** screen layout (five of six, Q11), a single number readout (3),
  the empty list (2), a notification or the result of a transaction (2). `quests` has no
  pattern on purpose (Q12); its objective reminder is a good gap to leave open. `fight-hud`
  asks for nothing to be chosen, so it touches no menu, way back, hints or keys.
- **Not settled by research:** how faint `bui-disabled` is against a window (conflict 3),
  what browser zoom does to the stage's text (6). Both need a measurement.
- **Checked by a script, not committed:** ids by kind and page, one sentence per `text`,
  `check` with `fix` or a marker, a `source` on every rule, and every id the catalog names
  exists and the other way round.
