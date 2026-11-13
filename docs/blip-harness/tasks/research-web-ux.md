---
status: todo # todo | doing | done
step: A
depends: []
pr:
---

# `research-web-ux`: Draft rules from web UX and accessibility sources, and list the conflicts

**Problem.** Blip's accessibility sections say what each component does, not what a screen
built from them has to get right: errors, empty states, focus, dialogs.

**Outcome.** `candidates/*.blip-rules.yaml` for the web track and `conflicts.md` completed.

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
