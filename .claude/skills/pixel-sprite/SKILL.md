---
name: pixel-sprite
description: Scenes and sprites for the Pushback game (`/lab/pushback`) in the blog's pixel-art style. Snap a Gemini scene render to the 480x270 stage and animate it (`scripts/scene.mjs`, `scenes/*.mjs`), or cut a Gemini model sheet, item sheet or the ghost sheet into cells, keyed and palette-locked, and review the contact print (`scripts/sheet.mjs`). Use when the user drops a Pushback render into `src/assets/lab/pushback/sources/`, asks for a sheet or scene to be cut, snapped, checked or rerolled, or types `/pixel-sprite`.
---

# Pixel sprite

The art pipeline of the Pushback game. Nothing is drawn by hand: Gemini
renders the image from a prompt in `docs/plans/pushback-prompts.md`, the
scripts here pull it onto its pixel grid and into the game's formats, and
the contact prints are reviewed by eye. The spec is `docs/plans/pushback.md`
("Art and animation"); the pixel-header skill holds the shared `snap.mjs`
and `loop.mjs`.

Renders go to `src/assets/lab/pushback/sources/<id>.jpg` (recompressed,
committed) with the Gemini original in `sources/originals/` (ignored).
Everything the game imports is built from them: `scenes/<slug>/` and
`sheets/<id>.png` + `<id>.json`. Contact prints land in `sources/contact/`
(ignored).

## Sheets

One command per sheet. Run from the repo root.

```bash
# A model sheet: six poses (idle, talk, taunt, flinch, win, lose)
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/dev-sam-sheet.jpg dev-sam --cells 6

# The ghost: three cells (hover, hover, point), Gemini draws it person
# sized and it floats at the shoulder about half that
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/ghost-sheet.jpg ghost --cells 3 --scale 0.5

# The logo: one cell the size of the whole render, centred, keyed, then
# trimmed to its art (the title reads the PNG's size from `LOGO`); the
# JSON it writes is not needed. 24 colours: the cup, the duck and the
# note need more than the two words did
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/originals/logo-c.jpeg logo \
  --cells 1 --cell 240x134 --anchor centre --specks 0 --colours 24
rm src/assets/lab/pushback/sheets/logo.json
# then trim the transparent margin with sharp and put the size in title.tsx

# A sheet with a ruler figure (Nadia's third roll has Jo at the left as
# the measure): cut with one cell more, then drop the first cell from the
# PNG and the JSON

# The glossary's icon: the rolled printout from the prop sheet, cropped
# out of the original (sharp, extract left 355, top 540, 380 by 400) to
# `originals/glossary-sheet.png`, then one centred cell; trimmed to its
# art (29 by 30) like the logo, and the JSON dropped
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/originals/glossary-sheet.png glossary \
  --cells 1 --cell 40x40 --anchor centre --specks 0

# The mic-drop burst: three cells (the burst, its big beat, popped), the
# letters inside key with it
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/originals/micdrop-sheet.jpeg micdrop \
  --cells 3 --cell 96x96 --anchor centre --specks 0

```

What it does, in order:

1. `snap.mjs` finds the grid and writes the native image. The pitch is
   fractional: a 2752 by 1536 render is 240 columns of 11.465 px, and a
   whole-pixel grid drifts a cell every two cells and smears every face
   right of the first. Cut from the Gemini original in `sources/originals/`
   when it is on disk; the recompressed copy adds noise to the sampling.
2. The flat background is keyed by flooding from the border within
   `--tolerance` (10) of the border colour, so dark hair and outlines
   inside a figure are safe. The soft shadow under the feet is then taken
   by growing into near-background pixels (`--soft`, 12) in the lowest
   tenth of the image only (`--soft-from`, 0.9 of the height). The first
   defaults, 40 from half the height, ate dark trousers and suits on
   every sheet (hollow legs in the lose pose); the gentle key keeps them
   and still takes the shadow under the feet. Two figures that touch
   merge into one group: `--split <column>` cuts a native column to
   background before the groups are found (Bo, 213).
3. Figures are the `--cells` largest connected groups, left to right;
   smaller groups (a flying sticky note, the steam over a cup) join the
   nearest figure, dust under `--specks` (6) pixels is dropped. A hand
   reaching into the next figure's columns is still only copied once.
4. Each figure is centred in its cell and stood on the bottom row
   (`--anchor bottom`, the feet line), or centred (`centre`, items).
5. The palette is locked to `--colours` (32) by merging the closest
   shades; the sharp that ships with Next has no quantiser.
