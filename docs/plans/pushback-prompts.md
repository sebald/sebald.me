# Pushback: Gemini prompt pack

Every image the game needs, one prompt each, ready to paste. Nine generations before rerolls: three model sheets, four scenes, one prop sheet, one head sheet. The Dev sheet already exists.

## Before you start

- Pick **16:9** in Gemini (1376 by 768). Switch the visible watermark off in the settings if the account allows it; `snap.mjs` can patch it out otherwise.
- **Attach the references named under each prompt** to the same message. The reference is the strongest lever on pixel size and style; the words only back it up.
  - `HEADER` = `content/notes/2026-05-17-where-the-map-ends/original.png` (style and pixel look).
  - `DEV` = `src/assets/lab/pushback/sources/dev-sheet.jpg` (the Dev model sheet; copy it there from Downloads first). Every character and prop sheet attaches it so scale and pixel size match across the cast.
- Save each result under the file name given, in `src/assets/lab/pushback/sources/`. Keep the originals; they are the reference for every later fix.
- One chat per image. Fixes go into the same chat as follow-ups (last section), so Gemini keeps the character.
- The sheets all face **right**. The right-hand duellist is the sheet mirrored in code, so props carry no writing and no asymmetry that would look wrong flipped.

What to check before saving, in order of how expensive a miss is:

1. Same person in all six cells: height, colours, hair, prop. One odd cell is a reroll, not a fix.
2. Pixel size matches the attached sheet. If the figures look finer or smoother than the Dev sheet, use the half-resolution follow-up.
3. Clear gaps between the cells, plain dark background, nothing touching the frame edge (`sheet.mjs` cuts on the gaps).
4. No letters anywhere: badges, stickers, screens, whiteboards, mugs.

## Model sheets

Each sheet is the same figure six times in a row, left to right: **idle, talk, taunt, flinch, win, lose**. The poses mean the same thing for everyone (the animation table keys on the cell index), but each character does them their own way; that is where the personality lives. Figures stand on a shared floor line, feet at the same height, each cell the same width.

### PM model sheet (`pm-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Create a pixel-art character model sheet in exactly the same visual style and
pixel size as the attached sheet of the hoodie character: the same chunky
low-resolution look, the same figure height, the same simple shapes, shading
and muted colours. Do not copy that character; this is a different person
from the same game.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click adventure
game, as it looked on screen at 320x200. Not modern high-resolution pixel
art. Every pixel is big and clearly visible. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Character: a product manager, mid thirties, lean and brisk, always slightly
leaning forward as if the meeting started without them. Short dark curly
hair, a striped shirt with the sleeves rolled up to the elbow, a lanyard
with a blank badge swinging on it, a pen behind one ear, dark trousers,
white sneakers. A small notebook is clamped under the left arm the whole
time. In the right hand, a thick stack of sticky notes in three colours,
held like a weapon. Warm palette: teal shirt stripes, orange lanyard,
yellow and pink sticky notes.

Layout: the same character six times side by side in a single row, identical
in size, colours and clothing, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image. Left
to right:
1. idle: standing, weight on one leg, notebook under the arm, sticky notes
   held at the hip, looking right.
2. talking: mouth open, the free hand chopping the air mid-sentence.
3. taunt: leaning forward, the sticky-note stack thrust towards the right
   like a pointed finger, eyebrows up.
4. flinch: leaning back, eyes shut, a few sticky notes flying off the stack.
5. win: both arms up, one sticky note stuck to the forehead on purpose.
6. lose: shoulders dropped, head down, peeling a sticky note off the
   notebook very slowly.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: a different hairstyle or shirt between cells, a figure clearly taller or shorter than the Dev sheet, a notebook that disappears in some cells.

### Designer model sheet (`designer-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Create a pixel-art character model sheet in exactly the same visual style and
pixel size as the attached sheet of the hoodie character: the same chunky
low-resolution look, the same figure height, the same simple shapes, shading
and muted colours. Do not copy that character; this is a different person
from the same game.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click adventure
game, as it looked on screen at 320x200. Not modern high-resolution pixel
art. Every pixel is big and clearly visible. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Character: a product designer, late twenties, very upright, composed, the
posture of someone who has already noticed what is wrong with your font.
Hair in a tight high bun, large round glasses, a black turtleneck, wide
cream trousers cropped above the ankle, bright yellow socks, flat black
shoes, one thin gold earring. In the left hand a drawing tablet held like a
tray, in the right hand a stylus held like a cigarette holder. The tablet
screen is a plain pale rectangle. Palette: black, cream, warm grey, one
accent of yellow, skin tone, dark hair.

