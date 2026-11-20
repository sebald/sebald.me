# Blip eval: day-zero

Collector `b0c18d5e003c`, Blip CLI `0.0.0+925ec59d8f14`. 36 runs, 36 complete. Medians, with the lowest and highest of the repetitions in brackets; a share is runs of the runs it applies to. Layers 1 and 2: the rendered pass is in. The judge is in. No `validate` measures yet.

Write-ups: [`invented.md`](invented.md).

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

## 3. It does the job

### stated rubric statements passed (%)

| configuration |                all | vs previous | camp-rest | fight-hud | pause |             quests | saves | shop |
| ------------- | -----------------: | ----------: | --------: | --------: | ----: | -----------------: | ----: | ---: |
| no-cli        | 100 (66.67 to 100) |             |       100 |       100 |   100 | 100 (66.67 to 100) |   100 |  100 |
| cli           | 100 (33.33 to 100) |           0 |       100 |       100 |   100 | 100 (33.33 to 100) |   100 |  100 |

### unstated rubric statements passed (%, reported on their own)

| configuration |             all | vs previous | camp-rest | fight-hud |           pause | quests | saves | shop |
| ------------- | --------------: | ----------: | --------: | --------: | --------------: | -----: | ----: | ---: |
| no-cli        | 100 (50 to 100) |             |        50 |       100 | 100 (50 to 100) |    100 |   100 |  100 |
| cli           | 100 (50 to 100) |           0 |        50 |       100 |             100 |    100 |   100 |  100 |

## 4. It renders

### every URL renders, wide and on a phone

| configuration |          all | vs previous |  camp-rest |  fight-hud |      pause |     quests |      saves |       shop |
| ------------- | -----------: | ----------: | ---------: | ---------: | ---------: | ---------: | ---------: | ---------: |
| no-cli        | 100% (18/18) |             | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| cli           | 100% (18/18) |           0 | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

### layout escapes, wide

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### layout escapes, phone

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### cut text, wide

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### cut text, phone

| configuration | all | vs previous | camp-rest | fight-hud | pause | quests | saves | shop |
| ------------- | --: | ----------: | --------: | --------: | ----: | -----: | ----: | ---: |
| no-cli        |   0 |             |         0 |         0 |     0 |      0 |     0 |    0 |
| cli           |   0 |           0 |         0 |         0 |     0 |      0 |     0 |    0 |

### axe violations, wide

| configuration |        all | vs previous | camp-rest | fight-hud | pause |     quests | saves | shop |
| ------------- | ---------: | ----------: | --------: | --------: | ----: | ---------: | ----: | ---: |
| no-cli        | 0 (0 to 1) |             |         0 |         0 |     0 | 0 (0 to 1) |     0 |    0 |
| cli           | 0 (0 to 1) |           0 |         0 |         0 |     0 | 0 (0 to 1) |     0 |    0 |

### axe violations, phone

| configuration |        all | vs previous | camp-rest | fight-hud | pause |     quests | saves | shop |
| ------------- | ---------: | ----------: | --------: | --------: | ----: | ---------: | ----: | ---: |
| no-cli        | 0 (0 to 1) |             |         0 |         0 |     0 | 0 (0 to 1) |     0 |    0 |
| cli           | 0 (0 to 1) |           0 |         0 |         0 |     0 | 0 (0 to 1) |     0 |    0 |

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

## Rubric (the judge)

Judge `claude-opus-5-5`, prompt `d5c2bdfad060`, one question per statement. Cost of the answers recorded here: $4.20 (an estimate at API prices, not a charge). 36 of 36 runs judged.

| statements                   | pass | fail | judge error | skipped |
| ---------------------------- | ---: | ---: | ----------: | ------: |
| stated, all                  |  111 |    3 |           0 |       0 |
| unstated, all (on their own) |   77 |    7 |           0 |       0 |
| camp-rest: stated            |   24 |    0 |           0 |       0 |
| camp-rest: unstated          |    6 |    6 |           0 |       0 |
| fight-hud: stated            |   24 |    0 |           0 |       0 |
| fight-hud: unstated          |   12 |    0 |           0 |       0 |
| pause: stated                |   18 |    0 |           0 |       0 |
| pause: unstated              |   11 |    1 |           0 |       0 |
| quests: stated               |   15 |    3 |           0 |       0 |
| quests: unstated             |   12 |    0 |           0 |       0 |
| saves: stated                |    6 |    0 |           0 |       0 |
| saves: unstated              |   24 |    0 |           0 |       0 |
| shop: stated                 |   24 |    0 |           0 |       0 |
| shop: unstated               |   12 |    0 |           0 |       0 |

### Failed statements

