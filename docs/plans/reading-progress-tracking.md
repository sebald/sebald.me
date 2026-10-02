# Plan: Track whether people actually read my articles (Vercel Web Analytics)

## Goal

Find out whether visitors actually read my notes, not just open them, and which notes they read. Send scroll milestones (25 / 50 / 75 / 100 %) and a "read" event per note as Vercel Web Analytics custom events. In the dashboard I want to:

- compare one note's milestones against its page views (filter by page)
- see all notes in one list (filter `milestone = read`, break down by `note`)

Vercel Web Analytics has no funnel view, so I do that comparison by hand.

This is also the start of `src/ui/tracking/`: one place for components that watch user behavior and send events.

## Milestones and what they mean

| `milestone`         | Sent when                                                                               | Meaning                                                   |
| ------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `25%`, `50%`, `75%` | that point of the article body came into view                                           | how far people get                                        |
| `100%`              | the end of the body came into view                                                      | reached the end, no matter how (jumping there counts too) |
| `read`              | end reached **and** at least half the estimated reading time spent with the tab visible | actually read                                             |

**`100%` − `read` ≈ skimmers.** If many reach the end but few count as "read", the note gets skimmed.

## Context (verified)

- Next.js 16 App Router. The note route is `src/app/(content)/notes/[...slug]/page.tsx`, a server component that renders Fumadocs MDX (`page.data.body`).
- `@vercel/analytics` 2.0.1 is installed and `<Analytics />` is already in `src/app/layout.tsx`. **Nothing to set up.**
- Custom events go through the typed helper `trackEvent` in `src/lib/analytics.ts`. Event names are Title Case (`Copy`, `Outbound Link`). Every event is recorded with its page URL. Pro plan: max 2 properties per event, and custom events already work.
- The only tracking component so far is `src/ui/outbound-link-tracking.tsx` (`OutboundLinkTracking`, mounted in the root layout). Other tracking happens inline through `trackEvent` (`codeblock.tsx`, `action-menu.tsx`).
- The article body is `<Article.Content>` (`src/ui/layout/article.tsx`), a `.prose` div. Header, image and toolbar are outside it. There's no newsletter, comments or related posts.
- The page already computes `minutes = readingTime(...)` on the server (`src/lib/string.utils.ts`: 230 wpm, code blocks excluded).

## Structure: `src/ui/tracking/`

```
src/lib/analytics.ts               ← stays: event types, trackEvent, helpers
src/ui/tracking/
  outbound-link-tracking.tsx       ← moved, export OutboundLinkTracking
  reading-progress-tracking.tsx    ← new, export ReadingProgressTracking
```

- **Naming:** each component is named `<What>Tracking`, with flat named exports.
- **"Tracking", not "analytics":** `lib/analytics.ts` is the core layer (event types, sending). The components only watch behavior and call `trackEvent`.
- **No namespace object (`Tracker.Reading`), for two reasons:**
  - The components aren't parts of one thing, unlike `Article.*`.
  - A server component can't dot into a `'use client'` module, so a namespace would need an extra server-side index.
- **Optional later:** a `src/ui/tracking/index.ts` with plain named re-exports, once there are more components.

## Layout constraint: where the markers go

`.prose` (`src/css/prose.css`) is a 3-column CSS grid that styles its **direct children**:

- `& > *` → `grid-column: 2`
- `& > * + *` → `margin-top` (spacing between blocks)
- `& > img`, `& > figure:has(img)`, `& > [data-breakout]` → full-width breakouts

So **nothing may be added inside `.prose`**:

- A wrapper div inside it would turn all of the MDX into a single grid item. Spacing and breakouts would be gone.
- Markers as direct children would pick up `margin-top` from `& > * + *` and land in the wrong place.

**Solution:** wrap `<Article.Content>` from the outside.

```tsx
<Article aria-labelledby={titleId}>
  <Article.Header>…</Article.Header>
  {page.data.image && <Article.Image src={page.data.image} />}
  <ReadingProgressTracking key={page.url} note={page.url} minutes={minutes}>
    <Article.Content>
      <MDX components={getMDXComponents()} />
    </Article.Content>
  </ReadingProgressTracking>
</Article>
```

- `ReadingProgressTracking` renders `<div className="relative">{children}{markers}</div>`.
- The wrapper becomes the flex item in `<article>` (a flex column, `align-items: stretch`), so it's full width, and `.prose` inside it lays out exactly as before. No selector depends on `<article>`'s direct children.
- The markers are siblings of `.prose`, not children, so prose styles never reach them.
- Markers: `<span aria-hidden data-milestone="25" className="pointer-events-none absolute left-0 size-px" style={{ top: 'calc(25% - 1px)' }} />`.
  - A percentage `top` resolves against the wrapper's height, which equals the prose height.
  - The `- 1px` keeps the 100 % marker inside the box.
  - The `top` stays inline because it's computed per marker.
