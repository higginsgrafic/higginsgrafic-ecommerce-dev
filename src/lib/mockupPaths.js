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

// Helper: derivar el prefix del filename a partir del directori.
// El prefix sempre és el path del directori amb separadors normalitzats a '-'.
//   first_contact                       -> first-contact
//   miscellania/death_star2d2           -> miscellania-death-star2d2
//   austen/crosswords/pride_and_prejudice -> austen-crosswords-pride-and-prejudice
const prefixFromDir = (dir) => String(dir).replace(/[/_]/g, '-');

/**
 * Catàleg de col·leccions, sincronitzat amb l'estructura REAL de fitxers a
 * /public/placeholders/apparel/mockups/ (font de veritat).
 *
 * Format de fitxer (PLA, sense subcarpeta de disseny):
 *   <dir>/<prefix>-<design>-<ink>-<shirtColor>.<ext>
 * on prefix = prefixFromDir(dir).
 *
 * Cada entrada defineix:
 *   - dir:     carpeta fixa (relativa a PUBLIC_BASE) — o bé
 *   - dirFor:  funció (design) => carpeta, per col·leccions amb subcarpeta per disseny
 *   - inks:    tintes disponibles ('b' | 'w' | 'multi')
 *   - designs: ids de disseny EXACTAMENT com apareixen al filename (després del prefix)
 *   - ext:     extensió per defecte ('webp') — o bé
 *   - extFor:  mapa { [design]: ext } per excepcions (p.ex. .png)
 */
export const COLLECTIONS = {
  'first-contact': {
    dir: 'first_contact',
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
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
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: [
      'afrodita',
      'c3p0',
      'cyberman',
      'cylon-03',
      'cylon-78',
      'iron-man-08',
      'iron-man-68',
      'maschinenmensch',
      'mazinger',
      'r2d2',
      'robbie-the-robot',
      'robocop',
      'terminator',
      'the-dalek',
      'vader',
    ],
  },
  miscellania: {
    // Cada disseny viu a la seva pròpia subcarpeta: miscellania/<design_>
    dirFor: (design) => `miscellania/${toDir(design)}`,
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    extFor: { 'death-star2d2': 'png' },
    designs: [
      'arthur-d-the-second',
      'death-star2d2',
      'dj-vader',
      'pont-del-diable',
      'r2d2-quote',
    ],
  },
  cube: {
    dir: 'cube',
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
      'robbocube',
    ],
  },
  'austen-pemberley': {
    dir: 'austen/pemberley',
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: ['pemberley-house'],
  },
  'austen-quotes': {
    dir: 'austen/cites/quotes',
    inks: [INK_BLACK, INK_WHITE],
    designs: [
      'quotes-half-agony-half-hope',
      'quotes-i-admire-and-love-you',
      'quotes-it-is-a-truth',
      'quotes-unsociable-and-taciturn',
      'quotes-you-have-bewitched-me',
    ],
  },
  'austen-crosswords': {
    // Cada subcol·lecció (persuasion / pride-and-prejudice / sense-and-sensibility)
    // viu a austen/crosswords/<subcol_>; el disseny és <subcol>-<N>.
    dirFor: (design) => `austen/crosswords/${toDir(design.replace(/-\d+$/, ''))}`,
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
    inks: [INK_BLACK, INK_WHITE, INK_MULTI],
    designs: ['keep-calm'],
  },
  'austen-looking-for-my-darcy': {
    dir: 'austen/cites/looking_for_my_darcy',
    inks: [INK_MULTI],
    designs: [
      'looking-for-my-darcy-blue-solid',
      'looking-for-my-darcy-pink-solid',
      'looking-for-my-darcy-pink-yellow-frame',
      'looking-for-my-darcy-red-solid',
      'looking-for-my-darcy-red-yellow-frame',
      'looking-for-my-darcy-yellow-blue-frame',
      'looking-for-my-darcy-yellow-pink-frame',
      'looking-for-my-darcy-yellow-solid',
    ],
  },
};

// Resol el directori i el prefix per a una col·lecció + disseny.
function resolveDir(def, design) {
  const dir = def.dirFor ? def.dirFor(design) : def.dir;
  return { dir, prefix: def.prefix || prefixFromDir(dir) };
}

// Resol l'extensió per a una col·lecció + disseny.
function resolveExt(def, design) {
  return (def.extFor && def.extFor[design]) || def.ext || 'webp';
}

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
 * @returns {string|null}
 */
export function getMockupPath({ collection, design, shirtColor, ink } = {}) {
  const def = COLLECTIONS[collection];
  if (!def) return null;
  if (!def.designs.includes(design)) return null;
  if (!def.inks.includes(ink)) return null;
  if (!SHIRT_COLORS.includes(shirtColor)) return null;

  const { dir, prefix } = resolveDir(def, design);
  const ext = resolveExt(def, design);
  // Estructura PLA: <dir>/<prefix>-<design>-<ink>-<shirtColor>.<ext>
  const filename = `${prefix}-${design}-${ink}-${shirtColor}.${ext}`;
  return `${PUBLIC_BASE}/${dir}/${filename}`;
}

/**
 * Llista totes les variants possibles d'un disseny (totes les combinacions de
 * shirtColor × ink segons la col·lecció).
 */
export function listVariants({ collection, design }) {
  const def = COLLECTIONS[collection];
  if (!def || !def.designs.includes(design)) return [];
  const out = [];
  for (const ink of def.inks) {
    for (const shirtColor of SHIRT_COLORS) {
      const path = getMockupPath({ collection, design, shirtColor, ink });
      if (path) out.push({ collection, design, shirtColor, ink, path });
    }
  }
  return out;
}
