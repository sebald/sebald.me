---
status: doing # todo | doing | done
step: S # design system: foundations
depends: []
pr:
---

# `spacing`: One spacing schema, always used, easy to follow

**Problem.** Blip has a scale but no schema. `SPACE` (`foundations/pixel.ts`: 1, 2, 3, 4, 6, 8, 12 in `--bui-px`) says which numbers are allowed, and `foundations/uniformity.test.ts` fails on any other. It does not say which number to use for what. So each component picks its own step:

- 85 hand-written `calc(var(--bui-px)*n)` values across the styles. Gaps alone use 2, 3, 4 and 6.
- Paddings use 2, 4, 6 and 8.
- The cursor's room (3 from what it points at, 6 clear, 12 between controls) lives in `focus.mdx`, and the form rows' `ml-8` indent lives in `parts.styles.ts`. Neither is part of a schema.

An agent building a screen has to read the code and guess, and two windows built the same day can differ by a step. There is no foundations page for spacing either: `introduction.mdx` names `SPACE` in one sentence.

**Outcome.** A small set of named spacing roles that every component, part and pattern uses, and that a person or an agent can pick from without measuring.

- **Each role maps to one `SPACE` step.** For example: inside a control, between a label and its control, between rows, between groups, a window's padding, between focusable controls (the cursor rule), the content indent. The final list and names come out of the work.
- **The roles are tokens**, for example `--bui-space-row` as CSS variables or Tailwind theme values, so a style says what the space is for, not how big it is. A game can retune a role on its stage as it does colours.
- **Every existing style moves onto the roles**, with the screenshots looked at for each intentional change.
- **The uniformity test fails on a raw step** where a role exists, as it does today on a number outside `SPACE`.
- **A `foundations/spacing.mdx` page** has the table (role, step, where it is used, one picture) and a short "which one do I use" rule of thumb. `building-components.mdx`, `AGENTS.md` and the rules sidecars point to it.

**Included.**

- A survey of every spacing value in `src/` by what it separates. Group them, and resolve the near-duplicates: a gap of 2 here and 3 there for the same relation.
- A look at how game UI and design systems name spacing. Material, Carbon and Primer use semantic tokens over a scale. Game UI, per `building-components.mdx`, uses a grid in stage pixels.
- The roles, the tokens, the migration, the test and the page.
- A decision for the em values that sit on the text (`line.styles.ts` `mt-[0.4em]`, `ledger.styles.ts` `mb-[0.3em]`, allowlisted today): a role, or a documented exception.

**Not included.** Text sizes (0.75, 0.85, 1 and 2em are already a closed set). Art in `--px`, which stays on the art's grid. Changing `SPACE` itself, unless the survey shows a step is unused or one is missing.

**Done when.**

- No style in `src/` spells out a spacing step that a role covers, and the test enforces it.
- The spacing page lists every role, with a picture of each.
- The baselines were reviewed and only the intended changes moved.
- A new window built from the docs alone, as an eval or by hand, uses only roles.

**Notes.**

- Research in `research/spacing.md`; the user took its table: two ladders (1-2-4-8 layout, 3-6-12 cursor), Marigold-style relation names for gaps, insets by what holds them, the cursor's own roles. No `Stack`/`Inline`: Blip places children by `data-slot`, so tokens are enough. Window padding stays 4
- `screen` became `edge`: `--spacing-screen` would turn Tailwind's `h-screen`/`w-screen` into 8 stage pixels, site-wide
- The control inset is two roles, `control` (2, block) and `control-x` (4, inline), for a field's 2 × 4
- Buttons take `control-x` (4) at both sizes: the default button's 6 was off the layout ladder. They are 2 stage pixels narrower each side
- In a calc a role is `--theme(--spacing-<role>)`, inlined by Tailwind: `var(--spacing-<role>)` would be computed on `:root` with `--bui-px`'s 3px fallback, not the stage's pixel
- `tailwind-merge` is extended with the roles as spacing, so a caller's `p-4` replaces `p-window`
- The test now covers offsets (`top-`, `right-`, `inset-` …) and the parts' own lengths (`[--b-inline:…]`), not only `p`/`m`/`gap`
- Bar buttons keep 3 between them (`ml-cursor`): their padding is `cursor-clear` each, and the 3 more keeps the cursor more than twice its gap from the button before (`focus.mdx`)
- Meter cells: `related` by default, `joined` compact. Ledger lines stay `related`
