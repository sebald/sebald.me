# Spacing: a scale, roles and names

Research for the `spacing` task (`tasks/spacing.md`). Three passes, 2026-11-25: design systems, game UI, and an inventory of every spacing value in Blip UI. Only what could be read is cited; Polaris and Material 3 would not load and are left out.

## What Blip has today

**The scale.**

- `SPACE` is 1, 2, 3, 4, 6, 8, 12 in `--bui-px`. All seven steps are in use; 12 only once (`Actions`).
- `foundations/uniformity.test.ts` fails on a step outside it. It checks only `p`, `m` and `gap` in `components/`, not offsets (`right-`, `inset-`), the part variables (`--b-*`, `--t-*`, `--s-*`), inline styles or the patterns' examples.

**About 93 spacing values, and the same relation often gets different steps:**

| Relation                        | Steps in use         | Where it splits                                             |
| ------------------------------- | -------------------- | ----------------------------------------------------------- |
| Inside a control                | 1, 2, 4, 6           | Button x 6 (small 4), TextField 4 × 2, Picker row 2 × 1     |
| Window padding                  | 4                    | the speech bubble's top is 3                                |
| Title to content                | 2, 3, 4              | window 3, title to blurb 2, Screen 4                        |
| Rows of a list                  | 1, 2, 4              | Picker 1, Ledger 2, Form and Content 4                      |
| Items in a row                  | 1, 2, 3, 4           | meter 2 (compact 1), Line 3, Tabs arrow 3, Picker setting 4 |
| Label to control                | 2, 3                 | stacked field label 2, Switch and Readout beside 3          |
| Control to description or error | 2                    | —                                                           |
| Group to group                  | 4                    | —                                                           |
| Screen edge                     | 6, 8                 | Screen 6, centred Screen and Stage 8, Dialog 6              |
| Cursor                          | 3 / 6 / 12, indent 8 | Button's 2 is measured from its ink (3 to the face)         |

**The cursor rule** (`foundations/focus.mdx`, C-FOCUS-2):

- the cursor is 3 from what it points at
- nothing else is closer than 6
- buttons are 12 apart, and the first one is indented 8

It's the one place where a step has a meaning, and only the visual test (`cursorRoom`) checks it.

**Off the scale, allowlisted:**

- two em values that sit on the text: Line `mt-[0.4em]` and Ledger `mb-[0.3em]`
- three Tailwind values on touch-only chrome: `gap-2`, `p-6` and `px-2`

## How design systems do it