Layout: the same character six times side by side in a single row, identical
in size, colours and clothing, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image. Left
to right:
1. idle: standing very straight, tablet level, stylus held up, looking right.
2. talking: mouth open, the stylus drawing a small circle in the air.
3. taunt: leaning in, the stylus pointed at the viewer's eye level, glasses
   pushed up with one finger.
4. flinch: leaning back, eyes shut, tablet hugged to the chest.
5. win: chin up, eyes closed, the stylus raised like a conductor's baton,
   one foot slightly forward.
6. lose: head down, glasses taken off and held at the side, tablet hanging
   from the other hand.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: glasses missing in a cell, the bun changing shape, trousers changing length, a tablet that becomes a laptop.

### Stakeholder model sheet (`boss-sheet.jpg`)

Attach: `HEADER`, `DEV`.

The Stakeholder never looks up. Five of the six cells are played to the phone; the lose cell is the one time the face is fully visible, and it has to read as a surprise.

```text
Create a pixel-art character model sheet in exactly the same visual style and
pixel size as the attached sheet of the hoodie character: the same chunky
low-resolution look, the same figure height, the same simple shapes, shading
and muted colours. Do not copy that character; this is a different person
from the same game.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click adventure
game, as it looked on screen at 320x200. Not modern high-resolution pixel
art. Every pixel is big and clearly visible. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Character: a senior stakeholder, fifties, broad, in a grey suit that is a
size too generous, white shirt, a dark tie loosened one notch, shiny black
shoes, a heavy watch, grey hair combed back with a widow's peak. A phone is
glued to the right hand and held up at chest height in every pose; the head
is tilted down towards it so the eyes are hidden under the brow, except in
the last pose. The phone screen is a plain glowing pale blue rectangle.
Palette: grey suit in three shades, white, dark navy tie, skin tone, grey
hair, pale blue phone glow.

Layout: the same character six times side by side in a single row, identical
in size, colours and clothing, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image. Left
to right:
1. idle: standing square, reading the phone, free hand in the trouser pocket.
2. talking: mouth open but still looking at the phone, the free hand making
   a vague circular "go on" gesture.
3. taunt: the phone raised a little higher as if showing the screen, free
   hand palm up, a half smile, still not looking up.
4. flinch: a small jolt, the phone nearly dropped and caught, the free hand
   out for balance, eyes still down.
5. win: a thumbs up with the free hand without looking up, phone back at
   the chest.
6. lose: the head lifted for the first time, eyes wide and fully visible,
   mouth slightly open, the phone lowered to the hip.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: the eyes visible in any cell but the last, the phone missing in a cell, the suit changing colour, a figure taller than the Dev sheet (suits tempt Gemini into drawing bigger).

## Scenes

Four backgrounds at 480 by 270 native pixels, so the prompt asks for a scene about 480 pixels wide, finer than the note headers (about 330). Attach `HEADER` for the style; do not attach the Dev sheet, it pulls the pixel size towards the figures.

Composition rule for all four, written into every prompt: nothing but plain floor and wall where the two duellists will stand, left-centre and right-centre, from a fifth of the height down to the floor. The focal furniture sits between them or behind them as a plain dark shape. The top strip is plain ceiling or sky (the bars go there), the bottom strip plain floor (the dialogue box goes there). The outer edges stay plain and simple, because `sheet.mjs` pads the snapped image out to 480 by repeating the edge columns.

Each scene has two or three living details, staged in front of plain dark areas so the loop script can draw them cleanly.

### Open-plan floor, for the Dev duels (`scene-floor.jpg`)

Attach: `HEADER`.

```text
Create a new pixel-art scene in exactly the same visual style as the attached
image: the same chunky low-resolution look, the same simple shapes, shading
and muted colours. Do not copy its content or its layout.

Style: a 16-bit pixel-art background from a 1990s point-and-click adventure
game, as it looked on screen. Not modern high-resolution pixel art. The
whole image is about 480 pixels wide, so every pixel is clearly visible.
Big simple shapes; detail suggested with a few pixels, not drawn out. Three
or four shades per material, dark outlines only where needed, a limited
palette of about 32 colours, ordered dithering in shadows. No people.

