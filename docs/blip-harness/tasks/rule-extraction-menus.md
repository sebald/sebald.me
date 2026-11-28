---
status: todo # todo | doing | done
step: G
depends: [rule-format]
pr:
---

# `rule-extraction-menus`: Extract the consumer rules of the menu and container pages

**Problem.** After `rule-format` only Dialog has rules. The others still mix rules, reasons and
descriptions of how the component is built.

**Outcome.** Sidecars for `button`, `icon-button`, `controls`, `picker`, `setting`, `confirm`,
`tabs`, `window` and `parts`, and their pages rewritten around the blocks.

**Included.** Rules from the Usage, Input and Accessibility sections. Each rule atomic, with a
`check` name or a marker, and a `fix` where it names a check. "When not to use" notes from
the pages' opening paragraphs (`button.mdx:9-11`: lists of choices are a Picker). One commit
per page, so I can review page by page.

**Not included.** Statements about how Blip builds the component ("a native `<button>`"): they
stay prose. New rules from the research. Implementing checks.

**Acceptance criteria.**

- Every "Do" and "Don't" bullet of the nine pages is a rule with an id or stays as prose with
  its reason, and the pull request lists which
- No rule holds two requirements joined by "and"
- No page restates a rule outside its block
- I have reviewed each page

**Depends on.** [`rule-format`](rule-format.md).

**Changes in the eval.** None until `validate`; then these ids appear in the metrics.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
