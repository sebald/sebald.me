---
status: todo # todo | doing | done
step: D+ # common component: accept, change or cut
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `portrait`: Show who speaks, and who is in the party

**Problem.** Blip has no frame for a face. The catalog lists "Portrait" as a gap (no task needs it
today) and "Party member card" as a pattern that would hold one. Most design systems have an avatar,
and a game's dialogue and party screens lean on faces.

**Outcome.** A framed portrait at pixel scale that takes the game's art as a child, in two or three
sizes, with an optional state (speaking, fallen) shown in a way that does not rely on colour.
Proposed name `Portrait`; the decision is the user's.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs. The candidate rule `P-DIALOGUE-101` ("Name the speaker in words the first time they
speak in a scene"), so a portrait is never the only sign of who speaks.

**Not included.** Art: Blip ships no assets, the game passes its own. The party card pattern (the
`patterns` task). Any eval task change.

**Acceptance criteria.**

- The art is a child, never a prop (`building-components.mdx`: parts are children); the frame
  snaps to the pixel grid at every scale (`--px`)
- A portrait with no name near it has an accessible name, and a decorative one is hidden
- `Line` and `SpeechBubble` can place one beside the text without new props of their own (through
  `data-slot`, as the kit places parts)
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md).

**Changes in the eval.** `fight-hud` shows the party; agents may now reach for a portrait. Take a
new baseline once it ships.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
