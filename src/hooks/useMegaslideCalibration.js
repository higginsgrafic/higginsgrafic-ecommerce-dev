import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useMegaStripeDebugVars from './useMegaStripeDebugVars';
import useMegaTileSelectorDrag from './useMegaTileSelectorDrag';
import { getMegaPublicSelectorFor } from '../components/fullwide/megaPublicSelectorState.js';

const DEFAULT_SELECTOR_PARAMS = {
  keyset: 'v1',
  enabled: true,
  target: 'NCC-1701-D',
  sizePx: 200,
  strokePx: 10,
  color: 'black',
  stepX: 0,
  stepY: 0,
  radiusPx: 8,
  extendTopPx: 30,
  extendRightPx: 0,
  extendBottomPx: 0,
  extendLeftPx: 0,
};

/**
 * Encapsulates all calibration state for a megaslide page component.
 * Each component instance gets its own independent calibration by passing
 * a unique namespace. This namespaces localStorage keys and window events
 * so that tuning one component does not affect another.
 *
 * @param {string} namespace - e.g. 'p2' for pagina 2
 * @param {string|null} active - current active collection key
 * @param {React.RefObject} containerRef - ref to the DOM container for measuring padding/tile size
 * @returns {object} calibration bag
 */
export default function useMegaslideCalibration(namespace = '', active = null, containerRef = null) {
  const ns = namespace ? `${namespace}_` : '';
  const activeRef = useRef(active);
  activeRef.current = active;

  const normalizeOverlaySrc = useCallback((value) => {
    let s = (value || '').toString().trim();
    if (!s) return null;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'))) {
      s = s.slice(1, -1).trim();
    }
    if (!s) return null;
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;

    try {
      const idx = s.lastIndexOf('/public/custom_logos/');
      if (idx >= 0) {
        const suffix = s.slice(idx + '/public'.length);
        if (suffix.startsWith('/custom_logos/')) return suffix;
      }
      const idx2 = s.lastIndexOf('/custom_logos/');
      if (idx2 > 0 && !s.startsWith('/custom_logos/')) {
        const suffix = s.slice(idx2);
        if (suffix.startsWith('/custom_logos/')) return suffix;
      }
    } catch {
      // ignore
    }

    try {
      const file = (s.split('/').pop() || '').trim();
      const lower = file.toLowerCase();
      const isBare = (file === s && !s.startsWith('/')) || (s === `/${file}`);
      const hasNoFolders = (s === file) || (s === `/${file}`);
      if (isBare && hasNoFolders && /^keep-calm-.*-stripe\.webp$/i.test(file)) {
        const folder = lower.includes('-b-stripe')
          ? 'black'
          : lower.includes('-w-stripe')
            ? 'white'
            : (lower.includes('multi') || lower.includes('-multi-'))
              ? 'color'
              : 'color';
        return `/custom_logos/drawings/images_stripe/austen/keep_calm/${folder}/${file}`;
      }
    } catch {
      // ignore
    }

    const rooted = s.startsWith('/') ? s : `/${s}`;
    return rooted.replace(
      '/custom_logos/drawings/images_stripe/stripe/',
      '/custom_logos/drawings/images_stripe/',
    );
  }, []);

  const stripeDebugVars = useMegaStripeDebugVars(normalizeOverlaySrc, namespace);

  const [megaTileSize, setMegaTileSize] = useState(null);
  const effectiveMegaTileSize = megaTileSize || 120;
  const stripePreviewHPx = Math.round((effectiveMegaTileSize || 240) * 0.9);

  const [stripeRowPadPx, setStripeRowPadPx] = useState(32);
  const [stripeRowPadXPx, setStripeRowPadXPx] = useState({ left: 0, right: 0 });

  // Measure padding from container
  useLayoutEffect(() => {
    try {
      if (!active) return undefined;
      const el = containerRef?.current;
      if (!el || typeof window === 'undefined') return undefined;

      const update = () => {
        try {
          const cs = window.getComputedStyle(el);
          const pt = Number.parseFloat(cs?.paddingTop || '0');
          const pl = Number.parseFloat(cs?.paddingLeft || '0');
          const pr = Number.parseFloat(cs?.paddingRight || '0');
          if (Number.isFinite(pt) && pt >= 0) {
            setStripeRowPadPx((prev) => (prev === pt ? prev : pt));
          }
          if (Number.isFinite(pl) && pl >= 0 && Number.isFinite(pr) && pr >= 0) {
            setStripeRowPadXPx((prev) => {
              if (!prev) return { left: pl, right: pr };
              if (prev.left === pl && prev.right === pr) return prev;
              return { left: pl, right: pr };
            });
          }
        } catch {
          // ignore
        }
      };

      update();
      window.requestAnimationFrame(() => update());
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
      };
    } catch {
      return undefined;
    }
  }, [active, containerRef]);

  // Measure tile size from container
  useLayoutEffect(() => {
    if (!active) return undefined;
    const el = containerRef?.current;
    if (!el) return undefined;

    const GAP_PX = 12;
    const COLS = 9;

    let rafId = null;
    let retryCount = 0;
    const MAX_RETRIES = 24;
    let ro = null;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) {
        if (retryCount < MAX_RETRIES) {
          retryCount += 1;
          if (rafId != null) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(recompute);
        }
        return;
      }
      const cs = window.getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft || '0') || 0;
      const pr = parseFloat(cs.paddingRight || '0') || 0;
      const contentW = w - pl - pr;
      if (!contentW) return;
      const totalGaps = (COLS - 1) * GAP_PX;
      const colW = (contentW - totalGaps) / COLS;
      if (!Number.isFinite(colW) || colW <= 0) return;
      const MAX_TILE_PX = 144;
      setMegaTileSize(Math.min(colW, MAX_TILE_PX));
    };

    recompute();
    rafId = requestAnimationFrame(recompute);
    window.addEventListener('resize', recompute);

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => recompute());
      try {
        ro.observe(el);
      } catch {
        ro = null;
      }
    }

    return () => {
      window.removeEventListener('resize', recompute);
      if (rafId != null) cancelAnimationFrame(rafId);
      try {
        ro?.disconnect?.();
      } catch {
        // ignore
      }
    };
  }, [active, containerRef]);

  // megaTileSelectorParams (namespaced localStorage)
  const [megaTileSelectorParams, setMegaTileSelectorParams] = useState(() => {
    try {
      if (typeof window === 'undefined') return { ...DEFAULT_SELECTOR_PARAMS };

      const hasV2 = (() => {
        try {
          const a = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_ENABLED`);
          const b = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_TARGET`);
          const c = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_SIZE_PX`);
          const d = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STROKE_PX`);
          const e = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_COLOR`);
          const f = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STEP_X`);
          const g = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STEP_Y`);
          return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
        } catch {
          return false;
        }
      })();

      const readBool = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return true;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };

      const v1Enabled = readBool(`${ns}MEGA_TILE_SELECTOR_ENABLED`, true);
      const v2Enabled = readBool(`${ns}MEGA_TILE_SELECTOR_V2_ENABLED`, hasV2 ? false : true);
      const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
      const K = (suffix) => (activeKeyset === 'v2' ? `${ns}MEGA_TILE_SELECTOR_V2_${suffix}` : `${ns}MEGA_TILE_SELECTOR_${suffix}`);

      const readNum = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        return Number.isFinite(n) ? n : fallback;
      };
      return {
        keyset: activeKeyset,
        enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
        target: String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D'),
        sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
        strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
        color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
        stepX: Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0))),
        stepY: Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0))),
        radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
        extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
        extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
        extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
        extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
      };
    } catch {
      return { ...DEFAULT_SELECTOR_PARAMS };
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const read = () => {
      try {
        const activeNow = String(activeRef.current || '');
        const hasV2 = (() => {
          try {
            const a = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_ENABLED`);
            const b = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_TARGET`);
            const c = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_SIZE_PX`);
            const d = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STROKE_PX`);
            const e = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_COLOR`);
            const f = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STEP_X`);
            const g = window.localStorage.getItem(`${ns}MEGA_TILE_SELECTOR_V2_STEP_Y`);
            return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
          } catch {
            return false;
          }
        })();

        const readBool = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          if (raw == null) return fallback;
          const v = String(raw).trim().toLowerCase();
          if (v === '') return true;
          return v === '1' || v === 'true' || v === 'on' || v === 'yes';
        };

        const v1Enabled = readBool(`${ns}MEGA_TILE_SELECTOR_ENABLED`, true);
        const v2Enabled = readBool(`${ns}MEGA_TILE_SELECTOR_V2_ENABLED`, hasV2 ? false : true);
        const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
        const K = (suffix) => (activeKeyset === 'v2' ? `${ns}MEGA_TILE_SELECTOR_V2_${suffix}` : `${ns}MEGA_TILE_SELECTOR_${suffix}`);

        const readNum = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          const n = raw == null ? NaN : Number.parseFloat(String(raw));
          return Number.isFinite(n) ? n : fallback;
        };
        setMegaTileSelectorParams({
          keyset: activeKeyset,
          enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
          target: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const t = typeof publicState?.target === 'string' ? publicState.target.trim() : '';
            return t ? t : String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D');
          })(),
          sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
          strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
          color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
          stepX: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepX);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0)));
          })(),
          stepY: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepY);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0)));
          })(),
          radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
          extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
          extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
          extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
          extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
        });
      } catch {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      const prefix = ns;
      if (e.key.startsWith(prefix)) {
        read();
      }
    };

    read();
    window.addEventListener('storage', onStorage);
    window.addEventListener(`${ns}mega-tile-selector-changed`, read);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(`${ns}mega-tile-selector-changed`, read);
    };
  }, [ns]);

  const onStartSelectorDrag = useMegaTileSelectorDrag();

  return {
    ...stripeDebugVars,
    normalizeOverlaySrc,
    megaTileSize,
    effectiveMegaTileSize,
    stripePreviewHPx,
    stripeRowPadPx,
    stripeRowPadXPx,
    megaTileSelectorParams,
    onStartSelectorDrag,
  };
}
