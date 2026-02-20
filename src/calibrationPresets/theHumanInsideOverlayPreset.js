export const getTheHumanInsideOverlayPreset = (overlaySrc) => {
  try {
    const s = (overlaySrc || '').toString().toLowerCase();
    const isMaster = s.includes('/custom_logos/drawings/images_originals/stripe/the_human_inside/');
    const isGridThumb = s.includes('/custom_logos/drawings/images_grid/the_human_inside/');
    const isStripeThumb = s.includes('/custom_logos/drawings/images_stripe/the_human_inside/');
    if (!isMaster && !isGridThumb && !isStripeThumb) return null;

    const isR2d2 = s.includes('r2-d2') || s.includes('r2_d2') || (s.includes('r2') && s.includes('d2'));
    const isDalek = s.includes('dalek') || s.includes('the-dalek') || s.includes('the_dalek');
    const isC3p0 = s.includes('c3p0') || s.includes('c3-p0') || s.includes('c3_p0');
    const isVader = s.includes('vader');
    const isAfrodita = s.includes('afrodita');
    const isMazinger = s.includes('mazinger');
    const isCylon03 = s.includes('cylon-03') || s.includes('cylon_03');
    const isCylon78 = (
      (!isCylon03 && (s.includes('cylon-78') || s.includes('cylon_78')))
      || (!isCylon03 && (
        s.includes('/cylon.webp')
        || s.includes('/cylon.png')
        || s.includes('/cylon-stripe.webp')
        || s.includes('/cylon-b-stripe.webp')
      ))
    );
    const isIronMan68 = s.includes('iron-man-68') || s.includes('iron_man_68');
    const isIronMan08 = s.includes('ironman-08') || s.includes('iron-man-08') || s.includes('ironman_08') || s.includes('iron_man_08');
    const isCyberman = s.includes('cyberman') || s.includes('cyber-man') || s.includes('cyber_man');
    const isMaschinenmensch = s.includes('maschinenmensch');
    const isRobocop = s.includes('robocop');
    const isTerminator = s.includes('terminator');
    const isRobbie = s.includes('robbie') || s.includes('robby');

    if (isDalek) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isR2d2) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isC3p0) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isVader) return { x: 110.095, y: 25.189, s: 0.515, u: 'svg' };
    if (isAfrodita) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isMazinger) return { x: 110.085, y: 25.189, s: 0.51, u: 'svg' };
    if (isCylon78) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isCylon03) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isIronMan68) return { x: 110.08, y: 24.947, s: 0.51, u: 'svg' };
    if (isIronMan08) return { x: 110.065, y: 25.175, s: 0.51, u: 'svg' };
    if (isCyberman) return { x: 109.982, y: 25.416, s: 0.51, u: 'svg' };
    if (isMaschinenmensch) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isRobocop) return { x: 110.07, y: 25.175, s: 0.51, u: 'svg' };
    if (isTerminator) return { x: 110.065, y: 25.175, s: 0.51, u: 'svg' };
    if (isRobbie) return { x: 110.065, y: 25.175, s: 0.51, u: 'svg' };

    return null;
  } catch {
    return null;
  }
};