- Absolutely positioned 1px elements don't take part in layout: no layout shift, nothing visible.
- When the height changes later (images loading, pixel header), the percentages update on their own and IntersectionObserver uses the current positions.
- The markers are rendered in JSX, not inserted by hand into the DOM, so there are no hydration mismatches.

## Tasks

### 1. Move `OutboundLinkTracking` (own commit)

- `git mv src/ui/outbound-link-tracking.tsx src/ui/tracking/outbound-link-tracking.tsx`.
- Update the import in `src/app/layout.tsx` to `@/ui/tracking/outbound-link-tracking`.
- Pure move, no behavior change.

### 2. Add the event type

In `src/lib/analytics.ts`, extend `AnalyticsEvents`:

```ts
'Read Progress': {
  milestone: '25%' | '50%' | '75%' | '100%' | 'read';
  note: string; // page.url, e.g. "/notes/where-the-map-ends"
};
```

- `note` is technically redundant with the page URL recorded on every event. It's there so the dashboard can break one event down across all notes in a single list.
- It uses the second and last property slot of the Pro plan. Note that in a comment above the type, since the existing comment says properties only carry "what the URL doesn't".

### 3. Create `src/ui/tracking/reading-progress-tracking.tsx`

- `'use client'`, named export `ReadingProgressTracking`, props `{ note: string; minutes: number; children: ReactNode }`.
- Short JSDoc in the style of `OutboundLinkTracking`: what's tracked, the difference between `100%` and `read`, and that it goes _around_ `Article.Content`, never inside it.
- Constants at the top: `MILESTONES = [25, 50, 75, 100]`, `MIN_READ_FACTOR = 0.5`.
- `minReadMs = minutes * 60_000 * MIN_READ_FACTOR`. Use the server-side reading time, not the client's `innerText`, so code blocks stay out and there's no forced layout pass.
- An IntersectionObserver watches `:scope > [data-milestone]` and sends `trackEvent('Read Progress', { milestone, note })` the first time each marker is reached.
- **"read" counts only visible time:**
  - Add up the time the tab is visible, using `visibilitychange` (start on mount if `document.visibilityState === 'visible'`).
  - Send "read" when the 100 % marker has been reached **and** visible time ≥ `minReadMs`.
  - If the end is reached early, start a timer for the remaining visible time. Pause it when the tab is hidden and resume it when it's visible again. A hidden tab never loses "read"; it only delays it.
- Keep a `Set` of sent milestones: each is sent at most once, so at most 5 events per view.
- Cleanup: `observer.disconnect()`, clear the timer, remove the `visibilitychange` listener.
- Reset on navigation via `key={page.url}`, not effect dependencies. The key remounts the component on client-side navigation between notes, so all state (sent set, visible time, timer) starts fresh.
- Optional: put the visible-time logic in a pure helper in `src/lib/` and test it with a Node test (like `analytics.test.ts`).

### 4. Wire it into the note page

- In `src/app/(content)/notes/[...slug]/page.tsx`, import `ReadingProgressTracking` from `@/ui/tracking/reading-progress-tracking` and wrap `<Article.Content>` as shown above (`key={page.url}`, `note={page.url}`, `minutes={minutes}`). The page stays a server component.
- Leave misc pages (`(page)/[...slug]`) untouched.

### 5. Verify

- `pnpm dev`, open a note with **Playwright** (not Chrome). The analytics package logs events to the console in dev.
- Check:
  - outbound-link tracking still works after the move (click an external link, see the event)
  - each milestone fires exactly once while scrolling down, with the right `note`, and scrolling back up fires nothing
  - jumping straight to the end of a long note → `100%`, but no "read"
  - reaching the end early, waiting → "read" fires after the remaining time; with the tab hidden in between, the waiting time is extended
  - navigating client-side to another note → new events with the new `note`
  - the layout is unchanged: compare spacing and breakout images before and after (screenshot or DOM check that `.prose` children are unchanged)
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`.
- The VRT baselines (both notes) must not change. A diff means the wrapper is affecting the layout. VRT runs in CI on the PR anyway; don't trigger it by hand.

## Acceptance criteria

- `Read Progress` events with `milestone` and `note` show up in the Vercel dashboard after deploying.
- Filtering `milestone = read` and breaking down by `note` lists the read count per note.
- `Outbound Link` events still arrive.
- No hydration warnings, no layout shift, no visible change (VRT unchanged).
- Max 5 events per view.

## Out of scope

- Custom dashboards or charts, raw time on page.
- Moving the inline `trackEvent` calls (`codeblock.tsx`, `action-menu.tsx`) into `src/ui/tracking/`. They belong to their interaction and stay where they are.

## Known limits

- On short notes, markers already visible at load fire without any scrolling. Keep that in mind when reading the numbers.
- `Read Progress` uses both property slots, so it can't take another property.
- 5 events per view count against the custom event quota.