| System                                                                                                                                                                                                                                                                                     | Scale                           | Names                                                                                              | Intent layer                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Marigold](https://marigold-ui.io/foundations/spacing)                                                                                                                                                                                                                                     | 4px grid, "strictly a fallback" | relation: `tight, related, regular, group, section`; inset: `tight, snug, regular, relaxed, loose` | Yes, two axes: the gap between siblings by how related they are, a component's padding by its density. Cut from 7 to 5 relation tokens in 17.2 (dropped the 1px `joined` and the largest one) |
| [Primer](https://primer.style/product/primitives/size/)                                                                                                                                                                                                                                    | 2, 4, 8, 16, 24 …               | `stack-gap-condensed/normal/spacious`, `control-*-paddingInline-*`                                 | Yes: a role times one of three densities. Mechanical, but many tokens                                                                                                                         |
| [EightShapes](https://nathanacurtis.substack.com/p/space-in-design-systems-188bcbae0d62)                                                                                                                                                                                                   | geometric, double or halve      | t-shirt                                                                                            | inset, squish, stretch, stack, inline: which side the space is on                                                                                                                             |
| [Braid](https://seek-oss.github.io/braid-design-system/foundations/layout)                                                                                                                                                                                                                 | 9 t-shirt sizes                 | t-shirt, plus `gutter`                                                                             | Components own no outer space; layout components do                                                                                                                                           |
| [Spectrum 2](https://spectrum.adobe.com/page/spacing/)                                                                                                                                                                                                                                     | two scales                      | —                                                                                                  | the space inside a component and between them, kept apart                                                                                                                                     |
| [Carbon](https://carbondesignsystem.com/elements/spacing/overview/), [Atlassian](https://atlassian.design/foundations/spacing), [Radix](https://www.radix-ui.com/themes/docs/theme/spacing), [Tailwind](https://tailwindcss.com/docs/theme), [Open Props](https://open-props.style/#sizes) | 9 to 15 steps                   | numbers                                                                                            | none: the name says how big, not what for                                                                                                                                                     |

What they agree on:

- **Steps grow roughly geometrically.** Curtis's case against a linear scale: "When do I use 24 or 28? I dunno."
- **Two layers.** A raw scale underneath, and named roles on top that components use. Marigold and Primer work this way.
- **The space inside a component is a different thing from the space between components.** Spectrum and Marigold give each its own vocabulary; Braid makes it a rule.
- **About five names per axis.** Marigold cut down to five because the extremes went unused.
- **Nobody enforces it.** None documents a lint or a test. Blip's uniformity test is already ahead.

## How game UI does it

From [Godot's default theme](https://raw.githubusercontent.com/godotengine/godot/master/scene/theme/default_theme.cpp), the [RPG Maker MZ window system](https://deepwiki.com/tonbijp/RPGMakerMZ/2.1-window-system) and the Xbox guidelines:

- **A fixed row height, not a gap.** RPG Maker and Godot's lists fix a row, with the text centred in it. Items inside a list sit 0 to 2 apart (Godot: `line_separation` 2).
- **Window padding is about two to three base units.** Godot uses 4 to 8 on a base of 4, RPG Maker 12, SNES RPGs about one 8px tile. Blip's 4 is at the tight end.
- **Godot's ladder is 2, 4, 8, 12.** It uses 4 for nearly every gap and leaves groups to nested containers.
- **The cursor gets a column left of the label, not a margin.** Blip's 8 indent is that column.
- **The margin from the screen edge is its own role** (TV safe areas), not the window padding.
- **The Xbox guidelines give no spacing or target-size numbers.** XAG 112 is about order and wrapping.
- **Not verified.** SNES and GBA menus (8px tiles, 16px rows, the cursor one tile left) come from memory. No numbers were found for Unity or Unreal.

## Options for naming

1. **Relation words** (Marigold). The name claims how related two things are, which the markup can confirm. It needs a second vocabulary for padding.
2. **A role times a density** (Primer). The most mechanical, but it multiplies tokens. Overkill for seven steps.
3. **Sides** (EightShapes). An agent has to pick the side, which is where it goes wrong, unless layout components pick it.
4. **Numbers only** (Tailwind, Carbon, Radix). This is what Blip has now, and the problem the task is about.

## Recommendation

**Split the seven steps into two ladders, each doubling.** This is the main idea.

- **1, 2, 4, 8 is the layout ladder**: every gap and padding. Each step is twice the last, so neighbouring choices are clearly different (Curtis), and it is Godot's ladder.
- **3, 6, 12 is the cursor's** and nothing else's: 3 to what it points at, 6 clear, 12 between focusable neighbours. A 3 or a 6 anywhere else is a mistake the test can name.

**Name by intent, two axes as in Marigold, plus the cursor:**

| Token (Tailwind)                        | Step          | For                                                                                                                  |
| --------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Gap: how related two neighbours are** |               |                                                                                                                      |
| `joined`                                | 1             | Repeats of one thing: rows of a list, cells of a meter                                                               |
| `related`                               | 2             | A thing and its own parts: label and control, control and description or error, title and blurb, a mark and its text |
| `regular`                               | 4             | Separate items of one group: fields of a form, menu groups, content and the buttons under it, a name and its value   |
| `section`                               | 8             | Regions: the stage's parts, windows side by side                                                                     |
| **Inset: padding inside**               |               |                                                                                                                      |
| `control`                               | 2 × 4 (y × x) | Inside a control: a field, a Picker row, a tab                                                                       |
| `window`                                | 4             | Inside a window or a bubble                                                                                          |
| `screen`                                | 8             | From the stage's or a screen's edge, and the dialog's scrim                                                          |
| **Cursor: only for focus**              |               |                                                                                                                      |
| `cursor`                                | 3             | The cursor to what it points at                                                                                      |
| `cursor-clear`                          | 6             | Nothing else nearer on its side                                                                                      |
| `cursor-apart`                          | 12            | Between focusable neighbours (`Actions`)                                                                             |
| `cursor-column`                         | 8             | The column left of a row or the first button, which the cursor sits in                                               |

**Written as Tailwind theme values.** For example, `--spacing-related: calc(var(--bui-px) * 2)` under `@theme inline` gives classes like these:

- `gap-related`, `mt-related`
- `p-window`, `px-control`
- `ml-cursor-column`, `gap-x-cursor-apart`

The class says what the space is for. A game can retune a role on its stage.

**How it's enforced:**

- Inside components, the test allows only role names, no `calc(var(--bui-px)*n)`.
- The check also covers offsets and the part variables, and the patterns' examples.
- The em pair stays a documented exception: they sit on the text, not in the layout.

**What it changes, to be looked at in the screenshots:**

| Now                                     | Becomes                                    | Why                                               |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| title to content 3 (window), 4 (Screen) | `related` 2 or `regular` 4                 | a title belongs to its content; one step for both |
| Ledger rows 2                           | `joined` 1 or kept as `related`            | the same relation as Picker rows                  |
| Switch and Readout label beside 3       | `regular` 4, as the Picker's name to value | a name and its value, beside                      |
| Line mark and Tabs arrow 3              | `related` 2                                | a mark and its own text                           |
| field description to count 3            | `regular` 4                                | two items in a row                                |
| speech bubble top 3                     | `window` 4                                 | one window padding                                |
| Screen and Dialog edge 6                | `screen` 8                                 | one screen edge                                   |
| Button inline padding 6 (small 4)       | decision below                             | a control's inset                                 |

## Decisions for the user

1. **Two ladders (1-2-4-8 and 3-6-12).** Or one scale with every step open to every role.
2. **The names.** Marigold's relation words (`joined, related, regular, section`), or plainer roles (`row, part, item, region`).
3. **Window padding.** Stay at 4, or move to 8 as game UIs do (Godot 4 to 8, RPG Maker 12). 8 is roomier; on the 402px phone it costs 8 stage pixels of width.
4. **Button padding.** 6 is off the layout ladder. Options: 8, which widens buttons; 4, which narrows them; or allow it as the control inset's one exception.
5. **Layout components.** Add `Stack`/`Inline` that take a role (`space="related"`), or keep spacing inside each component and part, as now. Braid's rule (components own no outer space) is already how Blip places children by `data-slot`, so tokens alone may be enough.
