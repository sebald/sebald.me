---
status: todo # todo | doing | done
step: I
depends: [validate, plan-skill]
pr:
---

# `edit-hook`: Check every edit of a `.tsx` file and send back findings on the changed lines

**Problem.** Faults are cheapest to fix right after they are written. Without a check per
edit they pile up until the end, or stay.

**Outcome.** `blip hook post-edit` and the `PostToolUse` entry in `plugin/hooks/hooks.json`.
The `hook` configuration.

**Included.** Reading the hook's JSON, running the fast pass on the file, the changed-lines
filter, attempts per fingerprint from the event log, the reply (at most 5 findings, under the
10,000 character limit), a finding dropped from replies after two attempts, events `hook`
(with milliseconds) and `fixed`. Silence for files that are not `.tsx` or are in
`node_modules`. A timeout on the hook entry.

**Not included.** The compiler pass. Blocking an edit. The Stop hook.

**Acceptance criteria.**

- With a recorded hook input on stdin, the reply is valid JSON with the expected findings
- In the messy screen, an edit of one line reports nothing about untouched lines
- The same finding is sent twice at most
- On the template, the hook's time is under 2 s at the 95th percentile over a run
- A hook that crashes exits 0 with no output and logs the error
- A `hook` run's stream shows the hook event for every Write and Edit of a `.tsx` file

**Depends on.** [`validate`](validate.md), [`plan-skill`](plan-skill.md) (the plugin folder).

**Changes in the eval.** Configuration `hook`. Metrics: edits the hook ran on, its time,
findings sent, findings fixed in the turn, attempts per finding.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
