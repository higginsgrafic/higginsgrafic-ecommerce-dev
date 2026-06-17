/**
 * pdpMockup
 * -----------------------------------------------------------------------------
 * Bridge per a PDPs: a partir de l'slug de col·lecció i el route del producte
 * (els constants `COLLECTION_SLUG` i `PRODUCT_ROUTE` que cada PDP defineix),
 * retorna el path al mockup pre-composat (samarreta + dibuix imprès) per a un
 * color de samarreta concret.
 *
 * Si no hi ha mockup pre-composat per a aquest producte (p.ex. R2-D2), retorna
 * el camí a la samarreta blanca clàssica (fallback).
 *
 * Tria de tinta:
 *  - Col·leccions només-multi (`cube`): 'multi'.
 *  - Resta (b + w): 'w' si la samarreta és fosca, 'b' si és clara.
 */

import { getMockupPath, COLLECTIONS, INK_BLACK, INK_WHITE, INK_MULTI } from '@/lib/mockupPaths';

// Colors foscos (replicat de homeDrawings.js).
const DARK_COLORS = new Set([
  'royal', 'purple', 'navy', 'red', 'irish-green', 'military-green', 'forest-green', 'black',
]);

// Acabats del selector de la PDP ↔ tinta del catàleg.
export const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];
const FINISH_TO_INK = { BLANC: INK_WHITE, COLOR: INK_MULTI, NEGRE: INK_BLACK };

/**
 * Acabats disponibles per a una col·lecció (segons les tintes catalogades).
 *  - quotes / crosswords → ['BLANC', 'NEGRE'] (sense COLOR)
 *  - cube / looking-for-my-darcy → ['COLOR'] (sense BLANC/NEGRE)
 *  - resta → ['BLANC', 'COLOR', 'NEGRE']
 * @param {string} collectionSlug
 * @returns {string[]}
 */
export function availableFinishesFor(collectionSlug) {
  const inks = COLLECTIONS[collectionSlug]?.inks ?? [];
  return FINISHES.filter((f) => inks.includes(FINISH_TO_INK[f]));
}

/** Acabat per defecte: 'COLOR' si està disponible, si no el primer disponible. */
export function defaultFinishFor(collectionSlug) {
  const avail = availableFinishesFor(collectionSlug);
  if (avail.includes('COLOR')) return 'COLOR';
  return avail[0] ?? 'COLOR';
}

/**
 * Acabats que es veuen bé segons el to de la samarreta (tenint en compte el
 * negatiu que es força a blanc/negre). S'usa a les graelles de col·lecció per
 * no mostrar mai negre sobre fosc ni blanc sobre clar (poc contrast).
 *  - COLOR (multi): sempre visible.
 *  - samarreta blanca/negra: BLANC i NEGRE acaben en negatiu visible → tots.
 *  - fosca (no negra): BLANC (→ tinta blanca) visible; NEGRE no.
 *  - clara (no blanca): NEGRE (→ tinta negra) visible; BLANC no.
 */
function visibleFinishesFor(collectionSlug, shirtColor) {
  const avail = availableFinishesFor(collectionSlug);
  if (shirtColor === 'white' || shirtColor === 'black') return avail;
  const isDark = DARK_COLORS.has(shirtColor);
  return avail.filter((f) => {
    if (f === 'COLOR') return true;
    return isDark ? f === 'BLANC' : f === 'NEGRE';
  });
}

/**
 * Tria un acabat per a una cel·la de la graella d'una pàgina de col·lecció:
 * visible pel to de la samarreta i rotant per `index` perquè la graella mostri
 * tots els acabats de què disposa la col·lecció.
 * @param {string} collectionSlug
 * @param {string} shirtColor
 * @param {number} [index]  índex lineal de la cel·la (per rotar)
 * @returns {string} 'BLANC' | 'COLOR' | 'NEGRE'
 */
export function gridFinishFor(collectionSlug, shirtColor, index = 0) {
  const visible = visibleFinishesFor(collectionSlug, shirtColor);
  const pool = visible.length > 0 ? visible : availableFinishesFor(collectionSlug);
  if (pool.length === 0) return defaultFinishFor(collectionSlug);
  const i = ((index % pool.length) + pool.length) % pool.length;
  return pool[i];
}

/**
 * Imatge de mockup per a una cel·la de graella de col·lecció, escollint l'acabat
 * amb `gridFinishFor` (mix segons el to, rotant per `index`).
 */
export function collectionGridImageFor(collectionSlug, productRoute, shirtColor, index = 0) {
  const finish = gridFinishFor(collectionSlug, shirtColor, index);
  return tdpImageFor(collectionSlug, productRoute, shirtColor, finish);
}