- `cli/quests-1` `quests/open-and-done` (screenshot start@wide): The Lost Ferry and Wolves at Hollow Gate come before Herbs for Old Bess (done), but nothing clearly separates the two groups: there is no heading or divider. The only gap is about 10px more space than between the open quests, plus the '(done)' label, which is too slight to count as visibly apart.
- `cli/quests-1` `quests/description` (diff): In src/screens/quests.tsx, each PickerItem's onSelect only calls say(quest), which passes the description to useAnnounce(). No state records the chosen quest, and no element renders its description when it is chosen. The description also appears in each item's `note` prop, but nothing in the diff shows that the note is displayed in response to choosing.
- `no-cli/quests-3` `quests/open-and-done` (screenshot start@wide): The Lost Ferry and Wolves at Hollow Gate are listed above Herbs for Old Bess, so the order is right. But nothing clearly separates the two groups: there is no heading or divider, only a slightly bigger gap (about 41px instead of about 28px) and a small '· Done' after the giver's name.

### Failed unstated statements

- `cli/camp-rest-1` `camp-rest/broke-shown` (screenshot broke@wide): The screen shows 5 gold at the top right, and the menu lists "Rest (20 gold)" in the same style as the enabled "Talk" option. Nothing marks it as disabled or says the party can't afford it, so resting is offered as if it would work.
- `cli/camp-rest-2` `camp-rest/broke-shown` (screenshot broke@wide): With 5 gold shown at the top right, the menu still lists "Rest (20 gold)" in the same style as "Talk". It is not greyed out, marked unavailable or labelled as needing more gold, so it is offered as if it would work.
- `cli/camp-rest-3` `camp-rest/broke-shown` (screenshot broke@wide): With 5 gold in the top-right corner, 'Rest (20 gold)' looks exactly like the 'Talk' option. It isn't greyed out or marked unavailable, and nothing says 20 gold is needed. It only shows the price, so resting is offered as if it would work.
- `no-cli/camp-rest-1` `camp-rest/broke-shown` (screenshot broke@wide): With '5 gold' shown at the top right, the menu lists 'Rest (20 gold)' in the same style as the 'Talk' option. Nothing greys it out, marks it as unavailable or says the party can't afford it, so resting is offered as if it would work.
- `no-cli/camp-rest-2` `camp-rest/broke-shown` (screenshot broke@wide): With 5 gold in the top right, the menu lists "Rest (20 gold)" in the same style as the available "Talk" option. Nothing shows it as greyed out or disabled, and there is no message saying the party needs 20 gold, so resting is offered as if it would work.
- `no-cli/camp-rest-3` `camp-rest/broke-shown` (screenshot broke@wide): The screen shows 5 gold in the top right, and 'Rest (20 gold)' looks exactly like the 'Talk' option. It is not greyed out, and nothing says it can't be done or that 20 gold is needed. The label only shows the price, so resting is offered as if it would work.
- `no-cli/pause-3` `pause/camp-gets-no-keys` (diff): In src/screens/camp.tsx the camp's keys move to an unconditional `useKeys({ ArrowDown, ArrowUp, Enter: () => setSaid(...), Escape })` that never checks `paused`. Only the added comment says Blip's keys 'follow its layers', and nothing in the diff shows that Enter (or the arrows) are kept from the camp while PauseMenu's Dialog is open.

## Network use

1 of 36 runs ran a command that reaches out. They are counted above like the others.

- `no-cli/pause-2`: `npx`

## Runs to look at

None.

## Rendered pages to look at

Screenshots are in the cache, `<label>/.screenshots/<run>/<url id>@wide|phone.png`. For a `changed-lines` task what the untouched template shows is taken off.

- `cli/quests-3` start@wide: axe list (serious), 1 node(s)
- `cli/quests-3` start@phone: axe list (serious), 1 node(s)
- `no-cli/quests-2` start@wide: axe list (serious), 1 node(s)
- `no-cli/quests-2` start@phone: axe list (serious), 1 node(s)

## Skipped runs

None.

## Candidate variants, sizes or components

Overrides written independently in at least 3 runs across at least 2 tasks (Q11), taken from the lines the agent wrote: the restyling classes of a `className` (placing classes are left out) and the whole of an inline `style` object, keys sorted, a tuned or computed value as `*` (`gap:*`).

| on              |                                                                                                                           classes or style | runs |                  tasks | lines |
| --------------- | -----------------------------------------------------------------------------------------------------------------------------------------: | ---: | ---------------------: | ----: |
| `div` (raw tag) | style: `display:'flex'` `flexDirection:'column'` `gap:*` `inset:0` `overflow:'hidden'` `padding:*` `paddingBottom:*` `position:'absolute'` |    5 | fight-hud, saves, shop |     5 |
| `div` (raw tag) |                                                                                                                   style: `paddingBottom:*` |    3 |      fight-hud, quests |     3 |
