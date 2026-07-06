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

const readKey = (ns, baseKey) => {
  try {
    const v = window.localStorage.getItem(`${ns}${baseKey}`);
    if (v != null) return v;
    return window.localStorage.getItem(baseKey);
  } catch {
    return null;
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
export default function useMegaStripeDebugVars(normalizeOverlaySrc, namespace = '') {
  const ns = namespace ? `${namespace}_` : '';
  const ref = useStorageEventState(
    `${ns}mega-stripe-ref-changed`,
    () => ({
      enabled: readKey(ns, 'MEGA_STRIPE_REF_ENABLED') === '1',
      src: String(readKey(ns, 'MEGA_STRIPE_REF_SRC') || ''),
    }),
    { enabled: false, src: '' },
  );
  // Also listen to the non-namespaced event for fallback compatibility
  useEffect(() => {
    if (!ns || typeof window === 'undefined') return undefined;
    const sync = () => {
      // Re-trigger by dispatching the namespaced event
      window.dispatchEvent(new Event(`${ns}mega-stripe-ref-changed`));
    };
    window.addEventListener('mega-stripe-ref-changed', sync);
    return () => window.removeEventListener('mega-stripe-ref-changed', sync);
  }, [ns]);

  const ref2 = useStorageEventState(
    `${ns}mega-stripe-ref2-changed`,
    () => ({
      enabled: readKey(ns, 'MEGA_STRIPE_REF2_ENABLED') === '1',
      src: String(readKey(ns, 'MEGA_STRIPE_REF2_SRC') || ''),
    }),
    { enabled: false, src: '' },
  );
  useEffect(() => {
    if (!ns || typeof window === 'undefined') return undefined;
    const sync = () => window.dispatchEvent(new Event(`${ns}mega-stripe-ref2-changed`));
    window.addEventListener('mega-stripe-ref2-changed', sync);
    return () => window.removeEventListener('mega-stripe-ref2-changed', sync);
  }, [ns]);

  const spriteEnabled = useStorageEventState(
    `${ns}mega-stripe-sprite-enabled-changed`,
    () => parseBool(readKey(ns, 'MEGA_STRIPE_SPRITE_ENABLED'), true),
    true,
  );
  useEffect(() => {
    if (!ns || typeof window === 'undefined') return undefined;
    const sync = () => window.dispatchEvent(new Event(`${ns}mega-stripe-sprite-enabled-changed`));
    window.addEventListener('mega-stripe-sprite-enabled-changed', sync);
    return () => window.removeEventListener('mega-stripe-sprite-enabled-changed', sync);
  }, [ns]);

  const tileGapPx = useStorageEventState(
    `${ns}mega-stripe-tile-gap-changed`,
    () => {
      const raw = readKey(ns, 'MEGA_STRIPE_TILE_GAP_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(200, Math.max(-200, n)) : 0;
    },
    0,
  );
  useEffect(() => {
    if (!ns || typeof window === 'undefined') return undefined;
    const sync = () => window.dispatchEvent(new Event(`${ns}mega-stripe-tile-gap-changed`));
    window.addEventListener('mega-stripe-tile-gap-changed', sync);
    return () => window.removeEventListener('mega-stripe-tile-gap-changed', sync);
  }, [ns]);

  const [shirtDrawingEnabled, setShirtDrawingEnabled] = useState(() => {
    try {
      const rawNew = readKey(ns, 'HG_SHIRT_DRAWING_ENABLED');
      if (rawNew != null) return parseBool(rawNew, true);
      const rawOld = readKey(ns, 'HG_SHIRT_DRAWING_OVERLAY_ENABLED');
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
        const rawNew = readKey(ns, 'HG_SHIRT_DRAWING_ENABLED');
        if (rawNew != null) {
          setShirtDrawingEnabled(parseBool(rawNew, true));
          return;
        }
        const rawOld = readKey(ns, 'HG_SHIRT_DRAWING_OVERLAY_ENABLED');
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
    window.addEventListener(`${ns}hg-shirt-drawing-enabled-changed`, sync);
    window.addEventListener(`${ns}hg-shirt-drawing-overlay-enabled-changed`, sync);
    if (ns) {
      window.addEventListener('hg-shirt-drawing-enabled-changed', sync);
      window.addEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    }
    return () => {
      window.removeEventListener(`${ns}hg-shirt-drawing-enabled-changed`, sync);
      window.removeEventListener(`${ns}hg-shirt-drawing-overlay-enabled-changed`, sync);
      if (ns) {
        window.removeEventListener('hg-shirt-drawing-enabled-changed', sync);
        window.removeEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
      }
    };
  }, [ns]);

  const [drawingOverlaySrc, setDrawingOverlaySrc] = useState(() => {
    try {
      const raw = String(readKey(ns, 'HG_DRAWING_OVERLAY_SRC') || '').trim();
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
        const raw = String(readKey(ns, 'HG_DRAWING_OVERLAY_SRC') || '').trim();
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
    window.addEventListener(`${ns}hg-drawing-overlay-changed`, sync);
    if (ns) window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => {
      window.removeEventListener(`${ns}hg-drawing-overlay-changed`, sync);
      if (ns) window.removeEventListener('hg-drawing-overlay-changed', sync);
    };
  }, [normalizeOverlaySrc, ns]);

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
