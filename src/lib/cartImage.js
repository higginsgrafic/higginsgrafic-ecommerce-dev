/**
 * La imatge d'un article del cistell.
 *
 * PER QUE ES UN FITXER A PART
 *
 * Aquesta logica vivia dins del component de la comanda, i allo volia dir que
 * nome s la podia fer servir allo. Pero la capcalera tambe la necessita: les
 * imatges del cistell no existeixen al DOM fins que s'obre el cistell (es una
 * altra pagina del carrusel), i amb `loading="lazy"` el navegador no les
 * demanava fins llavors: mentre arribaven es veia l'espai en blanc.
 *
 * Ara la capcalera les pot precarregar amb la resta de la pagina, i com que
 * fa servir aquesta mateixa funcio, la imatge que es precarrega es exactament
 * la que despres es veura.
 */

import { getMockupPath, INK_BLACK, INK_WHITE, COLLECTIONS, invertLineInk } from '@/lib/mockupPaths';
import { tshirtSrc as mockupGildanSrc } from '@/utils/placeholders';

const COLORS_FOSCOS = new Set([
  'royal', 'navy', 'red', 'irish-green', 'military-green', 'black',
  'charcoal', 'dark-chocolate',
]);

const ACABAT_A_TINTA = { BLANC: INK_WHITE, COLOR: 'multi', NEGRE: INK_BLACK };

/** El cistell desa el color amb el nom que es mostra ('Light Pink'); els
 *  ajudants d'imatge l'esperen en format slug ('light-pink'). */
export function colorSlug(c) {
  return String(c || '').trim().toLowerCase().replace(/\s+/g, '-');
}

export function tshirtSrc(color) {
  return mockupGildanSrc(color);
}

export function resolveInk(collectionSlug, shirtColor, finish) {
  const inks = COLLECTIONS[collectionSlug]?.inks ?? [];
  const effFinish = finish && ['BLANC', 'COLOR', 'NEGRE'].includes(finish) ? finish : null;
  let ink = effFinish
    ? ACABAT_A_TINTA[effFinish]
    : (COLORS_FOSCOS.has(shirtColor) ? INK_WHITE : INK_BLACK);
  ink = invertLineInk(ink, shirtColor);
  if (!inks.includes(ink)) ink = inks[0];
  return ink;
}

export function mockupSrc(item) {
  if (!item?.collectionSlug || !item?.productRoute) return null;
  const color = colorSlug(item.color);
  const ink = resolveInk(item.collectionSlug, color, item.finish);
  return getMockupPath({ collection: item.collectionSlug, design: item.productRoute, shirtColor: color, ink });
}

/**
 * La imatge de la fitxa del cistell: primer la foto real de la peca (nome s si
 * es un fitxer nostre; les de Gelato son URLs signades que caduquen), despres
 * el mockup del disseny i, si no, una samarreta neutra en el color de la peca.
 *
 * `/placeholder-product.svg` es un fitxer que no existeix i que alguns
 * productes porten com a imatge: tambe s'ha d'ignorar.
 */
export function imatgeArticle(item) {
  const propia = item?.image
    && String(item.image).startsWith('/')
    && item.image !== '/placeholder-product.svg'
    ? item.image
    : null;
  return propia || mockupSrc(item) || tshirtSrc(item?.color);
}
