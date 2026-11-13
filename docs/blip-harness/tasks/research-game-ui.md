---
status: todo # todo | doing | done
step: A
depends: []
pr:
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
