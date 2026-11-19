# Blip UI eval

Measures what each piece of Blip UI's harness does for a coding agent
(`docs/blip-harness/spec.md`, section 3). Run by hand, never in CI.

```
evals/blip/
  tasks/<id>/task.md       the prompt, written like a ticket
  tasks/<id>/rubric.json   what the judge checks, and the URLs to screenshot
```

The six tasks: `shop`, `saves`, `pause`, `fight-hud`, `quests`, `camp-rest`.

## `task.md`

The whole file is the agent's prompt, sent as it is: no frontmatter, nothing
for the eval in it. It reads like a ticket someone on the team wrote:

- What the player can't do today, then what to build, as a short list
- The screen's name to register in `src/screens/index.ts`, and the URL that
  opens it (`camp-rest` changes `camp` and says so)
- The game's own data and actions by name, where the screen should use them
- Never a Blip component, a rule or the CLI. A ticket says what the player sees
  and does ("can't be bought", "ask first"), not how it is built. That rules out
  the components' names as plain words too (menu, window, dialog, button, tabs,
  meter, title, text, line, step), so a word in the ticket never points at a
  component
- Never what the rubric marks `unstated`

## `rubric.json`

```json
{
  "task": "shop",
  "scope": "all",
  "urls": [{ "id": "start", "url": "?screen=shop&state=start" }],
  "statements": [
    {
      "id": "gold",
      "text": "The player's gold is shown, as 120.",
      "unstated": false,
      "from": "screenshot",
      "screenshot": "start@wide"
    },
    {
      "id": "nothing-to-sell",
      "text": "With an empty pack, selling says there is nothing to sell, instead of showing an empty list or empty space.",
      "unstated": true,
      "from": "diff",
      "url": "empty",
      "note": "For the judge only."
    }
  ]
}
```

| Field                     | What it is                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task`                    | The folder's name                                                                                                                                                                             |
| `scope`                   | `all`, or `changed-lines`: `validate`, the raw tag and `className` counts and the rendered checks count only lines the agent changed, so a screen that was messy before isn't held against it |
| `urls`                    | What the rendered layer opens, each wide (960 × 600) and on a phone (402 × 714). `id` names the screenshot; `url` is the query, always `?screen=<name>&state=<fixture>`                       |
| `statements`              | 3 to 6, at least one `unstated`                                                                                                                                                               |
| `statements[].id`         | Unique in the task, stable: results refer to `<task>/<id>`                                                                                                                                    |
| `statements[].text`       | One claim, answered yes or no. Names the fixture's values where it helps the judge ("as 120", "Wren 42/50")                                                                                   |
| `statements[].unstated`   | `true` when the ticket doesn't ask for it and a careful developer would do it anyway. Reported on their own                                                                                   |
| `statements[].from`       | `screenshot` or `diff`: the one thing the judge answers it from                                                                                                                               |
| `statements[].screenshot` | With `from: screenshot`: `<url id>@wide` or `<url id>@phone`                                                                                                                                  |
| `statements[].url`        | With `from: diff` and `unstated: true`: the URL id whose fixture puts the game in that situation, so every unstated case can be opened and looked at                                          |
| `statements[].note`       | Optional, for the judge: what the diff alone doesn't show (what an unchanged file already does)                                                                                               |

A statement the judge and I disagree on twice is badly written and is
rewritten (spec Q14). A statement that a parser or the rendered layer already
measures (layout escapes, cut text, axe) is not a rubric statement, apart from
the phone layout of `fight-hud`, which asks whether the HUD still makes sense,
not whether something escapes.

## What the template holds for the tasks

`src/game/data.ts` (the `template` task builds it):

| Name                     | Content                                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ITEMS`                  | `id`, `name`, `description`, `price`, `sellPrice` (half, rounded down): Herb 8, Rope 12, Lamp Oil 15, Tonic 25, Leather Cap 60, Iron Sword 150                                                                                                                |
| `SHOP_STOCK`             | The ids of all six                                                                                                                                                                                                                                            |
| `REST_COST`              | 20                                                                                                                                                                                                                                                            |
| `STATUSES`               | `poisoned`, `asleep`, `guarded`, each with a label                                                                                                                                                                                                            |
| `ENEMIES`                | Bog Rat (20 HP), Marsh Wisp (9 HP)                                                                                                                                                                                                                            |
| `QUESTS`                 | `id`, `name`, `giver`, `description`, `steps` (strings): The Lost Ferry (Ferrywoman Maud; Ask in Mossy Ford about the ferry, Search the reeds south of the ford, Bring the ferry back), Wolves at Hollow Gate (Gatekeeper Tam), Herbs for Old Bess (Old Bess) |
| `DEFAULT_OPTIONS`        | `music` 7, `sound` 5 (0 to 10), `messageSpeed` `'normal'` (`'slow' \| 'normal' \| 'fast'`)                                                                                                                                                                    |
| `FIXTURES` (the `state`) | Whole game states by name, below                                                                                                                                                                                                                              |

