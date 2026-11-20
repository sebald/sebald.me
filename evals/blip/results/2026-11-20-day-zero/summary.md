# Blip eval: day-zero

Collector `096caa596261+dirty`, Blip CLI `0.0.0+925ec59d8f14`. 36 runs, 36 complete. Medians, with the lowest and highest of the repetitions in brackets; a share is runs of the runs it applies to. Layer 1 only: no `validate`, rendered or judged measures yet.

## Runs

| configuration | all | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |  18 |         3 |         3 |     3 |      3 |     3 |    3 |
| cli           |  18 |         3 |         3 |     3 |      3 |     3 |    3 |

## 1. It builds

### tsc and build clean

| configuration |          all | vs previous |  camp-rest |  fight-hud |      pause |     quests |      saves |       shop |
| ------------- | -----------: | ----------: | ---------: | ---------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 100% (18/18) |             | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| cli           | 100% (18/18) |           0 | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

### tsc errors left

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

## 5. It reuses

### Blip components used

| configuration |          all | vs previous | camp-rest |     fight-hud | pause |        quests |         saves |          shop |
| ------------- | -----------: | ----------: | --------: | ------------: | ----: | ------------: | ------------: | ------------: |
| no-cli        | 13 (0 to 19) |             |         0 | 11 (10 to 14) |    14 | 13 (13 to 15) | 12 (10 to 12) | 17 (17 to 19) |
| cli           | 14 (0 to 19) |          +1 |         0 | 13 (13 to 16) |    14 | 13 (10 to 15) | 15 (15 to 18) | 18 (18 to 19) |

### own components used

| configuration |        all | vs previous | camp-rest | fight-hud |      pause |     quests |      saves |       shop |
| ------------- | ---------: | ----------: | --------: | --------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 2 (0 to 4) |             |         0 |         2 | 2 (1 to 2) | 3 (2 to 3) | 2 (2 to 3) | 2 (2 to 4) |
| cli           | 2 (0 to 3) |           0 |         0 |         2 | 1 (1 to 2) |          2 | 2 (2 to 3) |          2 |

### raw controls (`button`, headings, lists, inputs)

| configuration |        all | vs previous | camp-rest |  fight-hud | pause | quests | saves | shop |
| ------------- | ---------: | ----------: | --------: | ---------: | ----: | -----: | ----: | ---: |
| no-cli        | 0 (0 to 2) |             |         0 | 2 (0 to 2) |     0 |      0 |     0 |    0 |
| cli           | 0 (0 to 2) |           0 |         0 | 0 (0 to 2) |     0 |      0 |     0 |    0 |

### raw wrappers (`div`, `span`, ...)

| configuration |            all | vs previous | camp-rest |     fight-hud |      pause |        quests |         saves |          shop |
| ------------- | -------------: | ----------: | --------: | ------------: | ---------: | ------------: | ------------: | ------------: |
| no-cli        | 16.5 (0 to 26) |             |         0 | 24 (22 to 26) | 0 (0 to 1) | 19 (19 to 20) | 18 (17 to 19) |            16 |
| cli           |   15 (0 to 24) |        -1.5 |         0 | 22 (16 to 24) |          0 | 18 (15 to 21) | 14 (14 to 15) | 15 (15 to 16) |

### restyling classes

| configuration |        all | vs previous | camp-rest |  fight-hud | pause |     quests |      saves | shop |
| ------------- | ---------: | ----------: | --------: | ---------: | ----: | ---------: | ---------: | ---: |
| no-cli        | 0 (0 to 9) |             |         0 | 0 (0 to 9) |     0 | 4 (3 to 5) | 0 (0 to 3) |    0 |
| cli           |          0 |           0 |         0 |          0 |     0 |          0 |          0 |    0 |

### placing classes

| configuration |         all | vs previous | camp-rest |   fight-hud | pause |     quests |      saves | shop |
| ------------- | ----------: | ----------: | --------: | ----------: | ----: | ---------: | ---------: | ---: |
| no-cli        | 0 (0 to 34) |             |         0 | 4 (0 to 34) |     0 | 7 (2 to 8) | 0 (0 to 9) |    0 |
| cli           |           0 |           0 |         0 |           0 |     0 |          0 |          0 |    0 |

### imports from Blip that are not exports

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

## 6. It looks things up

### lookup before the first `.tsx` write

| configuration |          all | vs previous | camp-rest |  fight-hud |      pause |     quests |      saves |       shop |
| ------------- | -----------: | ----------: | --------: | ---------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        |  93% (14/15) |             |         - | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |  67% (2/3) |
| cli           | 100% (14/14) |       +7 pp |         - | 100% (3/3) | 100% (2/2) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

### `blip` calls

