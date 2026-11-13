---
status: todo # todo | doing | done
step: G
depends: [rule-format, manifest-props]
pr:
---

# `validate`: Check a file against the rules and report findings an agent can act on

**Problem.** A rule that is only prose is followed when the agent happens to read it. Nothing
tells it what it got wrong, where, and what right looks like.

**Outcome.** `blip validate` (spec 2.4, 2.5), without the compiler pass.

**Included.** `oxc-parser`, pinned (**Q1**); checks written against its ESTree AST. A check for every `check` the sidecars name: structure,
correctness from the manifest, foundations. The spacing, text, opacity and layer predicates
move from `uniformity.test.ts` into `src/foundations/`, shared by the test and the CLI. The
finding format, text and JSON. `--changed-since` with element spans (**Q8**). Fingerprints.
`blip.config.json` with `rules.off`. Events `validate`, `finding`, `rules-off`,
`parse-failed`. The build now fails on an unknown or unused check. `collect.mjs` runs it on
every result with its own copy of the CLI.

**Not included.** `--compiler`. Hooks. Rendered checks.

**Acceptance criteria.**

- Per check, two fixture files: one with the fault and the expected finding, one clean
- A fixture repository: a fault inside an element with a changed line is reported, the same
  fault in an untouched element of that file is not
- A rule in `rules.off` yields no finding and one `rules-off` event
- A file with a syntax error yields no finding and exit 0
- `uniformity.test.ts` passes on the shared predicates
- Run over `packages/pushback/src/ui` as a reading exercise: the pull request lists every
  finding and says for each whether it is a real fault, a wrong rule or a wrong check
- A 200-line file is checked in under 300 ms
- Day zero is collected again from the cache with `validate`, and its results now hold
  measure 2; the collector's calls leave the runs' event logs unchanged (`BLIP_EVENTS=off`)

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md). Better after both extraction tasks; checks
for rules extracted later are added with them.

**Changes in the eval.** Measure 2 for every configuration, `no-cli` included: `validate`
errors and warnings by rule, invented exports and props, colours, lengths and motion; the
split of raw tags and classes (**Q11**).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