Scene: an open-plan software office floor, late afternoon, seen straight on
from the middle of the aisle. Two desk islands, one on the far left and one
on the far right, each with two monitors seen from behind as plain dark
rectangles, a tangle of cables hanging off the back, a chair pushed out. The
back wall is a row of tall windows with the blinds half down and a
blue-grey sky behind. On a shelf against the back wall, in the centre, a
small tower lamp with a red and a green bulb, the kind that shows whether
the build passed. Next to it a rubber duck. A potted plant on the right
desk that has clearly given up, two leaves left, one bending down. On the
left desk a closed pizza box. A whiteboard on the back wall covered only in
boxes and arrows, no letters. The middle of the aisle is wide, empty, plain
carpet with nothing on it.

Composition: 16:9 frame. The top 15 percent is plain ceiling with a strip of
long fluorescent lights, the bottom 17 percent is plain carpet with nothing
on it. The left-centre and the right-centre of the frame, from a fifth of
the height down to the floor, are empty: plain carpet and plain back wall,
because two figures will stand there later. The desk islands stay in the
outer fifth on each side as dark framing shapes; the shelf with the lamp and
the whiteboard sit in the middle between the two empty areas. The outer edge
columns of the image are plain and simple.

Light and colour: cool blue-grey daylight from the windows behind, with warm
orange light spilling from the monitors onto the desks and the carpet. Deep
blue shadows under the desks.

Small details that will be animated later, keep them small and set against
plain dark areas: the glow of the left monitors on the desk surface, the red
and green bulbs of the tower lamp against the plain back wall, the two
leaves of the dying plant against the dark window blind.

No text, letters, numbers, signs with writing, UI, window chrome, borders,
frames or signatures.
```

Reroll on: a person at a desk, letters on the whiteboard or screens, desks reaching into the middle of the frame, a pixel size clearly finer than the header.

### Meeting room, for the PM duels (`scene-meeting.jpg`)

Attach: `HEADER`.

```text
Create a new pixel-art scene in exactly the same visual style as the attached
image: the same chunky low-resolution look, the same simple shapes, shading
and muted colours. Do not copy its content or its layout.

Style: a 16-bit pixel-art background from a 1990s point-and-click adventure
game, as it looked on screen. Not modern high-resolution pixel art. The
whole image is about 480 pixels wide, so every pixel is clearly visible.
Big simple shapes; detail suggested with a few pixels, not drawn out. Three
or four shades per material, dark outlines only where needed, a limited
palette of about 32 colours, ordered dithering in shadows. No people.

Scene: a glass-walled meeting room, mid-morning, seen from the door. The
back wall is one big whiteboard, mostly empty, with a single large diagram
of boxes and arrows in blue and red marker, no letters, and a cloud of
coloured sticky notes in the top right corner. A long pale table runs along
the very bottom of the frame as a foreground shape, with a steaming mug
and a plate holding exactly one leftover croissant on the left end, and a
jar of markers on the right end. A ceiling projector throws a faint beam
of light across the room towards the whiteboard, and a dust haze hangs in
the beam. A wall clock without numbers on the left wall, a glass wall on
the right with the blinds half closed, a sad fern in the back left corner.
The floor between the table and the whiteboard is plain grey carpet.

Composition: 16:9 frame. The top 15 percent is plain ceiling with the
projector hanging from it, the bottom 17 percent is the plain pale table
surface as a foreground shape with nothing in its middle. The left-centre
and the right-centre of the frame, from a fifth of the height down to the
table, are empty: plain carpet and plain whiteboard, because two figures
will stand there later. The diagram and the sticky notes sit in the middle
of the whiteboard between the two empty areas, the clock, fern and glass
wall stay in the outer fifth on each side. The outer edge columns of the
image are plain and simple.

Light and colour: flat bright daylight from the glass wall on the right,
beige walls, whiteboard white, grey carpet, the projector beam a faint
warm band across the room. Soft shadows.

Small details that will be animated later, keep them small and set against
plain dark areas: the steam above the mug against the plain whiteboard,
the dust in the projector beam against the dark upper wall, a small red
light on the projector.

No text, letters, numbers, signs with writing, UI, window chrome, borders,
frames or signatures.
```

Reroll on: writing on the whiteboard (Gemini loves to letter a whiteboard), a table that blocks the middle of the frame above the bottom strip, chairs in the standing areas.

### Studio corner, for the Designer duels (`scene-studio.jpg`)

Attach: `HEADER`.

```text
Create a new pixel-art scene in exactly the same visual style as the attached
image: the same chunky low-resolution look, the same simple shapes, shading
and muted colours. Do not copy its content or its layout.

