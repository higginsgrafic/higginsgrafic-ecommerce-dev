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
      const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
      if (tileVariant === 'white') return `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`;
      if (tileVariant === 'color') return `/custom_logos/drawings/images_stripe/austen/quotes/color/${slug}-multi-light-stripe.webp`;
      return `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
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
          return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/${c}-frame-stripe.webp`;
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
export function computeStripeTileOverlaySrcs({ drawable, variant, active, displayedShirtColor, resolvedOverlaySrc }) {
  if (!Array.isArray(drawable) || drawable.length === 0) return null;
  const multiTone = displayedShirtColor === 'white' ? 'dark' : 'light';
  const isKeepCalm = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
  const ctx = { active, displayedShirtColor, resolvedOverlaySrc };

  const tileSrcs = [];
  for (let i = 0; i < 14; i++) {
    const isKeepCalmColor = isKeepCalm && variant === 'color';
    const tileVariant = variant;
    let src = i < drawable.length ? resolveForItem(drawable[i], tileVariant, ctx) : null;
    const tileMultiTone = isKeepCalmColor
      ? (i === 8 ? 'light' : multiTone)
      : multiTone;
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
