---
status: todo # todo | doing | done
step: G
depends: [rule-format]
pr:
---

# `rule-extraction-display`: Extract the consumer rules of the display pages and the foundations

**Problem.** As `rule-extraction-menus`, for the other half, plus the principles in
`introduction.mdx`, which are rules a consumer's own classes have to follow too.

**Outcome.** Sidecars for `text`, `bitmap-text`, `line`, `typewriter`, `speech-bubble`,
`ledger`, `meter`, `timer`, `stamp`, `pixel-icon`, `stage`, `introduction` and `hooks`, and
`correctness.blip-rules.yaml` for the X rules.

**Included.** As `rule-extraction-menus`. The foundation rules (colours through `--bui-*`,
lengths in stage pixels, the spacing and text scales, motion, layers) as kind `F` (**Q9**):
`F-COLOUR-1`, `F-LENGTH-1`, `F-MOTION-1`, ….

**Not included.** As `rule-extraction-menus`.

**Acceptance criteria.** As `rule-extraction-menus`, and:

- Each foundation rule names the predicate that will check it
- The X rules cover: an import that is not an export, a prop a component does not have, a
  value outside a prop's values

**Depends on.** [`rule-format`](rule-format.md).

**Changes in the eval.** As `rule-extraction-menus`.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