Style: a 16-bit pixel-art background from a 1990s point-and-click adventure
game, as it looked on screen. Not modern high-resolution pixel art. The
whole image is about 480 pixels wide, so every pixel is clearly visible.
Big simple shapes; detail suggested with a few pixels, not drawn out. Three
or four shades per material, dark outlines only where needed, a limited
palette of about 32 colours, ordered dithering in shadows. No people.

Scene: the corner of a design studio in the evening, warm wood floor and a
brick wall painted white. The back wall is a moodboard: a big cork board
with pinned colour swatches, torn paper, a few small abstract sketches and
one photo of a chair, all as plain colour shapes, no letters. On the left a
big beige laser printer as a dark boxy shape with its lid open and a jam of
paper spilling out of it. On the right a tall wooden desk with a single
articulated desk lamp giving cool white light, a drawing tablet lying on
the desk with its screen glowing faintly, and a shelf above it holding a
row of identical black notebooks and one very healthy plant. A tiny
mannequin hand on the desk holding a pencil. A roll of masking tape on the
floor. The middle of the floor is plain warm wood with nothing on it.

Composition: 16:9 frame. The top 15 percent is plain white brick wall and a
strip of ceiling with a track light rail, the bottom 17 percent is plain
wooden floor with nothing on it. The left-centre and the right-centre of
the frame, from a fifth of the height down to the floor, are empty: plain
floor and plain wall, because two figures will stand there later. The
moodboard sits in the middle of the back wall between the two empty areas;
the printer stays in the outer fifth on the left, the desk, lamp and shelf
in the outer fifth on the right, as framing shapes. The outer edge columns
of the image are plain and simple.

Light and colour: warm amber evening light from an unseen window on the
left, one pool of cool white light from the desk lamp on the right, warm
wood, cream, white brick, and the swatches on the moodboard as the only
saturated colours. Long warm shadows.

Small details that will be animated later, keep them small and set against
plain dark areas: the desk lamp's light on the desk surface, one sticky
note on the moodboard lifting at a corner against the dark cork, the
tablet screen glowing on the dark desk.

No text, letters, numbers, signs with writing, UI, window chrome, borders,
frames or signatures.
```

Reroll on: letters or a logo on the moodboard, the desk pushed into the right standing area, a window with a view that pulls the eye away from the middle.

### Corner office, for the Stakeholder, the title screen and the roster (`scene-office.jpg`)

Attach: `HEADER`.

```text
Create a new pixel-art scene in exactly the same visual style as the attached
image: the same chunky low-resolution look, the same simple shapes, shading
and muted colours. Do not copy its content or its layout.

Style: a 16-bit pixel-art background from a 1990s point-and-click adventure
game, as it looked on screen. Not modern high-resolution pixel art. The
whole image is about 480 pixels wide, so every pixel is clearly visible.
Big simple shapes; detail suggested with a few pixels, not drawn out. Three
or four shades per material, dark outlines only where needed, a limited
palette of about 32 colours, ordered dithering in skies and shadows. No
people.

Scene: a corner office at night, high up, seen from the door. The whole
back wall is glass, with a dark navy city skyline behind it, scattered lit
windows in the towers, and rain streaks on the glass. In the centre, a
heavy dark wooden desk seen from the front, low enough that the glass wall
shows above it. On the desk: a phone lying face up with its screen glowing,
a tall untouched stack of printed reports, a small bonsai, and a chrome
desk toy. Behind the desk a tall leather chair turned slightly away. A golf
putter leaning in the right corner with a single ball on the carpet next to
it. On the left wall a framed picture of a yacht, as plain shapes, and a
low cabinet with a crystal decanter and two glasses. Dark carpet with a
faint pattern. The areas of carpet to the left and right of the desk are
plain and empty.

Composition: 16:9 frame. The top 15 percent is plain dark ceiling with
three recessed spotlights, the bottom 17 percent is plain dark carpet
with nothing on it. The left-centre and the right-centre of the frame,
from a fifth of the height down to the floor, are empty: plain carpet and
plain glass with the skyline far behind, because two figures will stand
there later. The desk and the chair sit in the exact middle between the two
empty areas and do not reach into them. The yacht picture, the cabinet and
the putter stay in the outer fifth on each side. The outer edge columns of
the image are plain and simple.

Light and colour: dark navy and black, amber light from the spotlights on
the desk and the carpet, pale blue from the phone screen, the city lights
behind the glass in warm yellow and white single pixels. Deep shadows.

