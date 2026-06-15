/**
 * Helper centralitzat per construir les rutes als mockups de samarretes.
 *
 * Convencions:
 *  - Directoris (carpetes): paraules separades per "_"  (ex: the_human_inside, gradient_light)
 *  - Noms de fitxer:        paraules separades per "-"  (ex: the-human-inside-vader-black-b.webp)
 *
 * Estructura al filesystem (sota /public):
 *   /placeholders/apparel/mockups/<col_dir>/<sub_dir?>/<design_dir>/<filename>.webp
 *
 * Format del filename:
 *   <prefix>-<design>-<frameColor?>-<shirtColor>-<ink>.webp
 *   on:
 *     - prefix      = identificador de col·lecció (amb guions)
 *     - design      = id del disseny (amb guions; igual al directori però amb '-' en lloc de '_')
 *     - frameColor  = només per a austen-looking-for-my-darcy
 *     - shirtColor  = un dels SHIRT_COLORS
 *     - ink         = 'b' (negre) | 'w' (blanc) | 'multi' (color)
 */

export const SHIRT_COLORS = [
  'white',
  'light-blue',
  'royal',
  'navy',
  'purple',
  'light-pink',
  'daisy',
  'gold',
  'red',
  'kiwi',
  'irish-green',
  'military-green',
  'forest-green',
  'black',
];

export const INK_BLACK = 'b';
export const INK_WHITE = 'w';
export const INK_MULTI = 'multi';
export const INKS = [INK_BLACK, INK_WHITE, INK_MULTI];

const PUBLIC_BASE = '/placeholders/apparel/mockups';

// Helper: convertir id (amb guions) a nom de directori (amb underscores)
const toDir = (id) => String(id).replace(/-/g, '_');

/**
 * Catàleg de col·leccions. Cada entrada defineix:
 *   - dir:        carpeta arrel relativa a /placeholders/apparel/mockups
 *   - prefix:     prefix dels filenames (amb guions)
 *   - inks:       tintes disponibles
 *   - designs:    llista d'ids de disseny (amb guions, lowercase)
 *   - frameColors (opcional, només LFMD)
 */
export const COLLECTIONS = {
  'first-contact': {
    dir: 'first_contact',
    prefix: 'first-contact',
    inks: [INK_BLACK, INK_WHITE],
    designs: [
      'ncc-1701',
      'ncc-1701-d',
      'nx-01',
      'plasma-escape',
      'the-phoenix',
      'vulcans-end',
      'wormhole',
    ],
  },
  'the-human-inside': {
    dir: 'the_human_inside',
    prefix: 'the-human-inside',
    inks: [INK_BLACK, INK_WHITE],
    designs: [
      'afrodita-a',
      'c3-p0',
      'cyberman',
      'cylon-03',
      'cylon-78',
      'iron-man-08',
      'iron-man-68',
      'maschinenmensch',
      'mazinger-z',
      'robbie-the-robot',
      'robocop',
      'terminator',
      'vader',
    ],
  },
  miscellania: {
    dir: 'miscellania',
    prefix: 'miscellania',
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: [
      'arthur-d-the-second',
      'death-star2d2',
      'dj-vader',
      'pont-del-diable',
      'r2d2-quote',
    ],
  },
  cube: {
    dir: 'cube/cube',
    prefix: 'cube',
    inks: [INK_MULTI],
    designs: [
      '3cube-p0',
      'afrodita-c',
      'cybercube',
      'cylon-cube',
      'darth-cube',
      'iron-cube',
      'iron-kong',
      'maschinenmensch',
      'mazinger-c',
      'robocube',
    ],
  },
  'austen-pemberley': {
    dir: 'austen/pemberley',
    prefix: 'austen-pemberley',
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: ['house'],
  },
  'austen-quotes': {
    dir: 'austen/quotes',
    prefix: 'austen-quotes',
    inks: [INK_BLACK, INK_WHITE],
    designs: [
      'half-agony-half-hope',
      'i-admire-and-love-you',
      'it-is-a-truth',
      'unsociable-and-taciturn',
      'you-have-bewitched-me',
    ],
  },
  'austen-crosswords': {
    dir: 'austen/crosswords',
    prefix: 'austen-crosswords',
    inks: [INK_BLACK, INK_WHITE],
    designs: [
      'persuasion-1',
      'persuasion-2',
      'persuasion-3',
      'persuasion-4',
      'pride-and-prejudice-1',
      'pride-and-prejudice-2',
      'pride-and-prejudice-3',
      'pride-and-prejudice-4',
      'sense-and-sensibility-1',
      'sense-and-sensibility-2',
      'sense-and-sensibility-3',
      'sense-and-sensibility-4',
    ],
  },
  'austen-keep-calm': {
    dir: 'austen/keep_calm',
    prefix: 'austen-keep-calm',
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: ['poster', 'solid'],
  },
  'austen-looking-for-my-darcy': {
    dir: 'austen/looking_for_my_darcy',
    prefix: 'austen-looking-for-my-darcy',
    inks: [INK_MULTI],
    designs: ['frame', 'gradient-dark', 'gradient-light', 'solid'],
    frameColors: ['blau', 'vermell', 'groc', 'carabassa', 'fucsia'],
  },
};

