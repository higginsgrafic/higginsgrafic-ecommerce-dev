export function normalizeStorageKeyPart(value, maxLen = 48) {
  try {
    const s = (value || '').toString().toLowerCase();
    if (!s) return 'none';
    return s
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]+/gi, '_')
      .slice(0, maxLen);
  } catch {
    return 'none';
  }
}

export function buildStripeRefMockupKey(stripeRefMockupSrc) {
  try {
    if (!stripeRefMockupSrc || typeof stripeRefMockupSrc !== 'string') return 'none';
    const s = stripeRefMockupSrc.toLowerCase();
    if (s.includes('first-contact-') && s.includes('-black-white.png')) return 'first_contact_black_white';
    return normalizeStorageKeyPart(stripeRefMockupSrc);
  } catch {
    return 'none';
  }
}

export function buildStripeRefMockupKeyLegacy(stripeRefMockupSrc) {
  try {
    if (!stripeRefMockupSrc || typeof stripeRefMockupSrc !== 'string') return 'none';
    return normalizeStorageKeyPart(stripeRefMockupSrc);
  } catch {
    return 'none';
  }
}

export function buildStripeRefCalibrationStorageKeys({ stripeFresh, stripeRefMockupKey, stripeRefMockupSrc, geometrySignature, stripeV4Engine }) {
  const base = stripeFresh ? 'stripeRefCalibFresh' : 'stripeRefCalib';
  const t = 'all';
  const g = geometrySignature || 'nogeo';
  const m = stripeRefMockupKey || 'none';

  const v4Group = (() => {
    try {
      const s = (stripeRefMockupSrc || '').toString().toLowerCase();
      if (!s) return 'main';
      if (s.includes('/tmp/calibrtge/austen/')) return 'austen';
      return 'main';
    } catch {
      return 'main';
    }
  })();

  const calibrationStorageKeyLegacyPerMockup = `${base}_${t}_${m}_${g}`;
  const calibrationStorageKeyV4LegacyGlobal = (v4Group === 'main')
    ? `${base}_${t}_global_v4_tinted_shirt_v1_v4`
    : null;

  const calibrationStorageKeyV4Global = `${base}_${t}_global_v4_${v4Group}`;

  // V4 reference calibration must be global (independent of the particular ref mockup image),
  // because tinted ref images share the same underlying geometry.
  const calibrationStorageKeyV4PerMockup = `${base}_${t}_${m}_v4`;

  const calibrationStorageKey = stripeV4Engine
    ? calibrationStorageKeyV4Global
    : `${base}_${t}_${m}_${g}`;

  return {
    calibrationStorageKeyLegacyPerMockup,
    calibrationStorageKeyV4LegacyGlobal,
    calibrationStorageKeyV4Global,
    calibrationStorageKeyV4PerMockup,
    calibrationStorageKey,
  };
}

export function buildStripeRefCalibrationStorageKeyLegacyRef({ stripeFresh, stripeRefMockupSrc, stripeRefMockupKey, stripeRefMockupKeyLegacy, geometrySignature }) {
  try {
    if (!stripeRefMockupSrc) return null;
    if (stripeRefMockupKey !== 'first_contact_black_white') return null;
    if (!stripeRefMockupKeyLegacy || stripeRefMockupKeyLegacy === 'none') return null;
    if (stripeRefMockupKeyLegacy === stripeRefMockupKey) return null;
    const base = stripeFresh ? 'stripeRefCalibFresh' : 'stripeRefCalib';
    const t = 'all';
    const m = stripeRefMockupKeyLegacy;
    const g = geometrySignature || 'nogeo';
    return `${base}_${t}_${m}_${g}`;
  } catch {
    return null;
  }
}

export function migrateRefCalibFromLegacyKeys({ keyToWrite, geoKey, stripeRefTargetIndex, stripeRefTargetSlug, storage }) {
  try {
    const ls = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!ls) return null;
    if (!keyToWrite || !geoKey) return null;
    const base = 'stripeRefCalib';
    const candidates = [];
    if (stripeRefTargetIndex) candidates.push(`${base}_i${stripeRefTargetIndex}_${geoKey}`);
    if (stripeRefTargetSlug) candidates.push(`${base}_s${stripeRefTargetSlug}_${geoKey}`);
    candidates.push(`${base}_all_${geoKey}`);

    for (const k of candidates) {
      const v = ls.getItem(k);
      if (typeof v === 'string' && v) {
        ls.setItem(keyToWrite, v);
        return v;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function buildOverlayCalibrationStorageKeys({ stripeFresh, overlayCalibStorageDesignKey, geometrySignature, stripeV4Engine, overlaySrc }) {
  const base = stripeFresh ? 'stripeOverlayCalibFresh' : 'stripeOverlayCalib';
  const t = 'all';
  const m = overlayCalibStorageDesignKey || 'none';
  const g = stripeV4Engine ? 'v4' : (geometrySignature || 'nogeo');
  const overlayCalibrationStorageKey = `${base}_${t}_${m}_${g}`;

  const legacyBase = 'stripeOverlayCalib';
  const legacyM = overlaySrc ? overlaySrc.replace(/[^a-z0-9]+/gi, '_').slice(0, 48) : 'none';
  const legacyG = geometrySignature || 'nogeo';
  const overlayCalibrationStorageKeyLegacy = `${legacyBase}_${t}_${legacyM}_${legacyG}`;

  return {
    overlayCalibrationStorageKey,
    overlayCalibrationStorageKeyLegacy,
  };
}

export function getOverlayCalibrationStorageKeyLegacyFromSrc({ src, geometrySignature }) {
  try {
    const base = 'stripeOverlayCalib';
    const t = 'all';
    const m = src ? src.toString().replace(/[^a-z0-9]+/gi, '_').slice(0, 48) : 'none';
    const g = geometrySignature || 'nogeo';
    return `${base}_${t}_${m}_${g}`;
  } catch {
    return null;
  }
}

export function migrateOverlayCalibFromIndexedKeys({ keyToWrite, designKey, geoKey, storage }) {
  try {
    const ls = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!ls) return null;
    if (!keyToWrite || !designKey || !geoKey) return null;
    const prefix = 'stripeOverlayCalib_i';
    const suffix = `_${designKey}_${geoKey}`;
    const keys = Object.keys(ls || {});
    const match = keys.find((k) => k.startsWith(prefix) && k.endsWith(suffix));
    if (!match) return null;
    const v = ls.getItem(match);
    if (typeof v !== 'string' || !v) return null;
    ls.setItem(keyToWrite, v);
    return v;
  } catch {
    return null;
  }
}
