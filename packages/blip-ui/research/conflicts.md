# Where game and web conventions disagree

Each conflict has the game source, the web source, and what Blip does today
(with `path:line`, paths from `packages/blip-ui/src`) or "undecided". This is
the game half, written by `research-game-ui`, from the game sources outward;
`research-web-ux` completes it from the web side and may add conflicts of its
own.

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
  is a native one and leaves the tab order (`components/button/button.mdx`,
  Accessibility).

## 3. How faint "disabled" may be

- **Game:** text on an inactive element needs at least 3:1 against its
  background
  ([XAG 102](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102)).
- **Web:** inactive components are exempt from text contrast
  ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **Blip today:** undecided. `bui-disabled` is `opacity: 0.4` and
  `saturate(0)` (`styles.css:21-24`); its contrast against a window's fill
  has not been measured. `F-COLOUR-102` is `[open]` until it is.

## 4. A call that blinks for ever

- **Game:** "Press start" blinks until the player presses; a full meter blinks
  to be used. XAG asks for a way to stop blinking content beside text
  ([XAG 117](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117)).
- **Web:** anything that blinks for more than five seconds beside other content
  can be paused, stopped or hidden
  ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).
- **Blip today:** a call and a meter's `blink` stop only under reduced motion
  (`components/text/text.mdx:43-45`, `components/meter/meter.mdx:40-42`);
  there is no setting in the game. Undecided whether reduced motion is enough.
  One call per screen is Blip's own call (`components/text/text.mdx:32`), so
  `F-MOTION-102` is `[open]`.

## 5. Keys by character or by place

- **Game:** WASD is a place on the keyboard; on AZERTY it is ZQSD. Games bind
  by physical key
  ([MDN, KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code))
  or let the player remap
  ([GAG](https://gameaccessibilityguidelines.com/allow-controls-to-be-remapped-reconfigured/)).
- **Web:** shortcuts bind by the character a key types (`event.key`), so they
  follow the layout.
- **Blip today:** by character: `useKeys` takes handlers by `event.key`
  (`hooks.mdx:14`), and the Picker binds W and S beside the arrows
  (`components/picker/picker.mdx:89`). On AZERTY, W and S are not above each
  other; the arrows still work. `P-INPUT-102` asks for the arrows beside every
  letter binding; remapping is a gap (`P-INPUT-105`, `[open]`).

## 6. Text that grows

- **Game:** the player can make text larger, up to 200%, without scaling the
  rest
  ([XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101),
  [GAG](https://gameaccessibilityguidelines.com/allow-the-font-size-to-be-adjusted/)).
- **Web:** text resizes to 200% with the browser's zoom
  ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)).
- **Blip today:** undecided. The stage sizes its text from its scale and fits
  itself to the window (`components/stage/stage.mdx`, Fitting the viewport),
  so the text and the art grow together, and only with the window. What
  browser zoom does to it has not been checked. `F-TEXT-103` is `[open]`.

## 7. Time limits

- **Game:** a timer can be the challenge itself; a time limit in the UI that
  isn't the game's challenge can be turned off or lengthened
  ([XAG 116](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/116),
  [GAG](https://gameaccessibilityguidelines.com/do-not-make-precise-timing-essential-to-gameplay-offer-alternatives-actions-that-can-be-carried-out-while-paused-or-a-skip-mechanism/)).
- **Web:** every time limit can be turned off, adjusted or extended, unless it
  is essential
  ([WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)).
- **Blip today:** the Timer is controlled; the game owns the clock and its
  pause (`components/timer/timer.mdx`, Usage). Whether a game must offer a
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
  given again in text (`components/bitmap-text/bitmap-text.mdx`, Letters and
  Accessibility). Running text is never BitmapText. `F-TEXT-102` asks for
  sentence case in running text; a short label may stay in capitals.