/** Llista d'ids de col·lecció disponibles. */
export function listCollections() {
  return Object.keys(COLLECTIONS);
}

/** Retorna la definició de col·lecció (o null). */
export function getCollection(collectionId) {
  return COLLECTIONS[collectionId] || null;
}

/** Llista de dissenys d'una col·lecció. */
export function listDesigns(collectionId) {
  return COLLECTIONS[collectionId]?.designs ?? [];
}

/** Llista de tintes vàlides per a una col·lecció. */
export function listInks(collectionId) {
  return COLLECTIONS[collectionId]?.inks ?? [];
}

/**
 * Construeix la ruta pública a un mockup.
 * Retorna null si els paràmetres no són vàlids per a la col·lecció.
 *
 * @param {Object} opts
 * @param {string} opts.collection   id de col·lecció (ex: 'the-human-inside')
 * @param {string} opts.design       id de disseny (ex: 'vader')
 * @param {string} opts.shirtColor   color de samarreta (ex: 'black')
 * @param {string} opts.ink          'b' | 'w' | 'multi'
 * @param {string} [opts.frameColor] obligatori per a 'austen-looking-for-my-darcy'
 * @returns {string|null}
 */
export function getMockupPath({ collection, design, shirtColor, ink, frameColor } = {}) {
  const def = COLLECTIONS[collection];
  if (!def) return null;
  if (!def.designs.includes(design)) return null;
  if (!def.inks.includes(ink)) return null;
  if (!SHIRT_COLORS.includes(shirtColor)) return null;

  const designDir = toDir(design);
  let filename;
  if (def.frameColors) {
    if (!def.frameColors.includes(frameColor)) return null;
    filename = `${def.prefix}-${design}-${frameColor}-${shirtColor}-${ink}.webp`;
  } else {
    filename = `${def.prefix}-${design}-${shirtColor}-${ink}.webp`;
  }
  return `${PUBLIC_BASE}/${def.dir}/${designDir}/${filename}`;
}

/**
 * Llista totes les variants possibles d'un disseny (totes les combinacions de
 * shirtColor × ink × frameColor segons la col·lecció).
 */
export function listVariants({ collection, design }) {
  const def = COLLECTIONS[collection];
  if (!def || !def.designs.includes(design)) return [];
  const out = [];
  const frames = def.frameColors ?? [null];
  for (const frameColor of frames) {
    for (const ink of def.inks) {
      for (const shirtColor of SHIRT_COLORS) {
        const path = getMockupPath({
          collection,
          design,
          shirtColor,
          ink,
          ...(frameColor ? { frameColor } : {}),
        });
        if (path) out.push({ collection, design, shirtColor, ink, frameColor, path });
      }
    }
  }
  return out;
}
