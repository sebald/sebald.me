# TimeLogo fallback plan — option (b') preserved-weights redistribution

This document exists so that if the current `logo-time.tsx` implementation
(approach **(a')**: rotate the existing dither SVG) ever looks wrong, the
alternative approach **(b')** is fully specified and ready to implement
without re-running the design conversation.

---

## Current approach — (a') rotate the SVG

`logo-time.tsx` takes the hardcoded `DITHER_PATHS` from `logo-dither.ts` and
wraps them in a `<g transform="rotate(θ 16 16)">`, where `θ = (hour % 12) * 30°`.
Palette colors swap based on the 24-hour clock (mist → dawn → noon → sunset).
The clipPath circle stays stationary in the parent coordinate system; since a
circle is rotation-invariant, the crop stays clean at every angle.

**Why this is cheap:** zero recomputation. The pixel data is the same array
of paths at every hour — only the `transform` attribute changes.

**Why this might go wrong:** at non-orthogonal angles (30°, 60°, 120°, 150°,
210°, 240°, 300°, 330°) the 1×1 pixel paths are rotated off the screen's
pixel grid. With `shape-rendering="crispEdges"` the rotated squares stay
hard-edged but no longer axis-align — so each "pixel" gets rasterized with
slight width/height jitter compared to a clean 0°/90°/180°/270° frame. At
32px display size this is mostly sub-pixel noise and reads as a charming
crunchy quirk that fits the site's existing glitch aesthetic. At larger
display sizes (64px+, or high-zoom/retina contexts with specific DPR math),
the jitter can become visible as "that logo looks broken at 2pm."

If that happens — or if we just want every hour to render as a perfectly
axis-aligned pixel grid — switch to (b').

---

## Fallback approach — (b') preserved-weights redistribution

**Core idea:** keep the dither pattern **axis-aligned at every hour** (zero
rotation, so no aliasing), but **recompute which pixels sit in which palette
bucket** based on the current hour's gradient direction. Preserve the exact
_tonal balance_ (pixel counts per bucket) of the original logo — so the logo
always has the same "weight" and contrast profile it does today, just with
the dark/mid/light/bg pixels rearranged to flow in a different direction.

This matches the user's stated goal: "since it's a logo it should have some
resemblance." The resemblance is statistical (same counts, same density)
rather than literal (same exact pixel positions). The pattern morphs between
hours but never loses the feel of the original palette distribution.

### Inputs

1. `DITHER_PATHS` from `src/ui/logo-dither.ts` — three entries for dark, mid,
   light inks, each a string of `M{x} {y}h1v1h-1` path commands. All pixels
   in the 32×32 grid not covered by these three paths are implicit `bg`.
2. `hour: number` — fractional hour in [0, 24), driving both palette
   selection and gradient angle.

### Step 1: extract fixed pixel counts per bucket (one-time setup)

Parse each path's `d` string and count the `M{x} {y}` occurrences. That
gives:

- `N_dark` — pixel count of `DITHER_PATHS[0]`
- `N_mid` — pixel count of `DITHER_PATHS[1]`
- `N_light` — pixel count of `DITHER_PATHS[2]`
- `N_bg = 1024 - N_dark - N_mid - N_light`

These are invariant — compute them once at module load (or bake them in as
constants alongside `DITHER_PATHS`).

A parser helper:

```ts
const countPixels = (d: string): number =>
  (d.match(/M\d+\s+\d+/g) ?? []).length;

const N_DARK = countPixels(DITHER_PATHS[0].d);
const N_MID = countPixels(DITHER_PATHS[1].d);
const N_LIGHT = countPixels(DITHER_PATHS[2].d);
const N_BG = DITHER_GRID * DITHER_GRID - N_DARK - N_MID - N_LIGHT;
```

### Step 2: project every pixel onto the gradient axis at the current angle

For each pixel at integer `(x, y)` with `x, y ∈ [0, DITHER_GRID)`:

1. Translate to center: `u = x + 0.5 - center`, `v = y + 0.5 - center`
   (where `center = DITHER_GRID / 2 = 16`).
2. Project onto the gradient axis oriented so that angle 0° means "light at
   top, dark at bottom":
   ```ts
   const θ = (angle * Math.PI) / 180;
   const g = u * Math.sin(θ) + v * Math.cos(θ);
   ```
   Higher `g` = darker side; lower `g` = lighter side. (Verify sign against
   the 12 o'clock reference frame — if the result looks upside-down, negate.)
3. Break ties consistently so pixels with identical `g` (common on symmetric
   grids) resolve in a stable order across angles. A deterministic
   perturbation based on `(x, y)` works:
   ```ts
   const tiebreak = (x * 73856093) ^ (y * 19349663);
   const gWithTiebreak = g + (tiebreak & 0xffff) * 1e-9;
   ```
   Without this, tiny floating-point differences between angles can shuffle
   the pattern in ways that flicker visibly between hours.

### Step 3: rank pixels, assign buckets

Sort all 1024 pixels by `g` ascending (lightest end first). Walk the sorted
array and assign buckets by cumulative count:

| Sorted index range       | Bucket  |
| ------------------------ | ------- |
| `[0, N_bg)`              | `bg`    |
| `[N_bg, N_bg + N_light)` | `light` |
| `[…, … + N_mid)`         | `mid`   |
| `[…, 1024)`              | `dark`  |

This preserves exact weights: after redistribution, there are still `N_dark`
dark pixels, `N_mid` mid pixels, etc. — just at different positions.

### Step 4: emit SVG paths

Group pixels by bucket. For each of the three ink buckets, build a path string:

```ts
const makePath = (pixels: Array<[number, number]>) =>
  pixels.map(([x, y]) => `M${x} ${y}h1v1h-1`).join('');
```

Render as three `<path>` elements in the same order as the original
`DITHER_PATHS` (dark, mid, light). Background stays as a single filled rect
the size of the grid, since it's uniformly covered by the bg color and then
clipped by the circle.

### Step 5: memoize

The sort dominates cost (O(n log n) over 1024 items, ~0.5–1 ms). Memoize on
the integer hour (30° angle buckets) so the redistribution fires at most
once per hour change:

```ts
const angleBucket = Math.floor(hour) % 12;
const paths = useMemo(() => buildPaths(angleBucket), [angleBucket]);
```

Minutes still drive palette transitions (via CSS color transitions on
`fill`) but don't re-sort. If sub-hourly redistribution is ever wanted, key
on finer buckets — but expect visible pixel flips each tick, which is likely
distracting.

---

## Integration

The public API of `TimeLogo` (`hour`, `size`, `className`) does not change.
Palette selection, angle math, Berlin time resolution, hour ticking, and
fill-transition CSS all stay identical. The only swap is the render body:

```tsx
// (a') — current
<g transform={`rotate(${angle} ${center} ${center})`}>
  <path fill={palette.bg} d={BG_PATH} />
  {DITHER_PATHS.map((p, i) => (
    <path key={i} fill={palette[INK_ORDER[i]]} d={p.d} />
  ))}
</g>

// (b') — fallback
<g>
  <path fill={palette.bg} d={BG_PATH} />
  {paths.map((d, i) => (
    <path key={i} fill={palette[INK_ORDER[i]]} d={d} />
  ))}
</g>
```

Everything else — the clipPath, the SVG attributes, the component shape,
the `useEffect` tick, the palette lookup — is unaffected.

---

## Tradeoff recap

| Aspect             | (a') rotate SVG          | (b') redistribute pixels |
| ------------------ | ------------------------ | ------------------------ |
| Code size          | ~5 extra lines           | ~40–60 lines             |
| Pixel alignment    | Rotated, sub-px aliasing | Axis-aligned, crisp      |
| Pattern character  | Literally same shape     | Morphs per hour          |
| Tonal balance      | Identical                | Identical                |
| Compute per tick   | 0                        | O(n log n), ~1 ms/hour   |
| Aesthetic at 32px  | Charming, crunchy        | Clean, precise           |
| Aesthetic at 64px+ | Noticeably jittery       | Clean, precise           |

## When to switch

Switch to (b') if any of the following becomes true:

- The logo is used at a size ≥ 64px where rotation aliasing reads as a bug.
- A/B reviewer feedback consistently describes the logo as "broken" or
  "pixelated in a bad way" at off-hours.
- Design wants perfectly crisp pixel edges at every hour for brand polish.
- Print/static snapshots of the logo are needed at non-orthogonal hours and
  the rasterization looks wrong.

If (a') holds up in practice, this file stays a reference and nothing
changes.
