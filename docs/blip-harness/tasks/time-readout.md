---
status: todo # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr:
---

# `time-readout`: Play time and a save's date, written the way a player reads them

**Problem.** Day zero: all 6 `saves` runs wrote two formatters, seconds to `3:25` and an ISO string to
"2 Nov, 10:00" (`no-cli/saves-2/saves.tsx:21-38`, `cli/saves-1/saves.tsx:23-37`,
`cli/saves-3/saves.tsx:26-39`). The catalog counted one task for "time and date readout"; every run of
that task needed it. The rubric's `readable-times` statement is exactly this.

**Outcome.** A component (or, if the behaviour is only formatting, a hook next to `useAnnounce`)
that takes seconds or an ISO date and writes it in one agreed form, in the user's locale for the
date. Proposed names `PlayTime` and `SavedAt`; the user decides between two components, one with a
`kind`, and a hook.

**Included.** The form (`h:mm:ss` from an hour, `m:ss` below), date with a short month and the time,
the invalid-date case (shows the text it was given, as `no-cli/saves-2/saves.tsx:30` does), tests,
a page with the guidelines.

**Base UI.** No Base UI primitive formats time; plain markup with a `<time dateTime>` element.

**Not included.** A clock that ticks (that is `Timer`). Any harness piece.

**Acceptance criteria.**

- `3:25` for 205 seconds, `1:02:03` for 3723, the date in `en` and `de` in a test; a bad ISO string
  does not throw
- The `saves` screens day zero's agents wrote lose both helpers (checked by rewriting one by hand)
- Follows `building-components.mdx`; `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass;
  `pnpm vrt:blip-ui` in Docker if a story changes (asked first)
- A fresh-context review in the pull request

**Depends on.** [`day-zero`](day-zero.md).

**Changes in the eval.** Measure 5 (own helpers); the `readable-times` rubric statement should pass
without the agent doing anything for it.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
