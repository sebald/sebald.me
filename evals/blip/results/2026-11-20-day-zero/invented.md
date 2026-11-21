## What the agents invented (read by hand)

Written after reading the five screens' code in all 30 runs that build one (`shop`, `saves`,
`fight-hud`, `quests`, `pause`, three repetitions in each configuration), and the diffs of the six
`camp-rest` runs. Paths are `<config>/<task>-<rep>/src/screens/<file>.tsx:<line>` in
`~/.cache/blip-eval/day-zero/`. All 36 runs built clean, so nothing below is a failed run:
there are no failed runs to read, and the rubric's statements are not judged yet (`eval-judge`).
The one-line reading: **agents compose Blip well where Blip has a part, and hand-build the same
few things where it does not.**

**Which Blip.** The tarball is Blip as of commit `57344be` (`#198`, `cli-lookup`: steps A and B
only, no `manifest-props`, `rule-format` or examples), sha256 `925ec59d8f14`, with `run.mjs` and
`collect.mjs` from `blip-harness`. 27 runs on `blip-harness` HEAD (Blip with step F) exist in the
cache as `day-zero-with-f`; they are not collected here.

### 1. Raw elements

- **A full-screen layout block, written by hand in 21 of the 24 screens that need one.** The same
  object each time: `position: absolute; inset: 0; display: flex; flex-direction: column; gap;
  padding; padding-bottom: calc(... + var(--bui-bar))`, as inline `style` in 17 runs
  (`cli/shop-1/shop.tsx:31-40`, `cli/fight-hud-2/fight.tsx:42-52`, `no-cli/shop-2/shop.tsx:69-79`)
  and as Tailwind classes in 4 (`no-cli/saves-2/saves.tsx:98`, `no-cli/quests-2/quests.tsx:62-65`).
  Three screens clear a fixed `ScreenTitle` with a guessed top padding of 22 to 24 stage pixels
  (`cli/shop-3/shop.tsx:49`, `cli/quests-3/quests.tsx:60`, `no-cli/saves-2/saves.tsx:98`). The three that did
  not hand-build it are `cli/saves-1`, `-2` (they wrap in `Stage.Center`) and `-3` (no frame at all)
  (`cli/saves-1/saves.tsx:119`). This is Q11's "first gap agents hit".
- **Raw lists for the fight HUD.** `ul`/`li` with inline row styles in 3 of the 6 `fight-hud` runs
  (`no-cli/fight-hud-2/fight.tsx:52,57,78,86`, `no-cli/fight-hud-3/fight.tsx:46,51,73,78`,
  `cli/fight-hud-3/fight.tsx:67,72,91,99`); two others used `Ledger` (`no-cli/fight-hud-1/fight.tsx:50`, `cli/fight-hud-1`) and one plain `div` rows (`cli/fight-hud-2/fight.tsx:57-69`). No raw `button`,
  heading or `table` anywhere: the other tasks never reached for a raw control.
- **A bare `<p>` once** for the empty pack (`no-cli/shop-2/shop.tsx:46`); the other 11 empty
  states use `Text` or a `Heading` in a `Window`.
- **A stack of `span`s for a two-line list item** in every `quests` run: name, "From <giver>" and
  "Next: <step>" as nested `span`s with their own `fontSize: '0.75em'` or `opacity`
  (`cli/quests-1/quests.tsx:55-63`, `no-cli/quests-2/quests.tsx:24-28`). `PickerItem` takes text
  and a `note`, so agents build the second line themselves.
- **`span`s for HP and MP:** `HP {m.hp}/{m.maxHp}` as a bare `span` in all 6 `fight-hud` runs
  (`no-cli/fight-hud-1/fight.tsx:109-114`, `cli/fight-hud-2/fight.tsx:115-120`).
- **Colour and opacity set by hand:** `text-(--bui-primary)`, `text-(--bui-danger-light)`
  (`no-cli/fight-hud-3/fight.tsx:83,87`), `opacity: down ? 0.6 : 1` for a fallen member
  (`cli/fight-hud-2/fight.tsx:107`). Every one is a token, none is a literal colour.

The collector's counts agree in direction but are inflated by the template: the untouched
`camp.tsx` and `app.tsx` already hold 9 `div`, 3 `span`, 2 `p` and 10 inline `style`s, so
"raw wrappers" of 15 to 16 in `scope: all` tasks is mostly that floor (`cli/saves-1` adds none).

### 2. Components of their own

- **Formatters for time:** all 6 `saves` runs wrote a playtime formatter (seconds to `3:25`) and a
  saved-at formatter (ISO to "2 Nov, 10:00") (`no-cli/saves-2/saves.tsx:21-38`,
  `cli/saves-1/saves.tsx:23-37`, `cli/saves-3/saves.tsx:26-39`).
