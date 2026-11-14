---
status: todo # todo | doing | done
step: H
depends: [validate]
pr:
---

# `validate-compiler`: Add a compiler pass that turns type errors on Blip into findings

**Problem.** The fast pass sees literal props only. A value built at run time, a wrong
callback, a child of the wrong type are `tsc` errors, long and unreadable for the purpose.

**Outcome.** `blip validate --compiler`: runs the project's own `tsc`, maps its diagnostics on
Blip imports and props to the X rules, and adds the allowed values from the manifest.

**Included.** Running `tsc --noEmit --pretty false` from the project, parsing its lines,
filtering to the files asked for. The mapping to X ids. Other errors passed through without
an id. A clear message when the project has no `typescript`.

**Not included.** TypeScript's API. A watch mode or cache.

**Acceptance criteria.**

- Fixtures: a wrong `variant` from a variable, a missing required `aria-label`, an unknown
  export; each yields its X finding with the allowed values or the closest name
- An error outside Blip is reported once, unchanged
- Without `typescript` installed the command exits 2 and says what is missing
- The time of the pass on the template is in the pull request

**Depends on.** [`validate`](validate.md).

**Changes in the eval.** `collect.mjs` uses `--compiler`. Used by the reviewer.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
