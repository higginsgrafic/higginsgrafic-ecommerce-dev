export const SCALE_MIN = 0.1;
export const SCALE_MAX = 50;

export const clampScale = (n, fallback = 1) => {
  const v = Number.isFinite(n) ? n : Number.parseFloat(String(n));
  if (!Number.isFinite(v) || v <= 0) return fallback;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, v));
};

export const canonicalStripeDrawingOverlayKey = (rawSrc) => {
  try {
    const s = String(rawSrc || '').trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower.includes('/custom_logos/drawings/images_stripe/austen/keep_calm/')) {
      return '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm';
    }
    return s;
  } catch {
    try {
      return String(rawSrc || '').trim();
    } catch {
      return '';
    }
  }
};

export const writeCalibrationToMap = (src, partial) => {
  try {
    const overlayKey = String(src || '').trim();
    if (!overlayKey) return;
    const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);
    const keyToWrite = canonicalOverlayKey || overlayKey;
    const raw = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
    let parsed = null;
    try { parsed = raw ? JSON.parse(String(raw)) : null; } catch { parsed = null; }
    const out = parsed && typeof parsed === 'object' ? { ...parsed } : {};
    const prev = out[keyToWrite];
    const next = { ...(prev && typeof prev === 'object' ? prev : {}), ...partial };
    out[keyToWrite] = next;
    if (canonicalOverlayKey && canonicalOverlayKey !== overlayKey) out[overlayKey] = next;
    window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC', JSON.stringify(out));
  } catch { /* ignore */ }
};

export const parseFinite = (raw) => {
  const n = Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
};

export const normalizeMegaStripeRefSrc = (raw) => {
  try {
    const s0 = (raw == null) ? '' : String(raw);
    const s = s0.trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    const idx = s.indexOf('/public/');
    if (idx >= 0) {
      const tail = s.slice(idx + '/public'.length);
      return tail.startsWith('/') ? tail : `/${tail}`;
    }
    if (s.startsWith('public/')) return `/${s.slice('public/'.length)}`;
    if (s.startsWith('/public/')) return s.slice('/public'.length);
    if (s.startsWith('./public/')) return `/${s.slice('./public/'.length)}`;
    if (s.startsWith('./')) return s.slice(1);
    const rawPath = (s.startsWith('/') ? s : `/${s}`);
    return encodeURI(rawPath);
  } catch {
    return '';
  }
};