| configuration |         all | vs previous |  camp-rest |  fight-hud |       pause |       quests |        saves |        shop |
| ------------- | ----------: | ----------: | ---------: | ---------: | ----------: | -----------: | -----------: | ----------: |
| no-cli        |  0 (0 to 1) |             |          0 |          0 |           0 |            0 |   0 (0 to 1) |           0 |
| cli           | 9 (1 to 13) |          +9 | 2 (1 to 4) | 9 (4 to 9) | 5 (4 to 13) | 10 (7 to 11) | 12 (2 to 13) | 9 (9 to 10) |

### reads of `dist`

| configuration |        all | vs previous | camp-rest | fight-hud |      pause |     quests |      saves |       shop |
| ------------- | ---------: | ----------: | --------: | --------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 1 (0 to 3) |             |         0 |         1 | 1 (0 to 2) | 1 (0 to 1) | 2 (2 to 3) | 2 (0 to 3) |
| cli           | 1 (0 to 3) |           0 |         0 |         0 | 3 (2 to 3) | 1 (0 to 1) | 3 (1 to 3) |          1 |

### reads of `docs`

| configuration |        all | vs previous | camp-rest |  fight-hud |      pause |     quests |      saves |       shop |
| ------------- | ---------: | ----------: | --------: | ---------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 2 (0 to 4) |             |         0 | 3 (2 to 4) | 1 (0 to 3) | 3 (2 to 4) | 3 (1 to 4) | 0 (0 to 3) |
| cli           | 0 (0 to 1) |          -2 |         0 |          0 |          0 | 0 (0 to 1) | 0 (0 to 1) | 0 (0 to 1) |

### TypeScript errors met on the way

| configuration |        all | vs previous | camp-rest |  fight-hud | pause | quests |      saves | shop |
| ------------- | ---------: | ----------: | --------: | ---------: | ----: | -----: | ---------: | ---: |
| no-cli        | 0 (0 to 2) |             |         0 | 0 (0 to 2) |     0 |      0 |          0 |    0 |
| cli           | 0 (0 to 1) |           0 |         0 |          0 |     0 |      0 | 0 (0 to 1) |    0 |

## 7. What it costs

### tool calls

| configuration |         all | vs previous |  camp-rest |   fight-hud |      pause |     quests |      saves |       shop |
| ------------- | ----------: | ----------: | ---------: | ----------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 8 (3 to 10) |             | 3 (3 to 4) | 7 (7 to 10) | 8 (8 to 9) | 8 (7 to 9) | 9 (8 to 9) | 7 (6 to 9) |
| cli           |  7 (3 to 9) |          -1 | 5 (3 to 5) |  5 (4 to 7) | 7 (6 to 7) | 7 (5 to 7) |          8 | 8 (5 to 9) |

### turns

| configuration |         all | vs previous |  camp-rest |   fight-hud |       pause |      quests |        saves |        shop |
| ------------- | ----------: | ----------: | ---------: | ----------: | ----------: | ----------: | -----------: | ----------: |
| no-cli        | 9 (4 to 11) |             | 4 (4 to 5) | 8 (8 to 11) | 9 (9 to 10) | 9 (8 to 10) | 10 (9 to 10) | 8 (7 to 10) |
| cli           | 8 (4 to 10) |          -1 | 6 (4 to 6) |  6 (5 to 8) |  8 (7 to 8) |  8 (6 to 8) |            9 | 9 (6 to 10) |

### input tokens (uncached)

| configuration |          all | vs previous |  camp-rest |     fight-hud |         pause |        quests |         saves |          shop |
| ------------- | -----------: | ----------: | ---------: | ------------: | ------------: | ------------: | ------------: | ------------: |
| no-cli        | 18 (6 to 20) |             | 6 (6 to 8) | 16 (16 to 20) | 18 (18 to 20) | 18 (16 to 20) | 18 (18 to 20) | 16 (14 to 20) |
| cli           | 15 (6 to 18) |          -3 | 8 (6 to 8) | 12 (10 to 14) | 16 (14 to 16) | 16 (12 to 16) |            18 | 16 (12 to 18) |

### output tokens

| configuration |                 all | vs previous |           camp-rest |           fight-hud |               pause |              quests |               saves |                shop |
| ------------- | ------------------: | ----------: | ------------------: | ------------------: | ------------------: | ------------------: | ------------------: | ------------------: |
| no-cli        | 3571 (1193 to 4953) |             | 1196 (1193 to 1313) | 3623 (3519 to 3957) | 4070 (3986 to 4475) | 3292 (3139 to 3424) | 4685 (4444 to 4812) | 3448 (3371 to 4953) |
| cli           | 3436 (1396 to 4829) |        -135 | 1701 (1396 to 1834) | 2904 (2780 to 2974) | 4169 (3988 to 4578) | 3148 (2774 to 3561) | 4382 (4239 to 4829) | 3606 (3311 to 3660) |

