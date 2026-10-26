---
name: pixel-header
description: Write a Gemini image prompt for a note's header illustration in the blog's pixel-art style (1990s point-and-click adventure backgrounds), laid out so a few small details can be animated afterwards, then snap the result to its real pixel grid and build the subtle loop. Use when the user asks for a header image, a Gemini prompt, or pixel art for a note, or types `/pixel-header`.
---

# Pixel-art header

The headers are wide pixel-art scenes in the style of early-90s point-and-click
adventure games. Gemini generates the scene, `scripts/snap.mjs` recovers the
native pixel grid, and a small per-scene script animates two or three details
(steam, flicker, twinkle) into a looping animated WebP.

The target look is the two published headers,
`content/notes/2026-02-16-failing-forward-at-design-systems/original.png` and
`content/notes/2026-05-17-where-the-map-ends/original.png`. Both are about 326
real pixels wide (a clean 10px grid at 3264): chunky pixels, big simple shapes,
detail suggested with a few pixels, 3 to 4 shades per material, muted colours.
Gemini tends to drift towards finer, modern "hi-bit" pixel art with lots of
small detail, which does not match.

## 1. Read the note

Read the note's `index.mdx`: title, description and body. Find the one idea the
note turns on and express it as a place. The note is never illustrated
literally (no laptops, no UI, no meetings). Scenes carry no people: the
explorer belonged to the first two notes and is retired. Settings the reference
set already uses:

| Setting                                      | Carries                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| Ruin, cliff, jungle temple                   | Orientation, the map versus the territory, what is really there |
| Forge, anvils, molten metal, robotic arms    | Craft, building foundations, heavy systems work                 |
| Walled garden, greenhouse, seed stall        | Growth, cultivation, patience, adoption                         |
| Apothecary inside a tree                     | Mixing ingredients, recipes, tokens                             |
| Observation deck, space station, radio tower | Perspective, signals, monitoring, distance                      |
| Study or desk at night                       | Solitary thinking, late work, writing                           |

Reusing a setting is fine and keeps the series coherent; change the time of day
and palette. Signs of life without people work well: a lit lantern, a steaming
mug, tools put down mid-task.

Propose three to five scene ideas in one line each and let the user pick before
writing the full prompt.

## 2. Choose the living details

Pick two or three small things that will move. Movement stays subtle: nothing
travels across the frame and the camera never moves.

Good candidates, and how to stage them so they can be animated cleanly:

- **Steam or smoke:** from a mug, pot, chimney or vent, rising in front of a
  dark, plain area (a wall, a window frame), never in front of detailed
  texture.
- **Fire, embers, glowing metal:** contained in a hearth, torch, lantern or
  channel, with a clear border.
- **Screens, hologram bits, indicator lights:** small, isolated bright pixels
  on dark surfaces.
- **Stars, fireflies, dust motes:** single bright pixels scattered over a dark,
  even sky or shadow.
- **Water:** horizontal bands on a river, pool or channel, seen from the side.
- **Fog, cloud bands:** as separate horizontal strips in the distance.

## 3. Write the prompt

Fill the template and hand it to the user in a fenced block, ready to paste into
Gemini. Write the scene in plain, concrete sentences: what is where, from which
side the light comes. Name each living detail and where it sits. Avoid words
that pull towards polished modern art: "cinematic", "detailed", "intricate",
"4K", "high quality".

The user attaches `content/notes/2026-05-17-where-the-map-ends/original.png`
(and optionally the Failing Forward one) to the same Gemini message. The
reference image is the strongest lever on pixel size; the words only back it up.

```text
Create a new pixel-art scene in exactly the same visual style as the attached
image: the same pixel size, the same chunky low-resolution look, the same
simple shapes, shading and muted colours. Do not copy its content, its
figure or its layout.

Style: a 16-bit pixel-art image from the 1990s, like a screenshot from a
SNES, Mega Drive or Amiga point-and-click adventure game, as it looked on
screen at 320x200. Not modern high-resolution pixel art. The whole image is only about 320 pixels wide, so
every pixel is big and clearly visible. Big, simple shapes; detail suggested
with a few pixels, not drawn out. Three or four shades per material, dark
outlines only where needed, a limited palette of about 32 colours, ordered
dithering in skies and shadows. No people.

Scene: <setting, time of day, weather; the one focal point; signs of life
without people>.

Composition: 16:9 frame that will be cropped to a 5:2 strip, so everything
important sits in the middle 70 percent of the height. The top 15 percent is
plain <sky, ceiling>, the bottom 15 percent is plain <ground, floor>, nothing
important there. Dark foreground shapes frame the left and right edges (<e.g.
tree trunks, shelves, a window frame>), the middle ground holds the focal
point, the background fades into hazy layers.

Light and colour: <main light source and direction>, <warm/cool palette,
e.g. amber firelight against blue shadow>, deep shadows.

Small details: <living detail 1 and where it sits, against what background>,
<living detail 2>, <living detail 3>. Keep them small and set against plain,
dark areas.

No text, letters, numbers, signs with writing, UI, window chrome, borders,
frames or signatures.
```

