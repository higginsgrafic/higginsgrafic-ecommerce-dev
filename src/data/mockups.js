import { CERCADOR_COLORS as _CERCADOR_COLORS, COLLECTIONS, CONTROL_TILE_BN, CONTROL_TILE_ARROWS, getCollectionItems } from './collections.js';

const CERCADOR_COLORS = _CERCADOR_COLORS;

const MOCKUP_BASE = '/placeholders/apparel/mockups';

const INK_CODE = { black: 'b', white: 'w', color: 'multi' };

const DRAWING_SLUGS = {
  first_contact: {
    'NX-01': 'nx-01',
    'NCC-1701': 'ncc-1701',
    'NCC-1701-D': 'ncc-1701-d',
    'Wormhole': 'wormhole',
    'Plasma Escape': 'plasma-escape',
    "Vulcan's End": 'vulcans-end',
    'The Phoenix': 'the-phoenix',
  },
  the_human_inside: {
    'R2-D2': 'r2d2',
    'The Dalek': 'the-dalek',
    'C3P0': 'c3p0',
    'Vader': 'vader',
    'Afrodita': 'afrodita',
    'Mazinger': 'mazinger',
    'Cylon 78': 'cylon-78',
    'Cylon 03': 'cylon-03',
    'Iron Man 68': 'iron-man-68',
    'Iron Man 08': 'iron-man-08',
    'Cyberman': 'cyberman',
    'Robocop': 'robocop',
    'Terminator': 'terminator',
    'Maschinenmensch': 'maschinenmensch',
    'Robby the Robot': 'robbie-the-robot',
  },
  cube: {
    'Afrodita C': 'afrodita-c',
    'Cube 3 P0': '3cube-p0',
    'Cyber Cube': 'cybercube',
    'Cylon Cube 03': 'cylon-cube',
    'Cylon Cube': 'cylon-cube',
    'Darth Cube': 'darth-cube',
    'Iron Kong': 'iron-kong',
    'Iron Cube 68': 'iron-cube-68',
    'MaschinenCube': 'maschinenmensch',
    'Mazinger C': 'mazinger-c',
    'RoboCube': 'robbocube',
  },
};

const COLLECTION_PREFIX = {
  first_contact: 'first-contact',
  the_human_inside: 'the-human-inside',
  cube: 'cube',
};

export function resolveMockup(collectionId, drawingLabel, variant, colorSlug) {
  const slugMap = DRAWING_SLUGS[collectionId];
  if (!slugMap) return null;
  const drawingSlug = slugMap[drawingLabel];
  if (!drawingSlug) return null;

  const inkCode = INK_CODE[variant] || 'b';
  const prefix = COLLECTION_PREFIX[collectionId];

  return `${MOCKUP_BASE}/${collectionId}/${prefix}-${drawingSlug}-${inkCode}-${colorSlug}.webp`;
}

export function getMockupColors(collectionId, drawingLabel, variant) {
  return CERCADOR_COLORS.map((c) => ({
    ...c,
    src: resolveMockup(collectionId, drawingLabel, variant, c.slug),
  }));
}

export function getDrawingsForCollection(collectionId) {
  const items = getCollectionItems(collectionId);
  return items.filter((it) => typeof it === 'string' && !it.startsWith('/'));
}

export function getVariantsForCollection(collectionId) {
  const col = COLLECTIONS[collectionId];
  if (!col) return ['black'];
  if (col.hasVariants && col.variants.length > 0) return col.variants;
  return ['black'];
}

export { CERCADOR_COLORS, COLLECTIONS, CONTROL_TILE_BN, CONTROL_TILE_ARROWS };
