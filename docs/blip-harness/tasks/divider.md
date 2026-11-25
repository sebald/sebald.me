---
status: todo # todo | doing | done
step: D+ # common component: accept, change or cut
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `divider`: Separate groups inside a window

**Problem.** Blip has no divider. Inside a `Window`, groups are told apart by spacing only, and an
agent that wants a line draws a border itself (a `className` on a raw `div`, which measure 5
counts against it). Nearly every design system has a divider.

**Outcome.** A horizontal (and vertical) rule drawn in stage pixels in the window's ink, with an
optional label in the middle (`— Items —`), decorative or a real separator. Proposed name
`Divider`; the decision is the user's.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs.

**Base UI.** Built on `@base-ui/react/separator`, which gives `role="separator"` and its orientation.

**Not included.** Section headings (`Text` covers them). Any eval task change.

**Acceptance criteria.**

- One stage pixel thick at every scale (`--bui-px`, never finer than `--bui-min-px`)
- `role="separator"` when it separates content, hidden from screen readers when it only decorates
- Placed by its parent: `Window`, `Ledger` and `Picker` take it between children without new props
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing by role (`foundations/spacing.mdx`), motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md).

**Changes in the eval.** Raw `div`s with a border in `shop`, `saves` and `quests` should become
dividers. Take a new baseline once it ships.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**2026-11-22.** Part of the forms and navigation work (step N1 in the [README](README.md#forms-and-navigation)): the form and options patterns group rows with it.