6. Written: `sheets/<id>.png` (RGBA, cells in a row), `sheets/<id>.json`
   (cell size, count, each figure's box) and the contact print at 4x in
   `sources/contact/<id>.png`, plus `<id>-keyed.png`, the keyed render with
   the background in magenta, to see what the key took.

The console line says the figure heights and widths per cell and `CLIPPED`
when a figure does not fit its cell. `pnpm test` runs `sheets.test.ts`,
which checks every sheet's cells, the idle height (70 to 85) and the
palette.

### Holes

The key floods from the border, so the background between the legs,
closed off by the legs and the shadow under the feet, stays in. Clear
it on the cut sheet, after the patches:

```sh
node .claude/skills/pixel-sprite/scripts/holes.mjs <id> [<id> ...]
```

It clears every group of background-coloured pixels (`--tolerance` 12)
of at least `--min` (10) pixels that runs from above the last `--feet`
(12) rows of the cell down into them. The shadow has a darker colour of
its own and dark shoes lie inside the feet rows, so both stay. Every
person sheet has had it except Kim (`designer-kim`), whose trousers are
drawn in the background's own shades and whose legs touch; check the
sheet at 4x on a bright colour after each run.

### Features

After a model sheet is cut, find the parts the game animates on it:

```sh
node .claude/skills/pixel-sprite/scripts/features.mjs <id>
```

It writes `features` into `<id>.json`: the head (a 24 px square in the
idle cell, the select screen's portrait), the mouth (the lower face of
the idle cell, pasted over the talk cell between words so only the mouth
moves while the hand stays up; the talk head is aligned on the idle one
first) and the eye of the lose cell (where the tears start, a third
down the bowed head on its facing side, a guess; set it by hand in the
script's `EYES` to the pixel right under the eye nearest the viewer, or
under the lens for glasses). Check
`sources/contact/<id>-features.png`: the head square should frame the
head with a row to spare, the cyan patch the mouth and chin but not the
eyes, the pink dot an eye of the lose cell.

### Review checklist

Open `sources/contact/<id>.png` and `<id>-keyed.png` and check:

- Six cells, the same person in all of them: face, hair, clothes.
  A cell that drifted goes back to Gemini ("One cell drifted" follow-up).
- Height: the idle figure between 76 and 85 px; the others may differ by
  a raised hand or a bowed head, not by scale. A sheet outside the range
  is rerolled, not scaled (the ghost is the one exception, see above).
- The key: no magenta inside a figure (dark hair, black shoes), no
  leftover shadow or dust around it. Fix with `--tolerance` (lower keeps
  more), `--soft` (higher takes more shadow), `--soft-from` (where the
  soft key may start), `--specks`.
- Nothing clipped: a hand thrust past the 72 px cell is a reroll.
- Mouth and hands readable at 2x, no stray single pixels, no letters or
  brand marks (a three-pixel laptop logo is fine, a readable claw is not).
- Palette: 32 colours, the outline still one dark colour, no banding on
  the skin.

Then check the sprite in motion in the inventory (`/lab/pushback/inventory`,
"Character"): every pose, mirrored, the mouth while a line types.

## The cast and the sheets

The nine colleagues are not drawn one by one: `src/lib/lab/pushback/
characters.ts` gives each a `sheet` (one of its role's two looks) and the
browser builds the sprite from it as it is (`src/ui/lab/pushback/sheets.ts`).
Sprites keep the colours Gemini drew; never recolour a sheet in code.
Hue-based tints caught skin and hair next to the garment and left pixels
see-through, so they were taken out; pasting an item into the hand looked
wrong too, so nothing is pasted on either. A colleague that needs its own
look gets its own sheet; the run draw never shows two colleagues on one
sheet together.

## Scenes

```bash
node .claude/skills/pixel-sprite/scripts/scene.mjs \
  src/assets/lab/pushback/sources/scene-floor.jpg src/assets/lab/pushback/scenes/floor
node .claude/skills/pixel-sprite/scenes/floor.mjs \
  src/assets/lab/pushback/scenes/floor/native.png src/assets/lab/pushback/scenes/floor
```

`scene.mjs` snaps the render (480 columns of 5.735 px on a 2752 px render,
so 478 by 266, from the original in `sources/originals/`) and pads or crops
it to 480 by 270 by repeating the plain edge rows (`pad.mjs`). The loop
scripts' coordinates are native pixels of that padded image. Each `scenes/<slug>.mjs` then
animates two or three living details into `scene.webp` (8x, for the stage
at 1.1x and up, shown through a 320 by 134 window), `scene-1x.webp` and `poster.png`, the way the note headers
are built (pixel-header skill, steps 4 and 5). Check the result in the
inventory's scene viewer with the guides on: the stands must not overlap
furniture and the band the composition rule keeps clear must be clear.

The finished frames are written a fifth smaller than drawn
(`scripts/shrink.mjs`, `ROOM_FACTOR` 0.8): three rounds of renders kept
the furniture too large for the cast, so each loop script hands its
frames to `shrinkFrames` before `writeLoop`. The frames are scaled
down smoothly about the floor line, every pixel snapped back to the
first frame's palette, and padded to the stage with the render's corner
colour (never in the window). The loop scripts and `native.png` stay in
the render's own pixels; only `scene.webp`, `scene-1x.webp` and
`poster.png` are smaller. Each scene's factor is in
`src/assets/lab/pushback/scenes/rooms.json`, which the loop scripts
and the game both read (the title fits the room's picture inside the
padded render to the stage; a test checks every `scene-1x.webp`
against it). The corner office and the studio take 0.76, their desks, chairs and doors came the largest. A fresh render that fits the cast gets the
factor set to 1.
