---
status: todo # todo | doing | done
step: E
depends: [eval-collect, day-zero]
pr:
---

# `eval-rendered`: Open each result in a browser and check layout and accessibility

**Problem.** Code that builds can still put a window half outside the stage or cut a price off.
Blip already has the check for that, but it is tied to Storybook.

**Outcome.** `collect.mjs` builds and serves each result, opens the rubric's URLs wide
(960 × 600) and on a phone (402 × 714), and records layout escapes, cut text and axe
violations. Screenshots are kept in the cache.

**Included.** A root parameter for `escapes()` in `tests/visual/layout.ts` (it reads
`#storybook-root` at `:15`; the default stays, so `stories.spec.ts` is unchanged). `axe-core`
as a root dev dependency (today it is only there through Storybook's addon). The Playwright
script, using the installed Chrome as the game's tests do.

**Not included.** Baselines or comparisons. The rendered pass in the reviewer
(`reviewer-rendered`).

**Acceptance criteria.**

- On the untouched template, `camp` yields the same result on two runs
- A fixture screen with text in a too-small box that hides its overflow yields one "cut" entry
- A screen that fails to render is recorded as such and does not stop the collection
- The "Blip UI Visual Regression" workflow passes on the pull request
- Day zero is collected again from the cache, and its results now hold measure 4

**Depends on.** [`eval-collect`](eval-collect.md), [`day-zero`](day-zero.md) (its runs to collect again).

**Changes in the eval.** The rendered layer: measure 4.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