Small details that will be animated later, keep them small and set against
plain dark areas: the lit windows of the towers against the dark sky, the
phone screen glowing on the dark desk, the rain streaks on the glass in
front of the plain sky.

No text, letters, numbers, signs with writing, UI, window chrome, borders,
frames or signatures.
```

Reroll on: a person in the chair, a skyline so busy the standing areas are full of lit windows (they must be plain enough to put a figure in front of), the desk reaching into the standing areas, a lit screen on a monitor with writing.

## Prop sheet (`props-sheet.jpg`)

One image, eight items in a row, at the sprite's pixel size. `sheet.mjs` cuts it on the gaps; the swap table pastes each item at its character's hand anchor. The Head of Product has no prop (blazer and no notebook are palette work), the Stakeholder's phone is on the boss sheet.

Attach: `HEADER`, `DEV`.

```text
Create a pixel-art item sheet in exactly the same visual style and pixel size
as the attached sheet of the hoodie character: the same chunky
low-resolution look, the same simple shapes, shading and muted colours.
Items drawn at the scale of that character's hands, so each item is about
a quarter of the figure's height. Plain flat dark background, no floor, no
shadow, no frame.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible. Big
simple shapes, detail suggested with a few pixels. Three or four shades
per material, a dark outline only on the silhouette, a limited palette.

Layout: eight small hand-held items side by side in a single row, clear
gaps between them, nothing touching the edge of the image, all facing
slightly to the right. Left to right:
1. a paper coffee cup with a lid, a wisp of steam above it.
2. a long printout rolled open at one end, showing a chart of horizontal
   coloured bars stepping down like stairs, no letters.
3. a tall slim energy drink can in black and lime green.
4. a compact mechanical keyboard with chunky keycaps in two greys and one
   orange key, seen from slightly above, no letters on the keys.
5. a fat whiteboard marker in blue with the cap off.
6. a canvas tote bag in natural beige with a single abstract shape printed
   on it, handles up.
7. a fan of colour swatches spread open like a hand of cards, rainbow order.
8. a very small laptop, open, screen a plain pale rectangle, no stickers.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: items at different scales, letters on the keyboard or the printout, fewer than eight.

## Head sheet (`heads-sheet.jpg`)

Two replacement heads for Dev swaps: hood up for the Junior, grey beard for the Architect. Generated with the Dev sheet attached so they fit its head exactly; the base head is asked for as the first cell only as a scale reference and is not used.

Attach: `DEV`.

```text
Using the attached sheet of the hoodie character, draw a pixel-art head
sheet in exactly the same visual style and pixel size: the same chunky
low-resolution look, the same shapes, shading and colours. Plain flat dark
background, no frame.

Layout: three heads side by side in a single row, each cut off at the
shoulders, all the same size as the head of the attached character and
facing the same way as the attached character, clear gaps between them,
nothing touching the edge of the image. Left to right:
1. the attached character's head exactly as it is, as a reference.
2. the same character with the hood of the hoodie pulled up over the head,
   face in shadow under the hood, headphones hidden.
3. the same character twenty years older: short grey hair, a full grey
   beard, the same headphones around the neck.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: heads at different sizes, a hood that changes the face shape so much it no longer sits on the Dev body.

## Follow-ups, in the same chat

Gemini edits can shift other pixels, so compare the follow-up against the first version before saving it.

- Too fine, too smooth, too much detail:
  `Redraw this at half the resolution: pixels twice as big, fewer details, simpler shapes, exactly like the attached reference.`
- One cell drifted:
  `Keep this image exactly the same, pixel for pixel, but redraw the fourth figure so it is the same person as the others: same height, same hair, same clothes, same colours.`
- Letters appeared:
  `Keep this image exactly the same, pixel for pixel, but remove all letters and writing from the whiteboard; leave only boxes and arrows.`
- Something stands where the figures go:
  `Keep this image exactly the same, pixel for pixel, but remove the chair on the left and fill the area with plain carpet and plain wall.`
- A living detail is already drawn in its moving state (a steam wisp, a flame), and the loop script needs a clean plate:
  `Keep this image exactly the same, pixel for pixel, but remove the steam above the mug.`

## After the download

For each file: drop it into `src/assets/lab/pushback/sources/` under the name above and tell me. I snap it, cut the sheets, run the validator, review the contact prints and either fix the pixels in code or hand back a follow-up prompt for the same chat. Scenes get their loop scripts in package 4, sheets their swap tables in package 5.
