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

import { getMockupPath, COLLECTIONS } from '@/lib/mockupPaths';

// Colors foscos (replicat de homeDrawings.js).
const DARK_COLORS = new Set([
  'royal', 'purple', 'navy', 'red', 'irish-green', 'military-green', 'forest-green', 'black',
]);

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
 * @param {string} collectionSlug  ex. 'first-contact', 'the-human-inside', 'cube', 'miscellania'
 * @param {string} productRoute    ex. 'nx-01', 'vader', '3cube-p0'
 * @param {string} shirtColor      ex. 'royal', 'white', 'black'
 * @returns {string} URL absoluta (a `/public`) al mockup o al fallback.
 */
export function tdpImageFor(collectionSlug, productRoute, shirtColor) {
  const key = `${collectionSlug}/${productRoute}`;
  if (NO_MOCKUP.has(key)) return BLANK_SHIRT(shirtColor);

  const design = DESIGN_MAP[collectionSlug]?.[productRoute] ?? productRoute;
  const onlyMulti = collectionSlug === 'cube' || collectionSlug === 'austen-looking-for-my-darcy';
  const ink = onlyMulti ? 'multi' : DARK_COLORS.has(shirtColor) ? 'w' : 'b';

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
