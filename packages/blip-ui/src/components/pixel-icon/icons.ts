/**
 * The icons as data, pixel for pixel (`PixelIcon` draws them at `DOT`),
 * in the primary colour so they are found on the dark ground: an ink
 * outline (`K`), lit on top (`Y`), the face (`G`), in shade below (`O`).
 * The speaker has two waves beside it (`W`), or a red cross (`X`) when the
 * sound is off.
 */
export const ICONS = {
  soundOn: [
    '.........K......',
    '........KK...W..',
    '.......KYK....W.',
    '......KYYK.W...W',
    'KKKKKKYYGK..W..W',
    'KYYYYKYGGK..W..W',
    'KGGGGKGGGK..W..W',
    'KOOOOKGOOK..W..W',
    'KKKKKKOOOK..W..W',
    '......KOOK.W...W',
    '.......KOK....W.',
    '........KK...W..',
    '.........K......',
  ],
  soundOff: [
    '.........K......',
    '........KK......',
    '.......KYK......',
    '......KYYK......',
    'KKKKKKYYGK.X...X',
    'KYYYYKYGGK..X.X.',
    'KGGGGKGGGK...X..',
    'KOOOOKGOOK..X.X.',
    'KKKKKKOOOK.X...X',
    '......KOOK......',
    '.......KOK......',
    '........KK......',
    '.........K......',
  ],
  back: [
    '.....K.......',
    '....KYK......',
    '...KYGK......',
    '..KYGGKKKKKK.',
    '.KYGGGYYYYYYK',
    'KGGGGGGGGGGGK',
    '.KOGGGOOOOOOK',
    '..KOGGKKKKKK.',
    '...KOGK......',
    '....KOK......',
    '.....K.......',
  ],
  pause: [
    'KKKK..KKKK',
    'KYYK..KYYK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KOOK..KOOK',
    'KKKK..KKKK',
  ],
  // Four corners pointing out, and pointing in to leave
  fullscreen: [
    'KKKKK...KKKKK',
    'KYYYK...KYYYK',
    'KYKKK...KKKYK',
    'KYK.......KYK',
    'KKK.......KKK',
    '.............',
    '.............',
    '.............',
    'KKK.......KKK',
    'KGK.......KGK',
    'KGKKK...KKKGK',
    'KOOOK...KOOOK',
    'KKKKK...KKKKK',
  ],
  exitFullscreen: [
    '..KYK...KYK..',
    '..KYK...KYK..',
    'KKKYK...KYKKK',
    'YYYYK...KYYYY',
    'KKKKK...KKKKK',
    '.............',
    '.............',
    '.............',
    'KKKKK...KKKKK',
    'GGGGK...KGGGG',
    'KKKGK...KGKKK',
    '..KOK...KOK..',
    '..KOK...KOK..',
  ],
} as const;

/** The name of an icon in `ICONS` */
export type IconName = keyof typeof ICONS;

/** The colour role of each letter in an icon's rows */
export const ICON_COLOURS: Record<string, string> = {
  K: 'var(--bui-ground)',
  Y: 'var(--bui-primary-light)',
  G: 'var(--bui-primary)',
  O: 'var(--bui-primary-shade)',
  W: 'var(--bui-primary-light)',
  X: 'var(--bui-danger)',
};
