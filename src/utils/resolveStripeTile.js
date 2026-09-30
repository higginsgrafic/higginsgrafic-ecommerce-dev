import {
  FIRST_CONTACT_MEDIA,
  FIRST_CONTACT_MEDIA_WHITE,
  FIRST_CONTACT_MEDIA_COLOR,
  CUBE_MEDIA,
} from '@/components/fullwide/megaSlideMedia.js';

/**
 * Resol la imatge stripe per a un ítem donat segons la col·lecció i la variant.
 * Funció pura extreta de FullWideSlideHeader per permetre que cada pàgina
 * calculi els seus propis tile sources independentment.
 *
 * @param {string} it - identificador de l'ítem (ex. 'NX-01', 'Afrodita', path austen...)
 * @param {string} tileVariant - 'white' | 'black' | 'color'
 * @param {object} ctx - context necessari
 * @param {string} ctx.active - col·lecció activa
 * @param {string} ctx.displayedShirtColor - color de samarreta mostrat
 * @param {string} [ctx.resolvedOverlaySrc] - overlay src per detectar subcol·lecció austen
 * @returns {string|null} ruta a la imatge stripe o null
 */
export function resolveForItem(it, tileVariant, ctx) {
  const { active, displayedShirtColor, resolvedOverlaySrc } = ctx;

  if (active === 'first_contact') {
    if (tileVariant === 'white') return FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it] || null;
    if (tileVariant === 'color') return FIRST_CONTACT_MEDIA_COLOR[it] || FIRST_CONTACT_MEDIA[it] || null;
    return FIRST_CONTACT_MEDIA[it] || null;
  }

  if (active === 'the_human_inside') {
    const k = String(it).trim().toLowerCase();
    const mapBlack = {
      'r2-d2': 'r2-d2-b-stripe.webp', c3p0: 'c3-p0-b-stripe.webp', 'c3-p0': 'c3-p0-b-stripe.webp',
      vader: 'vader-b-stripe.webp', afrodita: 'afrodita-a-b-stripe.webp', 'afrodita-a': 'afrodita-a-b-stripe.webp',
      mazinger: 'mazinger-z-b-stripe.webp', 'mazinger-z': 'mazinger-z-b-stripe.webp',
      'cylon 78': 'cylon-78-b-stripe.webp', 'cylon 03': 'cylon-03-b-stripe.webp',
      'iron man 68': 'iron-man-68-b-stripe.webp', 'iron man 08': 'iron-man-08-b-stripe.webp',
      cyberman: 'cyberman-b-stripe.webp', 'the dalek': 'the-dalek-b-stripe.webp',
      robocop: 'robocop-b-stripe.webp', terminator: 'terminator-b-stripe.webp',
      maschinenmensch: 'maschinenmensch-b-stripe.webp',
      'robby the robot': 'robbie-the-robot-b-stripe.webp', 'robbie the robot': 'robbie-the-robot-b-stripe.webp',
    };
    const file = mapBlack[k];
    if (!file) return null;
    if (tileVariant === 'white') {
      const wf = file.replace(/-b-stripe\.webp$/, '-w-stripe.webp');
      return `/custom_logos/drawings/images_stripe/the_human_inside/white/${wf}`;
    }
    if (tileVariant === 'color') {
      const cf = file.replace(/-b-stripe\.webp$/, '-multi-light-stripe.webp');
      return `/custom_logos/drawings/images_stripe/the_human_inside/color/${cf}`;
    }
    return `/custom_logos/drawings/images_stripe/the_human_inside/black/${file}`;
  }

  if (active === 'cube') {
    return CUBE_MEDIA[it] || null;
  }

  if (active === 'miscellania') {
    const lower = String(it).toLowerCase();
    if (lower.includes('arthur-d-the-second') || lower.includes('arthur d the second')) {
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/arthur-d-the-second-w-stripe.webp';
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-light-stripe.webp';
      return '/custom_logos/drawings/images_stripe/miscellania/black/arthur-d-the-second-b-stripe.webp';
    }
    if (lower.includes('r2d2-quote') || lower.includes('r2d2 quote')) {
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/r2d2-quote-w-stripe.webp';
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-light-stripe.webp';
      return '/custom_logos/drawings/images_stripe/miscellania/black/r2d2-quote-b-stripe.webp';
    }
    if (lower.includes('dj-vader')) {
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp';
      return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
    }
    if (lower.includes('death-star2d2')) {
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp';
      return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
    }
    if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp';
      return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
    }
    return null;
  }

  if (active === 'austen') {
    const s = String(it);
    if (s.includes('/austen/pemberley_house/')) {
      if (tileVariant === 'color') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp';
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
      return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp';
    }
    if (s.includes('/austen/keep_calm/')) {
      if (tileVariant === 'color') {
        const isRed = displayedShirtColor === 'red';
        return isRed
          ? '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp'
          : '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-dark-stripe.webp';
      }
      if (tileVariant === 'white') return '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
      return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
    }
    if (s.includes('/austen/quotes/')) {
      const file = s.split('/').pop() || '';
      const slug = file.toLowerCase().replace(/-b-grid(?=\.webp$)/i, '').replace(/-grid(?=\.webp$)/i, '').replace(/\.webp$/i, '');
      // ELS FITXERS DE LA FRANJA ES DIUEN COM ELS DE LA GRAELLA (30/09/2026).
      //
      // Ja no cal cap mapa: `austen/quotes/<slug>-b-grid.webp` te el seu
      // equivalent exacte a `austen/quotes/black/<slug>-b-stripe.webp` (i el
      // `-w-` a `white/`). Comprovat fitxer a fitxer:
      //
      //   i-admire-and-love-you · you-have-bewitched-me · half-agony-half-hope ·
      //   unsociable-and-taciturn · it-is-a-truth
      //
      // (Abans hi havia hagut un mapa perque els noms estaven desplaçats; l'amo
      // els ha posat al seu lloc i el mapa sobrava. Un mapa de mes tambe creua
      // els dibuixos.)
      if (tileVariant === 'white') return `/custom_logos/drawings/images_stripe/austen/quotes/white/${slug}-w-stripe.webp`;
      if (tileVariant === 'color') return `/custom_logos/drawings/images_stripe/austen/quotes/color/${slug}-multi-light-stripe.webp`;
      return `/custom_logos/drawings/images_stripe/austen/quotes/black/${slug}-b-stripe.webp`;
    }
    if (s.includes('/austen/crosswords/')) {
      const file = s.split('/').pop() || '';
      const m = file.toLowerCase().replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
      if (m) {
        const book = m[1]; const n = m[2];
        if (tileVariant === 'white') return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
        return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
      }
    }
    if (s.includes('/austen/looking_for_my_darcy/')) {
      const file = s.split('/').pop() || '';
      const m = file.toLowerCase().match(/(blue|fuchsia|red|yellow)-(solid|frame)-grid\.webp$/);
      if (m) {
        const c = m[1];
        if (m[2] === 'solid') {
          return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/${c}-solid-stripe.webp`;
        }
        if (m[2] === 'frame') {
          // ELS NOMS DELS MARC PORTEN ELS DOS COLORS (25/09/2026).
          //
          // L'amo va reanomenar els originals: ara son `blue-yellow`, `fuchsia-
          // yellow`, `yellow-pink` i `yellow-red`, amb el color de la tela del
          // marc PRIMER. El nom de la graella nome's en porta un (el del marc), o
          // sigui que no es pot derivar: cal el mapa.
          //
          // El mapa surt de MESURAR els pixels de cada dibuix i de cada original
          // (el color mes frequent i el segon):
          //
          //   blue-frame-grid     blau 16% + groc   -> blue-yellow
          //   fuchsia-frame-grid  fucsia 17% + groc -> fuchsia-yellow
          //   red-frame-grid      groc 26% + vermell-> yellow-red
          //   yellow-frame-grid   groc 24% + rosa  -> yellow-pink
          //
          // I aixo tambe arregla una errada de debò: el dibuix `yellow-frame`
          // (groc + rosa) apuntava al fitxer del Fucsia. Ho va veure l'amo a la
          // seva captura dels quatre fitxers.
          const MARC_A_FITXER = {
            blue: 'blue-yellow',
            fuchsia: 'fuchsia-yellow',
            red: 'yellow-red',
            yellow: 'yellow-pink',
          };
          const fitxer = MARC_A_FITXER[c] || c;
          return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/${fitxer}-frame-stripe.webp`;
        }
      }
    }
  }

  return null;
}

/**
 * Calcula els tile overlay sources per a la franja de 14 samarretes.
 * Cada pàgina pot cridar aquesta funció amb el seu propi context (variant, displayedShirtColor).
 *
 * @param {object} opts
 * @param {string[]} opts.drawable - ítems dibuixables (sense control tiles)
 * @param {string} opts.variant - variant activa ('white' | 'black' | 'color')
 * @param {string} opts.active - col·lecció activa
 * @param {string} opts.displayedShirtColor - color mostrat
 * @param {string} [opts.resolvedOverlaySrc] - overlay src per detectar subcol·lecció
 * @returns {(string|null)[]} array de 14 elements
 */
export function computeStripeTileOverlaySrcs({ drawable, variant, active, displayedShirtColor, resolvedOverlaySrc, limit }) {
  if (!Array.isArray(drawable) || drawable.length === 0) return null;
  const multiTone = displayedShirtColor === 'white' ? 'dark' : 'light';
  const isKeepCalm = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
  const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
  const ctx = { active, displayedShirtColor, resolvedOverlaySrc };

  // QUANTES CASELLES ES RESOLEN (25/09/2026).
  //
  // Aquesta funcio va neixer per a UNA franja de catorze cases, i per aixo
  // recorria nome's catorze items. Qui la fa servir tambe per construir la TIRA
  // SENcera (les 64 posicions de `tiraFranja`) hi passava la llista de la
  // colleccio activa, que en pot tenir mes: AUSTEN en te 27. Amb el topall de
  // catorze, la tira es quedava amb els catorze primers i la resta NO ARRIBAVA
  // MAI a la franja: mesurat, cap dels catorze dibuixos de LOOKING FOR MY DARCY
  // (ni els solids ni els marcs) no hi era. Ho va veure l'amo.
  //
  // Per defecte es queda a catorze (la franja de sempre, sense canviar res mes);
  // qui munta la tira sencera demana `drawable.length`.
  const total = Math.min(
    Number.isFinite(limit) && limit > 0 ? limit : 14,
    Math.max(drawable.length, 14)
  );

  const tileSrcs = [];
  for (let i = 0; i < total; i++) {
    const isKeepCalmColor = isKeepCalm && variant === 'color';
    const tileVariant = variant;
    let src = i < drawable.length ? resolveForItem(drawable[i], tileVariant, ctx) : null;
    const tileMultiTone = isKeepCalmColor
      ? (i === 8 ? 'light' : multiTone)
      : (isPemberley && tileVariant === 'color' ? 'light' : multiTone);
    if (src && tileVariant === 'color' && tileMultiTone === 'dark') {
      src = src.replace('-multi-light-stripe.webp', '-multi-dark-stripe.webp');
    }
    if (src && tileVariant === 'color' && tileMultiTone === 'light') {
      src = src.replace('-multi-dark-stripe.webp', '-multi-light-stripe.webp');
    }
    tileSrcs.push(src);
  }
  return tileSrcs;
}

/**
 * El dibuix d'una casa VELADA (d'una collecció que no és l'activa), EN NEGRE.
 *
 * Ho va demanar en Marc (28/09/2026): «Quan les samarretes velades tenen a sota
 * un color blanc o un de color no es veuen i sembla que la samarreta estigui
 * buida. Per tant, a partir d'ara hauran de tenir el dibuix en negre. Quan se
 * les cliqui, el color passarà a ser el del selector» i, tot seguit, «les que
 * només són en color no les toquis!».
 *
 * Doncs: es demana el dibuix amb la variant `black`. NOMÉS es canvia si el
 * resultat és diferent del de la variant de sempre, perquè hi ha dibuixos que
 * només existeixen en color (els solids i els marcs de LOOKING FOR MY DARCY:
 * `resolveForItem` retorna el mateix camí per a qualsevol variant) i aquests
 * s'han de quedar tal com són, en color.
 *
 * @param {object} o
 * @param {string} o.item el dibuix (l'ítem de la graella)
 * @param {string} o.collection la seva col·lecció (que NO és l'activa)
 * @param {string} o.variant la variant de sempre (la de la col·lecció)
 * @param {string} o.displayedShirtColor el color de samarreta mostrat
 * @param {string} [o.resolvedOverlaySrc]
 * @returns {string|null} el camí del dibuix (o null si no es resol)
 */
export function srcDibuixVelatEnNegre({ item, collection, variant, displayedShirtColor, resolvedOverlaySrc }) {
  const ctx = { active: collection, displayedShirtColor, resolvedOverlaySrc };
  const deSempre = computeStripeTileOverlaySrcs({ drawable: [item], variant, limit: 1, ...ctx });
  const base = Array.isArray(deSempre) ? deSempre[0] : null;
  if (!base || variant === 'black') return base;
  const negre = computeStripeTileOverlaySrcs({ drawable: [item], variant: 'black', limit: 1, ...ctx });
  const b = Array.isArray(negre) ? negre[0] : null;
  // NOMÉS si el dibuix té una versió negra de debò: si el camí és el mateix, és
  // un dibuix que només existeix en color i no s'hi toca res.
  return b && b !== base ? b : base;
}

/**
 * Calcula els tile items (identitat de cada samarreta a la franja).
 *
 * @param {string[]} drawable - ítems dibuixables
 * @returns {(string|null)[]} array de 14 elements
 */
export function computeStripeTileItems(drawable) {
  if (!Array.isArray(drawable) || drawable.length === 0) return null;
  const arr = [];
  for (let i = 0; i < 14; i++) arr.push(i < drawable.length ? drawable[i] : null);
  return arr;
}
