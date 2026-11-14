---
status: todo # todo | doing | done
step: F
depends: [cli-lookup]
pr:
---

# `rule-format`: Give rules a sidecar format, generate `rules.json`, render them on a page

**Problem.** Blip's consumer rules are "Do" and "Don't" bullets in prose (21 Usage sections).
They have no ids, so nothing can point at one, check one, or turn one off.

**Outcome.** The sidecar format of spec 2.2, the pack step that writes `docs/rules.json`, the
two MDX blocks, `blip rules`, `blip docs <rule-id>`, and the Dialog page converted as the
example.

**Included.** The loader and its five failures (spec 2.2). `.storybook/blocks/` with
`<Rules for>` and `<Rule id>`. `yaml` as a dev dependency. `dialog.blip-rules.yaml`, with
`dialog.mdx` rewritten so the prose explains and the block states. `rules[]` per page in the
manifest; rules in `search`.

**Not included.** The other pages. Any check: a rule may name a `check` that does not exist
yet, and the build only warns until `validate` lands.

**Acceptance criteria.**

- A unit test per build failure: duplicate id, id against kind or page, no check and no
  marker, and (as warnings for now) unknown check, unused check
- The Dialog page in Storybook shows its rules through the block, and no sentence in the page
  restates one
- `blip rules dialog` lists them; `blip docs C-DIALOG-1` prints the rule, the page's
  reasoning and the fix
- An `[open]` rule is in `rules.json` and absent from `blip rules`
- I have reviewed the Dialog sidecar

**Depends on.** [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** None yet. Rule ids are what `validate` metrics are grouped by.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