A game state: `place`, `playtime` (seconds), `gold`, `party` (`id`, `name`,
`role`, `level`, `hp`, `maxHp`, `mp`, `maxMp`, `statuses`), `pack` (item id and
count), `quests` (quest id, `step`, `done`), `slots` (three, each `null` or
`place`, `leader`, `level`, `playtime`, `savedAt` as an ISO string), `options`,
`fight` (`null`, or `enemies` with `hp` and `maxHp`, and `turn`, a member's id).

| Fixture  | What it is                                                                                                                                                                                                                                                                                                 | Used by                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `start`  | Mossy Ford, 3:25 played, 120 gold. Wren (fighter, 4) 42/50 HP 6/10 MP, Oda (mender, 4) 18/34 21/30, Pim (scout, 3) 27/38 4/12. Pack: Herb ×3, Rope, Tonic. The Lost Ferry on its second step, Wolves on its first, Herbs done. Slot 1 holds Mossy Ford, Wren, 4, 3:25, 2 November; 2 and 3 empty. No fight | all six                   |
| `exact`  | `start` with 25 gold, the Tonic's price                                                                                                                                                                                                                                                                    | `shop`                    |
| `broke`  | `start` with 5 gold, less than `REST_COST` and the cheapest item                                                                                                                                                                                                                                           | `camp-rest`               |
| `empty`  | A new game: 50 gold, the party at full HP and MP, empty pack, no quests, all three slots empty                                                                                                                                                                                                             | `shop`, `saves`, `quests` |
| `full`   | `start` with all three slots holding a save (Hollow Gate, Wren, 3, 2:01; Reedmarsh, Wren, 4, 3:53)                                                                                                                                                                                                         | `saves`                   |
| `fight`  | `start` in a fight with the Bog Rat (14/20) and the Marsh Wisp (9/9), Oda's turn, Wren poisoned                                                                                                                                                                                                            | `fight-hud`               |
| `fallen` | `fight` with Pim at 0 HP. Nothing else marks Pim as fallen: 0 HP is the state                                                                                                                                                                                                                              | `fight-hud`               |

What the tickets assume beyond `data.ts`:

- `src/game/state.ts` has `buy`, `sell`, `save`, `load`, `rest`, `setOption`
  and `leaveRun`. `buy`, `sell` and `rest` refuse what the state doesn't allow
  and say why (`{ ok: false, reason: 'gold' | 'none' }`); none of them asks the
  player anything, which is the screen's job
- `src/screens/camp.tsx` shows the place, the gold and the party, and has a
  short list of things to do at camp (look around, talk) moved through with
  arrow keys and Enter in a `keydown` listener on `window`. `pause` depends on
  that listener: a pause screen on top doesn't stop it on its own. A Blip `Dialog`
  keeps the arrow keys from it while focus is inside, but not Enter

## Building the template

`evals/blip/template/` is not a workspace package (it has its own empty-ish
`pnpm-workspace.yaml`, and the root `tsconfig.json`, `.oxlintrc.json` and
`.oxfmtrc.json` exclude it). It builds against the packed Blip UI, never the
workspace source. By hand:

```bash
pnpm --filter @sebald/blip-ui pack --pack-destination /tmp/blip
cp /tmp/blip/sebald-blip-ui-*.tgz evals/blip/template/blip-ui.tgz   # git-ignored
cd evals/blip/template && pnpm install && pnpm typecheck && pnpm build
```

`blip-ui.tgz`, `node_modules`, `dist` and the lockfile are git-ignored; `run.mjs`
puts the tarball in place and keeps the lockfile per run.
