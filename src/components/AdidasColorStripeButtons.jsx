import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFirstContactOverlayPreset } from '../calibrationPresets/firstContactOverlayPreset';
import { getTheHumanInsideOverlayPreset } from '../calibrationPresets/theHumanInsideOverlayPreset';
import { getCubeOverlayPreset } from '../calibrationPresets/cubeOverlayPreset';
import { getOutcastedOverlayPreset } from '../calibrationPresets/outcastedOverlayPreset';
import { createUrlParamReaders } from '../utils/stripeUrlParams';
import {
  buildOverlayCalibrationStorageKeys,
  buildStripeRefCalibrationStorageKeyLegacyRef,
  buildStripeRefCalibrationStorageKeys,
  buildStripeRefMockupKey,
  buildStripeRefMockupKeyLegacy,
  getOverlayCalibrationStorageKeyLegacyFromSrc,
  migrateOverlayCalibFromIndexedKeys,
  migrateRefCalibFromLegacyKeys,
} from '../utils/stripeCalibrationStorage';
import StripeV4OverlayTileDebug from './StripeV4OverlayTileDebug';
import StripeCalibHud from './StripeCalibHud';

export default function AdidasColorStripeButtons({
  megaTileSize,
  onSelect,
  selectedColorOrder,
  selectedColorSlug,
  stripeVariant: stripeVariantProp,
  items: itemsProp,
  colorLabelBySlug,
  colorButtonSrcBySlug,
  stripeV4 = false,
  stripeV4Defaults,
  allowStripeV4UrlParams,
  forceStripeV4Sprite = false,
  stripeV4SpriteSrcOverride,
  overlaySrc: overlaySrcProp,
  overlayClassName,
  itemLeftOffsetPxByIndex,
  redistributeBetweenFirstAndLast = false,
  firstOffsetPx = -20,
  firstTileExtraOffsetPx = 0,
  lastOffsetPx = 50,
  autoAlignLastToRight = false,
  lastTileExtraOffsetPx = 0,
  cropFirstRightPx = 20,
  compressFactor = 0.79,
  debugSelectedPanel = '',
}) {
  const stripeV4OverlayClipPathIdRaw = useId();
  const stripeV4OverlayClipPathId = useMemo(() => {
    const raw = (stripeV4OverlayClipPathIdRaw || '').toString();
    const safe = raw.replace(/[^a-z0-9_-]/gi, '');
    return `stripe-v4-hit-clip-${safe || 'x'}`;
  }, [stripeV4OverlayClipPathIdRaw]);
  const stripeEnabled = !!stripeV4;
  const stripeDefaults = stripeV4Defaults;
  const allowStripeUrlParams = allowStripeV4UrlParams;
  const forceStripeSprite = !!forceStripeV4Sprite;
  const stripeSpriteSrcOverride = stripeV4SpriteSrcOverride;

  const stripeV4Engine = stripeEnabled;

  // Legacy V2 engine is disabled when V4 is enabled.
  const stripeV2 = false;
  const stripeV2Defaults = stripeDefaults;
  const allowStripeV2UrlParams = allowStripeUrlParams;
  const forceStripeV2Sprite = forceStripeSprite;
  const stripeV2SpriteSrcOverride = stripeSpriteSrcOverride;

  const effectiveItems = useMemo(() => {
    if (stripeEnabled) return Array.from({ length: 14 }, (_, i) => `t${i + 1}`);
    if (Array.isArray(itemsProp) && itemsProp.length > 0) return itemsProp.slice(0, 14);
    return Array.isArray(selectedColorOrder) ? selectedColorOrder.slice(0, 14) : [];
  }, [itemsProp, selectedColorOrder, stripeEnabled]);

  const stripeRootRef = useRef(null);
  const stripeTrackRef = useRef(null);
  const stripeCalibResetOnceRef = useRef(false);
  const stripeCalibMountInfoRef = useRef({ mountedAt: 0, mountedCount: 0, lastGeo: '' });
  const stripeCalibScrollRef = useRef({ x: 0, y: 0 });
  const stripeCalibHudRef = useRef(null);
  const stripeCalibHudWrapRef = useRef(null);
  const stripeCalibFullOverlayRef = useRef(null);
  const stripeCalibDebugLastRef = useRef({});
  const stripeV3OverlayUnitsMigratedRef = useRef(false);
  const selectedTileRef = useRef(null);
  const stripeCollectedRestoreRef = useRef(null);
  const stripeCollectedCopyRef = useRef(null);

  const [lastClickedSlug, setLastClickedSlug] = useState('');
  const stripeCalibCopyRef = useRef(null);
  const stripeHudPosMemoRef = useRef({ last: '', className: '' });
  const dotCalibrationRef = useRef(null);
  const overlayDirtyRef = useRef(false);
  const overlayCalibLoadedOnceRef = useRef(false);

  const [locSearch, setLocSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopstate = () => {
      setLocSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  const urlParams = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(locSearch);
    }
    return null;
  }, [locSearch]);

  const { get: getUrlParam, has: hasUrlParam, parseFloatParam, parseIntParam, parseStringParam } = useMemo(
    () => createUrlParamReaders(urlParams),
    [urlParams]
  );

  const stripeCalibModeParam = parseStringParam('stripeCalibMode', 'ref');

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!urlParams || typeof window === 'undefined') return;
    if (!urlParams.has('stripeResetAll')) return;

    try {
      const prefixes = [
        'stripeRefCalib',
        'stripeRefCalibFresh',
        'stripeOverlayCalib',
        'stripeOverlayCalibFresh',
        'stripeOverlayCalib_i',
      ];

      const toDelete = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (!k) continue;
        if (prefixes.some((p) => k.startsWith(p))) toDelete.push(k);
      }
      for (const k of toDelete) window.localStorage.removeItem(k);
    } catch {
      // ignore
    }

    try {
      const clean = new URLSearchParams(window.location.search);
      for (const k of Array.from(clean.keys())) {
        if (
          k === 'ws'
          || k === 'debugStripeMount'
          || k === 'debugStripeHit'
          || k === 'stripeBeltGuides'
          || k === 'disableStripeHit'
          || k === 'stripeFresh'
          || k === 'stripeCalib'
          || k === 'stripeCalibMode'
          || k === 'stripeCalibReset'
          || k === 'stripeClamp'
          || k === 'stripeHudPos'
          || k === 'stripeOverlayClip'
          || k === 'stripeOverlayClipDebug'
          || k === 'stripeRefMockup'
          || k === 'stripeRefTarget'
          || k === 'stripeRefTargetIndex'
          || k === 'stripeRefGhost'
          || k === 'stripeRefBlend'
          || k === 'stripeRefOpacity'
          || k === 'stripeRefTile1'
          || k === 'stripeRefX'
          || k === 'stripeRefY'
          || k === 'stripeRefScale'
          || k === 'stripeRef2X'
          || k === 'stripeRef2Y'
          || k === 'stripeRef2Scale'
          || k === 'blueViewport'
          || k === 'mirror1p5'
          || k === 'mirror1p5y'
          || k === 'allx'
          || k === 'ally'
          || k.startsWith('v2')
          || k.startsWith('v4')
          || k.startsWith('s1')
          || /^\d+p\d+/i.test(k)
          || k.startsWith('stripeOverlay')
        ) {
          clean.delete(k);
        }
      }

      const qs = clean.toString();
      const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`;
      window.location.replace(nextUrl);
    } catch {
      // ignore
    }
  }, [urlParams]);

  const wsEnabled = !!(import.meta.env.DEV && urlParams?.has('ws'));
  const debugStripeMount = !!(import.meta.env.DEV && typeof urlParams?.has === 'function' && urlParams.has('debugStripeMount'));
  const stripeBeltGuides = (() => {
    try {
      if (!urlParams) return false;
      const v = typeof urlParams.get === 'function' ? urlParams.get('stripeBeltGuides') : null;
      if (v === '1') return true;
      // Backwards-compatible: treat presence-only param as enabled.
      return (typeof urlParams.has === 'function') ? urlParams.has('stripeBeltGuides') : false;
    } catch {
      return false;
    }
  })();
  const stripeV2AllowUrlParams = !!allowStripeUrlParams;
  const stripeCalibReset = typeof urlParams?.has === 'function' ? urlParams.has('stripeCalibReset') : false;
  const stripeFresh = typeof urlParams?.has === 'function' ? urlParams.has('stripeFresh') : false;
  const stripeCalibEnabled = typeof urlParams?.has === 'function' ? urlParams.has('stripeCalib') : false;

  const [stripeCalibMode, setStripeCalibMode] = useState(
    stripeCalibModeParam === 'overlay'
      ? 'overlay'
      : (stripeCalibModeParam === 'ref2'
          ? 'ref2'
          : (stripeCalibModeParam === 'tiles'
              ? 'tiles'
              : 'ref')),
  );

  useEffect(() => {
    if (!debugStripeMount) return;
    try {
      // eslint-disable-next-line no-console
      console.error('[stripe mount]', {
        megaTileSize,
        stripeV4,
        stripeEnabled,
        selectedColorOrderLen: Array.isArray(selectedColorOrder) ? selectedColorOrder.length : null,
      });
    } catch {
      // ignore
    }
  }, [debugStripeMount, megaTileSize, selectedColorOrder, stripeEnabled, stripeV4]);

  const overlaySrcPropNormalized = (() => {
    try {
      const v = overlaySrcProp;
      if (typeof v !== 'string') return v ?? null;
      const s = v.trim();
      return s ? s : null;
    } catch {
      return overlaySrcProp ?? null;
    }
  })();

  const overlaySrc = overlaySrcPropNormalized ?? null;

  const overlaySrcForPreset = useMemo(() => {
    if (!overlaySrc || typeof overlaySrc !== 'string') return overlaySrc;

    const ensureThumbSuffix = (src, kind) => {
      try {
        if (!src || typeof src !== 'string') return src;
        const [base, q] = src.split('?');
        if (!base) return src;
        const m = base.match(/^(.*)\.(webp|png|jpe?g)$/i);
        if (!m) return src;
        const prefix = m[1].replace(/-(grid|stripe)$/i, '');
        const ext = m[2];
        const want = `-${kind}`;
        const outBase = prefix.toLowerCase().endsWith(want) ? `${prefix}.${ext}` : `${prefix}${want}.${ext}`;
        return q ? `${outBase}?${q}` : outBase;
      } catch {
        return src;
      }
    };

    const resolveAustenStripeOverlay = (srcPath) => {
      try {
        if (!srcPath || typeof srcPath !== 'string') return srcPath;
        const [base, q] = srcPath.split('?');
        const file = (base.split('/').pop() || '').toString();
        if (!file) return srcPath;

        if (base.includes('/austen/quotes/') && !base.includes('/austen/quotes/black/')) {
          const out = base.replace('/austen/quotes/', '/austen/quotes/black/');
          return ensureThumbSuffix(q ? `${out}?${q}` : out, 'stripe');
        }
        if (base.includes('/austen/keep_calm/')) {
          const lower = file.toLowerCase();
          if (lower.startsWith('keep-calm-black')) {
            const out = base
              .replace('/austen/keep_calm/', '/austen/keep_calm/black/')
              .replace(/\/keep-calm-black(?:-(grid|stripe))?\.(webp|png|jpe?g)$/i, '/keep-calm-b-stripe.$2');
            return q ? `${out}?${q}` : out;
          }
          if (lower.includes('multi')) {
            const out = base.replace('/austen/keep_calm/', '/austen/keep_calm/multi/');
            return ensureThumbSuffix(q ? `${out}?${q}` : out, 'stripe');
          }
        }
        if (base.includes('/austen/keep_calm/') && !base.includes('/austen/keep_calm/black/') && !base.includes('/austen/keep_calm/multi/')) {
          const folder = file.toLowerCase().includes('multi') ? 'multi' : 'black';
          const out = base.replace('/austen/keep_calm/', `/austen/keep_calm/${folder}/`);
          return ensureThumbSuffix(q ? `${out}?${q}` : out, 'stripe');
        }
        if (base.includes('/austen/pemberley_house/') && !base.includes('/austen/pemberley_house/black/')) {
          const out = base.replace('/austen/pemberley_house/', '/austen/pemberley_house/black/');
          return ensureThumbSuffix(q ? `${out}?${q}` : out, 'stripe');
        }
        if (base.includes('/austen/looking_for_my_darcy/') && !base.includes('/austen/looking_for_my_darcy/dark/') && !base.includes('/austen/looking_for_my_darcy/light/') && !base.includes('/austen/looking_for_my_darcy/frame/') && !base.includes('/austen/looking_for_my_darcy/solid/')) {
          const lower = file.toLowerCase();
          const baseName = lower.replace(/\.(webp|png|jpe?g)$/i, '');
          let folder = '';
          let outFile = '';

          if (lower.includes('dark-gradient') || baseName.endsWith('-dark')) {
            folder = 'dark';
            const c = baseName.replace(/-dark-gradient$/i, '').replace(/-dark$/i, '');
            outFile = `${c}-dark-gradient-stripe.webp`;
          } else if (lower.includes('light-gradient') || baseName.endsWith('-light')) {
            folder = 'light';
            const c = baseName.replace(/-light-gradient$/i, '').replace(/-light$/i, '');
            outFile = `${c}-light-gradient-stripe.webp`;
          } else if (baseName.endsWith('-frame') || lower.includes('-frame')) {
            folder = 'frame';
            const c = baseName.replace(/-frame$/i, '');
            outFile = `${c}-frame-stripe.webp`;
          } else if (baseName.endsWith('-solid') || lower.includes('-solid')) {
            folder = 'solid';
            const c = baseName.replace(/-solid$/i, '');
            outFile = `${c}-solid-stripe.webp`;
          }

          if (folder && outFile) {
            const outBase = base.replace('/austen/looking_for_my_darcy/', `/austen/looking_for_my_darcy/${folder}/`);
            const out = outBase.replace(/\/[^/]+$/, `/${outFile}`);
            return q ? `${out}?${q}` : out;
          }
        }
      } catch {
        // ignore
      }
      return ensureThumbSuffix(srcPath, 'stripe');
    };

    let s = overlaySrc.trim();
    if (s.includes('/custom_logos/drawings/images_originals/stripe/')) {
      s = s.replace('/custom_logos/drawings/images_originals/stripe/', '/custom_logos/drawings/images_stripe/');
    }
    if (s.includes('/custom_logos/drawings/images_grid/')) {
      s = s.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_stripe/');
    }
    if (s.includes('/custom_logos/drawings/images_stripe/austen/')) return resolveAustenStripeOverlay(s);

    const file = s.split('/').pop() || '';

    if (s.includes('/custom_logos/drawings/images_grid/cube/') || s.includes('/custom_logos/drawings/images_stripe/cube/')) {
      const lower = file.toLowerCase();
      const lowerNoGrid = lower
        .replace(/-grid-stripe(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/-grid(?=\.(webp|png|jpe?g)$)/i, '');
      if (lowerNoGrid === 'iron-kong.webp' || lowerNoGrid === 'iron-kong-stripe.webp' || lowerNoGrid === 'iron-cube-08-iron-kong.webp' || lowerNoGrid === 'iron-cube-08-iron-kong-stripe.webp') {
        return '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp';
      }
      if (
        lowerNoGrid === 'iron-cube.webp'
        || lowerNoGrid === 'iron-cube-stripe.webp'
        || lowerNoGrid === 'iron-cube-68.webp'
        || lowerNoGrid === 'iron-cube-68-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp';
      }
      if (
        lowerNoGrid === '3cube-p0.webp'
        || lowerNoGrid === '3cube-p0-stripe.webp'
        || lowerNoGrid === 'cube-3-p0.webp'
        || lowerNoGrid === 'cube-3-p0-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp';
      }
      if (
        lowerNoGrid === 'cybercube.webp'
        || lowerNoGrid === 'cybercube-stripe.webp'
        || lowerNoGrid === 'cyber-cube.webp'
        || lowerNoGrid === 'cyber-cube-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp';
      }
      if (
        lowerNoGrid === 'cylon-cube.webp'
        || lowerNoGrid === 'cylon-cube-stripe.webp'
        || lowerNoGrid === 'cylon-cube-03.webp'
        || lowerNoGrid === 'cylon-cube-03-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp';
      }
      return ensureThumbSuffix(s, 'stripe');
    }

    if (s.includes('/custom_logos/drawings/images_grid/miscel·lania/') || s.includes('/custom_logos/drawings/images_stripe/miscel·lania/')) {
      const isMulti = s.includes('/miscel·lania/multi/');
      const lower = file.toLowerCase();
      const lowerNoGrid = lower
        .replace(/-grid-stripe(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/-grid(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/\?.*$/, '');
      if (isMulti) {
        if (
          lowerNoGrid === 'dj-vader-multi-1-stripe.webp'
          || lowerNoGrid === 'dj-vader-multi-2-stripe.webp'
          || lowerNoGrid === 'dj-vader-multi-dark-stripe.webp'
          || lowerNoGrid === 'dj-vader-multi-light-stripe.webp'
        ) {
          return '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp';
        }
        if (lowerNoGrid === 'death-star2d2-multi-dark-stripe.webp' || lowerNoGrid === 'death-star2d2-multi-light-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp';
        }
        if (lowerNoGrid === 'pont-del-diable-multi-dark-stripe.webp' || lowerNoGrid === 'pont-del-diable-multi-light-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/miscel·lania/black/pont-del-diable-b-stripe.webp';
        }
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/multi/${file}`, 'stripe');
      }
      if (
        lowerNoGrid === 'dj-vader.webp'
        || lowerNoGrid === 'dj-vader-b.webp'
        || lowerNoGrid === 'dj-vader-w.webp'
        || lowerNoGrid === 'dj-vader-b-stripe.webp'
        || lowerNoGrid === 'dj-vader-w-stripe.webp'
        || lowerNoGrid === 'dj-vader-multi-1-stripe.webp'
        || lowerNoGrid === 'dj-vader-multi-2-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp';
      }
      if (
        lowerNoGrid === 'death-star2d2.webp'
        || lowerNoGrid === 'death-star2d2-b.webp'
        || lowerNoGrid === 'death-star2d2-w.webp'
        || lowerNoGrid === 'death-star2d2-b-stripe.webp'
        || lowerNoGrid === 'death-star2d2-w-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp';
      }
      if (
        lowerNoGrid === 'pont-del-diable.webp'
        || lowerNoGrid === 'pont-del-diable-b.webp'
        || lowerNoGrid === 'pont-del-diable-w.webp'
        || lowerNoGrid === 'pont-del-diable-b-stripe.webp'
        || lowerNoGrid === 'pont-del-diable-w-stripe.webp'
      ) {
        return '/custom_logos/drawings/images_stripe/miscel·lania/black/pont-del-diable-b-stripe.webp';
      }
      return null;
    }

    if (s.includes('/custom_logos/drawings/images_grid/the_human_inside/') || s.includes('/custom_logos/drawings/images_stripe/the_human_inside/')) {
      const isWhite = s.includes('/the_human_inside/white/');
      const folder = isWhite ? 'white' : 'black';
      const lower = file.toLowerCase();
      const lowerNoGrid = lower
        .replace(/-grid-stripe(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/-grid(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/-stripe(?=\.(webp|png|jpe?g)$)/i, '')
        .replace(/\.(webp|png|jpe?g)$/i, '.webp');

      // Canonicalize Cylon 78 to the existing `cylon(-b)-stripe.webp` asset.
      if (lowerNoGrid === 'cylon.webp' || lowerNoGrid === 'cylon-78.webp' || lowerNoGrid === 'cylon-78-stripe.webp' || lowerNoGrid === 'cylon-stripe.webp' || lowerNoGrid === 'cylon-78-b-stripe.webp') {
        return isWhite
          ? '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-78-w-stripe.webp'
          : '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-78-b-stripe.webp';
      }
      if (lowerNoGrid === 'cylon-03.webp' || lowerNoGrid === 'cylon-03-stripe.webp' || lowerNoGrid === 'cylon-03-b-stripe.webp') {
        return isWhite
          ? '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-03-w-stripe.webp'
          : '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-03-b-stripe.webp';
      }

      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/${folder}/${file}`, 'stripe');
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /nx-01-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /ncc-1701-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /ncc-1701-d-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /wormhole-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /plasma-escape-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/first_contact/') && /vulcans-end-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp';
    }

    if (
      s.includes('/custom_logos/drawings/images_stripe/first_contact/')
      && /(the[- ]phoenix)-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(file)
    ) {
      return '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp';
    }

    if (s.includes('/custom_logos/drawings/images_stripe/')) return ensureThumbSuffix(s, 'stripe');

    return s;
  }, [overlaySrc]);

  const stripeVariantFromUrl = useMemo(() => {
    try {
      const p = new URLSearchParams(locSearch || window.location.search);
      const raw = (p.get('stripeVariant') || '').toString().trim().toLowerCase();
      return raw === 'white' || raw === 'black' || raw === 'color' ? raw : '';
    } catch {
      return '';
    }
  }, [locSearch]);

  const stripeVariantEffective = useMemo(() => {
    // URL param is authoritative when present (it can be changed outside React state).
    if (stripeVariantFromUrl === 'white' || stripeVariantFromUrl === 'black' || stripeVariantFromUrl === 'color') return stripeVariantFromUrl;
    const v = (stripeVariantProp || '').toString().trim().toLowerCase();
    if (v === 'white' || v === 'black' || v === 'color') return v;
    return '';
  }, [stripeVariantFromUrl, stripeVariantProp]);

  const overlaySrcForRender = useMemo(() => {
    const raw = typeof overlaySrc === 'string' ? overlaySrc.trim() : '';
    const isMultiRaw = raw.includes('/multi/') || /-multi-(dark|light)-stripe\.(webp|png|jpe?g)([?#]|$)/i.test(raw);

    const stripeVariant = stripeVariantEffective;

    const ensureStripeSuffixLocal = (srcPath) => {
      try {
        if (!srcPath || typeof srcPath !== 'string') return srcPath;
        const trimmed = srcPath.trim();
        if (!trimmed) return srcPath;
        const [base, q] = trimmed.split('?');
        const m = base.match(/^(.*)\.(webp|png|jpe?g)$/i);
        if (!m) return srcPath;
        const prefix = m[1].replace(/-(grid|stripe)$/i, '');
        const ext = m[2];
        const outBase = prefix.toLowerCase().endsWith('-stripe') ? `${prefix}.${ext}` : `${prefix}-stripe.${ext}`;
        return q ? `${outBase}?${q}` : outBase;
      } catch {
        return srcPath;
      }
    };

    // For multi/color variants we must keep the original multi src so the per-tile
    // dark/light override logic can kick in. We still rely on `overlaySrcForPreset`
    // elsewhere to normalize the calibration key.
    if (isMultiRaw) {
      // Multi overlays do NOT have -b/-w variants. They only exist as -multi-dark/-multi-light.
      // If the user explicitly selected BLANC/NEGRE, keep the multi path but force the
      // appropriate multi variant.
      if ((stripeVariant === 'white' || stripeVariant === 'black') && typeof overlaySrc === 'string') {
        try {
          const trimmed = overlaySrc.trim();
          const [base, q] = trimmed.split('?');
          const want = stripeVariant === 'black' ? 'dark' : 'light';
          const outBase = base.replace(/-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i, `-multi-${want}-stripe.$2`);
          const out = ensureStripeSuffixLocal(outBase);
          return q ? `${out}?${q}` : out;
        } catch {
          // fallthrough
        }
      }

      // But we still must not render GRID/originals paths (they often don't exist on the stripe
      // or they prevent the per-tile multi logic from matching `isStripe`).
      let s = overlaySrc;
      if (typeof raw === 'string' && raw.includes('/custom_logos/drawings/images_grid/')) {
        s = raw.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_stripe/');
      }
      if (typeof s === 'string' && s.includes('/custom_logos/drawings/images_originals/stripe/')) {
        s = s.replace('/custom_logos/drawings/images_originals/stripe/', '/custom_logos/drawings/images_stripe/');
      }
      return ensureStripeSuffixLocal(s);
    }

    // For non-multi overlays we must never render GRID/originals assets on the stripe.
    // Normalizing these is safe (it does not change the design, only the variant path).
    // NOTE: We only apply this mapping when the input is clearly a GRID/originals path,
    // to avoid unexpected canonicalization of already-correct STRIPE assets.
    if (
      typeof raw === 'string'
      && (
        raw.includes('/custom_logos/drawings/images_grid/')
        || raw.includes('/custom_logos/drawings/images_originals/stripe/')
      )
    ) {
      return overlaySrcForPreset;
    }

    // `overlaySrcForPreset` is allowed to canonicalize (e.g. white -> black) to share
    // calibration keys, but that must never affect the actual rendered overlay.
    const baseSrc = overlaySrc;

    // If the user explicitly selected BLANC/NEGRE, force the base overlay variant
    // (then per-tile logic will only handle the contrast inversion on t1/t14).
    if (!isMultiRaw && (stripeVariant === 'white' || stripeVariant === 'black') && typeof baseSrc === 'string') {
      const looksLikeBwVariantAsset = (() => {
        try {
          const base = baseSrc.split('?')[0] || '';
          return (
            /\/(black|white)\//i.test(base)
            || /-(b|w)-stripe\.(webp|png|jpe?g)$/i.test(base)
            || /-(b|w)\.(webp|png|jpe?g)$/i.test(base)
          );
        } catch {
          return false;
        }
      })();

      if (looksLikeBwVariantAsset) {
        const [base, q] = baseSrc.split('?');
        let out = base;
        if (stripeVariant === 'black') {
          out = out
            .replace(/\/white\//gi, '/black/')
            .replace(/-w-stripe\.(webp|png|jpe?g)$/i, '-b-stripe.$1')
            .replace(/-w\.(webp|png|jpe?g)$/i, '-b.$1');
        } else if (stripeVariant === 'white') {
          out = out
            .replace(/\/black\//gi, '/white/')
            .replace(/-b-stripe\.(webp|png|jpe?g)$/i, '-w-stripe.$1')
            .replace(/-b\.(webp|png|jpe?g)$/i, '-w.$1');
        }
        return q ? `${out}?${q}` : out;
      }
    }

    return baseSrc;
  }, [overlaySrc, overlaySrcForPreset, stripeVariantEffective]);

  const overlaySrcForRenderByTileIdx = (idx) => {
    try {
      if (debugFirstTestOverlay) {
        const tileIdx = (() => {
          try {
            const raw = (typeof urlParams?.get === 'function') ? (urlParams.get('debugFirstTestOverlayTile') || '') : '';
            if (raw == null || raw === '') return 0;
            const n = Number.parseInt(raw, 10);
            if (!Number.isFinite(n)) return 0;
            const clamped = Math.min(14, Math.max(1, n));
            return clamped - 1;
          } catch {
            return 0;
          }
        })();

        if (debugFirstTestOverlayMode === 'full') return debugFirstTestOverlaySrc;
        if (Number.isFinite(tileIdx) && tileIdx >= 0 && tileIdx < 14 && idx !== tileIdx) return null;
        return debugFirstTestOverlaySrc;
      }

      if (!overlaySrcForRender || typeof overlaySrcForRender !== 'string') return overlaySrcForRender;
      if (!Number.isFinite(idx)) return overlaySrcForRender;

      const s = overlaySrcForRender.toString();
      const isStripe = s.includes('/stripe/') || s.includes('-stripe');
      const isMulti = s.includes('/multi/') || /-multi-(dark|light)-stripe\.(webp|png|jpe?g)([?#]|$)/i.test(s);

      const clipOn = (() => {
        try {
          const raw = (typeof urlParams?.get === 'function') ? (urlParams.get('stripeOverlayClip') || '') : '';
          return raw === '1';
        } catch {
          return false;
        }
      })();

      const baseWant = stripeVariantEffective === 'white'
        ? 'white'
        : (stripeVariantEffective === 'black'
            ? 'black'
            : (selectedColorSlug === 'white'
                ? 'white'
                : (selectedColorSlug === 'black' ? 'black' : null)));

      if (!isMulti) {
        const looksLikeBwVariantAsset = (src) => {
          try {
            if (!src || typeof src !== 'string') return false;
            const base = src.split('?')[0] || '';
            return (
              /\/(black|white)\//i.test(base)
              || /-(b|w)-stripe\.(webp|png|jpe?g)$/i.test(base)
              || /-(b|w)\.(webp|png|jpe?g)$/i.test(base)
            );
          } catch {
            return false;
          }
        };

        const forceBw = (src, want) => {
          try {
            if (!src || typeof src !== 'string') return src;
            const trimmed = src.trim();
            if (!trimmed) return src;
            const [base, q] = trimmed.split('?');
            let out = base;

            if (want === 'white' && base.includes('/austen/quotes/')) {
              const m = base.match(/\/austen\/quotes\/(?:black\/)?([^/]+?)(?:-b)?-(?:stripe|grid)\.(webp|png|jpe?g)$/i);
              if (m) {
                const nameRaw = m[1];
                const name = nameRaw === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : nameRaw;
                const ext = m[2];
                out = `/custom_logos/drawings/images_stripe/austen/quotes/multi/${name}-multi-light-stripe.${ext}`;
                return q ? `${out}?${q}` : out;
              }
            }

            if (want === 'black') {
              out = out
                .replace(/\/white\//gi, '/black/')
                .replace(/-w-stripe\.(webp|png|jpe?g)$/i, '-b-stripe.$1')
                .replace(/-w\.(webp|png|jpe?g)$/i, '-b.$1');
            } else if (want === 'white') {
              out = out
                .replace(/\/black\//gi, '/white/')
                .replace(/-b-stripe\.(webp|png|jpe?g)$/i, '-w-stripe.$1')
                .replace(/-b\.(webp|png|jpe?g)$/i, '-w.$1');
            }

            return q ? `${out}?${q}` : out;
          } catch {
            return src;
          }
        };

        if (baseWant && looksLikeBwVariantAsset(overlaySrcForRender)) {
          // When clip is OFF we only render idx=0 as a single preview layer.
          // In that mode we must render the base variant (white/black), not the per-tile
          // contrast inversion for t1/t14, otherwise BLANC would still look black.
          if (!clipOn && idx === 0) {
            return forceBw(overlaySrcForRender, baseWant);
          }

          // In clipped mode, enforce contrast rule:
          // - WHITE variant: tile 1 must be BLACK
          // - BLACK variant: tile 14 must be WHITE
          if (baseWant === 'white') {
            if (idx === 0) return forceBw(overlaySrcForRender, 'black');
            return forceBw(overlaySrcForRender, 'white');
          }
          if (baseWant === 'black') {
            if (idx === 13) return forceBw(overlaySrcForRender, 'white');
            return forceBw(overlaySrcForRender, 'black');
          }

          return overlaySrcForRender;
        }

        return overlaySrcForRender;
      }

      const isDjVader = s.includes('dj-vader');

      if (isStripe && s.includes('/austen/quotes/') && /-multi-(dark|light)-stripe\.(webp|png|jpe?g)([?#]|$)/i.test(s)) {
        const rep = (which) => s.replace(/-multi-(dark|light)-stripe\./i, `-multi-${which}-stripe.`);
        if (baseWant === 'white') {
          if (idx === 0) return rep('dark');
          return rep('light');
        }
        if (baseWant === 'black') {
          if (idx === 13) return rep('light');
          return rep('dark');
        }
        return overlaySrcForRender;
      }

      if (isDjVader && isStripe) {
        const which = idx === 0 ? 1 : 2;
        return `/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-${which}-stripe.webp`;
      }

      const isMiscel = s.includes('/miscel·lania/');
      if (isMiscel && isStripe) {
        const isDeathStar = s.includes('death-star2d2');
        if (isDeathStar) {
          const variant = idx === 0 ? 'dark' : 'light';
          return `/custom_logos/drawings/images_stripe/miscel·lania/multi/death-star2d2-multi-${variant}-stripe.webp`;
        }
        const isPont = s.includes('pont-del-diable') || s.includes('pont_del_diable');
        if (isPont) {
          const variant = idx === 0 ? 'dark' : 'light';
          return `/custom_logos/drawings/images_stripe/miscel·lania/multi/pont-del-diable-multi-${variant}-stripe.webp`;
        }
      }

      const isAustenKeepCalm = s.includes('/austen/keep_calm/');
      if (isAustenKeepCalm && isStripe) {
        if (idx === 0) return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
        if (idx === 13) return '/custom_logos/drawings/images_originals/stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
      }

      const isThin = s.includes('/the_human_inside/');
      if (isThin && s.includes('/the_human_inside/multi/') && isStripe) {
        const m = s.match(/\/the_human_inside\/multi\/([^/]+)-multi-(dark|light)-stripe\.(webp|png|jpe?g)([?#]|$)/i);
        if (m) {
          const base = m[1];
          const ext = m[3];
          const baseWant = stripeVariantEffective === 'white'
            ? 'white'
            : (stripeVariantEffective === 'black'
                ? 'black'
                : (selectedColorSlug === 'white'
                    ? 'white'
                    : (selectedColorSlug === 'black' ? 'black' : null)));

          // Multi assets: we use dark/light as the bw pair.
          // In clipped mode, enforce contrast rule:
          // - WHITE variant: tile 1 must be DARK
          // - BLACK variant: tile 14 must be LIGHT
          const variant = (baseWant === 'white')
            ? (idx === 0 ? 'dark' : 'light')
            : ((baseWant === 'black')
                ? (idx === 13 ? 'light' : 'dark')
                : (idx === 0 ? 'dark' : 'light'));
          return `/custom_logos/drawings/images_stripe/the_human_inside/multi/${base}-multi-${variant}-stripe.${ext}`;
        }
      }

      const isFirstContact = s.includes('/first_contact/');
      if (!isFirstContact) return overlaySrcForRender;
      const isNx01 = s.includes('nx-01');
      if (isFirstContact && isNx01 && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/nx-01-multi-${variant}-stripe.webp`;
      }

      const isNcc1701d = s.includes('ncc-1701-d');
      if (isFirstContact && isNcc1701d && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-d-multi-${variant}-stripe.webp`;
      }

      const isNcc1701 = s.includes('ncc-1701');
      if (isFirstContact && isNcc1701 && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-multi-${variant}-stripe.webp`;
      }

      const isWormhole = s.includes('wormhole');
      if (isFirstContact && isWormhole && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/wormhole-multi-${variant}-stripe.webp`;
      }

      const isPlasmaEscape = s.includes('plasma-escape');
      if (isFirstContact && isPlasmaEscape && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/plasma-escape-multi-${variant}-stripe.webp`;
      }

      const isVulcansEnd = s.includes('vulcans-end');
      if (isFirstContact && isVulcansEnd && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/vulcans-end-multi-${variant}-stripe.webp`;
      }

      const isThePhoenix = s.includes('the-phoenix') || s.includes('the phoenix');
      if (isFirstContact && isThePhoenix && isStripe) {
        const variant = idx === 0 ? 'dark' : 'light';
        return `/custom_logos/drawings/images_stripe/first_contact/multi/the-phoenix-multi-${variant}-stripe.webp`;
      }

      return overlaySrcForRender;
    } catch {
      return overlaySrcForRender;
    }
  };

  const debugFirstTestOverlay = (getUrlParam('debugFirstTestOverlay') === '1');
  const debugFirstTestOverlaySrc = parseStringParam('debugFirstTestOverlaySrc', '/tmp/CALIBRTGE/TEST.png') || '/tmp/CALIBRTGE/TEST.png';
  const debugFirstTestOverlayModeRaw = parseStringParam('debugFirstTestOverlayMode', 'full') || 'full';
  const debugFirstTestOverlayMode = (debugFirstTestOverlayModeRaw === 'full' || debugFirstTestOverlayModeRaw === 'tile')
    ? debugFirstTestOverlayModeRaw
    : 'auto';

  const v4TileOverlaySrcs = useMemo(() => {
    try {
      if (!stripeV4Engine) return null;
      if (debugFirstTestOverlay) {
        const tileIdx = (() => {
          try {
            const raw = (typeof urlParams?.get === 'function') ? (urlParams.get('debugFirstTestOverlayTile') || '') : '';
            if (raw == null || raw === '') return 0;
            const n = Number.parseInt(raw, 10);
            if (!Number.isFinite(n)) return 0;
            const clamped = Math.min(14, Math.max(1, n));
            return clamped - 1;
          } catch {
            return 0;
          }
        })();

        const out = [];
        if (debugFirstTestOverlayMode === 'full') {
          for (let i = 0; i < 14; i += 1) out.push(debugFirstTestOverlaySrc);
        } else {
          for (let i = 0; i < 14; i += 1) out.push(i === tileIdx ? debugFirstTestOverlaySrc : null);
        }
        return out;
      }

      if (!overlaySrcForRender) return null;
      const out = [];
      for (let i = 0; i < 14; i += 1) out.push(overlaySrcForRenderByTileIdx(i));
      return out;
    } catch {
      return null;
    }
  }, [debugFirstTestOverlay, debugFirstTestOverlayMode, debugFirstTestOverlaySrc, overlaySrcForRender, overlaySrcForRenderByTileIdx, stripeV4Engine, urlParams]);

  const [v4TileOverlayLoad, setV4TileOverlayLoad] = useState(null);
  const [v4OverlayProbe, setV4OverlayProbe] = useState(null);

  const isSingleTileAssetProbe = useMemo(() => {
    try {
      const s = (typeof overlaySrcForRender === 'string') ? overlaySrcForRender : (overlaySrcForRender ? overlaySrcForRender.toString() : '');
      const isMulti = s.includes('/multi/') || /-multi-(dark|light)-stripe\.(webp|png|jpe?g)([?#]|$)/i.test(s);
      if (isMulti) return false;
      const w = Number(v4OverlayProbe?.w);
      if (!Number.isFinite(w) || w <= 0) return false;
      // stripeV4SvgW is a constant (2866) but is declared later in this component.
      // Use the literal here to avoid TDZ issues.
      const svgW = 2866;
      return w < (svgW * 0.85);
    } catch {
      return false;
    }
  }, [overlaySrcForRender, v4OverlayProbe]);

  useEffect(() => {
    try {
      if (!import.meta.env.DEV) return;
      if (!stripeV4Engine) return;
      if (!overlaySrcForRender) return;
      const t1 = overlaySrcForRenderByTileIdx(0);
      const t14 = overlaySrcForRenderByTileIdx(13);
      const payload = {
        stripeVariant: stripeVariantFromUrl,
        stripeVariantEffective,
        selectedColorSlug,
        overlaySrc,
        overlaySrcForRender,
        overlayProbe: v4OverlayProbe,
        isSingleTileAssetProbe,
        t1,
        t14,
      };
      // Keep it compact and easy to compare between clicks.
      // eslint-disable-next-line no-console
      console.log('[StripeV4 overlay resolve]', payload);
    } catch {
      // ignore
    }
  }, [overlaySrc, overlaySrcForRender, selectedColorSlug, stripeVariantEffective, stripeVariantFromUrl, stripeV4Engine, isSingleTileAssetProbe, v4OverlayProbe]);

  useEffect(() => {
    try {
      if (!stripeV4Engine) {
        setV4OverlayProbe(null);
        return;
      }
      if (!overlaySrcForRender) {
        setV4OverlayProbe(null);
        return;
      }
      const probeIdx = (() => {
        try {
          if (!debugFirstTestOverlay) return 0;
          const raw = (typeof urlParams?.get === 'function') ? (urlParams.get('debugFirstTestOverlayTile') || '') : '';
          if (raw == null || raw === '') return 0;
          const n = Number.parseInt(raw, 10);
          if (!Number.isFinite(n)) return 0;
          const clamped = Math.min(14, Math.max(1, n));
          return clamped - 1;
        } catch {
          return 0;
        }
      })();

      const src0 = overlaySrcForRenderByTileIdx(probeIdx);
      if (!src0) {
        setV4OverlayProbe(null);
        return;
      }
      const img = new Image();
      img.onload = () => {
        setV4OverlayProbe({ w: img.naturalWidth, h: img.naturalHeight, src: src0 });
      };
      img.onerror = () => setV4OverlayProbe(null);
      img.src = src0;
      return () => {
        try {
          img.onload = null;
          img.onerror = null;
        } catch {
          // ignore
        }
      };
    } catch {
      setV4OverlayProbe(null);
      return;
    }
  }, [debugFirstTestOverlay, debugFirstTestOverlaySrc, stripeV4Engine, overlaySrcForRender]);

  useEffect(() => {
    try {
      if (!import.meta.env.DEV) return;
      if (!stripeV4Engine) return;
      const debugStripeHitLocal = !!(urlParams && typeof urlParams?.has === 'function' && urlParams.has('debugStripeHit'));
      if (!debugStripeHitLocal) return;
      if (!Array.isArray(v4TileOverlaySrcs) || v4TileOverlaySrcs.length !== 14) {
        setV4TileOverlayLoad(null);
        return;
      }

      let didCancel = false;
      const next = Array.from({ length: 14 }, (_, i) => ({ idx: i, src: v4TileOverlaySrcs[i] || null, ok: null }));
      setV4TileOverlayLoad(next);

      v4TileOverlaySrcs.forEach((src, idx) => {
        if (!src) {
          next[idx] = { idx, src: null, ok: false };
          return;
        }
        try {
          const img = new Image();
          img.onload = () => {
            if (didCancel) return;
            setV4TileOverlayLoad((prev) => {
              if (!Array.isArray(prev) || prev.length !== 14) return prev;
              const copy = prev.slice();
              copy[idx] = { idx, src, ok: true };
              return copy;
            });
          };
          img.onerror = () => {
            if (didCancel) return;
            setV4TileOverlayLoad((prev) => {
              if (!Array.isArray(prev) || prev.length !== 14) return prev;
              const copy = prev.slice();
              copy[idx] = { idx, src, ok: false };
              return copy;
            });
          };
          img.src = src;
        } catch {
          next[idx] = { idx, src, ok: false };
        }
      });

      return () => {
        didCancel = true;
      };
    } catch {
      setV4TileOverlayLoad(null);
    }
  }, [stripeV4Engine, urlParams, v4TileOverlaySrcs]);

  const stripeRecalibrate = !!urlParams?.has('stripeRecalibrate');
  const mirror1p5 = !!urlParams?.has('mirror1p5');
  const debugStripeHit = urlParams?.get('debugStripeHit') === '1';
  const debugStripeAreas = (getUrlParam('debugStripeAreas') === '1') || hasUrlParam('debugStripeAreas');
  const debugStripeHitEffective = Boolean(debugStripeHit);
  const debugStripeHitViz = Boolean(debugStripeHit || stripeCalibEnabled || debugStripeAreas);
  const debugStripeTiles = !!urlParams?.has('debugStripeTiles');
  const disableStripeHit = !!urlParams?.has('disableStripeHit');
  const debugStripeOverlaySlots = urlParams?.get('debugStripeOverlaySlots') === '1';
  const debugNoV4Overlay = urlParams?.get('debugNoV4Overlay') === '1';
  const debugNoV4OverlayMask = urlParams?.get('debugNoV4OverlayMask') === '1';
  const debugNoV4OverlayPatches = urlParams?.get('debugNoV4OverlayPatches') === '1';
  const v4OvRepeat = urlParams?.get('v4OvRepeat') === '1';
  const stripeHudVisible = (() => {
    try {
      const raw = typeof urlParams?.get === 'function' ? (urlParams.get('stripeHud') || '') : '';
      return raw !== '0';
    } catch {
      return true;
    }
  })();
  const debugV4UnionMask = getUrlParam('debugV4UnionMask') === '1';
  const debugV4ClipOnly = getUrlParam('debugV4ClipOnly') === '1';
  const debugV4MaskOutlines = (getUrlParam('debugV4MaskOutlines') === '1') || hasUrlParam('debugV4MaskOutlines');
  const debugV4MaskFill = (getUrlParam('debugV4MaskFill') === '1') || hasUrlParam('debugV4MaskFill');
  const debugV4MaskCut = (getUrlParam('debugV4MaskCut') === '1') || hasUrlParam('debugV4MaskCut');
  const debugV4NoMaskOutlines = (getUrlParam('debugV4NoMaskOutlines') === '1') || hasUrlParam('debugV4NoMaskOutlines');
  const debugV4NoMaskFill = (getUrlParam('debugV4NoMaskFill') === '1') || hasUrlParam('debugV4NoMaskFill');
  const debugV4UseTileClip = (getUrlParam('debugV4UseTileClip') === '1') || hasUrlParam('debugV4UseTileClip');
  const debugV4ShowUnionWithMask = (getUrlParam('debugV4ShowUnionWithMask') === '1') || hasUrlParam('debugV4ShowUnionWithMask');
  const debugV4Layers = (getUrlParam('debugV4Layers') === '1') || hasUrlParam('debugV4Layers');
  const v4ClipLock = (getUrlParam('v4ClipLock') === '1') || hasUrlParam('v4ClipLock');
  const debugV4LayersOnly = parseStringParam('debugV4LayersOnly', '');
  const debugV4ForceTiles = (getUrlParam('debugV4ForceTiles') === '1') || hasUrlParam('debugV4ForceTiles');
  const debugV4NoTileDebug = (getUrlParam('debugV4NoTileDebug') === '1') || hasUrlParam('debugV4NoTileDebug');
  const debugV4OnlyTile = (() => {
    try {
      const n = parseIntParam('debugV4OnlyTile', 0);
      return (Number.isFinite(n) && n >= 1 && n <= 14) ? n : 0;
    } catch {
      return 0;
    }
  })();
  const debugV4ImgBounds = (getUrlParam('debugV4ImgBounds') === '1') || hasUrlParam('debugV4ImgBounds');
  const debugV4ImgBoundsSolid = (getUrlParam('debugV4ImgBoundsSolid') === '1') || hasUrlParam('debugV4ImgBoundsSolid');
  const debugV4ImgUnderlay = (getUrlParam('debugV4ImgUnderlay') === '1') || hasUrlParam('debugV4ImgUnderlay');
  const debugV4ImgUnderlayOpacity = parseFloatParam('debugV4ImgUnderlayOpacity', 0.35);
  const debugV4Viewport = (getUrlParam('debugV4Viewport') === '1');
  const debugV4ImgPar = (() => {
    try {
      const raw = parseStringParam('debugV4ImgPar', '').trim();
      if (!raw) return '';
      const v = raw.toLowerCase();
      if (v === 'none') return 'none';
      if (v === 'xminymaxmeet') return 'xMinYMax meet';
      if (v === 'xmidymaxmeet') return 'xMidYMax meet';
      if (v === 'xmaxymaxmeet') return 'xMaxYMax meet';
      return '';
    } catch {
      return '';
    }
  })();
  const debugV4ImgBox = (() => {
    try {
      const raw = parseStringParam('debugV4ImgBox', '').trim().toLowerCase();
      return (raw === 'full') ? 'full' : '';
    } catch {
      return '';
    }
  })();
  const debugV4ImgHelpersEnabled = (() => {
    try {
      const only = (debugV4LayersOnly || '').trim();
      if (!only) return true;
      return only === 'masked' || only === 'raw' || only === 'bounds' || only === 'underlay';
    } catch {
      return true;
    }
  })();
  const debugV4ImgBoundsEffective = Boolean(debugV4ImgHelpersEnabled && debugV4ImgBounds);
  const debugV4ImgUnderlayEffective = Boolean(debugV4ImgHelpersEnabled && debugV4ImgUnderlay);
  const debugV4TileRects = (getUrlParam('debugV4TileRects') === '1') || hasUrlParam('debugV4TileRects');
  const debugV4HideStripe = getUrlParam('debugV4HideStripe') === '1';
  const debugV4HideRef = getUrlParam('debugV4HideRef') === '1';
  const debugV4OverlaySrc = (getUrlParam('debugV4OverlaySrc') === '1') || hasUrlParam('debugV4OverlaySrc');
  const debugV4OverlayDebug = (getUrlParam('debugV4OverlayDebug') === '1') || hasUrlParam('debugV4OverlayDebug');
  const debugV4OverlayOutlines = Boolean((debugV4OverlayDebug || hasUrlParam('debugV4OverlayOutlines')) && !debugV4NoTileDebug);
  const v4UnionClip = getUrlParam('v4UnionClip') === '1';
  const v4UnionMaskLegacy = getUrlParam('v4UnionMaskLegacy') === '1';
  const v4UnionMaskUseHitTransforms = getUrlParam('v4UnionMaskUseHitTransforms') === '1';
  const v4UnionMaskNoTransforms = getUrlParam('v4UnionMaskNoTransforms') === '1';
  const v4UnionMaskNoAlign = getUrlParam('v4UnionMaskNoAlign') === '1';
  const v4UnionMaskRule = (parseStringParam('v4UnionMaskRule', 'evenodd') === 'evenodd') ? 'evenodd' : 'nonzero';
  const debugV4OverlayOutlineDy = parseFloatParam('debugV4OverlayOutlineDy', 0);
  const debugV4OverlayOutlineSy = parseFloatParam('debugV4OverlayOutlineSy', 1);
  const debugV4OverlayOutlineDx = parseFloatParam('debugV4OverlayOutlineDx', 0);
  const debugV4OverlayDebugDx = parseFloatParam('debugV4OverlayDebugDx', 0);
  const debugBluePathPxDy = parseFloatParam('debugBluePathPxDy', 0);

  const v4UnionMaskDy = parseFloatParam('v4UnionMaskDy', 0);
  const v4UnionMaskDx = parseFloatParam('v4UnionMaskDx', 0);
  const v4UnionMaskAnchorX = (() => {
    const s = (getUrlParam('v4UnionMaskAnchorX') || '').toString().trim().toLowerCase();
    return (s === 'left' || s === 'right' || s === 'center') ? s : 'center';
  })();
  const v4UnionMaskScale = (() => {
    const s = parseFloatParam('v4UnionMaskScale', 1);
    return (Number.isFinite(s) && s > 0) ? s : 1;
  })();
  const v4UnionMaskScaleX = (() => {
    const s = parseFloatParam('v4UnionMaskScaleX', v4UnionMaskScale);
    return (Number.isFinite(s) && s > 0) ? s : v4UnionMaskScale;
  })();
  const v4UnionMaskScaleY = (() => {
    const s = parseFloatParam('v4UnionMaskScaleY', v4UnionMaskScale);
    return (Number.isFinite(s) && s > 0) ? s : v4UnionMaskScale;
  })();
  const v4UnionMaskAnchor = (() => {
    const raw = typeof urlParams?.get === 'function' ? (urlParams.get('v4UnionMaskAnchor') || '') : '';
    const s = (raw || '').toString().trim().toLowerCase();
    return (s === 'top' || s === 'bottom' || s === 'center') ? s : 'center';
  })();
  const v4UnionMaskDilate = (() => {
    const r = parseFloatParam('v4UnionMaskDilate', 0);
    return (Number.isFinite(r) && r > 0) ? r : 0;
  })();

  const mirror1p5OffsetYPx = parseFloatParam('mirror1p5y', 0);
  const mirror1p5BaseOffsetYPx = 0;

  const stripeOverlayTopPct = parseFloatParam('stripeOverlayTop', 44);
  const stripeOverlayWPct = parseFloatParam('stripeOverlayW', 72);
  const stripeOverlayHPct = parseFloatParam('stripeOverlayH', 40);

  const stripeClampLevel = parseIntParam('stripeClamp', 0);

  const stripeV2DefaultInsetLeftPx = stripeV2 ? stripeV2Defaults?.v2L : undefined;
  const stripeV2DefaultInsetRightPx = stripeV2 ? stripeV2Defaults?.v2R : undefined;
  const stripeV2DefaultScale = stripeV2 ? stripeV2Defaults?.v2S : undefined;
  const stripeV2DefaultPivotOffsetXPx = stripeV2 ? stripeV2Defaults?.v2PX : undefined;
  const stripeV2DefaultViewportExtendLeftPx = stripeV2 ? stripeV2Defaults?.v2VL : undefined;
  const stripeV2DefaultViewportTrimRightPx = stripeV2 ? stripeV2Defaults?.v2VR : undefined;
  const stripeV2DefaultAnchor1XPx = stripeV2 ? stripeV2Defaults?.v2A1 : undefined;
  const stripeV2DefaultAnchor14XPx = stripeV2 ? stripeV2Defaults?.v2A14 : undefined;
  const stripeV2DefaultYOffsetPx = stripeV2 ? stripeV2Defaults?.v2Y : undefined;

  const debugV4OverlayCalib = hasUrlParam('debugV4OverlayCalib');
  const stripeV4AllowUrlParams = !!allowStripeUrlParams;
  const parseFloatParamV4 = (key, fallback) => {
    const allowInDev = !!(stripeV4Engine && import.meta.env.DEV);
    if (!stripeV4AllowUrlParams && !allowInDev) return fallback;
    return parseFloatParam(key, fallback);
  };
  const parseIntParamV4 = (key, fallback) => {
    const allowInDev = !!(stripeV4Engine && import.meta.env.DEV);
    if (!stripeV4AllowUrlParams && !allowInDev) return fallback;
    return parseIntParam(key, fallback);
  };

  const parseFloatParamV2 = (key, fallback) => {
    if (!stripeV2AllowUrlParams) return fallback;
    return parseFloatParam(key, fallback);
  };

  const parseIntParamV2 = (key, fallback) => {
    if (!stripeV2AllowUrlParams) return fallback;
    return parseIntParam(key, fallback);
  };

  const stripeV4SvgW = 2866;
  const stripeV4SvgH = 307;
  const stripeV4HitSrc = '/placeholders/t-shirt_buttons/v4/full-clic-area-4.svg';
  const [stripeV4HitPathD, setStripeV4HitPathD] = useState('');
  const [stripeV4HitTilePathDs, setStripeV4HitTilePathDs] = useState([]);
  const [stripeV4HitTransforms, setStripeV4HitTransforms] = useState([]);
  const stripeV4HitGroupRef = useRef(null);
  const stripeV4HitSvgRef = useRef(null);
  const stripeV4HitPathElRef = useRef(null);

  const stripeV4HitXAffine = useMemo(() => {
    try {
      const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
      let a = 1;
      let e = 0;
      transforms.forEach((t) => {
        const m = (t || '').toString().match(/matrix\(([^)]+)\)/i);
        if (!m) return;
        const parts = m[1].split(/[,\s]+/).map((s) => Number.parseFloat(s)).filter((n) => Number.isFinite(n));
        if (parts.length < 6) return;
        const a2 = parts[0];
        const e2 = parts[4];
        a = a * a2;
        e = (a2 * e) + e2;
      });
      return { a, e };
    } catch {
      return { a: 1, e: 0 };
    }
  }, [stripeV4HitTransforms]);
  const stripeV4HitTilePathRefs = useRef([]);
  const stripeV4OverlayTilePathRefs = useRef([]);
  const [stripeV4HitTileBBoxes, setStripeV4HitTileBBoxes] = useState([]);
  const [stripeV4HitAlignTopDy, setStripeV4HitAlignTopDy] = useState(0);
  const [stripeV4HitAlignTopBBoxY, setStripeV4HitAlignTopBBoxY] = useState(0);
  const [v4OverlayTilesLoadInfo, setV4OverlayTilesLoadInfo] = useState(null);
  const [stripeV2SpriteProbe, setStripeV2SpriteProbe] = useState({
    status: 'idle',
    src: '',
    w: 0,
    h: 0,
  });

  const [stripeW, setStripeW] = useState(0);
  const [selectedTileSize, setSelectedTileSize] = useState({ w: 0, h: 0 });
  const [hudFixedPos, setHudFixedPos] = useState(null);
  const stripeV4HitStepX = stripeV4SvgW / 14;

  const v4CalibDefaults = useMemo(() => ({
    pitchX: stripeV4HitStepX,
    w: stripeV4HitStepX,
    x0: 0,
    ovX: 61.967,
    ovY: -2.834,
    ovS: 0.46,
  }), []);

  const v4OverlayPitchXParam = parseFloatParamV4(
    'v4OvPitchX',
    parseFloatParamV4(
      'v4OvStepX',
      (stripeV4Engine && stripeCalibEnabled) ? v4CalibDefaults.pitchX : stripeV4HitStepX,
    ),
  );
  const v4OverlayWParam = parseFloatParamV4(
    'v4OvW',
    (stripeV4Engine && stripeCalibEnabled) ? v4CalibDefaults.w : stripeV4HitStepX,
  );
  const v4OverlayX0Param = parseFloatParamV4(
    'v4OvX0',
    (stripeV4Engine && stripeCalibEnabled) ? v4CalibDefaults.x0 : 0,
  );
  const v4OverlayScaleParam = parseFloatParamV4(
    'v4OvS',
    (stripeV4Engine && stripeCalibEnabled) ? v4CalibDefaults.ovS : 1,
  );
  const v4OverlayDxParam = parseFloatParamV4('v4OvDx', 0);
  const v4OverlayDyParam = parseFloatParamV4('v4OvDy', 0);

  const v4DrawDxParam = parseFloatParamV4('v4DrawDx', 0);
  const v4DrawDyParam = parseFloatParamV4('v4DrawDy', 0);
  const v4DrawScaleParam = parseFloatParamV4('v4DrawS', 1);
  const [v4OverlayPitchXLive, setV4OverlayPitchXLive] = useState(v4OverlayPitchXParam);
  const [v4OverlayWLive, setV4OverlayWLive] = useState(v4OverlayWParam);
  const [v4OverlayX0Live, setV4OverlayX0Live] = useState(v4OverlayX0Param);
  const v4OverlayTilesDirtyRef = useRef(false);

  const [v4OverlayPitchXAutoFromGuides, setV4OverlayPitchXAutoFromGuides] = useState(null);
  const [v4OverlayX0AutoFromGuides, setV4OverlayX0AutoFromGuides] = useState(null);

  const v4OverlayPitchXEffective = (stripeCalibEnabled || stripeCalibMode === 'tiles')
    ? v4OverlayPitchXLive
    : (Number.isFinite(v4OverlayPitchXAutoFromGuides)
        ? v4OverlayPitchXAutoFromGuides
        : v4OverlayPitchXLive);

  const v4OverlayX0Effective = (stripeCalibEnabled || stripeCalibMode === 'tiles')
    ? v4OverlayX0Live
    : (Number.isFinite(v4OverlayX0AutoFromGuides)
        ? v4OverlayX0AutoFromGuides
        : v4OverlayX0Live);

  const [v4HitHover, setV4HitHover] = useState(false);
  const [v4HitDebugLastPt, setV4HitDebugLastPt] = useState(null);

  const stripeV2Sprite = false;

  const stripeV4Sprite = Boolean(
    stripeV4Engine
    && (
      forceStripeSprite
      || (stripeV4AllowUrlParams && typeof urlParams?.has === 'function' && urlParams.has('v4Sprite'))
      || (stripeV4AllowUrlParams && typeof urlParams?.has === 'function' && urlParams.has('v2Sprite'))
    )
  );

  const stripeV4SpriteSrc = stripeV4Engine
    ? (
      stripeSpriteSrcOverride
        || urlParams?.get('v4SpriteSrc')
        || urlParams?.get('v2SpriteSrc')
        || '/placeholders/t-shirt_buttons/v4/full-color-stripe-4.webp'
      )
    : '/placeholders/t-shirt_buttons/v2/full-color-stripe-2.webp';

  useEffect(() => {
    if (!stripeEnabled || !stripeV4Engine || !stripeV4Sprite) return;
    const src = stripeV4SpriteSrc;
    if (!src) return;

    let didCancel = false;
    setStripeV2SpriteProbe({ status: 'loading', src, w: 0, h: 0 });

    try {
      const img = new Image();
      img.onload = () => {
        if (didCancel) return;
        setStripeV2SpriteProbe({
          status: 'ok',
          src,
          w: img.naturalWidth || 0,
          h: img.naturalHeight || 0,
        });
      };
      img.onerror = () => {
        if (didCancel) return;
        setStripeV2SpriteProbe({ status: 'error', src, w: 0, h: 0 });
      };
      img.src = src;
    } catch {
      setStripeV2SpriteProbe({ status: 'error', src, w: 0, h: 0 });
    }

    return () => {
      didCancel = true;
    };
  }, [stripeEnabled, stripeV4Engine, stripeV4Sprite, stripeV4SpriteSrc]);

  const stripeV4SpriteInsetLeftPx = stripeV4Engine && stripeV4Sprite
    ? (parseIntParamV4('v4SpriteInsetL', parseIntParamV4('v2SpriteInsetL', 0)))
    : 0;

  const stripeV4ClipDxPx = stripeV4Engine
    ? parseFloatParamV4('v4ClipDx', 0)
    : 0;

  const stripeV4ClipDyPx = stripeV4Engine
    ? parseFloatParamV4('v4ClipDy', 7)
    : 0;

  const stripeV4HitDxPx = stripeV4Engine
    ? parseFloatParamV4('v4HitDx', 0)
    : 0;

  const stripeV4HitDyPx = stripeV4Engine
    ? parseFloatParamV4('v4HitDy', 0)
    : 0;

  const stripeV4HitExpandPx = stripeV4Engine
    ? parseFloatParamV4('v4HitExpandPx', 0)
    : 0;

  const v4MaskPitchXParam = stripeV4Engine
    ? parseFloatParamV4('v4MaskPitchX', 206.4)
    : stripeV4HitStepX;
  const v4MaskX0Param = stripeV4Engine
    ? parseFloatParamV4('v4MaskX0', 0)
    : 0;

  const stripeV2InsetLeftPx = parseIntParamV2(
    'v2L',
    Number.isFinite(stripeV2DefaultInsetLeftPx) ? stripeV2DefaultInsetLeftPx : 0,
  );
  const stripeV2InsetRightPx = parseIntParamV2(
    'v2R',
    Number.isFinite(stripeV2DefaultInsetRightPx) ? stripeV2DefaultInsetRightPx : 0,
  );
  const stripeV2ScaleRaw = parseFloatParamV2('v2S', Number.isFinite(stripeV2DefaultScale) ? stripeV2DefaultScale : 1);
  const stripeV2Scale = stripeV2 && stripeV2Sprite ? 1 : stripeV2ScaleRaw;
  const stripeV2PivotOffsetXPx = parseIntParamV2(
    'v2PX',
    Number.isFinite(stripeV2DefaultPivotOffsetXPx) ? stripeV2DefaultPivotOffsetXPx : 0,
  );
  const stripeV2ViewportExtendLeftPx = stripeV2
    ? parseIntParamV2(
        'v2VL',
        Number.isFinite(stripeV2DefaultViewportExtendLeftPx) ? stripeV2DefaultViewportExtendLeftPx : 50,
      )
    : 0;
  const stripeV2ViewportTrimRightPx = stripeV2
    ? parseIntParamV2(
        'v2VR',
        Number.isFinite(stripeV2DefaultViewportTrimRightPx) ? stripeV2DefaultViewportTrimRightPx : 0,
      )
    : 0;
  const stripeV4ViewportExtendLeftPx = stripeV4Engine
    ? parseIntParamV4(
        'v4VL',
        parseIntParamV4('v2VL', 0),
      )
    : 0;
  const stripeV4ViewportTrimRightPx = stripeV4Engine
    ? parseIntParamV4(
        'v4VR',
        0,
      )
    : 0;
  const blueViewport = false;
  const debugV2Anchors = stripeV2AllowUrlParams ? hasUrlParam('debugV2Anchors') : false;
  const stripeRefMockupSrcRaw = parseStringParam('stripeRefMockup', '');
  const stripeRefMockupSrcFromUrl = stripeRefMockupSrcRaw && typeof stripeRefMockupSrcRaw === 'string' ? stripeRefMockupSrcRaw.trim() : '';
  const stripeRefMockupSrc = (() => {
    try {
      if (stripeRefMockupSrcFromUrl) return stripeRefMockupSrcFromUrl;
      if (!stripeCalibEnabled) return '';
      const last = (typeof window !== 'undefined' && window.localStorage)
        ? window.localStorage.getItem('HG_STRIPE_REF_MOCKUP_LAST')
        : '';
      if (typeof last === 'string' && last.trim()) return last.trim();
      return '/tmp/CALIBRTGE/first_contact/first-contact-nx-01-black-white.png';
    } catch {
      return stripeCalibEnabled
        ? '/tmp/CALIBRTGE/first_contact/first-contact-nx-01-black-white.png'
        : '';
    }
  })();
  const stripeV3 = false;

  useEffect(() => {
    try {
      if (!stripeCalibEnabled) return;
      if (!stripeRefMockupSrcFromUrl) return;
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem('HG_STRIPE_REF_MOCKUP_LAST', stripeRefMockupSrcFromUrl);
    } catch {
      // ignore
    }
  }, [stripeCalibEnabled, stripeRefMockupSrcFromUrl]);

  useEffect(() => {
    try {
      if (!stripeCalibEnabled) return;
      if (typeof window === 'undefined') return;
      console.log('[stripe][ref-mockup]', {
        stripeRefMockupSrcRaw,
        stripeRefMockupSrcFromUrl,
        stripeRefMockupSrc,
        href: window.location.href,
      });
    } catch {
      // ignore
    }
  }, [stripeCalibEnabled, stripeRefMockupSrc, stripeRefMockupSrcFromUrl, stripeRefMockupSrcRaw]);

  const stripeV4YOffsetPx = stripeV4Engine
    ? parseFloatParamV4('v4Y', parseFloatParamV4('v2Y', 0))
    : 0;
  const stripeV4SpriteYOffsetPx = 0;
  const stripeV4SpriteImgDxPx = stripeV4Engine
    ? parseFloatParamV4('v4SpriteImgDx', 0)
    : 0;
  const stripeV4SpriteImgDyPx = stripeV4Engine
    ? parseFloatParamV4('v4SpriteImgDy', 7)
    : 0;
  const stripeV4SpriteExtraBottomPx = stripeV4AllowUrlParams
    ? parseIntParamV4('v4SpriteExtraB', parseIntParamV4('v2SpriteExtraB', 12))
    : 12;

  const [stripeV4Fit, setStripeV4Fit] = useState(null);
  const stripeV4FitLastRef = useRef(null);
  const [stripeV4FitLocked, setStripeV4FitLocked] = useState(null);
  const stripeRef2PrevHtmlOverflowXRef = useRef(null);
  const stripeRef2PrevBodyOverflowXRef = useRef(null);

  useLayoutEffect(() => {
    if (!stripeV4Engine) {
      setStripeV4Fit(null);
      return undefined;
    }

    let raf = null;
    const update = () => {
      try {
        const rootRect = stripeRootRef.current?.getBoundingClientRect?.();
        if (!rootRect || !Number.isFinite(rootRect.width) || rootRect.width <= 0) return;

        const availableWidth = Math.max(1, rootRect.width);
        const containerH = (megaTileSize + 2) || 0;
        const viewportH = (containerH + 3);
        const baseSpriteW = Math.max(1, Math.round((stripeV4SvgW / stripeV4SvgH) * viewportH));

        const leftRect = stripeBeltGuides
          ? document.querySelector('#stripe-guide-left-anchor')?.getBoundingClientRect?.()
          : null;
        const rightRect = stripeBeltGuides
          ? document.querySelector('#stripe-guide-right-anchor')?.getBoundingClientRect?.()
          : null;
        const leftX = leftRect?.left;
        const rightX = rightRect?.right;

        if (stripeBeltGuides && Number.isFinite(leftX) && Number.isFinite(rightX) && rightX > leftX) {
          setBeltGuideXPx((prev) => {
            const next = { left: leftX, right: rightX };
            if (!prev) return next;
            if (prev.left === next.left && prev.right === next.right) return prev;
            return next;
          });
        }

        if (stripeCalibMode === 'ref2') return;

        const hasAnchors = stripeBeltGuides && Number.isFinite(leftX) && Number.isFinite(rightX) && rightX > leftX;
        const targetLeft = hasAnchors
          ? ((leftX - rootRect.left) + (Number.isFinite(stripeV4ViewportExtendLeftPx) ? stripeV4ViewportExtendLeftPx : 0))
          : 0;
        const targetRight = hasAnchors
          ? ((rightX - rootRect.left) - (Number.isFinite(stripeV4ViewportTrimRightPx) ? stripeV4ViewportTrimRightPx : 0))
          : availableWidth;
        const targetSpan = Math.max(1, targetRight - targetLeft);

        const scaleFit = availableWidth / baseSpriteW;
        const scale = scaleFit * 0.9875;
        const spriteWScaled = baseSpriteW * scale;
        const tx = hasAnchors
          ? (targetLeft + ((targetSpan - spriteWScaled) / 2))
          : (((availableWidth - spriteWScaled) / 2) - 0.5);
        const ty = stripeV4YOffsetPx + (stripeV4Sprite ? stripeV4SpriteYOffsetPx : 0);
        const next = { scale, tx, ty };

        setStripeV4Fit((prev) => {
          if (!prev) return next;
          if (prev.scale === next.scale && prev.tx === next.tx && prev.ty === next.ty) return prev;
          return next;
        });
      } catch {
        // ignore
      }
    };

    update();
    try {
      raf = window.requestAnimationFrame(() => update());
    } catch {
      // ignore
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      if (raf) {
        try { window.cancelAnimationFrame(raf); } catch { /* ignore */ }
      }
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [megaTileSize, stripeCalibMode, stripeV4Engine, stripeBeltGuides, stripeV4YOffsetPx, stripeV4Sprite]);

  useEffect(() => {
    if (stripeV4Fit && typeof stripeV4Fit === 'object') stripeV4FitLastRef.current = stripeV4Fit;
  }, [stripeV4Fit]);

  useEffect(() => {
    try {
      if (typeof document === 'undefined') return;
      const html = document.documentElement;
      const body = document.body;
      if (!html || !body) return;

      if (stripeCalibMode === 'ref2') {
        if (stripeRef2PrevHtmlOverflowXRef.current === null) stripeRef2PrevHtmlOverflowXRef.current = html.style.overflowX;
        if (stripeRef2PrevBodyOverflowXRef.current === null) stripeRef2PrevBodyOverflowXRef.current = body.style.overflowX;
        html.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
        return;
      }

      if (stripeRef2PrevHtmlOverflowXRef.current !== null) {
        html.style.overflowX = stripeRef2PrevHtmlOverflowXRef.current;
        stripeRef2PrevHtmlOverflowXRef.current = null;
      }
      if (stripeRef2PrevBodyOverflowXRef.current !== null) {
        body.style.overflowX = stripeRef2PrevBodyOverflowXRef.current;
        stripeRef2PrevBodyOverflowXRef.current = null;
      }
    } catch {
      // ignore
    }
  }, [stripeCalibMode]);

  useEffect(() => {
    if (!stripeV4Engine) {
      setStripeV4FitLocked(null);
      return;
    }
    if (stripeCalibMode === 'ref2') {
      setStripeV4FitLocked((prev) => {
        if (prev) return prev;
        return stripeV4FitLastRef.current || stripeV4Fit || null;
      });
      return;
    }
    setStripeV4FitLocked(null);
  }, [stripeCalibMode, stripeV4Engine, stripeV4Fit]);

  const stripeV2Anchor1XPx = stripeV2
    ? parseFloatParamV2(
        'v2A1',
        Number.isFinite(stripeV2DefaultAnchor1XPx)
          ? stripeV2DefaultAnchor1XPx
          : (stripeBeltGuides ? 57 : 0),
      )
    : 0;
  const stripeV2Anchor14XPx = stripeV2
    ? parseFloatParamV2(
        'v2A14',
        Number.isFinite(stripeV2DefaultAnchor14XPx)
          ? stripeV2DefaultAnchor14XPx
          : (stripeBeltGuides ? 118 : 0),
      )
    : 0;
  const stripeV2YOffsetPx = stripeV2
    ? parseFloatParamV2(
        'v2Y',
        Number.isFinite(stripeV2DefaultYOffsetPx)
          ? stripeV2DefaultYOffsetPx
          : (stripeBeltGuides ? -7 : 0),
      )
    : 0;
  const stripeV2FitNudgeLeftPx = stripeV2 ? parseFloatParamV2('v2NL', stripeBeltGuides ? -1 : 0) : 0;
  const stripeV2FitNudgeRightPx = stripeV2 ? parseFloatParamV2('v2NR', stripeBeltGuides ? 4 : 0) : 0;

  const stripeV3BottomInsetPx = stripeV2 && stripeV3 ? parseFloatParamV2('v3BI', 0) : 0;
  const stripeV3YOffsetPx = stripeV2 && stripeV3 ? parseFloatParamV2('v3Y', -2) : 0;

  const stripeV3SvgW = 2491.66;
  const stripeV3SvgH = 258.283;

  const v3TileStepXDefault = stripeV3SvgW / 14;
  const [v3TileStepXLive, setV3TileStepXLive] = useState(v3TileStepXDefault);
  const [v3TileWLive, setV3TileWLive] = useState(v3TileStepXDefault);
  const [v3TileAnchorIndexLive, setV3TileAnchorIndexLive] = useState(0);
  const [v3TileAnchorXLive, setV3TileAnchorXLive] = useState(0);
  const [v3TileX0Live, setV3TileX0Live] = useState(0);
  const v3TilesDirtyRef = useRef(false);

  const stripeV3FitSpanExtraPx = 3;
  const stripeV3HitStepX = 168.346;
  const stripeV3HitTranslateY = -12.675;
  const stripeV3HitYExtra = parseFloatParam('v3HitY', 0);
  const stripeV3HitTranslateYLive = stripeV3HitTranslateY + stripeV3HitYExtra;
  const stripeV3HitShiftScreenPx = -1;
  const stripeV3HitUniformScale = 0.9452;
  const stripeV3HitShrinkScreenPx = 0.9;
  const stripeV3HitStretchRightScreenPx = 3;

  useEffect(() => {
    let didCancel = false;
    if (!stripeEnabled) return undefined;

    const splitIntoSubpaths = (d) => {
      try {
        const s = (d || '').toString().trim();
        if (!s) return [];
        const matches = s.match(/[Mm][^Mm]*/g);
        if (!matches || !matches.length) return [];

        // V4 hit-map exports one MoveTo segment per tile (14). Keep them 1:1.
        return matches.map((m) => m.trim()).filter(Boolean);
      } catch {
        return [];
      }
    };

    (async () => {
      try {
        const res = await fetch(stripeV4HitSrc, { cache: 'force-cache' });
        if (!res.ok) return;
        const raw = await res.text();
        const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
        const pathEl = doc.querySelector('path');
        const d = pathEl?.getAttribute('d') || '';

        const transforms = [];
        try {
          let node = pathEl?.parentElement;
          while (node && node.tagName && node.tagName.toLowerCase() !== 'svg') {
            const t = node.getAttribute?.('transform');
            if (t && typeof t === 'string' && t.trim()) transforms.push(t.trim());
            node = node.parentElement;
          }
        } catch {
          // ignore
        }

        const normalizedTransforms = (() => {
          try {
            // The V4 hit SVG is exported with big artboard translations (e.g. y≈-787/+859).
            // The path `d` we extract is already in the stripe coordinate system (0..stripeV4SvgH),
            // so re-applying those translations shifts the mask down.
            // Keep only transforms with negligible translation.
            const out = [];
            for (const t of transforms) {
              const s = (t || '').toString().trim();
              if (!s) continue;

              const m = s.match(/matrix\(([^)]+)\)/i);
              if (m) {
                const parts = m[1].split(/[,\s]+/).filter(Boolean).map(Number);
                if (parts.length === 6) {
                  const e = parts[4];
                  const f = parts[5];
                  if (Math.abs(e) > 1 || Math.abs(f) > 1) {
                    const a = parts[0];
                    const b = parts[1];
                    const c = parts[2];
                    const d = parts[3];
                    out.push(`matrix(${a},${b},${c},${d},0,0)`);
                    continue;
                  }
                }
              }

              const mt = s.match(/translate\(([^)]+)\)/i);
              if (mt) {
                const parts = mt[1].split(/[,\s]+/).filter(Boolean).map(Number);
                const tx = parts[0] ?? 0;
                const ty = parts[1] ?? 0;
                if (Math.abs(tx) > 1 || Math.abs(ty) > 1) continue;
              }

              out.push(s);
            }
            return out;
          } catch {
            return [];
          }
        })();

        if (!didCancel) {
          const tfs = normalizedTransforms.slice().reverse();
          setStripeV4HitPathD(d);
          setStripeV4HitTilePathDs(splitIntoSubpaths(d));
          setStripeV4HitTransforms(tfs);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [stripeEnabled, stripeV4HitSrc]);

  const stripeV4FullHitEnabled = Boolean(stripeV4Engine && stripeV4HitPathD);
  const stripeV4HitTilesEnabled = Boolean(
    stripeV4FullHitEnabled
    && Array.isArray(stripeV4HitTilePathDs)
    && stripeV4HitTilePathDs.length >= 14
  );

  useLayoutEffect(() => {
    if (!stripeV4HitTilesEnabled) {
      setStripeV4HitTileBBoxes([]);
      return;
    }
    let raf = null;
    const measure = () => {
      try {
        const els = Array.isArray(stripeV4HitTilePathRefs.current)
          ? stripeV4HitTilePathRefs.current.slice(0, 14)
          : [];
        if (els.length < 14) return;
        const next = els.map((el) => {
          try {
            if (!el || typeof el.getBBox !== 'function') return null;
            const bb = el.getBBox();
            const x = Number.isFinite(bb?.x) ? bb.x : null;
            const y = Number.isFinite(bb?.y) ? bb.y : null;
            const width = Number.isFinite(bb?.width) ? bb.width : null;
            const height = Number.isFinite(bb?.height) ? bb.height : null;
            return (
              Number.isFinite(x)
              && Number.isFinite(y)
              && Number.isFinite(width)
              && width > 0
              && Number.isFinite(height)
              && height > 0
            ) ? {
              x,
              y,
              width,
              height,
            } : null;
          } catch {
            return null;
          }
        });
        if (next.length === 14 && next.every(Boolean)) {
          setStripeV4HitTileBBoxes((prev) => {
            if (Array.isArray(prev) && prev.length === 14) {
              let same = true;
              for (let i = 0; i < 14; i += 1) {
                if (!prev[i] || !next[i]) { same = false; break; }
                if (
                  Math.abs(prev[i].x - next[i].x) > 0.01
                  || Math.abs(prev[i].y - next[i].y) > 0.01
                  || Math.abs(prev[i].width - next[i].width) > 0.01
                  || Math.abs(prev[i].height - next[i].height) > 0.01
                ) { same = false; break; }
              }
              if (same) return prev;
            }
            return next;
          });
        }
      } catch {
        // ignore
      }
    };
    raf = requestAnimationFrame(measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stripeV4HitTilesEnabled, stripeV4HitTransforms, stripeV4HitAlignTopDy]);
  const stripeV4HitAutoAlignTop = Boolean(
    (stripeV4FullHitEnabled && debugV4ClipOnly)
    || debugV4MaskOutlines
    || (stripeV4AllowUrlParams && urlParams?.has('v4HitAlignTop'))
  );

  useLayoutEffect(() => {
    const allowAlignMeasure = Boolean(stripeV4FullHitEnabled || debugV4MaskOutlines);
    if (!allowAlignMeasure) {
      setStripeV4HitAlignTopDy(0);
      setStripeV4HitAlignTopBBoxY(0);
      return;
    }

    if (!stripeV4HitAutoAlignTop) {
      setStripeV4HitAlignTopDy(0);
      setStripeV4HitAlignTopBBoxY(0);
      return;
    }

    try {
      if (!stripeV4HitPathD) return;
      let raf = null;
      raf = requestAnimationFrame(() => {
        try {
          const el = stripeV4HitGroupRef.current;
          if (!el || typeof el.getBBox !== 'function') return;
          const bb = el.getBBox();
          const y = Number.isFinite(bb?.y) ? bb.y : 0;
          setStripeV4HitAlignTopBBoxY((prev) => (prev === y ? prev : y));
          const dy = Number.isFinite(y) ? -y : 0;
          setStripeV4HitAlignTopDy((prev) => (prev === dy ? prev : dy));
        } catch {
          // ignore
        }
      });
      return () => {
        if (raf) {
          try { window.cancelAnimationFrame(raf); } catch { /* ignore */ }
        }
      };
    } catch {
      return undefined;
    }
  }, [stripeV4FullHitEnabled, debugV4MaskOutlines, stripeV4HitAutoAlignTop, stripeV4HitPathD, stripeV4HitTransforms]);

  const stripeV4ContentNudgeXPx = (() => {
    try {
      if (!stripeV4Engine || !stripeV4Sprite) return 0;
      return 0;
    } catch {
      return 0;
    }
  })();

  const stripeV4AllDxPx = stripeV4Engine
    ? parseFloatParamV4('v4AllDx', 0)
    : 0;

  const stripeV2SpriteYOffsetPx = 20;
  const stripeV2SpriteExtraBottomPx = stripeV4SpriteExtraBottomPx;

  const stripeDotXPx = parseFloatParam('stripeDotX', 52);
  const stripeDotYPx = parseFloatParam('stripeDotY', -6.5);

  const stripeRefTargetSlug = parseStringParam('stripeRefTarget', '');
  const stripeRefTargetIndex = parseIntParam('stripeRefTargetIndex', 1);
  const stripeRefGhost = !!urlParams?.has('stripeRefGhost');
  const stripeRefTile1 = !!urlParams?.has('stripeRefTile1');
  const stripeRefBlend = parseStringParam('stripeRefBlend', 'multiply');
  const stripeRefOpacity = parseFloatParam(
    'stripeRefOpacity',
    !urlParams?.has('stripeRefOpacity')
      ? (stripeRefGhost
          ? 0.35
          : (stripeRefBlend === 'average' ? 0.5 : 1))
      : 1,
  );
  const stripeRefBlendCss = stripeRefBlend === 'average' ? 'normal' : stripeRefBlend;
  const stripeRefXParam = parseFloatParam('stripeRefX', -5);
  const stripeRefYParam = parseFloatParam('stripeRefY', -4);
  const stripeRefScaleParam = parseFloatParam('stripeRefScale', 1.125);

  const stripeRefRenderYOffsetPx = stripeV2 ? -2 : 0;

  const stripeRef2XParam = parseFloatParam('stripeRef2X', stripeRefXParam);
  const stripeRef2YParam = parseFloatParam('stripeRef2Y', stripeRefYParam);
  const stripeRef2ScaleParam = parseFloatParam('stripeRef2Scale', stripeRefScaleParam);

  const overlayKey = typeof overlaySrc === 'string' ? overlaySrc.toLowerCase() : '';
  const isOverlayNcc1701D = stripeRefTargetIndex === 1 && overlayKey.includes('ncc-1701-d');
  const isOverlayNcc1701 = stripeRefTargetIndex === 1 && overlayKey.includes('ncc-1701') && !overlayKey.includes('ncc-1701-d');
  const isOverlayNx01 = stripeRefTargetIndex === 1 && overlayKey.includes('nx-01');
  const isOverlayWormhole = stripeRefTargetIndex === 1 && overlayKey.includes('wormhole');
  const isOverlayPlasmaEscape = stripeRefTargetIndex === 1 && overlayKey.includes('plasma-escape');
  const isOverlayVulcansEnd = stripeRefTargetIndex === 1 && overlayKey.includes("vulcan") && overlayKey.includes('end');
  const isOverlayPhoenix = stripeRefTargetIndex === 1 && (overlayKey.includes('the-phoenix') || overlayKey.includes('the_phoenix') || overlayKey.includes('phoenix'));

  const hasExplicitOverlayParams =
    urlParams?.has('stripeOverlayX') ||
    urlParams?.has('stripeOverlayY') ||
    urlParams?.has('stripeOverlayScale');

  const stripeOverlayXParam = parseFloatParam(
    'stripeOverlayX',
    stripeV4Engine
      ? (hasExplicitOverlayParams ? 0 : 0)
      : (isOverlayVulcansEnd
        ? -25
        : isOverlayPlasmaEscape
          ? -19
          : isOverlayPhoenix
            ? -55
          : isOverlayWormhole
            ? -17
            : isOverlayNx01
              ? -55
              : isOverlayNcc1701D
                ? 0
                : isOverlayNcc1701
                  ? -1
                  : 0),
  );
  const stripeOverlayYParam = parseFloatParam(
    'stripeOverlayY',
    stripeV4Engine
      ? (hasExplicitOverlayParams ? 0 : 0)
      : (isOverlayVulcansEnd
        ? 35
        : isOverlayPlasmaEscape
          ? 10
          : isOverlayPhoenix
            ? 3
          : isOverlayWormhole
            ? 21
            : isOverlayNx01
              ? 21
              : isOverlayNcc1701D
                ? 18
                : isOverlayNcc1701
                  ? 18
                  : 7),
  );
  const stripeOverlayScaleParam = parseFloatParam(
    'stripeOverlayScale',
    stripeV4Engine
      ? (hasExplicitOverlayParams ? 1 : 1)
      : (isOverlayVulcansEnd
        ? 1.04
        : isOverlayPlasmaEscape
          ? 0.925
          : isOverlayPhoenix
            ? 1.59
          : isOverlayWormhole
            ? 0.54
            : isOverlayNx01
              ? 0.48
              : isOverlayNcc1701D
                ? 0.585
                : isOverlayNcc1701
                  ? 0.585
                  : 1),
  );

  const stripeOverlayClip = stripeV4Engine
    ? (() => {
        if (!stripeV4AllowUrlParams) return false;
        const raw = typeof urlParams?.get === 'function' ? (urlParams.get('stripeOverlayClip') || '') : '';
        if (raw === '1') return true;
        if (raw === '0') return false;
        return false;
      })()
    : (urlParams?.get('stripeOverlayClip') === '1');
  const stripeOverlayClipDebug = stripeV4AllowUrlParams ? (urlParams?.get('stripeOverlayClipDebug') === '1') : false;

  const stripeV4OverlayMaskReady = Boolean(
    stripeV4Engine
    && stripeOverlayClip
    && stripeV4HitPathD
    && Array.isArray(stripeV4HitTilePathDs)
    && stripeV4HitTilePathDs.length >= 14
  );
  const stripeHudPos = parseStringParam('stripeHudPos', 'below-deck');
  const stripeHudPadLeftPx = parseFloatParam('stripeHudPadLeft', 50);

  const geometrySignature = useMemo(() => {
    const cf = Number.isFinite(compressFactor) ? Number(compressFactor).toFixed(3) : '0';
    const fo = Number.isFinite(firstOffsetPx) ? Math.round(firstOffsetPx) : 0;
    const lo = Number.isFinite(lastOffsetPx) ? Math.round(lastOffsetPx) : 0;
    const cr = Number.isFinite(cropFirstRightPx) ? Math.round(cropFirstRightPx) : 0;
    const rb = redistributeBetweenFirstAndLast ? 1 : 0;
    return `cf${cf}_fo${fo}_lo${lo}_cr${cr}_rb${rb}`;
  }, [compressFactor, firstOffsetPx, lastOffsetPx, cropFirstRightPx, redistributeBetweenFirstAndLast]);

  const cubeOverlayDesignKey = useMemo(() => {
    try {
      const baseSrc = overlaySrcForRender || overlaySrc;
      if (!baseSrc) return null;
      const s = (baseSrc || '').toString().toLowerCase();
      const isCubeDrawing = s.includes('/custom_logos/drawings/images_originals/stripe/cube/');
      const isCubePlaceholder = s.includes('/custom_logos/drawings/images_grid/cube/');
      const isCubeStripeThumb = s.includes('/custom_logos/drawings/images_stripe/cube/');
      if (!isCubeDrawing && !isCubePlaceholder && !isCubeStripeThumb) return null;

      if (s.includes('cyber')) return 'cube_cyber';
      if (s.includes('cylon')) return 'cube_cylon';
      if (s.includes('darth')) return 'cube_darth';
      if (s.includes('maschinen')) return 'cube_maschinen';
      if (s.includes('robocube')) return 'cube_robocube';
      if (s.includes('afrodita')) return 'cube_afrodita';
      if (s.includes('mazinger')) return 'cube_mazinger';
      if (s.includes('cube-3') || s.includes('3cube')) return 'cube_3cube';
      if (s.includes('iron') && s.includes('kong')) return 'cube_iron_kong';
      if (s.includes('iron-cube-68') || s.includes('iron_cube_68') || s.includes('iron-cube.webp')) return 'cube_iron_68';
      return 'cube_other';
    } catch {
      return null;
    }
  }, [overlaySrc]);

  const stripeRefMockupKey = useMemo(() => buildStripeRefMockupKey(stripeRefMockupSrc), [stripeRefMockupSrc]);

  const stripeRefMockupKeyLegacy = useMemo(() => buildStripeRefMockupKeyLegacy(stripeRefMockupSrc), [stripeRefMockupSrc]);

  const {
    calibrationStorageKeyLegacyPerMockup,
    calibrationStorageKeyV4LegacyGlobal,
    calibrationStorageKeyV4PerMockup,
    calibrationStorageKey,
  } = useMemo(
    () => buildStripeRefCalibrationStorageKeys({ stripeFresh, stripeRefMockupKey, stripeRefMockupSrc, geometrySignature, stripeV4Engine }),
    [geometrySignature, stripeFresh, stripeRefMockupKey, stripeRefMockupSrc, stripeV4Engine]
  );

  const calibrationStorageKeyLegacyRef = useMemo(
    () => buildStripeRefCalibrationStorageKeyLegacyRef({
      stripeFresh,
      stripeRefMockupSrc,
      stripeRefMockupKey,
      stripeRefMockupKeyLegacy,
      geometrySignature,
    }),
    [geometrySignature, stripeFresh, stripeRefMockupKey, stripeRefMockupKeyLegacy, stripeRefMockupSrc]
  );

  const normalizeOverlayDesignKeyFromSrc = (src) => {
    try {
      if (!src || typeof src !== 'string') return 'none';
      let s = src.toLowerCase().trim();
      if (!s) return 'none';

      const drawingsIdx = s.indexOf('/custom_logos/drawings/');
      if (drawingsIdx >= 0) s = s.slice(drawingsIdx + '/custom_logos/drawings/'.length);

      s = s
        .replace(/^images_originals\/stripe\//, '')
        .replace(/^images_grid\//, '')
        .replace(/^images_stripe\//, '')
        .replace(/^placeholders\/images_grid\//, '');

      s = s.replace(/\/(black|white)\//g, '/');

      // Unify color variants (black/white, -b/-w) into a stable design key.
      // Keep `-stripe`/`-grid` because they can be different assets (different transparent frames/bounds).
      // Handles filenames like `dj-vader-b-stripe.webp` (where -b is NOT right before the extension).
      s = s
        .replace(/\/multi\//g, '/')
        .replace(/_multi_(dark|light)(?=_(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/-multi-(dark|light)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/-multi_(dark|light)(?=_(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/_multi-(dark|light)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/_multi_(dark|light)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/-(b|w)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/_(b|w)(?=_(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/-(b|w)(?=_(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/_(b|w)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/-(b|w)\.(webp|png)$/i, '.$2')
        .replace(/_(b|w)\.(webp|png)$/i, '.$2')
        .replace(/\.(webp|png)$/i, '');

      return s.replace(/[^a-z0-9]+/gi, '_').slice(0, 48);
    } catch {
      return 'none';
    }
  };

  const normalizeOverlayDesignKeyFromSrcLegacyDrawings = (src) => {
    try {
      if (!src || typeof src !== 'string') return 'none';
      let s = src.toLowerCase().trim();
      if (!s) return 'none';

      const drawingsIdx = s.indexOf('/custom_logos/drawings/');
      if (drawingsIdx >= 0) s = s.slice(drawingsIdx + '/custom_logos/drawings/'.length);

      s = s
        .replace(/^images_originals\/stripe\//, '')
        .replace(/^images_grid\//, '')
        .replace(/^images_stripe\//, '')
        .replace(/^placeholders\/images_grid\//, '');

      // Legacy behavior for drawings: keep color folder and keep -b/-w suffix,
      // since older calibration keys may have been persisted with them.
      s = s
        .replace(/\/multi\//g, '/')
        .replace(/-multi-(dark|light)(?=-(stripe|grid)\.(webp|png)$)/i, '')
        .replace(/\.(webp|png)$/i, '');

      return s.replace(/[^a-z0-9]+/gi, '_').slice(0, 48);
    } catch {
      return 'none';
    }
  };

  const overlayCalibDesignKey = useMemo(() => {
    if (!overlaySrcForPreset) return 'none';
    if (cubeOverlayDesignKey) return cubeOverlayDesignKey;
    const s = overlaySrcForPreset.toLowerCase();
    if (s.includes('/custom_logos/drawings/images_originals/stripe/the_human_inside/') || s.includes('/custom_logos/drawings/images_grid/the_human_inside/') || s.includes('/custom_logos/drawings/images_stripe/the_human_inside/')) {
      if (s.includes('cylon-03')) return 'thin_cylon_03';
      if (s.includes('cylon')) return 'thin_cylon_78';
      if (s.includes('robbie-the-robot') || s.includes('robby-the-robot')) return 'thin_robbie_the_robot';
      if (s.includes('terminator')) return 'thin_terminator';
    }
    if (
      s.includes('/custom_logos/drawings/images_originals/stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-3.')
      || s.includes('/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-3.')
      || s.includes('/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-3.')
    ) {
      return 'austen_encreuats_pride_and_prejudice_3';
    }
    if (
      s.includes('/custom_logos/drawings/images_originals/stripe/austen/quotes/')
      || s.includes('/custom_logos/drawings/images_grid/austen/quotes/')
      || s.includes('/custom_logos/drawings/images_stripe/austen/quotes/')
    ) {
      if (s.includes('you-must-allow-me')) return 'austen_quotes_you_must_allow_me';
      if (s.includes('body-and-soul') || s.includes('you-have-bewiched-me')) return 'austen_quotes_body_and_soul';
    }
    if (
      s.includes('/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/frame/')
      || s.includes('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')
      || s.includes('/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/')
    ) {
      if (s.includes('-frame.')) return 'austen_looking_for_my_darcy_frame';
    }
    return normalizeOverlayDesignKeyFromSrc(overlaySrcForPreset);
  }, [cubeOverlayDesignKey, overlaySrcForPreset]);

  const v4PresetForOverlayDesignKey = useMemo(() => {
    try {
      if (!stripeV4Engine) return null;
      const k = overlayCalibDesignKey || 'none';

      if (k === 'first_contact_nx_01_stripe') return { ov: { x: 114.967, y: -177.834, s: 0.965 }, tiles: { pitchX: 195.214, w: 209.514, x0: 0.9 } };
      if (k === 'first_contact_ncc_1701_stripe') return { ov: { x: 97.386, y: -181.66, s: 1.24 }, tiles: { pitchX: 195.614, w: 204.714, x0: -0.1 } };
      if (k === 'first_contact_ncc_1701_d_stripe') return { ov: { x: 100, y: -190, s: 1.205 }, tiles: { pitchX: 195.514, w: 204.814, x0: -0.1 } };
      if (k === 'first_contact_wormhole_stripe') return { ov: { x: 112, y: -150, s: 0.915 }, tiles: { pitchX: 195.664, w: 204.714, x0: -0.1 } };
      if (k === 'first_contact_plasma_escape_stripe') return { ov: { x: 113, y: -150, s: 0.92 }, tiles: { pitchX: 195.614, w: 204.714, x0: -0.1 } };
      if (k === 'first_contact_vulcans_end_stripe') return { ov: { x: 118, y: -150, s: 0.92 }, tiles: { pitchX: 195.214, w: 204.764, x0: -0.1 } };
      if (k === 'first_contact_the_phoenix_stripe') return { ov: { x: 106, y: -98, s: 1.06 }, tiles: { pitchX: 195.564, w: 204.714, x0: -0.1 } };

      if (k === 'the_human_inside_r2_d2_stripe') return { ov: { x: 113.967, y: -145.834, s: 0.995 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };
      if (k === 'the_human_inside_iron_man_08_stripe') return { ov: { x: 111.967, y: -145.834, s: 1.04 }, tiles: { pitchX: 195.164, w: 204.71428571428572, x0: 0.05 } };
      if (k === 'the_human_inside_cyberman_stripe') return { ov: { x: 109.967, y: -146.834, s: 1.07 }, tiles: { pitchX: 195.264, w: 204.71428571428572, x0: 0 } };
      if (k === 'the_human_inside_the_dalek_stripe') return { ov: { x: 106.967, y: -140.834, s: 1.14 }, tiles: { pitchX: 195.264, w: 204.71428571428572, x0: 0 } };
      if (k === 'the_human_inside_maschinenmensch_stripe') return { ov: { x: 111.967, y: -146.834, s: 1.03 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 0 } };
      if (k === 'the_human_inside_robocop_stripe') return { ov: { x: 111.967, y: -147.834, s: 1.035 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 0 } };
      if (k === 'the_human_inside_afrodita_a_stripe') return { ov: { x: 112, y: -144, s: 1.05 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };
      if (k === 'the_human_inside_c3_p0_stripe') return { ov: { x: 113, y: -146, s: 1.04 }, tiles: { pitchX: 195.114, w: 204.714, x0: -0.1 } };
      if (k === 'the_human_inside_vader_stripe') return { ov: { x: 112.967, y: -145.834, s: 1.035 }, tiles: { pitchX: 195.164, w: 204.71428571428572, x0: 0.05 } };
      if (k === 'the_human_inside_iron_man_68_stripe') return { ov: { x: 114, y: -150, s: 0.995 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };
      if (k === 'the_human_inside_mazinger_z_stripe') return { ov: { x: 116, y: -145, s: 0.975 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };

      if (k === 'thin_terminator') return { ov: { x: 111.967, y: -146.834, s: 1.035 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 0.05 } };
      if (k === 'thin_cylon_03') return { ov: { x: 111, y: -146, s: 1.055 }, tiles: { pitchX: 195.264, w: 204.714, x0: -0.1 } };
      if (k === 'thin_cylon_78') return { ov: { x: 112, y: -144, s: 1.035 }, tiles: { pitchX: 195.264, w: 204.714, x0: -0.1 } };
      if (k === 'thin_robbie_the_robot') return { ov: { x: 109.967, y: -142.834, s: 0.985 }, tiles: { pitchX: 195.564, w: 204.71428571428572, x0: 0 } };

      if (k === 'miscel_lania_dj_vader_stripe') return { ov: { x: 117.967, y: -152.834, s: 0.9 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 0 } };
      if (k === 'miscel_lania_death_star2d2_stripe') return { ov: { x: 110.967, y: -150.834, s: 0.935 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 5.95 } };
      if (k === 'miscel_lania_pont_del_diable_stripe') return { ov: { x: 141.967, y: -152.834, s: 0.865 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: -22 } };

      if (k === 'cube_afrodita') return { ov: { x: 106.967, y: -153.834, s: 1.15 }, tiles: { pitchX: 195.214, w: 204.71428571428572, x0: 0 } };
      if (k === 'cube_3cube') return { ov: { x: 116, y: -156, s: 0.95 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };
      if (k === 'cube_cyber') return { ov: { x: 109, y: -153, s: 1.105 }, tiles: { pitchX: 195.214, w: 204.714, x0: -0.1 } };
      if (k === 'cube_cylon') return { ov: { x: 115, y: -148, s: 0.96 }, tiles: { pitchX: 195.264, w: 204.714, x0: -0.1 } };
      if (k === 'cube_darth') return { ov: { x: 114, y: -150, s: 0.895 }, tiles: { pitchX: 195.564, w: 204.714, x0: -0.1 } };
      if (k === 'cube_iron_kong') return { ov: { x: 128, y: -156, s: 0.8 }, tiles: { pitchX: 195.214, w: 204.714, x0: -4.65 } };
      if (k === 'cube_iron_68') return { ov: { x: 115, y: -157, s: 0.8 }, tiles: { pitchX: 195.714, w: 204.714, x0: 1.4 } };
      if (k === 'cube_maschinen') return { ov: { x: 115, y: -156, s: 0.97 }, tiles: { pitchX: 195.264, w: 204.714, x0: -0.1 } };
      if (k === 'cube_mazinger') return { ov: { x: 101, y: -153, s: 1.25 }, tiles: { pitchX: 195.314, w: 204.714, x0: -0.1 } };
      if (k === 'cube_robocube') return { ov: { x: 122, y: -155, s: 0.815 }, tiles: { pitchX: 195.264, w: 204.714, x0: -0.1 } };

      return null;
    } catch {
      return null;
    }
  }, [overlayCalibDesignKey, stripeV4Engine]);

  const v4OverlayTilesStorageKey = useMemo(() => {
    try {
      if (!stripeV4Engine) return null;
      const base = stripeFresh ? 'stripeV4OvTilesFresh' : 'stripeV4OvTiles';
      const m = overlayCalibDesignKey || 'none';
      const g = 'v4';
      return `${base}_${m}_${g}`;
    } catch {
      return null;
    }
  }, [overlayCalibDesignKey, stripeFresh, stripeV4Engine]);

  const v4OverlayTilesLoadedKeyRef = useRef(null);

  useEffect(() => {
    if (!stripeV4Engine) return;
    if (!v4OverlayTilesStorageKey) return;
    if (v4OverlayTilesLoadedKeyRef.current === v4OverlayTilesStorageKey) return;
    v4OverlayTilesLoadedKeyRef.current = v4OverlayTilesStorageKey;

    const hasExplicitTileParamsRaw =
      urlParams?.has('v4OvPitchX') ||
      urlParams?.has('v4OvStepX') ||
      urlParams?.has('v4OvW') ||
      urlParams?.has('v4OvX0');
    const hasExplicitTileParams = hasExplicitTileParamsRaw
      && !(
        Number.isFinite(v4OverlayPitchXParam) && Number.isFinite(v4CalibDefaults.pitchX) && v4OverlayPitchXParam === v4CalibDefaults.pitchX
        && Number.isFinite(v4OverlayWParam) && Number.isFinite(v4CalibDefaults.w) && v4OverlayWParam === v4CalibDefaults.w
        && Number.isFinite(v4OverlayX0Param) && Number.isFinite(v4CalibDefaults.x0) && v4OverlayX0Param === v4CalibDefaults.x0
      );
    if (hasExplicitTileParams) {
      setV4OverlayTilesLoadInfo({ source: 'urlParams', storageKey: v4OverlayTilesStorageKey });
      return;
    }

    const clampTiles = (tiles) => {
      try {
        if (!tiles || typeof tiles !== 'object') return tiles;
        const next = { ...tiles };
        const basePitch = stripeV4HitStepX;
        const stepPitch = (Number.isFinite(v4OverlayPitchXParam) && v4OverlayPitchXParam > 0) ? v4OverlayPitchXParam : basePitch;
        const stepW = (Number.isFinite(v4OverlayWParam) && v4OverlayWParam > 0) ? v4OverlayWParam : basePitch;

        // Clamp pitch and width independently.
        // Pitch uses the V4 overlay pitch system (can differ from hit-step width).
        // Width stays close to one hit tile width.
        if (typeof next.pitchX === 'number' && Number.isFinite(next.pitchX)) {
          if (next.pitchX < basePitch * 0.5 || next.pitchX > basePitch * 1.5) next.pitchX = basePitch;
        }
        if (typeof next.w === 'number' && Number.isFinite(next.w)) {
          if (next.w < basePitch * 0.5 || next.w > basePitch * 1.5) next.w = basePitch;
        }
        if (!(typeof next.x0 === 'number' && Number.isFinite(next.x0))) next.x0 = v4OverlayX0Param;
        return next;
      } catch {
        return tiles;
      }
    };

    try {
      let raw = window.localStorage.getItem(v4OverlayTilesStorageKey);
      if (!raw) {
        try {
          const collectedRaw = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
          const collectedParsed = collectedRaw ? JSON.parse(collectedRaw) : null;
          const items = collectedParsed?.items && typeof collectedParsed.items === 'object' ? collectedParsed.items : null;
          const k = overlayCalibDesignKey || 'none';
          const found = items && k && typeof items[k] === 'object' ? items[k] : null;
          const tiles = found?.v4Tiles;
          if (tiles?.storageKey === v4OverlayTilesStorageKey
            && typeof tiles?.pitchX === 'number' && Number.isFinite(tiles.pitchX)
            && typeof tiles?.w === 'number' && Number.isFinite(tiles.w)
            && typeof tiles?.x0 === 'number' && Number.isFinite(tiles.x0)
          ) {
            const seed = JSON.stringify({ pitchX: tiles.pitchX, w: tiles.w, x0: tiles.x0 });
            window.localStorage.setItem(v4OverlayTilesStorageKey, seed);
            raw = seed;
            setV4OverlayTilesLoadInfo({ source: 'collected->localStorage', storageKey: v4OverlayTilesStorageKey });
          }
        } catch {
          // ignore
        }
      }

      if (!raw) {
        const presetTiles = v4PresetForOverlayDesignKey?.tiles;
        if (presetTiles && typeof presetTiles === 'object') {
          const t = clampTiles(presetTiles);
          setV4OverlayPitchXLive(t.pitchX);
          setV4OverlayWLive(t.w);
          setV4OverlayX0Live(t.x0);
          setV4OverlayTilesLoadInfo({ source: 'preset', storageKey: v4OverlayTilesStorageKey });
          try {
            window.localStorage.setItem(
              v4OverlayTilesStorageKey,
              JSON.stringify({ pitchX: t.pitchX, w: t.w, x0: t.x0 }),
            );
          } catch {
            // ignore
          }
        } else {
          const t = clampTiles({ pitchX: v4OverlayPitchXParam, w: v4OverlayWParam, x0: v4OverlayX0Param });
          setV4OverlayPitchXLive(t.pitchX);
          setV4OverlayWLive(t.w);
          setV4OverlayX0Live(t.x0);
          setV4OverlayTilesLoadInfo({ source: 'defaults', storageKey: v4OverlayTilesStorageKey });
        }
        return;
      }
      const parsed = clampTiles(JSON.parse(raw));
      setV4OverlayTilesLoadInfo({ source: 'localStorage', storageKey: v4OverlayTilesStorageKey });
      if (typeof parsed?.pitchX === 'number' && Number.isFinite(parsed.pitchX)) setV4OverlayPitchXLive(parsed.pitchX);
      else setV4OverlayPitchXLive(v4OverlayPitchXParam);
      if (typeof parsed?.w === 'number' && Number.isFinite(parsed.w)) setV4OverlayWLive(parsed.w);
      else setV4OverlayWLive(v4OverlayWParam);
      if (typeof parsed?.x0 === 'number' && Number.isFinite(parsed.x0)) setV4OverlayX0Live(parsed.x0);
      else setV4OverlayX0Live(v4OverlayX0Param);
    } catch {
      setV4OverlayTilesLoadInfo({ source: 'parseError->defaults', storageKey: v4OverlayTilesStorageKey });
      setV4OverlayPitchXLive(v4OverlayPitchXParam);
      setV4OverlayWLive(v4OverlayWParam);
      setV4OverlayX0Live(v4OverlayX0Param);
    } finally {
      v4OverlayTilesDirtyRef.current = false;
    }
  }, [
    stripeV4Engine,
    urlParams,
    v4PresetForOverlayDesignKey,
    v4OverlayPitchXParam,
    v4OverlayTilesStorageKey,
    v4OverlayWParam,
    v4OverlayX0Param,
  ]);

  const overlayIsDrawings = useMemo(() => {
    try {
      const src = overlaySrcForRender || overlaySrc;
      if (!src) return false;
      return src.toString().includes('/custom_logos/drawings/');
    } catch {
      return false;
    }
  }, [overlaySrc, overlaySrcForRender]);

  const overlayCalibStorageDesignKey = useMemo(() => {
    return overlayCalibDesignKey;
  }, [overlayCalibDesignKey]);

  const { overlayCalibrationStorageKey, overlayCalibrationStorageKeyLegacy } = useMemo(
    () => buildOverlayCalibrationStorageKeys({ stripeFresh, overlayCalibStorageDesignKey, geometrySignature, stripeV4Engine, overlaySrc }),
    [geometrySignature, overlayCalibStorageDesignKey, stripeFresh, stripeV4Engine, overlaySrc]
  );

  const overlayCalibrationStorageKeyEffective = useMemo(() => {
    if (!overlayCalibrationStorageKey) return overlayCalibrationStorageKey;
    return overlayCalibrationStorageKey;
  }, [overlayCalibrationStorageKey]);

  const overlayCalibrationStorageKeyLegacyEffective = useMemo(() => {
    if (!overlayCalibrationStorageKeyLegacy) return overlayCalibrationStorageKeyLegacy;
    return overlayCalibrationStorageKeyLegacy;
  }, [overlayCalibrationStorageKeyLegacy]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      const presetDefault = (
        getFirstContactOverlayPreset(overlaySrcForPreset)
        || getTheHumanInsideOverlayPreset(overlaySrcForPreset)
        || getCubeOverlayPreset(overlaySrcForPreset)
        || getOutcastedOverlayPreset(overlaySrcForPreset)
      );
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        overlaySrc,
        overlaySrcForPreset,
        overlaySrcForRender,
        cubeOverlayDesignKey,
        overlayCalibDesignKey,
        overlayCalibrationStorageKey,
        overlayCalibrationStorageKeyLegacy,
        geometrySignature,
        presetDefault,
      };
    } catch {
      // ignore
    }
  }, [
    cubeOverlayDesignKey,
    geometrySignature,
    overlayCalibDesignKey,
    overlayCalibrationStorageKey,
    overlayCalibrationStorageKeyLegacy,
    overlaySrc,
    overlaySrcForPreset,
    overlaySrcForRender,
  ]);


  useEffect(() => {
    overlayDirtyRef.current = false;
    overlayCalibLoadedOnceRef.current = false;
  }, [overlayCalibrationStorageKeyEffective]);

  useEffect(() => {
    if (!stripeCalibReset) return;
    if (stripeCalibResetOnceRef.current) return;
    stripeCalibResetOnceRef.current = true;
    try {
      const ls = window.localStorage;
      if (ls) {
        try {
          ls.removeItem(calibrationStorageKey);
          ls.removeItem(`${calibrationStorageKey}_ref2`);
          ls.removeItem(overlayCalibrationStorageKey);
          ls.removeItem(overlayCalibrationStorageKeyEffective);
        } catch {
          // ignore
        }

        try {
          Object.keys(ls || {})
            .filter((k) => (
              typeof k === 'string'
              && (
                k.startsWith('stripeRefCalib_')
                || k.startsWith('stripeRefCalibFresh_')
                || k.startsWith('stripeOverlayCalib_')
                || k.startsWith('stripeOverlayCalibFresh_')
                || k.startsWith('stripeV4OvTiles_')
                || k.startsWith('stripeV4OvTilesFresh_')
              )
            ))
            .forEach((k) => ls.removeItem(k));
        } catch {
          // ignore
        }

        try {
          ls.removeItem(GLOBAL_OVERLAY_STORAGE_KEY);
        } catch {
          // ignore
        }

        try {
          const collectedRaw = ls.getItem(COLLECTED_CALIB_STORAGE_KEY);
          if (typeof collectedRaw === 'string' && collectedRaw) {
            const parsed = JSON.parse(collectedRaw);
            const items = parsed?.items && typeof parsed.items === 'object' ? parsed.items : null;
            if (items && v4OverlayTilesStorageKey) {
              let changed = false;
              for (const k of Object.keys(items)) {
                const found = items[k];
                if (!found || typeof found !== 'object') continue;
                const tiles = found?.v4Tiles;
                if (tiles?.storageKey && tiles.storageKey === v4OverlayTilesStorageKey) {
                  delete found.v4Tiles;
                  changed = true;
                }
              }
              if (changed) ls.setItem(COLLECTED_CALIB_STORAGE_KEY, JSON.stringify({ ...parsed, items }));
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    setStripeRefX(stripeRefXParam);
    setStripeRefY(stripeRefYParam);
    setStripeRefScale(stripeRefScaleParam);

    stripeRef2DirtyRef.current = false;
    setStripeRef2X(stripeRef2XParam);
    setStripeRef2Y(stripeRef2YParam);
    setStripeRef2Scale(stripeRef2ScaleParam);

    const hasExplicitOverlayParams =
      urlParams?.has('stripeOverlayX') ||
      urlParams?.has('stripeOverlayY') ||
      urlParams?.has('stripeOverlayScale');

    if (stripeCalibReset || hasExplicitOverlayParams) {
      setStripeOverlayX(stripeOverlayXParam);
      setStripeOverlayY(stripeOverlayYParam);
      setStripeOverlayScale(stripeOverlayScaleParam);
      stripeV3OverlayUnitsMigratedRef.current = false;
    }

    if (stripeV4Engine) {
      setV4OverlayPitchXLive(v4OverlayPitchXParam);
      setV4OverlayWLive(v4OverlayWParam);
      setV4OverlayX0Live(v4OverlayX0Param);
      v4OverlayTilesDirtyRef.current = false;
    }
  }, [
    calibrationStorageKey,
    geometrySignature,
    overlayCalibrationStorageKey,
    stripeCalibReset,
    stripeV4Engine,
    stripeOverlayScaleParam,
    stripeOverlayXParam,
    stripeOverlayYParam,
    stripeRef2ScaleParam,
    stripeRef2XParam,
    stripeRef2YParam,
    stripeRefScaleParam,
    stripeRefXParam,
    stripeRefYParam,
    v4OverlayPitchXParam,
    v4OverlayWParam,
    v4OverlayX0Param,
    overlayCalibDesignKey,
    v4OverlayTilesStorageKey,
  ]);

  useEffect(() => {
    if (!stripeRefMockupSrc && !overlaySrc) {
      setHudFixedPos(null);
      return undefined;
    }

    const update = () => {
      const el = stripeRootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setHudFixedPos((prev) => {
        const next = { top: Math.round(r.bottom + 72), left: Math.round(r.left + 8) };
        if (prev && prev.top === next.top && prev.left === next.left) return prev;
        return next;
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [overlaySrc, stripeRefMockupSrc]);

  const [stripeRefX, setStripeRefX] = useState(stripeRefXParam);
  const [stripeRefY, setStripeRefY] = useState(stripeRefYParam);
  const [stripeRefScale, setStripeRefScale] = useState(stripeRefScaleParam);

  const [stripeRef2X, setStripeRef2X] = useState(stripeRef2XParam);
  const [stripeRef2Y, setStripeRef2Y] = useState(stripeRef2YParam);
  const [stripeRef2Scale, setStripeRef2Scale] = useState(stripeRef2ScaleParam);

  const [stripeOverlayX, setStripeOverlayX] = useState(stripeOverlayXParam);
  const [stripeOverlayY, setStripeOverlayY] = useState(stripeOverlayYParam);
  const [stripeOverlayScale, setStripeOverlayScale] = useState(stripeOverlayScaleParam);

  const [overlayCalibSource, setOverlayCalibSource] = useState('');
  const [overlayCalibKeyUsed, setOverlayCalibKeyUsed] = useState('');

  const overlayCalibLoadedKeyRef = useRef(null);

  const [stripeV3OverlayInvM, setStripeV3OverlayInvM] = useState(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        live: {
          x: stripeOverlayX,
          y: stripeOverlayY,
          s: stripeOverlayScale,
        },
      };
    } catch {
      // ignore
    }
  }, [stripeOverlayScale, stripeOverlayX, stripeOverlayY]);

  const stripeRef2DirtyRef = useRef(false);

  const [stripeCalibHudArmed, setStripeCalibHudArmed] = useState(false);
  const [stripeCalibHudCollapsed, setStripeCalibHudCollapsed] = useState(false);

  const [beltGuideXPx, setBeltGuideXPx] = useState(null);
  const [stripeZoomHud, setStripeZoomHud] = useState(null);
  const [stripeV2LiveBoundsLocal, setStripeV2LiveBoundsLocal] = useState(null);
  const [stripeV2LiveFit, setStripeV2LiveFit] = useState(null);

  useLayoutEffect(() => {
    if (!stripeV4Engine) {
      setV4OverlayPitchXAutoFromGuides(null);
      setV4OverlayX0AutoFromGuides(null);
      return;
    }
    if (stripeCalibMode === 'tiles') return;
    if (!stripeBeltGuides) {
      setV4OverlayPitchXAutoFromGuides(null);
      setV4OverlayX0AutoFromGuides(null);
      return;
    }
    if (!beltGuideXPx || !Number.isFinite(beltGuideXPx.left) || !Number.isFinite(beltGuideXPx.right) || beltGuideXPx.right <= beltGuideXPx.left) {
      setV4OverlayPitchXAutoFromGuides(null);
      setV4OverlayX0AutoFromGuides(null);
      return;
    }
    try {
      const rootEl = stripeRootRef.current;
      const trackEl = rootEl ? rootEl.querySelector('[data-stripe-track="true"]') : null;
      if (!trackEl || typeof trackEl.getBoundingClientRect !== 'function') return;
      const r = trackEl.getBoundingClientRect();
      if (!r || !Number.isFinite(r.left) || !Number.isFinite(r.width) || r.width <= 0) return;

      const leftSvg = ((beltGuideXPx.left - r.left) / r.width) * stripeV4SvgW;
      const rightSvg = ((beltGuideXPx.right - r.left) / r.width) * stripeV4SvgW;
      if (!Number.isFinite(leftSvg) || !Number.isFinite(rightSvg) || rightSvg <= leftSvg) return;

      const pitchAuto = (rightSvg - leftSvg) / 14;
      const pitchNext = (Number.isFinite(pitchAuto) && pitchAuto > 0) ? Number(pitchAuto.toFixed(3)) : null;
      setV4OverlayPitchXAutoFromGuides((prev) => (prev === pitchNext ? prev : pitchNext));

      const x0Next = Number.isFinite(leftSvg) ? Number(leftSvg.toFixed(3)) : null;
      setV4OverlayX0AutoFromGuides((prev) => (prev === x0Next ? prev : x0Next));
    } catch {
      // ignore
    }
  }, [
    beltGuideXPx,
    stripeBeltGuides,
    stripeCalibMode,
    stripeV4Engine,
    stripeV4HitStepX,
    stripeV4SvgW,
  ]);

  const [stripeV3Fit, setStripeV3Fit] = useState(null);
  const [stripeV3Ready, setStripeV3Ready] = useState(false);
  const [stripeV3SpriteW, setStripeV3SpriteW] = useState(null);

  const copyToClipboard = async (text) => {
    try {
      const value = (text || '').toString();
      if (!value) return;
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
      }
      if (typeof document !== 'undefined') {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      // ignore
    }
  };

  const [calibIoOpen, setCalibIoOpen] = useState(false);
  const [calibIoText, setCalibIoText] = useState('');
  const calibUploadInputRef = useRef(null);

  const COLLECTED_CALIB_STORAGE_KEY = 'stripeCalibCollected_v1';
  const calibCollectedRef = useRef({});

  const persistCollectedCalibrationNow = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const items = calibCollectedRef.current && typeof calibCollectedRef.current === 'object'
        ? calibCollectedRef.current
        : {};
      window.localStorage.setItem(COLLECTED_CALIB_STORAGE_KEY, JSON.stringify({ v: 1, items }));
    } catch {
      // ignore
    }
  }, [COLLECTED_CALIB_STORAGE_KEY]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = parsed?.items;
      if (items && typeof items === 'object') calibCollectedRef.current = items;
    } catch {
      // ignore
    }
  }, [COLLECTED_CALIB_STORAGE_KEY]);

  useEffect(() => {
    const onFlush = () => {
      try {
        persistCollectedCalibrationNow();
      } catch {
        // ignore
      }
    };

    try {
      if (typeof window === 'undefined') return undefined;
      window.addEventListener('pagehide', onFlush);
      document.addEventListener('visibilitychange', onFlush);
      return () => {
        window.removeEventListener('pagehide', onFlush);
        document.removeEventListener('visibilitychange', onFlush);
      };
    } catch {
      return undefined;
    }
  }, [persistCollectedCalibrationNow]);

  const getCollectedCalibrationPayload = useCallback(() => {
    try {
      const items = calibCollectedRef.current && typeof calibCollectedRef.current === 'object'
        ? calibCollectedRef.current
        : {};
      return {
        v: 1,
        ts: new Date().toISOString(),
        kind: 'stripe-calib-collected',
        items,
      };
    } catch {
      return { v: 1, ts: new Date().toISOString(), kind: 'stripe-calib-collected', items: {} };
    }
  }, []);

  const viewCollectedCalibration = useCallback(() => {
    try {
      const payload = getCollectedCalibrationPayload();
      const json = JSON.stringify(payload, null, 2);
      setCalibIoText(json);
      setCalibIoOpen(true);
    } catch {
      // ignore
    }
  }, [getCollectedCalibrationPayload]);

  const copyCollectedCalibration = useCallback(async () => {
    try {
      const payload = getCollectedCalibrationPayload();
      const json = JSON.stringify(payload, null, 2);
      await copyToClipboard(json);
      setCalibIoText(json);
      setCalibIoOpen(true);
    } catch {
      // ignore
    }
  }, [getCollectedCalibrationPayload]);

  const clearCollectedCalibration = useCallback(() => {
    try {
      calibCollectedRef.current = {};
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(COLLECTED_CALIB_STORAGE_KEY);
        }
      } catch {
        // ignore
      }
      const payload = getCollectedCalibrationPayload();
      const json = JSON.stringify(payload, null, 2);
      setCalibIoText(json);
      setCalibIoOpen(true);
    } catch {
      // ignore
    }
  }, [COLLECTED_CALIB_STORAGE_KEY, getCollectedCalibrationPayload]);

  const getAllCalibrationLocalStorage = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return {};

      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (!k) continue;
        if (
          k.startsWith('stripeRefCalib_') ||
          k.startsWith('stripeRefCalibFresh_') ||
          k.startsWith('stripeOverlayCalib_') ||
          k.startsWith('stripeOverlayCalibFresh_') ||
          k.startsWith('stripeV4OvTiles_') ||
          k.startsWith('stripeV4OvTilesFresh_') ||
          k === COLLECTED_CALIB_STORAGE_KEY ||
          k === GLOBAL_OVERLAY_STORAGE_KEY
        ) {
          keys.push(k);
        }
      }

      const out = {};
      for (const k of keys) {
        const v = window.localStorage.getItem(k);
        if (typeof v === 'string') out[k] = v;
      }
      return out;
    } catch {
      return {};
    }
  };

  const exportCalibrationConfig = async () => {
    try {
      const all = getAllCalibrationLocalStorage();
      const n = all && typeof all === 'object' ? Object.keys(all).length : 0;
      if (!n) {
        setCalibIoText('ERROR: no s\'ha trobat cap key de calibratge a localStorage per exportar.');
        setCalibIoOpen(true);
        return;
      }
      const payload = {
        v: 1,
        ts: new Date().toISOString(),
        n,
        items: all,
      };
      const json = JSON.stringify(payload);
      await copyToClipboard(json);
      setCalibIoText(json);
      setCalibIoOpen(true);
    } catch {
      // ignore
    }
  };

  const downloadCalibrationConfig = () => {
    try {
      if (typeof document === 'undefined') return;
      const all = getAllCalibrationLocalStorage();
      const n = all && typeof all === 'object' ? Object.keys(all).length : 0;
      if (!n) {
        setCalibIoText('ERROR: no s\'ha trobat cap key de calibratge a localStorage per descarregar.');
        setCalibIoOpen(true);
        return;
      }
      const payload = {
        v: 1,
        ts: new Date().toISOString(),
        n,
        items: all,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calibratge-${(new Date().toISOString()).replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setCalibIoText(json);
      setCalibIoOpen(true);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }, 0);
    } catch {
      // ignore
    }
  };

  const uploadCalibrationConfigPickFile = () => {
    try {
      const input = calibUploadInputRef.current;
      if (!input) return;
      input.value = '';
      input.click();
    } catch {
      // ignore
    }
  };

  const onUploadCalibrationFile = (e) => {
    try {
      const file = e?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = (reader.result ?? '').toString();
          if (!text) return;
          setCalibIoText(text);
          setCalibIoOpen(true);
        } catch {
          // ignore
        }
      };
      reader.readAsText(file);
    } catch {
      // ignore
    }
  };

  const importCalibrationConfig = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = (calibIoText || '').toString().trim();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = parsed?.items && typeof parsed.items === 'object' ? parsed.items : null;
      if (!items) return;

      for (const [k, v] of Object.entries(items)) {
        if (typeof k !== 'string' || !k) continue;
        const allowed =
          k.startsWith('stripeRefCalib_') ||
          k.startsWith('stripeRefCalibFresh_') ||
          k.startsWith('stripeOverlayCalib_') ||
          k.startsWith('stripeOverlayCalibFresh_') ||
          k === GLOBAL_OVERLAY_STORAGE_KEY;
        if (!allowed) continue;
        if (typeof v !== 'string') continue;
        window.localStorage.setItem(k, v);
      }

      try {
        window.dispatchEvent(new Event(GLOBAL_OVERLAY_EVENT));
      } catch {
        // ignore
      }

      window.location.reload();
    } catch {
      // ignore
    }
  };

  const restoreCollectedCalibrationConfig = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      let raw = (calibIoText || '').toString().trim();
      if (!raw) {
        try {
          const fromLs = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
          if (typeof fromLs === 'string' && fromLs.trim()) {
            const candidate = fromLs.trim();
            try {
              JSON.parse(candidate);
              raw = candidate;
              setCalibIoText(raw);
              setCalibIoOpen(true);
            } catch (e) {
              setCalibIoText(
                `ERROR: el collected guardat a localStorage (${COLLECTED_CALIB_STORAGE_KEY}) no és JSON vàlid. ${(e && e.message) ? e.message : ''}\n\nPrimeres lletres: ${(candidate || '').slice(0, 80)}`.trim()
              );
              setCalibIoOpen(true);
              return;
            }
          }
        } catch {
          // ignore
        }
      }
      if (!raw) {
        setCalibIoText('ERROR: no hi ha cap JSON per restaurar.');
        setCalibIoOpen(true);
        return;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        setCalibIoText(`ERROR: JSON invàlid. ${(e && e.message) ? e.message : ''}`.trim());
        setCalibIoOpen(true);
        return;
      }

      // Accept legacy collected payloads (stored under stripeCalibCollected_v1) that don't include `kind`.
      if (!parsed?.kind && parsed?.items && typeof parsed.items === 'object') {
        parsed = { ...parsed, kind: 'stripe-calib-collected' };
      }

      if (parsed?.kind !== 'stripe-calib-collected') {
        setCalibIoText(`ERROR: payload kind no suportat: ${(parsed?.kind ?? 'null').toString()}`);
        setCalibIoOpen(true);
        return;
      }

      const items = parsed?.items && typeof parsed.items === 'object' ? parsed.items : null;
      if (!items || !Object.keys(items).length) {
        setCalibIoText('ERROR: payload sense items.');
        setCalibIoOpen(true);
        return;
      }

      let wrote = 0;
      let wroteOverlay = 0;
      let wroteTiles = 0;
      let wroteRef = 0;
      let wroteRef2 = 0;

      for (const v of Object.values(items)) {
        if (!v || typeof v !== 'object') continue;

        const ov = v.overlay && typeof v.overlay === 'object' ? v.overlay : null;
        if (ov?.storageKey && typeof ov.storageKey === 'string') {
          const x = ov?.x;
          const y = ov?.y;
          const s = ov?.s;
          if (typeof x === 'number' && Number.isFinite(x)
            && typeof y === 'number' && Number.isFinite(y)
            && typeof s === 'number' && Number.isFinite(s)) {
            window.localStorage.setItem(ov.storageKey, JSON.stringify({ x, y, s, u: 'svg' }));
            wrote += 1;
            wroteOverlay += 1;
          }
        }

        const tiles = v.v4Tiles && typeof v.v4Tiles === 'object' ? v.v4Tiles : null;
        if (tiles?.storageKey && typeof tiles.storageKey === 'string') {
          const pitchX = tiles?.pitchX;
          const w = tiles?.w;
          const x0 = tiles?.x0;
          if (typeof pitchX === 'number' && Number.isFinite(pitchX)
            && typeof w === 'number' && Number.isFinite(w)
            && typeof x0 === 'number' && Number.isFinite(x0)) {
            window.localStorage.setItem(tiles.storageKey, JSON.stringify({ pitchX, w, x0 }));
            wrote += 1;
            wroteTiles += 1;
          }
        }

        const ref = v.ref && typeof v.ref === 'object' ? v.ref : null;
        if (ref?.storageKey && typeof ref.storageKey === 'string') {
          const x = ref?.x;
          const y = ref?.y;
          const s = ref?.s;
          if (typeof x === 'number' && Number.isFinite(x)
            && typeof y === 'number' && Number.isFinite(y)
            && typeof s === 'number' && Number.isFinite(s)) {
            window.localStorage.setItem(ref.storageKey, JSON.stringify({ v: 2, x, y, s }));
            wrote += 1;
            wroteRef += 1;
          }
        }

        const ref2 = v.ref2 && typeof v.ref2 === 'object' ? v.ref2 : null;
        if (ref2?.storageKey && typeof ref2.storageKey === 'string') {
          const x = ref2?.x;
          const y = ref2?.y;
          const s = ref2?.s;
          if (typeof x === 'number' && Number.isFinite(x)
            && typeof y === 'number' && Number.isFinite(y)
            && typeof s === 'number' && Number.isFinite(s)) {
            window.localStorage.setItem(ref2.storageKey, JSON.stringify({ x, y, s }));
            wrote += 1;
            wroteRef2 += 1;
          }
        }
      }

      if (!wrote) {
        setCalibIoText('ERROR: no s\'ha escrit cap calibratge (cap item tenia storageKey + valors vàlids).');
        setCalibIoOpen(true);
        return;
      }

      try {
        window.dispatchEvent(new Event(GLOBAL_OVERLAY_EVENT));
      } catch {
        // ignore
      }

      setCalibIoText(`OK: restaurats ${wrote} calibratges (overlay:${wroteOverlay}, tiles:${wroteTiles}, ref:${wroteRef}, ref2:${wroteRef2}). Recarrego...`);
      setCalibIoOpen(true);

      window.setTimeout(() => {
        try {
          window.location.reload();
        } catch {
          // ignore
        }
      }, 50);
    } catch {
      try {
        setCalibIoText('ERROR: excepció inesperada en restore-collected.');
        setCalibIoOpen(true);
      } catch {
        // ignore
      }
    }
  };

  const resetOverlayCalibration = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      try {
        if (overlayCalibrationStorageKey) window.localStorage.removeItem(overlayCalibrationStorageKey);
        if (overlayCalibrationStorageKeyEffective) window.localStorage.removeItem(overlayCalibrationStorageKeyEffective);
        if (overlayCalibrationStorageKeyLegacy) window.localStorage.removeItem(overlayCalibrationStorageKeyLegacy);
        if (overlayCalibrationStorageKeyLegacyEffective) window.localStorage.removeItem(overlayCalibrationStorageKeyLegacyEffective);
      } catch {
        // ignore
      }
      window.location.reload();
    } catch {
      // ignore
    }
  };

  const minimalCalibUrl = useMemo(() => {
    try {
      if (typeof window === 'undefined') return '';
      const base = `${window.location.origin}${window.location.pathname}`;
      const p = new URLSearchParams();
      const setIf = (k, v) => {
        const s = (v ?? '').toString();
        if (!s) return;
        p.set(k, s);
      };

      p.set('stripeBeltGuides', '1');
      p.set('v3', '1');
      p.set('stripeCalib', '1');
      p.set('stripeCalibMode', 'overlay');
      p.set('stripeRefTile1', '1');
      setIf('stripeRefBlend', stripeRefBlendCss || 'normal');
      setIf('stripeRefOpacity', urlParams?.has('stripeRefOpacity') ? (urlParams?.get('stripeRefOpacity') || '') : '1');
      setIf('stripeRefMockup', stripeRefMockupSrc);
      setIf('stripeOverlay', overlaySrc);
      if (overlaySrc && !stripeV4Engine) {
        setIf('stripeOverlayX', stripeOverlayX);
        setIf('stripeOverlayY', stripeOverlayY);
        setIf('stripeOverlayScale', stripeOverlayScale);
      }

      const qs = p.toString();
      return qs ? `${base}?${qs}` : base;
    } catch {
      return '';
    }
  }, [overlaySrc, stripeOverlayScale, stripeOverlayX, stripeOverlayY, stripeRefBlendCss, stripeRefMockupSrc, stripeV4Engine, urlParams]);

  const debugOverlayLocalStorageRaw = useMemo(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return '';
      if (!overlayCalibrationStorageKeyEffective) return '';
      return window.localStorage.getItem(overlayCalibrationStorageKeyEffective) || '';
    } catch {
      return '';
    }
  }, [overlayCalibrationStorageKeyEffective]);

  const [debugV4ViewportOverlayInfo, setDebugV4ViewportOverlayInfo] = useState(null);

  useLayoutEffect(() => {
    if (!debugV4Viewport) {
      setDebugV4ViewportOverlayInfo(null);
      return;
    }
    if (typeof window === 'undefined') return;

    let raf = 0;
    const update = () => {
      try {
        const el = stripeTrackRef.current;
        if (!el || typeof el.getBoundingClientRect !== 'function') return;
        const r = el.getBoundingClientRect();
        const rect = {
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
        };

        const natW = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.w) : null;
        const natH = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.h) : null;

        // Screen-space rendered box for objectFit: contain + objectPosition: left bottom.
        const scaleInBoxScreen = (Number.isFinite(natW) && natW > 0 && Number.isFinite(natH) && natH > 0 && Number.isFinite(rect.width) && rect.width > 0 && Number.isFinite(rect.height) && rect.height > 0)
          ? Math.min(rect.width / natW, rect.height / natH)
          : null;
        const renderedWScreen = Number.isFinite(scaleInBoxScreen) ? (natW * scaleInBoxScreen) : null;
        const renderedHScreen = Number.isFinite(scaleInBoxScreen) ? (natH * scaleInBoxScreen) : null;
        const topPadScreen = (Number.isFinite(rect.height) && Number.isFinite(renderedHScreen)) ? (rect.height - renderedHScreen) : 0;

        setDebugV4ViewportOverlayInfo({ rect, renderedWScreen, renderedHScreen, topPadScreen });
      } catch {
        // ignore
      }
    };

    const tick = () => {
      update();
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      try {
        window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      } catch {
        // ignore
      }
    };
  }, [debugV4Viewport, stripeV2SpriteProbe]);

  const forceSeedCurrentFromCollectedAndReload = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      let items = null;
      try {
        const raw = (calibIoText || '').toString().trim();
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.kind === 'stripe-calib-collected' && parsed?.items && typeof parsed.items === 'object') {
            items = parsed.items;
          }
        }
      } catch {
        // ignore
      }

      if (!items) {
        const collectedRaw = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
        const collectedParsed = collectedRaw ? JSON.parse(collectedRaw) : null;
        items = collectedParsed?.items && typeof collectedParsed.items === 'object' ? collectedParsed.items : null;
      }

      const k = overlayCalibDesignKey || 'none';
      const found = items && k && typeof items[k] === 'object' ? items[k] : null;

      const ov = found?.overlay;
      const canUseOvFromCollected = Boolean(
        ov
        && typeof ov === 'object'
        && (
          (typeof ov.storageKey === 'string' && ov.storageKey && ov.storageKey === overlayCalibrationStorageKeyEffective)
          || (typeof ov.storageKey === 'string' && ov.storageKey && ov.storageKey === overlayCalibrationStorageKey)
          || (typeof ov.key === 'string' && ov.key && ov.key === k)
        )
      );
      if (canUseOvFromCollected) {
        const x = Number(ov?.x);
        const y = Number(ov?.y);
        const s = Number(ov?.s);
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(s)) {
          window.localStorage.setItem(overlayCalibrationStorageKeyEffective, JSON.stringify({ x, y, s, u: 'svg' }));
        }
      }

      const tiles = found?.v4Tiles;
      if (tiles?.storageKey && tiles.storageKey === v4OverlayTilesStorageKey) {
        const pitchX = Number(tiles?.pitchX);
        const w = Number(tiles?.w);
        const x0 = Number(tiles?.x0);
        if (Number.isFinite(pitchX) && Number.isFinite(w) && Number.isFinite(x0)) {
          window.localStorage.setItem(v4OverlayTilesStorageKey, JSON.stringify({ pitchX, w, x0 }));
        }
      }

      window.location.reload();
    } catch {
      // ignore
    }
  }, [
    calibIoText,
    overlayCalibDesignKey,
    overlayCalibrationStorageKeyEffective,
    v4OverlayTilesStorageKey,
  ]);

  const calibQuickItems = useMemo(() => {
    return [
      {
        k: 'misc_outcasted_dj_vader',
        label: 'Misc (Outcasted DJ Vader)',
        refMockup: '/tmp/CALIBRTGE/miscel·lania/outcasted-dj-vader-black-white.png',
      },
      {
        k: 'misc_outcasted_dead_star2d2',
        label: 'Misc (Outcasted Dead Star2D2)',
        refMockup: '/tmp/CALIBRTGE/miscel·lania/outcasted-dead-star2d2-black-white.png',
      },
      {
        k: 'thin_terminator',
        label: 'Thin (Terminator)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/terminator.png',
      },
      {
        k: 'thin_afrodita_a',
        label: 'Thin (Afrodita-A)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/afrodita-a.png',
      },
      {
        k: 'thin_c3p0',
        label: 'Thin (C3P0)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/c3p0.png',
      },
      {
        k: 'thin_cyber_man',
        label: 'Thin (Cyber-man)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/cyber-man.png',
      },
      {
        k: 'thin_cylon_03_ref',
        label: 'Thin (Cylon-03)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/cylon-03.png',
      },
      {
        k: 'thin_cylon_78_ref',
        label: 'Thin (Cylon-78)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/cylon-78.png',
      },
      {
        k: 'thin_darth_vader',
        label: 'Thin (Darth Vader)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/darth-vader.png',
      },
      {
        k: 'thin_iron_man_08',
        label: 'Thin (Iron-man-08)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/iron-man-08.png',
      },
      {
        k: 'thin_iron_man_68',
        label: 'Thin (Iron-man-68)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/iron-man-68.png',
      },
      {
        k: 'thin_maschinenmensch',
        label: 'Thin (Maschinenmensch)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/maschinenmensch.png',
      },
      {
        k: 'thin_mazinger_z',
        label: 'Thin (Mazinger-Z)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/mazinger-z.png',
      },
      {
        k: 'thin_robbie_the_robot',
        label: 'Thin (Robby the robot)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/robby-the-robot.png',
      },
      {
        k: 'thin_robocop',
        label: 'Thin (Robocop)',
        refMockup: '/tmp/CALIBRTGE/the_human_inside/robocop.png',
      },
      {
        k: 'cube_3cube_p0',
        label: 'Cube (3cube p0)',
        refMockup: '/tmp/CALIBRTGE/cube/3cube-p0.png',
      },
      {
        k: 'cube_afrodita_c',
        label: 'Cube (Afrodita-C)',
        refMockup: '/tmp/CALIBRTGE/cube/afrodita-c.png',
      },
      {
        k: 'cube_cyber_cube',
        label: 'Cube (Cyber)',
        refMockup: '/tmp/CALIBRTGE/cube/cyber-cube.png',
      },
      {
        k: 'cube_cylon_cube',
        label: 'Cube (Cylon)',
        refMockup: '/tmp/CALIBRTGE/cube/cylon-cube.png',
      },
      {
        k: 'cube_darth_cube',
        label: 'Cube (Darth)',
        refMockup: '/tmp/CALIBRTGE/cube/darth-cube.png',
      },
      {
        k: 'cube_iron_cube',
        label: 'Cube (Iron)',
        refMockup: '/tmp/CALIBRTGE/cube/iron-cube.png',
      },
      {
        k: 'cube_iron_kong',
        label: 'Cube (Iron Kong)',
        refMockup: '/tmp/CALIBRTGE/cube/iron-kong.png',
      },
      {
        k: 'cube_maschinen_cube',
        label: 'Cube (Maschinen)',
        refMockup: '/tmp/CALIBRTGE/cube/maschinenCube.png',
      },
      {
        k: 'cube_mazinger_c',
        label: 'Cube (Mazinger)',
        refMockup: '/tmp/CALIBRTGE/cube/mazinger-c.png',
      },
      {
        k: 'cube_robocube',
        label: 'Cube (Robocube)',
        refMockup: '/tmp/CALIBRTGE/cube/robocube.png',
      },
      {
        k: 'austen_crosswords_persuasion_1',
        label: 'Austen (Persuasion 1)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/persuasion/1.jpg',
      },
      {
        k: 'austen_crosswords_persuasion_3',
        label: 'Austen (Persuasion 3)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/persuasion/3.jpg',
      },
      {
        k: 'austen_crosswords_persuasion_5',
        label: 'Austen (Persuasion 5)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/persuasion/5.jpg',
      },
      {
        k: 'austen_crosswords_persuasion_7',
        label: 'Austen (Persuasion 7)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/persuasion/7.jpg',
      },
      {
        k: 'austen_crosswords_pride_and_prejudice_1',
        label: 'Austen (Pride & Prejudice 1)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/1.png',
      },
      {
        k: 'austen_crosswords_pride_and_prejudice_3',
        label: 'Austen (Pride & Prejudice 3)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/3.png',
      },
      {
        k: 'austen_crosswords_pride_and_prejudice_5',
        label: 'Austen (Pride & Prejudice 5)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/5.png',
      },
      {
        k: 'austen_crosswords_pride_and_prejudice_7',
        label: 'Austen (Pride & Prejudice 7)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/7.png',
      },
      {
        k: 'austen_crosswords_sense_and_sensibility_1',
        label: 'Austen (Sense & Sensibility 1)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-1.jpg',
      },
      {
        k: 'austen_crosswords_sense_and_sensibility_3',
        label: 'Austen (Sense & Sensibility 3)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-3.jpg',
      },
      {
        k: 'austen_crosswords_sense_and_sensibility_5',
        label: 'Austen (Sense & Sensibility 5)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-5.jpg',
      },
      {
        k: 'austen_crosswords_sense_and_sensibility_7',
        label: 'Austen (Sense & Sensibility 7)',
        refMockup: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-7.jpg',
      },
      {
        k: 'austen_keep_calm_black',
        label: 'Austen (Keep calm black)',
        refMockup: '/tmp/CALIBRTGE/austen/keep_calm/keep-calm-black.webp',
      },
      {
        k: 'austen_keep_calm_multi_red',
        label: 'Austen (Keep calm multi red)',
        refMockup: '/tmp/CALIBRTGE/austen/keep_calm/keep-calm-multi-red.webp',
      },
      {
        k: 'austen_looking_for_my_darcy_16',
        label: 'Austen (Looking for my Darcy 16)',
        refMockup: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 16.jpeg',
      },
      {
        k: 'austen_looking_for_my_darcy_17',
        label: 'Austen (Looking for my Darcy 17)',
        refMockup: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 17.jpeg',
      },
      {
        k: 'austen_looking_for_my_darcy_18',
        label: 'Austen (Looking for my Darcy 18)',
        refMockup: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 18.jpeg',
      },
      {
        k: 'austen_looking_for_my_darcy_19',
        label: 'Austen (Looking for my Darcy 19)',
        refMockup: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 19.jpeg',
      },
      {
        k: 'austen_pemberley_house_permberley_black',
        label: 'Austen (Pemberley black)',
        refMockup: '/tmp/CALIBRTGE/austen/pemberley_house/permberley-black.jpg',
      },
      {
        k: 'austen_quotes_1',
        label: 'Austen (Quotes 1)',
        refMockup: '/tmp/CALIBRTGE/austen/quotes/1.jpg',
      },
      {
        k: 'austen_quotes_2',
        label: 'Austen (Quotes 2)',
        refMockup: '/tmp/CALIBRTGE/austen/quotes/2.jpg',
      },
      {
        k: 'austen_quotes_3',
        label: 'Austen (Quotes 3)',
        refMockup: '/tmp/CALIBRTGE/austen/quotes/3.jpg',
      },
      {
        k: 'austen_quotes_4',
        label: 'Austen (Quotes 4)',
        refMockup: '/tmp/CALIBRTGE/austen/quotes/4.jpg',
      },
      {
        k: 'austen_quotes_5',
        label: 'Austen (Quotes 5)',
        refMockup: '/tmp/CALIBRTGE/austen/quotes/5.jpg',
      },
      {
        k: 'nx01',
        label: 'NX-01',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-nx-01-black-white.png',
      },
      {
        k: 'ncc1701',
        label: 'NCC-1701',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-ncc-1701-black-white.png',
      },
      {
        k: 'ncc1701d',
        label: 'NCC-1701-D',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-ncc-1701-d-black-white.png',
      },
      {
        k: 'wormhole',
        label: 'Wormhole',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-wormhole-black-white.png',
      },
      {
        k: 'plasma_escape',
        label: 'Plasma escape',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-plasma-escape-black-white.png',
      },
      {
        k: 'vulcans_end',
        label: 'Vulcans end',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-vulcans-end-black-white.png',
      },
      {
        k: 'phoenix',
        label: 'The Phoenix',
        refMockup: '/tmp/CALIBRTGE/first_contact/first-contact-the-phoenix-black-white.png',
      },
    ];
  }, []);

  const buildCalibHrefForQuickItem = useCallback((item) => {
    try {
      if (typeof window === 'undefined') return '';
      const u = new URL(window.location.href);
      const p = u.searchParams;
      p.set('stripeCalib', '1');
      p.set('stripeCalibMode', 'overlay');
      p.set('stripeRefTile1', '1');
      p.set('stripeRefTargetIndex', '1');
      u.search = p.toString();
      return u.toString();
    } catch {
      return '';
    }
  }, []);

  const calibQuickItemsGrouped = useMemo(() => {
    const groupOf = (it) => {
      const src = (it?.refMockup || '').toString().toLowerCase();
      if (src.includes('/tmp/calibrtge/miscel·lania/')) return 'Misc';
      if (src.includes('/tmp/calibrtge/the_human_inside/')) return 'Thin';
      if (src.includes('/tmp/calibrtge/cube/')) return 'Cube';
      if (src.includes('/tmp/calibrtge/austen/')) return 'Austen';
      if (src.includes('/tmp/calibrtge/first_contact/')) return 'First Contact';
      return 'Altres';
    };

    const order = ['Thin', 'Cube', 'Austen', 'First Contact', 'Misc', 'Altres'];
    const map = new Map(order.map((k) => [k, []]));
    for (const it of (Array.isArray(calibQuickItems) ? calibQuickItems : [])) {
      const g = groupOf(it);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(it);
    }
    return order
      .filter((k) => (map.get(k) || []).length > 0)
      .map((k) => ({ group: k, items: map.get(k) || [] }));
  }, [calibQuickItems]);

  const [calibQuickGroup, setCalibQuickGroup] = useState('');
  useEffect(() => {
    try {
      const exists = (g) => (calibQuickItemsGrouped || []).some((x) => x.group === g);
      if (calibQuickGroup && exists(calibQuickGroup)) return;

      const src = (stripeRefMockupSrc || '').toString().toLowerCase();
      if (src.includes('/tmp/calibrtge/the_human_inside/')) { setCalibQuickGroup('Thin'); return; }
      if (src.includes('/tmp/calibrtge/cube/')) { setCalibQuickGroup('Cube'); return; }
      if (src.includes('/tmp/calibrtge/austen/')) { setCalibQuickGroup('Austen'); return; }
      if (src.includes('/tmp/calibrtge/first_contact/')) { setCalibQuickGroup('First Contact'); return; }
      setCalibQuickGroup((calibQuickItemsGrouped?.[0]?.group) || '');
    } catch {
      // ignore
    }
  }, [calibQuickItemsGrouped, stripeRefMockupSrc]);

  const stripeCalibHud = (stripeHudVisible && stripeCalibEnabled && (stripeRefMockupSrc || overlaySrc)) ? createPortal(
    <StripeCalibHud
      beltGuideXPx={beltGuideXPx}
      hudFixedPos={hudFixedPos}
      hudPadLeftPx={stripeHudPadLeftPx}
      stripeCalibMode={stripeCalibMode}
      stripeCalibEnabled={stripeCalibEnabled}
      stripeFresh={stripeFresh}
      stripeClampLevel={stripeClampLevel}
      setStripeCalibHudArmed={setStripeCalibHudArmed}
      stripeCalibHudCollapsed={stripeCalibHudCollapsed}
      setStripeCalibHudCollapsed={setStripeCalibHudCollapsed}
      exportCalibrationConfig={exportCalibrationConfig}
      resetOverlayCalibration={resetOverlayCalibration}
      downloadCalibrationConfig={downloadCalibrationConfig}
      calibUploadInputRef={calibUploadInputRef}
      onUploadCalibrationFile={onUploadCalibrationFile}
      uploadCalibrationConfigPickFile={uploadCalibrationConfigPickFile}
      calibIoOpen={calibIoOpen}
      setCalibIoOpen={setCalibIoOpen}
      calibIoText={calibIoText}
      setCalibIoText={setCalibIoText}
      getAllCalibrationLocalStorage={getAllCalibrationLocalStorage}
      viewCollectedCalibration={viewCollectedCalibration}
      copyCollectedCalibration={copyCollectedCalibration}
      clearCollectedCalibration={clearCollectedCalibration}
      forceSeedCurrentFromCollectedAndReload={forceSeedCurrentFromCollectedAndReload}
      minimalCalibUrl={minimalCalibUrl}
      copyToClipboard={copyToClipboard}
      importCalibrationConfig={importCalibrationConfig}
      restoreCollectedCalibrationConfig={restoreCollectedCalibrationConfig}
      overlayCalibDesignKey={overlayCalibDesignKey}
      overlaySrc={overlaySrc}
      effectiveItems={effectiveItems}
      lastClickedSlug={lastClickedSlug}
      stripeV4AllowUrlParams={stripeV4AllowUrlParams}
      stripeV4Sprite={stripeV4Sprite}
      stripeV4SpriteExtraBottomPx={stripeV4SpriteExtraBottomPx}
      stripeOverlayClip={stripeOverlayClip}
      stripeOverlayClipDebug={stripeOverlayClipDebug}
      debugStripeHitEffective={debugStripeHitEffective}
      debugStripeOverlaySlots={debugStripeOverlaySlots}
      stripeV4Engine={stripeV4Engine}
      stripeV4ClipDxPx={stripeV4ClipDxPx}
      stripeV4ClipDyPx={stripeV4ClipDyPx}
      stripeV4HitDxPx={stripeV4HitDxPx}
      stripeV4HitDyPx={stripeV4HitDyPx}
      v4UnionMaskDy={v4UnionMaskDy}
      v4UnionMaskScaleX={v4UnionMaskScaleX}
      v4UnionMaskScaleY={v4UnionMaskScaleY}
      v4OverlayPitchXLive={v4OverlayPitchXLive}
      v4OverlayWLive={v4OverlayWLive}
      v4OverlayX0Live={v4OverlayX0Live}
      stripeV4Fit={stripeV4Fit}
      v4OverlayTilesLoadInfo={v4OverlayTilesLoadInfo}
      debugStripeHit={debugStripeHit}
      v4TileOverlaySrcs={v4TileOverlaySrcs}
      v4TileOverlayLoad={v4TileOverlayLoad}
      overlayCalibrationStorageKey={overlayCalibrationStorageKeyEffective}
      debugOverlayLocalStorageRaw={debugOverlayLocalStorageRaw}
      stripeOverlayX={stripeOverlayX}
      stripeOverlayY={stripeOverlayY}
      stripeOverlayScale={stripeOverlayScale}
      overlayCalibSource={overlayCalibSource}
      overlayCalibKeyUsed={overlayCalibKeyUsed}
      stripeV4HitAlignTopBBoxY={stripeV4HitAlignTopBBoxY}
      stripeV4HitAlignTopDy={stripeV4HitAlignTopDy}
      stripeV4SvgW={stripeV4SvgW}
      stripeV4SvgH={stripeV4SvgH}
      stripeV4SpriteSrc={stripeV4SpriteSrc}
      overlaySrcForRender={overlaySrcForRender}
      stripeRefMockupSrc={stripeRefMockupSrc}
      stripeRefTargetIndex={stripeRefTargetIndex}
      stripeRefTargetSlug={stripeRefTargetSlug}
      stripeRefX={stripeRefX}
      stripeRefY={stripeRefY}
      stripeRefScale={stripeRefScale}
      stripeRefTile1={stripeRefTile1}
      stripeRef2X={stripeRef2X}
      stripeRef2Y={stripeRef2Y}
      stripeRef2Scale={stripeRef2Scale}
      stripeV3={stripeV3}
      v3TileStepXLive={v3TileStepXLive}
      v3TileWLive={v3TileWLive}
      v3TileAnchorIndexLive={v3TileAnchorIndexLive}
      v3TileAnchorXLive={v3TileAnchorXLive}
      v3TileX0Live={v3TileX0Live}
      calibQuickItemsGrouped={calibQuickItemsGrouped}
      calibQuickGroup={calibQuickGroup}
      setCalibQuickGroup={setCalibQuickGroup}
      buildCalibHrefForQuickItem={buildCalibHrefForQuickItem}
    />,
    (typeof document !== 'undefined' ? document.body : null)
  ) : null;

  useLayoutEffect(() => {
    if (!stripeV2 || !stripeV3) {
      setStripeV3Fit(null);
      setStripeV3Ready(false);
      return undefined;
    }

    const pickRect = (nodes, pick) => {
      try {
        const rects = Array.from(nodes || [])
          .map((n) => (n && n.getBoundingClientRect ? n.getBoundingClientRect() : null))
          .filter((r) => r && Number.isFinite(r.left) && Number.isFinite(r.right) && Number.isFinite(r.top) && Number.isFinite(r.bottom))
          .filter((r) => (r.right - r.left) > 0 && (r.bottom - r.top) > 0)
          ;
        if (rects.length === 0) return null;
        if (pick === 'minLeft') return rects.reduce((a, b) => (b.left < a.left ? b : a), rects[0]);
        if (pick === 'maxLeft') return rects.reduce((a, b) => (b.left > a.left ? b : a), rects[0]);
        if (pick === 'minRight') return rects.reduce((a, b) => (b.right < a.right ? b : a), rects[0]);
        if (pick === 'maxRight') return rects.reduce((a, b) => (b.right > a.right ? b : a), rects[0]);
        return rects[0];
      } catch {
        return null;
      }
    };

    let lastFit = null;
    let stableCount = 0;
    let ready = false;
    let frozen = false;
    let settleRaf1 = null;
    let settleRaf2 = null;
    const startTs = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
    const minDelayMs = 250;

    const update = () => {
      try {
        if (frozen) return;

        const dprNowRaw = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
        const dpr = (Number.isFinite(dprNowRaw) && dprNowRaw > 0) ? dprNowRaw : 1;
        const dprNow = Number.isFinite(dprNowRaw) ? (Math.round(dprNowRaw * 1000) / 1000) : 1;
        const prevDpr = (typeof stripeV3PrevDprRef.current === 'number' && Number.isFinite(stripeV3PrevDprRef.current))
          ? stripeV3PrevDprRef.current
          : null;
        if (prevDpr == null) stripeV3PrevDprRef.current = dprNow;
        if (prevDpr != null && Math.abs(prevDpr - dprNow) >= 0.01) {
          stripeV3PrevDprRef.current = dprNow;
          frozen = false;
          ready = false;
          stableCount = 0;
          lastFit = null;
          setStripeV3Ready(false);

          try {
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
              if (settleRaf1) window.cancelAnimationFrame(settleRaf1);
              if (settleRaf2) window.cancelAnimationFrame(settleRaf2);
              settleRaf1 = window.requestAnimationFrame(() => {
                settleRaf2 = window.requestAnimationFrame(() => {
                  settleRaf1 = null;
                  settleRaf2 = null;
                  update();
                });
              });
            }
          } catch {
            // ignore
          }

          return;
        }

        const stripeRootRect = stripeRootRef.current?.getBoundingClientRect?.();
        if (!stripeRootRect) return;

        const leftRect = document.querySelector('#stripe-guide-left-anchor')?.getBoundingClientRect?.()
          ?? pickRect(document.querySelectorAll('#stripe-guide-left-anchor'), 'minLeft');
        const rightRect = document.querySelector('#stripe-guide-right-anchor')?.getBoundingClientRect?.()
          ?? pickRect(document.querySelectorAll('#stripe-guide-right-anchor'), 'maxRight');
        const leftX = leftRect?.left;
        const rightX = rightRect?.right;

        if (stripeBeltGuides) setBeltGuideXPx((prev) => {
          const next = {
            left: Number.isFinite(leftX) ? leftX : null,
            right: Number.isFinite(rightX) ? rightX : null,
          };
          if (!prev) return next;
          if (prev.left === next.left && prev.right === next.right) return prev;
          return next;
        });

        const trackOriginLeft = stripeRootRect.left + (Number.isFinite(stripeV2ViewportExtendLeftPx) ? stripeV2ViewportExtendLeftPx : 0);
        const trackOriginLeftPhys = trackOriginLeft * dpr;
        const hasDomAnchors = Number.isFinite(leftX) && Number.isFinite(rightX);

        const { targetLeftLocal, targetRightLocal } = (() => {
          const wCss = stripeRootRect.width;
          if (hasDomAnchors && Number.isFinite(wCss) && wCss > 0) {
            const leftFrac = (leftX - trackOriginLeft) / wCss;
            const rightFrac = (rightX - trackOriginLeft) / wCss;
            const wPhys = wCss * dpr;
            return {
              targetLeftLocal: leftFrac * wPhys,
              targetRightLocal: rightFrac * wPhys,
            };
          }

          const w = stripeRootRect.width * dpr;
          if (!Number.isFinite(w) || w <= 0) return { targetLeftLocal: NaN, targetRightLocal: NaN };
          const l = (Number.isFinite(stripeV2InsetLeftPx) ? stripeV2InsetLeftPx : 0) * dpr;
          const r = (Number.isFinite(stripeV2InsetRightPx) ? stripeV2InsetRightPx : 0) * dpr;
          return {
            targetLeftLocal: l,
            targetRightLocal: Math.max(l + 1, w - r),
          };
        })();

        if (!Number.isFinite(targetLeftLocal) || !Number.isFinite(targetRightLocal)) return;

        const trackH = (stripeV2 ? (megaTileSize + 2) : megaTileSize) || 0;
        if (!Number.isFinite(trackH) || trackH <= 0) return;
        const trackHPhys = trackH * dpr;

        const baseScale = trackH / stripeV3SvgH;
        const baseScalePhys = trackHPhys / stripeV3SvgH;
        const a1 = baseScalePhys * stripeV2Anchor1XPx;
        const a14 = baseScalePhys * (2188.5 + stripeV2Anchor14XPx);
        const denom = a14 - a1;
        if (!Number.isFinite(denom) || denom === 0) return;

        const targetSpanLocal = (targetRightLocal - targetLeftLocal) + (stripeV3FitSpanExtraPx * dpr);
        const scale = targetSpanLocal / denom;
        if (!Number.isFinite(scale) || scale <= 0) return;

        const tx = targetLeftLocal - (a1 * scale);

        const buttonbarRect = document.querySelector('[data-stripe-buttonbar="cc"]')?.getBoundingClientRect?.()
          || document.querySelector('[data-stripe-buttonbar="bn"]')?.getBoundingClientRect?.()
          || (document.querySelector('#stripe-guide-left-anchor')?.parentElement?.getBoundingClientRect?.() ?? null);
        const targetBottomLocal = buttonbarRect
          ? (Math.round(buttonbarRect.bottom * dpr) - Math.round(stripeRootRect.top * dpr))
          : trackHPhys;
        const effectiveH = Math.max(0, trackHPhys - ((Number.isFinite(stripeV3BottomInsetPx) ? stripeV3BottomInsetPx : 0) * dpr));
        const ty = (targetBottomLocal - (effectiveH * scale));

        const spriteBottomLocal = ty + (effectiveH * scale);

        const next = {
          tx: (tx / dpr),
          ty: (ty / dpr),
          scale,
          baseScale,
          targetBottomLocal: (targetBottomLocal / dpr),
          spriteBottomLocal: (spriteBottomLocal / dpr)
        };

        const isStable = (() => {
          if (!lastFit) return false;
          const epsPx = hasDomAnchors ? 1.25 : 1.75;
          const epsScale = hasDomAnchors ? 0.002 : 0.003;
          return Math.abs(lastFit.tx - next.tx) < epsPx
            && Math.abs(lastFit.ty - next.ty) < epsPx
            && Math.abs(lastFit.scale - next.scale) < epsScale;
        })();
        stableCount = isStable ? (stableCount + 1) : 0;
        lastFit = next;

        const requiredStable = hasDomAnchors ? 2 : 2;

        setStripeV3Ready((prev) => {
          if (prev) {
            ready = true;
            return true;
          }

          const nowTs = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
          if ((nowTs - startTs) >= minDelayMs) {
            ready = true;
            return true;
          }

          if (stableCount >= requiredStable) {
            ready = true;
            return true;
          }

          return false;
        });
        setStripeV3Fit((prev) => {
          if (!prev) return next;
          if (ready) {
            const epsPx = 6;
            const epsScale = 0.006;
            const changed = Math.abs(prev.tx - next.tx) > epsPx
              || Math.abs(prev.ty - next.ty) > epsPx
              || Math.abs(prev.scale - next.scale) > epsScale;
            if (!changed) return prev;
          }
          if (
            prev.tx === next.tx
            && prev.ty === next.ty
            && prev.scale === next.scale
            && prev.baseScale === next.baseScale
            && prev.targetBottomLocal === next.targetBottomLocal
            && prev.spriteBottomLocal === next.spriteBottomLocal
          ) return prev;
          return next;
        });

        const nowTs = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
        if ((nowTs - startTs) >= minDelayMs) {
          if (hasDomAnchors) {
            if (stableCount >= requiredStable) frozen = true;
          } else {
            if (stableCount >= requiredStable) frozen = true;
          }
        }

        try {
          if (typeof window !== 'undefined') window.__stripeV3Fit = next;
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };

    update();
    try {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => update());
      }
    } catch {
      // ignore
    }

    try {
      if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
        window.setTimeout(() => update(), minDelayMs + 1);
      }
    } catch {
      // ignore
    }

    try {
      if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.ready?.then === 'function') {
        document.fonts.ready.then(() => update()).catch(() => {});
      }
    } catch {
      // ignore
    }

    const onResize = () => {
      frozen = false;
      ready = false;
      stableCount = 0;
      lastFit = null;
      setStripeV3Ready(false);
      update();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', update, true);
    window.addEventListener('load', update);

    const pollId = window.setInterval(update, 500);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('load', update);

      try {
        if (settleRaf1) window.cancelAnimationFrame(settleRaf1);
        if (settleRaf2) window.cancelAnimationFrame(settleRaf2);
      } catch {
        // ignore
      }

      window.clearInterval(pollId);
    };
  }, [megaTileSize, stripeBeltGuides, stripeV2, stripeV2AllowUrlParams, stripeV2Anchor1XPx, stripeV2Anchor14XPx, stripeV2ViewportExtendLeftPx, stripeV3, stripeV3SvgH]);

  useLayoutEffect(() => {
    if (!stripeV2) {
      setStripeV2LiveBoundsLocal(null);
      setStripeV2LiveFit(null);
      if (!stripeBeltGuides) {
        setBeltGuideXPx(null);
        setStripeZoomHud(null);
      }
      return undefined;
    }
    if (!stripeBeltGuides) {
      setBeltGuideXPx(null);
      setStripeZoomHud(null);
      setStripeV2LiveBoundsLocal(null);
    }

    const update = () => {
      try {
        const dprNow = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
        if (Number.isFinite(dprNow) && stripePrevDprRef.current !== dprNow) {
          stripePrevDprRef.current = dprNow;
          stripePrevRightXRef.current = null;
          if (stripeBeltGuides) setStripeZoomSettling(true);

          try {
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
              if (stripeZoomSettleRafRef.current) window.cancelAnimationFrame(stripeZoomSettleRafRef.current);
              stripeZoomSettleRafRef.current = window.requestAnimationFrame(() => {
                stripeZoomSettleRafRef.current = window.requestAnimationFrame(() => {
                  stripeZoomSettleRafRef.current = null;
                  if (stripeBeltGuides) setStripeZoomSettling(false);
                  update();
                });
              });
            }
          } catch {
            // ignore
          }
        }
        const stripeRootRect = stripeRootRef.current?.getBoundingClientRect?.();

        const stripeWNow = (() => {
          const w = stripeRootRect?.width;
          if (Number.isFinite(w)) return w;
          const el = stripeRootRef.current;
          const cw = el && typeof el.clientWidth === 'number' ? el.clientWidth : null;
          return Number.isFinite(cw) ? cw : 0;
        })();
        setStripeW(stripeWNow);

        const findButtonByText = (re) => {
          try {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find((b) => re.test(((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')).trim())) || null;
          } catch {
            return null;
          }
        };

        const findBlancNegreGroupRect = () => {
          const blancBtn = findButtonByText(/\bblanc\b/i);
          const negreBtn = findButtonByText(/\bnegre\b/i);
          if (!blancBtn || !negreBtn) return null;
          let node = blancBtn;
          while (node && node instanceof Element) {
            if (node.contains(negreBtn)) {
              const r = node.getBoundingClientRect?.();
              return r && r.width ? r : null;
            }
            node = node.parentElement;
          }
          return null;
        };

        const pickRect = (nodes, pick) => {
          try {
            const stripeTop = stripeRootRect?.top;
            const stripeBottom = stripeRootRect?.bottom;
            const hasStripeBand = Number.isFinite(stripeTop) && Number.isFinite(stripeBottom);
            const bandPad = 40;
            const vw = typeof window !== 'undefined' ? (window.innerWidth ?? 0) : 0;

            const rects = Array.from(nodes || [])
              .map((n) => (n && n.getBoundingClientRect ? n.getBoundingClientRect() : null))
              .filter((r) => r && Number.isFinite(r.left) && Number.isFinite(r.right) && Number.isFinite(r.top) && Number.isFinite(r.bottom))
              .filter((r) => (r.right - r.left) > 0 && (r.bottom - r.top) > 0)
              .filter((r) => (vw ? (r.right > 0 && r.left < vw) : true));

            const rectsInBand = hasStripeBand
              ? rects.filter((r) => (r.bottom >= (stripeTop - bandPad)) && (r.top <= (stripeBottom + bandPad)))
              : rects;

            const effectiveRects = rectsInBand.length > 0 ? rectsInBand : rects;
            if (effectiveRects.length === 0) return null;
            if (pick === 'maxRight') return effectiveRects.reduce((a, b) => (b.right > a.right ? b : a), effectiveRects[0]);
            if (pick === 'maxLeft') return effectiveRects.reduce((a, b) => (b.left > a.left ? b : a), effectiveRects[0]);
            if (pick === 'minLeft') return effectiveRects.reduce((a, b) => (b.left < a.left ? b : a), effectiveRects[0]);
            if (pick === 'minRight') return effectiveRects.reduce((a, b) => (b.right < a.right ? b : a), effectiveRects[0]);
            return effectiveRects[0];
          } catch {
            return null;
          }
        };

        const pickRectSticky = (nodes, pick, prevLeftPx) => {
          try {
            const r = pickRect(nodes, pick);
            if (!Number.isFinite(prevLeftPx)) return r;

            const stripeTop = stripeRootRect?.top;
            const stripeBottom = stripeRootRect?.bottom;
            const hasStripeBand = Number.isFinite(stripeTop) && Number.isFinite(stripeBottom);
            const bandPad = 40;
            const vw = typeof window !== 'undefined' ? (window.innerWidth ?? 0) : 0;

            const rects = Array.from(nodes || [])
              .map((n) => (n && n.getBoundingClientRect ? n.getBoundingClientRect() : null))
              .filter((rr) => rr && Number.isFinite(rr.left) && Number.isFinite(rr.right) && Number.isFinite(rr.top) && Number.isFinite(rr.bottom))
              .filter((rr) => (rr.right - rr.left) > 0 && (rr.bottom - rr.top) > 0)
              .filter((rr) => (vw ? (rr.right > 0 && rr.left < vw) : true));

            const rectsInBand = hasStripeBand
              ? rects.filter((rr) => (rr.bottom >= (stripeTop - bandPad)) && (rr.top <= (stripeBottom + bandPad)))
              : rects;

            const effectiveRects = rectsInBand.length > 0 ? rectsInBand : rects;
            if (effectiveRects.length <= 1) return r;

            const closest = effectiveRects.reduce((a, b) => (Math.abs(b.left - prevLeftPx) < Math.abs(a.left - prevLeftPx) ? b : a), effectiveRects[0]);
            const thresholdPx = 24;
            return Math.abs(closest.left - prevLeftPx) <= thresholdPx ? closest : r;
          } catch {
            return pickRect(nodes, pick);
          }
        };

        const leftRect = pickRect(document.querySelectorAll('#stripe-guide-left-anchor'), 'minLeft');
        const rightRect = pickRectSticky(
          document.querySelectorAll('#stripe-guide-right-anchor'),
          'maxRight',
          stripePrevRightXRef.current,
        );

        const blancNegreRect = !leftRect ? findBlancNegreGroupRect() : null;
        const anteriorBtn = !rightRect ? findButtonByText(/\banterior\b/i) : null;
        const anteriorRect = anteriorBtn?.getBoundingClientRect?.();

        const tile1El = stripeRootRef.current?.querySelector?.('[data-stripe-tile-idx="0"]');
        const tile14El = stripeRootRef.current?.querySelector?.('[data-stripe-tile-idx="13"]');
        const tile1Rect = tile1El?.getBoundingClientRect?.();
        const tile14Rect = tile14El?.getBoundingClientRect?.();

        const leftXFit = leftRect
          ? leftRect.left
          : (blancNegreRect ? blancNegreRect.right : (tile1Rect ? tile1Rect.left : null));

        const leftXGuide = leftRect
          ? leftRect.left
          : (blancNegreRect ? blancNegreRect.left : (tile1Rect ? tile1Rect.left : null));

        const rightX = rightRect
          ? rightRect.right
          : (anteriorRect ? anteriorRect.right : (tile14Rect ? tile14Rect.right : null));

        if (Number.isFinite(rightX)) stripePrevRightXRef.current = rightX;

        if (stripeBeltGuides) setStripeZoomHud((prev) => {
          try {
            const dpr = window.devicePixelRatio ?? 1;
            const innerW = window.innerWidth ?? 0;

            const next = {
              dpr,
              innerW,
              tile1: tile1Rect
                ? { l: tile1Rect.left, r: tile1Rect.right, w: tile1Rect.width }
                : null,
              tile14: tile14Rect
                ? { l: tile14Rect.left, r: tile14Rect.right, w: tile14Rect.width }
                : null,
            };

            if (!prev) return next;
            if (prev.dpr === next.dpr &&
              prev.innerW === next.innerW &&
              prev.tile1?.l === next.tile1?.l && prev.tile1?.r === next.tile1?.r && prev.tile1?.w === next.tile1?.w &&
              prev.tile14?.l === next.tile14?.l && prev.tile14?.r === next.tile14?.r && prev.tile14?.w === next.tile14?.w
            ) return prev;
            return next;
          } catch {
            return prev;
          }
        });

        setStripeV2LiveFit((prev) => {
          try {
            if (!stripeV2) return null;
            const baseLeft = stripeRootRect?.left;
            if (!Number.isFinite(baseLeft)) return prev;

            const leftLocal = Number.isFinite(leftXFit) ? (leftXFit - baseLeft) : null;
            const rightLocal = Number.isFinite(rightX) ? (rightX - baseLeft) : null;

            const next = {
              left: Number.isFinite(leftLocal) ? leftLocal : null,
              right: Number.isFinite(rightLocal) ? rightLocal : null,
            };

            try {
              if (import.meta?.env?.DEV && typeof window !== 'undefined') {
                window.__stripeV2LiveBoundsLocal = next;
              }
            } catch {
              // ignore
            }
            if (!prev) return next;
            if (prev.left === next.left && prev.right === next.right) return prev;
            return next;
          } catch {
            return prev;
          }
        });

        if (stripeBeltGuides) setBeltGuideXPx((prev) => {
          const t14c = tile14Rect && Number.isFinite(tile14Rect.left) && Number.isFinite(tile14Rect.right)
            ? ((tile14Rect.left + tile14Rect.right) / 2)
            : null;
          const next = {
            left: Number.isFinite(leftXGuide) ? leftXGuide : null,
            right: Number.isFinite(rightX) ? rightX : null,
            t14c: Number.isFinite(t14c) ? t14c : null,
          };
          if (!prev) return next;
          if (prev.left === next.left && prev.right === next.right && prev.t14c === next.t14c) return prev;
          return next;
        });
      } catch {
        if (stripeBeltGuides) setBeltGuideXPx(null);
      }
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    try {
      vv?.addEventListener?.('resize', update);
      vv?.addEventListener?.('scroll', update);
    } catch {
      // ignore
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      try {
        vv?.removeEventListener?.('resize', update);
        vv?.removeEventListener?.('scroll', update);
      } catch {
        // ignore
      }
    };
  }, [
    stripeBeltGuides,
    stripeV2,
    stripeV2ViewportExtendLeftPx,
    stripeV2Scale,
    stripeV2InsetLeftPx,
    stripeV2InsetRightPx,
    stripeW,
    megaTileSize,
    effectiveItems.length,
    firstOffsetPx,
    firstTileExtraOffsetPx,
    lastOffsetPx,
    lastTileExtraOffsetPx,
    compressFactor,
    autoAlignLastToRight,
  ]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    try {
      let raw = window.localStorage.getItem(calibrationStorageKey);
      if (!raw && stripeV4Engine && calibrationStorageKeyV4PerMockup) {
        try {
          const legacy = window.localStorage.getItem(calibrationStorageKeyV4PerMockup);
          if (legacy) {
            window.localStorage.setItem(calibrationStorageKey, legacy);
            raw = legacy;
          }
        } catch {
          // ignore
        }
      }
      if (!raw && stripeV4Engine && calibrationStorageKeyV4LegacyGlobal) {
        try {
          const legacy = window.localStorage.getItem(calibrationStorageKeyV4LegacyGlobal);
          if (legacy) {
            window.localStorage.setItem(calibrationStorageKey, legacy);
            raw = legacy;
          }
        } catch {
          // ignore
        }
      }
      if (!raw && calibrationStorageKeyLegacyRef) {
        try {
          const legacy = window.localStorage.getItem(calibrationStorageKeyLegacyRef);
          if (legacy) {
            window.localStorage.setItem(calibrationStorageKey, legacy);
            raw = legacy;
          }
        } catch {
          // ignore
        }
      }
      if (!raw) {
        if (!stripeFresh) {
          const migrated = migrateRefCalibFromLegacyKeys({
            keyToWrite: calibrationStorageKey,
            geoKey: geometrySignature || 'nogeo',
            stripeRefTargetIndex,
            stripeRefTargetSlug,
          });
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeRefX(parsedMigrated.x);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeRefY(parsedMigrated.y);
            if (typeof parsedMigrated?.scale === 'number' && Number.isFinite(parsedMigrated.scale)) setStripeRefScale(parsedMigrated.scale);
            return;
          }
        }
        setStripeRefX(stripeRefXParam);
        setStripeRefY(stripeRefYParam);
        setStripeRefScale(stripeRefScaleParam);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.v !== 2) {
        if (calibrationStorageKeyLegacyRef) {
          try {
            const legacy = window.localStorage.getItem(calibrationStorageKeyLegacyRef);
            if (legacy) {
              window.localStorage.setItem(calibrationStorageKey, legacy);
              const parsedLegacy = JSON.parse(legacy);
              if (typeof parsedLegacy?.x === 'number' && Number.isFinite(parsedLegacy.x)) setStripeRefX(parsedLegacy.x);
              else setStripeRefX(stripeRefXParam);
              if (typeof parsedLegacy?.y === 'number' && Number.isFinite(parsedLegacy.y)) setStripeRefY(parsedLegacy.y);
              else setStripeRefY(stripeRefYParam);
              if (typeof parsedLegacy?.s === 'number' && Number.isFinite(parsedLegacy.s)) setStripeRefScale(parsedLegacy.s);
              else setStripeRefScale(stripeRefScaleParam);
              return;
            }
          } catch {
            // ignore
          }
        }
        if (!stripeFresh) {
          const migrated = migrateRefCalibFromLegacyKeys({
            keyToWrite: calibrationStorageKey,
            geoKey: geometrySignature || 'nogeo',
            stripeRefTargetIndex,
            stripeRefTargetSlug,
          });
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeRefX(parsedMigrated.x);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeRefY(parsedMigrated.y);
            if (typeof parsedMigrated?.scale === 'number' && Number.isFinite(parsedMigrated.scale)) setStripeRefScale(parsedMigrated.scale);
            return;
          }
        }
      }
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeRefX(parsed.x);
      else setStripeRefX(stripeRefXParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeRefY(parsed.y);
      else setStripeRefY(stripeRefYParam);
      if (typeof parsed?.scale === 'number' && Number.isFinite(parsed.scale)) setStripeRefScale(parsed.scale);
      else if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeRefScale(parsed.s);
      else setStripeRefScale(stripeRefScaleParam);
    } catch {
      setStripeRefX(stripeRefXParam);
      setStripeRefY(stripeRefYParam);
      setStripeRefScale(stripeRefScaleParam);
    }
  }, [
    calibrationStorageKey,
    calibrationStorageKeyLegacyRef,
    calibrationStorageKeyV4LegacyGlobal,
    geometrySignature,
    stripeRefMockupSrc,
    stripeFresh,
    stripeRefScaleParam,
    stripeRefXParam,
    stripeRefYParam,
    stripeV4Engine,
  ]);

  const calibrationStorageKeyRef2 = useMemo(() => `${calibrationStorageKey}_ref2`, [calibrationStorageKey]);
  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    if (!stripeRefTile1) return;

    const hasExplicitRef2Params =
      urlParams?.has('stripeRef2X') ||
      urlParams?.has('stripeRef2Y') ||
      urlParams?.has('stripeRef2Scale');
    if (hasExplicitRef2Params) return;

    try {
      const raw = window.localStorage.getItem(calibrationStorageKeyRef2);
      if (!raw) {
        setStripeRef2X(stripeRef2XParam);
        setStripeRef2Y(stripeRef2YParam);
        setStripeRef2Scale(stripeRef2ScaleParam);
        return;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeRef2X(parsed.x);
      else setStripeRef2X(stripeRef2XParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeRef2Y(parsed.y);
      else setStripeRef2Y(stripeRef2YParam);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeRef2Scale(parsed.s);
      else setStripeRef2Scale(stripeRef2ScaleParam);
    } catch {
      setStripeRef2X(stripeRef2XParam);
      setStripeRef2Y(stripeRef2YParam);
      setStripeRef2Scale(stripeRef2ScaleParam);
    }
  }, [
    calibrationStorageKeyRef2,
    stripeRef2ScaleParam,
    stripeRef2XParam,
    stripeRef2YParam,
    stripeRefMockupSrc,
    stripeRefTile1,
    stripeFresh,
    urlParams,
  ]);

  useEffect(() => {
    if (!(overlaySrc || overlaySrcForRender)) return;

    if (stripeV4Engine) {
      try {
        const hasExplicitOverlayParamsRaw =
          urlParams?.has('stripeOverlayX') ||
          urlParams?.has('stripeOverlayY') ||
          urlParams?.has('stripeOverlayScale');
        if (hasExplicitOverlayParamsRaw) {
          setStripeOverlayX(stripeOverlayXParam);
          setStripeOverlayY(stripeOverlayYParam);
          setStripeOverlayScale(stripeOverlayScaleParam);
          setOverlayCalibSource('url');
          setOverlayCalibKeyUsed('');
          overlayDirtyRef.current = false;
          overlayCalibLoadedOnceRef.current = true;
          return;
        }

        if (overlayCalibLoadedKeyRef.current === overlayCalibrationStorageKeyEffective) return;
        overlayCalibLoadedKeyRef.current = overlayCalibrationStorageKeyEffective;

        let raw = window.localStorage.getItem(overlayCalibrationStorageKeyEffective);
        let source = raw ? 'localStorage' : '';
        let keyUsed = raw ? overlayCalibrationStorageKeyEffective : '';
        if (!raw && overlayIsDrawings && overlayCalibrationStorageKeyEffective) {
          try {
            const prevKey = `${overlayCalibrationStorageKeyEffective}__drawings`;
            const prevRaw = window.localStorage.getItem(prevKey);
            if (prevRaw) {
              window.localStorage.setItem(overlayCalibrationStorageKeyEffective, prevRaw);
              raw = prevRaw;
              source = 'localStorage';
              keyUsed = overlayCalibrationStorageKeyEffective;
            }
          } catch {
            // ignore
          }
        }
        if (!raw) {
          try {
            const base = stripeFresh ? 'stripeOverlayCalibFresh' : 'stripeOverlayCalib';
            const t = 'all';
            const legacyGlobalV4Key = `${base}_${t}_v4_all_v4`;
            const legacyRaw = window.localStorage.getItem(legacyGlobalV4Key);
            if (legacyRaw && !overlayIsDrawings) {
              window.localStorage.setItem(overlayCalibrationStorageKeyEffective, legacyRaw);
              raw = legacyRaw;
              source = 'localStorage';
              keyUsed = legacyGlobalV4Key;
            }
          } catch {
            // ignore
          }
        }

        if (!raw && overlayIsDrawings && overlaySrcForPreset) {
          try {
            const base = stripeFresh ? 'stripeOverlayCalibFresh' : 'stripeOverlayCalib';
            const t = 'all';
            const legacyDesignKey = normalizeOverlayDesignKeyFromSrcLegacyDrawings(overlaySrcForPreset);
            const legacyKey = (legacyDesignKey && legacyDesignKey !== 'none') ? `${base}_${t}_${legacyDesignKey}_v4` : '';
            const legacyRaw = legacyKey ? window.localStorage.getItem(legacyKey) : null;
            if (legacyRaw) {
              window.localStorage.setItem(overlayCalibrationStorageKeyEffective, legacyRaw);
              raw = legacyRaw;
              source = 'localStorage';
              keyUsed = legacyKey;
            }
          } catch {
            // ignore
          }
        }

        if (!raw) {
          try {
            const collectedRaw = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
            const collectedParsed = collectedRaw ? JSON.parse(collectedRaw) : null;
            const items = collectedParsed?.items && typeof collectedParsed.items === 'object' ? collectedParsed.items : null;
            const k = overlayCalibDesignKey || 'none';
            const found = items && k && typeof items[k] === 'object' ? items[k] : null;
            const ov = found?.overlay;
            if ((ov?.storageKey === overlayCalibrationStorageKeyEffective || ov?.storageKey === overlayCalibrationStorageKey || ov?.key === k)
              && typeof ov?.x === 'number' && Number.isFinite(ov.x)
              && typeof ov?.y === 'number' && Number.isFinite(ov.y)
              && typeof ov?.s === 'number' && Number.isFinite(ov.s)
            ) {
              const seed = JSON.stringify({ x: ov.x, y: ov.y, s: ov.s, u: 'svg' });
              window.localStorage.setItem(overlayCalibrationStorageKeyEffective, seed);
              raw = seed;
              source = 'collected';
              keyUsed = ov?.storageKey || overlayCalibrationStorageKeyEffective;
            }
          } catch {
            // ignore
          }
        }
        if (raw) {
          let parsed = JSON.parse(raw);
          try {
            const px = Number(parsed?.x);
            const py = Number(parsed?.y);
            const ps = Number(parsed?.s);
            const isDefault = Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(ps) && px === 0 && py === 0 && ps === 1;
            if (isDefault) {
              const collectedRaw = window.localStorage.getItem(COLLECTED_CALIB_STORAGE_KEY);
              const collectedParsed = collectedRaw ? JSON.parse(collectedRaw) : null;
              const items = collectedParsed?.items && typeof collectedParsed.items === 'object' ? collectedParsed.items : null;
              const k = overlayCalibDesignKey || 'none';
              const found = items && k && typeof items[k] === 'object' ? items[k] : null;
              const ov = found?.overlay;
              const ox = Number(ov?.x);
              const oy = Number(ov?.y);
              const os = Number(ov?.s);
              const canUse = ov?.storageKey === overlayCalibrationStorageKey
                && Number.isFinite(ox)
                && Number.isFinite(oy)
                && Number.isFinite(os)
                && !(ox === 0 && oy === 0 && os === 1);
              if (canUse) {
                parsed = { x: ox, y: oy, s: os, u: 'svg' };
                try {
                  window.localStorage.setItem(overlayCalibrationStorageKey, JSON.stringify(parsed));
                } catch {
                  // ignore
                }
              }
            }
          } catch {
            // ignore
          }

          {
            const x = Number(parsed?.x);
            const y = Number(parsed?.y);
            const s = Number(parsed?.s);
            if (Number.isFinite(x)) setStripeOverlayX(x);
            if (Number.isFinite(y)) setStripeOverlayY(y);
            if (Number.isFinite(s)) setStripeOverlayScale(s);
          }
          setOverlayCalibSource(source || 'localStorage');
          setOverlayCalibKeyUsed(keyUsed || overlayCalibrationStorageKeyEffective);
          overlayDirtyRef.current = false;
          overlayCalibLoadedOnceRef.current = true;
          return;
        }

        const hasExplicitOverlayParams = hasExplicitOverlayParamsRaw
          && !(
            Number.isFinite(stripeOverlayXParam) && stripeOverlayXParam === 0
            && Number.isFinite(stripeOverlayYParam) && stripeOverlayYParam === 0
            && Number.isFinite(stripeOverlayScaleParam) && stripeOverlayScaleParam === 1
          );

        if (!hasExplicitOverlayParams) {
          const presetOv = v4PresetForOverlayDesignKey?.ov;
          const x = (presetOv && typeof presetOv.x === 'number' && Number.isFinite(presetOv.x)) ? presetOv.x : v4CalibDefaults.ovX;
          const y = (presetOv && typeof presetOv.y === 'number' && Number.isFinite(presetOv.y)) ? presetOv.y : v4CalibDefaults.ovY;
          const s = (presetOv && typeof presetOv.s === 'number' && Number.isFinite(presetOv.s)) ? presetOv.s : v4CalibDefaults.ovS;
          setStripeOverlayX(x);
          setStripeOverlayY(y);
          setStripeOverlayScale(s);
          setOverlayCalibSource('preset');
          setOverlayCalibKeyUsed('');
          overlayCalibLoadedOnceRef.current = true;
          try {
            window.localStorage.setItem(
              overlayCalibrationStorageKeyEffective,
              JSON.stringify({ x, y, s, u: 'svg' }),
            );
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      } finally {
        overlayDirtyRef.current = false;
        overlayCalibLoadedOnceRef.current = true;
      }
      return;
    }

    try {
      let raw = window.localStorage.getItem(overlayCalibrationStorageKeyEffective);
      if (!raw && stripeV4Engine && overlayCalibDesignKey && overlayCalibDesignKey !== 'none') {
        try {
          const base = stripeFresh ? 'stripeOverlayCalibFresh' : 'stripeOverlayCalib';
          const t = 'all';
          const g = 'v4';
          const prevKey = `${base}_${t}_${overlayCalibDesignKey}_${g}`;
          const prevRaw = window.localStorage.getItem(prevKey);
          if (prevRaw) {
            window.localStorage.setItem(overlayCalibrationStorageKeyEffective, prevRaw);
            raw = prevRaw;
          }
        } catch {
          // ignore
        }
      }
      if (!raw) {
        const hasExplicitOverlayParams =
          urlParams?.has('stripeOverlayX') ||
          urlParams?.has('stripeOverlayY') ||
          urlParams?.has('stripeOverlayScale');

        if (stripeV4Engine && stripeCalibEnabled && !hasExplicitOverlayParams) {
          try {
            const x = overlayIsDrawings ? 0 : v4CalibDefaults.ovX;
            const y = overlayIsDrawings ? 0 : v4CalibDefaults.ovY;
            const s = overlayIsDrawings ? 1 : v4CalibDefaults.ovS;
            setStripeOverlayX(x);
            setStripeOverlayY(y);
            setStripeOverlayScale(s);
            try {
              window.localStorage.setItem(
                overlayCalibrationStorageKeyEffective,
                JSON.stringify({ x, y, s, u: 'svg' }),
              );
            } catch {
              // ignore
            }
            overlayDirtyRef.current = false;
            return;
          } catch {
            // ignore
          }
        }

        if (!stripeFresh) {
          const migrated = migrateOverlayCalibFromIndexedKeys({
            keyToWrite: overlayCalibrationStorageKeyEffective,
            designKey: overlayCalibStorageDesignKey,
            geoKey: stripeV4Engine ? 'v4' : (geometrySignature || 'nogeo'),
          });
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeOverlayX(parsedMigrated.x);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeOverlayY(parsedMigrated.y);
            if (typeof parsedMigrated?.s === 'number' && Number.isFinite(parsedMigrated.s)) setStripeOverlayScale(parsedMigrated.s);
            overlayDirtyRef.current = false;
            overlayCalibLoadedOnceRef.current = true;
            return;
          }
          const legacyRaw = window.localStorage.getItem(overlayCalibrationStorageKeyLegacyEffective);
          if (legacyRaw) {
            window.localStorage.setItem(overlayCalibrationStorageKey, legacyRaw);
            const parsedLegacy = JSON.parse(legacyRaw);
            if (typeof parsedLegacy?.x === 'number' && Number.isFinite(parsedLegacy.x)) setStripeOverlayX(parsedLegacy.x);
            else setStripeOverlayX(stripeOverlayXParam);
            if (typeof parsedLegacy?.y === 'number' && Number.isFinite(parsedLegacy.y)) setStripeOverlayY(parsedLegacy.y);
            else setStripeOverlayY(stripeOverlayYParam);
            if (typeof parsedLegacy?.s === 'number' && Number.isFinite(parsedLegacy.s)) setStripeOverlayScale(parsedLegacy.s);
            else setStripeOverlayScale(stripeOverlayScaleParam);
            overlayDirtyRef.current = false;
            return;
          }

          const legacyCandidates = [];
          if (overlaySrcForPreset) legacyCandidates.push(overlaySrcForPreset);
          if (overlaySrc) legacyCandidates.push(overlaySrc);
          if (typeof overlaySrcForPreset === 'string') {
            legacyCandidates.push(overlaySrcForPreset.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_stripe/'));
            legacyCandidates.push(overlaySrcForPreset.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_originals/stripe/'));
            legacyCandidates.push(overlaySrcForPreset.replace('/custom_logos/drawings/images_stripe/', '/custom_logos/drawings/images_grid/'));
            legacyCandidates.push(overlaySrcForPreset.replace('/custom_logos/drawings/images_stripe/', '/custom_logos/drawings/images_originals/stripe/'));



            const s = overlaySrcForPreset.toLowerCase();
            if (s.includes('/austen/crosswords/')) {
              const file = (s.split('/').pop() || '').replace(/\?.*$/, '');
              const m = file.match(/^(pride-and-prejudice|sense-and-sensibility|emma|persuasion|northanger-abbey|mansfield-park)-\d+\.(webp|png)$/i);
              if (m) {
                const folder = m[1].replace(/-/g, '_');
                const withSubfolder = overlaySrcForPreset
                  .replace('/custom_logos/drawings/images_grid/austen/crosswords/', `/custom_logos/drawings/images_originals/stripe/austen/crosswords/${folder}/`);
                legacyCandidates.push(withSubfolder);
                legacyCandidates.push(withSubfolder.replace('/custom_logos/drawings/images_originals/stripe/', '/custom_logos/drawings/images_stripe/'));
              }
            }
          }
          if (typeof overlaySrc === 'string') {
            legacyCandidates.push(overlaySrc.replace('/placeholders/images_grid/', '/custom_logos/drawings/images_grid/'));
            legacyCandidates.push(overlaySrc.replace('/placeholders/images_grid/', '/custom_logos/drawings/images_stripe/'));
            legacyCandidates.push(overlaySrc.replace('/placeholders/images_grid/', '/custom_logos/drawings/images_originals/stripe/'));
          }

          const uniqueCandidates = Array.from(new Set(legacyCandidates.filter(Boolean).map((v) => v.toString())));
          for (const candidateSrc of uniqueCandidates) {
            const candidateKey = getOverlayCalibrationStorageKeyLegacyFromSrc({
              src: candidateSrc,
              geometrySignature,
            });
            if (!candidateKey) continue;
            const candidateRaw = window.localStorage.getItem(candidateKey);
            if (!candidateRaw) continue;
            window.localStorage.setItem(overlayCalibrationStorageKey, candidateRaw);
            const parsedCandidate = JSON.parse(candidateRaw);
            if (typeof parsedCandidate?.x === 'number' && Number.isFinite(parsedCandidate.x)) setStripeOverlayX(parsedCandidate.x);
            else setStripeOverlayX(stripeOverlayXParam);
            if (typeof parsedCandidate?.y === 'number' && Number.isFinite(parsedCandidate.y)) setStripeOverlayY(parsedCandidate.y);
            else setStripeOverlayY(stripeOverlayYParam);
            if (typeof parsedCandidate?.s === 'number' && Number.isFinite(parsedCandidate.s)) setStripeOverlayScale(parsedCandidate.s);
            else setStripeOverlayScale(stripeOverlayScaleParam);
            overlayDirtyRef.current = false;
            return;
          }
        }

        const austenCrosswordsPreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-3.')
            || s.includes('/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-3.')
            || s.includes('/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-3.')
            || s.includes('/custom_logos/drawings/images_originals/stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-3-')
            || s.includes('/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-3-')
            || s.includes('/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-3-')
          ) {
            return { x: 105.317, y: 16.951, s: 0.54, u: 'svg' };
          }

          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/crosswords/pride_and_prejudice/')
            || s.includes('/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-')
            || s.includes('/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-')
          ) {
            return { x: 117.241, y: 52.785, s: 0.395, u: 'svg' };
          }

          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/crosswords/')
            || s.includes('/custom_logos/drawings/images_grid/austen/crosswords/')
            || s.includes('/custom_logos/drawings/images_stripe/austen/crosswords/')
          ) {
            return { x: 117.241, y: 48.803, s: 0.395, u: 'svg' };
          }
          return null;
        })();

        const austenDarcyFramePreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/frame/')
            || s.includes('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')
          ) {
            if (s.includes('-frame.')) return { x: 105.321, y: -10.919, s: 0.565, u: 'svg' };
          }
          return null;
        })();

        const austenDarcyTextPreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/')
            || s.includes('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')
            || s.includes('/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/')
          ) {
            if (!s.includes('-frame.')) return { x: 109.295, y: -0.964, s: 0.51, u: 'svg' };
          }
          return null;
        })();

        const austenQuotesPreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (!s.includes('/austen/quotes/')) return null;
          if (s.includes('it-is-a-truth')) return { x: 125.193, y: 5.009, s: 0.41, u: 'svg' };
          if (s.includes('you-must-allow-me')) return { x: 125.193, y: 7, s: 0.39, u: 'svg' };
          if (s.includes('body-and-soul') || s.includes('you-have-bewiched-me')) return { x: 115.258, y: -52.714, s: 0.58, u: 'svg' };
          if (s.includes('unsociable-and-taciturn') || s.includes('i-presfer-to-be')) {
            return { x: 115.258, y: -44.758, s: 0.55, u: 'svg' };
          }
          if (s.includes('half-agony-half-hope')) return { x: 117.245, y: -24.844, s: 0.495, u: 'svg' };
          return null;
        })();

        const austenPemberleyHousePreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/pemberley_house/')
            || s.includes('/custom_logos/drawings/images_grid/austen/pemberley_house/')
            || s.includes('/custom_logos/drawings/images_stripe/austen/pemberley_house/')
          ) {
            return { x: 107.308, y: 10.982, s: 0.55, u: 'svg' };
          }
          return null;
        })();

        const austenKeepCalmPreset = (() => {
          const s = typeof overlaySrcForPreset === 'string' ? overlaySrcForPreset.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/images_originals/stripe/austen/keep_calm/')
            || s.includes('/custom_logos/drawings/images_grid/austen/keep_calm/')
            || s.includes('/custom_logos/drawings/images_stripe/austen/keep_calm/')
          ) {
            if (s.includes('/multi/')) return { x: 125.195, y: 56.763, s: 0.35, u: 'svg' };
            if (s.includes('/black/')) return { x: 125.193, y: 56.767, s: 0.35, u: 'svg' };
          }
          return null;
        })();

        const preset = austenCrosswordsPreset
          || austenDarcyFramePreset
          || austenDarcyTextPreset
          || austenQuotesPreset
          || austenPemberleyHousePreset
          || austenKeepCalmPreset
          || getFirstContactOverlayPreset(overlaySrcForPreset)
          || getTheHumanInsideOverlayPreset(overlaySrcForPreset)
          || getCubeOverlayPreset(overlaySrcForPreset)
          || getOutcastedOverlayPreset(overlaySrcForPreset);
        if (preset && typeof preset === 'object') {
          const x = (typeof preset.x === 'number' && Number.isFinite(preset.x)) ? preset.x : stripeOverlayXParam;
          const y = (typeof preset.y === 'number' && Number.isFinite(preset.y)) ? preset.y : stripeOverlayYParam;
          const s = (typeof preset.s === 'number' && Number.isFinite(preset.s)) ? preset.s : stripeOverlayScaleParam;
          setStripeOverlayX(x);
          setStripeOverlayY(y);
          setStripeOverlayScale(s);
        } else {
          setStripeOverlayX(stripeOverlayXParam);
          setStripeOverlayY(stripeOverlayYParam);
          setStripeOverlayScale(stripeOverlayScaleParam);
        }
        overlayDirtyRef.current = false;
        return;
      }
      const parsed = JSON.parse(raw);
      const presetDefault = (
        getFirstContactOverlayPreset(overlaySrcForPreset)
        || getTheHumanInsideOverlayPreset(overlaySrcForPreset)
        || getCubeOverlayPreset(overlaySrcForPreset)
        || getOutcastedOverlayPreset(overlaySrcForPreset)
      );
      const defaultX = (presetDefault && typeof presetDefault.x === 'number' && Number.isFinite(presetDefault.x)) ? presetDefault.x : stripeOverlayXParam;
      const defaultY = (presetDefault && typeof presetDefault.y === 'number' && Number.isFinite(presetDefault.y)) ? presetDefault.y : stripeOverlayYParam;
      const defaultS = (presetDefault && typeof presetDefault.s === 'number' && Number.isFinite(presetDefault.s)) ? presetDefault.s : stripeOverlayScaleParam;

      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeOverlayX(parsed.x);
      else setStripeOverlayX(defaultX);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeOverlayY(parsed.y);
      else setStripeOverlayY(defaultY);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeOverlayScale(parsed.s);
      else setStripeOverlayScale(defaultS);
      overlayDirtyRef.current = false;
    } catch {
      setStripeOverlayX(stripeOverlayXParam);
      setStripeOverlayY(stripeOverlayYParam);
      setStripeOverlayScale(stripeOverlayScaleParam);
      overlayDirtyRef.current = false;
    }
  }, [
    geometrySignature,
    getOverlayCalibrationStorageKeyLegacyFromSrc,
    overlayCalibDesignKey,
    overlayCalibStorageDesignKey,
    overlayCalibrationStorageKey,
    overlayCalibrationStorageKeyLegacy,
    overlaySrc,
    overlaySrcForPreset,
    overlaySrcForRender,
    stripeFresh,
    stripeOverlayScaleParam,
    stripeOverlayXParam,
    stripeOverlayYParam,
    stripeCalibEnabled,
    stripeV4Engine,
    urlParams,
    v4CalibDefaults,
  ]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    if (!stripeRefTile1) return;
    if (!stripeRef2DirtyRef.current) return;
    try {
      window.localStorage.setItem(
        calibrationStorageKeyRef2,
        JSON.stringify({ x: stripeRef2X, y: stripeRef2Y, s: stripeRef2Scale }),
      );
    } catch {
      // ignore
    }
  }, [
    calibrationStorageKeyRef2,
    stripeFresh,
    stripeRef2Scale,
    stripeRef2X,
    stripeRef2Y,
    stripeRefMockupSrc,
    stripeRefTile1,
  ]);

  const persistOverlayCalibrationNow = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      if (!(overlaySrc || overlaySrcForRender)) return;
      if (!overlayCalibrationStorageKeyEffective) return;
      window.localStorage.setItem(
        overlayCalibrationStorageKeyEffective,
        JSON.stringify({ x: stripeOverlayX, y: stripeOverlayY, s: stripeOverlayScale, u: 'svg' }),
      );
    } catch {
      // ignore
    }
  }, [overlayCalibrationStorageKeyEffective, overlaySrc, overlaySrcForRender, stripeOverlayScale, stripeOverlayX, stripeOverlayY]);

  const persistRefCalibrationNow = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      if (!stripeRefMockupSrc) return;
      if (!calibrationStorageKey) return;
      window.localStorage.setItem(
        calibrationStorageKey,
        JSON.stringify({ v: 2, x: stripeRefX, y: stripeRefY, scale: stripeRefScale, s: stripeRefScale }),
      );
    } catch {
      // ignore
    }
  }, [calibrationStorageKey, stripeRefMockupSrc, stripeRefScale, stripeRefX, stripeRefY]);

  const persistRef2CalibrationNow = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      if (!stripeRefMockupSrc) return;
      if (!stripeRefTile1) return;
      if (!calibrationStorageKeyRef2) return;
      window.localStorage.setItem(
        calibrationStorageKeyRef2,
        JSON.stringify({ x: stripeRef2X, y: stripeRef2Y, s: stripeRef2Scale }),
      );
    } catch {
      // ignore
    }
  }, [calibrationStorageKeyRef2, stripeRef2Scale, stripeRef2X, stripeRef2Y, stripeRefMockupSrc, stripeRefTile1]);

  const persistV4OverlayTilesNow = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      if (!stripeV4Engine) return;
      if (!v4OverlayTilesStorageKey) return;
      window.localStorage.setItem(
        v4OverlayTilesStorageKey,
        JSON.stringify({ pitchX: v4OverlayPitchXLive, w: v4OverlayWLive, x0: v4OverlayX0Live }),
      );
      v4OverlayTilesDirtyRef.current = false;
    } catch {
      // ignore
    }
  }, [stripeV4Engine, v4OverlayPitchXLive, v4OverlayTilesStorageKey, v4OverlayWLive, v4OverlayX0Live]);

  useEffect(() => {
    if (!stripeCalibEnabled) return;
    if (!overlayCalibDesignKey || overlayCalibDesignKey === 'none') return;

    if (stripeV4Engine && !overlayCalibLoadedOnceRef.current && !overlayDirtyRef.current) return;

    try {
      const k = overlayCalibDesignKey;
      const next = {
        ts: new Date().toISOString(),
        overlay: {
          src: overlaySrcForRender || overlaySrc || null,
          key: overlayCalibDesignKey,
          x: stripeOverlayX,
          y: stripeOverlayY,
          s: stripeOverlayScale,
          storageKey: overlayCalibrationStorageKeyEffective || null,
        },
        v4Tiles: stripeV4Engine ? {
          pitchX: v4OverlayPitchXLive,
          w: v4OverlayWLive,
          x0: v4OverlayX0Live,
          storageKey: v4OverlayTilesStorageKey || null,
        } : null,
        ref: stripeRefMockupSrc ? {
          mockup: stripeRefMockupSrc,
          x: stripeRefX,
          y: stripeRefY,
          s: stripeRefScale,
          storageKey: calibrationStorageKey || null,
        } : null,
        ref2: (stripeRefMockupSrc && stripeRefTile1) ? {
          x: stripeRef2X,
          y: stripeRef2Y,
          s: stripeRef2Scale,
          storageKey: calibrationStorageKeyRef2 || null,
        } : null,
      };

      const prevAll = calibCollectedRef.current && typeof calibCollectedRef.current === 'object'
        ? calibCollectedRef.current
        : {};

      const nextOvX = Number(next?.overlay?.x);
      const nextOvY = Number(next?.overlay?.y);
      const nextOvS = Number(next?.overlay?.s);
      const nextIsDefaultOv = Number.isFinite(nextOvX) && Number.isFinite(nextOvY) && Number.isFinite(nextOvS)
        && nextOvX === 0 && nextOvY === 0 && nextOvS === 1;

      const prev = prevAll?.[k] && typeof prevAll[k] === 'object' ? prevAll[k] : null;
      const prevOvX = Number(prev?.overlay?.x);
      const prevOvY = Number(prev?.overlay?.y);
      const prevOvS = Number(prev?.overlay?.s);
      const prevIsDefaultOv = Number.isFinite(prevOvX) && Number.isFinite(prevOvY) && Number.isFinite(prevOvS)
        && prevOvX === 0 && prevOvY === 0 && prevOvS === 1;

      if (stripeV4Engine && nextIsDefaultOv && !overlayDirtyRef.current) {
        if (prev && !prevIsDefaultOv) {
          calibCollectedRef.current = prevAll;
          return;
        }
        return;
      }

      calibCollectedRef.current = { ...prevAll, [k]: next };

      try {
        persistCollectedCalibrationNow();
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }, [
    calibrationStorageKey,
    calibrationStorageKeyRef2,
    overlayCalibDesignKey,
    overlayCalibrationStorageKey,
    overlaySrc,
    overlaySrcForRender,
    persistCollectedCalibrationNow,
    stripeCalibEnabled,
    stripeOverlayScale,
    stripeOverlayX,
    stripeOverlayY,
    stripeRef2Scale,
    stripeRef2X,
    stripeRef2Y,
    stripeRefMockupSrc,
    stripeRefScale,
    stripeRefTile1,
    stripeRefX,
    stripeRefY,
    stripeV4Engine,
    v4OverlayPitchXLive,
    v4OverlayTilesStorageKey,
    v4OverlayWLive,
    v4OverlayX0Live,
  ]);

  useEffect(() => {
    if (!(overlaySrc || overlaySrcForRender)) return;
    if (!stripeV4Engine && !overlayDirtyRef.current) return;
    if (stripeV4Engine && !overlayCalibLoadedOnceRef.current && !overlayDirtyRef.current) return;
    if (stripeV4Engine && stripeCalibEnabled) {
      persistOverlayCalibrationNow();
      return;
    }
    try {
      persistOverlayCalibrationNow();
    } catch {
      // ignore
    }
  }, [
    overlayCalibrationStorageKey,
    overlaySrc,
    stripeCalibEnabled,
    stripeFresh,
    stripeOverlayScale,
    stripeOverlayX,
    stripeOverlayY,
    stripeV4Engine,
    overlaySrcForRender,
  ]);

  useEffect(() => {
    if (!stripeV4Engine) return;
    if (!stripeCalibEnabled) return;
    if (!(overlaySrc || overlaySrcForRender)) return;

    if (!overlayCalibLoadedOnceRef.current && !overlayDirtyRef.current) return;

    const flush = () => {
      persistOverlayCalibrationNow();
    };

    try {
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', flush);
    } catch {
      // ignore
    }

    return () => {
      try {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', flush);
      } catch {
        // ignore
      }
    };
  }, [overlayCalibrationStorageKey, overlaySrc, overlaySrcForRender, persistOverlayCalibrationNow, stripeCalibEnabled, stripeV4Engine]);

  useEffect(() => {
    if (!stripeCalibEnabled) return;
    if (!stripeRefMockupSrc) return;

    const flush = () => {
      persistRefCalibrationNow();
      persistRef2CalibrationNow();
    };

    try {
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', flush);
    } catch {
      // ignore
    }

    return () => {
      try {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', flush);
      } catch {
        // ignore
      }
    };
  }, [persistRef2CalibrationNow, persistRefCalibrationNow, stripeCalibEnabled, stripeRefMockupSrc]);

  useEffect(() => {
    if (!stripeV4Engine) return;
    if (!stripeCalibEnabled) return;
    if (!v4OverlayTilesStorageKey) return;
    if (!v4OverlayTilesDirtyRef.current) return;
    persistV4OverlayTilesNow();
  }, [
    persistV4OverlayTilesNow,
    stripeCalibEnabled,
    stripeV4Engine,
    v4OverlayPitchXLive,
    v4OverlayTilesStorageKey,
    v4OverlayWLive,
    v4OverlayX0Live,
  ]);

  useEffect(() => {
    if (!stripeV4Engine) return;
    if (!stripeCalibEnabled) return;
    if (!v4OverlayTilesStorageKey) return;

    const flush = () => {
      if (!v4OverlayTilesDirtyRef.current) return;
      persistV4OverlayTilesNow();
    };

    try {
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', flush);
    } catch {
      // ignore
    }

    return () => {
      try {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', flush);
      } catch {
        // ignore
      }
    };
  }, [persistV4OverlayTilesNow, stripeCalibEnabled, stripeV4Engine, v4OverlayTilesStorageKey]);

  useEffect(() => {
    if (!stripeV3) return;
    if (!overlaySrc) return;
    if (stripeV3OverlayUnitsMigratedRef.current) return;
    const m = stripeV3OverlayInvM;
    if (!m || !Number.isFinite(m.a) || !Number.isFinite(m.b) || !Number.isFinite(m.c) || !Number.isFinite(m.d)) return;

    try {
      const raw = window.localStorage.getItem(overlayCalibrationStorageKey);
      if (!raw) {
        stripeV3OverlayUnitsMigratedRef.current = true;
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        stripeV3OverlayUnitsMigratedRef.current = true;
        return;
      }
      if (parsed.u === 'svg') {
        stripeV3OverlayUnitsMigratedRef.current = true;
        return;
      }

      const x = (typeof parsed.x === 'number' && Number.isFinite(parsed.x)) ? parsed.x : stripeOverlayX;
      const y = (typeof parsed.y === 'number' && Number.isFinite(parsed.y)) ? parsed.y : stripeOverlayY;
      const dx = (x * m.a) + (y * m.c);
      const dy = (x * m.b) + (y * m.d);
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        const nextX = Number(dx.toFixed(3));
        const nextY = Number(dy.toFixed(3));
        setStripeOverlayX(nextX);
        setStripeOverlayY(nextY);
        try {
          window.localStorage.setItem(
            overlayCalibrationStorageKey,
            JSON.stringify({ x: nextX, y: nextY, s: (typeof parsed.s === 'number' && Number.isFinite(parsed.s)) ? parsed.s : stripeOverlayScale, u: 'svg' }),
          );
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    } finally {
      stripeV3OverlayUnitsMigratedRef.current = true;
    }
  }, [overlayCalibrationStorageKey, overlaySrc, stripeFresh, stripeOverlayX, stripeOverlayY, stripeV3, stripeV3OverlayInvM]);

  useEffect(() => {
    if (!stripeCalibEnabled) return;

    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = typeof document !== 'undefined' ? document.activeElement : null;
      const tag = el && typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
      const isTypingTarget =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (el && typeof el.isContentEditable === 'boolean' && el.isContentEditable);
      if (isTypingTarget) return;

      const applyUrlParam = (key, value) => {
        try {
          if (typeof window === 'undefined') return;
          const url = new URL(window.location.href);
          if (value === '' || value === null || typeof value === 'undefined') url.searchParams.delete(key);
          else url.searchParams.set(key, String(value));
          window.history.replaceState({}, '', url.toString());
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch {
          // ignore
        }
      };

      const readUrlNumber = (key, fallback) => {
        try {
          if (typeof window === 'undefined') return fallback;
          const url = new URL(window.location.href);
          const raw = url.searchParams.get(key);
          const n = Number.parseFloat(raw);
          return Number.isFinite(n) ? n : fallback;
        } catch {
          return fallback;
        }
      };

      const isMaskNudge = stripeV4Engine && debugV4MaskOutlines;
      const isHitNudge = stripeV4Engine && debugStripeHitEffective;

      const isModeSwitchKey =
        e.key === 'Tab' ||
        e.key === 'r' || e.key === 'R' ||
        e.key === 'o' || e.key === 'O' ||
        e.key === '2' ||
        e.key === 't' || e.key === 'T';
      if (isModeSwitchKey && !stripeCalibHudArmed) return;

      const isV4TileNudgeKey =
        e.key === ',' || e.key === '<' ||
        e.key === '.' || e.key === '>' ||
        e.key === '[' ||
        e.key === ']' ||
        e.key === ';' ||
        e.key === '\'' ||
        e.key === 'n' || e.key === 'N' ||
        e.key === 'm' || e.key === 'M' ||
        e.key === 'j' || e.key === 'J' ||
        e.key === 'k' || e.key === 'K' ||
        e.key === 'u' || e.key === 'U' ||
        e.key === 'i' || e.key === 'I';
      if (isV4TileNudgeKey && stripeV4Engine) {
        e.preventDefault();
        const d = e.shiftKey ? 5 : 0.5;
        if (e.key === ',' || e.key === '<' || e.key === 'n' || e.key === 'N') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayPitchXLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) - d).toFixed(3)));
          return;
        }
        if (e.key === '.' || e.key === '>' || e.key === 'm' || e.key === 'M') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayPitchXLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) + d).toFixed(3)));
          return;
        }
        if (e.key === '[' || e.key === 'u' || e.key === 'U') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayWLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) - d).toFixed(3)));
          return;
        }
        if (e.key === ']' || e.key === 'i' || e.key === 'I') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayWLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) + d).toFixed(3)));
          return;
        }
        if (e.key === ';' || e.key === 'j' || e.key === 'J') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayX0Live((v) => Number(((Number.isFinite(v) ? v : 0) - d).toFixed(3)));
          return;
        }
        if (e.key === '\'' || e.key === 'k' || e.key === 'K') {
          v4OverlayTilesDirtyRef.current = true;
          setV4OverlayX0Live((v) => Number(((Number.isFinite(v) ? v : 0) + d).toFixed(3)));
          return;
        }
      }

      if (isHitNudge && (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' || e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const hitStep = e.shiftKey ? 10 : 1;
        const curDx = readUrlNumber('v4HitDx', Number(stripeV4HitDxPx) || 0);
        const curDy = readUrlNumber('v4HitDy', Number(stripeV4HitDyPx) || 0);
        if (e.key === 'a' || e.key === 'A') {
          const next = Number((curDx - hitStep).toFixed(3));
          applyUrlParam('v4HitDx', next);
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          const next = Number((curDx + hitStep).toFixed(3));
          applyUrlParam('v4HitDx', next);
          return;
        }
        if (e.key === 'w' || e.key === 'W') {
          const next = Number((curDy - hitStep).toFixed(3));
          applyUrlParam('v4HitDy', next);
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          const next = Number((curDy + hitStep).toFixed(3));
          applyUrlParam('v4HitDy', next);
          return;
        }
      }

      if (isMaskNudge && (e.key === 'g' || e.key === 'G' || e.key === 'h' || e.key === 'H' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        const maskStep = e.shiftKey ? 5 : 0.5;
        if (e.key === 'g' || e.key === 'G') {
          const next = Number(((Number(v4MaskPitchXParam) || stripeV4HitStepX) - maskStep).toFixed(3));
          applyUrlParam('v4MaskPitchX', next);
          return;
        }
        if (e.key === 'h' || e.key === 'H') {
          const next = Number(((Number(v4MaskPitchXParam) || stripeV4HitStepX) + maskStep).toFixed(3));
          applyUrlParam('v4MaskPitchX', next);
          return;
        }
        if (e.key === 'c' || e.key === 'C') {
          const next = Number(((Number(v4MaskX0Param) || 0) - maskStep).toFixed(3));
          applyUrlParam('v4MaskX0', next);
          return;
        }
        if (e.key === 'v' || e.key === 'V') {
          const next = Number(((Number(v4MaskX0Param) || 0) + maskStep).toFixed(3));
          applyUrlParam('v4MaskX0', next);
          return;
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        setStripeCalibMode((m) => {
          if (m === 'ref') return 'overlay';
          if (m === 'overlay') return 'ref2';
          if (m === 'ref2') return 'tiles';
          return 'ref';
        });
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        setStripeCalibMode('ref');
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        setStripeCalibMode('overlay');
        return;
      }
      if (e.key === '2') {
        setStripeCalibMode('ref2');
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        setStripeCalibMode('tiles');
        return;
      }

      if ((e.key === 'a' || e.key === 'A') && stripeCalibMode === 'tiles') {
        const anchorIdx = (() => {
          if (Number.isFinite(stripeRefTargetIndex) && stripeRefTargetIndex >= 1 && stripeRefTargetIndex <= 14) return stripeRefTargetIndex - 1;
          if (stripeRefTargetSlug) {
            const found = (items || []).findIndex((s) => s === stripeRefTargetSlug);
            if (found >= 0) return found;
          }
          return 8;
        })();
        const currentLeftX = (v3TileAnchorXLive + (v3TileStepXLive * (anchorIdx - v3TileAnchorIndexLive))) + v3TileX0Live;
        setV3TileAnchorIndexLive(anchorIdx);
        setV3TileAnchorXLive(currentLeftX - v3TileX0Live);
        v3TilesDirtyRef.current = true;
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      const isOverlay = stripeCalibMode === 'overlay';
      const isRef2 = stripeCalibMode === 'ref2';
      const isTiles = stripeCalibMode === 'tiles';
      const tileStepDelta = e.shiftKey ? 0.5 : 0.05;
      const tileWDelta = e.shiftKey ? 0.5 : 0.05;
      const nudgePx = (e.shiftKey ? 10 : 1);

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isTiles) {
          if (stripeV4Engine) {
            v4OverlayTilesDirtyRef.current = true;
            setV4OverlayPitchXLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) - tileStepDelta).toFixed(3)));
          } else {
            v3TilesDirtyRef.current = true;
            setV3TileStepXLive((v) => Number((v - tileStepDelta).toFixed(3)));
          }
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? (((-step) * m.a) + (0 * m.c)) : (-step);
          const dySvg = m ? (((-step) * m.b) + (0 * m.d)) : 0;
          setStripeOverlayX((v) => Number((v + dxSvg).toFixed(3)));
          setStripeOverlayY((v) => Number((v + dySvg).toFixed(3)));
        }
        else if (isRef2) {
          stripeRef2DirtyRef.current = true;
          setStripeRef2X((v) => v - step);
        }
        else setStripeRefX((v) => v - step);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isTiles) {
          if (stripeV4Engine) {
            v4OverlayTilesDirtyRef.current = true;
            setV4OverlayPitchXLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) + tileStepDelta).toFixed(3)));
          } else {
            v3TilesDirtyRef.current = true;
            setV3TileStepXLive((v) => Number((v + tileStepDelta).toFixed(3)));
          }
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? (((step) * m.a) + (0 * m.c)) : step;
          const dySvg = m ? (((step) * m.b) + (0 * m.d)) : 0;
          setStripeOverlayX((v) => Number((v + dxSvg).toFixed(3)));
          setStripeOverlayY((v) => Number((v + dySvg).toFixed(3)));
        }
        else if (isRef2) {
          stripeRef2DirtyRef.current = true;
          setStripeRef2X((v) => v + step);
        }
        else setStripeRefX((v) => v + step);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isTiles) {
          if (stripeV4Engine) {
            v4OverlayTilesDirtyRef.current = true;
            setV4OverlayWLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) + tileWDelta).toFixed(3)));
          } else {
            v3TilesDirtyRef.current = true;
            setV3TileWLive((v) => Number((v + tileWDelta).toFixed(3)));
          }
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? ((0 * m.a) + ((-step) * m.c)) : 0;
          const dySvg = m ? ((0 * m.b) + ((-step) * m.d)) : (-step);
          setStripeOverlayX((v) => Number((v + dxSvg).toFixed(3)));
          setStripeOverlayY((v) => Number((v + dySvg).toFixed(3)));
        }
        else if (isRef2) {
          stripeRef2DirtyRef.current = true;
          setStripeRef2Y((v) => v - step);
        }
        else setStripeRefY((v) => v - step);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isTiles) {
          if (stripeV4Engine) {
            v4OverlayTilesDirtyRef.current = true;
            setV4OverlayWLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) - tileWDelta).toFixed(3)));
          } else {
            v3TilesDirtyRef.current = true;
            setV3TileWLive((v) => Number((v - tileWDelta).toFixed(3)));
          }
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? ((0 * m.a) + ((step) * m.c)) : 0;
          const dySvg = m ? ((0 * m.b) + ((step) * m.d)) : step;
          setStripeOverlayX((v) => Number((v + dxSvg).toFixed(3)));
          setStripeOverlayY((v) => Number((v + dySvg).toFixed(3)));
        }
        else if (isRef2) {
          stripeRef2DirtyRef.current = true;
          setStripeRef2Y((v) => v + step);
        }
        else setStripeRefY((v) => v + step);
        return;
      }

      if (e.key === '+' || e.key === '=' || e.key === '-') {
        e.preventDefault();
        const delta = e.key === '-' ? -0.005 : 0.005;
        if (isTiles) {
          if (stripeV4Engine) {
            v4OverlayTilesDirtyRef.current = true;
            setV4OverlayWLive((v) => Number(((Number.isFinite(v) ? v : stripeV4HitStepX) + (e.key === '-' ? -tileWDelta : tileWDelta)).toFixed(3)));
          } else {
            v3TilesDirtyRef.current = true;
            setV3TileWLive((v) => Number((v + (e.key === '-' ? -tileWDelta : tileWDelta)).toFixed(3)));
          }
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          setStripeOverlayScale((v) => Number((v + delta).toFixed(4)));
        }
        else if (isRef2) {
          stripeRef2DirtyRef.current = true;
          setStripeRef2Scale((v) => Number((v + delta).toFixed(3)));
        }
        else setStripeRefScale((v) => Number((v + delta).toFixed(3)));
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [debugStripeHitEffective, debugV4MaskOutlines, overlaySrc, stripeCalibEnabled, stripeCalibHudArmed, stripeCalibMode, stripeRefMockupSrc, stripeV3OverlayInvM, stripeV4ClipDxPx, stripeV4ClipDyPx, stripeV4Engine, v4ClipLock, v4UnionMaskScaleX, v4UnionMaskScaleY]);

  useLayoutEffect(() => {
    if (!stripeV3) {
      setStripeV3OverlayInvM(null);
      return undefined;
    }
    const update = () => {
      try {
        const el = stripeV3HitSvgRef.current;
        if (!el || typeof el.getScreenCTM !== 'function') return;
        const ctm = el.getScreenCTM();
        if (!ctm || typeof ctm.inverse !== 'function') return;
        const inv = ctm.inverse();
        const next = {
          a: inv.a,
          b: inv.b,
          c: inv.c,
          d: inv.d,
        };
        if (!Number.isFinite(next.a) || !Number.isFinite(next.b) || !Number.isFinite(next.c) || !Number.isFinite(next.d)) return;
        setStripeV3OverlayInvM((prev) => {
          if (prev && prev.a === next.a && prev.b === next.b && prev.c === next.c && prev.d === next.d) return prev;
          return next;
        });
      } catch {
        // ignore
      }
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('focus', update);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    try {
      vv?.addEventListener?.('resize', update);
      vv?.addEventListener?.('scroll', update);
    } catch {
      // ignore
    }

    const pollId = window.setInterval(update, 500);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('focus', update);
      try {
        vv?.removeEventListener?.('resize', update);
        vv?.removeEventListener?.('scroll', update);
      } catch {
        // ignore
      }

      window.clearInterval(pollId);
    };
  }, [stripeV3]);

  useLayoutEffect(() => {
    setStripeV3SpriteW(null);
    return undefined;
  }, [stripeV3]);

  useEffect(() => {
    if (!megaTileSize) return;
    if (effectiveItems.length === 0) return;

    const el = selectedTileRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSelectedTileSize({ w: rect.width, h: rect.height });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [effectiveItems.length, megaTileSize, selectedColorSlug]);

  useLayoutEffect(() => {
    if (!stripeRootRef.current) return;
    const el = stripeRootRef.current;
    const update = () => {
      const r = el.getBoundingClientRect?.();
      const w = (r && Number.isFinite(r.width) ? r.width : (el.clientWidth || 0));
      setStripeW(w);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [megaTileSize, effectiveItems.length]);

  const containerH = megaTileSize;

  useEffect(() => {
    if (!megaTileSize) return;
    if (effectiveItems.length === 0) return;
    if (!selectedTileSize.w || !selectedTileSize.h) return;

    if (stripeRecalibrate || !dotCalibrationRef.current) {
      dotCalibrationRef.current = {
        rx: stripeDotXPx / selectedTileSize.w,
        ry: stripeDotYPx / selectedTileSize.h,
      };
    }
  }, [effectiveItems.length, megaTileSize, selectedTileSize.w, selectedTileSize.h, stripeDotXPx, stripeDotYPx, stripeRecalibrate]);

  if (!megaTileSize) return null;
  if (effectiveItems.length === 0) return null;

  const snapPx = (v) => v;

  const dprNow = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const snapToDevicePx = (v) => {
    if (!Number.isFinite(v)) return v;
    const d = Number.isFinite(dprNow) && dprNow > 0 ? dprNow : 1;
    return Math.round(v * d) / d;
  };

  const imageAspect = 161 / 145;
  const refMegaTileSize = 360;
  const refButtonW = Math.round(refMegaTileSize * imageAspect);
  const buttonW = megaTileSize * imageAspect;
  const stripeWVirtual = Math.max(
    0,
    stripeW - (stripeV2 ? stripeV2ViewportExtendLeftPx : 0) + (stripeV2 ? stripeV2ViewportTrimRightPx : 0)
  );
  const baseOverlap = megaTileSize * 0.36;
  const baseStep = Math.max(0, buttonW - baseOverlap);
  const step = baseStep * compressFactor;
  const lastIdx = 13;
  const offsetLast = Number.isFinite(itemLeftOffsetPxByIndex?.[lastIdx]) ? itemLeftOffsetPxByIndex[lastIdx] : 0;
  const computedLastOffsetPx =
    autoAlignLastToRight && stripeWVirtual > 0
      ? (stripeWVirtual - (firstOffsetPx + lastIdx * step + offsetLast + buttonW))
      : lastOffsetPx;
  const computedLastOffsetPxEffective = stripeV2 && stripeV2LiveFit && Number.isFinite(stripeV2LiveFit.lastOffsetPx)
    ? stripeV2LiveFit.lastOffsetPx
    : computedLastOffsetPx;

  const stripeV2CenterOffsetXPx = (() => {
    try {
      if (!stripeV2 || !stripeV2Sprite) return 0;
      if (!(stripeWVirtual > 0)) return 0;

      const tile1ExtendLeftPx = 20;
      const left0 = stripeV2InsetLeftPx + firstOffsetPx + firstTileExtraOffsetPx + 2.75;
      const leftLast = (stripeWVirtual - stripeV2InsetRightPx) - buttonW - computedLastOffsetPxEffective + lastTileExtraOffsetPx;
      if (!Number.isFinite(leftLast)) return 0;

      const minLeft = left0 - tile1ExtendLeftPx;
      const maxRight = leftLast + buttonW;
      const contentW = maxRight - minLeft;
      if (!Number.isFinite(contentW) || contentW <= 0) return 0;

      const desiredMinLeft = (stripeWVirtual - contentW) / 2;
      const dx = desiredMinLeft - minLeft;
      return Number.isFinite(dx) ? dx : 0;
    } catch {
      return 0;
    }
  })();
  const stripeV2AnchorXPx = stripeWVirtual > 0
    ? (stripeWVirtual - stripeV2InsetRightPx) - computedLastOffsetPxEffective + lastTileExtraOffsetPx + stripeV2PivotOffsetXPx
    : null;
  const stepEq = step + computedLastOffsetPxEffective / 13;
  const hitW = Math.max(1, stepEq);
  const cropRightPx = Math.max(0, Math.round(cropFirstRightPx));

  const rotatePoint = (x, y, rad) => {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  };

  const t2ScaleX = refButtonW === 0 ? 1 : buttonW / refButtonW;
  const t2ScaleY = refMegaTileSize === 0 ? 1 : megaTileSize / refMegaTileSize;

  const scaleT2X = (v) => Math.round(v * t2ScaleX);
  const scaleT2Y = (v) => Math.round(v * t2ScaleY);
  const defaultT2OffsetXPx = 2;

  const defaultT2Pieces = [
    { n: 1, x: scaleT2X(-114) + defaultT2OffsetXPx, y: scaleT2Y(6), deg: 25, w: scaleT2X(65), h: scaleT2Y(22) },
    { n: 2, x: scaleT2X(-96) + defaultT2OffsetXPx, y: scaleT2Y(16), deg: 0, w: scaleT2X(102), h: scaleT2Y(22) },
    { n: 3, x: scaleT2X(7) + defaultT2OffsetXPx, y: scaleT2Y(16), deg: 25, w: scaleT2X(94), h: scaleT2Y(80) },
    { n: 4, x: scaleT2X(93) + defaultT2OffsetXPx, y: scaleT2Y(56), deg: 40, w: scaleT2X(102), h: scaleT2Y(248) },
    { n: 5, x: scaleT2X(0) + defaultT2OffsetXPx, y: scaleT2Y(118), deg: 40, w: scaleT2X(32), h: scaleT2Y(140) },
    { n: 6, x: scaleT2X(-90) + defaultT2OffsetXPx, y: scaleT2Y(226), deg: 0, w: scaleT2X(174), h: scaleT2Y(134) },
    { n: 7, x: scaleT2X(-53) + defaultT2OffsetXPx, y: scaleT2Y(1), deg: 40, w: scaleT2X(124), h: scaleT2Y(54) },
  ];

  const rectVertex = (v, w, h) => {
    if (v === 2) return { x: w, y: 0 };
    if (v === 3) return { x: w, y: h };
    if (v === 4) return { x: 0, y: h };
    return { x: 0, y: 0 };
  };

  if (stripeV4Engine) {
    const containerH = (megaTileSize + 2) || 0;
    const viewportH = (containerH + 3);
    const extraBottomSpacePx = stripeV4Sprite ? (stripeV4SpriteYOffsetPx + stripeV4SpriteExtraBottomPx) : 0;
    const rootH = viewportH;
    const wrapperH = viewportH + Math.max(0, extraBottomSpacePx);
    const fit = (
      (stripeCalibMode === 'ref2' && stripeV4FitLocked)
        ? stripeV4FitLocked
        : stripeV4Fit
    ) || { scale: 1, tx: 0, ty: stripeV4YOffsetPx + (stripeV4Sprite ? stripeV4SpriteYOffsetPx : 0) };
    const fitScale = (fit && Number.isFinite(fit.scale) && fit.scale > 0) ? fit.scale : 1;

    const spriteW = Math.round((stripeV4SvgW / stripeV4SvgH) * viewportH);

    const v4RootTf = (() => {
      try {
        const trackW = (Number.isFinite(spriteW) ? spriteW : 0) * fitScale;
        const trackH = (Number.isFinite(viewportH) ? viewportH : 0) * fitScale;
        const pxToSvgX = (Number.isFinite(trackW) && trackW > 0) ? (stripeV4SvgW / trackW) : 1;
        const pxToSvgY = (Number.isFinite(trackH) && trackH > 0) ? (stripeV4SvgH / trackH) : 1;

        const v4RootDxPx = (stripeV4SpriteInsetLeftPx + stripeV4HitDxPx);
        const v4RootDyPx = (stripeV4HitDyPx);
        const v4RootDxSvg = (Number.isFinite(v4RootDxPx) && v4RootDxPx !== 0) ? (v4RootDxPx * pxToSvgX) : 0;
        const v4RootDySvg = (Number.isFinite(v4RootDyPx) && v4RootDyPx !== 0) ? (v4RootDyPx * pxToSvgY) : 0;
        return (v4RootDxSvg || v4RootDySvg) ? `translate(${v4RootDxSvg} ${v4RootDySvg})` : '';
      } catch {
        return '';
      }
    })();

    const v4SpriteImgTf = (() => {
      try {
        const trackW = (Number.isFinite(spriteW) ? spriteW : 0) * fitScale;
        const trackH = (Number.isFinite(viewportH) ? viewportH : 0) * fitScale;
        const pxToSvgX = (Number.isFinite(trackW) && trackW > 0) ? (stripeV4SvgW / trackW) : 1;
        const pxToSvgY = (Number.isFinite(trackH) && trackH > 0) ? (stripeV4SvgH / trackH) : 1;

        const dxPx = (Number.isFinite(stripeV4SpriteImgDxPx) ? stripeV4SpriteImgDxPx : 0);
        const dyPx = (Number.isFinite(stripeV4SpriteImgDyPx) ? stripeV4SpriteImgDyPx : 0);
        const dxSvg = (Number.isFinite(dxPx) && dxPx !== 0) ? (dxPx * pxToSvgX) : 0;
        const dySvg = (Number.isFinite(dyPx) && dyPx !== 0) ? (dyPx * pxToSvgY) : 0;
        return (dxSvg || dySvg) ? `translate(${dxSvg} ${dySvg})` : '';
      } catch {
        return '';
      }
    })();

    const v4OverlayTf = (() => {
      try {
        const trackW = (Number.isFinite(spriteW) ? spriteW : 0) * fitScale;
        const trackH = (Number.isFinite(viewportH) ? viewportH : 0) * fitScale;
        const pxToSvgX = (Number.isFinite(trackW) && trackW > 0) ? (stripeV4SvgW / trackW) : 1;
        const pxToSvgY = (Number.isFinite(trackH) && trackH > 0) ? (stripeV4SvgH / trackH) : 1;

        // Overlay calibration applies on top of the base stripe placement.
        // NOTE: sprite image nudges (v4SpriteImgDx/Dy) are for the base sprite only.
        const dxPx = (stripeV4SpriteInsetLeftPx + stripeV4HitDxPx + stripeV4ClipDxPx);
        const dyPx = (stripeV4HitDyPx + stripeV4ClipDyPx);
        const dxSvg = (Number.isFinite(dxPx) && dxPx !== 0) ? (dxPx * pxToSvgX) : 0;
        const dySvg = (Number.isFinite(dyPx) && dyPx !== 0) ? (dyPx * pxToSvgY) : 0;
        return (dxSvg || dySvg) ? `translate(${dxSvg} ${dySvg})` : '';
      } catch {
        return '';
      }
    })();

    const v4HitTf = v4RootTf;

    useEffect(() => {
      try {
        if (!debugV4MaskOutlines) return;
        // eslint-disable-next-line no-console
        console.log('[StripeV4 align diag]', {
          fit: {
            scale: (fit && Number.isFinite(fit.scale)) ? fit.scale : null,
            tx: (fit && Number.isFinite(fit.tx)) ? fit.tx : null,
            ty: (fit && Number.isFinite(fit.ty)) ? fit.ty : null,
          },
          viewportH,
          spriteW,
          v4RootTf,
          stripeV4HitAlignTopDy,
          v4UnionMaskDy,
          v4UnionMaskScaleX,
          v4UnionMaskScaleY,
          stripeV4ClipDxPx,
          stripeV4ClipDyPx,
          stripeV4HitDxPx,
          stripeV4HitDyPx,
          stripeV4SpriteInsetLeftPx,
          stripeV4SpriteImgDxPx,
          stripeV4SpriteImgDyPx,
          stripeV4AllDxPx,
        });
      } catch {
        // ignore
      }
    }, [
      debugV4MaskOutlines,
      fit,
      viewportH,
      spriteW,
      v4RootTf,
      stripeV4HitAlignTopDy,
      v4UnionMaskDy,
      v4UnionMaskScaleX,
      v4UnionMaskScaleY,
      stripeV4ClipDxPx,
      stripeV4ClipDyPx,
      stripeV4HitDxPx,
      stripeV4HitDyPx,
      stripeV4SpriteInsetLeftPx,
      stripeV4SpriteImgDxPx,
      stripeV4SpriteImgDyPx,
      stripeV4AllDxPx,
    ]);

    const debugSpriteDxSvg = (() => {
      const pxDx = (Number.isFinite(stripeV4SpriteImgDxPx) ? stripeV4SpriteImgDxPx : 0)
        - (Number.isFinite(stripeV4SpriteInsetLeftPx + stripeV4ClipDxPx) ? (stripeV4SpriteInsetLeftPx + stripeV4ClipDxPx) : 0);
      const pxToSvgX = (Number.isFinite(spriteW) && spriteW > 0) ? (stripeV4SvgW / spriteW) : 1;
      return pxDx * pxToSvgX;
    })();

    const debugSpriteDySvg = (() => {
      const pxDy = (Number.isFinite(stripeV4SpriteImgDyPx) ? stripeV4SpriteImgDyPx : 0);
      const pxToSvgY = (Number.isFinite(viewportH) && viewportH > 0) ? (stripeV4SvgH / viewportH) : 1;
      return pxDy * pxToSvgY;
    })();

    const t14cFallbackFromBelt = (Number.isFinite(beltGuideXPx?.left) && Number.isFinite(beltGuideXPx?.right) && beltGuideXPx.right > beltGuideXPx.left)
      ? (beltGuideXPx.left + (beltGuideXPx.right - beltGuideXPx.left) * (13.5 / 14))
      : null;
    const t14cFallbackFromZoom = (stripeZoomHud?.tile14
      && Number.isFinite(stripeZoomHud.tile14.l)
      && Number.isFinite(stripeZoomHud.tile14.r))
      ? ((stripeZoomHud.tile14.l + stripeZoomHud.tile14.r) / 2)
      : null;
    const t14cGuideX = (Number.isFinite(beltGuideXPx?.t14c)
      ? beltGuideXPx.t14c
      : (Number.isFinite(t14cFallbackFromZoom) ? t14cFallbackFromZoom : t14cFallbackFromBelt)) + 4;

    return (
      <>
        {stripeBeltGuides && beltGuideXPx && typeof document !== 'undefined'
          ? createPortal(
              <div className="pointer-events-none fixed inset-0 z-[32000] debug-exempt" data-dev-overlay="true">
                {Number.isFinite(beltGuideXPx.left) ? (
                  <div
                    className="fixed top-0 h-screen"
                    style={{
                      left: `${beltGuideXPx.left}px`,
                      width: '1px',
                      background: 'rgba(34, 197, 94, 0.55)',
                    }}
                  />
                ) : null}
                {Number.isFinite(beltGuideXPx.right) ? (
                  <div
                    className="fixed top-0 h-screen"
                    style={{
                      left: `${beltGuideXPx.right}px`,
                      width: '1px',
                      background: 'rgba(34, 197, 94, 0.55)',
                    }}
                  />
                ) : null}
                {Number.isFinite(t14cGuideX) ? null : null}
              </div>,
              document.body,
            )
          : null}

        {debugV4Viewport && debugV4ViewportOverlayInfo && typeof document !== 'undefined'
          ? createPortal(
              (() => {
                try {
                  const info = debugV4ViewportOverlayInfo;
                  const rect = info?.rect;
                  if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) return null;
                  const dpr = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0)
                    ? window.devicePixelRatio
                    : 1;
                  const snap = (v) => {
                    try {
                      if (!Number.isFinite(v)) return v;
                      return Math.round(v * dpr) / dpr;
                    } catch {
                      return v;
                    }
                  };

                  const rectLeft = snap(rect.left);
                  const rectTop = snap(rect.top);
                  const rectW = snap(rect.width);
                  const rectH = snap(rect.height);
                  const rectHViewport = snap(Math.max(0, rectH - 2));
                  const rectTopViewport = snap(rectTop - 1);
                  const renderedWScreen = (Number.isFinite(info?.renderedWScreen) && info.renderedWScreen > 0) ? snap(info.renderedWScreen) : null;
                  const renderedHScreen = (Number.isFinite(info?.renderedHScreen) && info.renderedHScreen > 0) ? snap(info.renderedHScreen) : null;
                  const renderedHScreenDebug = (Number.isFinite(renderedHScreen) && renderedHScreen > 0) ? snap(Math.max(0, renderedHScreen - 2)) : renderedHScreen;
                  const topPadScreen = Number.isFinite(info?.topPadScreen) ? snap(info.topPadScreen) : 0;

                  return (
                    <div className="pointer-events-none fixed inset-0 z-[999999] debug-exempt" data-dev-overlay="true">
                      <div
                        style={{
                          position: 'fixed',
                          left: `${rectLeft}px`,
                          top: `${rectTopViewport}px`,
                          width: `${rectW}px`,
                          height: `${rectHViewport}px`,
                          outline: '2px solid rgba(16, 185, 129, 0.95)',
                          outlineOffset: '2px',
                          boxSizing: 'border-box',
                        }}
                      />

                      {(Number.isFinite(renderedWScreen) && renderedWScreen > 0 && Number.isFinite(renderedHScreenDebug) && renderedHScreenDebug > 0) ? (
                        <div
                          style={{
                            position: 'fixed',
                            left: `${rectLeft}px`,
                            top: `${rectTopViewport}px`,
                            width: `${renderedWScreen}px`,
                            height: `${renderedHScreenDebug}px`,
                            outline: '2px dashed rgba(244, 63, 94, 0.95)',
                            outlineOffset: '2px',
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : null}
                    </div>
                  );
                } catch {
                  return null;
                }
              })(),
              document.body,
            )
          : null}

        <div
          className="relative w-full"
          style={{
            height: `${wrapperH}px`,
            overflowX: (debugV4Viewport || stripeCalibMode !== 'ref2') ? undefined : 'hidden',
          }}
        >
          <div
            ref={stripeRootRef}
            data-stripe-root="true"
            className="absolute inset-0 z-[40] w-full"
            style={{
              height: `${rootH}px`,
              pointerEvents: 'auto',
              opacity: 1,
              padding: 0,
              boxSizing: 'border-box',
              overflowX: (debugV4Viewport || stripeClampLevel < 1) ? 'visible' : 'hidden',
              overflowY: debugV4Viewport ? 'visible' : 'visible',
              right: 0,
              left: stripeV4ViewportExtendLeftPx ? `${-stripeV4ViewportExtendLeftPx}px` : undefined,
              width: (stripeV4ViewportExtendLeftPx || stripeV4ViewportTrimRightPx)
                ? `calc(100% + ${stripeV4ViewportExtendLeftPx}px - ${stripeV4ViewportTrimRightPx}px)`
                : undefined,
            }}
          >
            {stripeCalibHud}

            <div
              data-stripe-track="true"
              ref={stripeTrackRef}
              className="absolute left-0 top-0"
              style={{
                height: `${(Number.isFinite(fit?.scale) ? (viewportH * fit.scale) : viewportH)}px`,
                width: `${(Number.isFinite(fit?.scale) ? (spriteW * fit.scale) : spriteW)}px`,
                left: `${snapToDevicePx(fit.tx + stripeV4ContentNudgeXPx + stripeV4AllDxPx)}px`,
                top: `${snapToDevicePx(fit.ty)}px`,
                right: 'auto',
                pointerEvents: 'auto',
              }}
            >
              {debugV4HideStripe ? null : (
                <svg
                  className="pointer-events-none absolute left-0 bottom-0 block"
                  viewBox={`0 0 ${stripeV4SvgW} ${stripeV4SvgH}`}
                  preserveAspectRatio="xMinYMax meet"
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                  }}
                >
                  <g transform={v4RootTf || undefined}>
                    <g transform={v4SpriteImgTf || undefined}>
                    <image
                      href={stripeV4SpriteSrc ? encodeURI(stripeV4SpriteSrc) : stripeV4SpriteSrc}
                      x={0}
                      y={0}
                      width={stripeV4SvgW}
                      height={stripeV4SvgH}
                      preserveAspectRatio="xMinYMax meet"
                      opacity="1"
                    />
                    </g>
                  </g>
                </svg>
              )}

            {((stripeCalibEnabled || stripeCalibMode === 'ref2') || stripeRefTile1) && (stripeRefMockupSrc && !debugV4HideRef) ? (
              <img
                key={`stripe-ref-mockup-${stripeRefMockupSrc}`}
                src={stripeRefMockupSrc}
                alt=""
                className="pointer-events-none absolute left-0 bottom-0 block"
                onLoad={(e) => {
                  try {
                    if (!stripeCalibEnabled) return;
                    const img = e?.currentTarget;
                    console.log('[stripe][ref-mockup][load]', {
                      src: img?.getAttribute?.('src') || null,
                      currentSrc: img?.currentSrc || null,
                      naturalW: img?.naturalWidth || null,
                      naturalH: img?.naturalHeight || null,
                    });
                  } catch {
                    // ignore
                  }
                }}
                onError={(e) => {
                  try {
                    if (!stripeCalibEnabled) return;
                    const img = e?.currentTarget;
                    console.log('[stripe][ref-mockup][error]', {
                      src: img?.getAttribute?.('src') || null,
                      currentSrc: img?.currentSrc || null,
                    });
                  } catch {
                    // ignore
                  }
                }}
                style={{
                  height: `${viewportH}px`,
                  width: 'auto',
                  objectFit: 'contain',
                  objectPosition: 'left bottom',
                  opacity: stripeCalibEnabled ? 0.78 : stripeRefOpacity,
                  mixBlendMode: 'normal',
                  filter: undefined,
                  transform: `translate(${(((stripeCalibMode === 'ref2') ? stripeRef2X : stripeRefX) / fitScale)}px, ${((((stripeCalibMode === 'ref2') ? stripeRef2Y : stripeRefY) + stripeRefRenderYOffsetPx) / fitScale)}px) scale(${(stripeCalibMode === 'ref2') ? stripeRef2Scale : stripeRefScale})`,
                  transformOrigin: 'top left',
                  zIndex: stripeCalibEnabled ? 5000 : ((stripeCalibMode === 'ref2') ? 999 : 41),
                }}
              />
            ) : null}

            {((overlaySrcForRender || debugFirstTestOverlay) && !debugNoV4Overlay) ? (
              <svg
                className={`pointer-events-none absolute left-0 bottom-0 block ${overlayClassName || ''}`}
                viewBox={`0 0 ${stripeV4SvgW} ${stripeV4SvgH}`}
                preserveAspectRatio="xMinYMax meet"
                overflow="visible"
                style={{
                  width: '100%',
                  height: '100%',
                  opacity: (stripeCalibEnabled ? 1 : (Number.isFinite(stripeRefOpacity) ? stripeRefOpacity : 1)),
                  overflow: 'visible',
                  zIndex: stripeCalibEnabled ? 6000 : 45,
                }}
              >
                {stripeV4OverlayMaskReady ? (
                  <defs>
                    {(() => {
                      const ds = (stripeV4OverlayMaskReady && Array.isArray(stripeV4HitTilePathDs))
                        ? stripeV4HitTilePathDs.slice(0, 14)
                        : [];
                      const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                      if (ds.length !== 14) return null;

                      const fitScaleForClip = (fit && Number.isFinite(fit.scale) && fit.scale > 0) ? fit.scale : 1;
                      const natW = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.w) : null;
                      const natH = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.h) : null;
                      const boxW = (Number.isFinite(spriteW) && spriteW > 0) ? spriteW : null;
                      const boxH = (Number.isFinite(viewportH) && viewportH > 0) ? viewportH : null;
                      const scaleInBox = (Number.isFinite(natW) && natW > 0 && Number.isFinite(natH) && natH > 0 && Number.isFinite(boxW) && boxW > 0 && Number.isFinite(boxH) && boxH > 0)
                        ? Math.min(boxW / natW, boxH / natH)
                        : null;
                      const renderedW = Number.isFinite(scaleInBox) ? (natW * scaleInBox) : boxW;
                      const renderedH = Number.isFinite(scaleInBox) ? (natH * scaleInBox) : boxH;
                      const denomX = (Number.isFinite(renderedW) && renderedW > 0) ? (renderedW * fitScaleForClip) : null;
                      const denomY = (Number.isFinite(renderedH) && renderedH > 0) ? (renderedH * fitScaleForClip) : null;
                      const pxToSvgX = (Number.isFinite(denomX) && denomX > 0) ? (stripeV4SvgW / denomX) : 1;
                      const pxToSvgY = (Number.isFinite(denomY) && denomY > 0) ? (stripeV4SvgH / denomY) : 1;

                      const applyTransforms = false;
                      const applyAlign = !v4UnionMaskNoAlign;
                      const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                      const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                      const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                      const unionCx = (v4UnionMaskAnchorX === 'left')
                        ? 0
                        : (v4UnionMaskAnchorX === 'right' ? stripeV4SvgW : (stripeV4SvgW / 2));
                      const unionCy = v4UnionMaskAnchor === 'top'
                        ? 0
                        : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                      const unionScaleTf = (unionScaleX !== 1 || unionScaleY !== 1)
                        ? `translate(${unionCx} ${unionCy}) scale(${unionScaleX} ${unionScaleY}) translate(${-unionCx} ${-unionCy})`
                        : '';
                      const unionDxSvg = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDx) && v4UnionMaskDx !== 0)
                        ? (v4UnionMaskDx * pxToSvgX)
                        : 0;
                      const unionDxTf = unionDxSvg
                        ? `translate(${unionDxSvg} 0)`
                        : '';
                      const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                      const unionAdjustTfUnion = [unionScaleTf, unionDxTf, unionDyTf].filter(Boolean).join(' ');
                      const unionAdjustTfTiles = '';

                      const basePitch = stripeV4HitStepX;
                      const maskPitch = (Number.isFinite(v4MaskPitchXParam) && v4MaskPitchXParam > 0) ? v4MaskPitchXParam : basePitch;
                      const maskX0 = (Number.isFinite(v4MaskX0Param) ? v4MaskX0Param : 0);
                      const maskPitchDelta = (Number.isFinite(maskPitch) && Number.isFinite(basePitch)) ? (maskPitch - basePitch) : 0;

                      const usePitchTf = (urlParams?.get('v4MaskUsePitchTf') === '1');

                      const tilePitchTf = (idx) => {
                        try {
                          if (!Number.isFinite(idx)) return '';
                          const dx = (maskX0 || 0) + (idx * (maskPitchDelta || 0));
                          return dx ? `translate(${dx} 0)` : '';
                        } catch {
                          return '';
                        }
                      };
                      const unionDilateFilterId = `${stripeV4OverlayClipPathId}-dilate`;
                      const unionMaskId = `${stripeV4OverlayClipPathId}-unionmask`;

                      const makeTf = (idx) => {
                        const parts = [];
                        if (usePitchTf) {
                          const tp = tilePitchTf(idx);
                          if (tp) parts.push(tp);
                        }
                        if (applyTransforms && transforms.length) parts.push(...transforms);
                        if (applyAlign && stripeV4HitAlignTopDy) parts.push(`translate(0 ${stripeV4HitAlignTopDy})`);
                        return parts.filter(Boolean).join(' ');
                      };

                      return (
                        <>
                          {v4UnionMaskDilate ? (
                            <filter
                              id={unionDilateFilterId}
                              x={-1000}
                              y={-1000}
                              width={stripeV4SvgW + 2000}
                              height={stripeV4SvgH + 2000}
                              filterUnits="userSpaceOnUse"
                            >
                              <feMorphology in="SourceGraphic" operator="dilate" radius={v4UnionMaskDilate} />
                            </filter>
                          ) : null}

                          {v4UnionMaskDilate ? (
                            <mask
                              id={unionMaskId}
                              maskUnits="userSpaceOnUse"
                              maskContentUnits="userSpaceOnUse"
                              x={-1000}
                              y={-1000}
                              width={stripeV4SvgW + 2000}
                              height={stripeV4SvgH + 2000}
                            >
                              <rect x={-1000} y={-1000} width={stripeV4SvgW + 2000} height={stripeV4SvgH + 2000} fill="black" />
                              {(() => {
                                const base = (
                                  <path
                                    d={stripeV4HitPathD}
                                    fill="white"
                                    fillRule={v4UnionMaskRule}
                                    clipRule={v4UnionMaskRule}
                                    filter={`url(#${unionDilateFilterId})`}
                                  />
                                );

                                const inner = <g>{base}</g>;
                                const aligned = applyAlign
                                  ? (stripeV4HitAlignTopDy
                                      ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{inner}</g>
                                      : inner)
                                  : inner;

                                return unionAdjustTfUnion ? <g transform={unionAdjustTfUnion}>{aligned}</g> : aligned;
                              })()}
                            </mask>
                          ) : null}

                          <clipPath
                            id={`${stripeV4OverlayClipPathId}-clip`}
                            clipPathUnits="userSpaceOnUse"
                          >
                            {(() => {
                              const base = (
                                <path
                                  d={stripeV4HitPathD}
                                  fill="white"
                                  fillRule={v4UnionMaskRule}
                                  clipRule={v4UnionMaskRule}
                                  filter={v4UnionMaskDilate ? `url(#${unionDilateFilterId})` : undefined}
                                />
                              );
                              const wrapped = applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-ov-clip-union-t-${i}`} transform={t}>{child}</g>,
                                    base,
                                  )
                                : base;
                              const inner = <g>{wrapped}</g>;
                              const aligned = applyAlign
                                ? (stripeV4HitAlignTopDy
                                    ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{inner}</g>
                                    : inner)
                                : inner;
                              return unionAdjustTfUnion ? <g transform={unionAdjustTfUnion}>{aligned}</g> : aligned;
                            })()}
                          </clipPath>

                          {ds.map((d, idx) => (
                            <mask
                              key={`v4-ov-mask-tile-${idx}`}
                              id={`${stripeV4OverlayClipPathId}-tile-${idx}`}
                              maskUnits="userSpaceOnUse"
                              maskContentUnits="userSpaceOnUse"
                              x={-1000}
                              y={-1000}
                              width={stripeV4SvgW + 2000}
                              height={stripeV4SvgH + 2000}
                            >
                              <rect x={-1000} y={-1000} width={stripeV4SvgW + 2000} height={stripeV4SvgH + 2000} fill="black" />
                              {(() => {
                                const base = (
                                  <path
                                    d={d}
                                    transform={makeTf(idx)}
                                    fill="white"
                                    fillRule={v4UnionMaskRule}
                                    clipRule={v4UnionMaskRule}
                                    filter={v4UnionMaskDilate ? `url(#${unionDilateFilterId})` : undefined}
                                  />
                                );
                                return unionAdjustTfTiles ? <g transform={unionAdjustTfTiles}>{base}</g> : base;
                              })()}
                            </mask>
                          ))}

                          {ds.map((d, idx) => (
                            <mask
                              key={`v4-ov-mask-tile-inv-${idx}`}
                              id={`${stripeV4OverlayClipPathId}-tileinv-${idx}`}
                              maskUnits="userSpaceOnUse"
                              maskContentUnits="userSpaceOnUse"
                              x={-1000}
                              y={-1000}
                              width={stripeV4SvgW + 2000}
                              height={stripeV4SvgH + 2000}
                            >
                              <rect x={-1000} y={-1000} width={stripeV4SvgW + 2000} height={stripeV4SvgH + 2000} fill="white" />
                              {(() => {
                                const base = (
                                  <path
                                    d={d}
                                    transform={makeTf(idx)}
                                    fill="black"
                                    fillRule={v4UnionMaskRule}
                                    clipRule={v4UnionMaskRule}
                                    filter={v4UnionMaskDilate ? `url(#${unionDilateFilterId})` : undefined}
                                  />
                                );
                                return unionAdjustTfTiles ? <g transform={unionAdjustTfTiles}>{base}</g> : base;
                              })()}
                            </mask>
                          ))}

                          {ds.map((d, idx) => (
                            <clipPath
                              key={`v4-ov-clip-tile-${idx}`}
                              id={`${stripeV4OverlayClipPathId}-tileclip-${idx}`}
                              clipPathUnits="userSpaceOnUse"
                            >
                              {unionAdjustTfTiles ? (
                                <g transform={unionAdjustTfTiles}>
                                  <path
                                    d={d}
                                    transform={makeTf(idx)}
                                    fill="white"
                                    fillRule={v4UnionMaskRule}
                                    clipRule={v4UnionMaskRule}
                                  />
                                </g>
                              ) : (
                                <path
                                  d={d}
                                  transform={makeTf(idx)}
                                  fill="white"
                                  fillRule={v4UnionMaskRule}
                                  clipRule={v4UnionMaskRule}
                                />
                              )}
                            </clipPath>
                          ))}
                        </>
                      );
                    })()}
                  </defs>
                ) : null}

                <g transform={v4OverlayTf || undefined}>

                {(debugFirstTestOverlay && !debugV4Layers) ? (
                  <rect
                    x={0}
                    y={0}
                    width={stripeV4SvgW}
                    height={stripeV4SvgH}
                    fill="rgba(255, 0, 0, 0.10)"
                    stroke="rgba(255, 0, 0, 0.35)"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}

                {(debugFirstTestOverlay && !debugV4Layers) ? (
                  <image
                    href={debugFirstTestOverlaySrc ? encodeURI(debugFirstTestOverlaySrc) : debugFirstTestOverlaySrc}
                    x={0}
                    y={0}
                    width={stripeV4SvgW}
                    height={stripeV4SvgH}
                    preserveAspectRatio="xMinYMax meet"
                    opacity={0.65}
                  />
                ) : null}

                {(stripeOverlayClip && stripeOverlayClipDebug && stripeV4OverlayMaskReady) ? (
                  (() => {
                    try {
                      const ds = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14) : [];
                      if (!ds.length || !stripeV4HitPathD) return null;

                      const unionMaskUrl = v4UnionMaskDilate
                        ? `url(#${stripeV4OverlayClipPathId}-unionmask)`
                        : '';

                      const basePitch = stripeV4HitStepX;
                      const maskPitch = (Number.isFinite(v4MaskPitchXParam) && v4MaskPitchXParam > 0) ? v4MaskPitchXParam : basePitch;
                      const maskX0 = (Number.isFinite(v4MaskX0Param) ? v4MaskX0Param : 0);
                      const maskPitchDelta = (Number.isFinite(maskPitch) && Number.isFinite(basePitch)) ? (maskPitch - basePitch) : 0;
                      const usePitchTf = Boolean(
                        urlParams?.get('v4MaskUsePitchTf') === '1'
                        || urlParams?.has('v4MaskPitchX')
                        || urlParams?.has('v4MaskX0')
                      );

                      const pxToSvgX = (() => {
                        try {
                          const fitScale = (fit && Number.isFinite(fit.scale) && fit.scale > 0) ? fit.scale : 1;
                          const trackW = (Number.isFinite(spriteW) && spriteW > 0) ? (spriteW * fitScale) : null;
                          return (Number.isFinite(trackW) && trackW > 0) ? (stripeV4SvgW / trackW) : 1;
                        } catch {
                          return 1;
                        }
                      })();
                      const tilePitchTf = (idx) => {
                        try {
                          const dx = (maskX0 || 0) + (idx * (maskPitchDelta || 0));
                          return dx ? `translate(${dx} 0)` : '';
                        } catch {
                          return '';
                        }
                      };
                      const makeTf = (idx) => {
                        const parts = [];
                        if (usePitchTf) {
                          const tp = tilePitchTf(idx);
                          if (tp) parts.push(tp);
                        }
                        if (!v4UnionMaskNoAlign && stripeV4HitAlignTopDy) parts.push(`translate(0 ${stripeV4HitAlignTopDy})`);
                        return parts.filter(Boolean).join(' ');
                      };

                      const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                      const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                      const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                      const unionCx = (v4UnionMaskAnchorX === 'left')
                        ? 0
                        : (v4UnionMaskAnchorX === 'right' ? stripeV4SvgW : (stripeV4SvgW / 2));
                      const unionCy = v4UnionMaskAnchor === 'top'
                        ? 0
                        : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                      const unionScaleTf = (unionScaleX !== 1 || unionScaleY !== 1)
                        ? `translate(${unionCx} ${unionCy}) scale(${unionScaleX} ${unionScaleY}) translate(${-unionCx} ${-unionCy})`
                        : '';
                      const unionDxSvg = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDx) && v4UnionMaskDx !== 0)
                        ? (v4UnionMaskDx * pxToSvgX)
                        : 0;
                      const unionDxTf = unionDxSvg
                        ? `translate(${unionDxSvg} 0)`
                        : '';
                      const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                      const unionAdjustTf = [unionScaleTf, unionDxTf, unionDyTf].filter(Boolean).join(' ');

                      const unionBase = (
                        <path
                          d={stripeV4HitPathD}
                          fill="none"
                          stroke="rgba(217, 70, 239, 0.95)"
                          strokeWidth={2}
                          vectorEffect="non-scaling-stroke"
                          pointerEvents="none"
                        />
                      );
                      const unionAligned = (!v4UnionMaskNoAlign && stripeV4HitAlignTopDy)
                        ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{unionBase}</g>
                        : unionBase;
                      const union = unionAdjustTf ? <g transform={unionAdjustTf}>{unionAligned}</g> : unionAligned;

                      const unionFill = unionMaskUrl ? (
                        <rect
                          x={-1000}
                          y={-1000}
                          width={stripeV4SvgW + 2000}
                          height={stripeV4SvgH + 2000}
                          fill="rgba(217, 70, 239, 0.12)"
                          mask={unionMaskUrl}
                          pointerEvents="none"
                        />
                      ) : null;

                      const tiles = ds.map((d, idx) => {
                        const tileMaskUrl = `url(#${stripeV4OverlayClipPathId}-tile-${idx})`;
                        const tileFill = (
                          <rect
                            key={`v4-clip-debug-tile-fill-${idx}`}
                            x={-1000}
                            y={-1000}
                            width={stripeV4SvgW + 2000}
                            height={stripeV4SvgH + 2000}
                            fill="rgba(34, 211, 238, 0.12)"
                            mask={tileMaskUrl}
                            pointerEvents="none"
                          />
                        );
                        const tile = (
                          <path
                            key={`v4-clip-debug-tile-${idx}`}
                            d={d}
                            transform={makeTf(idx) || undefined}
                            fill="none"
                            stroke="rgba(34, 211, 238, 0.95)"
                            strokeWidth={1.5}
                            vectorEffect="non-scaling-stroke"
                            pointerEvents="none"
                          />
                        );

                        const outlined = unionAdjustTf
                          ? <g key={`v4-clip-debug-tile-wrap-${idx}`} transform={unionAdjustTf}>{tile}</g>
                          : tile;

                        return (
                          <g key={`v4-clip-debug-tile-pack-${idx}`} pointerEvents="none">
                            {tileFill}
                            {outlined}
                          </g>
                        );
                      });

                      return <g pointerEvents="none">{unionFill}{union}{tiles}</g>;
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {(debugV4UnionMask || debugV4ClipOnly) && stripeV4OverlayMaskReady && (!debugV4MaskFill || debugV4ShowUnionWithMask) ? (
                  (() => {
                    const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                    const applyTransforms = v4UnionMaskUseHitTransforms && !v4UnionMaskNoTransforms;
                    const applyAlign = !v4UnionMaskNoAlign;
                    const fitScaleForClip = (fit && Number.isFinite(fit.scale) && fit.scale > 0) ? fit.scale : 1;
                    const natW = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.w) : null;
                    const natH = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.h) : null;
                    const boxW = (Number.isFinite(spriteW) && spriteW > 0) ? spriteW : null;
                    const boxH = (Number.isFinite(viewportH) && viewportH > 0) ? viewportH : null;
                    const scaleInBox = (Number.isFinite(natW) && natW > 0 && Number.isFinite(natH) && natH > 0 && Number.isFinite(boxW) && boxW > 0 && Number.isFinite(boxH) && boxH > 0)
                      ? Math.min(boxW / natW, boxH / natH)
                      : null;
                    const renderedW = Number.isFinite(scaleInBox) ? (natW * scaleInBox) : boxW;
                    const renderedH = Number.isFinite(scaleInBox) ? (natH * scaleInBox) : boxH;
                    const denomX = (Number.isFinite(renderedW) && renderedW > 0) ? (renderedW * fitScaleForClip) : null;
                    const denomY = (Number.isFinite(renderedH) && renderedH > 0) ? (renderedH * fitScaleForClip) : null;
                    const pxToSvgX = (Number.isFinite(denomX) && denomX > 0) ? (stripeV4SvgW / denomX) : 1;
                    const pxToSvgY = (Number.isFinite(denomY) && denomY > 0) ? (stripeV4SvgH / denomY) : 1;
                    const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                    const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                    const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                    const unionCx = stripeV4SvgW / 2;
                    const unionCy = v4UnionMaskAnchor === 'top'
                      ? 0
                      : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                    const unionScaleTf = (unionScaleX !== 1 || unionScaleY !== 1)
                      ? `translate(${unionCx} ${unionCy}) scale(${unionScaleX} ${unionScaleY}) translate(${-unionCx} ${-unionCy})`
                      : '';
                    const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                    const unionAdjustTf = [unionScaleTf, unionDyTf].filter(Boolean).join(' ');

                    const ds = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14) : [];
                    if (ds.length !== 14) return null;

                    const basePitch = stripeV4HitStepX;
                    const maskPitch = (Number.isFinite(v4MaskPitchXParam) && v4MaskPitchXParam > 0) ? v4MaskPitchXParam : basePitch;
                    const maskX0 = (Number.isFinite(v4MaskX0Param) ? v4MaskX0Param : 0);
                    const maskPitchDelta = (Number.isFinite(maskPitch) && Number.isFinite(basePitch)) ? (maskPitch - basePitch) : 0;

                    const usePitchTf = Boolean(
                      urlParams?.get('v4MaskUsePitchTf') === '1'
                      || urlParams?.has('v4MaskPitchX')
                      || urlParams?.has('v4MaskX0')
                    );

                    const makeTf = (idx) => {
                      try {
                        if (!Number.isFinite(idx)) return '';
                        const parts = [];
                        if (usePitchTf) {
                          const dx = (maskX0 || 0) + (idx * (maskPitchDelta || 0));
                          if (dx) parts.push(`translate(${dx} 0)`);
                        }
                        if (applyTransforms && transforms.length) parts.push(...transforms);
                        return parts.filter(Boolean).join(' ');
                      } catch {
                        return '';
                      }
                    };

                    const base = (
                      <g>
                        {ds.map((d, idx) => (
                          <path
                            key={`v4-clip-outline-union-tile-${idx}`}
                            d={d}
                            transform={makeTf(idx) || undefined}
                            fill={debugV4ClipOnly ? 'rgba(236, 72, 153, 0.25)' : 'none'}
                            stroke={debugV4ClipOnly ? 'none' : 'rgba(236, 72, 153, 0.95)'}
                            strokeWidth={debugV4ClipOnly ? 0 : 0.4}
                            vectorEffect="non-scaling-stroke"
                            fillRule={v4UnionMaskRule}
                            clipRule={v4UnionMaskRule}
                          />
                        ))}
                      </g>
                    );

                    const wrapped = base;

                    const inner = <g>{wrapped}</g>;
                    const aligned = applyAlign
                      ? (stripeV4HitAlignTopDy
                          ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{inner}</g>
                          : inner)
                      : inner;

                    const outlined = unionAdjustTf ? <g transform={unionAdjustTf}>{aligned}</g> : aligned;

                    return outlined;
                  })()
                ) : null}

                {debugV4MaskOutlines && !debugV4NoMaskOutlines && stripeV4OverlayMaskReady ? (
                  (() => {
                    try {
                      const ds = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14) : [];
                      if (ds.length !== 14) return null;
                      const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                      const applyTransforms = false;
                      const applyAlign = !v4UnionMaskNoAlign;

                      const fitScaleForClip = (fit && Number.isFinite(fit.scale) && fit.scale > 0) ? fit.scale : 1;
                      const natW = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.w) : null;
                      const natH = (stripeV2SpriteProbe && stripeV2SpriteProbe.status === 'ok') ? Number(stripeV2SpriteProbe.h) : null;
                      const boxW = (Number.isFinite(spriteW) && spriteW > 0) ? spriteW : null;
                      const boxH = (Number.isFinite(viewportH) && viewportH > 0) ? viewportH : null;
                      const scaleInBox = (Number.isFinite(natW) && natW > 0 && Number.isFinite(natH) && natH > 0 && Number.isFinite(boxW) && boxW > 0 && Number.isFinite(boxH) && boxH > 0)
                        ? Math.min(boxW / natW, boxH / natH)
                        : null;
                      const renderedW = Number.isFinite(scaleInBox) ? (natW * scaleInBox) : boxW;
                      const renderedH = Number.isFinite(scaleInBox) ? (natH * scaleInBox) : boxH;
                      const denomX = (Number.isFinite(renderedW) && renderedW > 0) ? (renderedW * fitScaleForClip) : null;
                      const denomY = (Number.isFinite(renderedH) && renderedH > 0) ? (renderedH * fitScaleForClip) : null;

                      const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                      const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                      const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                      const unionCx = stripeV4SvgW / 2;
                      const unionCy = v4UnionMaskAnchor === 'top'
                        ? 0
                        : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                      const unionScaleTf = (unionScaleX !== 1 || unionScaleY !== 1)
                        ? `translate(${unionCx} ${unionCy}) scale(${unionScaleX} ${unionScaleY}) translate(${-unionCx} ${-unionCy})`
                        : '';
                      const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                      const unionAdjustTf = [unionScaleTf, unionDyTf].filter(Boolean).join(' ');

                      const makeTf = (idx) => {
                        const parts = [];
                        if (applyTransforms && transforms.length) parts.push(...transforms);
                        if (applyAlign && stripeV4HitAlignTopDy) parts.push(`translate(0 ${stripeV4HitAlignTopDy})`);
                        return parts.filter(Boolean).join(' ');
                      };

                      const outlined = (
                        <g pointerEvents="none">
                          {ds.map((d, idx) => (
                            <path
                              key={`v4-mask-outline-${idx}`}
                              d={d}
                              transform={makeTf(idx)}
                              fill="rgba(234, 88, 12, 0.18)"
                              stroke="none"
                              fillRule={v4UnionMaskRule}
                              clipRule={v4UnionMaskRule}
                            />
                          ))}
                        </g>
                      );

                      const adjusted = unionAdjustTf ? <g transform={unionAdjustTf}>{outlined}</g> : outlined;
                      return adjusted;
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {debugV4MaskOutlines && !debugV4NoMaskOutlines && (!stripeV4OverlayMaskReady || (Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14).length !== 14 : true)) ? (
                  (() => {
                    try {
                      const x0 = Number.isFinite(v4OverlayX0Live) ? v4OverlayX0Live : 0;
                      const w = Number.isFinite(v4OverlayWLive) ? v4OverlayWLive : (stripeV4SvgW / 14);
                      const pitch = Number.isFinite(v4OverlayPitchXLive) ? v4OverlayPitchXLive : w;
                      const makeTf = (idx) => {
                        const parts = [];
                        if (idx && pitch) parts.push(`translate(${pitch * idx} 0)`);
                        return parts.filter(Boolean).join(' ');
                      };

                      return (
                        <g pointerEvents="none">
                          {Array.from({ length: 14 }).map((_, idx) => (
                            <rect
                              key={`v4-tile-guide-box-${idx}`}
                              x={x0}
                              y={0}
                              width={w}
                              height={stripeV4SvgH}
                              transform={makeTf(idx)}
                              fill="rgba(34, 197, 94, 0.06)"
                              stroke="rgba(34, 197, 94, 0.65)"
                              strokeWidth={1.2}
                              vectorEffect="non-scaling-stroke"
                            />
                          ))}
                        </g>
                      );
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {debugV4MaskFill && !debugV4NoMaskFill && stripeV4OverlayMaskReady ? (
                  (() => {
                    try {
                      const ds = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14) : [];
                      if (ds.length !== 14) return null;
                      const filled = (
                        <g pointerEvents="none">
                          {ds.map((_, idx) => (
                            <rect
                              key={`v4-mask-fill-${idx}`}
                              x={0}
                              y={0}
                              width={stripeV4SvgW}
                              height={stripeV4SvgH}
                              fill="rgba(234, 88, 12, 0.16)"
                              mask={`url(#${stripeV4OverlayClipPathId}-tile-${idx})`}
                            />
                          ))}
                          {(debugV4MaskCut || debugV4LayersOnly === 'cut') ? ds.map((_, idx) => (
                            <rect
                              key={`v4-mask-cut-${idx}`}
                              x={0}
                              y={0}
                              width={stripeV4SvgW}
                              height={stripeV4SvgH}
                              fill="rgba(6, 182, 212, 0.10)"
                              mask={`url(#${stripeV4OverlayClipPathId}-tileinv-${idx})`}
                            />
                          )) : null}
                        </g>
                      );

                      return (debugSpriteDxSvg || debugSpriteDySvg)
                        ? <g transform={`translate(${debugSpriteDxSvg || 0} ${debugSpriteDySvg || 0})`}>{filled}</g>
                        : filled;
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {null}

                {stripeV4OverlayMaskReady ? (
                  (() => {
                    try {
                      const ds = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs.slice(0, 14) : [];
                      if (ds.length !== 14) return null;
                      const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                      const applyTransforms = v4UnionMaskUseHitTransforms && !v4UnionMaskNoTransforms;
                      const applyAlign = !v4UnionMaskNoAlign;

                      const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                      const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                      const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                      const unionCx = stripeV4SvgW / 2;
                      const unionCy = v4UnionMaskAnchor === 'top'
                        ? 0
                        : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                      const unionScaleTf = (unionScaleX !== 1 || unionScaleY !== 1)
                        ? `translate(${unionCx} ${unionCy}) scale(${unionScaleX} ${unionScaleY}) translate(${-unionCx} ${-unionCy})`
                        : '';
                      const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                      const unionAdjustTf = [unionScaleTf, unionDyTf].filter(Boolean).join(' ');

                      const makeTf = (idx) => {
                        const parts = [];
                        if (applyTransforms && transforms.length) parts.push(...transforms);
                        if (applyAlign && stripeV4HitAlignTopDy) parts.push(`translate(0 ${stripeV4HitAlignTopDy})`);
                        return parts.filter(Boolean).join(' ');
                      };

                      const refs = (
                        <g opacity={0} pointerEvents="none">
                          {ds.map((d, idx) => (
                            <path
                              key={`v4-overlay-tile-ref-${idx}`}
                              ref={(el) => {
                                try {
                                  if (!stripeV4OverlayTilePathRefs.current) stripeV4OverlayTilePathRefs.current = [];
                                  stripeV4OverlayTilePathRefs.current[idx] = el;
                                } catch {
                                  // ignore
                                }
                              }}
                              d={d}
                              transform={makeTf(idx)}
                              fill="none"
                              stroke="none"
                            />
                          ))}
                        </g>
                      );

                      const adjusted = unionAdjustTf ? <g transform={unionAdjustTf}>{refs}</g> : refs;
                      return (debugSpriteDxSvg || debugSpriteDySvg)
                        ? <g transform={`translate(${debugSpriteDxSvg || 0} ${debugSpriteDySvg || 0})`}>{adjusted}</g>
                        : adjusted;
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {(() => {
                  const src0 = overlaySrcForRenderByTileIdx(0);
                  if (!src0 && !debugV4ForceTiles) return null;

                  return (
                    <g>
                      {debugV4UnionMask ? null : null}
                      {(() => {
                        // Render overlays per tile (one per shirt), masked by each tile silhouette.
                        const xImgBase = 0;
                        const wImgDefault = stripeV4SvgW;

                        const isSingleTileAsset = (() => {
                          try {
                            const w = v4OverlayProbe?.w;
                            if (!Number.isFinite(w) || w <= 0) return false;
                            // Heuristic: if the loaded image is much narrower than the full stripe SVG,
                            // it's a single-tile asset and must be positioned per tile.
                            const heuristic = (w < (stripeV4SvgW * 0.85));
                            if (debugFirstTestOverlay && debugFirstTestOverlayMode === 'full') return false;
                            if (debugFirstTestOverlay && debugFirstTestOverlayMode === 'tile') return true;
                            return heuristic;
                          } catch {
                            return false;
                          }
                        })();

                        const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                        const applyTransforms = v4UnionMaskUseHitTransforms && !v4UnionMaskNoTransforms;
                        // Align-top is for matching the clip/mask coordinate space; applying it to the
                        // rendered overlay content can cause the union clip to fully cut the overlay.
                        const applyAlign = (!stripeOverlayClip) && !v4UnionMaskNoAlign;

                        const unionDy = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskDy) && v4UnionMaskDy !== 0) ? v4UnionMaskDy : 0;
                        const unionScaleX = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleX) && v4UnionMaskScaleX !== 1) ? v4UnionMaskScaleX : 1;
                        const unionScaleY = (!v4UnionMaskLegacy && Number.isFinite(v4UnionMaskScaleY) && v4UnionMaskScaleY !== 1) ? v4UnionMaskScaleY : 1;
                        const unionCx = stripeV4SvgW / 2;
                        const unionCy = v4UnionMaskAnchor === 'top'
                          ? 0
                          : (v4UnionMaskAnchor === 'bottom' ? stripeV4SvgH : (stripeV4SvgH / 2));
                        const unionScaleTf = (Number.isFinite(unionScaleX) && unionScaleX !== 1)
                          ? `translate(${stripeV4SvgW / 2} ${stripeV4SvgH / 2}) scale(${unionScaleX}) translate(${-stripeV4SvgW / 2} ${-stripeV4SvgH / 2})`
                          : '';
                        const unionDyTf = unionDy ? `translate(0 ${unionDy})` : '';
                        const unionAdjustTf = [unionScaleTf, unionDyTf].filter(Boolean).join(' ');

                        const baseOvDx = (Number.isFinite(stripeOverlayX) && stripeOverlayX !== 0) ? stripeOverlayX : 0;
                        const baseOvDy = (Number.isFinite(stripeOverlayY) && stripeOverlayY !== 0) ? stripeOverlayY : 0;
                        const baseOvS = (Number.isFinite(stripeOverlayScale) && stripeOverlayScale > 0 && stripeOverlayScale !== 1) ? stripeOverlayScale : 1;
                        const fineOvDx = (Number.isFinite(v4OverlayDxParam) && v4OverlayDxParam !== 0) ? v4OverlayDxParam : 0;
                        const fineOvDy = (Number.isFinite(v4OverlayDyParam) && v4OverlayDyParam !== 0) ? v4OverlayDyParam : 0;
                        const fineOvS = (Number.isFinite(v4OverlayScaleParam) && v4OverlayScaleParam > 0) ? v4OverlayScaleParam : 1;
                        const ovDx = baseOvDx + fineOvDx;
                        const ovAdjustDy = baseOvDy + fineOvDy;
                        const ovS = baseOvS * fineOvS;
                        const labelPitchX = Number.isFinite(v4OverlayPitchXEffective) ? v4OverlayPitchXEffective : stripeV4HitStepX;
                        const labelX0 = Number.isFinite(v4OverlayX0Effective) ? v4OverlayX0Effective : 0;

                        const mkTile = (idx) => {
                          const normalizeDrawingsStripeSrc = (srcPath) => {
                            try {
                              if (!srcPath || typeof srcPath !== 'string') return srcPath;
                              const trimmed = srcPath.trim();
                              if (!trimmed) return srcPath;
                              const [base, q] = trimmed.split('?');
                              let outBase = base;
                              if (outBase.includes('/custom_logos/drawings/images_originals/stripe/')) {
                                outBase = outBase.replace('/custom_logos/drawings/images_originals/stripe/', '/custom_logos/drawings/images_stripe/');
                              }
                              if (outBase.includes('/custom_logos/drawings/images_grid/')) {
                                outBase = outBase.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_stripe/');
                              }
                              const m = outBase.match(/^(.*)\.(webp|png|jpe?g)$/i);
                              if (m) {
                                const prefix = m[1].replace(/-(grid|stripe)$/i, '');
                                const ext = m[2];
                                outBase = prefix.toLowerCase().endsWith('-stripe') ? `${prefix}.${ext}` : `${prefix}-stripe.${ext}`;
                              }
                              return q ? `${outBase}?${q}` : outBase;
                            } catch {
                              return srcPath;
                            }
                          };

                          const itemSrcRaw = Array.isArray(itemsProp) ? itemsProp[idx] : null;
                          const itemSrc = (typeof itemSrcRaw === 'string' && itemSrcRaw.includes('/custom_logos/drawings/'))
                            ? normalizeDrawingsStripeSrc(itemSrcRaw)
                            : null;

                          const byTileSrc = overlaySrcForRenderByTileIdx(idx);
                          if (debugFirstTestOverlay && !itemSrc && byTileSrc == null) return null;
                          const s = itemSrc || byTileSrc || src0;

                          const placeholder = (debugV4Layers || debugV4ForceTiles) ? (
                            <g key={`v4-overlay-tile-${idx}-placeholder`}>
                              <text
                                x={labelX0 + (idx * labelPitchX) + 6}
                                y={36}
                                fontSize={14}
                                fill="rgba(220, 38, 38, 0.85)"
                                stroke="rgba(255,255,255,0.95)"
                                strokeWidth={4}
                                paintOrder="stroke"
                                pointerEvents="none"
                              >
                                {`tile ${idx + 1}: no src`}
                              </text>
                            </g>
                          ) : null;

                          if (!s) {
                            // Still allow mask debug (kept/cut) to render for this tile.
                            if (debugV4Layers && debugV4LayersOnly && debugV4LayersOnly !== 'kept' && debugV4LayersOnly !== 'cut') return placeholder;
                            return placeholder;
                          }

                          const isDrawingsOverlay = (() => {
                            try {
                              return s.toString().includes('/custom_logos/drawings/');
                            } catch {
                              return false;
                            }
                          })();

                          const isTestOverlay = (() => {
                            try {
                              if (!debugFirstTestOverlay) return false;
                              const ss = (typeof s === 'string') ? s : (s ? s.toString() : '');
                              const want = (typeof debugFirstTestOverlaySrc === 'string') ? debugFirstTestOverlaySrc : '';
                              if (!ss || !want) return false;
                              return ss.includes(want);
                            } catch {
                              return false;
                            }
                          })();

                          const repeatEnabled = Boolean(
                            v4OvRepeat
                            && idx !== 0
                            && !itemSrc
                            && Number.isFinite(stripeV4HitStepX)
                            && stripeV4HitStepX > 0
                          );

                          const isBwSwapOnly = (() => {
                            try {
                              if (!(stripeVariantEffective === 'white' || stripeVariantEffective === 'black')) return false;
                              if (!byTileSrc || !src0) return false;
                              const a = byTileSrc.toString().split('?')[0] || '';
                              const b = src0.toString().split('?')[0] || '';
                              if (!a || !b) return false;

                              // If the only difference is the bw marker (/black/ vs /white/ or -b/-w)
                              // we must NOT enable tile-sized math. These assets are full-width.
                              const norm = (s) => s
                                .replace(/\/(black|white)\//gi, '/__bw__/')
                                .replace(/-([bw])(-stripe)?\.(webp|png|jpe?g)$/i, '-__bw__$2.$3');

                              const na = norm(a);
                              const nb = norm(b);
                              if (na !== nb) return false;

                              // Only consider it a swap if one side actually contains a bw marker.
                              const hasBwMarker = /\/(black|white)\//i.test(a) || /-([bw])(-stripe)?\.(webp|png|jpe?g)$/i.test(a)
                                || /\/(black|white)\//i.test(b) || /-([bw])(-stripe)?\.(webp|png|jpe?g)$/i.test(b);
                              return !!hasBwMarker;
                            } catch {
                              return false;
                            }
                          })();

                          const isMultiSwapOnly = (() => {
                            try {
                              if (!byTileSrc || !src0) return false;
                              const a = byTileSrc.toString().split('?')[0] || '';
                              const b = src0.toString().split('?')[0] || '';
                              if (!a || !b) return false;
                              if (!(/-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(a) || /-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(b))) return false;

                              // If the only difference is multi-(dark|light), these are still full-width assets.
                              const norm = (s) => s.replace(/-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i, '-multi-__ml__-stripe.$2');
                              if (norm(a) !== norm(b)) return false;

                              return true;
                            } catch {
                              return false;
                            }
                          })();

                          const isFullWidthMultiAsset = (() => {
                            try {
                              const a = (typeof s === 'string') ? s : (s ? s.toString() : '');
                              const p = (a.split('?')[0] || '');
                              return /-multi-(dark|light)-stripe\.(webp|png|jpe?g)$/i.test(p);
                            } catch {
                              return false;
                            }
                          })();

                          const tileSizedOverlay = !isFullWidthMultiAsset && Boolean(
                            (itemSrc
                              || isSingleTileAsset
                              || ((byTileSrc && byTileSrc !== src0) && !isBwSwapOnly && !isMultiSwapOnly))
                            && Number.isFinite(stripeV4HitStepX)
                            && stripeV4HitStepX > 0
                          );

                          if (!stripeOverlayClip && !tileSizedOverlay && !repeatEnabled && idx !== 0) return null;

                          const sEffective = s;
                          const tilePitchXEffective = isSingleTileAsset
                            ? stripeV4HitStepX
                            : ((tileSizedOverlay && Number.isFinite(v4OverlayPitchXEffective) && v4OverlayPitchXEffective > 0)
                                ? v4OverlayPitchXEffective
                                : stripeV4HitStepX);

                          const tileX0Effective = isSingleTileAsset
                            ? 0
                            : ((tileSizedOverlay && Number.isFinite(v4OverlayX0Effective))
                                ? v4OverlayX0Effective
                                : 0);

                          const tileWEffective = isSingleTileAsset
                            ? stripeV4HitStepX
                            : ((tileSizedOverlay && Number.isFinite(v4OverlayWLive) && v4OverlayWLive > 0)
                                ? v4OverlayWLive
                                : tilePitchXEffective);

                          const wImg = tileSizedOverlay ? tileWEffective : wImgDefault;
                          const xImg = tileSizedOverlay
                            ? (xImgBase + tileX0Effective + (idx * tilePitchXEffective) + ((tilePitchXEffective - tileWEffective) / 2))
                            : (() => {
                                try {
                                  if (!repeatEnabled) return xImgBase;

                                  // Use real tile geometry (post-transform) when available.
                                  const refs = stripeV4OverlayTilePathRefs?.current;
                                  const el0 = Array.isArray(refs) ? refs[0] : null;
                                  const elN = Array.isArray(refs) ? refs[idx] : null;
                                  const b0 = el0?.getBBox?.();
                                  const bN = elN?.getBBox?.();
                                  if (b0 && bN && Number.isFinite(b0.x) && Number.isFinite(bN.x)) {
                                    const dx = bN.x - b0.x;
                                    const sx = (Number.isFinite(stripeV4HitTransformEffective?.a) && stripeV4HitTransformEffective.a !== 0)
                                      ? stripeV4HitTransformEffective.a
                                      : 1;
                                    const dxPre = dx / sx;
                                    if (Number.isFinite(dxPre) && dxPre !== 0) return xImgBase - dxPre;
                                  }

                                  // Fallback: pitch-based shift.
                                  const pitch = (Number.isFinite(v4OverlayPitchXEffective) && v4OverlayPitchXEffective > 0)
                                    ? v4OverlayPitchXEffective
                                    : stripeV4HitStepX;
                                  return (Number.isFinite(pitch) && pitch > 0)
                                    ? (xImgBase - (idx * pitch))
                                    : xImgBase;
                                } catch {
                                  return xImgBase;
                                }
                              })();

                          const srcLabel = (() => {
                            try {
                              if (!debugV4OverlaySrc) return null;
                              const tail = s.toString().split('?')[0].split('/').pop() || '';
                              return `${idx + 1}:${tail}`;
                            } catch {
                              return `${idx + 1}:?`;
                            }
                          })();

                          const calibLabel = debugV4OverlayCalib
                            ? (() => {
                                try {
                                  const ovDxStr = Number.isFinite(ovDx) ? ovDx.toFixed(3) : '?';
                                  const ovDyStr = Number.isFinite(ovAdjustDy) ? ovAdjustDy.toFixed(3) : '?';
                                  const ovSStr = Number.isFinite(ovS) ? ovS.toFixed(3) : '?';
                                  const pitchStr = Number.isFinite(tilePitchXEffective) ? tilePitchXEffective.toFixed(3) : '?';
                                  const x0Str = Number.isFinite(tileX0Effective) ? tileX0Effective.toFixed(3) : '?';
                                  const wStr = Number.isFinite(tileWEffective) ? tileWEffective.toFixed(3) : '?';
                                  return `tile=${idx + 1} | ovDx=${ovDxStr} ovDy=${ovDyStr} ovS=${ovSStr} | p=${pitchStr} x0=${x0Str} w=${wStr}`;
                                } catch {
                                  return null;
                                }
                              })()
                            : null;

                          const maskUrl = stripeV4OverlayMaskReady
                            ? `url(#${stripeV4OverlayClipPathId}-tile-${idx})`
                            : undefined;

                          const tileClipUrl = stripeV4OverlayMaskReady
                            ? `url(#${stripeV4OverlayClipPathId}-tileclip-${idx})`
                            : undefined;

                          const unionClipUrl = stripeV4OverlayMaskReady
                            ? `url(#${stripeV4OverlayClipPathId}-clip)`
                            : undefined;

                          const unionMaskUrl = (stripeV4OverlayMaskReady && v4UnionMaskDilate)
                            ? `url(#${stripeV4OverlayClipPathId}-unionmask)`
                            : undefined;

                          const maskInvUrl = stripeV4OverlayMaskReady
                            ? `url(#${stripeV4OverlayClipPathId}-tileinv-${idx})`
                            : undefined;

                          const useFullImgBox = (debugV4ImgBox === 'full') || !tileSizedOverlay;
                          const useBBoxImgBox = (debugV4ImgBox === 'bbox');
                          const bboxForSingleTile = (() => {
                            try {
                              if (!isSingleTileAsset) return null;
                              const hitBBoxes = stripeV4HitTileBBoxes;
                              const hb = (Array.isArray(hitBBoxes) && hitBBoxes.length === 14) ? hitBBoxes[idx] : null;
                              if (hb && Number.isFinite(hb.x) && Number.isFinite(hb.y) && Number.isFinite(hb.width) && hb.width > 0 && Number.isFinite(hb.height) && hb.height > 0) {
                                return hb;
                              }
                              const refs = stripeV4OverlayTilePathRefs?.current;
                              const el = Array.isArray(refs) ? refs[idx] : null;
                              const bb = el?.getBBox?.();
                              if (!bb) return null;
                              if (!Number.isFinite(bb.x) || !Number.isFinite(bb.y)) return null;
                              if (!Number.isFinite(bb.width) || bb.width <= 0) return null;
                              if (!Number.isFinite(bb.height) || bb.height <= 0) return null;
                              return bb;
                            } catch {
                              return null;
                            }
                          })();

                          const imgX = useFullImgBox
                            ? 0
                            : ((useBBoxImgBox && bboxForSingleTile) ? bboxForSingleTile.x : xImg);

                          const imgY = useFullImgBox
                            ? 0
                            : 0;

                          const imgW = useFullImgBox
                            ? stripeV4SvgW
                            : ((useBBoxImgBox && bboxForSingleTile) ? bboxForSingleTile.width : wImg);

                          const imgH = useFullImgBox
                            ? stripeV4SvgH
                            : stripeV4SvgH;

                          const imgTf = undefined;

                          const preserveAspectRatioEffective = debugV4ImgPar || (tileSizedOverlay
                            ? (bboxForSingleTile
                                ? 'xMidYMax meet'
                                : ((isDrawingsOverlay && isSingleTileAsset) ? 'xMidYMid meet' : (isDrawingsOverlay ? 'xMidYMax meet' : 'xMinYMax meet')))
                            : (repeatEnabled ? 'none' : 'xMinYMax meet'));

                          const baseImgInner = (
                            <image
                              key={`v4-overlay-tile-${idx}`}
                              href={sEffective ? encodeURI(sEffective) : sEffective}
                              x={imgX}
                              y={imgY}
                              width={imgW}
                              height={imgH}
                              overflow="visible"
                              preserveAspectRatio={preserveAspectRatioEffective}
                              opacity="1"
                              transform={imgTf}
                              mask={(stripeOverlayClip && stripeOverlayClipDebug && !tileSizedOverlay && !(debugV4UseTileClip || debugNoV4OverlayMask || debugV4LayersOnly === 'raw')) ? maskUrl : undefined}
                              style={{ overflow: 'visible' }}
                            />
                          );

                          const rectClipId = (!stripeOverlayClip && tileSizedOverlay)
                            ? `${stripeV4OverlayClipPathId}-recttile-${idx}`
                            : '';
                          const rectClipUrl = rectClipId ? `url(#${rectClipId})` : '';

                          const rectTileClip = rectClipId ? (
                            <defs>
                              <clipPath id={rectClipId} clipPathUnits="userSpaceOnUse">
                                <rect x={imgX} y={-1000} width={imgW} height={stripeV4SvgH + 2000} />
                              </clipPath>
                            </defs>
                          ) : null;

                          const v4UseClipForTileSized = !!(
                            stripeOverlayClip
                            && tileSizedOverlay
                            && tileClipUrl
                            && !(debugNoV4OverlayMask || debugV4LayersOnly === 'raw')
                          );

                          const v4UseTileClipForFullWidth = !!(
                            stripeOverlayClip
                            && !tileSizedOverlay
                            && tileClipUrl
                            && !(debugNoV4OverlayMask || debugV4LayersOnly === 'raw')
                          );

                          const v4UseMaskForFullWidth = !!(
                            stripeOverlayClip
                            && !tileSizedOverlay
                            && maskUrl
                            && !(debugNoV4OverlayMask || debugV4LayersOnly === 'raw')
                          );

                          const v4ForceTileClipForMaskedDebug = !!(
                            debugV4LayersOnly === 'masked'
                            && stripeOverlayClip
                            && tileClipUrl
                            && !(debugNoV4OverlayMask || debugV4LayersOnly === 'raw')
                          );

                          const baseImg = v4UseMaskForFullWidth
                            ? <g mask={maskUrl}>{baseImgInner}</g>
                            : ((v4ForceTileClipForMaskedDebug || v4UseClipForTileSized || v4UseTileClipForFullWidth || (stripeOverlayClip && debugV4UseTileClip && tileClipUrl))
                              ? <g clipPath={tileClipUrl}>{baseImgInner}</g>
                              : (rectClipUrl ? <g clipPath={rectClipUrl}>{rectTileClip}{baseImgInner}</g> : baseImgInner));

                          const baseImgClipped = (() => {
                            if (!stripeOverlayClip) return baseImg;
                            if (v4UseTileClipForFullWidth || v4UseMaskForFullWidth) return baseImg;
                            if (debugNoV4OverlayMask || debugV4LayersOnly === 'raw' || debugV4LayersOnly === 'masked') return baseImg;

                            // Prefer mask-based union clip when dilate is enabled; filters inside clipPath are unreliable.
                            if (unionMaskUrl) return <g mask={unionMaskUrl}>{baseImg}</g>;
                            if (unionClipUrl) return <g clipPath={unionClipUrl}>{baseImg}</g>;
                            return baseImg;
                          })();

                          const baseBounds = (debugV4ImgBoundsEffective || debugV4LayersOnly === 'bounds') ? (
                            <rect
                              key={`v4-overlay-tile-${idx}-bounds`}
                              x={imgX}
                              y={0}
                              width={imgW}
                              height={stripeV4SvgH}
                              fill="rgba(236, 72, 153, 0.14)"
                              stroke="none"
                              vectorEffect="non-scaling-stroke"
                              pointerEvents="none"
                            />
                          ) : null;

                          const baseUnderlay = (debugV4ImgUnderlayEffective || debugV4LayersOnly === 'underlay') ? (
                            <rect
                              key={`v4-overlay-tile-${idx}-underlay`}
                              x={imgX}
                              y={0}
                              width={imgW}
                              height={stripeV4SvgH}
                              fill={`rgba(255, 255, 255, ${Number.isFinite(debugV4ImgUnderlayOpacity) ? Math.max(0, Math.min(1, debugV4ImgUnderlayOpacity)) : 0.35})`}
                              stroke="none"
                              pointerEvents="none"
                            />
                          ) : null;

                          const baseTileRect = (debugV4TileRects || debugV4LayersOnly === 'tilerects') ? (
                            <rect
                              key={`v4-overlay-tile-${idx}-tilerect`}
                              x={xImg}
                              y={0}
                              width={wImg}
                              height={stripeV4SvgH}
                              fill="none"
                              stroke="rgba(250, 204, 21, 0.95)"
                              strokeWidth={3.2}
                              strokeDasharray="10 6"
                              vectorEffect="non-scaling-stroke"
                              pointerEvents="none"
                            />
                          ) : null;

                          const baseImgRaw = debugV4Layers ? (
                            <image
                              key={`v4-overlay-tile-${idx}-raw`}
                              href={sEffective ? encodeURI(sEffective) : sEffective}
                              x={imgX}
                              y={0}
                              width={imgW}
                              height={stripeV4SvgH}
                              overflow="visible"
                              preserveAspectRatio={debugV4ImgPar || (tileSizedOverlay
                                ? (isDrawingsOverlay ? 'xMidYMax meet' : 'xMinYMax meet')
                                : (repeatEnabled ? 'none' : 'xMinYMax meet'))}
                              opacity={0.55}
                              transform={imgTf}
                              style={{ overflow: 'visible' }}
                            />
                          ) : null;

                          const keptFill = (debugV4LayersOnly === 'kept') ? 'rgba(234, 88, 12, 0.55)' : 'rgba(234, 88, 12, 0.20)';
                          const baseKept = debugV4Layers && maskUrl ? (
                            <rect
                              key={`v4-overlay-tile-${idx}-kept`}
                              x={0}
                              y={0}
                              width={stripeV4SvgW}
                              height={stripeV4SvgH}
                              fill={keptFill}
                              mask={maskUrl}
                            />
                          ) : null;

                          const baseCut = (debugV4Layers && maskInvUrl && (debugV4MaskCut || debugV4LayersOnly === 'cut')) ? (
                            <rect
                              key={`v4-overlay-tile-${idx}-cut`}
                              x={0}
                              y={0}
                              width={stripeV4SvgW}
                              height={stripeV4SvgH}
                              fill="rgba(6, 182, 212, 0.14)"
                              mask={maskInvUrl}
                            />
                          ) : null;

                          const drawDx = (tileSizedOverlay && isDrawingsOverlay)
                            ? ((Number.isFinite(v4DrawDxParam) && v4DrawDxParam !== 0) ? v4DrawDxParam : 0)
                            : 0;
                          const drawDy = (tileSizedOverlay && isDrawingsOverlay)
                            ? ((Number.isFinite(v4DrawDyParam) && v4DrawDyParam !== 0) ? v4DrawDyParam : 0)
                            : 0;
                          const drawS = (tileSizedOverlay && isDrawingsOverlay)
                            ? (() => {
                                const hasExplicit = !!(urlParams && typeof urlParams?.has === 'function' && urlParams.has('v4DrawS'));
                                const fallback = hasExplicit ? 1 : 0.32;
                                const extra = (Number.isFinite(v4DrawScaleParam) && v4DrawScaleParam > 0) ? v4DrawScaleParam : fallback;
                                return extra;
                              })()
                            : 1;

                          const testDx = (tileSizedOverlay && isTestOverlay)
                            ? ((Number.isFinite(v4DrawDxParam) && v4DrawDxParam !== 0) ? v4DrawDxParam : 0)
                            : 0;
                          const testDy = (tileSizedOverlay && isTestOverlay)
                            ? ((Number.isFinite(v4DrawDyParam) && v4DrawDyParam !== 0) ? v4DrawDyParam : 0)
                            : 0;
                          const testS = (tileSizedOverlay && isTestOverlay)
                            ? (() => {
                                const extra = (Number.isFinite(v4DrawScaleParam) && v4DrawScaleParam > 0) ? v4DrawScaleParam : 1;
                                return extra;
                              })()
                            : 1;

                          const effDx = isTestOverlay ? testDx : drawDx;
                          const effDy = isTestOverlay ? testDy : drawDy;
                          const effS = isTestOverlay ? testS : drawS;

                          const ovDxEffective = ovDx;
                          const ovDyEffective = ovAdjustDy;
                          const ovSEffective = ovS;

                          const drawScaled = (effS !== 1)
                            ? (
                                <g transform={`translate(0 ${stripeV4SvgH}) scale(${effS}) translate(0 ${-stripeV4SvgH})`}>
                                  {baseImgClipped}
                                </g>
                              )
                            : baseImgClipped;

                          const boundsDrawScaled = baseBounds
                            ? ((effS !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${effS}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseBounds}
                                    </g>
                                  )
                                : baseBounds)
                            : null;

                          const underlayDrawScaled = baseUnderlay
                            ? ((effS !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${effS}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseUnderlay}
                                    </g>
                                  )
                                : baseUnderlay)
                            : null;

                          const tileRectDrawScaled = baseTileRect
                            ? ((effS !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${effS}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseTileRect}
                                    </g>
                                  )
                                : baseTileRect)
                            : null;

                          const drawMoved = (effDx || effDy)
                            ? <g transform={`translate(${effDx} ${effDy})`}>{drawScaled}</g>
                            : drawScaled;

                          const boundsDrawMoved = boundsDrawScaled
                            ? ((effDx || effDy)
                                ? <g transform={`translate(${effDx} ${effDy})`}>{boundsDrawScaled}</g>
                                : boundsDrawScaled)
                            : null;

                          const underlayDrawMoved = underlayDrawScaled
                            ? ((effDx || effDy)
                                ? <g transform={`translate(${effDx} ${effDy})`}>{underlayDrawScaled}</g>
                                : underlayDrawScaled)
                            : null;

                          const tileRectDrawMoved = tileRectDrawScaled
                            ? ((effDx || effDy)
                                ? <g transform={`translate(${effDx} ${effDy})`}>{tileRectDrawScaled}</g>
                                : tileRectDrawScaled)
                            : null;

                          const scaled = (ovSEffective !== 1)
                            ? (
                                <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                  {drawMoved}
                                </g>
                              )
                            : drawMoved;

                          const scaledBounds = boundsDrawMoved
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {boundsDrawMoved}
                                    </g>
                                  )
                                : boundsDrawMoved)
                            : null;

                          const scaledUnderlay = underlayDrawMoved
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {underlayDrawMoved}
                                    </g>
                                  )
                                : underlayDrawMoved)
                            : null;

                          const scaledTileRect = tileRectDrawMoved
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {(Array.isArray(v4TileOverlaySrcs) ? v4TileOverlaySrcs : Array.from({ length: 14 }).map(() => null)).map((s, idx) => {
                                        try {
                                          if (debugV4OnlyTile && (idx + 1) !== debugV4OnlyTile) return null;
                                          const itemSrc = overlayItemSrcByTileIdx(idx);
                                          const byTileSrc = overlaySrcForRenderByTileIdx(idx);
                                          const src0 = overlaySrcForRenderByTileIdx(0);
                                          const srcOk = Array.isArray(v4TileOverlayLoad)
                                            ? v4TileOverlayLoad[idx]
                                            : null;
                                          const sEffective = (debugV4ForceTiles && !srcOk)
                                            ? '/placeholders/t-shirt_buttons/v4/full-color-stripe-4.webp'
                                            : s;
                                          return (
                                            <image
                                              key={`v4-overlay-tile-${idx}-raw`}
                                              href={sEffective ? encodeURI(sEffective) : sEffective}
                                              x={imgX}
                                              y={0}
                                              width={imgW}
                                              height={stripeV4SvgH}
                                              preserveAspectRatio={debugV4ImgPar || (tileSizedOverlay
                                                ? (isDrawingsOverlay ? 'xMidYMax meet' : 'xMinYMax meet')
                                                : (repeatEnabled ? 'none' : 'xMinYMax meet'))}
                                              opacity={0.55}
                                            />
                                          );
                                        } catch {
                                          return null;
                                        }
                                      })}
                                    </g>
                                  )
                                : tileRectDrawMoved)
                            : null;

                          const scaledRaw = (debugV4Layers && baseImgRaw)
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseImgRaw}
                                    </g>
                                  )
                                : baseImgRaw)
                            : null;

                          const scaledKept = (debugV4Layers && baseKept)
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseKept}
                                    </g>
                                  )
                                : baseKept)
                            : null;

                          const scaledCut = (debugV4Layers && baseCut)
                            ? ((ovSEffective !== 1)
                                ? (
                                    <g transform={`translate(0 ${stripeV4SvgH}) scale(${ovSEffective}) translate(0 ${-stripeV4SvgH})`}>
                                      {baseCut}
                                    </g>
                                  )
                                : baseCut)
                            : null;

                          const wrapped = applyTransforms
                            ? transforms.reduce(
                                (child, t, i) => <g key={`v4-overlay-tile-${idx}-t-${i}`} transform={t}>{child}</g>,
                                scaled,
                              )
                            : scaled;

                          const wrappedBounds = (debugV4ImgBoundsEffective || debugV4LayersOnly === 'bounds') && scaledBounds
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-bounds-t-${i}`} transform={t}>{child}</g>,
                                    scaledBounds,
                                  )
                                : scaledBounds)
                            : null;

                          const wrappedUnderlay = (debugV4ImgUnderlayEffective || debugV4LayersOnly === 'underlay') && scaledUnderlay
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-underlay-t-${i}`} transform={t}>{child}</g>,
                                    scaledUnderlay,
                                  )
                                : scaledUnderlay)
                            : null;

                          const wrappedTileRect = (debugV4TileRects || debugV4LayersOnly === 'tilerects') && scaledTileRect
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-tilerect-t-${i}`} transform={t}>{child}</g>,
                                    scaledTileRect,
                                  )
                                : scaledTileRect)
                            : null;

                          const wrappedRaw = (debugV4Layers && scaledRaw)
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-raw-t-${i}`} transform={t}>{child}</g>,
                                    scaledRaw,
                                  )
                                : scaledRaw)
                            : null;

                          const wrappedKept = (debugV4Layers && scaledKept)
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-kept-t-${i}`} transform={t}>{child}</g>,
                                    scaledKept,
                                  )
                                : scaledKept)
                            : null;

                          const wrappedCut = (debugV4Layers && scaledCut)
                            ? (applyTransforms
                                ? transforms.reduce(
                                    (child, t, i) => <g key={`v4-overlay-tile-${idx}-cut-t-${i}`} transform={t}>{child}</g>,
                                    scaledCut,
                                  )
                                : scaledCut)
                            : null;
                          const moved = (ovDxEffective || ovDyEffective)
                            ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrapped}</g>
                            : wrapped;

                          const movedBounds = wrappedBounds
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedBounds}</g>
                                : wrappedBounds)
                            : null;

                          const movedUnderlay = wrappedUnderlay
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedUnderlay}</g>
                                : wrappedUnderlay)
                            : null;

                          const movedTileRect = wrappedTileRect
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedTileRect}</g>
                                : wrappedTileRect)
                            : null;

                          const movedRaw = (debugV4Layers && wrappedRaw)
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedRaw}</g>
                                : wrappedRaw)
                            : null;

                          const movedKept = (debugV4Layers && wrappedKept)
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedKept}</g>
                                : wrappedKept)
                            : null;

                          const movedCut = (debugV4Layers && wrappedCut)
                            ? ((ovDxEffective || ovDyEffective)
                                ? <g transform={`translate(${ovDxEffective} ${ovDyEffective})`}>{wrappedCut}</g>
                                : wrappedCut)
                            : null;
                          if (!applyAlign && !debugV4Layers) return moved;
                          const aligned = stripeV4HitAlignTopDy
                            ? <g key={`v4-overlay-tile-${idx}-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{moved}</g>
                            : moved;

                          const alignedBounds = movedBounds
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-bounds-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedBounds}</g>
                                : movedBounds)
                            : null;

                          const alignedUnderlay = movedUnderlay
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-underlay-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedUnderlay}</g>
                                : movedUnderlay)
                            : null;

                          const alignedTileRect = movedTileRect
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-tilerect-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedTileRect}</g>
                                : movedTileRect)
                            : null;

                          const alignedRaw = (debugV4Layers && movedRaw)
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-raw-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedRaw}</g>
                                : movedRaw)
                            : null;

                          const alignedKept = (debugV4Layers && movedKept)
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-kept-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedKept}</g>
                                : movedKept)
                            : null;

                          const alignedCut = (debugV4Layers && movedCut)
                            ? (stripeV4HitAlignTopDy
                                ? <g key={`v4-overlay-tile-${idx}-cut-align`} transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{movedCut}</g>
                                : movedCut)
                            : null;

                          const layers = debugV4Layers ? (
                            <g key={`v4-overlay-tile-${idx}-layers`}>
                              {(debugV4ImgUnderlayEffective || debugV4LayersOnly === 'underlay') ? alignedUnderlay : null}
                              {(debugV4TileRects || debugV4LayersOnly === 'tilerects') ? alignedTileRect : null}
                              {debugV4LayersOnly === 'raw' ? alignedRaw : null}
                              {debugV4LayersOnly === 'kept' ? alignedKept : null}
                              {debugV4LayersOnly && debugV4LayersOnly !== 'cut' ? null : alignedCut}
                              {debugV4LayersOnly === 'masked' ? aligned : null}
                              {(debugV4ImgBoundsEffective || debugV4LayersOnly === 'bounds') ? alignedBounds : null}
                            </g>
                          ) : null;

                          if (debugV4Layers && debugV4LayersOnly) return layers;
                          if (debugV4Layers) return <g key={`v4-overlay-tile-${idx}-withlayers`}>{layers}{aligned}</g>;

                          const debugOverlay = (
                            <StripeV4OverlayTileDebug
                              debugV4OverlayDebug={debugV4OverlayOutlines}
                              stripeV4HitTilePathDs={stripeV4HitTilePathDs}
                              idx={idx}
                              xImg={xImg}
                              wImg={wImg}
                              stripeV4SvgH={stripeV4SvgH}
                              debugOrangeRectDy={(() => {
                                const pxToSvgY = (Number.isFinite(viewportH) && viewportH > 0) ? (stripeV4SvgH / viewportH) : 1;
                                return -1 * pxToSvgY;
                              })()}
                              debugBluePathDy={(() => {
                                const pxToSvgY = (Number.isFinite(viewportH) && viewportH > 0) ? (stripeV4SvgH / viewportH) : 1;
                                const base = -6;
                                const extra = (Number.isFinite(debugBluePathPxDy) ? debugBluePathPxDy : 0);
                                return (base + extra) * pxToSvgY;
                              })()}
                              debugV4OverlayOutlineDy={debugV4OverlayOutlineDy}
                              debugV4OverlayOutlineSy={debugV4OverlayOutlineSy}
                              debugV4OverlayOutlineDx={debugV4OverlayOutlineDx}
                              applyTransforms={applyTransforms}
                              transforms={transforms}
                              applyAlign={applyAlign}
                              stripeV4HitAlignTopDy={stripeV4HitAlignTopDy}
                              unionAdjustTf={unionAdjustTf}
                              debugSpriteDx={debugSpriteDxSvg}
                              debugSpriteDy={debugSpriteDySvg}
                              debugV4OverlayDebugDx={debugV4OverlayDebugDx}
                            />
                          );

                          return (
                            <g key={`v4-overlay-tile-${idx}-wrap`}>
                              {aligned}
                              {debugOverlay}
                              {calibLabel ? (
                                <g pointerEvents="none">
                                  <circle
                                    cx={420}
                                    cy={-86}
                                    r={6}
                                    fill="rgba(0, 0, 0, 0.85)"
                                  />
                                  <rect
                                    x={432}
                                    y={-120}
                                    width={520}
                                    height={66}
                                    rx={6}
                                    fill="rgba(255, 255, 255, 0.92)"
                                    stroke="rgba(0, 0, 0, 0.85)"
                                    strokeWidth={2}
                                  />
                                  <text
                                    x={438}
                                    y={-116}
                                    fontSize={16}
                                    fill="rgba(0, 0, 0, 0.92)"
                                    dominantBaseline="hanging"
                                  >
                                    {(() => {
                                      try {
                                        const tokens = String(calibLabel).split(' | ');
                                        const lines = [
                                          tokens.slice(0, 4).join(' | '),
                                          tokens.slice(4, 8).join(' | '),
                                          tokens.slice(8).join(' | '),
                                        ].filter(Boolean);
                                        return lines.map((line, i) => (
                                          <tspan key={i} x={438} dy={i === 0 ? 0 : 18}>
                                            {line}
                                          </tspan>
                                        ));
                                      } catch {
                                        return calibLabel;
                                      }
                                    })()}
                                  </text>
                                </g>
                              ) : null}
                              {debugV4OverlaySrc ? (
                                <text
                                  x={labelX0 + (idx * labelPitchX) + 6}
                                  y={18}
                                  fontSize={12}
                                  fill="rgba(0,0,0,0.75)"
                                  stroke="rgba(255,255,255,0.85)"
                                  strokeWidth={3}
                                  paintOrder="stroke"
                                  pointerEvents="none"
                                >
                                  {srcLabel}
                                </text>
                              ) : null}
                            </g>
                          );
                        };

                        const tileIndices = debugV4OnlyTile
                          ? [Math.max(0, Math.min(13, debugV4OnlyTile - 1))]
                          : Array.from({ length: 14 }).map((_, idx) => idx);

                        return <>{tileIndices.map((idx) => mkTile(idx))}</>;
                      })()}
                    </g>
                  )
                })()}
                {debugV4OverlayCalib ? (
                  <g pointerEvents="none">
                    <rect
                      x={260}
                      y={-52}
                      width={1100}
                      height={46}
                      rx={8}
                      fill="rgba(0,0,0,0.92)"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={2.5}
                    />
                    <text
                      x={270}
                      y={-46}
                      fontSize={22}
                      fill="rgba(255, 255, 255, 0.98)"
                      stroke="rgba(0,0,0,0.98)"
                      strokeWidth={7}
                      paintOrder="stroke"
                      dominantBaseline="hanging"
                    >
                      {`debugV4OverlayCalib=1 | ovX=${Number.isFinite(stripeOverlayX) ? stripeOverlayX.toFixed(3) : '?'} ovY=${Number.isFinite(stripeOverlayY) ? stripeOverlayY.toFixed(3) : '?'} ovS=${Number.isFinite(stripeOverlayScale) ? stripeOverlayScale.toFixed(3) : '?'}`}
                    </text>
                  </g>
                ) : null}
                </g>
              </svg>
            ) : null}

            <div
              role="button"
              tabIndex={0}
              aria-label="stripe"
              className="absolute left-0 top-0"
              style={{
                width: `${spriteW}px`,
                height: `${viewportH}px`,
                pointerEvents: stripeV4HitTilesEnabled ? 'none' : 'auto',
                background: 'transparent',
                cursor: (stripeV4FullHitEnabled ? (v4HitHover ? 'pointer' : 'default') : 'pointer'),
              }}
              onPointerMove={(e) => {
                try {
                  if (!stripeV4FullHitEnabled) return;
                  const pathEl = stripeV4HitPathElRef.current;
                  const unionSvgEl = pathEl?.ownerSVGElement || stripeV4HitSvgRef.current;
                  if (!unionSvgEl || !pathEl) return;
                  const pt = unionSvgEl.createSVGPoint?.();
                  if (!pt) return;
                  pt.x = e.clientX;
                  pt.y = e.clientY;

                  const pathCtm = pathEl.getScreenCTM?.();
                  if (!pathCtm) return;
                  const localPath = pt.matrixTransform(pathCtm.inverse());
                  const inside = typeof pathEl.isPointInFill === 'function'
                    ? pathEl.isPointInFill(localPath)
                    : true;
                  setV4HitHover(Boolean(inside));
                } catch {
                  // ignore
                }
              }}
              onPointerLeave={() => {
                if (!stripeV4FullHitEnabled) return;
                setV4HitHover(false);
              }}
              onPointerDown={(e) => {
                try {
                  e.preventDefault();
                  if (stripeV4FullHitEnabled) {
                    const pathEl = stripeV4HitPathElRef.current;
                    const unionSvgEl = pathEl?.ownerSVGElement || stripeV4HitSvgRef.current;
                    if (unionSvgEl && pathEl) {
                      const pt = unionSvgEl.createSVGPoint?.();
                      if (pt) {
                        pt.x = e.clientX;
                        pt.y = e.clientY;

                        const pathCtm = pathEl.getScreenCTM?.();
                        if (!pathCtm) return;
                        const localPath = pt.matrixTransform(pathCtm.inverse());

                        const svgCtm = unionSvgEl.getScreenCTM?.();
                        const localSvg = svgCtm ? pt.matrixTransform(svgCtm.inverse()) : null;

                        if (debugStripeHitEffective) {
                          if (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y)) {
                            setV4HitDebugLastPt({ x: localSvg.x, y: localSvg.y, kind: 'svg' });
                          }
                          // eslint-disable-next-line no-console
                          console.log('[StripeV4 hit]', {
                            client: { x: e.clientX, y: e.clientY },
                            localUnion: { x: localPath.x, y: localPath.y },
                          });

                          try {
                            const r = unionSvgEl.getBoundingClientRect?.();
                            const mat = (m) => (m ? ({ a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f }) : null);
                            // eslint-disable-next-line no-console
                            console.log('[StripeV4 hit diag]', {
                              svgRect: r ? { l: r.left, t: r.top, w: r.width, h: r.height } : null,
                              svgCtm: mat(svgCtm),
                              pathCtm: mat(pathCtm),
                              localSvg: localSvg ? { x: localSvg.x, y: localSvg.y } : null,
                              localUnion: { x: localPath.x, y: localPath.y },
                              dSvgMinusUnion: (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y))
                                ? { x: localSvg.x - localPath.x, y: localSvg.y - localPath.y }
                                : null,
                            });
                          } catch {
                            // ignore
                          }
                        }

                        const inside = typeof pathEl.isPointInFill === 'function'
                          ? pathEl.isPointInFill(localPath)
                          : true;
                        if (!inside) return;

                        // Prefer silhouette-based selection (tile paths) to avoid "random" hits
                        // when collars/shoulders overlap or when pitch/x0 doesn't match the true geometry.
                        if (stripeV4HitTilesEnabled && stripeV4HitTilePathRefs?.current) {
                          const els = Array.isArray(stripeV4HitTilePathRefs.current)
                            ? stripeV4HitTilePathRefs.current.slice(0, 14)
                            : [];
                          if (els.length >= 14) {
                            const hitExpand = (Number.isFinite(stripeV4HitExpandPx) && stripeV4HitExpandPx > 0) ? stripeV4HitExpandPx : 0;
                            for (let i = 13; i >= 0; i -= 1) {
                              const el = els[i];
                              try {
                                const elCtm = el?.getScreenCTM?.();
                                if (!elCtm) continue;
                                const localEl = pt.matrixTransform(elCtm.inverse());
                                const hitFill = (el && typeof el.isPointInFill === 'function') ? el.isPointInFill(localEl) : false;
                                const hitStroke = (!hitFill && hitExpand > 0 && el && typeof el.isPointInStroke === 'function')
                                  ? el.isPointInStroke(localEl)
                                  : false;
                                const hit = hitFill || hitStroke;
                                if (hit) {
                                  if (debugStripeHitEffective) {
                                    if (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y)) {
                                      setV4HitDebugLastPt({ x: localSvg.x, y: localSvg.y, kind: 'svg', idx: i });
                                    }
                                    // eslint-disable-next-line no-console
                                    console.log('[StripeV4 hit tile]', {
                                      idx: i,
                                      slug: `t${i + 1}`,
                                      localTile: { x: localEl.x, y: localEl.y },
                                      localUnion: { x: localPath.x, y: localPath.y },
                                    });
                                  }
                                  const slug = `t${i + 1}`;
                                  setLastClickedSlug(slug);
                                  onSelect?.(slug);
                                  return;
                                }
                              } catch {
                                // ignore
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  const r = e.currentTarget.getBoundingClientRect();
                  const xPx = e.clientX - r.left;
                  const wPx = Math.max(1, r.width);
                  const xSvg = (xPx / wPx) * stripeV4SvgW;

                  const pitch = Number.isFinite(v4OverlayPitchXEffective) ? v4OverlayPitchXEffective : stripeV4HitStepX;
                  const x0 = Number.isFinite(v4OverlayX0Effective) ? v4OverlayX0Effective : 0;
                  const idx = Math.max(0, Math.min(13, Math.floor((xSvg - x0) / Math.max(1e-6, pitch))));
                  setLastClickedSlug(`t${idx + 1}`);
                  onSelect?.(`t${idx + 1}`);
                } catch {
                  // ignore
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                setLastClickedSlug('t1');
                onSelect?.('t1');
              }}
            />

            {stripeV4HitTilesEnabled ? (
              <svg
                className="absolute left-0 bottom-0"
                viewBox={`0 0 ${stripeV4SvgW} ${stripeV4SvgH}`}
                preserveAspectRatio="xMinYMax meet"
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                  zIndex: 125,
                  pointerEvents: 'auto',
                }}
                onPointerDown={(e) => {
                  try {
                    e.preventDefault();
                    const svgEl = e.currentTarget;
                    const pt = svgEl?.createSVGPoint?.();
                    if (!pt) return;
                    pt.x = e.clientX;
                    pt.y = e.clientY;

                    const unionEl = stripeV4HitPathElRef.current;
                    const unionCtm = unionEl?.getScreenCTM?.();
                    const localUnion = (unionCtm && typeof pt.matrixTransform === 'function')
                      ? pt.matrixTransform(unionCtm.inverse())
                      : null;

                    const unionSvgEl = unionEl?.ownerSVGElement || stripeV4HitSvgRef.current;
                    const svgCtm = unionSvgEl?.getScreenCTM?.();
                    const localSvg = svgCtm ? pt.matrixTransform(svgCtm.inverse()) : null;

                    if (debugStripeHitEffective && localUnion && Number.isFinite(localUnion.x) && Number.isFinite(localUnion.y)) {
                      if (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y)) {
                        setV4HitDebugLastPt({ x: localSvg.x, y: localSvg.y, kind: 'svg' });
                      }
                      // eslint-disable-next-line no-console
                      console.log('[StripeV4 hit]', {
                        client: { x: e.clientX, y: e.clientY },
                        localUnion: { x: localUnion.x, y: localUnion.y },
                      });

                      try {
                        const r = unionSvgEl?.getBoundingClientRect?.();
                        const mat = (m) => (m ? ({ a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f }) : null);
                        // eslint-disable-next-line no-console
                        console.log('[StripeV4 hit diag]', {
                          svgRect: r ? { l: r.left, t: r.top, w: r.width, h: r.height } : null,
                          svgCtm: mat(svgCtm),
                          pathCtm: mat(unionCtm),
                          localSvg: localSvg ? { x: localSvg.x, y: localSvg.y } : null,
                          localUnion: { x: localUnion.x, y: localUnion.y },
                          dSvgMinusUnion: (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y))
                            ? { x: localSvg.x - localUnion.x, y: localSvg.y - localUnion.y }
                            : null,
                        });
                      } catch {
                        // ignore
                      }
                    }

                    const els = Array.isArray(stripeV4HitTilePathRefs.current)
                      ? stripeV4HitTilePathRefs.current.slice(0, 14)
                      : [];
                    if (els.length < 14) return;

                    const hitExpand = (Number.isFinite(stripeV4HitExpandPx) && stripeV4HitExpandPx > 0) ? stripeV4HitExpandPx : 0;

                    for (let i = 13; i >= 0; i -= 1) {
                      const el = els[i];
                      try {
                        const elCtm = el?.getScreenCTM?.();
                        if (!elCtm) continue;
                        const localEl = pt.matrixTransform(elCtm.inverse());
                        const hitFill = (el && typeof el.isPointInFill === 'function') ? el.isPointInFill(localEl) : false;
                        const hitStroke = (!hitFill && hitExpand > 0 && el && typeof el.isPointInStroke === 'function')
                          ? el.isPointInStroke(localEl)
                          : false;
                        const hit = hitFill || hitStroke;
                        if (hit) {
                          if (debugStripeHitEffective) {
                            if (localSvg && Number.isFinite(localSvg.x) && Number.isFinite(localSvg.y)) {
                              setV4HitDebugLastPt({ x: localSvg.x, y: localSvg.y, kind: 'svg', idx: i });
                            }
                            // eslint-disable-next-line no-console
                            console.log('[StripeV4 hit tile]', {
                              idx: i,
                              slug: `t${i + 1}`,
                              localTile: { x: localEl.x, y: localEl.y },
                              localUnion: localUnion ? { x: localUnion.x, y: localUnion.y } : null,
                            });
                          }
                          const slug = `t${i + 1}`;
                          setLastClickedSlug(slug);
                          onSelect?.(slug);
                          return;
                        }
                      } catch {
                        // ignore
                      }
                    }
                  } catch {
                    // ignore
                  }
                }}
              >
                {(() => {
                  const makeTilePath = (d, idx) => {
                    const hitExpand = (Number.isFinite(stripeV4HitExpandPx) && stripeV4HitExpandPx > 0) ? stripeV4HitExpandPx : 0;
                    const hitPath = (
                      <path
                        key={`v4-hit-tile-hit-${idx}`}
                        ref={(el) => {
                          try {
                            if (!stripeV4HitTilePathRefs.current) stripeV4HitTilePathRefs.current = [];
                            stripeV4HitTilePathRefs.current[idx] = el;
                          } catch {
                            // ignore
                          }
                        }}
                        d={d}
                        fill="black"
                        fillOpacity={0}
                        stroke={hitExpand > 0 ? 'transparent' : 'none'}
                        strokeWidth={hitExpand > 0 ? (hitExpand * 2) : 0}
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="none"
                      />
                    );

                    const haloPath = (debugStripeHitViz && hitExpand > 0) ? (
                      <path
                        key={`v4-hit-tile-halo-${idx}`}
                        d={d}
                        fill="none"
                        stroke="rgba(0, 180, 255, 0.18)"
                        strokeWidth={hitExpand * 2}
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="none"
                      />
                    ) : null;

                    const vizPath = debugStripeHitViz ? (
                      <path
                        key={`v4-hit-tile-viz-${idx}`}
                        d={d}
                        fill="rgba(0, 180, 255, 0.35)"
                        fillOpacity={0.35}
                        stroke={
                          lastClickedSlug === `t${idx + 1}`
                            ? 'rgba(255, 0, 0, 0.85)'
                            : 'rgba(0, 0, 0, 0.35)'
                        }
                        strokeWidth={lastClickedSlug === `t${idx + 1}` ? 2 : 1}
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="none"
                        style={{ cursor: 'pointer' }}
                      />
                    ) : null;

                    return (
                      <g key={`v4-hit-tile-${idx}`}>
                        {hitPath}
                        {haloPath}
                        {vizPath}
                      </g>
                    );
                  };

                  const paths = stripeV4HitTilePathDs.slice(0, 14).map(makeTilePath);
                  const wrapped = (Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : []).reduce(
                    (child, t, i) => <g key={`v4-hit-tiles-t-${i}`} transform={t}>{child}</g>,
                    <g>{paths}</g>,
                  );
                  const inner = <g>{wrapped}</g>;
                  return v4HitTf ? <g transform={v4HitTf}>{inner}</g> : inner;
                })()}
              </svg>
            ) : null}

            {stripeV4FullHitEnabled ? (
              <svg
                className="pointer-events-none absolute left-0 bottom-0"
                viewBox={`0 0 ${stripeV4SvgW} ${stripeV4SvgH}`}
                preserveAspectRatio="xMinYMax meet"
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                  zIndex: 180,
                  pointerEvents: 'none',
                }}
                ref={stripeV4HitSvgRef}
              >
                {debugStripeHitEffective && v4HitDebugLastPt && Number.isFinite(v4HitDebugLastPt.x) && Number.isFinite(v4HitDebugLastPt.y) ? (
                  <g pointerEvents="none">
                    <circle
                      cx={v4HitDebugLastPt.x}
                      cy={v4HitDebugLastPt.y}
                      r={8}
                      fill="rgba(34, 197, 94, 0.35)"
                      stroke="rgba(34, 197, 94, 0.95)"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ) : null}
                {(() => {
                  const union = (debugStripeAreas || debugV4UnionMask || debugV4ClipOnly) ? (
                    (() => {
                      if (debugV4ClipOnly && stripeOverlayClip) return null;
                      const base = (
                        <path
                          d={stripeV4HitPathD}
                          fill={debugV4ClipOnly ? "rgba(236, 72, 153, 0.25)" : "rgba(239, 68, 68, 0.45)"}
                          fillRule={v4UnionMaskRule}
                          clipRule={v4UnionMaskRule}
                          stroke="none"
                          strokeWidth={0}
                        />
                      );

                      const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                      const wrappedPath = transforms.reduce(
                        (child, t, i) => <g key={`v4-hit-red-t-${i}`} transform={t}>{child}</g>,
                        base,
                      );

                      const inner = <g>{wrappedPath}</g>;
                      return stripeV4HitAlignTopDy
                        ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{inner}</g>
                        : inner;
                    })()
                  ) : null;

                  const hitPath = (
                    <path
                      ref={stripeV4HitPathElRef}
                      d={stripeV4HitPathD}
                      fill={debugStripeHitEffective ? 'none' : 'rgba(0,0,0,0.001)'}
                      stroke="transparent"
                      strokeWidth={0}
                      vectorEffect="non-scaling-stroke"
                    />
                  );

                  const transforms = Array.isArray(stripeV4HitTransforms) ? stripeV4HitTransforms : [];
                  const wrappedPath = transforms.reduce(
                    (child, t, i) => <g key={`v4-hit-t-${i}`} transform={t}>{child}</g>,
                    hitPath,
                  );

                  const inner = <g ref={stripeV4HitGroupRef}>{wrappedPath}</g>;

                  const all = <g>{union}{inner}</g>;
                  return v4HitTf ? <g transform={v4HitTf}>{all}</g> : all;
                })()}
              </svg>
            ) : null}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {stripeBeltGuides && beltGuideXPx && typeof document !== 'undefined'
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[32000] debug-exempt" data-dev-overlay="true">
              {(() => {
                const t14cFallbackFromBelt = (Number.isFinite(beltGuideXPx?.left) && Number.isFinite(beltGuideXPx?.right) && beltGuideXPx.right > beltGuideXPx.left)
                  ? (beltGuideXPx.left + (beltGuideXPx.right - beltGuideXPx.left) * (13.5 / 14))
                  : null;
                const t14cFallbackFromZoom = (stripeZoomHud?.tile14
                  && Number.isFinite(stripeZoomHud.tile14.l)
                  && Number.isFinite(stripeZoomHud.tile14.r))
                  ? ((stripeZoomHud.tile14.l + stripeZoomHud.tile14.r) / 2)
                  : null;
                const t14cGuideX = (Number.isFinite(beltGuideXPx?.t14c)
                  ? beltGuideXPx.t14c
                  : (Number.isFinite(t14cFallbackFromZoom) ? t14cFallbackFromZoom : t14cFallbackFromBelt)) + 4;
                return Number.isFinite(t14cGuideX) ? (
                  <div
                    className="fixed top-0 h-screen"
                    style={{
                      left: `${t14cGuideX}px`,
                      width: '1px',
                      background: 'rgba(250, 204, 21, 0.75)',
                    }}
                  />
                ) : null;
              })()}
              {Number.isFinite(beltGuideXPx.left) ? (
                <div
                  className="fixed top-0 h-screen"
                  style={{
                    left: `${beltGuideXPx.left}px`,
                    width: '1px',
                    background: 'rgba(34, 197, 94, 0.55)',
                  }}
                />
              ) : null}
              {Number.isFinite(beltGuideXPx.right) ? (
                <div
                  className="fixed top-0 h-screen"
                  style={{
                    left: `${beltGuideXPx.right}px`,
                    width: '1px',
                    background: 'rgba(34, 197, 94, 0.55)',
                  }}
                />
              ) : null}
            </div>,
            document.body,
          )
        : null}

      {stripeBeltGuides && wsEnabled && stripeZoomHud && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[32010] rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white"
              style={{
                top: '38px',
                left: '38px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div>Zoom HUD</div>
              <div>dpr: {Number.isFinite(stripeZoomHud.dpr) ? stripeZoomHud.dpr : '—'}</div>
              <div>innerW: {Number.isFinite(stripeZoomHud.innerW) ? stripeZoomHud.innerW : '—'}</div>
              <div>
                t1 L:{stripeZoomHud.tile1 ? stripeZoomHud.tile1.l.toFixed(3) : '—'}
                {' '}R:{stripeZoomHud.tile1 ? stripeZoomHud.tile1.r.toFixed(3) : '—'}
                {' '}W:{stripeZoomHud.tile1 ? stripeZoomHud.tile1.w.toFixed(3) : '—'}
              </div>
              <div>
                t14 L:{stripeZoomHud.tile14 ? stripeZoomHud.tile14.l.toFixed(3) : '—'}
                {' '}R:{stripeZoomHud.tile14 ? stripeZoomHud.tile14.r.toFixed(3) : '—'}
                {' '}W:{stripeZoomHud.tile14 ? stripeZoomHud.tile14.w.toFixed(3) : '—'}
              </div>
              <div>
                gaps L:{stripeZoomHud.tile1 ? stripeZoomHud.tile1.l.toFixed(3) : '—'}
                {' '}R:{stripeZoomHud.tile14 ? (stripeZoomHud.innerW - stripeZoomHud.tile14.r).toFixed(3) : '—'}
              </div>
              <div>
                span:{stripeZoomHud.tile1 && stripeZoomHud.tile14
                  ? (stripeZoomHud.tile14.r - stripeZoomHud.tile1.l).toFixed(3)
                  : '—'}
              </div>
            </div>,
            document.body,
          )
        : null}

      {stripeV2 && stripeV3 ? (
        <div
          ref={stripeRootRef}
          data-stripe-root="true"
          className="absolute left-0 top-0 z-[10] w-full"
          style={{
            height: `${(stripeV2 ? (containerH + 3) : containerH)}px`,
            pointerEvents: 'auto',
            opacity: (!stripeV3Ready || (stripeBeltGuides && stripeZoomSettling)) ? 0 : 1,
            overflowX: 'visible',
            overflowY: 'visible',
            left: stripeV2ViewportExtendLeftPx ? `${-stripeV2ViewportExtendLeftPx}px` : undefined,
            width: (stripeV2ViewportExtendLeftPx || stripeV2ViewportTrimRightPx)
              ? `calc(100% + ${stripeV2ViewportExtendLeftPx}px - ${stripeV2ViewportTrimRightPx}px)`
              : undefined,
          }}
        >
          {stripeCalibHud}
          {stripeBeltGuides && stripeV3Fit && Number.isFinite(stripeV3Fit.targetBottomLocal) ? (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${Math.round(stripeV3Fit.targetBottomLocal)}px`,
                height: '1px',
                background: 'rgba(255, 0, 0, 0.55)',
                pointerEvents: 'none',
              }}
            />
          ) : null}

          <div
            data-stripe-track="true"
            className="absolute left-0 top-0 w-full"
            style={{
              height: `${(stripeV2 ? (containerH + 3 + (stripeV2Sprite ? 13 : 0)) : containerH)}px`,
              pointerEvents: 'auto',
              transform: stripeV3Fit
                ? `matrix(${stripeV3Fit.scale}, 0, 0, ${stripeV3Fit.scale}, ${snapToDevicePx(stripeV2ViewportExtendLeftPx + stripeV3Fit.tx)}, ${snapToDevicePx((Number.isFinite(stripeV3Fit.ty) ? stripeV3Fit.ty : 0) + (Number.isFinite(stripeV3YOffsetPx) ? stripeV3YOffsetPx : 0))})`
                : undefined,
              transformOrigin: '0px 100%'
            }}
          >
            <img
              ref={stripeV3SpriteImgRef}
              src={stripeV3Src}
              alt=""
              className="pointer-events-none absolute left-0 bottom-0 block"
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'left bottom',
              }}
            />

            {stripeRefMockupSrc ? (() => {
              const pickTargetIdx = () => {
                if (Number.isFinite(stripeRefTargetIndex) && stripeRefTargetIndex >= 1 && stripeRefTargetIndex <= 14) return stripeRefTargetIndex - 1;
                if (stripeRefTargetSlug) {
                  const found = (items || []).findIndex((s) => s === stripeRefTargetSlug);
                  if (found >= 0) return found;
                }
                return 8;
              };
              const idx = pickTargetIdx();
              const tileLeftX = stripeV4Engine
                ? (stripeV4HitStepX * idx)
                : ((v3TileAnchorXLive + (v3TileStepXLive * (idx - v3TileAnchorIndexLive))) + v3TileX0Live);
              const leftPct = tileLeftX / (stripeV4Engine ? stripeV4SvgW : stripeV3SvgW);
              const wPct = (stripeV4Engine ? stripeV4HitStepX : v3TileWLive) / (stripeV4Engine ? stripeV4SvgW : stripeV3SvgW);
              if (!Number.isFinite(leftPct) || !Number.isFinite(wPct)) return null;

              const tile1LeftX = stripeV4Engine
                ? 0
                : ((v3TileAnchorXLive + (v3TileStepXLive * (0 - v3TileAnchorIndexLive))) + v3TileX0Live);
              const tile1LeftPct = tile1LeftX / (stripeV4Engine ? stripeV4SvgW : stripeV3SvgW);
              const ref2LeftPct = (stripeCalibMode === 'ref2') ? leftPct : tile1LeftPct;

              return (
                <>
                  <div
                    className="pointer-events-none absolute top-0 h-full"
                    style={{
                      left: `${leftPct * 100}%`,
                      width: `${wPct * 100}%`,
                      overflow: 'visible',
                      zIndex: 140,
                    }}
                  >
                    <img
                      src={stripeRefMockupSrc}
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
                      style={{
                        opacity: (stripeCalibEnabled || stripeCalibMode === 'ref' || stripeCalibMode === 'overlay' || stripeCalibMode === 'ref2')
                          ? 0.42
                          : stripeRefOpacity,
                        mixBlendMode: 'normal',
                        filter: undefined,
                        transform: `translate(${stripeRefX}px, ${stripeRefY + stripeRefRenderYOffsetPx}px) scale(${stripeRefScale})`,
                        transformOrigin: 'top left',
                      }}
                    />
                  </div>

                  {((stripeCalibEnabled || stripeCalibMode === 'ref2') || stripeRefTile1) && Number.isFinite(ref2LeftPct) ? (
                    <div
                      className="pointer-events-none absolute top-0 h-full"
                      style={{
                        left: `${ref2LeftPct * 100}%`,
                        width: `${wPct * 100}%`,
                        overflow: 'visible',
                        zIndex: (stripeCalibMode === 'ref2') ? 999 : 141,
                        outline: (stripeCalibMode === 'ref2') ? '3px solid rgba(220, 38, 38, 0.98)' : undefined,
                        background: (stripeCalibMode === 'ref2') ? 'rgba(220, 38, 38, 0.18)' : undefined,
                      }}
                    >
                      <img
                          src={stripeRefMockupSrc}
                          alt=""
                          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
                          style={{
                            opacity: (stripeCalibEnabled || stripeCalibMode === 'ref' || stripeCalibMode === 'overlay' || stripeCalibMode === 'ref2')
                              ? 0.78
                              : stripeRefOpacity,
                            mixBlendMode: 'normal',
                            filter: undefined,
                            transform: `translate(${stripeRef2X}px, ${stripeRef2Y + stripeRefRenderYOffsetPx}px) scale(${stripeRef2Scale})`,
                            transformOrigin: 'top left',
                          }}
                        />
                    </div>
                  ) : null}
                </>
              );
            })() : null}

            {overlaySrc && false ? (
              Array.from({ length: 14 }).map((_, idx) => {
                const tileLeftX = (v3TileAnchorXLive + (v3TileStepXLive * (idx - v3TileAnchorIndexLive))) + v3TileX0Live;
                const leftPct = tileLeftX / stripeV3SvgW;
                const wPct = v3TileWLive / stripeV3SvgW;
                if (!Number.isFinite(leftPct) || !Number.isFinite(wPct)) return null;

                const hitD = idx === 0
                  ? 'M64.395,272.049l-3.526,-135.289l-13.835,8.715l-47.034,-55.965l56.992,-48.167c20.84,-11.371 40.774,-21.067 58.985,-27.577l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-178.747,0Z'
                  : 'M86.446,26.217c10.229,-4.863 20.111,-9.083 29.531,-12.451l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-151.015,0l0.486,-108.176l66.607,-78.006l-69.024,-57.713c-1.241,-0.647 -2.492,-1.293 -3.75,-1.937Z';
                const clipId = `v3-overlay-clip-${geometrySignature}-${idx}`;

                return (
                  <div
                    key={`v3-overlay-${idx}`}
                    className="pointer-events-none absolute top-0 h-full"
                    style={{
                      left: `${leftPct * 100}%`,
                      width: `${wPct * 100}%`,
                      overflow: 'hidden',
                      zIndex: 35,
                    }}
                  >
                    {stripeOverlayClip ? (
                      <svg
                        className={`pointer-events-none absolute inset-0 h-full w-full ${overlayClassName || ''}`}
                        viewBox={`0 0 ${stripeV3HitStepX} ${stripeV3SvgH}`}
                        preserveAspectRatio="xMidYMax meet"
                      >
                        <defs>
                          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                            <path d={hitD} transform={`translate(0, ${stripeV3HitTranslateY})`} />
                          </clipPath>
                        </defs>
                        <g clipPath={`url(#${clipId})`}>
                          <image
                            href={overlaySrcForRender ? encodeURI(overlaySrcForRender) : overlaySrcForRender}
                            x="0"
                            y="0"
                            width={stripeV3HitStepX}
                            height={stripeV3SvgH}
                            preserveAspectRatio="xMidYMax meet"
                            transform={`translate(${stripeOverlayX} ${stripeOverlayY}) scale(${stripeOverlayScale})`}
                            opacity="1"
                          />
                        </g>
                        {stripeOverlayClipDebug ? (
                          <path
                            d={hitD}
                            transform={`translate(0, ${stripeV3HitTranslateY})`}
                            fill="none"
                            stroke="rgba(255,0,0,0.85)"
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                          />
                        ) : null}
                      </svg>
                    ) : (
                      <img
                        src={overlaySrcForRender}
                        alt=""
                        className={`pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom ${overlayClassName || ''}`}
                        style={{
                          transform: `translate(${stripeOverlayX}px, ${stripeOverlayY}px) scale(${stripeOverlayScale})`,
                          transformOrigin: 'top left',
                          opacity: 1,
                        }}
                      />
                    )}
                  </div>
                );
              })
            ) : null}

            {overlaySrcForRender && !stripeOverlayClip ? (
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full" style={{ zIndex: 35 }}>
                <img
                  src={overlaySrcForRenderByTileIdx(0)}
                  alt=""
                  className={`pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom ${overlayClassName || ''}`}
                  style={{
                    transform: `translate(${stripeOverlayX}px, ${stripeOverlayY}px) scale(${stripeOverlayScale})`,
                    transformOrigin: 'top left',
                    opacity: 1,
                  }}
                />
              </div>
            ) : null}

            <svg
              ref={stripeV3HitSvgRef}
              className="absolute left-0 top-0"
              style={{
                height: `${(stripeV2 ? (containerH + 3) : containerH)}px`,
                width: `${((stripeV3SvgW / stripeV3SvgH) * (stripeV2 ? (containerH + 3) : containerH))}px`,
                overflow: 'visible',
                zIndex: 60,
                pointerEvents: 'none',
                transform: (() => {
                  const svgW = ((stripeV3SvgW / stripeV3SvgH) * (stripeV2 ? (containerH + 3) : containerH));
                  const s = stripeV3Fit?.scale;
                  if (!Number.isFinite(svgW) || svgW <= 0 || !Number.isFinite(s) || s <= 0) return undefined;
                  const shiftLocalPx = (stripeV3HitShiftScreenPx / s);
                  const uniform = stripeV3HitUniformScale;
                  const baseScaleX = 1 - (stripeV3HitShrinkScreenPx / (svgW * s));
                  const stretchX = 1 + (stripeV3HitStretchRightScreenPx / (svgW * s * baseScaleX * uniform));
                  const scaleX = baseScaleX * stretchX;
                  return `translateX(${shiftLocalPx}px) scaleX(${scaleX}) scale(${uniform})`;
                })(),
                transformOrigin: '0px 100%'
              }}
              viewBox={`0 0 ${stripeV3SvgW} ${stripeV3SvgH}`}
              preserveAspectRatio="xMinYMax meet"
            >
              {(() => {
                const svgW = ((stripeV3SvgW / stripeV3SvgH) * (stripeV2 ? (containerH + 3) : containerH));
                const svgH = (stripeV2 ? (containerH + 3) : containerH);
                const s = stripeV3Fit?.scale;
                if (!Number.isFinite(svgW) || svgW <= 0 || !Number.isFinite(s) || s <= 0) return null;
                const uniform = stripeV3HitUniformScale;
                const baseScaleX = 1 - (stripeV3HitShrinkScreenPx / (svgW * s));
                const stretchX = 1 + (stripeV3HitStretchRightScreenPx / (svgW * s * baseScaleX * uniform));
                const scaleX = baseScaleX * stretchX;

                const invX = stripeV3SvgW / (svgW * s * uniform * scaleX);
                const invY = stripeV3SvgH / (svgH * s * uniform);

                if (!Number.isFinite(invX) || !Number.isFinite(invY)) return null;

                window.__stripeV3OverlayInv = { invX, invY, s, uniform, scaleX };
                return null;
              })()}
              {Array.from({ length: 14 }).map((_, idx) => {
                const offsetX = stripeV3HitStepX * idx;
                const tileOverlaySrc = overlaySrcForRenderByTileIdx(idx);
                const d = idx === 0
                  ? 'M64.395,272.049l-3.526,-135.289l-13.835,8.715l-47.034,-55.965l56.992,-48.167c20.84,-11.371 40.774,-21.067 58.985,-27.577l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-178.747,0Z'
                  : 'M86.446,26.217c10.229,-4.863 20.111,-9.083 29.531,-12.451l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-151.015,0l0.486,-108.176l66.607,-78.006l-69.024,-57.713c-1.241,-0.647 -2.492,-1.293 -3.75,-1.937Z';

                const debugHitMode = stripeBeltGuides;
                const isHover = stripeV3HoverIdx === idx;
                const showHit = debugHitMode;

                const overlayClipId = `v3-ovclip-${geometrySignature}-${idx}`;

                return (
                  <g key={idx} transform={`translate(${offsetX}, 0)`}>
                    {tileOverlaySrc && stripeOverlayClip ? (
                      <>
                        <defs>
                          <mask id={`${stripeV4OverlayClipPathId}-tile-${idx}`} maskUnits="userSpaceOnUse">
                            <path d={d} transform={makeTf(idx)} fill="white" fillRule={v4UnionMaskRule} clipRule={v4UnionMaskRule} />
                          </mask>
                        </defs>
                        <g clipPath={`url(#${overlayClipId})`}>
                          <image
                            href={tileOverlaySrc ? encodeURI(tileOverlaySrc) : tileOverlaySrc}
                            x={0}
                            y={0}
                            width={stripeV3HitStepX}
                            height={stripeV3SvgH}
                            preserveAspectRatio="xMidYMax meet"
                            overflow="visible"
                            style={{ overflow: 'visible' }}
                            transform={`translate(${stripeOverlayX} ${stripeOverlayY}) scale(${stripeOverlayScale})`}
                            opacity="1"
                          />
                        </g>
                        {stripeOverlayClipDebug ? (
                          <>
                            <path
                              d={d}
                              transform={`translate(0, ${stripeV3HitTranslateYLive})`}
                              fill="none"
                              stroke="rgba(255,0,0,0.85)"
                              strokeWidth={2}
                              vectorEffect="non-scaling-stroke"
                            />
                            <rect
                              x={0}
                              y={0}
                              width={stripeV3HitStepX}
                              height={stripeV3SvgH}
                              fill="none"
                              stroke="rgba(0,180,255,0.75)"
                              strokeWidth={1}
                              vectorEffect="non-scaling-stroke"
                            />
                            <text
                              x={6}
                              y={14}
                              fontSize={12}
                              fill="rgba(0,180,255,0.95)"
                            >
                              {idx + 1}
                            </text>
                          </>
                        ) : null}
                      </>
                    ) : null}
                    <path
                      d={d}
                      transform={`translate(0, ${stripeV3HitTranslateYLive})`}
                      fill={isHover
                        ? 'rgba(255, 255, 255, 0.10)'
                        : (showHit ? 'rgba(0, 180, 255, 0.50)' : 'rgba(0,0,0,0.001)')}
                      stroke={isHover
                        ? 'rgba(255, 255, 255, 0.35)'
                        : (showHit ? 'rgba(255, 0, 0, 0.55)' : 'transparent')}
                      strokeWidth={isHover ? 1 : (showHit ? 2 : 0)}
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: 'none', cursor: 'default' }}
                      onMouseEnter={() => setStripeV3HoverIdx(idx)}
                      onMouseLeave={() => setStripeV3HoverIdx((prev) => (prev === idx ? null : prev))}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        const realSlug = effectiveItems?.[idx] || itemsProp?.[idx] || `t${idx + 1}`;
                        onSelect?.(realSlug);
                      }}
                      onClick={() => {
                        const realSlug = effectiveItems?.[idx] || itemsProp?.[idx] || `t${idx + 1}`;
                        onSelect?.(realSlug);
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : null}

      {stripeV2 && stripeV3 ? null : (
        <div
          ref={stripeRootRef}
          data-stripe-root="true"
          className="absolute left-0 top-0 z-[40] w-full"
          style={{
            height: `${(stripeV2
              ? ((containerH + 3) + (stripeV2Sprite ? (stripeV2SpriteYOffsetPx + stripeV2SpriteExtraBottomPx) : 0))
              : containerH)}px`,
            pointerEvents: 'auto',
            opacity: 1,
            overflowX: stripeV2 ? 'hidden' : (stripeClampLevel >= 1 ? 'hidden' : 'visible'),
            overflowY: stripeV2 ? 'hidden' : 'visible',
            right: 0,
            left: stripeV2ViewportExtendLeftPx ? `${-stripeV2ViewportExtendLeftPx}px` : undefined,
            width: (stripeV2ViewportExtendLeftPx || stripeV2ViewportTrimRightPx)
              ? `calc(100% + ${stripeV2ViewportExtendLeftPx}px - ${stripeV2ViewportTrimRightPx}px)`
              : undefined,
            backgroundColor: blueViewport ? 'rgba(0, 90, 255, 0.08)' : undefined,
            outline: blueViewport ? '2px solid rgba(0, 90, 255, 0.9)' : undefined,
            outlineOffset: blueViewport ? '-2px' : undefined,
          }}
        >
        {stripeCalibHud}
        <div
          data-stripe-track="true"
          className="absolute left-0 top-0 w-full"
          style={{
            height: `${(stripeV2
              ? ((containerH + 3) + (stripeV2Sprite ? (stripeV2SpriteYOffsetPx + stripeV2SpriteExtraBottomPx) : 0))
              : containerH)}px`,
            pointerEvents: 'auto',
            opacity: 1,
            right: 0,
            overflowY: stripeV2 ? 'hidden' : undefined,
            clipPath: (stripeV2 && !stripeV2Sprite) ? 'inset(0 0 3px 0)' : undefined,
            transform: stripeV2
              ? (stripeV2Sprite
                  ? `translateY(${snapToDevicePx(stripeV2YOffsetPx + stripeV2SpriteYOffsetPx)}px)`
                  : `matrix(${stripeV2Scale}, 0, 0, ${stripeV2Scale}, ${snapToDevicePx(stripeV2ViewportExtendLeftPx + stripeV2CenterOffsetXPx + stripeV4ContentNudgeXPx + (stripeBeltGuides ? 0 : (stripeV2LiveFit?.tx ?? 0)))}, ${snapToDevicePx(stripeV2YOffsetPx)})`)
              : undefined,
            transformOrigin: stripeV2
              ? (stripeV2LiveFit ? '0px 0%' : `${stripeV2AnchorXPx}px 0%`)
              : undefined,
          }}
        >
          {effectiveItems.map((slug, idx) => {
            const zLayer = stripeV2 ? idx : (100 - idx);
            const spriteViewportHPx = stripeV2 ? (containerH + 3) : containerH;
            const tileTrackH = stripeV2
              ? (spriteViewportHPx + (stripeV2Sprite ? (stripeV2SpriteYOffsetPx + stripeV2SpriteExtraBottomPx) : 0))
              : containerH;
            const lastIdx = Math.max(0, effectiveItems.length - 1);
            const offsetThis = Number.isFinite(itemLeftOffsetPxByIndex?.[idx]) ? itemLeftOffsetPxByIndex[idx] : 0;
            const offsetFirst = Number.isFinite(itemLeftOffsetPxByIndex?.[0]) ? itemLeftOffsetPxByIndex[0] : 0;
            const offsetLast = Number.isFinite(itemLeftOffsetPxByIndex?.[lastIdx]) ? itemLeftOffsetPxByIndex[lastIdx] : 0;

            const baseLeft = firstOffsetPx + idx * stepEq;
            const stripeV2Left0 = stripeV2InsetLeftPx + firstOffsetPx + firstTileExtraOffsetPx;
            const stripeV2LeftLast =
              stripeWVirtual > 0
                ? (stripeWVirtual - stripeV2InsetRightPx) - buttonW - computedLastOffsetPxEffective + lastTileExtraOffsetPx
                : null;

            const stripeV2Tile1ExtendLeftPx = stripeV2 && idx === 0 ? 20 : 0;

            const stripeV2Tile1NudgeXPx = stripeV2 && idx === 0 ? 2.75 : 0;
            const stripeV2Left0Effective = stripeV2Left0 + stripeV2Tile1NudgeXPx;

            const leftRaw =
              stripeV2 && lastIdx > 0 && stripeV2LeftLast != null
                ? stripeV2Left0Effective + (idx / lastIdx) * (stripeV2LeftLast - stripeV2Left0Effective)
                : redistributeBetweenFirstAndLast && lastIdx > 0 && idx !== 0 && idx !== lastIdx
                  ? (firstOffsetPx + offsetFirst) + (idx / lastIdx) * ((firstOffsetPx + lastIdx * stepEq + offsetLast) - (firstOffsetPx + offsetFirst))
                  : baseLeft + offsetThis;

            const left = stripeV2 && stripeV2LeftLast != null && idx >= 1
              ? stripeV2LeftLast - ((stripeV2LeftLast - leftRaw) * 1)
              : leftRaw;
            const firstClip = `inset(0 0 0 ${cropRightPx}px)`;
            const isWhiteTile = !stripeV2 && idx === 0 && slug === 'white';
            const whiteOverhangPx = isWhiteTile ? Math.max(0, Math.round(buttonW * 0.28)) : 0;
            const shouldClip = idx === 0 && cropRightPx > 0 && !isWhiteTile;
            const isSelected = stripeV2 ? false : selectedColorSlug === slug;
            const isFirst = idx === 0;
            const isLast = idx === effectiveItems.length - 1;
            const thisHitW = isLast ? buttonW : hitW;

            const src = stripeV2Sprite ? null : (colorButtonSrcBySlug?.[slug] || null);

            const spriteTrackHPx = (stripeV2 ? (containerH + 3) : containerH);
            const spriteBoxWPx = Math.round((stripeV4SvgW / stripeV4SvgH) * spriteTrackHPx);
            const spriteTileWPx = spriteBoxWPx / 14;

            const tileWPx = stripeV2Sprite ? spriteTileWPx : (buttonW + stripeV2Tile1ExtendLeftPx);
            const tileLeftPx = stripeV2Sprite ? (spriteTileWPx * idx) : (left - stripeV2Tile1ExtendLeftPx);

            const globalOffsetXPx = parseIntParam('allx', 0);
            const globalOffsetYPx = parseIntParam('ally', 0);
            const whiteHitOffsetYPx = isWhiteTile ? 2 : 0;

            const sectorBaseW = 323;
            const sectorBaseH = 290;
            const s1W = 207.42;
            const s1H = 248;
            const s1X = 0;
            const s1Y = sectorBaseH - s1H;
            const s1OffsetXPx = parseIntParam('s1p1x', 5);

            const sx = buttonW / sectorBaseW;
            const sy = megaTileSize / sectorBaseH;

            const s2W = 82.896;
            const s2H = 32.731;
            const s2X = s1X + (s1W - s2W) / 2;
            const s2Y = s1Y - s2H;

            const s34W = 79.353;
            const s34H = 64;
            const s34RotDeg = 24.56;

            const s234OffsetXPx = parseIntParam('s1p234x', -1);
            const s234OffsetYPx = parseIntParam('s1p234y', 0);

            const p1OffsetXPx = parseIntParam('1p1x', 0);
            const p1OffsetYPx = parseIntParam('1p1y', 0);
            const p1RotDeg = parseFloatParam('1p1deg', 0);
            const p1WPx = parseIntParam('1p1w', 0);
            const p1HPx = parseIntParam('1p1h', 0);

            const p2OffsetXPx = parseIntParam('1p2x', 0);
            const p2OffsetYPx = parseIntParam('1p2y', 0);
            const p2RotDeg = parseFloatParam('1p2deg', 0);
            const p2WPx = parseIntParam('1p2w', 0);
            const p2HPx = parseIntParam('1p2h', 0);

            const p3OffsetXPx = parseIntParam('1p3x', 0);
            const p3OffsetYPx = parseIntParam('1p3y', 0);
            const p3RotDeg = parseFloatParam('1p3deg', 0);
            const p3WPx = parseIntParam('1p3w', 0);
            const p3HPx = parseIntParam('1p3h', 0);

            const p4OffsetXPx = parseIntParam('1p4x', 0);
            const p4OffsetYPx = parseIntParam('1p4y', 0);
            const p4RotDeg = parseFloatParam('1p4deg', 0);
            const p4WPx = parseIntParam('1p4w', 0);
            const p4HPx = parseIntParam('1p4h', 0);

            const p5Enabled = parseIntParam('1p5on', 1) === 1;
            const p5W = 83;
            const p5H = 109;
            const p5RotDeg = parseFloatParam('1p5deg', 41.0);
            const p5OffsetXPx = parseIntParam('1p5x', 0);
            const p5OffsetYPx = parseIntParam('1p5y', 0);
            const p5WPxOverride = parseIntParam('1p5w', 0);
            const p5HPxOverride = parseIntParam('1p5h', 0);
            const p5FromVertex = parseIntParam('1p5from', 2);
            const p5ToVertex = parseIntParam('1p5to', 1);
            const p5SwapWH = parseIntParam('1p5swap', 0) === 1;

            const p2TLx = s2X * sx + s1OffsetXPx + s234OffsetXPx;
            const p2TLy = s2Y * sy + s234OffsetYPx;
            const p2TRx = (s2X + s2W) * sx + s1OffsetXPx + s234OffsetXPx;
            const p2TRy = s2Y * sy + s234OffsetYPx;

            const s34Wp = s34W * sx;
            const s34Hp = s34H * sy;

            const p5Wp = (p5SwapWH ? p5H : p5W) * sx;
            const p5Hp = (p5SwapWH ? p5W : p5H) * sy;

            const notchW = Math.max(8, Math.round(thisHitW * 0.28));
            const bodyW = Math.max(1, thisHitW - notchW);
            const bandTop = Math.round(megaTileSize * 0.06);
            const bandBottom = Math.round(megaTileSize * 0.92);
            const steps = 4;
            const stepW = Math.max(1, Math.round(notchW / steps));
            const sleeveH = Math.round(megaTileSize * 0.26);

            const stripeV2HitSvg = idx === 0
              ? {
                  viewBox: '0 0 304 259',
                  vw: 304,
                  vh: 259,
                  s: 1,
                  d: 'M64.395,272.049l-3.526,-135.289l-13.835,8.715l-47.034,-55.965l56.992,-48.167c20.84,-11.371 40.774,-21.067 58.985,-27.577l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-178.747,0Z',
                }
              : {
                  viewBox: '0 0 217 259',
                  vw: 217,
                  vh: 259,
                  s: 1,
                  d: 'M86.446,26.217c10.229,-4.863 20.111,-9.083 29.531,-12.451l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-151.015,0l0.486,-108.176l66.607,-78.006l-69.024,-57.713c-1.241,-0.647 -2.492,-1.293 -3.75,-1.937Z',
                };

            return (
              <div
                key={`${slug}-${idx}`}
                className="absolute top-0"
                data-stripe-tile-idx={idx}
                style={{
                  left: `${tileLeftPx}px`,
                  width: `${tileWPx}px`,
                  height: `${tileTrackH}px`,
                  zIndex: zLayer,
                }}
              >
                {stripeV2 && debugV2Anchors && (idx === 0 || idx === 13) ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0"
                    style={{
                      left: `${Math.round((idx === 0 ? stripeV2Anchor1XPx : stripeV2Anchor14XPx))}px`,
                      width: '3px',
                      height: `${tileTrackH}px`,
                      backgroundColor: 'rgba(255, 0, 0, 0.75)',
                    }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 transition-shadow duration-150 ease-out"
                  style={{ pointerEvents: 'none' }}
                >
                  {isSelected ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute z-20 h-2 w-2 rounded-full bg-foreground"
                      data-stripe-dot
                      data-slug={slug}
                      style={{
                        left: `${((dotCalibrationRef.current?.rx ?? (stripeDotXPx / buttonW)) * (selectedTileSize.w || buttonW))}px`,
                        top: `${((dotCalibrationRef.current?.ry ?? (stripeDotYPx / containerH)) * (selectedTileSize.h || containerH))}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ) : null}
                  <span
                    className={`absolute inset-0 ${isWhiteTile ? 'overflow-visible' : 'overflow-hidden'}`}
                    style={(shouldClip && !stripeV2Sprite) ? { clipPath: firstClip, WebkitClipPath: firstClip } : undefined}
                  >
                    {stripeV2Sprite ? (
                      <span
                        className="absolute left-0 top-0 w-full"
                        style={{ height: `${spriteViewportHPx}px` }}
                      >
                        <img
                          src={stripeV2SpriteSrc}
                          alt=""
                          className="pointer-events-none absolute top-0 block"
                          style={{
                            left: `${-(spriteTileWPx * idx) + (stripeV2SpriteInsetLeftPx || 0)}px`,
                            width: `${spriteBoxWPx}px`,
                            height: `${spriteViewportHPx}px`,
                            zIndex: 20,
                            objectFit: 'contain',
                            objectPosition: 'left bottom',
                          }}
                        />

                        {stripeRefMockupSrc &&
                        (stripeRefTargetIndex
                          ? stripeRefTargetIndex === idx + 1
                          : stripeRefTargetSlug
                            ? stripeRefTargetSlug === slug
                            : true) ? (
                          <img
                            src={stripeRefMockupSrc}
                            alt=""
                            className="pointer-events-none absolute inset-0 w-full object-contain object-bottom"
                            style={{
                              height: `${spriteViewportHPx}px`,
                              zIndex: (stripeCalibEnabled ? 160 : 40),
                              opacity: stripeCalibEnabled ? 0.42 : stripeRefOpacity,
                              mixBlendMode: stripeCalibEnabled ? 'multiply' : stripeRefBlendCss,
                              filter: stripeCalibEnabled
                                ? 'grayscale(1) sepia(1) saturate(14) hue-rotate(-10deg) contrast(1.05)'
                                : undefined,
                              transform: `translate(${stripeRefX}px, ${stripeRefY + stripeRefRenderYOffsetPx}px) scale(${stripeRefScale})`,
                              transformOrigin: 'top left',
                            }}
                          />
                        ) : null}

                        {overlaySrcForRender ? (
                          <img
                            src={overlaySrcForRenderByTileIdx(idx)}
                            alt=""
                            className={`pointer-events-none absolute left-1/2 object-contain ${overlayClassName || ''}`}
                            style={{
                              top: `${stripeOverlayTopPct}%`,
                              width: `${stripeOverlayWPct}%`,
                              height: `${stripeOverlayHPct}%`,
                              transform: `translate(-50%, -50%) translate(${stripeOverlayX}px, ${stripeOverlayY}px) scale(${stripeOverlayScale})`,
                              transformOrigin: 'top left',
                              zIndex: 10,
                              opacity: 1,
                            }}
                          />
                        ) : null}
                      </span>
                    ) : src ? (
                      isWhiteTile && whiteOverhangPx ? (
                        <span
                          className="absolute left-0 top-0 h-full"
                          style={{
                            width: `${buttonW}px`,
                            transform: stripeClampLevel >= 4 ? 'translateX(0px)' : `translateX(${-whiteOverhangPx}px)`,
                            overflowX: stripeClampLevel >= 3 ? 'hidden' : 'visible',
                          }}
                        >
                          <img
                            src={src}
                            alt={colorLabelBySlug?.[slug] || slug}
                            className="pointer-events-none block h-full object-contain"
                            style={{
                              width: `${buttonW + whiteOverhangPx}px`,
                              height: '100%',
                              position: 'relative',
                              zIndex: 20,
                              transform: 'translateY(0px) scale(1)',
                              transformOrigin: '50% 100%',
                              objectPosition: 'right bottom',
                            }}
                          />
                        </span>
                      ) : (
                        <img
                          src={src}
                          alt={slug}
                          className={`pointer-events-none block h-full object-contain ${stripeV2 ? 'object-top' : 'object-bottom'}`}
                          style={{
                            width: `${buttonW}px`,
                            zIndex: 20,
                            position: stripeV2Tile1ExtendLeftPx ? 'absolute' : 'relative',
                            right: stripeV2Tile1ExtendLeftPx ? 0 : undefined,
                            top: stripeV2Tile1ExtendLeftPx ? 0 : undefined,
                            transform: stripeV2
                              ? undefined
                              : (idx >= 1 ? 'translateY(2px)' : undefined),
                            transformOrigin: stripeV2
                              ? undefined
                              : (idx >= 1 ? '50% 100%' : undefined),
                            objectPosition: stripeV2Tile1ExtendLeftPx
                              ? (stripeV2 ? 'right top' : 'right bottom')
                              : undefined,
                          }}
                        />
                      )
                    ) : null}

                      {stripeRefMockupSrc &&
                      (stripeRefTargetIndex
                        ? stripeRefTargetIndex === idx + 1
                        : stripeRefTargetSlug
                          ? stripeRefTargetSlug === slug
                          : true) ? (
                        <img
                          src={stripeRefMockupSrc}
                          alt=""
                          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
                          style={{
                            zIndex: (stripeCalibEnabled ? 160 : 40),
                            opacity: stripeCalibEnabled ? 0.42 : stripeRefOpacity,
                            mixBlendMode: stripeCalibEnabled ? 'multiply' : stripeRefBlendCss,
                            filter: stripeCalibEnabled
                              ? 'grayscale(1) sepia(1) saturate(14) hue-rotate(-10deg) contrast(1.05)'
                              : undefined,
                            transform: `translate(${stripeRefX}px, ${stripeRefY + stripeRefRenderYOffsetPx}px) scale(${stripeRefScale})`,
                            transformOrigin: 'top left',
                          }}
                        />
                      ) : null}

                      {overlaySrcForRender ? (
                        <img
                          src={overlaySrcForRenderByTileIdx(idx)}
                          alt=""
                          className={`pointer-events-none absolute left-1/2 object-contain ${overlayClassName || ''}`}
                          style={{
                            top: `${stripeOverlayTopPct}%`,
                            width: `${stripeOverlayWPct}%`,
                            height: `${stripeOverlayHPct}%`,
                            transform: `translate(-50%, -50%) translate(${stripeOverlayX}px, ${stripeOverlayY}px) scale(${stripeOverlayScale})`,
                            transformOrigin: 'top left',
                            zIndex: 10,
                            opacity: 1,
                          }}
                        />
                      ) : null}
                  </span>
                </div>

            {disableStripeHit ? null : (stripeV2 ? (
              <>
                {stripeV2Sprite ? null : (stripeV4FullHitEnabled ? null : (
                <svg
                  role="button"
                  tabIndex={0}
                  aria-label={`t${idx + 1}`}
                  className="absolute"
                  onClick={() => {
                    const v2Key = `t${idx + 1}`;
                    setLastClickedSlug(v2Key);
                    const realSlug = items?.[idx] || slug;
                    onSelect?.(realSlug);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    const v2Key = `t${idx + 1}`;
                    setLastClickedSlug(v2Key);
                    const realSlug = items?.[idx] || slug;
                    onSelect?.(realSlug);
                  }}
                  style={(() => {
                    const trackH = stripeV2 ? (containerH + 3) : containerH;
                    const topPx = Math.round(globalOffsetYPx);
                    return {
                      left: stripeV2Tile1ExtendLeftPx ? undefined : `${Math.round(globalOffsetXPx)}px`,
                      right: stripeV2Tile1ExtendLeftPx ? `${Math.round(globalOffsetXPx)}px` : undefined,
                      top: `${topPx}px`,
                      width: `${Math.round(buttonW)}px`,
                      height: `${Math.round(trackH)}px`,
                      pointerEvents: 'auto',
                    };
                  })()}
                  viewBox={stripeV2HitSvg.viewBox}
                  preserveAspectRatio="xMidYMax meet"
                >
                  {debugStripeHitEffective ? (
                    <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                  ) : null}
                  <path
                    d={stripeV2HitSvg.d}
                    fill={debugStripeHitEffective ? 'rgba(0, 180, 255, 0.50)' : 'rgba(0,0,0,0.001)'}
                    stroke={
                      debugStripeHitEffective && lastClickedSlug === `t${idx + 1}`
                        ? 'rgba(255, 0, 0, 0.85)'
                        : debugStripeHitEffective
                          ? 'rgba(255, 0, 0, 0.45)'
                          : 'transparent'
                    }
                    strokeWidth={debugStripeHitEffective && lastClickedSlug === `t${idx + 1}` ? 2 : 1}
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: 'auto' }}
                  />
                </svg>
                ))}
              </>
            ) : isFirst ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelect?.(slug)}
                  aria-label={colorLabelBySlug?.[slug] || slug}
                  aria-pressed={isSelected}
                  className="pointer-events-auto absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  style={{
                    outline: debugStripeHit
                      ? isSelected
                        ? '2px solid #22c55e'
                        : '1px solid rgba(0,0,0,0.15)'
                      : undefined,
                    left: `${Math.round((s1X / sectorBaseW) * buttonW) + s1OffsetXPx + p1OffsetXPx + globalOffsetXPx}px`,
                    top: `${Math.round((s1Y / sectorBaseH) * megaTileSize) + p1OffsetYPx + globalOffsetYPx + whiteHitOffsetYPx}px`,
                    width: `${Math.round(p1WPx > 0 ? p1WPx : (s1W / sectorBaseW) * buttonW)}px`,
                    height: `${Math.round(p1HPx > 0 ? p1HPx : (s1H / sectorBaseH) * megaTileSize)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${p1RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(255,0,0,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p2'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(0,128,255,0.55)'
                      : undefined,
                    left: `${Math.round((s2X / sectorBaseW) * buttonW) + s1OffsetXPx + s234OffsetXPx + p2OffsetXPx + globalOffsetXPx}px`,
                    top: `${Math.round((s2Y / sectorBaseH) * megaTileSize) + s234OffsetYPx + p2OffsetYPx + globalOffsetYPx + whiteHitOffsetYPx}px`,
                    width: `${Math.round(p2WPx > 0 ? p2WPx : (s2W / sectorBaseW) * buttonW)}px`,
                    height: `${Math.round(p2HPx > 0 ? p2HPx : (s2H / sectorBaseH) * megaTileSize)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${p2RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(0,128,255,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p3'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(0,200,80,0.55)'
                      : undefined,
                    left: `${Math.round(p2TLx - s34Wp + p3OffsetXPx) + globalOffsetXPx}px`,
                    top: `${Math.round(p2TLy + p3OffsetYPx) + globalOffsetYPx + whiteHitOffsetYPx}px`,
                    width: `${Math.round(p3WPx > 0 ? p3WPx : s34Wp)}px`,
                    height: `${Math.round(p3HPx > 0 ? p3HPx : s34Hp)}px`,
                    transformOrigin: '100% 0%',
                    transform: `rotate(${-(s34RotDeg) + p3RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(0,200,80,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p4'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(255,200,0,0.55)'
                      : undefined,
                    left: `${Math.round(p2TRx + p4OffsetXPx) + globalOffsetXPx}px`,
                    top: `${Math.round(p2TRy + p4OffsetYPx) + globalOffsetYPx + whiteHitOffsetYPx}px`,
                    width: `${Math.round(p4WPx > 0 ? p4WPx : s34Wp)}px`,
                    height: `${Math.round(p4HPx > 0 ? p4HPx : s34Hp)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${s34RotDeg + p4RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(255,200,0,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                {p5Enabled ? (
                  (() => {
                    const s4Rad = (s34RotDeg * Math.PI) / 180;
                    const p5Rad = (p5RotDeg * Math.PI) / 180;

                    const p4OriginX = p2TRx + globalOffsetXPx;
                    const p4OriginY = p2TRy + globalOffsetYPx;

                    const p4V = rectVertex(p5FromVertex, s34Wp, s34Hp);
                    const p4VRot = rotatePoint(p4V.x, p4V.y, s4Rad);
                    const anchorX = p4OriginX + p4VRot.x;
                    const anchorY = p4OriginY + p4VRot.y;

                    const p5V = rectVertex(p5ToVertex, p5Wp, p5Hp);
                    const p5VRot = rotatePoint(p5V.x, p5V.y, p5Rad);

                    const p5Left = anchorX - p5VRot.x + p5OffsetXPx;
                    const p5Top = anchorY - p5VRot.y + p5OffsetYPx;

                    const p5WFinal = p5WPxOverride > 0 ? p5WPxOverride : p5Wp;
                    const p5HFinal = p5HPxOverride > 0 ? p5HPxOverride : p5Hp;

                    const rectMinYAtDeg = (w, h, deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const sin = Math.sin(rad);
                      const cos = Math.cos(rad);
                      const y0 = 0;
                      const y1 = w * sin;
                      const y2 = h * cos;
                      const y3 = w * sin + h * cos;
                      return Math.min(y0, y1, y2, y3);
                    };

                    const p5MinY = rectMinYAtDeg(p5WFinal, p5HFinal, p5RotDeg);
                    const p5MinYMirror = rectMinYAtDeg(p5WFinal, p5HFinal, -p5RotDeg);
                    const mirror1p5VisualTopDeltaYPx = p5MinY - p5MinYMirror;

                    return (
                      <>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={() => onSelect?.(slug)}
                          data-hit-id="1p5"
                          className="absolute bg-transparent"
                          style={{
                            left: `${p5Left}px`,
                            top: `${p5Top + whiteHitOffsetYPx}px`,
                            width: `${p5WPxOverride > 0 ? p5WPxOverride : p5Wp}px`,
                            height: `${p5HPxOverride > 0 ? p5HPxOverride : p5Hp}px`,
                            transformOrigin: '0% 0%',
                            transform: `rotate(${p5RotDeg}deg)`,
                            backgroundColor: debugStripeHit ? 'rgba(180,0,255,0.18)' : 'transparent',
                            outline: debugStripeHit
                              ? debugSelectedPanel === '1p5'
                                ? '1px solid rgba(0,120,255,0.95)'
                                : '1px solid rgba(180,0,255,0.55)'
                              : undefined,
                            pointerEvents: 'auto',
                          }}
                        />

                        {mirror1p5 ? (
                          <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden="true"
                            onClick={() => onSelect?.(slug)}
                            data-hit-id="1p5-mirror-x"
                            className="absolute bg-transparent"
                            style={{
                              left: `${tileWPx - (p5Left + (p5WPxOverride > 0 ? p5WPxOverride : p5Wp)) - 35}px`,
                              top: `${p5Top + whiteHitOffsetYPx + mirror1p5BaseOffsetYPx + mirror1p5VisualTopDeltaYPx + mirror1p5OffsetYPx}px`,
                              width: `${p5WFinal}px`,
                              height: `${p5HFinal}px`,
                              transformOrigin: '0% 0%',
                              transform: `rotate(${-p5RotDeg}deg)`,
                              backgroundColor: debugStripeHit ? 'rgba(180,0,255,0.18)' : 'transparent',
                              outline: debugStripeHit ? '1px solid rgba(0,120,255,0.95)' : '1px solid rgba(255,0,255,0.6)',
                              pointerEvents: 'auto',
                            }}
                          />
                        ) : null}
                      </>
                    );
                  })()
                ) : null}
              </>
            ) : idx >= 1 ? (
              (() => {
                const t2BaseW = 323;
                const t2BaseH = 290;
                const overlapPx = Math.max(0, Math.round(buttonW - stepEq));
                const t2OriginX = overlapPx;
                const t2OriginY = 0;

                const stdW = 44;
                const stdH = 44;
                const stdWp = (stdW / t2BaseW) * buttonW;
                const stdHp = (stdH / t2BaseH) * megaTileSize;

                const pieces = Array.from({ length: 7 }).map((_, pIdx) => {
                  const n = pIdx + 1;
                  const d = defaultT2Pieces[pIdx];
                  return {
                    n,
                    x: parseIntParam(`2p${n}x`, d?.x ?? 0),
                    y: parseIntParam(`2p${n}y`, d?.y ?? 0),
                    deg: parseFloatParam(`2p${n}deg`, d?.deg ?? 0),
                    w: parseIntParam(`2p${n}w`, d?.w ?? 0),
                    h: parseIntParam(`2p${n}h`, d?.h ?? 0),
                  };
                });

                const debugColors = [
                  'rgba(255,0,255,0.18)',
                  'rgba(0,128,255,0.18)',
                  'rgba(0,200,80,0.18)',
                  'rgba(255,200,0,0.18)',
                  'rgba(180,0,255,0.18)',
                  'rgba(255,80,0,0.18)',
                  'rgba(0,0,0,0.14)',
                ];

                return (
                  <>
                    {pieces.map((p) => {
                      const leftPx = Math.round(t2OriginX + t2OriginY * 0 + p.x) + globalOffsetXPx;
                      const topPx = Math.round(t2OriginY + p.y) + globalOffsetYPx;
                      const wPx = Math.round(p.w > 0 ? p.w : stdWp);
                      const hPx = Math.round(p.h > 0 ? p.h : stdHp);

                      return (
                        <button
                          key={`t2p-${idx}-${p.n}`}
                          type="button"
                          onClick={() => onSelect?.(slug)}
                          aria-label={colorLabelBySlug?.[slug] || slug}
                          aria-pressed={isSelected}
                          className="absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                          style={{
                            left: `${leftPx}px`,
                            top: `${topPx}px`,
                            width: `${wPx}px`,
                            height: `${hPx}px`,
                            transformOrigin: '0% 0%',
                            transform: `rotate(${p.deg}deg)`,
                            backgroundColor: debugStripeHit ? debugColors[(p.n - 1) % debugColors.length] : 'transparent',
                            outline: debugStripeHit
                              ? debugSelectedPanel === `2p${p.n}`
                                ? '1px solid rgba(0,120,255,0.95)'
                                : '1px solid rgba(0,0,0,0.35)'
                              : undefined,
                            pointerEvents: 'auto',
                          }}
                        />
                      );
                    })}
                  </>
                );
              })()
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect?.(slug)}
                  aria-label={colorLabelBySlug?.[slug] || slug}
                  aria-pressed={isSelected}
                  className="absolute top-0 h-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  style={{ left: `${globalOffsetXPx}px`, top: `${globalOffsetYPx}px`, width: `${bodyW}px`, height: '100%', pointerEvents: 'auto' }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{ left: `${bodyW + globalOffsetXPx}px`, top: `${globalOffsetYPx}px`, width: `${notchW}px`, height: `${sleeveH}px`, pointerEvents: 'auto' }}
                />

                {Array.from({ length: steps }).map((_, sIdx) => {
                  const x = bodyW + sIdx * stepW;
                  const inset = Math.round(((steps - 1 - sIdx) / steps) * (bandBottom - bandTop) * 0.42);
                  const top = bandTop + inset;
                  const bottom = bandBottom - inset;
                  const h = Math.max(1, bottom - top);
                  const w = sIdx === steps - 1 ? Math.max(1, thisHitW - x) : stepW;
                  if (w <= 0) return null;

                  return (
                    <button
                      key={`${slug}-${idx}-hit-${sIdx}`}
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={() => onSelect?.(slug)}
                      className="absolute bg-transparent"
                      style={{ left: `${x + globalOffsetXPx}px`, top: `${top + globalOffsetYPx}px`, width: `${w}px`, height: `${h}px`, pointerEvents: 'auto' }}
                    />
                  );
                })}
              </>
            ))}
          </div>
            );
          })}
        </div>
      </div>
      )}
    </>
  );
}
