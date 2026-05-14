export function getMiscellaniaOverlayPreset(overlaySrc) {
  try {
    if (!overlaySrc) return null;
    const src = overlaySrc.toString();

    const miscellaniaMatch = src.match(/\/custom_logos\/drawings\/images_originals\/stripe\/miscellania\/(?:black|white)\/([^/]+?)-(?:b|w)\.(?:webp|png)$/i);
    const miscelMatch = src.match(/\/custom_logos\/drawings\/images_originals\/stripe\/(?:miscellania|miscel\u00b7lania)\/(?:black|white)\/([^/]+?)-(?:b|w)\.(?:webp|png)$/i);
    const design = miscellaniaMatch ? miscellaniaMatch[1] : (miscelMatch ? miscelMatch[1] : '');
    const placeholderMatch = src.match(/\/custom_logos\/drawings\/images_grid\/(?:miscellania|miscel\\u00b7lania)\/([^/]+?)\.(?:webp|png)$/i);
    const placeholderDesign = placeholderMatch ? placeholderMatch[1] : '';
    const stripeThumbMatch = src.match(/\/custom_logos\/drawings\/images_stripe\/(?:miscellania|miscel\\u00b7lania)\/(?:(?:black|white)\/)?([^/]+?)\.(?:webp|png)$/i);
    const stripeThumbDesign = stripeThumbMatch ? stripeThumbMatch[1] : '';
    const rawEffectiveDesign = design || placeholderDesign || stripeThumbDesign;
    const effectiveDesign = (rawEffectiveDesign || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/-(grid|stripe)$/i, '')
      .replace(/-(b|w)$/i, '')
      .replace(/-(b|w)-(grid|stripe)$/i, '')
      .replace(/-(grid|stripe)-(b|w)$/i, '')
      .replace(/-(b|w)-(grid|stripe)$/i, '')
      .replace(/-(b|w)-stripe$/i, '')
      .replace(/-stripe-(b|w)$/i, '')
      .replace(/-grid-(b|w)$/i, '')
      .replace(/-(b|w)-grid$/i, '')
      .replace(/-+$/g, '');
    if (!effectiveDesign) return null;

    const presets = {
      'arthur-d-the-second': { x: 110.085, y: 23.026, s: 0.51, u: 'svg' },
      'dalek-conquer': { x: 110.08, y: 22.956, s: 0.51, u: 'svg' },
      'dalek-destroy': { x: 110.14, y: 23.124, s: 0.51, u: 'svg' },
      'death-star2d2': { x: 107, y: 7.6, s: 0.555, u: 'svg' },
      'dj-vader': { x: 108.153, y: 9.191, s: 0.54, u: 'svg' },
      'pont-del-diable': { x: 108.153, y: 10.5, s: 0.535, u: 'svg' },
    };

    return presets[effectiveDesign] || null;
  } catch {
    return null;
  }
}