Gemini's widest option is 16:9 (1376x768), which is why the composition keeps
the top and bottom 15 percent expendable. Tell the user to pick 16:9 and to
switch off the visible watermark in Gemini's settings if the account allows it
(the snap step can patch it out otherwise).

If the result is still too fine, a follow-up in the same chat usually helps:
"Redraw this at half the resolution: pixels twice as big, fewer details,
simpler shapes, like the attached reference."

If the scene already contains a detail that should move (a finished steam wisp,
a flame), an optional second prompt in the same chat can produce a clean plate:
"Keep this image exactly the same, pixel for pixel, but remove the steam above
the mug." Gemini edits can shift other pixels, so compare before using it.

## 4. Snap to the pixel grid

Once the user drops the generated image into the note folder:

```bash
node .claude/skills/pixel-header/scripts/snap.mjs <image> <out-dir> --aspect 5/2
```

It detects the grid size and phase, samples the dominant colour per cell and
writes `native.png` (one cell per pixel, cropped to 5:2) plus a 2x
`preview.png`. Move the crop with `--offset=N` (native pixels, negative is up)
if the horizon or focal point sits off-centre.

The native width should land near 330 pixels. If the detected grid is finer
(a 1376px image snapping to 2 or 3, i.e. 460 to 690 wide), force it with
`--grid 4`. That gives the right density, but thin lines such as ropes or
bottle necks turn to mush when the source had more detail than the grid can
hold; in that case regenerate with the follow-up prompt above instead. Look at
the preview crop of an outline-heavy area either way.

## 5. Animate

