---
status: todo # todo | doing | done
step: M
depends: [sweep]
pr:
---

# `reviewer-rendered`: Let the reviewer look at the rendered screen

**Problem.** The reviewer reads code. A window outside the stage or a cut-off price it can only
guess at, though the eval already measures both.

**Outcome.** `blip review --rendered` opens the changed screens wide and narrow, runs the
layout check, and adds what it finds to the packet.

**Included.** Moving `escapes()` to where both Blip's tests and the CLI can use it. A way for
a project to say how a screen is opened (`blip.config.json`). Playwright as an optional peer.
A new configuration after `full`.

**Not included.** Screenshots as baselines. axe in the reviewer (a follow-up if this pays).

**Acceptance criteria.**

- A screen with text cut by its window yields a finding with the element and the pixels
- Without Playwright installed, the review runs as before and says the rendered pass was
  skipped
- The pass's time and the reviewer's added tokens are in `results.json`

**Depends on.** [`sweep`](sweep.md).

**Changes in the eval.** A seventh configuration. Its effect is read on measure 4.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
