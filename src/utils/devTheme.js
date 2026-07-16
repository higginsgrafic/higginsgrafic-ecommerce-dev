export const devHexToHslTriplet = (hex) => {
  const raw = (hex || '').toString().trim();
  const m = raw.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  const toFixedTrim = (value, digits) => {
    const s = Number(value).toFixed(digits);
    return s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
  };

  const hDeg = delta === 0 ? 0 : h;
  const sPct = s * 100;
  const lPct = l * 100;

  return `${toFixedTrim(hDeg, 6)} ${toFixedTrim(sPct, 6)}% ${toFixedTrim(lPct, 6)}%`;
};

export const applyDevThemeVarsFromStorage = () => {
  try {
    const savedStrong = window.localStorage.getItem('DEV_THEME_STRONG_HEX');
    const savedSoft = window.localStorage.getItem('DEV_THEME_SOFT_HEX');
    const savedRing = window.localStorage.getItem('DEV_THEME_RING_HEX');
    const savedAccent = window.localStorage.getItem('DEV_THEME_ACCENT_HEX');
    const savedRadiusPxRaw = window.localStorage.getItem('DEV_THEME_RADIUS_PX');
    const savedUiScalePctRaw = window.localStorage.getItem('DEV_UI_SCALE_PCT');
    const savedShadowHex = window.localStorage.getItem('DEV_UI_SHADOW_HEX');
    const savedShadowStrengthRaw = window.localStorage.getItem('DEV_UI_SHADOW_STRENGTH');
    const strongTriplet = devHexToHslTriplet(savedStrong);
    const softTriplet = devHexToHslTriplet(savedSoft);
    const ringTriplet = devHexToHslTriplet(savedRing);
    const accentTriplet = devHexToHslTriplet(savedAccent);
    if (strongTriplet) document.documentElement.style.setProperty('--foreground', strongTriplet);
    if (softTriplet) document.documentElement.style.setProperty('--muted-foreground', softTriplet);
    if (ringTriplet) document.documentElement.style.setProperty('--ring', ringTriplet);
    if (accentTriplet) document.documentElement.style.setProperty('--accent', accentTriplet);

    const radiusPx = savedRadiusPxRaw == null ? NaN : Number(savedRadiusPxRaw);
    if (Number.isFinite(radiusPx)) {
      const px = Math.max(0, Math.min(40, radiusPx));
      document.documentElement.style.setProperty('--radius', `${px / 16}rem`);
    }

    const uiScalePct = savedUiScalePctRaw == null ? NaN : Number(savedUiScalePctRaw);
    if (Number.isFinite(uiScalePct)) {
      const pct = Math.max(70, Math.min(130, uiScalePct));
      document.documentElement.style.fontSize = `${pct}%`;
    }

    const shadowTriplet = devHexToHslTriplet(savedShadowHex);
    if (shadowTriplet) document.documentElement.style.setProperty('--shadow-color', shadowTriplet);

    const shadowStrength = savedShadowStrengthRaw == null ? NaN : Number(savedShadowStrengthRaw);
    if (Number.isFinite(shadowStrength)) {
      const s = Math.max(0, Math.min(2, shadowStrength));
      document.documentElement.style.setProperty('--shadow-strength', String(s));
    }
  } catch {
    // ignore
  }
};
