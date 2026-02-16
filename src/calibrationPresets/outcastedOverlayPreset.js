export function getOutcastedOverlayPreset(overlaySrc) {
  try {
    if (!overlaySrc) return null;
    const src = overlaySrc.toString();

    const outcastedMatch = src.match(/\/custom_logos\/drawings\/outcasted\/(?:black|white)\/([^/]+?)-(?:b|w)\.(?:webp|png)$/i);
    const miscelMatch = src.match(/\/custom_logos\/drawings\/miscel·lania\/(?:black|white)\/([^/]+?)-(?:b|w)\.(?:webp|png)$/i);
    const design = outcastedMatch ? outcastedMatch[1] : (miscelMatch ? miscelMatch[1] : '');
    const placeholderMatch = src.match(/\/placeholders\/images_grid\/(?:miscel·lania|miscel\\u00b7lania)\/([^/]+?)\.(?:webp|png)$/i);
    const placeholderDesign = placeholderMatch ? placeholderMatch[1] : '';
    const effectiveDesign = design || placeholderDesign;
    if (!effectiveDesign) return null;

    const presets = {
      'arthur-d-the-second': { x: 110.085, y: 23.026, s: 0.51, u: 'svg' },
      'dalek-conquer': { x: 110.08, y: 22.956, s: 0.51, u: 'svg' },
      'dalek-destroy': { x: 110.14, y: 23.124, s: 0.51, u: 'svg' },
      'death-star2d2': { x: 107, y: 7.6, s: 0.555, u: 'svg' },
      'dj-vader': { x: 108.153, y: 9.191, s: 0.54, u: 'svg' },
      'pont-del-diable': { x: 66.117, y: -76.847, s: 1.04, u: 'svg' },
    };

    return presets[effectiveDesign] || null;
  } catch {
    return null;
  }
}
