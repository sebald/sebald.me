---
status: todo # todo | doing | done
step: H
depends: [cli-lookup, examples-and-patterns, rule-format, eval-run]
pr:
---

# `plan-skill`: Ship the agent plugin with a plan skill, and `blip init`

**Problem.** In the `cli` configuration the agent is told the command exists and nothing else.
Whether it looks anything up before writing is up to it.

**Outcome.** `plugin/` in the tarball with `.claude-plugin/plugin.json` and `skills/plan/`.
`blip init`. The `plan` configuration in `run.mjs`.

**Included.** The skill's text (spec 2.6): search, pattern, components, example, then code.
`blip init`: the plugin in `.claude/settings.json` if a trusted project loads it from
`node_modules`, else the fallback (**Q6**); `blip.config.json`; `.blip/` in `.gitignore`.
`--plugin-dir` in `run.mjs`. `plugin/` in `files`.

**Not included.** Hooks, the reviewer, gap drafts.

**Acceptance criteria.**

- A `plan` run's `init` event lists the plugin and its skill, and nothing else new
- The outcome of the test in **Q6** is written into `open-questions.md`, and `blip init`
  does what that outcome allows
- `blip init` run twice changes nothing the second time and keeps existing settings
- The skill's text names commands and no rule

**Depends on.** [`cli-lookup`](cli-lookup.md), [`examples-and-patterns`](examples-and-patterns.md), [`rule-format`](rule-format.md), [`eval-run`](eval-run.md).

**Changes in the eval.** Configuration `plan`. Metric: share of runs where a `search`, `docs`
or `examples` call comes before the first `.tsx` write, and whether the skill was invoked.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
