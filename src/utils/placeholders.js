const DEFAULT_BASE = '/placeholders/apparel/t-shirt/gildan_5000';

export async function loadGildan5000Colors({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const res = await fetchFn(`${base}/colors.json`);
  if (!res.ok) throw new Error(`Failed to load colors.json (${res.status})`);
  return res.json();
}

export async function loadGildan5000Manifest({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const res = await fetchFn(`${base}/manifest.json`);
  if (!res.ok) throw new Error(`Failed to load manifest.json (${res.status})`);
  return res.json();
}

export async function getGildan5000Catalog({ base = DEFAULT_BASE, fetchFn = fetch } = {}) {
  const [colorsJson, manifest] = await Promise.all([
    loadGildan5000Colors({ base, fetchFn }),
    loadGildan5000Manifest({ base, fetchFn }),
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
