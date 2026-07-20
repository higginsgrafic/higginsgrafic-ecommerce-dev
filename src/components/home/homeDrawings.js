/**
 * homeDrawings
 * -----------------------------------------------------------------------------
 * Catàleg de dibuixos per col·lecció + planificador d'assignació per a les
 * targetes de la home (`Home`).
 *
 * Regles (request usuari):
 *  - Cada col·lecció mostra dibuixos PROPIS, aleatoris i sense repetir-se dins
 *    de la seva secció.
 *  - El color de samarreta no es repeteix a tota la pàgina (14 colors canònics);
 *    com hi ha 15 targetes, l'última fa wrap (els colors "tornen a començar").
 *  - Tres tipus d'imatge de dibuix:
 *      · negre (`black`) → visible sobre samarretes CLARES
 *      · blanc (`white`) → visible sobre samarretes FOSQUES
 *      · color/multi (`color`) → semitransparent, es barreja amb el color de la
 *        samarreta; funciona sobre qualsevol color.
 *  - Col·leccions només de color (Cube, Austen/Looking For My Darcy): s'usa la
 *    imatge de color, així poden anar sobre qualsevol samarreta.
 */

import { getMockupPath } from '@/lib/mockupPaths';
import { collectionGridHoverVariantsFor } from '@/lib/pdpMockup';

const STRIPE_BASE = '/custom_logos/drawings/images_stripe';

const bw = (collection, name, dir = collection, mockup = undefined) => ({
  id: `${collection}/${name}`,
  black: `${STRIPE_BASE}/${dir}/black/${name}-b-stripe.webp`,
  white: `${STRIPE_BASE}/${dir}/white/${name}-w-stripe.webp`,
  ...(mockup ? { mockup } : {}),
});

const colorOnly = (collection, relPath, id, mockup = undefined) => ({
  id: id || `${collection}/${relPath}`,
  color: `${STRIPE_BASE}/${relPath}`,
  ...(mockup ? { mockup } : {}),
});

// Dissenys del nou catàleg de mockups pre-composats (helper `mockupPaths.js`)
// que existeixen al filesystem. Si un dibuix té una entrada aquí, la home
// utilitzarà el mockup pre-composat (samarreta + dibuix ja imprimits) en lloc
// del sistema d'overlay. Si no, es manten el fallback d'overlay.

// --- First Contact (negre + blanc) -----------------------------------------
// Tots tenen mockup; el design id coincideix amb el filename.
const FIRST_CONTACT = [
  'nx-01', 'ncc-1701', 'ncc-1701-d', 'wormhole', 'plasma-escape', 'vulcans-end', 'the-phoenix',
].map((n) => bw('first_contact', n, 'first_contact', { collection: 'first-contact', design: n }));

// --- The Human Inside (negre + blanc + multi) -------------------------------
// Tots tenen mockup pre-composat al disc (inclosos r2d2 i the-dalek).
// Els ids "stripe" de la home divergeixen dels ids de fitxer del helper.
const THI_DESIGN_MAP = {
  'afrodita-a': 'afrodita',
  'c3-p0': 'c3p0',
  'mazinger-z': 'mazinger',
  'r2-d2': 'r2d2',
};
const THE_HUMAN_INSIDE = [
  'afrodita-a', 'c3-p0', 'cyberman', 'cylon-03', 'cylon-78', 'iron-man-08', 'iron-man-68',
  'maschinenmensch', 'mazinger-z', 'r2-d2', 'robbie-the-robot', 'robocop', 'terminator',
  'the-dalek', 'vader',
].map((n) => bw('the_human_inside', n, 'the_human_inside',
  { collection: 'the-human-inside', design: THI_DESIGN_MAP[n] || n }));

// --- Miscel·lània (negre + blanc) -------------------------------------------
// Els 3 dibuixos del catàleg coincideixen amb el disc.
const MISCELLANIA = [
  'death-star2d2', 'dj-vader', 'pont-del-diable',
].map((n) => bw('miscellania', n, 'miscellania', { collection: 'miscellania', design: n }));

