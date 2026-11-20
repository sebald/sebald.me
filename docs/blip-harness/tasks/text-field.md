---
status: doing # todo | doing | done
step: D+ # common component: accept, change or cut
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `text-field`: Let the player type a name

**Problem.** Blip has no way to enter text. A game asks for one now and then: naming the hero, a
save, a pet. The catalog lists "Text entry" as a gap (`saves`, only if an agent asks for a name),
and almost every design system has a text input, so an agent working in a real codebase expects one.

**Outcome.** A one-line text field at pixel scale: a label, the text in the stage's font, a caret,
an optional limit shown as characters left. It works with a keyboard and with the phone's own
keyboard on the tall stage. Proposed name `TextField`; the decision is the user's.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs. A rule from the candidates: `P-SAVES-107` ("Don't ask for a name to save").

**Base UI.** Built on `@base-ui/react/field` (`Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`) and `@base-ui/react/input`, as `Dialog` and `Tabs` are on theirs; Blip adds the look, the caret and the key layer.

**Not included.** An on-screen letter grid (the console way of typing). Multi-line text. Validation
beyond a length limit. Any eval task change.

**Acceptance criteria.**

- A native `<input>` underneath, with its label tied to it; Enter submits, Escape gives the keys
  back to the screen without leaving it (the key layer must not swallow typing: `focusTakes` in
  `key-layer.ts`)
- On the tall stage the phone's keyboard opens and the field stays in view
- The length limit is announced when reached, not only drawn
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md): a new component ships with its rules, props
table and example.

**Changes in the eval.** None of the six tasks needs it. It adds a page agents must choose past, and
`saves` runs that ask for a name now have a part to use. Day zero is not comparable once it ships:
take a new baseline on the new tarball.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Built.** `TextField` (`text-field/`): children are the label; `value`/`defaultValue`/`onValueChange`, `onSubmit(value)`,
`maxLength`, `description`, `error` (its presence marks it invalid); the rest goes to the input. Base UI `Field.Root`,
`Field.Label`, `Input`, `Field.Description`, `Field.Error`. No `variant` or `size`. Enter submits and keeps focus, Escape
blurs (and does not reach a Dialog), the limit is announced through `useAnnounce`. Rules `C-TEXT-FIELD-1..4` and
`P-TEXT-FIELD-1` (`[open]`, the candidate `P-SAVES-107`, renamed because a sidecar's ids carry its page).
`sidecar.test.ts`'s fixed page list got `picker`, `setting`, `text-field`.