Write a small script for the scene. Start from `examples/model-room.mjs` (the
header of "Modernize the Product, Not the UI") or the simpler
`examples/roastery.mjs` (the header of "On Software That Looks Like Its
Database", no moving layer): copy it to your scratchpad and replace the regions
and effects. Keep the finished script there too, as the next example and so the
loop can be regenerated. `scripts/loop.mjs` does the rest: it loads
`native.png`, has the pixel and colour helpers, and exports the loop. The
example shows the patterns:

- a **clean plate** first (static steam painted out, watermark patched)
- **drawn elements** per frame from a fixed small palette, thinned with an
  ordered pattern instead of transparency (the steam)
- **glow and flicker** by moving existing pixels towards a darker or warmer
  tone, on seeded hashes so every render is identical (the lanterns, the wall
  light)
- a loop of 96 frames at 125 ms (8 fps, 12 s); every motion completes a whole
  number of cycles within the loop so it has no seam

When something moves (the floating hologram in the example, a bobbing buoy):

- move the **whole object as one rigid layer**: grow the mask from its bright
  pixels into the dimmer connected ones (outlines, grid lines, shading, feet in
  front of other objects), close 1-2 px gaps down each column, and take the
  light it casts on the wall right next to it along. Anything left behind
  tears the object apart or hangs off it
- fill the clean plate under the layer from the nearest pixel outside it in
  the same column; only the rim is ever uncovered
- move it in **fractions of an art pixel** by returning the layer from
  `layersAt` with its `lift` (in art pixels, rounded to export pixels). About
  one art pixel of travel on a half-linear, half-cosine curve reads as a
  continuous glide; whole art pixels read as steps
- loose parts **trail by one or two frames**; drifting bits stay whole, rise
  1 px per step and fade through one fixed dim tone, not by scaling colours
- check the per-frame changed-pixel counts (set `FRAMES_DIR` to get the
  frames): only the planned steps should show

Find coordinates by rendering `native.png` at 2x with a grid overlay:

```bash
ffmpeg -i native.png -vf "scale=iw*2:ih*2:flags=neighbor,drawgrid=w=100:h=100:c=red@0.6" grid.png
```

The script writes `scene.webp` (lossless animated WebP, pre-scaled with
nearest-neighbour by the smallest whole number that reaches 1440px, 4x to 5x
for the scenes so far, around 70 to 300 KB) and `poster.png` (frame 0, for reduced
motion). Show the user the poster and a few zoomed frames; they check the
motion itself in a browser. The script is a tool, not part of the note: keep
only `native.png`, `scene.webp`, `poster.png` and `og.webp` (step 6) in the
note folder.

## 6. Wire it into the note

Reference both files in the note's frontmatter. The object form renders
through `src/ui/pixel-image.tsx`: unoptimized, scaled the last small step
smoothly and only down (the large export keeps the edges hard), faded in once loaded, and replaced by the poster under `prefers-reduced-motion`
(the animation is then not downloaded). Delete the Gemini original from the
note folder before committing, it is only the input for the snap.

```yaml
image:
  src: ./scene.webp
  poster: ./poster.png
```

Optionally hide a few objects in the scene, like the adventure games it is
drawn after: hovering names the object ("Look at lantern"), clicking shows a
remark about it for its reading time, and each click is tracked as `Look At`.
Give each one a short lowercase name, a remark (see below; never content the
note needs, the scene is hidden from assistive technology) and its box in
native pixels of `native.png`, which has to stay in the folder. List small
objects before the larger ones they sit on, the first match wins.

Keep it to three or four objects, each box tight around the object, about
10% of the scene in all: if most of the scene answers, the "Look at …" over
empty scenery disappears and so does the curiosity. Pick what is funny or
carries the note's idea, not every prop. Mouse and trackpad only; touch
screens see the plain scene.

```yaml
image:
  src: ./scene.webp
  poster: ./poster.png
  hotspots:
    - name: lantern
      remark: Burning for the next one. There’s always a next one.
      at: [213, 55, 17, 30] # x, y, width, height
```

Check the boxes before writing remarks: draw them onto `poster.png` (scaled
by the export scale) and look at the result, then hover and click each one in
the running page.

### The remarks

The voice of the old point-and-click adventures' "look at" lines: dry,
deadpan, a little absurd, and never explaining the joke.

- **Literal first, then a turn.** Start by saying plainly what the thing is,
  let the last clause tip it over: "A beetle. No map, no hat, and it’s still
  doing better than me."
- **Whoever is in the scene speaks.** If there is a character, the remark is
  theirs, in the first person, slightly self-important and slightly
  cowardly: "Two yellow eyes. I’m going to assume they’re friendly. From over
  here." Without one, a flat statement of fact works just as well: "Older
  than the internet. Never once returned a 404."
- **Understatement over punchlines.** One dry word can carry the line:
  "Refreshing.", "Show-offs.", "rudely".
- **Specific absurdity.** An oddly exact detail beats a general joke:
  "According to my map, I’m standing in a river. I’m fairly sure I’m not."
- **The note's idea stays inside the scene.** No work words (stakeholder,
  roadmap, sprint, estimate, legacy, company); the theme comes through the
  objects themselves: the old bridge copied "every crack, faithfully
  reproduced", the map that "just stops".
- **Short.** One to three short sentences, at most about 100 characters; the line is
  read in passing. Curly apostrophes (’), no quotes (the line adds them).
- **Vary the jokes across a scene.** Two remarks that make the same point
  cancel each other out.

Write two or three options per object and let the author pick, with a
recommendation; the remarks are their voice.

The header image is not used for link previews. `/og/<slug>.webp` serves the
note folder's `og.webp` and falls back to the logo card without one, so export
it from `native.png`: a centred 1.91:1 crop, 4x nearest-neighbour, then scaled
smoothly to 1200x630. The crop width is the native height times 1.905 (349 for
a 183px high image); move the crop with its x offset if the focal point sits
off-centre. Delete `og.png` afterwards.

```bash
ffmpeg -i native.png -vf "crop=349:183:(iw-349)/2:0,scale=iw*4:ih*4:flags=neighbor,scale=1200:630:flags=bilinear" og.png
cwebp -q 90 -m 6 og.png -o og.webp
```

## Constraints

- Export with nearest-neighbour at the scale `scaleFor` picks (`loop.mjs`):
  the header is up to 720px wide, 1440 device pixels on a 2x screen, and the
  browser should only ever scale down. A scene shown wider passes
  `shownWidth` to `writeLoop` (the 404 page's is up to 1120px). Scaling up smoothly blurs the edges,
  `pixelated` rounds art pixels to uneven widths and makes moving parts
  shimmer. Lossless WebP compresses the repeated blocks, so a larger export
  costs little; Next's optimizer passes animated images through unresized.
- Movement is subtle, and there is none under `prefers-reduced-motion` (the
  poster is shown instead).
- Visual regression tests cover the note headers; the animation needs a frozen
  frame there. Ask before running or dispatching VRT.
