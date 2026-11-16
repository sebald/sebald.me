---
status: doing # todo | doing | done
step: A
depends: []
pr: https://github.com/sebald/sebald.me/pull/190
---

# `eval-tasks`: Write the eval's tasks and their rubrics

**Problem.** Everything the eval measures depends on what agents are asked to build, and the
template's data has to fit those tickets. The tasks come first.

**Outcome.** Six tasks in `evals/blip/tasks/<id>/`: `shop`, `saves`, `pause`, `fight-hud`,
`quests`, `camp-rest` (spec 3.2), each a `task.md` written like a ticket and a `rubric.json`.

**Included.** The ticket text. 3 to 6 rubric statements per task, at least one marked
`unstated` (empty inventory, not enough gold, a full slot). The URLs to screenshot per task
(`?screen=…&state=…`). A list of what `src/game/data.ts` must hold for the six tickets.
`evals/blip/README.md` with the two file formats.

**Not included.** The template, any code, anything taken from Pushback.

**Acceptance criteria.**

- No ticket names a Blip component, a rule or the CLI
- Every rubric statement can be answered yes or no from the diff or from one named screenshot
- Every unstated requirement is reachable through a fixture named in the task's URLs
- `camp-rest` changes a screen that already exists and says so
- I have read all six and would accept them as tickets

**Depends on.** Nothing.

**Changes in the eval.** Defines the tasks and the rubric layer's statements.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

- **What's there.** Six tasks, 33 statements, 14 of them `unstated`. `evals/blip/README.md`
  has both formats and what the template holds for the tickets: `data.ts` by name, seven
  fixtures (`start`, `exact`, `broke`, `empty`, `full`, `fight`, `fallen`), and two
  assumptions about `state.ts` and `camp.tsx` that the `template` task has to keep.
- **One source per statement.** `from` is `diff` or `screenshot`, and a screenshot is named
  `<url id>@wide|phone`, so a statement never needs two pieces of evidence. Interactions a
  first frame can't show (asking before overwriting, refusing to load an empty slot, keys
  under the pause screen) are judged from the diff.
- **Unstated and reachable.** A screenshot statement reaches its case through its URL; a
  diff statement that is `unstated` names the URL whose fixture sets the case up (`url`).
- **`note`, for the judge only.** The judge sees the diff, not the files it leaves alone. Two
  statements depend on one: `camp.tsx` listens for keys on `window` (`pause`), and `buy` and
  `rest` already refuse without enough gold (`shop`, `camp-rest`), so calling them and
  showing nothing fails.
- **`scope`.** `camp-rest` and `pause` are `changed-lines`: both change `camp.tsx`, so
  `validate`, the counts and the rendered checks look at what the agent changed, not at the
  messy screen it found. Neither has a statement against rewriting the camp: the tickets
  don't forbid it.
- **After review.** Statements that held several claims were narrowed to one (`fight-hud`
  `members` and `enemies`, `quests` `open-and-done`); `saves` `no-saves` is `unstated` (the
  ticket never says an empty slot says so) and `empty-saves-directly` is gone (asking before
  every save breaks nothing, and `overwrite-asks` covers the case that matters); the `pause`
  ticket no longer says "anything not saved is lost", which hinted at `leave-asks`.
- **No component names, even as plain words.** Menu, window, dialog, button, tabs, meter,
  title, text, line, step are all Blip names, so the tickets say "pause screen", "name",
  "what to do next", "ask first", "message speed". Checked by a script against every export
  of `packages/blip-ui/src`, plus blip, CLI, rule and Pushback; not committed.
- **Dropped from the tickets:** the fight's moves (a later ticket, so `fight-hud` is a
  read-out only), and the phone in `fight-hud`, which stays unstated as the spec has it.
- **The two assumptions, compared and kept.** Checked when they're built: an acceptance
  criterion of [`template`](template.md).
  - _Refusing actions._ `buy`, `sell` and `rest` refuse and return the reason (A1). Set
    aside: no guard (the eval would also measure game rules), throwing (an odd API for an
    ordinary refusal, and a missing catch crashes the run), and `canAfford`-style helpers
    (they give away the unstated "can't afford" cases).
  - _The camp's keys._ A `keydown` listener on `window` (B1). Blip's `Dialog` puts itself on
    its stack of input layers (`hooks/key-layer.ts`), but a raw listener ignores the stack,
    so `camp-gets-no-keys` passes only if the agent finds Blip's input layers or switches
    the listener off itself: a statement the harness can move. Set aside: a listener on the
    camp's own element (the pause screen takes focus, so it passes by accident), Blip's
    `useKeys` in the camp (spec 3.1 says no Blip), and an input module in the game (it would
    compete with Blip's layers and measure the project, not Blip). Later, not in v1: press a
    key with `?screen=pause` open and check the camp didn't move, instead of judging it
    from the diff.
- **Not checked by me:** whether the tickets read well. That is the last criterion, yours.