### cache tokens (read and written)

| configuration |                        all | vs previous |              camp-rest |                 fight-hud |                     pause |                    quests |                     saves |                      shop |
| ------------- | -------------------------: | ----------: | ---------------------: | ------------------------: | ------------------------: | ------------------------: | ------------------------: | ------------------------: |
| no-cli        |   214012 (46030 to 261217) |             | 47805 (46030 to 63815) | 194066 (192755 to 261217) | 231356 (218887 to 247941) | 230520 (201943 to 244952) | 232657 (209137 to 258901) | 196600 (173476 to 247307) |
| cli           | 172097.5 (49019 to 228463) |    -41914.5 | 66609 (49019 to 73673) | 128050 (113401 to 158178) | 189284 (156986 to 195807) | 199972 (130944 to 201672) | 222201 (219578 to 223813) | 186017 (130996 to 228463) |

### subagents’ tokens (input and output)

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### dollars

| configuration |                 all | vs previous |           camp-rest |           fight-hud |               pause |              quests |               saves |                shop |
| ------------- | ------------------: | ----------: | ------------------: | ------------------: | ------------------: | ------------------: | ------------------: | ------------------: |
| no-cli        |  0.16 (0.05 to 0.2) |             | 0.05 (0.05 to 0.06) | 0.16 (0.15 to 0.16) | 0.18 (0.17 to 0.18) | 0.16 (0.15 to 0.16) |  0.19 (0.16 to 0.2) | 0.16 (0.16 to 0.18) |
| cli           | 0.14 (0.06 to 0.17) |       -0.03 | 0.07 (0.06 to 0.08) | 0.12 (0.12 to 0.12) | 0.15 (0.14 to 0.15) | 0.15 (0.11 to 0.15) | 0.16 (0.16 to 0.17) | 0.13 (0.12 to 0.15) |

### seconds

| configuration |                  all | vs previous |           camp-rest |           fight-hud |             pause |              quests |               saves |                shop |
| ------------- | -------------------: | ----------: | ------------------: | ------------------: | ----------------: | ------------------: | ------------------: | ------------------: |
| no-cli        | 38.35 (15.4 to 88.8) |             | 17.3 (15.4 to 19.7) | 37.1 (35.6 to 39.6) | 40 (39.9 to 40.5) | 31.1 (29.8 to 36.1) | 49.2 (46.1 to 52.1) | 53.9 (36.4 to 88.8) |
| cli           |  39.2 (23.9 to 65.5) |       +0.85 | 40.1 (23.9 to 65.5) |   36.2 (31 to 36.4) |   40 (40 to 47.3) |   38.4 (33 to 43.1) |   47.4 (44.1 to 62) |   35.5 (33.5 to 38) |

### permission denials

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### over budget

| configuration |       all | vs previous | camp-rest | fight-hud |    pause |   quests |    saves |     shop |
| ------------- | --------: | ----------: | --------: | --------: | -------: | -------: | -------: | -------: |
| no-cli        | 0% (0/18) |             |  0% (0/3) |  0% (0/3) | 0% (0/3) | 0% (0/3) | 0% (0/3) | 0% (0/3) |
| cli           | 0% (0/18) |           0 |  0% (0/3) |  0% (0/3) | 0% (0/3) | 0% (0/3) | 0% (0/3) | 0% (0/3) |

## Network use

1 of 36 runs ran a command that reaches out. They are counted above like the others.

- `no-cli/pause-2`: `npx`

## Runs to look at

None.

## Skipped runs

None.

## Candidate variants, sizes or components

Overrides written independently in at least 3 runs across at least 2 tasks (Q11), taken from the lines the agent wrote. Placing classes are left out.

None.

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
  (`cli/shop-1/shop.tsx:43-52`, `cli/fight-hud-2/fight.tsx:42-52`, `no-cli/shop-2/shop.tsx:69-79`)
  and as Tailwind classes in 4 (`no-cli/saves-2/saves.tsx:98`, `no-cli/quests-2/quests.tsx:62-65`).
  Three screens clear a fixed `ScreenTitle` with a guessed top padding of 22 to 24 stage pixels
  (`cli/shop-3/shop.tsx:49`, `cli/quests-3/quests.tsx:60`, `no-cli/saves-2/saves.tsx:98`). The three that did
  not hand-build it are `cli/saves-1`, `-2`, `-3`, which wrap in `Stage.Center`
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
  the same job in 5 other runs (`cli/saves-1/saves.tsx:26`). Both work; they disagree.

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
