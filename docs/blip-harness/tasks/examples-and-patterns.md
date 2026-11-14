---
status: todo # todo | doing | done
step: F
depends: [cli-lookup]
pr:
---

# `examples-and-patterns`: Move examples into files that stories and the CLI both read

**Problem.** The only complete examples of Blip in use are stories, which the tarball does not
ship, and the two full screens (`compositions/together.stories.tsx`) have no page at all. The
plan step needs a pattern and an example to look up.

**Outcome.** Example files under `components/<name>/examples/`, imported by the stories and
copied to `docs/examples/`. Two pattern pages, `patterns/menu-screen.mdx` and
`patterns/duel.mdx`, from the existing compositions. `blip examples`.

**Included.** At least one example per component page, taken from its composition stories
(`Default` and `Overview` stay stories). `<Canvas>` of an example story becomes its source in
the markdown page. Imports rewritten to `@sebald/blip-ui` on the way into `docs/`. Pattern
pages with when to use, the parts, and the example. `examples[]` in the manifest and in
`search`.

**Not included.** New patterns (`patterns`). Rules for the pattern pages beyond what the
compositions already show.

**Acceptance criteria.**

- Every file in `docs/examples/` type-checks against `dist/` as consumer code
- No example imports from a story, and no story duplicates an example's JSX
- Story ids are unchanged and the "Blip UI Visual Regression" workflow passes without new
  baselines
- `blip examples dialog` lists, `blip examples dialog/options` prints the source
- `blip search menu` returns the pattern page first

**Depends on.** [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** What the plan step can find. Metric: which examples were opened.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
