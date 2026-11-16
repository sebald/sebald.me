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

- **What's there.** `catalog.md`: 61 entries in the nine areas, each with use, not, a Blip
  page or "gap", the tasks that touch it and its candidates, plus a table per eval task and
  the gaps ranked by how many tasks touch them. `candidates/`: 24 files, 80 candidates
  (7 with a proposed check and a fix, 64 `[review]`, 9 `[open]`). `conflicts.md`: 9
  conflicts, each with both sources and Blip's `path:line` or "undecided".
- **Sources.** The Game Accessibility Guidelines, the Xbox Accessibility Guidelines 3.2,
  AbleGamers' APX, Apple's HIG for games and game controls, the Steam Deck review, a Game
  Developer article on HUDs, Roblox's UI/UX page, MDN. All 43 links were opened (HTTP 200,
  no "not found" titles) on 2026-11-14.
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
- **Checks named, not written.** `foundations-length`, `foundations-text-size`, `one-blink`,
  `back-item-last`, `no-shrink-target`, `no-own-audio`, `arrow-alternative`. The pack step
  would fail on them today; candidates aren't packed.
- **Gaps most tasks touch:** screen layout (all six, Q11), the empty list (3), a
  notification or the result of a transaction (3), a single number readout (3). `quests`
  has no pattern on purpose (Q12); its objective reminder is a good gap to leave open.
- **Not settled by research:** how faint `bui-disabled` is against a window (conflict 3),
  what browser zoom does to the stage's text (6). Both need a measurement.
- **Checked by a script, not committed:** ids by kind and page, one sentence per `text`,
  `check` with `fix` or a marker, a `source` on every rule, and every id the catalog names
  exists and the other way round.
