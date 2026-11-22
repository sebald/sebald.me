# Forms and navigation in game UIs: research behind the Blip UI form tasks

Written 2026-11-22 while reviewing `TextField` (#215). The review raised four questions, each
researched in turn, each answered with a mock in a throwaway Storybook (not committed). The
decisions taken are at the end and in [`../tasks/README.md`](../tasks/README.md#forms-and-navigation).

**How to read the sources.** Items marked **[src]** rest on a page that was fetched or came up in
a search, with its link. Items marked **[memory]** are general knowledge of how those screens and
engines work and were not checked against a source. Web results were thin on visuals: no wiki
describes cursor art or colours, so nothing here copies art, fonts or layouts, only conventions.

## 1. How did 16-bit and early-90s games enter text?

- **Chrono Trigger (SNES).** A letter grid walked with the d-pad, A adds a letter, a default name
  is pre-filled so a player can accept at once, 5 letters in the US release. The cursor reaches
  only cells marked selectable. [src] [Legends of Localization](https://legendsoflocalization.com/articles/chrono-trigger-luccas-mother/),
  [Chrono Compendium](https://chronocompendium.com/Term/Chrono_Trigger_FAQ.html),
  [grid notes](https://gist.github.com/PhoenixBound/3ea18b40de28a6fde6768b22e7d1563b)
- **EarthBound (SNES).** The same family: a 7x16 grid, an upper/lower toggle, footer actions
  "Don't Care" (cycles preset names), Backspace and OK; several things named in a row, then one
  confirm. The footer actions are real stops in the same grid. [src] [grid notes](https://gist.github.com/PhoenixBound/3ea18b40de28a6fde6768b22e7d1563b),
  [Thonky](https://www.thonky.com/earthbound-walkthrough/starting-the-game),
  [CoilSnake wiki](https://github.com/pk-hack/CoilSnake/wiki/Faking-Names-Longer-Than-5-Letters)
- **Zelda: A Link to the Past.** REGISTER YOUR NAME on the file select puts the heart cursor in a
  letter field, REGISTER END confirms; 6 letters. [src] [Zelda Wiki](https://zeldawiki.wiki/wiki/File-Selection_Screen)
- **Final Fantasy VI.** Rename through the same grid; in the Japanese version the cursor returns
  to the name area after each letter, a cost players noticed. Where the cursor goes after an
  action is part of the design. [src] [Legends of Localization](https://legendsoflocalization.com/?p=12738),
  [Giant Bomb](https://giantbomb.com/wiki/Concepts/Renaming_Characters)
- **Secret of Mana, Terranigma, Lufia.** The sources confirm only a small limit and a confirm
  step, nothing on cursor or slot art. [src] [Flying Omelette](https://flyingomelette.com/oddities/somnaming.html),
  [Thonky](https://thonky.com/terranigma/beginning-the-game),
  [Hardcore Gaming 101](https://www.hardcoregaming101.net/lufia-the-fortress-of-doom/)
- **Sierra AGI.** A real typed line: a `> ` prompt, a block or underscore cursor that is a
  character of the font, a length cap, cleared on Enter. A known engine bug is a phantom space
  after the last letter because the cursor occupies a cell. [src] [AGI Wiki, get.string](https://www.agiwiki.sierrahelp.com/index.php/Get.string),
  [Wikipedia](https://en.wikipedia.org/wiki/Adventure_Game_Interpreter)
- **Sierra SCI and SCUMM save dialogs.** A list of slots; the selected slot's line becomes
  editable, Enter or Save commits. The field lives inside the list, in the row being named.
  [src, indirect] [ScummVM ticket](https://bugs.scummvm.org/ticket/472)

**[memory]** In the grid games the name sits in a row of fixed slots above the grid, the current
slot marked by an underscore, in the game's normal window with no extra box. Zelda's cursor is the
game's own heart, in-world rather than a UI primitive.

**Why it worked under their constraints.** A grid needs only four directions and confirm, so no
pointer. Letters are one cell each, so the slot count is the limit and the limit is visible. CRT
colour bleed kills thin borders, so a field is marked by tone and by one bright thing (cursor or
active slot), not an outlined box. The entry lives in the normal window; no second frame.

**Principles taken for Blip**

1. The limit is visible: a slot per letter when names are short, a count when they are not.
2. One bright thing marks "you are here"; everything else is quiet. No second cue.
3. No window inside a window: the field is a tone or a line in the existing window.
4. A row of underscores at 3:1 against the window can be the field's edge for contrast.
5. Pre-fill a sensible default and let Enter accept it.
6. Confirm and cancel are stops in the same navigation; after an action the cursor lands where the next action is.
7. Typed entry is the keyboard and phone path; it should show the same slots a grid would.
8. Errors and focus use hue plus place, not tone alone: a red line, a gold active slot.

## 2. Where does a field's label go?

**Web evidence.** Penzo's 2006 eye-tracking study: labels above the field read fastest,
right-aligned labels left of the field slower, left-aligned slowest
([UXMatters](https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php),
[Wufoo](https://wufoo.com/blog/label-placement-above-is-faster-than-side)). Wroblewski's caveat in
the same thread: that holds mainly for short, fully required forms; a left column is better for
scanning a long or unfamiliar form and for finding one field to edit again. Jarrett: top labels
suit small screens and translation. Baymard, mobile: labels above by default, left labels fine in
landscape on short forms ([Baymard](https://baymard.com/blog/mobile-form-usability-label-position)).
A Napier University study contradicted Wroblewski: right-aligned fastest, left-aligned never
([Napier](https://napier-repository.worktribe.com/OutputFile/232503)). Read together: above on
phones and short forms; a left column is defensible for a settings-style list.

**Era games [memory, no source found].** Option and config screens listed rows as a label on the
left and the value or control in a second column, so labels and values line up. Name entry was the
exception: a prompt above or before one line.

**What Blip did at the time.** `Switch`, `Readout` and `TextField` shared the label column from
`Content`; `Picker`, `Meter` and `Button` did not. `TextField` alone had a small muted stacked
label. On the tall stage the column variable is unset, so rows stack with ragged edges.

**Underline plus fill, checked against WCAG 2.2** (window colour `#131829`):

| Variant                      | 1.4.11 boundary   | 1.4.3 text on fill     | 1.4.11 focus indicator                     | 2.4.13 (AAA)                    |
| ---------------------------- | ----------------- | ---------------------- | ------------------------------------------ | ------------------------------- |
| ink fill, dim underline      | 3.35 / 3.05, pass | 12.7, muted 6.35, pass | gold vs fill 11.55, vs rest underline 3.44 | change 3.44 pass; area pass     |
| lifted fill, muted underline | 4.54 / 5.78, pass | 9.08, muted 4.54, pass | gold vs rest underline only 1.82           | fails (contrast change below 3) |
| ink fill with slots          | underscores, 3.35 | 12.7, muted 6.35, pass | active slot gold vs rest slot 3.44         | fails area (one slot changes)   |

The placeholder colour `--bui-dim` is 3.35 on ink and does not meet 1.4.3; `--bui-muted` does.
1.4.11 reads "state indicator vs adjacent colours" and is met everywhere; 2.4.13 is the stricter
"change of contrast between focused and unfocused" and is the one the lifted fill fails.

## 3. A labelled list among labelled controls: menu or select?

**How games labelled lists [src, thin].** The Tales of Phantasia manual shows an SNES RPG shop:
item name and description at the bottom, OWNED and TOTAL labels, gold at the top right, quantity
stepped with left and right; the list is unlabelled and the numbers around it carry labels
([manual](https://shrines.rpgclassics.com/snes/top/manual.shtml)). Breath of Fire's settings screen
is the cautionary case: rows of values with no explanation and a cursor floating in space
([TechCrunch](https://techcrunch.com/2016/05/28/what-ux-designers-can-learn-from-1990s-japanese-video-games/)).
Sierra AGI listed inventory as text prefaced by a line such as "You are carrying:"
([GamePressure](https://gamepressure.com/kingsquest/game-interface/z77a9f), a search result only).
A pixel-UI critique notes that window titles are a medium font and other text smaller, and that
buttons, labels, numbers and headings sharing one weight make the hierarchy unclear
([itch.io post](https://itch.io/post/16225455)).

**[memory]** SNES RPG main menus: a command list in a window of its own, usually untitled; a
window title or a header cell names a sub-list; a shop is a command window, a wares window with
price and owned in columns, and a gold window. Labels sit in headers or titles, not in a label
column. Adventure games: save and load are a titled window with a list and buttons; the save
dialog is the only place a list meets a text field, by making the selected slot's line editable.

**ARIA, the web side** ([menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/),
[listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/),
[radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/),
[spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)): a menu is for actions and
commands; a listbox is a form-like choice from options; a radio group is one Tab stop with arrows
that select; a spinbutton is Up and Down on a number, with no Left and Right.

**Blip's model then.** `Picker` was both a command menu (Start, Back) and a choice list (slots,
wares, settings), its `label` only for screen readers. A window mixing a `Picker` with `Switch` or
`TextField` ran two keyboard models at once, the key layer's cursor and DOM focus, so Left and
Right meant "step the row" on one control and "flip" on another. On/Off had two homes:
`setting.mdx` said `PickerSetting`, `switch.mdx` said a `Switch` outside a `Picker`. Nothing
outside a `Picker` could step a value.

**Finding.** Treat `Picker` as a menu. A window is a menu or a form; in a menu the window's title
names the list, as every SNES list window did, so it needs no label.

## 4. Keep `Switch`, or a stepper for On/Off?

**Era games [src].** Option screens were rows of words you step between, two values or seven:
Final Fantasy VII's Config (Sound Mono/Stereo, Cursor Initial/Memory), Chrono Trigger's
single-column options menu, Final Fantasy IV and Tactics Ogre Mono/Stereo/Wide
([FFVII](https://finalfantasy.fandom.com/wiki/File:FFVII_Quit.png),
[TCRF](<https://tcrf.net/Proto:Chrono_Trigger_(SNES)/Gameplay_Differences>),
[AtariAge](https://forums.atariage.com/topic/333335-final-fantasy-iv-surround-sound/)).
**[memory]** Modern pixel games mostly do the same (Celeste steps ON/OFF with left and right); the
toggle-switch graphic is a touch-app idiom few pixel games copy.

**Design systems and ARIA [src].** NN/g: a toggle switch is one binary option with immediate
effect; both states must show; implement it the same way everywhere and do not mix it with other
controls for the same binary choice
([NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/)). ARIA `switch`:
`role="switch"` with `aria-checked`, Space toggles, the label must not change with state
([APG](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)). A two-value stepper has no native
pattern, but one that only ever has two values and acts at once is, to a screen reader, still a
switch: it can be `role="switch"` while looking like `Music < On >`.

**What a two-value stepper must do to cover `Switch`:** flip on a tap anywhere on the row, Enter,
Space, Left and Right; be a Tab stop with a focus ring; `role="switch"` and `aria-checked` with a
stable name; announce the change; play the move sound; a 44 px row on touch; carry a form `name`.
That is `Switch`'s code with a different drawing. A thumb position is readable at a glance and the
arrows say "this changes" without saying which way is on; that is what is lost.

**Finding.** One control for every choice in a form (On/Off, Normal/Hard, Slow/Fast), one idiom
with `PickerSetting` in menus, nothing for an agent to choose between.

## 5. Up and Down between form rows, and Tab

**Game engines [src].**

- Unity: a Selectable's navigation has modes None, Horizontal, Vertical, Automatic (from layout)
  and Explicit; arrows or the d-pad move focus to the neighbour. A control that uses a direction
  itself (a vertical slider uses Up and Down) cannot be left with that direction
  ([Unity manual](https://docs.unity3d.com/Packages/com.unity.ugui@1.0/manual/script-SelectableNavigation.html)).
- Godot: focus is the model; `ui_up`, `ui_down` and so on move it, with per-direction
  `focus_neighbor` settings, else Godot guesses; Next and Previous (Tab) are a separate, secondary
  path; a game must `grab_focus()` something first
  ([Godot docs](https://docs.godotengine.org/en/stable/tutorials/ui/gui_navigation.html)).
- Xbox Accessibility Guideline 112: menus navigable by analog or digital input, fully by keyboard
  and controller digital input alone; focus order logical and tied to the layout; linear menus
  loop at the ends, grids do not; prompts consistent on every screen; if focus can move to a
  control it can move away with the same input
  ([XAG 112](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112)).
- Unreal UMG **[memory, not read for this research]**: navigation rules per widget (Up, Down,
  Left, Right, Next, Previous; Explicit, Wrap, Stop, Custom) with Tab as Next, the same model as
  Unity and Godot. The page to read:
  [Widget navigation](https://dev.epicgames.com/documentation/en-us/unreal-engine/widget-navigation-in-unreal-engine).
- Era games **[memory]**: one d-pad, every screen had a cursor, config rows walked with Up and
  Down, values stepped with Left and Right, A confirmed, B backed out. No Tab existed.

For a game, directional focus movement is the primary model and Tab is the keyboard convenience.

**Browser games.** The Gamepad API only reports button state (standard mapping: d-pad is buttons
12 to 15, A is 0, B is 1); it does not move focus or scroll, so a game polls it and turns presses
into its own moves
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)). The
W3C CSS Spatial Navigation draft moves focus between focusable elements by arrows or d-pad by
position, as a complement to Tab, with little implementation
([W3C draft](https://www.w3.org/TR/css-nav-1/)). **[memory]** Canvas engines (Phaser, Pixi) keep
their own cursor index and are usually invisible to screen readers; Unity and Godot web exports are
one canvas with internal focus; DOM-based game UIs like Blip have real focus, which is what lets
Tab and screen readers work.

**What Blip must keep.** WCAG 2.1.1 (all by keyboard), 2.1.2 (no trap), 2.4.3 (meaningful focus
order) and 2.4.7 (focus visible) are met if Tab keeps visiting every control in reading order and
the arrows are an addition. The ARIA keyboard practice says Tab moves between components and
arrows move inside a composite; a form is a set of separate controls, so it takes no roving
tabindex ([APG keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
Arrows moving between independent controls are not an APG pattern but break none: each control
stays a Tab stop and the arrows act only where the control does not need them.

**The mock's model** (a Window scopes it; rows are found by position; Tab untouched):

| Control              | Up/Down            | Left/Right             | Enter       | Space         | Esc              | Tab           |
| -------------------- | ------------------ | ---------------------- | ----------- | ------------- | ---------------- | ------------- |
| TextField            | row above or below | caret                  | submit      | types a space | leaves the field | next control  |
| Stepper, two values  | row                | flips                  | flips       | flips         | window's back    | next          |
| Stepper, many values | row                | steps and wraps        | steps right | steps right   | window's back    | next          |
| Button               | row                | next button in the row | presses     | presses       | window's back    | next          |
| Readout, Meter       | skipped            |                        |             |               |                  | not focusable |

Up from the first row goes to the last and Down from the last to the first (XAG 112 for linear
menus). **Tested in Playwright against the mock:** Down from no focus visits each row and wraps;
Tab visits every control in order and leaves the window (no trap); Left in the field moves the
caret without leaving; Esc blurs and the next Down re-enters; a stepper changes with Left and
Right while focus stays; no page errors. **Known quirk:** going down onto a row of buttons lands on
the one nearest the left edge of the control above. To ship it the key layer needs the stepper as
`row` (a `slider` is `both` today and would take Up and Down).

## 6. Gaps found while building the patterns

1. A standalone, focusable stepper (`Setting` is display-only).
2. A visible name for a list: the rule that a menu window's title is its label.
3. Column headers or a columned row for lists with a second value (a shop's price, a slot's day).
4. Windows side by side on the wide stage (a hand-made flex row today; `Screen` only has a column).
5. `Content` has no row gap of its own; every pattern writes `grid gap-[calc(var(--bui-px)*4)]`.
6. A legend that follows the controls; each screen composes it by hand, including mixed Tab and arrows.
7. A "2 of 5" position for a list (`Readout` with a max shows 3/3 without words).
8. The `divider` component, to group rows inside a window.
9. Back is a `PickerItem` in a menu and a `Button` elsewhere, with no rule for which.
10. At the minimum desktop scale (2.25x) a pattern is 180 stage pixels high: an options screen fits three rows plus a list.

Also found: focus looks are mixed (an orange outline on some controls, gold on others), and a
`Picker` anywhere on a page takes Up and Down globally, so other menus on the same page (a docs
page with several stories) cannot be used.

## Decisions taken (2026-11-22)

1. A window is a **menu** (`Picker`: actions and navigation; the window's title names the list) or a **form** (separate controls). No `Picker` in a form window; a list beside a form gets its own window or step.
2. `Switch` is dropped. The standalone stepper is the one choice control in forms, On/Off included. `PickerSetting` stays for menus.
3. Form keyboard model for all form controls: Up and Down move between rows (wrap at the ends), Left and Right change the value (Space and Enter also flip a two-valued one), Enter submits or presses, Esc leaves a field or goes back. Tab is unchanged for browser and screen-reader users. A many-valued stepper is a slider taking Left and Right only. Landing on the nearest button when moving down onto a button row is accepted for now.
4. A `Field` component owns placement (label column on wide through `Content`'s `--bui-label-width`, stacked on tall), label, description, error and the characters-left count; its child renders the control. All form controls' labels go through it.
5. Patterns are named for the pattern, not the screen they were mocked as.
6. The gaps above are closed, as tasks. Gamepad support is not now; it is recorded as a later question (Q18 in [`open-questions.md`](../open-questions.md)).