// Ordre canònic dels colors de samarreta (segons la pauta de mockups). El
// carrusel de les col·leccions "només color" recorre aquest ordre començant pel
// color de la pròpia targeta i mostra un total de SHIRT_COLOR_CAROUSEL_COUNT.
const SHIRT_COLOR_ORDER = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink',
  'daisy', 'gold', 'red', 'kiwi', 'irish-green', 'military-green',
  'forest-green', 'black',
];
const SHIRT_COLOR_CAROUSEL_COUNT = 5;

/**
 * Llista d'imatges per al carrusel de variants en hover d'una cel·la de graella.
 * La primera imatge és sempre la base (la que es veu sense hover).
 *  - Col·leccions amb diverses tintes (b/w/multi): mateixa samarreta, rotant
 *    pels acabats disponibles (BLANC / COLOR / NEGRE).
 *  - Col·leccions només multi (cube, looking-for-my-darcy): mateixa tinta,
 *    rotant per diferents colors de samarreta.
 * @returns {string[]} URLs (com a mínim la base; >1 només si hi ha variants).
 */
export function collectionGridHoverVariantsFor(collectionSlug, productRoute, shirtColor, index = 0) {
  const def = COLLECTIONS[collectionSlug];
  if (!def) return [];
  const baseFinish = gridFinishFor(collectionSlug, shirtColor, index);
  const base = tdpImageFor(collectionSlug, productRoute, shirtColor, baseFinish);
  const urls = [base];
  const inks = def.inks ?? [];
  const onlyColor = inks.length === 1 && inks[0] === INK_MULTI;

  if (onlyColor) {
    // Continua des del color de la targeta, seguint l'ordre canònic, fins a
    // mostrar SHIRT_COLOR_CAROUSEL_COUNT colors en total (base inclosa).
    let start = SHIRT_COLOR_ORDER.indexOf(shirtColor);
    if (start < 0) start = 0;
    for (let step = 1; step < SHIRT_COLOR_ORDER.length && urls.length < SHIRT_COLOR_CAROUSEL_COUNT; step++) {
      const c = SHIRT_COLOR_ORDER[(start + step) % SHIRT_COLOR_ORDER.length];
      const img = tdpImageFor(collectionSlug, productRoute, c, 'COLOR');
      if (img && !urls.includes(img)) urls.push(img);
    }
  } else {
    for (const finish of availableFinishesFor(collectionSlug)) {
      if (finish === baseFinish) continue;
      const img = tdpImageFor(collectionSlug, productRoute, shirtColor, finish);
      if (img && !urls.includes(img)) urls.push(img);
    }
    // Regla obligatòria per a samarretes blanca/negra: incloure sempre el
    // negatiu complet (samarreta + tinta oposades), independentment de si la
    // col·lecció té versió color.
    //  - Samarreta BLANCA → afegim tinta blanca sobre samarreta negra (w+black).
    //  - Samarreta NEGRA  → afegim tinta negra sobre samarreta blanca (b+white).
    if (inks.includes(INK_WHITE) && shirtColor === 'white') {
      const whiteVersion = tdpImageFor(collectionSlug, productRoute, 'black', 'BLANC');
      if (whiteVersion && !urls.includes(whiteVersion)) urls.push(whiteVersion);
    }
    if (inks.includes(INK_BLACK) && shirtColor === 'black') {
      const blackVersion = tdpImageFor(collectionSlug, productRoute, 'white', 'NEGRE');
      if (blackVersion && !urls.includes(blackVersion)) urls.push(blackVersion);
    }
  }
  return urls;
}

// Mapeig PDP route → design id del helper (sincronitzat amb els fitxers reals).
// Per defecte assumim que route === design. Aquí només registrem excepcions.
const DESIGN_MAP = {
  'the-human-inside': {
    'c3-p0': 'c3p0',
    'r2-d2': 'r2d2',
    'ironman-08': 'iron-man-08',
    'ironman-68': 'iron-man-68',
  },
  'cube': {
    'ironkong': 'iron-kong',
    'ironman-68': 'iron-cube',
    'maschinencube': 'maschinenmensch',
    'robocube': 'robbocube',
  },
};

// Productes sense mockup pre-composat (cau al fallback blanc).
// Tots els dissenys de the-human-inside (inclosos r2d2 i the-dalek) ja tenen mockup.
const NO_MOCKUP = new Set([]);

