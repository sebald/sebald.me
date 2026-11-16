# Where game and web conventions disagree

Each conflict has the game source, the web source, and what Blip does today
(with `path:line`, paths from `packages/blip-ui/src`) or "undecided". This is
split in two: `research-game-ui` wrote 1 to 9 from the game sources outward,
`research-web-ux` completed them from the web side and added 10 to 16. Blip
today was read from the code on 2026-11-16, not tried in a browser, unless an
entry says so. A candidate marked `[open]` waits on the conflict that names it.

## 1. A list that wraps, a list that stops

- **Game:** a menu you can move up and down in goes from the last item back to
  the first, and the other way
  ([XAG 112](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112)).
  A grid does not wrap.
- **Web:** a listbox stops at its ends
  ([APG listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)); a menu
  may wrap ("optionally wrapping",
  [APG menu and menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)).
- **Blip today:** the Picker wraps (`components/picker/picker.mdx:89`,
  `components/picker/picker.tsx:240`). A Setting wraps a choice and stops a
  range (`components/setting/setting.mdx:30-35`). A grid has no component, so
  `P-GRID-101` is `[open]`.

## 2. A disabled item you can still reach

- **Game:** keep what isn't available in the list and say why
  ([XAG 103](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103):
  greying needs a second signal).
- **Web:** a `disabled` HTML control leaves the tab order; inside a composite
  widget an item can stay focusable with `aria-disabled`
  ([APG, focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- **Blip today:** the composite-widget reading. A disabled row stays reachable,
  bumps when picked and carries a note
  (`components/picker/picker.mdx:57`, `:73-74`, `:103`). A disabled `Button`
  is a native one and leaves the tab order (`components/button/button.tsx:49`); its page asks for the reason next to it
  (`components/button/button.mdx:66-67`).

## 3. How faint "disabled" may be

- **Game:** text on an inactive element needs at least 3:1 against its
  background
  ([XAG 102](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102)).
- **Web:** inactive components are exempt from text contrast
  ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **Blip today:** undecided. `bui-disabled` is `opacity: 0.4` and
  `saturate(0)` (`styles.css:21-24`); its contrast against a window's fill
  has not been measured. `F-COLOUR-102` is `[open]` until it is. A
  `ruledOut` item is not disabled, so WCAG 1.4.3 applies to it in full, yet it
  fades to 25% (`components/picker/picker.tsx:414`); `F-COLOUR-201` holds text
  the player can still pick to 4.5:1.

## 4. A call that blinks for ever

- **Game:** "Press start" blinks until the player presses; a full meter blinks
  to be used. XAG asks for a way to stop blinking content beside text
  ([XAG 117](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117)).
- **Web:** anything that blinks for more than five seconds beside other content
  can be paused, stopped or hidden
  ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).
- **Blip today:** a call and a meter's `blink` stop only under reduced motion
  (`components/text/text.mdx:43-45`, `components/meter/meter.mdx:40-42`), and
  so does an accent item (`components/picker/picker.tsx:417-419`); there is no
  setting in the game. Undecided whether reduced motion is enough. WCAG exempts
  blinking that is "part of an activity where it is essential"; a "press
  start" call is not, so `F-MOTION-201` is `[open]`. One call per screen is
  Blip's own call (`components/text/text.mdx:32`), so `F-MOTION-102` is
  `[open]`.

## 5. Keys by character or by place

- **Game:** WASD is a place on the keyboard; on AZERTY it is ZQSD. Games bind
  by physical key
  ([MDN, KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code))
  or let the player remap
  ([GAG](https://gameaccessibilityguidelines.com/allow-controls-to-be-remapped-reconfigured/)).
- **Web:** shortcuts bind by the character a key types (`event.key`), so they
  follow the layout. A shortcut of a single letter must also be one the user
  can turn off or remap, or work only while its part has the focus, because
  speech input types letters
  ([WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)).
- **Blip today:** by character: `useKeys` takes handlers by `event.key`
  (`hooks.mdx:14`), and the Picker binds W and S beside the arrows
  (`components/picker/picker.mdx:89`). On AZERTY, W and S are not above each
  other; the arrows still work. `P-INPUT-102` asks for the arrows beside every
  letter binding; remapping is a gap (`P-INPUT-105`, `[open]`). The kit hears
  keys on `window` whatever has the focus (`hooks/key-layer.ts:116`), so W and
  S fail 2.1.4 until they can be turned off or remapped (`A-INPUT-201`,
  `[open]`).

## 6. Text that grows

- **Game:** the player can make text larger, up to 200%, without scaling the
  rest
  ([XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101),
  [GAG](https://gameaccessibilityguidelines.com/allow-the-font-size-to-be-adjusted/)).
- **Web:** text resizes to 200% with the browser's zoom
  ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)).
- **Blip today:** undecided. The stage sizes its text from its scale and fits
  itself to the window (`components/stage/stage.mdx:25-39`),
  so the text and the art grow together, and only with the window. What
  browser zoom does to it has not been checked. `F-TEXT-103` is `[open]`.
  From the code, zoom makes the window narrower in CSS pixels and the stage
  refits, so the text would keep its size on screen (not tried). WCAG asks for
  text resized "without assistive technology", not for zoom as such, so the
  setting `F-TEXT-103` asks for would meet it too.

## 7. Time limits

- **Game:** a timer can be the challenge itself; a time limit in the UI that
  isn't the game's challenge can be turned off or lengthened
  ([XAG 116](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/116),
  [GAG](https://gameaccessibilityguidelines.com/do-not-make-precise-timing-essential-to-gameplay-offer-alternatives-actions-that-can-be-carried-out-while-paused-or-a-skip-mechanism/)).
- **Web:** every time limit can be turned off, adjusted or extended, unless it
  is essential
  ([WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)).
- **Blip today:** the Timer is controlled; the game owns the clock and its
  pause (`components/timer/timer.mdx:44-47`). Whether a game must offer a
  slower clock is undecided (`C-TIMER-101`).

## 8. Where the cursor shows

- **Game:** the focused item is always visibly marked, and focus never sits on
  an invisible element
  ([XAG 113](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/113)).
- **Web:** the keyboard focus indicator must be visible; showing one for the
  pointer is optional ("may consider",
  [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)),
  and `:focus-visible` hides the ring after a mouse click
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)).
- **Blip today:** both: the Picker's cursor shows for keys and the pointer,
  not under a finger, where only a row with a note is marked
  (`components/picker/picker.mdx:93`); the focus ring is `:focus-visible`
  (`components/picker/picker.mdx:105`).

## 9. Capitals

- **Game:** titles and calls in a pixel font are often all capitals; XAG asks
  that lines of text can be shown in sentence case, and exempts a one- or
  two-word label
  ([XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101),
  Text case and alignment).
- **Web:** capitals are styling; the text underneath stays as written.
- **Blip today:** BitmapText upper-cases and is `aria-hidden`; the words are
  given again in text (`components/bitmap-text/bitmap-text.mdx:27`,
  `:85`). Running text is never BitmapText. `F-TEXT-102` asks for
  sentence case in running text; a short label may stay in capitals.

## 10. A cursor, or the focus

- **Game:** one cursor per screen, moved by the arrows or the D-pad whatever
  the input, and always visible
  ([XAG 113](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/113)).
- **Web:** the keys go to the element with the focus; a composite widget moves
  the focus itself (roving `tabindex`) or points at its active item
  (`aria-activedescendant`), so a screen reader follows it
  ([APG, keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- **Blip today:** a cursor. The kit hears keys on `window` whatever has the
  focus (`hooks/key-layer.ts:116`); the current row is `aria-current` on a
  button that never gets the focus (`components/picker/picker.tsx:403`), and
  every row is a Tab stop of its own. As the code reads, moving the cursor
  tells a screen reader only the note (`components/picker/picker.tsx:384-387`),
  and Tab moves a second marker through the same rows. Not tried with a screen
  reader. Undecided.

## 11. The pointer moves the cursor

- **Game:** the pointer over an item moves the cursor to it, so the mouse and
  the keys share one cursor
  ([XAG 112](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112):
  the input that moved the focus can move it away).
- **Web:** hover changes the hover style only. Content that hover or focus
  shows can be dismissed without moving, unless it covers nothing
  ([WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)).
- **Blip today:** the pointer moves the cursor
  (`components/picker/picker.tsx:405`, `components/picker/picker.mdx:92`), and
  the note opens with it (`components/picker/picker.tsx:382`), reaching a
  little over the window's frame (`components/picker/picker.tsx:56`). Escape
  leaves the screen, not the note. `A-PICKER-201` is `[open]`.

## 12. One way to hold the phone

- **Game:** a game may be locked to one orientation, "a landscape-only game",
  as long as it resizes well within it
  ([Apple HIG, layout](https://developer.apple.com/design/human-interface-guidelines/layout)).
- **Web:** content works in both orientations unless one is essential
  ([WCAG 1.3.4](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)).
- **Blip today:** a phone on its side shows `turned`, the ask to turn it, if
  the game gives one (`components/stage/stage.mdx:38`, `:66-67`); upright is
  the tall stage. Whether one way is essential for a game on Blip is
  undecided. `A-STAGE-202` is `[open]`.

## 13. A refusal by sound

- **Game:** picking what is off plays a bump and the cursor stays. The
  guidelines ask that nothing essential is said by sound alone
  ([GAG](https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-sounds-alone/)).
- **Web:** an error is identified and described in text
  ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)).
- **Blip today:** a disabled item bumps
  (`components/picker/picker.tsx:162-165`); the reason is its `note`, asked for
  in the prop's doc but optional (`components/picker/picker.tsx:317-326`).
  Whether a disabled item without a note is allowed is undecided;
  `P-FEEDBACK-201` asks for the reason in text.

## 14. Ask first, or undo

- **Game:** a game asks before progress is lost, and seldom offers undo
  ([That Game's UX: accidentally quitting mid-round](https://thatgamesux.com/super-stickman-golf-accidentally-quitting-mid-round)).
- **Web:** ask before serious consequences, never before routine actions, and
  offer undo where possible
  ([NN/g, confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/)).
- **Blip today:** ask first. `Confirm` is for what cannot be undone
  (`components/confirm/confirm.tsx:27-31`); a destructive Button says "Ask
  first" (`components/button/button.mdx:29`). There is no undo pattern. The
  safe option is labelled Cancel by default (`components/confirm/confirm.tsx:37`),
  where NN/g asks for a label that says what it keeps; `T-CONFIRM-203` is
  `[open]`.

## 15. Where the focus goes when a dialog opens

- **Game:** the cursor starts on the safe answer
  ([XAG 112](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112),
  predictable focus).
- **Web:** the focus goes to the first focusable element, or to the least
  destructive action before something that is hard to undo
  ([APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).
- **Blip today:** the focus goes to the window, not a button
  (`components/dialog/dialog.tsx:105-107`), and the cursor to the safe answer
  (`components/confirm/confirm.tsx:53`). Both agree on the safe answer; which
  element has the focus is conflict 10.

## 16. Music that plays by itself

- **Game:** the title has music from the start; music and effects each have a
  volume in the options
  ([GAG](https://gameaccessibilityguidelines.com/provide-separate-volume-controls-or-mutes-for-effects-speech-and-background-music/)).
- **Web:** audio that plays by itself for more than three seconds can be
  paused, or turned down apart from the system's volume
  ([WCAG 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)).
- **Blip today:** undecided; the game decides what plays (`hooks.mdx:32`).
  `P-OPTIONS-102` (a volume each) meets 1.4.2 once the options are reachable
  while the music plays.

## Settled: both sides agree

- **Reflow.** WCAG 1.4.10 exempts content that needs a two-dimensional layout
  and names games among its examples
  ([Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)),
  so a stage wider than a small window (`components/stage/stage.mdx:39`) does
  not fail it.
- **Target size.** 44 CSS pixels for touch (`introduction.mdx:26-27`), as
  [WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
  and
  [GAG](https://gameaccessibilityguidelines.com/ensure-interactive-elements-virtual-controls-are-large-and-well-spaced-particularly-on-small-or-touch-screens/)
  ask.
- **Text that types itself.** A press skips it, reduced motion shows it whole,
  and menus never type (`components/typewriter/typewriter.mdx:29-33`), as
  [XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
  asks.
