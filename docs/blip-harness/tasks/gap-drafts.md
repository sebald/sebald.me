---
status: todo # todo | doing | done
step: K
depends: [reviewer]
pr:
---

# `gap-drafts`: Draft a note when Blip has nothing that fits

**Problem.** When the design system lacks something, an agent invents it quietly. The
design system's owner never hears what was missing.

**Outcome.** `blip gap new`, the wording in the plan skill and the reviewer that leads to it,
and the `full` configuration.

**Included.** The command and the file format: what was needed, what was used instead, file
and line. Event `gap`. The reviewer's "gaps" group listing the drafts. The instruction to use
the closest fit, draft, and end the turn.

**Not included.** Filing an issue. Deciding whether a gap is real.

**Acceptance criteria.**

- `blip gap new …` writes one file and prints its path; the same gap twice updates it
- In a `full` run on a task that touches a gap left open on purpose, a draft names it
- In a run on a task with no gap, no draft is written
- `summary.md` lists every draft for me to mark as real or not

**Depends on.** [`reviewer`](reviewer.md). Needs at least one gap left open by [`day-zero`](day-zero.md).

**Changes in the eval.** Configuration `full`. Metrics: drafts per run, share that name a real
gap (marked by hand), components invented without a draft.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
