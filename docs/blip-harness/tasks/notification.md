---
status: todo # todo | doing | done
step: after L # common component held back: gap drafts fire on this gap first
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `notification`: Say what just happened, and let it go

**Problem.** Blip has no notification. The catalog's "Notification / Result of a transaction" gap
is the only feedback gap two tasks share (`shop`, `camp-rest`). Day zero: the shop's result was
only announced to a screen reader. Every design system has a toast.

**Held back on purpose.** `tasks/README.md` keeps this gap open so gap drafts (step K) and the
sweep (step L) have it to fire on. Start this task after the sweep; until then it is a plan.

**Outcome.** A message that appears for news that needs no answer ("Bought a Rope", "Saved"),
stays until the player moves on, sits away from the cursor, and is announced. Proposed name
`Notification`; the decision is the user's.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs. The candidate rules `P-FEEDBACK-103` ("Keep a notification until the player moves
on") and `P-FEEDBACK-104` ("Keep a notification off the current row and the cursor").

**Base UI.** Built on `@base-ui/react/toast` (`Toast.Provider`, `Toast.Viewport`, `Toast.Root`, `useToastManager`), which handles the live region, the stack and the timing; Blip turns the timer off by default (`P-FEEDBACK-103`).

**Not included.** A queue manager beyond showing the latest. Errors that need an answer (`Confirm`).
Any eval task change.

**Acceptance criteria.**

- Announced through `useAnnounce`, polite, once; no timer the player can't stop
- Never over the focused row or the cursor, on the wide and the tall stage
- Its arrival follows the motion foundations (a UI element: a transition, at most 300 ms; none with
  reduced motion)
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md), and the sweep ([`sweep`](sweep.md)).

**Changes in the eval.** `shop` and `camp-rest` should show their result on screen as well as
announcing it. Take a new baseline once it ships.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