// --- Cube (només color) ------------------------------------------------------
// Els ids del catàleg (amb sufix `-stripe`) no són els ids del nou helper.
// Aquest mapeig converteix el primer en el segon.
const CUBE_DESIGN_MAP = {
  'afrodita-c-stripe': 'afrodita-c',
  'cube-3-p0-stripe': '3cube-p0',
  'cyber-cube-stripe': 'cybercube',
  'cylon-cube-03-stripe': 'cylon-cube',
  'darth-cube-stripe': 'darth-cube',
  'iron-cube-08-iron-kong-stripe': 'iron-kong',
  'iron-cube-68-stripe': 'iron-cube',
  'maschinencube-stripe': 'maschinenmensch',
  'mazinger-c-stripe': 'mazinger-c',
  'robocube-stripe': 'robbocube',
};
const CUBE = Object.entries(CUBE_DESIGN_MAP).map(([f, design]) =>
  colorOnly('cube', `cube/${f}.webp`, `cube/${f}`, { collection: 'cube', design })
);

// --- Austen (barreja: negre/blanc + només color) ----------------------------
// Subgrup d'un crossword d'Austen (no es pot repetir dins una mateixa secció).
const crosswordGroup = (n) => {
  if (n.startsWith('persuasion')) return 'crosswords/persuasion';
  if (n.startsWith('pride-and-prejudice')) return 'crosswords/pride-and-prejudice';
  if (n.startsWith('sense-and-sensibility')) return 'crosswords/sense-and-sensibility';
  return undefined;
};

// Quotes que tenen mockup pre-composat al disc (austen/cites/quotes).
const AUSTEN_QUOTES_WITH_MOCKUP = new Set([
  'half-agony-half-hope', 'i-admire-and-love-you', 'it-is-a-truth',
  'unsociable-and-taciturn', 'you-have-bewitched-me',
]);

// Mapeig de frame-color (catalàn del disc) per a LFMD.
const LFMD_FRAME_MAP = {
  'blue-solid': 'blau',
  'fuchsia-solid': 'fucsia',
  'red-solid': 'vermell',
  'yellow-solid': 'groc',
};

const AUSTEN = [
  // crosswords (negre + blanc) — tots tenen mockup
  ...[
    'persuasion-1', 'persuasion-2', 'persuasion-3', 'persuasion-4',
    'pride-and-prejudice-1', 'pride-and-prejudice-2', 'pride-and-prejudice-3', 'pride-and-prejudice-4',
    'sense-and-sensibility-1', 'sense-and-sensibility-2', 'sense-and-sensibility-3', 'sense-and-sensibility-4',
  ].map((n) => ({
    ...bw('austen', n, 'austen/crosswords', { collection: 'austen-crosswords', design: n }),
    group: crosswordGroup(n),
  })),
  // keep_calm (negre + blanc) — al disc tenim 2 dissenys; usem `solid` per al
  // mockup pre-composat (el catalàg manté la id genèrica `keep-calm`).
  bw('austen', 'keep-calm', 'austen/keep_calm', { collection: 'austen-keep-calm', design: 'keep-calm' }),
  // pemberley_house (negre + blanc + multi al disc)
  bw('austen', 'pemberley-house', 'austen/pemberley_house', { collection: 'austen-pemberley', design: 'pemberley-house' }),
  // quotes (negre + blanc) — totes tenen mockup pre-composat a austen/cites/quotes
  ...[
    'half-agony-half-hope', 'i-admire-and-love-you', 'it-is-a-truth',
    'unsociable-and-taciturn', 'you-have-bewitched-me',
  ].map((n) => bw('austen', n, 'austen/quotes',
    AUSTEN_QUOTES_WITH_MOCKUP.has(n) ? { collection: 'austen-quotes', design: `quotes-${n}` } : undefined)),
  // looking_for_my_darcy (NOMÉS color) — design = `looking-for-my-darcy-<variant>`.
  ...Object.keys(LFMD_FRAME_MAP).map((n) =>
    colorOnly(
      'austen',
      `austen/looking_for_my_darcy/color/solid/${n}-stripe.webp`,
      `austen/lfmd/${n}`,
      { collection: 'austen-looking-for-my-darcy', design: `looking-for-my-darcy-${n}` }
    )
  ),
];

export const HOME_DRAWINGS = {
  'first-contact': FIRST_CONTACT,
  'the-human-inside': THE_HUMAN_INSIDE,
  austen: AUSTEN,
  cube: CUBE,
  miscellania: MISCELLANIA,
};