- **A slot summary:** `Slot` (`no-cli/saves-2/saves.tsx:45`) and `Label` (`cli/saves-1/saves.tsx:45`)
  as local components; the other four inline the same text in a `describe()` string.
- **A quest row:** `Row` in two `quests` runs (`no-cli/quests-2/quests.tsx:23`,
  `no-cli/quests-3/quests.tsx:22`); `Buy` and `Sell` panels in `no-cli/shop-2/shop.tsx:19,44`.
- **Enemy condition:** a local function from HP to a word and a count of lit cells, in all 6
  `fight-hud` runs (`no-cli/fight-hud-1/fight.tsx:9-16`, `cli/fight-hud-2/fight.tsx:7-14`). It
  feeds `Meter`, used correctly as cells.
- **Turn, fallen and status as text, in all 6 `fight-hud` runs:** a `▶ ` or `> ` prefix plus
  `aria-current` for whose turn it is (`no-cli/fight-hud-3/fight.tsx:80,84`,
  `cli/fight-hud-1/fight.tsx:82`), the word "Fallen" pushed into a list with the statuses
  (`no-cli/fight-hud-1/fight.tsx:88`, `cli/fight-hud-3/fight.tsx:95`), statuses joined with commas
  (`no-cli/fight-hud-1/fight.tsx:108`). No icon, no card.
- **The done mark:** `(done)`, `· Done` or a "Done" label as text in all 6 `quests` runs
  (`cli/quests-1/quests.tsx:76`, `no-cli/quests-1/quests.tsx:38`, `no-cli/quests-3/quests.tsx:27`,
  `no-cli/quests-2/quests.tsx:79`, `cli/quests-3/quests.tsx:73`).
- **The price:** inside the item's text, `Tonic · 25g · too dear`, in all 6 `shop` runs
  (`no-cli/shop-2/shop.tsx:37`, `cli/shop-3/shop.tsx:81`), with the shortfall in the `note`
  (`cli/shop-3/shop.tsx:76`). There is no price slot to put it in.
- **The `PauseMenu`** (`no-cli/pause-3/pause-menu.tsx:26`) and `PausedCamp` are local components in
  most pause runs, but they are the screen itself, not a missing part.

### 3. Blip components used for the wrong thing

- **`Heading` for a value or a name:** the gold is a `Heading` in `no-cli/shop-3/shop.tsx:48`;
  enemy and member names are `Heading`s in `cli/fight-hud-2/fight.tsx:70,109`.
- **`Ledger` for a single value:** the gold as a one-row `Ledger` in a `Window` in 3 of 6 `shop`
  runs (`no-cli/shop-2/shop.tsx:81-83`, `cli/shop-3/shop.tsx:55-57`, `no-cli/shop-1/shop.tsx:69`);
  an enemy's condition as a `LedgerRow` holding a word and a `Meter` (`no-cli/fight-hud-1/fight.tsx:56-72`).
  Not wrong, but rows for one number are more than `ledger.md` describes ("a few numbers the player reads across").
- **`useAnnounce` as the only confirmation of a buy or sell** in `cli/shop-1`, `cli/shop-3`,
  `no-cli/shop-1` (`cli/shop-3/shop.tsx:33,36`): it is a screen-reader live region (`hooks.md:29`),
  so the player sees nothing change but the gold.
- **`PickerSetting` for a Save/Load switch** (`no-cli/saves-2/saves.tsx:104-111`) next to `Tabs` for
  the same job in 5 other runs (`cli/saves-1/saves.tsx:120`). Both work; they disagree.

Nothing was invented for **pause**: all six runs compose `Dialog`, `Picker`, `PickerSetting`,
`Confirm`, `Controls` and `IconButton` the same way (`no-cli/pause-3/pause-menu.tsx:44-105`), guard the
camp's window listener with `if (paused) return` (`cli/pause-1/camp.tsx:31`), and add no raw tag. This
is what a pattern page would record, not a gap. `camp-rest` touched no Blip at all in 6 of 6 runs: the
agents matched the messy screen it was given, as the ticket's scope (`changed-lines`) invites
(`no-cli/camp-rest-1` diff of `camp.tsx`).

### Against the catalog's gap ranking