const BLANK_SHIRT = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.png`;

/**
 * Resol la tinta efectiva a partir de l'acabat seleccionat i el color de
 * samarreta, aplicant l'excepció del negatiu per als tons blanc i negre.
 *
 * Criteri:
 *  - La tinta surt de l'acabat (BLANC→w, COLOR→multi, NEGRE→b), NO del to de
 *    la samarreta.
 *  - Excepció (per visibilitat): si la tinta de línia coincidiria amb el to de
 *    la samarreta es força el negatiu → samarreta blanca + BLANC ⇒ negre;
 *    samarreta negra + NEGRE ⇒ blanc. El COLOR (multi) no es força mai.
 *  - Si la tinta resultant no existeix per a la col·lecció, cau a una de vàlida.
 */
function resolveInk(collectionSlug, shirtColor, finish) {
  const inks = COLLECTIONS[collectionSlug]?.inks ?? [];
  const effFinish = finish && availableFinishesFor(collectionSlug).includes(finish)
    ? finish
    : defaultFinishFor(collectionSlug);
  let ink = FINISH_TO_INK[effFinish];

  // Excepció blanc/negre (Opció B): força el negatiu només per a tinta de línia.
  if (ink === INK_WHITE && shirtColor === 'white') ink = INK_BLACK;
  else if (ink === INK_BLACK && shirtColor === 'black') ink = INK_WHITE;

  if (!inks.includes(ink)) ink = inks[0];
  return ink;
}

/**
 * @param {string} collectionSlug  ex. 'first-contact', 'the-human-inside', 'cube', 'miscellania'
 * @param {string} productRoute    ex. 'nx-01', 'vader', '3cube-p0'
 * @param {string} shirtColor      ex. 'royal', 'white', 'black'
 * @param {string} [finish]        'BLANC' | 'COLOR' | 'NEGRE' (acabat seleccionat)
 * @returns {string} URL absoluta (a `/public`) al mockup o al fallback.
 */
export function tdpImageFor(collectionSlug, productRoute, shirtColor, finish) {
  const key = `${collectionSlug}/${productRoute}`;
  if (NO_MOCKUP.has(key)) return BLANK_SHIRT(shirtColor);

  const design = DESIGN_MAP[collectionSlug]?.[productRoute] ?? productRoute;
  const ink = resolveInk(collectionSlug, shirtColor, finish);

  const path = getMockupPath({
    collection: collectionSlug,
    design,
    shirtColor,
    ink,
  });
  return path || BLANK_SHIRT(shirtColor);
}

/**
 * Versió pensada per a thumbnails de PLP/Grid: a partir d'un producte (amb
 * `collection` i `slug`), retorna el mockup pre-composat amb samarreta blanca.
 * Si el producte no té mockup pre-composat catalogat, retorna `null` perquè
 * el consumidor pugui fer fallback a les imatges originals (Supabase).
 *
 * @param {{collection?: string, slug?: string}} product
 * @param {string} shirtColor  Color per defecte (default 'white').
 * @returns {string|null}
 */
// Normalitza qualsevol valor de col·lecció ("First Contact", "the_human_inside")
// a la clau canònica de l'helper ("first-contact", "the-human-inside").
function normalizeCollectionSlug(raw) {
  return (raw || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productThumbnailFor(product, shirtColor = 'white') {
  if (!product) return null;
  const collection = normalizeCollectionSlug(product.collection);
  if (!collection || !COLLECTIONS[collection]) return null;

  // Construïm una llista de "routes candidates" perquè els productes de
  // Supabase / Gelato poden tenir slugs en diferents formats:
  //   - amb prefix de col·lecció:  "first-contact-nx-01"
  //   - sense prefix:              "nx-01"
  //   - només derivable del nom:    name="NX-01"  →  "nx-01"
  const candidates = new Set();
  const slug = (product.slug || '').toString().trim().toLowerCase();
  if (slug) {
    const prefix = `${collection}-`;
    if (slug.startsWith(prefix)) candidates.add(slug.slice(prefix.length));
    candidates.add(slug);
  }
  const name = (product.name || '').toString().trim().toLowerCase();
  if (name) {
    const fromName = name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (fromName) {
      candidates.add(fromName);
      const p = `${collection}-`;
      if (fromName.startsWith(p)) candidates.add(fromName.slice(p.length));
    }
  }

  const onlyMulti = collection === 'cube';
  const ink = onlyMulti ? 'multi' : DARK_COLORS.has(shirtColor) ? 'w' : 'b';

  for (const route of candidates) {
    if (!route || NO_MOCKUP.has(`${collection}/${route}`)) continue;
    const design = DESIGN_MAP[collection]?.[route] ?? route;
    const path = getMockupPath({ collection, design, shirtColor, ink });
    if (path) return path;
  }
  return null;
}
