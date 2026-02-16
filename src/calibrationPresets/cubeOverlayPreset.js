export const getCubeOverlayPreset = (overlaySrc) => {
  try {
    const s = (overlaySrc || '').toString().toLowerCase();
    const isCubeDrawing = s.includes('/custom_logos/drawings/cube/');
    const isCubePlaceholder = s.includes('/placeholders/images_grid/cube/');
    if (!isCubeDrawing && !isCubePlaceholder) return null;

    const isCylon = s.includes('cylon');
    const isCyber = s.includes('cyber');
    const isDarth = s.includes('darth');
    const isAfrodita = s.includes('afrodita');
    const isMazinger = s.includes('mazinger');
    const isRoboCube = s.includes('robocube');
    const isMaschinen = s.includes('maschinen');
    const is3Cube = s.includes('cube-3') || s.includes('3cube');
    const isIronKong = s.includes('iron-kong') || s.includes('iron_kong') || (s.includes('iron') && s.includes('kong'));
    const isIronCube68 = s.includes('iron-cube-68') || s.includes('iron_cube_68');

    if (isCyber) return { x: 102.147, y: -2.839, s: 0.605, u: 'svg' };
    if (isCylon) return { x: 108.108, y: 21.049, s: 0.53, u: 'svg' };
    if (isDarth) return { x: 112.127, y: 29.111, s: 0.49, u: 'svg' };
    if (isIronCube68) return { x: 116.101, y: 35.07, s: 0.445, u: 'svg' };
    if (isIronKong) return { x: 115.983, y: 36.703, s: 0.44, u: 'svg' };
    if (isRoboCube) return { x: 115.057, y: 34.937, s: 0.45, u: 'svg' };
    if (isMaschinen) return { x: 106.046, y: 8.837, s: 0.555, u: 'svg' };
    if (is3Cube) return { x: 108.033, y: 14.81, s: 0.53, u: 'svg' };
    if (isAfrodita) return { x: 98.138, y: -14.855, s: 0.65, u: 'svg' };
    if (isMazinger) return { x: 96.151, y: -20.832, s: 0.675, u: 'svg' };

    return null;
  } catch {
    return null;
  }
};
