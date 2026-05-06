import { useEffect, useMemo, useState } from 'react';

/**
 * Generic helper: keeps a state value in sync with localStorage by re-reading
 * it on mount and whenever the given window event fires.
 */
function useStorageEventState(eventName, reader, initial) {
  const [value, setValue] = useState(typeof initial === 'function' ? initial : () => initial);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const sync = () => {
      try {
        setValue(reader());
      } catch {
        // ignore
      }
    };
    sync();
    window.addEventListener(eventName, sync);
    return () => window.removeEventListener(eventName, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);
  return value;
}

const parseBool = (raw, fallback = true) => {
  if (raw == null) return fallback;
  const v = String(raw).trim().toLowerCase();
  return v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes';
};

const readRefPair = (enabledKey, srcKey) => {
  try {
    const en = window.localStorage.getItem(enabledKey) === '1';
    const src = String(window.localStorage.getItem(srcKey) || '');
    return { enabled: en, src };
  } catch {
    return { enabled: false, src: '' };
  }
};

/**
 * Aggregates all the localStorage-backed debug variables that drive the
 * mega-slide stripe overlay (REF, REF2, sprite enabled, shirt drawing
 * enabled, drawing overlay src, tile gap). Each is wired to its own
 * window event so external HUDs/probes can mutate them and see live
 * updates without polling.
 *
 * @param {(value: string) => string | null} normalizeOverlaySrc
 *        helper that returns a sanitized overlay src or null
 * @returns {object} debug variable bag
 */
export default function useMegaStripeDebugVars(normalizeOverlaySrc) {
  const ref = useStorageEventState(
    'mega-stripe-ref-changed',
    () => readRefPair('MEGA_STRIPE_REF_ENABLED', 'MEGA_STRIPE_REF_SRC'),
    { enabled: false, src: '' },
  );

  const ref2 = useStorageEventState(
    'mega-stripe-ref2-changed',
    () => readRefPair('MEGA_STRIPE_REF2_ENABLED', 'MEGA_STRIPE_REF2_SRC'),
    { enabled: false, src: '' },
  );

  const spriteEnabled = useStorageEventState(
    'mega-stripe-sprite-enabled-changed',
    () => parseBool(window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED'), true),
    true,
  );

  const tileGapPx = useStorageEventState(
    'mega-stripe-tile-gap-changed',
    () => {
      const raw = window.localStorage.getItem('MEGA_STRIPE_TILE_GAP_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(200, Math.max(-200, n)) : 0;
    },
    0,
  );

  const [shirtDrawingEnabled, setShirtDrawingEnabled] = useState(() => {
    try {
      const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      if (rawNew != null) return parseBool(rawNew, true);
      const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      if (rawOld != null) return parseBool(rawOld, true);
      return true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const sync = () => {
      try {
        const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
        if (rawNew != null) {
          setShirtDrawingEnabled(parseBool(rawNew, true));
          return;
        }
        const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
        if (rawOld != null) {
          setShirtDrawingEnabled(parseBool(rawOld, true));
          return;
        }
        setShirtDrawingEnabled(true);
      } catch {
        setShirtDrawingEnabled(true);
      }
    };
    sync();
    window.addEventListener('hg-shirt-drawing-enabled-changed', sync);
    window.addEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    return () => {
      window.removeEventListener('hg-shirt-drawing-enabled-changed', sync);
      window.removeEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    };
  }, []);

  const [drawingOverlaySrc, setDrawingOverlaySrc] = useState(() => {
    try {
      const raw = String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
      if (!raw) return null;
      const normalized = (normalizeOverlaySrc && normalizeOverlaySrc(raw)) || raw;
      const lower = normalized.toLowerCase();
      const isUrl = /^(https?:)?\/\//i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized);
      const isStripeSrc = lower.includes('/custom_logos/drawings/images_stripe/') || lower.includes('/custom_logos/drawings/images_originals/stripe/');
      return (isUrl || isStripeSrc) ? normalized : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const sync = () => {
      try {
        const raw = String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
        if (!raw) {
          setDrawingOverlaySrc(null);
          return;
        }
        const normalized = (normalizeOverlaySrc && normalizeOverlaySrc(raw)) || raw;
        const lower = normalized.toLowerCase();
        const isUrl = /^(https?:)?\/\//i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized);
        const isStripeSrc = lower.includes('/custom_logos/drawings/images_stripe/') || lower.includes('/custom_logos/drawings/images_originals/stripe/');
        setDrawingOverlaySrc((isUrl || isStripeSrc) ? normalized : null);
      } catch {
        setDrawingOverlaySrc(null);
      }
    };
    sync();
    window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => window.removeEventListener('hg-drawing-overlay-changed', sync);
  }, [normalizeOverlaySrc]);

  const drawingOverlaySrcEffective = useMemo(() => {
    try {
      if (drawingOverlaySrc) return drawingOverlaySrc;
      if (!import.meta.env.DEV) return null;
      return '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp';
    } catch {
      return drawingOverlaySrc;
    }
  }, [drawingOverlaySrc]);

  return {
    megaStripeRefEnabledLocal: ref.enabled,
    megaStripeRefSrcLocal: ref.src,
    megaStripeRef2EnabledLocal: ref2.enabled,
    megaStripeRef2SrcLocal: ref2.src,
    megaStripeSpriteEnabledLocal: spriteEnabled,
    megaShirtDrawingEnabledLocal: shirtDrawingEnabled,
    drawingOverlaySrcLocal: drawingOverlaySrc,
    drawingOverlaySrcEffective,
    tileGapPxLocal: tileGapPx,
  };
}