| Gap (tasks)                                                        | Day zero                                                          | Reading                                                                                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Screen layout (5)                                                  | 21 of 24 hand-built; 17 inline, 4 classes                         | **Agrees**, first. The two tasks that do not build a screen (`pause`, `camp-rest`) add none, so 4 of 5 touching tasks show it |
| Single number readout (3)                                          | gold: `Ledger` 3, `Heading` 1, `Text` 2; HP/MP: `span`s in 6 of 6 | **Agrees**; `camp-rest` shows none (the camp already shows gold)                                                              |
| Empty list (2)                                                     | 11 of 12 with `Text`/`Heading` in a `Window`, one `<p>`           | **Agrees** that it is a pattern: nobody built a component                                                                     |
| Notification / Result of a transaction (2)                         | `useAnnounce` only (3), the camp's own line (6 `camp-rest`)       | **Agrees**, weakly: agents use what exists, and the shop's result is invisible                                                |
| Bar, Enemy condition (1)                                           | all 6 used `Meter` for it, with a local word and cell function    | **Disagrees** with `meter.mdx:11` as a barrier: `Meter` in 4 cells fit; the gap is the mapping, not the bar                   |
| Party member card, Fallen member, Turn indicator, Status icons (1) | text prefix, text tag, no icon, 6 of 6                            | **Agrees** they are patterns or text; "Fallen" and the turn mark were invented the same way each time                         |
| Save slot summary, Time and date readout (1)                       | 6 of 6 wrote two formatters                                       | **Higher than ranked**: one task, but every run                                                                               |
| Price slot (1: "only if an agent reaches for them")                | 6 of 6 put the price in the item's text                           | **Higher than ranked**: they all reached                                                                                      |
| Objective reminder (1: leave open)                                 | "Next: <step>" as nested `span`s, 6 of 6                          | Reached for, but through the second-line problem below                                                                        |
| Pause menu as a pattern (1)                                        | 6 of 6 identical, correct                                         | Agrees; no gap                                                                                                                |
| Text entry, Grid of choices, Floating numbers, Saving indicator    | not reached                                                       | Agrees                                                                                                                        |

Not in the catalog's ranking, found here: a **list item with a second line** (quests' name, giver
and next step; saves' place and details; the shop's price and shortfall). `PickerItem` has `note`
(shown on focus) and text children, so all 6 `quests` runs and all 6 `saves` runs hand-build that body
with `span`s, a local component or a joined string. It would cover the price slot, the slot summary and the done mark.

### Where the configurations differ in what they invent

- Raw `className`s with Tailwind classes appear in 6 of 18 `no-cli` runs and 0 of 18 `cli`; the `cli`
  agents wrote the same layout as `style` with `calc(var(--px) * n)`. The collector's candidate check
  (Q11, groups of restyling classes in at least 3 runs across 2 tasks) therefore lists **none**,
  while the layout block recurs 21 times. It counts `className` and not `style`: a counting gap, not
  a clean result.
- `cli` runs never read `docs/` (median 0) and made 134 `blip` calls over 18 runs (101 `docs`, 21
  `help`, 12 `search`); `no-cli` read it a median of 2 times. The same components and gaps appear in both.
- One `no-cli` run reached out: `no-cli/pause-2` ran `npx` (`npx prettier --write src/screens`, flagged by the collector as a package fetch).

## Spread between repetitions

The range (highest minus lowest) of the three repetitions of one task and configuration, taken over
the five tasks that build a screen (`camp-rest` left out: it is 4 to 6 turns and $0.05 to $0.08).
Medians over tasks, with the worst task in brackets. This is the spread a later piece has to beat.

| Measure                     | `no-cli`                               | `cli`                   |
| --------------------------- | -------------------------------------- | ----------------------- |
| dollars (estimate)          | $0.01, 7% of the mean ($0.04, 21%)     | $0.01, 10% ($0.04, 28%) |
| turns                       | 2, 22% (3, 36%)                        | 2, 27% (4, 48%)         |
| tool calls                  | 2, 25% (3, 41%)                        | 2, 32% (4, 56%)         |
| output tokens               | 438, 12% (1582, 40%)                   | 590, 13% (787, 25%)     |
| seconds                     | 6, 12% (52, 88%: `shop`, one slow run) | 7, 17% (18, 35%)        |
| Blip components in the tree | 2, 15% (4, 34%)                        | 3, 19% (5, 39%)         |
| `blip` calls                | 0                                      | 5, 68% (11, 123%)       |

Read: the difference between the configurations (about $0.02 a run, one turn, one tool call, one
Blip component) is inside this spread for every measure, so on the layer 1 measures alone
**`no-cli` and `cli` are not told apart by day zero's 18 runs each**. Only what they look up differs
clearly (`blip` calls 0 against 9, `docs` reads 2 against 0); the share of runs that looked anything
up before writing (93% against 100%) is one run. The shape of what they invent does not differ
either, except `className` against `style` above. Cost is stable to about a quarter and time to a
quarter apart from one outlier, so a harness piece that costs a turn is invisible and one that costs
three or more will show.
