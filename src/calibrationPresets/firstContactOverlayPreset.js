export const getFirstContactOverlayPreset = (overlaySrc) => {
  try {
    const s = (overlaySrc || '').toString().toLowerCase();
    const isMaster = s.includes('/custom_logos/drawings/images_originals/stripe/first_contact/');
    const isGridThumb = s.includes('/custom_logos/drawings/images_grid/first_contact/');
    const isStripeThumb = s.includes('/custom_logos/drawings/images_stripe/first_contact/');
    if (!isMaster && !isGridThumb && !isStripeThumb) return null;

    const isNx01 = s.includes('nx-01') || s.includes('nx_01');
    const isNcc1701D = s.includes('1701-d') || s.includes('1701_d') || s.includes('1701d');
    const isNcc1701 = !isNcc1701D && s.includes('1701');
    const isWormhole = s.includes('wormhole');
    const isPlasmaEscape = s.includes('plasma-escape') || s.includes('plasma_escape') || s.includes('plasma');
    const isVulcansEnd = (s.includes('vulcan') || s.includes('vulcans')) && s.includes('end');
    const isPhoenix = s.includes('phoenix') || s.includes('the-phoenix') || s.includes('the_phoenix');

    if (isNx01) return { x: 105.967, y: -14.834, s: 0.555, u: 'svg' };
    if (isNcc1701D) return { x: 95.384, y: -59.633, s: 0.685, u: 'svg' };
    if (isNcc1701) return { x: 94.386, y: -53.66, s: 0.69, u: 'svg' };
    if (isWormhole) return { x: 110.178, y: 24.892, s: 0.51, u: 'svg' };
    if (isPlasmaEscape) return { x: 108.18, y: 21.95, s: 0.525, u: 'svg' };
    if (isVulcansEnd) return { x: 110.128, y: 25.049, s: 0.51, u: 'svg' };
    if (isPhoenix) return { x: 103.976, y: 56.749, s: 0.585, u: 'svg' };

    return null;
  } catch {
    return null;
  }
};
