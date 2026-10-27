# Pushback: Gemini prompt pack

Every image the game needs, one prompt each, ready to paste. Sixteen generations before rerolls: seven model sheets, the ghost, four scenes, one prop sheet, one head sheet, the logo, the mic-drop burst.

## Before you start

- Pick **16:9** in Gemini (currently 2752 by 1536). Switch the visible watermark off in the settings if the account allows it; `snap.mjs` can patch it out otherwise.
- **Attach the references named under each prompt** to the same message. The reference is the strongest lever on pixel size and style; the words only back it up.
  - `HEADER` = `.claude/skills/pixel-header/references/where-the-map-ends.png` (style and pixel look).
  - `DEV` = `src/assets/lab/pushback/sources/dev-sam-sheet.jpg` (Sam's model sheet, the hoodie character). Every character and prop sheet attaches it so scale and pixel size match across the cast.
- Save each result under the file name given, in `src/assets/lab/pushback/sources/`. Keep the originals; they are the reference for every later fix.
- Gemini currently renders 16:9 at 2752 by 1536. Those sheets snap at an 11 px grid to figures about 82 px tall (Jo 83, Ravi 82), 8 percent taller than the Dev sheet's 76 from its 1376 px render, and inside the 70 to 85 range. Generate every remaining sheet at the same size so the rest of the cast matches Jo and Ravi, Sam included (his prompt redraws him at that size).
- Gemini draws a soft shadow under the feet whatever the prompt says; `sheet.mjs` keys it out with the background, nothing to reroll for.
- One chat per image. Fixes go into the same chat as follow-ups (last section), so Gemini keeps the character.
- The sheets all face **right**. The right-hand duellist is the sheet mirrored in code, so props carry no writing and no asymmetry that would look wrong flipped.

What to check before saving, in order of how expensive a miss is:

1. A different person from the Dev sheet, and the same person in all six cells: height, colours, hair, prop. One odd cell is a reroll, not a fix.
2. Pixel size matches the attached sheet. If the figures look finer or smoother than the Dev sheet, use the half-resolution follow-up.
3. Clear gaps between the cells, plain dark background, nothing touching the frame edge (`sheet.mjs` cuts on the gaps).
4. No letters anywhere: badges, stickers, screens, whiteboards, mugs.

## Model sheets

Seven sheets: two looks per role, so the player can pick, and the Stakeholder. All seven are generated and committed under `sources/`; the prompts stay for rerolls. Each sheet is the same figure six times in a row, left to right: **idle, talk, taunt, flinch, win, lose**. The poses mean the same thing for everyone (the animation table keys on the cell index), but each role does them its own way with its prop, and the two looks of a role share the prop and the poses and nothing else.

Gemini copies the attached figure when it can: the first PM roll came back with the Dev's face and hair. The prompts therefore put the new character first, in detail, and say three times that the attached sheet is a reference for size and style only. If a roll still looks like the hoodie character, use the "looks like the reference" follow-up at the end of this file rather than rerolling blind. Faces, skin tones, hair, builds and ages are spread across the six on purpose: a cast, not one person in six outfits.

### PM, look one: Jo (`pm-jo-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a product manager, a woman in her late thirties, tall
and lean, dark brown skin, hair in short natural coils cropped close
with a sharp side part, large hoop earrings, always slightly leaning
forward as if the meeting started without her. A striped shirt in teal
and white with the sleeves rolled to the elbow, an orange lanyard with
a blank badge swinging on it, a pen behind one ear, dark trousers,
white sneakers. A small notebook is clamped under the left arm the
whole time. In the right hand, a thick stack of sticky notes in yellow
and pink, held like a weapon.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing, weight on one leg, notebook under the arm, sticky
   notes held at the hip, looking right.
2. talking: mouth open, the free hand chopping the air mid-sentence.
3. taunt: leaning forward, the sticky-note stack thrust towards the right
   like a pointed finger, eyebrows up.
4. flinch: leaning back, eyes shut, a few sticky notes flying off the
   stack.
5. win: both arms up, one sticky note stuck to the forehead on purpose.
6. lose: shoulders dropped, head down, peeling a sticky note off the
   notebook very slowly.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: any resemblance to the attached hoodie character in face or hair, a figure clearly taller or shorter than the attached sheet, a notebook that disappears in some cells, a badge with writing.

### PM, look two: Piet (`pm-piet-sheet.jpg`)

Replaces Ravi (kept below as the backup). The cast so far is young to middle-aged, slim to average, and five of seven are mid to dark skinned, so the gap is an older, rounder, pale man with hair nobody else has.

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a product manager, a man in his late fifties, short and
round, pale pink skin, thinning grey-blond hair combed over the top and
a big grey walrus moustache, small round wire glasses, the calm of
someone who has survived every methodology so far. A mustard-yellow
knitted vest over a checked shirt with the sleeves rolled up, a brown
wool tie, an orange lanyard with a blank badge, brown corduroy trousers,
brown brogues. A small notebook is clamped under the left arm the whole
time. In the right hand, a thick stack of sticky notes in yellow and
pink, held like a weapon.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing, weight on one leg, notebook under the arm, sticky
   notes held at the hip, looking right.
2. talking: mouth open under the moustache, the free hand chopping the
   air mid-sentence.
3. taunt: leaning forward, the sticky-note stack thrust towards the right
   like a pointed finger, eyebrows up over the glasses.
4. flinch: leaning back, eyes shut, a few sticky notes flying off the
   stack, the glasses slipping down the nose.
5. win: both arms up, one sticky note stuck to the forehead on purpose.
6. lose: shoulders dropped, head down, polishing the glasses on the vest
   very slowly.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: a slim figure (Gemini likes to draw everyone fit), hair growing back in some cells, the moustache missing, a figure taller than the attached sheet (the whole point is that he is not).

### PM, look two, backup: Ravi (not in the repo; the render is kept on disk in `originals/`)

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a product manager, a man in his mid forties, stocky and
broad-shouldered, medium brown skin, completely bald with a neat short
black beard, rectangular dark-framed glasses, a calm face that has sat
through a thousand steering meetings. A navy quarter-zip pullover over a
pale collared shirt, an orange lanyard with a blank badge, beige chinos,
brown shoes, a smartwatch. A small notebook is clamped under the left
arm the whole time. In the right hand, a thick stack of sticky notes in
yellow and pink, held like a weapon.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing, weight on one leg, notebook under the arm, sticky
   notes held at the hip, looking right.
2. talking: mouth open, the free hand chopping the air mid-sentence.
3. taunt: leaning forward, the sticky-note stack thrust towards the right
   like a pointed finger, eyebrows up.
4. flinch: leaning back, eyes shut, a few sticky notes flying off the
   stack.
5. win: both arms up, one sticky note stuck to the forehead on purpose.
6. lose: shoulders dropped, head down, peeling a sticky note off the
   notebook very slowly.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: hair appearing on the head in some cells, the beard changing length, the glasses missing, a figure taller than the attached sheet.

### Dev, look one: Sam (`dev-sam-sheet.jpg`)

Sam's first sheet was a 1376 px render that snapped to a 76 px figure, 8 percent shorter than the sheets Gemini renders now, so he was redrawn at the current size with this prompt and the old render is gone. For a reroll, attach the committed `dev-sam-sheet.jpg` as both references.

Attach: `DEV` (the character and the size).

```text
Redraw the character from the first attached sheet (the hoodie
character) as a new six-pose model sheet, at exactly the size and pixel
size of the figures in the second attached sheet (the striped-shirt
character): the same figure height, the same pixel size, the same
drawing style and outline weight. Keep the character exactly as he is:
the same face, hair, skin tone, build, hoodie, headphones, trousers and
shoes. Do not take anything from the second sheet except the size and
the style.

Character: a software developer, a young man in his mid twenties, East
Asian, short black hair, a round friendly face. A steel-blue zip hoodie
with the drawstrings hanging, black headphones around the neck, dark
navy trousers, grey sneakers. In one hand a laptop with three small
plain colour stickers on the lid, no logo.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible. Big
simple shapes, detail suggested with a few pixels. Three or four shades
per material, a dark outline only on the silhouette, a limited palette.
Plain flat dark background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, front three-quarter view
facing to the right, clear gaps between the figures, nothing touching
the edge of the image. Left to right:
1. idle: standing, weight on one leg, the laptop closed under one arm,
   looking right.
2. talking: mouth open, the free hand turned palm up as if the answer is
   obvious.
3. taunt: leaning forward, the laptop opened and turned towards the right
   as if showing the screen, the other hand pointing at it.
4. flinch: leaning back, eyes shut, the laptop clutched to the chest.
5. win: the laptop held up high in one hand, the other fist raised.
6. lose: shoulders dropped, head down, the laptop hanging open from one
   hand.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: a figure still shorter than Jo's, a logo on the laptop (the old sheet has one), the hoodie changing colour, the face drifting towards the striped-shirt character.

### Dev, look two: Lena (`dev-lena-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a software developer, a woman in her mid twenties, pale
freckled skin, long red hair in a messy high ponytail with strands
loose at the sides, a slightly tired half-smile. An olive-green zip
hoodie worn open over a black band t-shirt with a single abstract
white shape on it, black headphones around the neck, dark grey cargo
trousers, chunky black boots. In one hand a laptop with three small
plain colour stickers on the lid.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing, weight on one leg, the laptop closed under one arm,
   looking right.
2. talking: mouth open, the free hand turned palm up as if the answer is
   obvious.
3. taunt: leaning forward, the laptop opened and turned towards the right
   as if showing the screen, the other hand pointing at it.
4. flinch: leaning back, eyes shut, the laptop clutched to the chest.
5. win: the laptop held up high in one hand, the other fist raised.
6. lose: shoulders dropped, head down, the laptop hanging open from one
   hand.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: a blue hoodie or any resemblance to the attached character, the ponytail changing length, letters on the t-shirt or stickers, a laptop with a logo.

### Designer, look one: Ines (`designer-ines-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a product designer, a woman in her late twenties, light
olive skin, very upright and composed, the posture of someone who has
already noticed what is wrong with your font. Dark hair in a tight high
bun, large round glasses, one thin gold earring, a black turtleneck,
wide cream trousers cropped above the ankle, bright yellow socks, flat
black shoes. In the left hand a drawing tablet held like a tray, in the
right hand a stylus held like a cigarette holder. The tablet screen is
a plain pale rectangle.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing very straight, tablet level, stylus held up, looking
   right.
2. talking: mouth open, the stylus drawing a small circle in the air.
3. taunt: leaning in, the stylus pointed at eye level, glasses pushed up
   with one finger.
4. flinch: leaning back, eyes shut, tablet hugged to the chest.
5. win: chin up, eyes closed, the stylus raised like a conductor's baton,
   one foot slightly forward.
6. lose: head down, glasses taken off and held at the side, tablet
   hanging from the other hand.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: glasses missing in a cell, the bun changing shape, trousers changing length, a tablet that becomes a laptop.

### Designer, look two: Theo (`designer-theo-sheet.jpg`)

Attach: `HEADER`, `DEV`.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a product designer, a man in his early thirties, very
tall and thin, dark skin, a precise flat-top haircut, thin gold-rimmed
round glasses, a small silver ring, an expression of polite doubt. A
camel-coloured overshirt worn open over a plain white t-shirt, slim
black trousers, white sneakers. In the left hand a drawing tablet held
like a tray, in the right hand a stylus held like a cigarette holder.
The tablet screen is a plain pale rectangle.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing very straight, tablet level, stylus held up, looking
   right.
2. talking: mouth open, the stylus drawing a small circle in the air.
3. taunt: leaning in, the stylus pointed at eye level, glasses pushed up
   with one finger.
4. flinch: leaning back, eyes shut, tablet hugged to the chest.
5. win: chin up, eyes closed, the stylus raised like a conductor's baton,
   one foot slightly forward.
6. lose: head down, glasses taken off and held at the side, tablet
   hanging from the other hand.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: the flat-top turning into ordinary short hair, the overshirt closing or changing colour, a figure drawn taller than the attached sheet to match the description.

### The Stakeholder (`boss-sheet.jpg`)

Attach: `HEADER`, `DEV`.

The Stakeholder never looks up. Five of the six cells are played to the phone; the lose cell is the one time the face is fully visible, and it has to read as a surprise.

```text
Draw a pixel-art character model sheet of a NEW character for the same
game as the attached sheet. The attached sheet is only the reference for
pixel size, drawing style, outline weight and figure height. The new
character must be a clearly different person: different face, hair, skin
tone, build, age and clothes. Do not reuse anything of the attached
character's appearance.

Character: a senior stakeholder, a man in his fifties, broad and heavy,
pink-pale skin, grey hair combed back with a widow's peak, in a grey
suit that is a size too generous, white shirt, a dark tie loosened one
notch, shiny black shoes, a heavy watch. A phone is glued to the right
hand and held up at chest height in every pose; the head is tilted down
towards it so the eyes are hidden under the brow, except in the last
pose. The phone screen is a plain glowing pale blue rectangle.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Three or four shades per material, a dark
outline only on the silhouette, a limited palette. Plain flat dark
background, no floor, no shadow, no frame.

Layout: the same character six times side by side in a single row,
identical in size, colours and clothing, the same height as the figures
in the attached sheet, front three-quarter view facing to the right,
clear gaps between the figures, nothing touching the edge of the image.
Left to right:
1. idle: standing square, reading the phone, free hand in the trouser
   pocket.
2. talking: mouth open but still looking at the phone, the free hand
   making a vague circular "go on" gesture.
3. taunt: the phone raised a little higher as if showing the screen,
   free hand palm up, a half smile, still not looking up.
4. flinch: a small jolt, the phone nearly dropped and caught, the free
   hand out for balance, eyes still down.
5. win: a thumbs up with the free hand without looking up, phone back at
   the chest.
6. lose: the head lifted for the first time, eyes wide and fully
   visible, mouth slightly open, the phone lowered to the hip.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: the eyes visible in any cell but the last, the phone missing in a cell, the suit changing colour, a figure taller than the attached sheet (suits tempt Gemini into drawing bigger).

### The onboarding buddy's ghost (`ghost-sheet.jpg`)

Attach: `HEADER`, `DEV`.

The ghost of the player's predecessor, who appears behind the player's shoulder when they hesitate on defence (see the spec, The onboarding buddy). Three cells, not six: it only hovers and points. Gemini cannot render transparency, so the sheet is opaque and the canvas draws it at reduced opacity with a cool tint; the colours below are the opaque base. It has no legs, so its cell is shorter than the others; `sheet.mjs` aligns it on the head, not on a feet line.

```text
Draw a pixel-art model sheet of a NEW character for the same game as the
attached sheet. The attached sheet is only the reference for pixel size,
drawing style and outline weight. The new character is a ghost and must
not look like the attached person.

Character: the friendly ghost of a former office worker, a little
shorter than the attached figures, head and shoulders and a tapered
body that frays into three wisps where the legs would be, hovering. No
legs, no feet. Pale, cold colours only: three shades of pale cyan and
white for the whole figure, a darker teal outline. A faint lanyard with
a blank badge around the neck, the one thing from its old life. A
small, kind, slightly smug face: two dot eyes, a thin smile. Everything
else is simple.

Style: a 16-bit pixel-art sprite sheet from a 1990s point-and-click
adventure game, as it looked on screen at 320x200. Not modern
high-resolution pixel art. Every pixel is big and clearly visible, the
same pixel size as the attached sheet. Big simple shapes, detail
suggested with a few pixels. Plain flat dark background, no floor, no
shadow, no glow, no frame.

Layout: the same ghost three times side by side in a single row,
identical in size and colours, front three-quarter view facing to the
right, clear gaps between the figures, nothing touching the edge of the
image. Left to right:
1. hover: arms folded, body straight.
2. hover, second frame: the same pose with the wisps swung a little to
   the other side and the body one notch higher, for a two-frame float.
3. point: one arm out to the right, finger extended, the smile a touch
   wider.

No text, letters, numbers, logos, UI, borders, frames or signatures.
```

Reroll on: legs or feet, a glow or halo (the canvas adds the translucency), a figure as tall as the attached ones or taller, warm colours anywhere but the badge.

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

#### Open-plan floor, second roll

The first roll (`scene-floor.jpg`) failed on two counts: Gemini drew it at a coarser pixel size than the other three scenes (it snaps to 305 pixels wide instead of about 458), and both desk islands reach a third of the way into the frame, straight through the areas where the duellists stand. Same chat, paste this as the follow-up, and attach `scene-meeting.jpg` as a second reference for the pixel size:

```text
Redraw this scene with two changes. First, the pixel size: use exactly
the pixel size of the second attached image (the meeting room), finer
than this one, so the scene is about 480 pixels wide. Second, the
composition: both desk islands move out to the edges and get narrower,
each one inside the outer eighth of the frame, seen more from the side,
so that the aisle of plain carpet takes the middle three quarters of
the width. The shelf with the tower lamp and the duck, the whiteboard
with boxes and arrows, the windows, the dying plant and the pizza box
stay. Nothing stands on the carpet between the two islands. Same
style, same colours, same lighting.
```

Reroll on: desks still past the outer eighth, a pixel size that still snaps coarser than the meeting room.

#### Open-plan floor, third roll: new chat

The second roll (kept as `originals/scene-floor-v2.jpeg`) came back at the same coarse pixel size with the desks still at 40 percent of the width: Gemini anchors to its own previous image inside a chat. So the third roll is a fresh chat, with `scene-meeting.jpg` attached as the one reference (it carries the right pixel size and the house style) and the camera pulled back, which shrinks the furniture without arguing about percentages.

Attach: `scene-meeting.jpg` only.

```text
Create a new pixel-art scene in exactly the same visual style and at
exactly the same pixel size as the attached image: the same chunky
low-resolution look, the same size of pixel, the same simple shapes,
shading and muted colours. Do not copy its content or its layout.

Style: a 16-bit pixel-art background from a 1990s point-and-click
adventure game, as it looked on screen. Not modern high-resolution pixel
art. The whole image is about 480 pixels wide, the same as the attached
image, so every pixel is clearly visible. Big simple shapes; detail
suggested with a few pixels, not drawn out. Three or four shades per
material, dark outlines only where needed, a limited palette of about
32 colours, ordered dithering in shadows. No people.

Scene: a wide, mostly empty open-plan software office floor, late
afternoon, seen straight on from far back in the aisle so that the room
looks spacious. The back wall is a row of tall windows with the blinds
half down and a blue-grey sky behind. On the back wall in the centre, a
small shelf with a tower lamp with a red and a green bulb, the kind that
shows whether the build passed, and a rubber duck next to it, and above
the shelf a small whiteboard with only boxes and arrows on it. The
desks are far away at the sides: one small desk island at the far left
edge and one at the far right edge, each seen from the side, each
taking up only a narrow strip at the edge of the frame, with a monitor
seen from behind as a plain dark rectangle and a chair pushed in. A
potted plant that has given up on the right desk, a closed pizza box on
the left one. Between the two desks, the whole middle of the floor is
wide, empty, plain grey-brown carpet with nothing on it.

Composition: 16:9 frame. The top 15 percent is plain ceiling with a
strip of long fluorescent lights, the bottom 17 percent is plain carpet
with nothing on it. The left-centre and the right-centre of the frame,
from a fifth of the height down to the floor, show only plain carpet
and the plain back wall with its windows, because two figures will
stand there later. The two desk islands stay inside the outer eighth
of the frame on each side as dark framing shapes and reach no further
in. The shelf and the whiteboard sit in the middle between the two
empty areas. The outer edge columns of the image are plain and simple.

Light and colour: cool blue-grey daylight from the windows behind, with
warm orange light spilling from the two monitors onto the two desks.
Deep blue shadows under the desks.

Small details that will be animated later, keep them small and set
against plain dark areas: the red and green bulbs of the tower lamp
against the plain back wall, the glow of the left monitor on its desk,
the two leaves of the dying plant against the dark window blind.

No text, letters, numbers, signs with writing, UI, window chrome,
borders, frames or signatures.
```

Reroll on: desks past the outer eighth, a pixel size that snaps coarser than the meeting room (check with the snap script: it must say a 6 px grid and about 458 wide).

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

## Logo (`logo.jpg`)

The wordmark for the start screen, the lab index and the link preview. The first render (plain shoved letters, kept in `sources/originals/logo.jpeg`) read fine but said nothing about the game. The logo should carry the page: the two duellists, the lines they throw, the office. Two prompts on that brief; A is the one to try first. Pick by the thumbnail test: shrink the result to a quarter and see whether it still reads as a word. Generated on a plain dark background like a sheet and keyed the same way.

Size: the render snaps to a 240 by 133 grid; the mark should fill about four fifths of the width, so around 190 by 70 art pixels with the tails. On the stage (320 wide) that is two thirds of the band. Nothing else in the frame.

Attach: `HEADER`, and a model sheet for the colours of the people.

### A: two bubbles, one shove

The game in one picture: two speech bubbles slam into each other. PUSH comes from the left in the window's cream, BACK from the right in the opponent's ember, and where they meet both are dented in, with a small pixel impact star at the join (the mic-drop burst's little cousin). Each bubble's tail points down and outward, to where the two duellists stand on the start screen, so the logo sits over the people like their lines do in the duel.

```text
Draw a pixel-art video game logo in the style of the attached image: the
same pixel size, the same hard-edged outlines, the same limited palette.
Plain, flat, very dark background, nothing else in the frame.

The logo is two comic speech bubbles colliding head-on in the middle of
the frame, the pair together filling about four fifths of the width.
The left bubble is warm cream with a one-pixel black outline and holds
the word PUSH in heavy dark navy pixel capitals; its tail points down
and to the left. The right bubble is burnt orange with the same outline
and holds the word BACK in heavy cream pixel capitals; its tail points
down and to the right. Where the two bubbles meet, both edges are dented
and crumpled into each other by a few pixels, the orange bubble pushed
slightly back and tilted, and a small jagged pixel impact star in pale
yellow sits at the point of contact, overlapping both outlines. Both
bubbles cast a hard two-pixel drop shadow down and to the right. The
letters are big, blocky, 1990s adventure-game title lettering, and fill
their bubbles. No gradients, no glow, no bevels, no blur, no texture:
flat colours, one outline, one shadow. No other words, no tagline, no
characters, no icons beyond the one impact star.
```

### B: on the whiteboard

The meeting room's whiteboard with the title written on it in marker, the way a sprint name ends up on a board, and the scale drawn under it as a tug-of-war arrow. On the start screen the logo sits on the meeting scene's actual whiteboard. Quieter; reads smaller in a thumbnail.

```text
Draw a pixel-art video game logo in the style of the attached image: the
same pixel size, the same hard-edged outlines, the same limited palette.
Plain, flat, very dark background, nothing else in the frame.

The logo is the word PUSHBACK hand-lettered in thick dark blue
whiteboard-marker capitals, slightly uneven like real marker writing,
with a red marker underline that is a double-headed arrow with a small
pointer mark pushed to the right of its middle, like a scale tipped to
one side. Over the top-right corner of the word, a small yellow sticky
note is stuck at a slight angle, blank. The word fills about four fifths
of the frame's width. The marker strokes have a one-pixel darker edge
so they read as drawn on a surface. No board, no frame, no wall: just
the lettering, the arrow and the note on the plain dark background. No
gradients, no glow, no blur: flat colours. No other words, no tagline,
no characters.
```

What to check: the word reads at a quarter size; the pixel size matches the header (if the letters look finer, use the half-resolution follow-up); the outline is one colour and closed; the shadow is hard, not blurred; nothing touches the frame edge; in A, both words are legible and the dent is at the join, not somewhere else. The orange should be the ember of the HUD (around #f0a36f) and the cream its frame (#f3eedc); a different warm pair is fine, the stage takes the logo's colours, not the other way round. Cut it with `sheet.mjs` once it keeps every letter: the letters are separate groups and the cutter joins the largest ones, so a `--cells 1 --specks 0` run with the shadow connecting the letters is the first thing to try, and a `logo.mjs` that keys the background and keeps everything is the fallback.

## Mic drop burst (`micdrop-sheet.jpg`)

The comic burst that goes off between the duellists on a mic drop: the loudest thing in the game. Three cells on a plain dark background like a model sheet, keyed and cut the same way (`--cells 3 --cell 112x64 --anchor centre --specks 0`, the letters are inside the burst so they key with it). About 90 by 50 art pixels per cell, roughly a third of the band's width; nothing else in the frame.

Attach: `HEADER` and, once it exists, the logo, so the lettering matches.

```text
Draw a pixel-art sprite sheet in the style of the attached image: the
same pixel size, the same hard-edged outlines, the same limited palette.
Plain, flat, very dark background, nothing else in the frame. Three
versions of one comic-book burst in a row, left to right, with clear
gaps between them.

The burst is a jagged starburst shape like a comic sound effect, with
about fourteen uneven spikes, filled in bright gold with a burnt orange
rim and a one-pixel black outline, and a hard two-pixel drop shadow down
and to the right. Inside it, the words MIC DROP in two rows of heavy
pixel capitals, dark navy with a one-pixel cream highlight along the top
of each letter, slightly tilted as if shouted.

Left: the burst as described. Middle: the same burst one step bigger,
the spikes longer and the letters tilted a little more, as on the loud
beat of a pulse. Right: the burst popped: the outline torn open in two
places, a few spikes bent over, the letters sagging and cracked, a
couple of small loose fragments beside it. All three the same style, the
same colours, the same pixel size. No gradients, no glow, no blur: flat
colours, one outline, one shadow. No other words.
```

What to check: the letters are legible at a quarter size; the three cells share one pixel size; the popped cell is still the same burst, not a different object; nothing touches the frame edge. The gold should be the player's HUD gold (#f2c14e) and the rim the ember (#f0a36f), close is fine.

## Follow-ups, in the same chat

Gemini edits can shift other pixels, so compare the follow-up against the first version before saving it.

- The character looks like the attached one (same face, hair or clothes):
  `This is too close to the reference character. Keep the pixel size, the style and the six poses exactly, but redraw the person as described: <paste the Character paragraph>. Different face, different hair, different skin tone, different clothes.`
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