// Ordre de les seccions a la home.
export const HOME_COLLECTIONS_ORDER = ['first-contact', 'the-human-inside', 'austen', 'cube', 'miscellania'];

// 14 colors canònics (de TDP_GRID_COLORS / FullWideSlideHeader).
export const SHIRT_COLORS = [
  'white', 'light-blue', 'royal', 'purple', 'navy', 'daisy', 'gold',
  'light-pink', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];

// Colors foscos → necessiten el dibuix en BLANC (per a dibuixos amb b/w).
const DARK_COLORS = new Set([
  'royal', 'purple', 'navy', 'red', 'irish-green', 'military-green', 'forest-green', 'black',
]);

// Ajustos de mida (overlayScale) per dibuixos concrets. Per defecte: 0.345.
//  · The Phoenix: mida original sense reducció.
//  · NX-01: 25% més petit (0.345 × 0.75).
//  · Quotes d'Austen: 40% més petit (0.345 × 0.6).
const OVERLAY_SCALE_OVERRIDES = {
  'first_contact/the-phoenix': 0.46,
  'first_contact/nx-01': 0.25875,
  // Plasma Escape, Vulcan's End i Wormhole: 10% més petit (0.345 × 0.9).
  'first_contact/plasma-escape': 0.3105,
  'first_contact/vulcans-end': 0.3105,
  'first_contact/wormhole': 0.3105,
  'austen/it-is-a-truth': 0.207,
  'austen/body-and-soul': 0.207,
  'austen/half-agony-half-hope': 0.207,
  'austen/you-must-allow-me': 0.207,
  // Looking For My Darcy: 25% més petit (0.345 × 0.75).
  'austen/lfmd/blue-solid': 0.25875,
  'austen/lfmd/fuchsia-solid': 0.25875,
  'austen/lfmd/red-solid': 0.25875,
  'austen/lfmd/yellow-solid': 0.25875,
};

// Overrides de posició vertical (overlayTranslateY) per dibuix. Per defecte el
// component usa '-9%'. The Phoenix ja quedava bé amb '-4%' (sense la pujada).
const OVERLAY_TRANSLATE_Y_OVERRIDES = {
  'first_contact/the-phoenix': '-4%',
};

function resolveOverlayTranslateY(drawing) {
  if (!drawing) return undefined;
  return OVERLAY_TRANSLATE_Y_OVERRIDES[drawing.id];
}

// Escala d'overlay per a un dibuix: prioritza l'override per id, després per
// grup (p.ex. tots els Crosswords d'Austen un 25% més petits = 0.25875).
function resolveOverlayScale(drawing) {
  if (!drawing) return undefined;
  if (OVERLAY_SCALE_OVERRIDES[drawing.id] != null) return OVERLAY_SCALE_OVERRIDES[drawing.id];
  if (typeof drawing.group === 'string' && drawing.group.startsWith('crosswords/')) return 0.2716875;
  // Cube, Miscel·lània i The Human Inside: 25% més petit (0.345 × 0.75).
  if (typeof drawing.id === 'string' && (drawing.id.startsWith('cube/') || drawing.id.startsWith('miscellania/') || drawing.id.startsWith('the_human_inside/'))) return 0.25875;
  return undefined;
}

