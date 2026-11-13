---
status: todo # todo | doing | done
step: G
depends: [examples-and-patterns, rule-format, day-zero, research-game-ui]
pr:
---

# `patterns`: Write pattern pages for the screens a small game needs

**Problem.** After `examples-and-patterns` Blip has two pattern pages, both of Pushback's
screens. The plan step looks up a pattern before it builds a screen, and for most screens a
small game needs (buying and selling, save slots, an options menu, a HUD) there is none.

**Outcome.** Three or four pages in `src/patterns/`, chosen from the research catalog and from
what day zero's agents built by hand, each with its sidecar, example and composition story.

**Included.** The choice of patterns with its reasons, in the pull request. Per page: when to
use, when not, the parts and which component each is, the states a ticket does not mention
(empty, not affordable, full), an example file, and `P` rules moved from the research
candidates you approve (each with its source). A composition story per pattern; its new
baselines are looked at before they are committed. Generating them with
`pnpm vrt:update:ci` starts a workflow: ask before running it (or use `pnpm vrt:blip-ui:update`
locally in Docker).

**Not included.** New components: a pattern built on a gap uses the closest fit and says so,
or waits for the component. A pattern for `quests` or `camp-rest`: those two tasks stay without
a matching pattern, so the sweep can compare (**Q12**).

**Acceptance criteria.**

- Every example type-checks against `dist/` as consumer code
- Every `P` rule has a `source` or a reason on the page
- Searching with words from a matching task's ticket (not the pattern's name) returns the
  pattern in the first three results; this is checked for each matched task
- `evals/blip/README.md` lists which task matches which pattern
- The layout check passes on the new stories, wide and on a phone

**Depends on.** [`examples-and-patterns`](examples-and-patterns.md), [`rule-format`](rule-format.md), [`day-zero`](day-zero.md), [`research-game-ui`](research-game-ui.md).

**Changes in the eval.** What the plan step can find. The sweep reports tasks with and without
a matching pattern apart.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
