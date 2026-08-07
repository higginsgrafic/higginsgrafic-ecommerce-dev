/**
 * drawingPaths
 * -----------------------------------------------------------------------------
 * Helper per construir les rutes als dibuixos stripe (imatges del disseny sol,
 * sense la samarreta) sota /custom_logos/drawings/images_stripe/.
 *
 * Estructura al filesystem:
 *   images_stripe/<col_dir>/<ink_subdir>/<design>-<ink_code>-stripe.<ext>
 *   - col_dir:    first_contact, the_human_inside, miscellania, cube,
 *                 austen/crosswords, austen/keep_calm, austen/pemberley_house,
 *                 austen/quotes, austen/looking_for_my_darcy
 *   - ink_subdir: white, black, color (o cap per cube)
 *   - ink_code:   w, b, multi-dark, multi-light (o cap per cube)
 *
 * Excepcions:
 *   - cube: no hi ha subcarpeta d'ink ni codi d'ink al filename. El nom del
 *     fitxer és <stripe_design>-stripe.webp (sense -w-/-b-/-multi-).
 *   - austen-looking-for-my-darcy: només color, amb subcarpetes solid/frame.
 */

import { COLLECTIONS, INK_BLACK, INK_WHITE, INK_MULTI } from '@/lib/mockupPaths';

const STRIPE_BASE = '/custom_logos/drawings/images_stripe';

const DARK_COLORS = new Set([
  'royal', 'purple', 'navy', 'red', 'irish-green', 'military-green', 'forest-green', 'black',
]);

const FINISH_TO_INK = { BLANC: INK_WHITE, COLOR: INK_MULTI, NEGRE: INK_BLACK };

// Mapeig collectionSlug (de mockupPaths) → directori stripe
const STRIPE_DIR = {
  'first-contact': 'first_contact',
  'the-human-inside': 'the_human_inside',
  'miscellania': 'miscellania',
  'cube': 'cube',
  'austen-pemberley': 'austen/pemberley_house',
  'austen-quotes': 'austen/quotes',
  'austen-crosswords': 'austen/crosswords',
  'austen-keep-calm': 'austen/keep_calm',
  'austen-looking-for-my-darcy': 'austen/looking_for_my_darcy',
};

// Mapeig productRoute → stripe design name (per a col·leccions on divergeixen)
const STRIPE_DESIGN_MAP = {
  'the-human-inside': {
    'afrodita': 'afrodita-a',
    'mazinger': 'mazinger-z',
  },
  'cube': {
    'afrodita-c': 'afrodita-c-stripe',
    '3cube-p0': 'cube-3-p0-stripe',
    'cybercube': 'cyber-cube-stripe',
    'cylon-cube': 'cylon-cube-03-stripe',
    'darth-cube': 'darth-cube-stripe',
    'ironkong': 'iron-cube-08-iron-kong-stripe',
    'ironman-68': 'iron-cube-68-stripe',
    'maschinencube': 'maschinencube-stripe',
    'mazinger-c': 'mazinger-c-stripe',
    'robocube': 'robocube-stripe',
  },
};

// Mapeig productRoute → subcarpeta per a LFMD (looking-for-my-darcy)
const LFMD_VARIANT_MAP = {
  'looking-for-my-darcy-blue-solid': 'solid/blue-solid',
  'looking-for-my-darcy-fuchsia-solid': 'solid/fuchsia-solid',
  'looking-for-my-darcy-pink-solid': 'solid/fuchsia-solid',
  'looking-for-my-darcy-red-solid': 'solid/red-solid',
  'looking-for-my-darcy-yellow-solid': 'solid/yellow-solid',
  'looking-for-my-darcy-pink-yellow-frame': 'frame/fuchsia-frame',
  'looking-for-my-darcy-red-yellow-frame': 'frame/red-frame',
  'looking-for-my-darcy-yellow-blue-frame': 'frame/yellow-frame',
  'looking-for-my-darcy-yellow-pink-frame': 'frame/yellow-frame',
};

function resolveStripeDesign(collectionSlug, productRoute) {
  const map = STRIPE_DESIGN_MAP[collectionSlug];
  if (map && map[productRoute]) return map[productRoute];
  return productRoute;
}

function resolveInk(collectionSlug, shirtColor, finish) {
  const inks = COLLECTIONS[collectionSlug]?.inks ?? [];
  const effFinish = finish && ['BLANC', 'COLOR', 'NEGRE'].includes(finish) ? finish : null;
  let ink = effFinish ? FINISH_TO_INK[effFinish] : (DARK_COLORS.has(shirtColor) ? INK_WHITE : INK_BLACK);

  if (ink === INK_WHITE && shirtColor === 'white') ink = INK_BLACK;
  else if (ink === INK_BLACK && shirtColor === 'black') ink = INK_WHITE;

  if (!inks.includes(ink)) ink = inks[0];
  return ink;
}

/**
 * Construeix la ruta pública al dibuix stripe.
 *
 * @param {string} collectionSlug  ex: 'first-contact', 'the-human-inside', 'cube', 'austen-quotes'
 * @param {string} productRoute    ex: 'nx-01', 'vader', '3cube-p0', 'persuasion-1'
 * @param {string} shirtColor      ex: 'white', 'black', 'royal'
 * @param {string} [finish]        'BLANC' | 'COLOR' | 'NEGRE'
 * @returns {string|null} URL al dibuix stripe, o null si no es pot construir
 */
export function drawingStripePath(collectionSlug, productRoute, shirtColor, finish) {
  if (!collectionSlug || !productRoute) return null;

  const stripeDir = STRIPE_DIR[collectionSlug];
  if (!stripeDir) return null;

  const ink = resolveInk(collectionSlug, shirtColor, finish);
  if (!ink) return null;

  // Cube: no hi ha subcarpeta d'ink ni codi d'ink
  if (collectionSlug === 'cube') {
    const design = resolveStripeDesign(collectionSlug, productRoute);
    return `${STRIPE_BASE}/${stripeDir}/${design}-stripe.webp`;
  }

  // LFMD: només color, amb subcarpetes solid/frame
  if (collectionSlug === 'austen-looking-for-my-darcy') {
    const variant = LFMD_VARIANT_MAP[productRoute];
    if (!variant) return null;
    return `${STRIPE_BASE}/${stripeDir}/color/${variant}-stripe.webp`;
  }

  const design = resolveStripeDesign(collectionSlug, productRoute);
  const isDark = DARK_COLORS.has(shirtColor);

  if (ink === INK_WHITE) {
    return `${STRIPE_BASE}/${stripeDir}/white/${design}-w-stripe.webp`;
  }
  if (ink === INK_BLACK) {
    return `${STRIPE_BASE}/${stripeDir}/black/${design}-b-stripe.webp`;
  }
  // multi
  const variant = isDark ? 'multi-dark' : 'multi-light';
  return `${STRIPE_BASE}/${stripeDir}/color/${design}-${variant}-stripe.webp`;
}