// Nom de producte (label) per dibuix. Es mostra a la targeta i canvia amb el
// dibuix (que és aleatori a cada càrrega).
const DRAWING_LABELS = {
  // First Contact
  'first_contact/nx-01': 'NX-01',
  'first_contact/ncc-1701': 'NCC-1701',
  'first_contact/ncc-1701-d': 'NCC-1701-D',
  'first_contact/wormhole': 'Wormhole',
  'first_contact/plasma-escape': 'Plasma Escape',
  'first_contact/vulcans-end': "Vulcan's End",
  'first_contact/the-phoenix': 'The Phoenix',
  // The Human Inside
  'the_human_inside/afrodita-a': 'Afrodita',
  'the_human_inside/c3-p0': 'C-3PO',
  'the_human_inside/cyberman': 'Cyberman',
  'the_human_inside/cylon-03': 'Cylon 03',
  'the_human_inside/cylon-78': 'Cylon 78',
  'the_human_inside/iron-man-08': 'Iron Man 08',
  'the_human_inside/iron-man-68': 'Iron Man 68',
  'the_human_inside/maschinenmensch': 'Maschinenmensch',
  'the_human_inside/mazinger-z': 'Mazinger Z',
  'the_human_inside/r2-d2': 'R2-D2',
  'the_human_inside/robbie-the-robot': 'Robbie the Robot',
  'the_human_inside/robocop': 'RoboCop',
  'the_human_inside/terminator': 'Terminator',
  'the_human_inside/the-dalek': 'The Dalek',
  'the_human_inside/vader': 'Vader',
  // Miscel·lània
  'miscellania/death-star2d2': 'Death Star2D2',
  'miscellania/dj-vader': 'DJ Vader',
  'miscellania/pont-del-diable': 'Pont del Diable',
  // Cube
  'cube/afrodita-c-stripe': 'Afrodita Cube',
  'cube/cube-3-p0-stripe': 'Cube 3-PO',
  'cube/cyber-cube-stripe': 'Cyber Cube',
  'cube/cylon-cube-03-stripe': 'Cylon Cube 03',
  'cube/darth-cube-stripe': 'Darth Cube',
  'cube/iron-cube-08-iron-kong-stripe': 'Iron Cube 08',
  'cube/iron-cube-68-stripe': 'Iron Cube 68',
  'cube/maschinencube-stripe': 'MaschinenCube',
  'cube/mazinger-c-stripe': 'Mazinger C',
  'cube/robocube-stripe': 'RoboCube',
  // Austen (no crosswords / no lfmd)
  'austen/keep-calm': 'Keep Calm',
  'austen/pemberley-house': 'Pemberley House',
  'austen/body-and-soul': 'Body and Soul',
  'austen/half-agony-half-hope': 'Half Agony, Half Hope',
  'austen/it-is-a-truth': 'It is a Truth',
  'austen/i-admire-and-love-you': 'I Admire and Love You',
  'austen/unsociable-and-taciturn': 'Unsociable and Taciturn',
  'austen/you-have-bewitched-me': 'You Have Bewitched Me',
  'austen/you-must-allow-me': 'You Must Allow Me',
};

