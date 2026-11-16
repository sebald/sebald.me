# Game UI catalog

What a small pixel game's screens are made of, element by element: when to use
one, when not, and the Blip page that covers it or **gap**. Written for the
harness (`docs/blip-harness/spec.md`, section 4). Nothing here is a rule; the
candidate rules are in `candidates/`, and where game and web conventions
disagree is in `conflicts.md`.

## How to read it

- **Blip** names a page by its id (`picker`, `dialog`, `hooks`), the id its
  sidecar will carry. `picker (note)` points at one part of the page. A
  pattern page that does not exist yet is written `pattern: shop`; it is still
  a gap until the `patterns` task writes it.
- **gap** means Blip has nothing for it today. "gap, closest: `ledger`" says
  what an agent would reach for instead.
- **Tasks** are the eval's six (spec 3.2): `shop`, `saves`, `pause`,
  `fight-hud`, `quests`, `camp-rest`. The summary at the end lists, per task,
  every entry it touches.
- **Rules** lists the candidate ids that belong to the entry. Candidates are
  numbered from 101 per page, apart from the rules the `rule-extraction-*`
  tasks write from the pages (from 1), so a candidate keeps its id when it
  moves into a sidecar and an id is never reused.

The sources, by short name:

| Short | Source                                                                                                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAG   | [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/)                                                                                                                                  |
| XAG   | [Xbox Accessibility Guidelines 3.2](https://learn.microsoft.com/en-us/xbox/accessibility/guidelines), by number (XAG 112)                                                                                            |
| APX   | [AbleGamers, Accessible Player Experiences](https://accessible.games/accessible-player-experiences/)                                                                                                                 |
| HIG   | [Apple HIG, Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games) and [Game controls](https://developer.apple.com/design/human-interface-guidelines/game-controls) |
| Deck  | [Steam Deck compatibility review](https://partner.steamgames.com/doc/steamdeck/compat)                                                                                                                               |
| HUD   | [Perceiving without looking: designing HUDs for peripheral vision](https://gamedeveloper.com/design/perceiving-without-looking-designing-huds-for-peripheral-vision)                                                 |
| Pad   | [MDN, Using the Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)                                                                                                     |

## Menus and navigation

### Menu list

A vertical list of choices with a cursor: the title menu, a pause menu, the
choices in a fight.

- **Use** for any list the player picks one thing from, on every input.
- **Not** for one action a screen is for (a `Button`), nor for pages of a
  window (`Tabs`).
- **Blip:** `picker`
- **Tasks:** `shop`, `saves`, `pause`, `fight-hud`, `quests`, `camp-rest`
- **Rules:** `C-PICKER-101`, `A-PICKER-101`, `T-PICKER-101`

### Grid of choices

Choices in rows and columns: an inventory of slots, a level select.

- **Use** when the items are pictures more than words, or many of them have to
  show at once.
- **Not** when the items are read as words: a list reads faster and wraps.
- **Blip:** gap, closest: `picker` (one column only)
- **Tasks:** `shop` (if the agent draws the inventory as slots)
- **Rules:** `P-GRID-101`

### Setting row

A menu row whose value steps left and right: Mode ◀ Normal ▶, Music On/Off.

- **Use** for every option with a few values, even two.
- **Not** for an action (that is a `PickerItem`), nor a free number (a gap:
  there is no text field).
- **Blip:** `setting`, in a Picker as `PickerSetting`
- **Tasks:** `pause`
- **Rules:** `C-SETTING-101`, `P-OPTIONS-101`, `P-OPTIONS-102`

### Pause menu

What opens over a running game: resume, options, how it works, leave.

- **Use** in any game with time in it, from every screen the game runs on.
- **Not** as a screen of its own that unmounts the game: the game under it
  keeps its state.
- **Blip:** `dialog` with a `picker`; pattern: `pause` (gap)
- **Tasks:** `pause`
- **Rules:** `P-PAUSE-101`, `P-PAUSE-102`, `P-PAUSE-103`, `P-PAUSE-104`, `P-PAUSE-105`

### Confirmation

A question before something that cannot be undone: leaving a run, erasing or
overwriting a save, selling the last of something.

- **Use** before a loss the player can't take back.
- **Not** for what can be undone, nor for every purchase: a confirm the player
  answers by reflex protects nothing.
- **Blip:** `confirm`
- **Tasks:** `pause` (leaving), `saves` (overwriting), `shop` (selling)
- **Rules:** `C-CONFIRM-101`, `C-CONFIRM-102`, `P-SHOP-104`

### Pages in a window

One window with pages: buy and sell, open and done quests, a codex by
chapter.

- **Use** for pages that can be visited in any order.
- **Not** for steps in a flow, nor for two lists the player needs side by
  side.
- **Blip:** `tabs`
- **Tasks:** `shop`, `quests`
- **Rules:** `C-TABS-101`

### Way back

Back, Cancel, Escape, the leave corner: how the player gets out of any screen.

- **Use** on every screen but the first.
- **Not** hidden behind a key alone: a touch player has no Escape.
- **Blip:** `controls` (`slot="leave"`), `picker` (`variant="back"`),
  `hooks` (`useKeys`, Escape)
- **Tasks:** all six
- **Rules:** `P-NAVIGATION-101`, `P-NAVIGATION-102`

### Control hints

The keys that work right now, along a window's bottom edge.

- **Use** on every window that takes input.
- **Not** as the only place a control is explained: a hint is a reminder, not
  a tutorial.
- **Blip:** `window` (Legend)
- **Tasks:** all six
- **Rules:** `C-WINDOW-101`

### Description box

What the current row does, or why it is off, beside the list.

- **Use** for an item's stats, a locked option's reason, a quest's detail.
- **Not** for anything the player must read before picking: that goes in the
  row or above the list.
- **Blip:** `picker` (note)
- **Tasks:** `shop`, `saves`, `quests`
- **Rules:** `C-PICKER-102`

### Long list

A list taller than its room.

- **Use** the Picker's own scroll and rail.
- **Not** paging buttons of your own.
- **Blip:** `picker` (rail)
- **Tasks:** `shop`, `quests`
- **Rules:** `P-QUESTS-103`

### Screen layout

Where the windows of a screen go: a list on the left, its details on the
right, a status block on top.

- **Use** on every screen; Blip's own compositions place windows with raw
  `div`s and classes (spec, Q11).
- **Not** by restyling a component: placing is a wrapper's job.
- **Blip:** gap, closest: `stage` (`usePixels`), `window`
- **Tasks:** all six
- **Rules:** none: a layout component is a day-zero decision (Q11)

### Title screen and press start

The game's name, a call to press a key, and the first menu.

- **Use** once, at the start. Start the game from it in one pick.
- **Not** as a gate in front of every visit to the menu.
- **Blip:** `text` (`ScreenTitle`, call), `bitmap-text`, `hooks`
  (`useAnyKey`, `useIdle`), `picker`; pattern: `menu-screen` (planned by
  `examples-and-patterns`)
- **Tasks:** none
- **Rules:** `P-TITLE-101`

## HUD

### Pool in cells

A small pool counted out in boxes: momentum, lives, charges.

- **Use** for up to ten whole units (twenty in `compact`).
- **Not** for hit points out of 100, nor anything that runs smoothly.
- **Blip:** `meter`
- **Tasks:** `fight-hud`
- **Rules:** `C-METER-101`

### Bar

A value that runs smoothly: hit points, a cast bar, experience to the next
level.

- **Use** for a value with a large or uneven maximum.
- **Not** for a count the player plans with in whole units (`Meter`).
- **Blip:** gap, closest: `meter`, which says to draw a bar instead
  (`meter.mdx:11`)
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-102`, `P-HUD-103`

### Number readout

A number that matters: gold, hit points as a number, a score.

- **Use** a Ledger for a block of stats read across; a single readout that
  sits on its own (gold in a corner) has no component.
- **Not** in running text where it can't be found again.
- **Blip:** `ledger` for a block; a single readout is a gap
- **Tasks:** `shop`, `fight-hud`, `camp-rest`
- **Rules:** `P-SHOP-101`; Ledger's `when-not` (a row the player picks is a PickerItem)

### Party member card

A name, a face, hit points and status, one per member, side by side.

- **Use** in a fight with more than one on the player's side.
- **Not** as a full status screen: the card shows what changes in a turn.
- **Blip:** gap, closest: `window` + `ledger` + `meter`; pattern: `hud` (gap)
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-101`, `P-HUD-104`, `P-HUD-105`

### Fallen member

A member who is out of the fight but still in the party.

- **Use** a state in words and in the picture, not only in colour.
- **Not** by removing the card: the party's size stays readable.
- **Blip:** gap (no state on a card; `bui-disabled` is for what can't be used
  right now, which fits a fallen member's commands, not the card)
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-104`, `P-HUD-105`

### Turn indicator

Whose turn it is, and what comes next.

- **Use** in a turn-based fight.
- **Not** by colour alone, nor by a blinking call (one call per screen).
- **Blip:** gap
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-106`

### Status icons

Small marks for poisoned, asleep, shielded.

- **Use** with a name in the description box or the card's label.
- **Not** alone: an icon is `aria-hidden` in Blip.
- **Blip:** gap (`pixel-icon` has the system icons only)
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-107`

### Floating numbers

Damage or healing rising from a sprite.

- **Use** as an echo of a change the HUD also shows.
- **Not** as the only place a change is said.
- **Blip:** gap (game art, not UI: it would animate in steps)
- **Tasks:** `fight-hud`
- **Rules:** `P-HUD-103`

### Countdown

A choice against the clock.

- **Use** where the time is the challenge.
- **Not** for long spans, nor in a UI that isn't about speed.
- **Blip:** `timer`
- **Tasks:** none
- **Rules:** `C-TIMER-101`

### Objective reminder

What the player is doing now, shown or one press away.

- **Use** in any game with goals that span sessions.
- **Not** as a log only: the current one is on hand.
- **Blip:** gap, closest: `window` + `text`
- **Tasks:** `quests`
- **Rules:** `P-QUESTS-101`, `P-QUESTS-102`, `T-QUESTS-101`

### Touch controls

The keys as buttons: the corners on a wide stage, the bar on a phone.

- **Use** in every game, whatever the device: a phone has no keys.
- **Not** for gameplay moves of your own design; Controls holds leave and
  system buttons.
- **Blip:** `controls`, `icon-button`
- **Tasks:** `fight-hud` (phone), `pause`
- **Rules:** `C-CONTROLS-101`, `A-CONTROLS-101`

## Inventory and shops

### Item with a price

A row that names an item and what it costs.

- **Use** a Picker row; the price belongs to the row.
- **Not** a Ledger: a ledger only shows, a shop row is picked.
- **Blip:** `picker` (a row has no value slot: the price is in the label), so
  partly a gap
- **Tasks:** `shop`
- **Rules:** `P-SHOP-102`

### Item the player can't afford

A row that stays in the list, dimmed, and says why.

- **Use** whenever a price is above what the player has.
- **Not** hidden, nor in red alone.
- **Blip:** `picker` (`disabled` + `note`)
- **Tasks:** `shop`, `camp-rest`
- **Rules:** `P-SHOP-103`, `T-SHOP-101`

### Buy and sell

Two lists over one stock.

- **Use** Tabs for the two pages.
- **Not** two screens with their own way back.
- **Blip:** `tabs` + `picker`; pattern: `shop` (gap)
- **Tasks:** `shop`
- **Rules:** `P-SHOP-104`, `P-SHOP-105`

### Quantity

How many to buy or sell.

- **Use** a stepped value that stops at its ends (none, all you can afford).
- **Not** a free number field.
- **Blip:** `setting` (with `first` and `last`)
- **Tasks:** `shop`
- **Rules:** `P-SHOP-106`

### Empty list

Nothing to sell, no quests yet, no saves.

- **Use** a line that says why it is empty and what fills it.
- **Not** an empty window, nor a list with no rows and a cursor on nothing.
- **Blip:** gap, closest: `text` in the window's `Content`
- **Tasks:** `shop`, `quests`, `saves`
- **Rules:** `P-EMPTY-101`, `P-EMPTY-102`

### Result of a transaction

"Bought a potion. 12 gold left."

- **Use** after every buy, sell or rest: the readout changes and a line says
  what happened.
- **Not** only a sound.
- **Blip:** gap (no toast), closest: `hooks` (`useAnnounce`, `useFeedback`)
  and the readout itself
- **Tasks:** `shop`, `camp-rest`
- **Rules:** `P-FEEDBACK-101`, `P-FEEDBACK-102`

## Dialogue

### Line over the scene

What a character says, pointing at them.

- **Use** a SpeechBubble for one or two lines.
- **Not** for what the screen says (menus, results): a Window.
- **Blip:** `speech-bubble`
- **Tasks:** none
- **Rules:** `P-DIALOGUE-101`

### Dialogue box

The classic box at the bottom, a speaker's name, the line typing out.

- **Use** a Window with a Typewriter.
- **Not** a Dialog: nothing is interrupted.
- **Blip:** `window` + `typewriter`; the name plate is a gap
- **Tasks:** none
- **Rules:** `P-DIALOGUE-101`, `P-DIALOGUE-102`

### Conversation log

The lines said so far, one side told from the other.

- **Use** Line, with `past` on what was said.
- **Not** for one line on its own.
- **Blip:** `line`
- **Tasks:** none
- **Rules:** `P-DIALOGUE-103`

### Reply choices

What the player says back.

- **Use** a Picker.
- **Not** buttons in a row.
- **Blip:** `picker`
- **Tasks:** none
- **Rules:** `C-PICKER-101`

### Portrait

The speaker's face beside the line.

- **Use** when several people speak in one box.
- **Not** as the only sign of who speaks.
- **Blip:** gap (art; no frame for it)
- **Tasks:** none
- **Rules:** `P-DIALOGUE-101`

## Save and load

### Save slots

A short list of places to save to or load from, each with what is in it.

- **Use** a Picker of slots, each naming what it holds.
- **Not** "Slot 1" alone.
- **Blip:** `picker`; the slot's summary (time, place, progress) is a gap;
  pattern: `saves` (gap)
- **Tasks:** `saves`
- **Rules:** `P-SAVES-101`, `P-SAVES-102`

### Empty slot

A slot with nothing in it.

- **Use** a row that says Empty: pickable when saving, disabled with a note
  when loading.
- **Not** hidden: the number of slots stays readable.
- **Blip:** `picker` (`disabled` + `note`)
- **Tasks:** `saves`
- **Rules:** `P-SAVES-103`

### Overwrite

Saving over a slot that holds a game.

- **Use** a Confirm that names what goes.
- **Not** a silent write.
- **Blip:** `confirm`
- **Tasks:** `saves`
- **Rules:** `P-SAVES-104`, `C-CONFIRM-101`

### Saving indicator

The game says it saved, or is saving.

- **Use** after every save, manual or automatic.
- **Not** a spinner that blocks the screen.
- **Blip:** gap, closest: `hooks` (`useAnnounce`)
- **Tasks:** `saves`
- **Rules:** `P-SAVES-105`, `P-SAVES-106`

### Continue

Resume the last game from the title.

- **Use** as the first item of the title menu once a save exists.
- **Not** behind a load screen.
- **Blip:** `picker`
- **Tasks:** none
- **Rules:** `P-TITLE-101`

## Onboarding

### How it works

The rules of the game in a few lines, on hand from the menu.

- **Use** a large Dialog with a title, the text and a legend.
- **Not** as the only teaching: a static screen is not a tutorial (XAG 109).
- **Blip:** `dialog` (`size="large"`)
- **Tasks:** `pause`
- **Rules:** `P-HELP-101`, `P-HELP-102`

### Contextual hint

A line that appears where the player is stuck or meets something new.

- **Use** at the moment it is needed.
- **Not** all at once on the first screen.
- **Blip:** gap, closest: `picker` (note), `text` (a hint)
- **Tasks:** none
- **Rules:** `P-HELP-103`

### Glossary

The game's own words, explained.

- **Use** for any word the game invents.
- **Not** only in a tutorial the player has passed.
- **Blip:** `tabs` (Pushback's glossary is one)
- **Tasks:** none
- **Rules:** `T-HELP-101`

## Feedback

### UI sound

A move, a confirm, a back, a bump.

- **Use** through `useFeedback`, by what happened.
- **Not** as the only signal.
- **Blip:** `hooks` (`useFeedback`)
- **Tasks:** all six
- **Rules:** `A-FEEDBACK-101`

### Announcement

What a screen reader hears when something changes.

- **Use** for a result, a purchase, a save.
- **Not** for every cursor move: the Picker already says that.
- **Blip:** `hooks` (`useAnnounce`)
- **Tasks:** `shop`, `saves`, `camp-rest`
- **Rules:** `A-FEEDBACK-102`

### Result banner

The word a screen is about: a round won, a run lost.

- **Use** BitmapText, large, over the scene.
- **Not** in a Window, nor for a sentence.
- **Blip:** `bitmap-text`
- **Tasks:** `fight-hud` (if the fight ends)
- **Rules:** none beyond the page's own

### Done mark

SHIPPED, DONE, on a card.

- **Use** a Stamp, with the same word in text.
- **Not** as the only place a result is said.
- **Blip:** `stamp`
- **Tasks:** `quests` (a done quest)
- **Rules:** none beyond the page's own

### Notification

A message that comes and goes: an item gained, a quest updated.

- **Use** for news that does not need an answer.
- **Not** on a timer the player can't stop; not over the cursor.
- **Blip:** gap
- **Tasks:** `shop`, `quests`, `camp-rest`
- **Rules:** `P-FEEDBACK-103`, `P-FEEDBACK-104`

### Waiting

Loading, or a turn being worked out.

- **Use** only for waits longer than a moment.
- **Not** in a small game's menus at all.
- **Blip:** gap
- **Tasks:** none
- **Rules:** none

### Error in a game

The game refuses: not enough gold, inventory full.

- **Use** the place it happened: the row's note, the readout.
- **Not** a modal for a refusal the player can read on the row.
- **Blip:** `picker` (note)
- **Tasks:** `shop`, `camp-rest`
- **Rules:** `T-SHOP-101`, `T-PICKER-101`

## Input

### Keys

The keyboard binding of every action.

- **Use** `useKeys`, the arrows and WASD, Enter and Space, Escape.
- **Not** chords, nor a key held down to act.
- **Blip:** `hooks` (`useKeys`)
- **Tasks:** all six
- **Rules:** `P-INPUT-101`, `P-INPUT-102`

### Input layers

What hears the keys when a dialog is open.

- **Use** the Dialog's own layer.
- **Not** turning the screen's Picker off by hand.
- **Blip:** `hooks` (`useKeyLayer`, `useOnTop`), `dialog`
- **Tasks:** `pause`
- **Rules:** `P-PAUSE-102`

### Which input is in use

Keys or touch, to name the right one in the hints.

- **Use** `useInputKind`; the Legend already does.
- **Not** a setting the player has to find.
- **Blip:** `hooks` (`useInputKind`), `window` (Legend)
- **Tasks:** all six
- **Rules:** `A-INPUT-101`

### Gamepad

A controller in a browser game.

- **Use** the Gamepad API's standard mapping: A confirms, B goes back.
- **Not** without keys and touch beside it.
- **Blip:** gap (`hooks` reads keys only)
- **Tasks:** none
- **Rules:** `P-INPUT-103`, `P-INPUT-104`

### Remapping

The player moves an action to another key.

- **Use** in a game with more than a handful of keys.
- **Not** needed for a menu-only game whose keys have alternatives (arrows and
  WASD).
- **Blip:** gap
- **Tasks:** none
- **Rules:** `P-INPUT-105`

### Text entry

Naming a save or a character.

- **Use** only when the name matters to the player.
- **Not** required to save: a slot has a name already.
- **Blip:** gap
- **Tasks:** `saves` (if an agent asks for a name)
- **Rules:** `P-SAVES-107`

## Readability at pixel scale

### Stage

The scaled grid everything sits on.

- **Use** one stage per game.
- **Not** sizes in CSS pixels inside it.
- **Blip:** `stage`
- **Tasks:** all six
- **Rules:** `F-LENGTH-101`

### Text size

The four sizes of text on a stage.

- **Use** the scale's sizes in em.
- **Not** a size below 0.75em: on a 3x stage that is the smallest that still
  holds a letter's pixels.
- **Blip:** `text`, `introduction`
- **Tasks:** all six
- **Rules:** `F-TEXT-101`, `F-TEXT-102`

### Phone held upright

The tall stage, the bar of controls.

- **Use** the stage's tall layout and pad by `--bui-bar`.
- **Not** a separate phone screen.
- **Blip:** `stage`, `controls`
- **Tasks:** `fight-hud`, and every task on the phone screenshot
- **Rules:** `F-LENGTH-102`, `P-HUD-108`

### Contrast and colour

Roles, not colours; the theme decides.

- **Use** `--bui-*` roles.
- **Not** colour as the only signal.
- **Blip:** `introduction`
- **Tasks:** all six
- **Rules:** `F-COLOUR-101`, `F-COLOUR-102`

### Motion and blinking

Stepped art, short transitions, blinking calls.

- **Use** the motion foundations; stop under reduced motion.
- **Not** more than one blinking thing at a time.
- **Blip:** `introduction` (Motion), `text` (call)
- **Tasks:** all six
- **Rules:** `F-MOTION-101`, `F-MOTION-102`

### Text size option

The player makes text larger.

- **Use** in a game with a lot to read.
- **Not** by scaling the art with the text.
- **Blip:** gap (the stage scales everything at once)
- **Tasks:** none
- **Rules:** `F-TEXT-103` `[open]`

## By task

What each eval task touches. Every entry below is above.

| Task        | Entries                                                                                                                                                                                                                                                                                                                                                                                             | Gaps among them                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `shop`      | Menu list, Grid of choices, Confirmation, Pages in a window, Way back, Control hints, Description box, Long list, Screen layout, Number readout, Item with a price, Item the player can't afford, Buy and sell, Quantity, Empty list, Result of a transaction, Announcement, Notification, Error in a game, Keys, Which input is in use, Stage, Text size, Contrast and colour, Motion and blinking | Grid of choices, Screen layout, single Number readout, price slot of Item with a price, Empty list, Result of a transaction, Notification |
| `saves`     | Menu list, Confirmation, Way back, Control hints, Description box, Screen layout, Save slots, Empty slot, Overwrite, Saving indicator, Empty list, Announcement, Text entry, Keys, Which input is in use, the readability entries                                                                                                                                                                   | Screen layout, slot summary of Save slots, Saving indicator, Empty list, Text entry                                                       |
| `pause`     | Menu list, Setting row, Pause menu, Confirmation, Way back, Control hints, Screen layout, Touch controls, How it works, Keys, Input layers, Which input is in use, the readability entries                                                                                                                                                                                                          | Pause menu (as a pattern), Screen layout                                                                                                  |
| `fight-hud` | Menu list, Way back, Control hints, Screen layout, Pool in cells, Bar, Number readout, Party member card, Fallen member, Turn indicator, Status icons, Floating numbers, Touch controls, Result banner, Keys, Phone held upright, the readability entries                                                                                                                                           | Bar, single Number readout, Party member card, Fallen member, Turn indicator, Status icons, Floating numbers, Screen layout               |
| `quests`    | Menu list, Pages in a window, Way back, Control hints, Description box, Long list, Screen layout, Objective reminder, Empty list, Done mark, Notification, Keys, the readability entries                                                                                                                                                                                                            | Objective reminder, Empty list, Notification, Screen layout                                                                               |
| `camp-rest` | Menu list, Way back, Control hints, Screen layout, Number readout, Item the player can't afford, Result of a transaction, Announcement, Notification, Error in a game, the readability entries                                                                                                                                                                                                      | single Number readout, Result of a transaction, Notification, Screen layout                                                               |

"The readability entries" are Stage, Text size, Phone held upright, Contrast
and colour, Motion and blinking.

### Gaps, by how many tasks touch them

| Gap                                                       | Tasks | Note                                                                       |
| --------------------------------------------------------- | ----- | -------------------------------------------------------------------------- |
| Screen layout                                             | 6     | Q11: whether Blip grows a layout component is decided on day zero          |
| Empty list                                                | 3     | A pattern, maybe no component: a line of `Text` in `Content` may be enough |
| Notification / Result of a transaction                    | 3     | The only feedback gap three tasks share                                    |
| Single number readout                                     | 3     | Gold in a corner; may be a `Ledger` of one row                             |
| Bar                                                       | 1     | `meter.mdx:11` already sends agents away from Meter                        |
| Party member card, Fallen member                          | 1     | Likely a pattern (`hud`) over Window, Ledger, Meter, not a component       |
| Turn indicator, Status icons                              | 1     | Candidates to leave open for gap drafts                                    |
| Save slot summary, Saving indicator                       | 1     | Pattern `saves`                                                            |
| Objective reminder                                        | 1     | `quests` gets no pattern on purpose (Q12): a good gap to leave open        |
| Grid of choices, Price slot, Text entry, Floating numbers | 1     | Only if an agent reaches for them                                          |
