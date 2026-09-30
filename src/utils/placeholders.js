/**
 * ELS PLACEHOLDERS DE LA BOTIGA.
 *
 * LES IMATGES DE SAMARRETA (29/09/2026)
 *
 * Totes les samarretes que surten a la web viuen en una sola carpeta
 * (`mockup-gildan/`) i es diuen `mockup-gildan-t-shirt-<color>.webp`, SENSE
 * model. El nom no en pot dir cap perque la imatge es una barreja feta a mida:
 *
 *   - la foto es del Gildan 5000, que es la que es veu be;
 *   - els colors son els del Gildan 64000, que son un xic mes foscos;
 *   - i quatre colors (rs-sport-grey, ice-grey, charcoal, dark-chocolate)
 *     nome's existeixen al 64000.
 *
 * O sigui que no son ni d'un blat ni de l'altre. A l'arxiu de disseny
 * (COL·LECCIONS) si que hi ha la veritat per blat, amb el model al nom
 * (`mockup-gildan-64000-t-shirt-<color>.png`); aixo es nome's el que es veu.
 *
 * Els colors que ja no hi son (purple, light-pink, kiwi, forest-green,
 * cardinal-red) tenen un equivalent aqui sota. El mapa es NOMES per a pantalles
 * o dades velles: la paleta bona i els mockups son els 14 de `TSHIRT_COLORS`.
 */

import { SHIRT_COLORS as CANONICAL_SHIRT_COLORS } from '@/lib/mockupPaths';

const TSHIRT_BASE = '/placeholders/apparel/t-shirt/mockup-gildan';

/** Els 14 colors que es veuen a la web, en l'ordre habitual (mockupPaths). */
export const TSHIRT_COLORS = CANONICAL_SHIRT_COLORS;

/** Colors que ja no existeixen i amb quin dels nous es pinten. */
const TSHIRT_EQUIVALENTS = {
  purple: 'navy',
  'light-pink': 'ice-grey',
  kiwi: 'daisy',
  'forest-green': 'irish-green',
  'cardinal-red': 'red',
};

/** 'Light Pink' -> 'light-pink'. Els ajudants d'imatge sempre volen el slug. */
export function colorSlug(color) {
  return String(color || '').trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * La imatge de samarreta d'un color.
 * @param {string} color slug o nom mostrat (ex. 'royal', 'Dark Chocolate')
 * @returns {string} la ruta publica
 */
export function tshirtSrc(color) {
  const brut = colorSlug(color);
  const slug = TSHIRT_EQUIVALENTS[brut] || brut;
  return `${TSHIRT_BASE}/mockup-gildan-t-shirt-${slug}.webp`;
}

// EL CATALEG DE COLORS I EL MANIFEST.
//
// Viuen a la mateixa carpeta que les imatges. `getGildan64000Catalog` els
// llegeix per saber quins colors estan seleccionats i quina imatge te cadascun.
const DEFAULT_BASE = TSHIRT_BASE;

export async function loadGildan64000Colors({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const res = await fetchFn(`${base}/colors.json`);
  if (!res.ok) throw new Error(`Failed to load colors.json (${res.status})`);
  return res.json();
}

export async function loadGildan64000Manifest({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const res = await fetchFn(`${base}/manifest.json`);
  if (!res.ok) throw new Error(`Failed to load manifest.json (${res.status})`);
  return res.json();
}

export async function getGildan64000Catalog({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const [colorsJson, manifest] = await Promise.all([
    loadGildan64000Colors({ base, fetchFn }),
    loadGildan64000Manifest({ base, fetchFn }),
  ]);

  const colors = Array.isArray(colorsJson.colors) ? colorsJson.colors : [];
  const selectedSlugs = new Set(colorsJson.selected || colors.filter((c) => c.selected).map((c) => c.slug));

  const selected = colors.filter((c) => selectedSlugs.has(c.slug));
  const unselected = colors.filter((c) => !selectedSlugs.has(c.slug));

  const placeholderByColor = new Map();
  for (const it of manifest.items || []) {
    if (it.view !== 'front') continue;
    if (it.size !== 'xl') continue;
    if (!it.color) continue;
    if (!placeholderByColor.has(it.color)) placeholderByColor.set(it.color, it.src);
  }

  return {
    colors,
    selected,
    unselected,
    selectedSlugs,
    placeholderByColor,
    getPlaceholderSrc(colorSlug) {
      return placeholderByColor.get(colorSlug) || null;
    },
    getSelectedPlaceholderSrc(colorSlug) {
      if (!selectedSlugs.has(colorSlug)) return null;
      return placeholderByColor.get(colorSlug) || null;
    },
  };
}