function prettify(s) {
  return String(s || '')
    .replace(/-stripe$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Enllaç a la pàgina de producte (PDP) per dibuix. Si un dibuix no té PDP
// pròpia (p.ex. Austen), es retorna null i la targeta cau a la col·lecció.
const PRODUCT_HREF = {
  // First Contact
  'first_contact/nx-01': '/first-contact/nx-01',
  'first_contact/ncc-1701': '/first-contact/ncc-1701',
  'first_contact/ncc-1701-d': '/first-contact/ncc-1701-d',
  'first_contact/wormhole': '/first-contact/wormhole',
  'first_contact/plasma-escape': '/first-contact/plasma-escape',
  'first_contact/vulcans-end': '/first-contact/vulcans-end',
  'first_contact/the-phoenix': '/first-contact/the-phoenix',
  // The Human Inside
  'the_human_inside/c3-p0': '/the-human-inside/c3-p0',
  'the_human_inside/r2-d2': '/the-human-inside/r2-d2',
  'the_human_inside/vader': '/the-human-inside/vader',
  'the_human_inside/afrodita-a': '/the-human-inside/afrodita',
  'the_human_inside/mazinger-z': '/the-human-inside/mazinger',
  'the_human_inside/cylon-78': '/the-human-inside/cylon-78',
  'the_human_inside/cylon-03': '/the-human-inside/cylon-03',
  'the_human_inside/cyberman': '/the-human-inside/cyberman',
  'the_human_inside/maschinenmensch': '/the-human-inside/maschinenmensch',
  'the_human_inside/robocop': '/the-human-inside/robocop',
  'the_human_inside/iron-man-68': '/the-human-inside/ironman-68',
  'the_human_inside/iron-man-08': '/the-human-inside/ironman-08',
  'the_human_inside/robbie-the-robot': '/the-human-inside/robbie-the-robot',
  'the_human_inside/terminator': '/the-human-inside/terminator',
  'the_human_inside/the-dalek': '/the-human-inside/the-dalek',
  // Cube
  'cube/afrodita-c-stripe': '/cube/afrodita-c',
  'cube/mazinger-c-stripe': '/cube/mazinger-c',
  'cube/iron-cube-68-stripe': '/cube/ironman-68',
  'cube/iron-cube-08-iron-kong-stripe': '/cube/ironkong',
  'cube/robocube-stripe': '/cube/robocube',
  'cube/cylon-cube-03-stripe': '/cube/cylon-cube',
  'cube/maschinencube-stripe': '/cube/maschinencube',
  'cube/darth-cube-stripe': '/cube/darth-cube',
  'cube/cube-3-p0-stripe': '/cube/3cube-p0',
  'cube/cyber-cube-stripe': '/cube/cybercube',
  // Austen
  'austen/keep-calm': '/austen/keep-calm',
  'austen/pemberley-house': '/austen/pemberley-house',
  'austen/half-agony-half-hope': '/austen/quotes-half-agony-half-hope',
  'austen/i-admire-and-love-you': '/austen/quotes-i-admire-and-love-you',
  'austen/it-is-a-truth': '/austen/quotes-it-is-a-truth',
  'austen/unsociable-and-taciturn': '/austen/quotes-unsociable-and-taciturn',
  'austen/you-have-bewitched-me': '/austen/quotes-you-have-bewitched-me',
  'austen/persuasion-1': '/austen/persuasion-1',
  'austen/persuasion-2': '/austen/persuasion-2',
  'austen/persuasion-3': '/austen/persuasion-3',
  'austen/persuasion-4': '/austen/persuasion-4',
  'austen/pride-and-prejudice-1': '/austen/pride-and-prejudice-1',
  'austen/pride-and-prejudice-2': '/austen/pride-and-prejudice-2',
  'austen/pride-and-prejudice-3': '/austen/pride-and-prejudice-3',
  'austen/pride-and-prejudice-4': '/austen/pride-and-prejudice-4',
  'austen/sense-and-sensibility-1': '/austen/sense-and-sensibility-1',
  'austen/sense-and-sensibility-2': '/austen/sense-and-sensibility-2',
  'austen/sense-and-sensibility-3': '/austen/sense-and-sensibility-3',
  'austen/sense-and-sensibility-4': '/austen/sense-and-sensibility-4',
  'austen/lfmd/blue-solid': '/austen/looking-for-my-darcy-blue-solid',
  'austen/lfmd/red-solid': '/austen/looking-for-my-darcy-red-solid',
  'austen/lfmd/yellow-solid': '/austen/looking-for-my-darcy-yellow-solid',
  // Miscel·lània
  'miscellania/pont-del-diable': '/miscellania/pont-del-diable',
  'miscellania/dj-vader': '/miscellania/dj-vader',
  'miscellania/death-star2d2': '/miscellania/death-star2d2',
};

function resolveProductHref(drawing) {
  if (!drawing) return undefined;
  return PRODUCT_HREF[drawing.id];
}

function drawingLabel(drawing) {
  if (!drawing) return '';
  if (DRAWING_LABELS[drawing.id]) return DRAWING_LABELS[drawing.id];
  if (drawing.group === 'crosswords/persuasion') return 'Persuasion';
  if (drawing.group === 'crosswords/pride-and-prejudice') return 'Pride and Prejudice';
  if (drawing.group === 'crosswords/sense-and-sensibility') return 'Sense and Sensibility';
  if (typeof drawing.id === 'string' && drawing.id.startsWith('austen/lfmd/')) return 'Looking for my Darcy';
  const last = String(drawing.id || '').split('/').pop();
  return prettify(last);
}

export const shirtMockupSrc = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.png`;

/**
 * Resol el camí al mockup pre-composat (samarreta + dibuix ja imprimits) per a
 * un dibuix concret i un color de samarreta donat. Retorna `null` si el
 * dibuix no té mockup pre-composat al disc.
 *
 * Tria de tinta:
 *  - Col·leccions només-multi (`cube`, `austen-looking-for-my-darcy`) → 'multi'.
 *  - Resta (b + w) → 'w' si la samarreta és fosca, 'b' si és clara.
 */
function resolvePrecomposedMockup(drawing, color, isDark) {
  if (!drawing?.mockup) return null;
  const { collection, design } = drawing.mockup;
  const onlyMulti = collection === 'cube' || collection === 'austen-looking-for-my-darcy';
  const ink = onlyMulti ? 'multi' : isDark ? 'w' : 'b';
  return getMockupPath({ collection, design, shirtColor: color, ink });
}

function resolveOverlaySrc(drawing, isDark) {
  if (!drawing) return null;
  if (drawing.color) return drawing.color;
  if (drawing.black && drawing.white) return isDark ? drawing.white : drawing.black;
  return drawing.white || drawing.black || drawing.color || null;
}

function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Construeix el pla d'assignació per a les targetes de la home.
 * Retorna { [collectionSlug]: [{ color, mockupSrc, overlaySrc, overlayAlt }] }.
 * Cada secció rep `perCollection` targetes (per defecte 3).
 */
export function buildHomeDrawingPlan({ perCollection = 3, rng = Math.random } = {}) {
  const colorPool = shuffle(SHIRT_COLORS, rng);
  let colorIdx = 0;
  const nextColor = () => colorPool[(colorIdx++) % colorPool.length];

  const plan = {};
  for (const slug of HOME_COLLECTIONS_ORDER) {
    const pool = HOME_DRAWINGS[slug] || [];
    // Selecció sense repetir `group` (p.ex. els subgrups d'Austen/Crosswords:
    // Persuasion, Pride and Prejudice, Sense and Sensibility no es repeteixen).
    const shuffled = shuffle(pool, rng);
    const usedGroups = new Set();
    const picks = [];
    for (const drawing of shuffled) {
      if (picks.length >= perCollection) break;
      if (drawing.group) {
        if (usedGroups.has(drawing.group)) continue;
        usedGroups.add(drawing.group);
      }
      picks.push(drawing);
    }
    plan[slug] = picks.map((drawing, i) => {
      const color = nextColor();
      const isDark = DARK_COLORS.has(color);
      // Si el dibuix té mockup pre-composat al disc, l'usem com a `mockupSrc`
      // i desactivem l'overlay (samarreta + dibuix ja venen "imprimits" junts).
      // Si no, mantenim el sistema actual: samarreta blanca + overlay.
      const precomposed = resolvePrecomposedMockup(drawing, color, isDark);
      const usePrecomposed = Boolean(precomposed);
      // Carrusel de variants en hover: només per als mockups pre-composats
      // (els basats en overlay no es poden recolorir només canviant la imatge).
      // Forcem que la imatge mostrada (precomposed) sigui la primera del cicle.
      let hoverImages;
      if (usePrecomposed && drawing.mockup) {
        const { collection, design } = drawing.mockup;
        const variants = collectionGridHoverVariantsFor(collection, design, color, i);
        hoverImages = [precomposed, ...variants.filter((u) => u && u !== precomposed)];
      }
      const baseHref = resolveProductHref(drawing);
      return {
        color,
        productName: drawingLabel(drawing),
        productHref: baseHref ? `${baseHref}?color=${color}` : undefined,
        mockupSrc: usePrecomposed ? precomposed : shirtMockupSrc(color),
        overlaySrc: usePrecomposed ? null : resolveOverlaySrc(drawing, isDark),
        overlayAlt: drawing.id,
        ...(hoverImages && hoverImages.length > 1 ? { hoverImages } : {}),
        // Ajustos de mida per dibuix concret (overlayScale per defecte = 0.345);
        // s'ignoren si usem mockup pre-composat.
        overlayScale: usePrecomposed ? undefined : resolveOverlayScale(drawing),
        overlayTranslateY: usePrecomposed ? undefined : resolveOverlayTranslateY(drawing),
      };
    });
  }
  return plan;
}

const COLLECTION_DISPLAY_NAMES = {
  'first-contact': 'FIRST CONTACT',
  'the-human-inside': 'THE HUMAN INSIDE',
  'austen': 'AUSTEN',
  'cube': 'CUBE',
  'miscellania': 'MISCEL·LÀNIA',
};

export function buildOtherCollectionsImages(currentSlug, { perCollection = 1, rng = Math.random } = {}) {
  const plan = buildHomeDrawingPlan({ perCollection: 3, rng });
  const others = HOME_COLLECTIONS_ORDER.filter((s) => s !== currentSlug);
  const shuffled = shuffle(others, rng);
  return shuffled.map((slug) => {
    const items = plan[slug] || [];
    const pick = items[Math.floor(rng() * items.length)] || items[0];
    if (!pick) return null;
    return {
      src: pick.mockupSrc,
      brand: COLLECTION_DISPLAY_NAMES[slug] || slug.toUpperCase(),
      title: pick.productName,
      price: '15,50€',
      href: pick.productHref,
    };
  }).filter(Boolean);
}
