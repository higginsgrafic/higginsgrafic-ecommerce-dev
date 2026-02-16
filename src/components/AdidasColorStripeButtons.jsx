import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFirstContactOverlayPreset } from '../calibrationPresets/firstContactOverlayPreset';
import { getTheHumanInsideOverlayPreset } from '../calibrationPresets/theHumanInsideOverlayPreset';
import { getCubeOverlayPreset } from '../calibrationPresets/cubeOverlayPreset';
import { getOutcastedOverlayPreset } from '../calibrationPresets/outcastedOverlayPreset';

export default function AdidasColorStripeButtons({
  megaTileSize,
  selectedColorOrder,
  selectedColorSlug,
  onSelect,
  colorLabelBySlug,
  colorButtonSrcBySlug,
  stripeV2 = false,
  stripeV2Defaults,
  allowStripeV2UrlParams,
  forceStripeV3 = false,
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
  forceDebugStripeHit = false,
  ignoreUrlDebugStripeHit = false,
  debugSelectedPanel = '',
}) {
  const items = useMemo(() => (Array.isArray(selectedColorOrder) ? selectedColorOrder.slice(0, 14) : []), [selectedColorOrder]);
  const effectiveItems = useMemo(() => {
    if (!stripeV2) return items;
    return Array.from({ length: 14 }, (_, i) => `t${i + 1}`);
  }, [items, stripeV2]);

  const stripeRootRef = useRef(null);
  const stripeV3HitSvgRef = useRef(null);
  const stripeV3SpriteImgRef = useRef(null);
  const stripeV3PrevDprRef = useRef(null);
  const stripeV3OverlayUnitsMigratedRef = useRef(false);
  const stripeCalibResetOnceRef = useRef(false);
  const stripeV2PrevRightXRef = useRef(null);
  const stripeV2PrevDprRef = useRef(null);
  const stripeV2ZoomSettleRafRef = useRef(null);
  const [stripeV2ZoomSettling, setStripeV2ZoomSettling] = useState(false);
  const [hudFixedPos, setHudFixedPos] = useState(null);
  const [stripeW, setStripeW] = useState(0);
  const [stripeV3SpriteW, setStripeV3SpriteW] = useState(null);
  const [stripeV3Fit, setStripeV3Fit] = useState(null);
  const [stripeV3Ready, setStripeV3Ready] = useState(false);
  const [lastClickedV2Slug, setLastClickedV2Slug] = useState(null);

  const selectedTileRef = useRef(null);
  const [selectedTileSize, setSelectedTileSize] = useState({ w: 0, h: 0 });
  const dotCalibrationRef = useRef(null);
  const overlayDirtyRef = useRef(false);

  const GLOBAL_OVERLAY_STORAGE_KEY = 'HG_GLOBAL_STRIPE_OVERLAY_SRC';
  const GLOBAL_OVERLAY_EVENT = 'hg-global-stripe-overlay-changed';

  const [globalOverlaySrc, setGlobalOverlaySrc] = useState(() => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(GLOBAL_OVERLAY_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const read = () => {
      try {
        const v = window.localStorage.getItem(GLOBAL_OVERLAY_STORAGE_KEY);
        setGlobalOverlaySrc((prev) => (prev === v ? prev : v));
      } catch {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (!e || e.key !== GLOBAL_OVERLAY_STORAGE_KEY) return;
      read();
    };

    const onGlobal = () => read();

    if (typeof window === 'undefined') return undefined;
    window.addEventListener('storage', onStorage);
    window.addEventListener(GLOBAL_OVERLAY_EVENT, onGlobal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(GLOBAL_OVERLAY_EVENT, onGlobal);
    };
  }, []);

  const overlaySrcPropNormalized = (typeof overlaySrcProp === 'string' && overlaySrcProp.trim() === '')
    ? null
    : overlaySrcProp;

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const wsEnabled = !!(import.meta.env.DEV && urlParams?.has('ws'));
  const stripeV2AllowUrlParams = !!(allowStripeV2UrlParams ?? (wsEnabled || !!urlParams?.has('stripeBeltGuides')));
  const stripeCalibReset = typeof urlParams?.has === 'function' ? urlParams.has('stripeCalibReset') : false;
  const stripeFresh = typeof urlParams?.has === 'function' ? urlParams.has('stripeFresh') : false;
  const stripeCalibEnabled = (
    (typeof urlParams?.has === 'function' ? urlParams.has('stripeCalib') : false)
    && (typeof urlParams?.has === 'function' ? urlParams.has('stripeCalibMode') : false)
  );

  const overlaySrc = overlaySrcPropNormalized
    ?? (stripeCalibEnabled ? null : globalOverlaySrc)
    ?? null;

  const debugStripeHitFromUrl = !!urlParams?.has('debugStripeHit');
  const debugStripeHit = forceDebugStripeHit || (!ignoreUrlDebugStripeHit && debugStripeHitFromUrl);
  const showStripeClickDebug = forceDebugStripeHit || debugStripeHitFromUrl;
  const stripeRecalibrate = !!urlParams?.has('stripeRecalibrate');
  const mirror1p5 = !!urlParams?.has('mirror1p5');
  const stripeBeltGuides = !!urlParams?.has('stripeBeltGuides');

  const parseFloatParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const mirror1p5OffsetYPx = parseFloatParam('mirror1p5y', 0);
  const mirror1p5BaseOffsetYPx = 0;

  const stripeOverlayTopPct = parseFloatParam('stripeOverlayTop', 44);
  const stripeOverlayWPct = parseFloatParam('stripeOverlayW', 72);
  const stripeOverlayHPct = parseFloatParam('stripeOverlayH', 40);

  const parseIntParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  };

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

  const parseFloatParamV2 = (key, fallback) => {
    if (!stripeV2AllowUrlParams) return fallback;
    return parseFloatParam(key, fallback);
  };

  const parseIntParamV2 = (key, fallback) => {
    if (!stripeV2AllowUrlParams) return fallback;
    return parseIntParam(key, fallback);
  };

  const stripeV2InsetLeftPx = parseIntParamV2(
    'v2L',
    Number.isFinite(stripeV2DefaultInsetLeftPx) ? stripeV2DefaultInsetLeftPx : 0,
  );
  const stripeV2InsetRightPx = parseIntParamV2(
    'v2R',
    Number.isFinite(stripeV2DefaultInsetRightPx) ? stripeV2DefaultInsetRightPx : 0,
  );
  const stripeV2Scale = parseFloatParamV2('v2S', Number.isFinite(stripeV2DefaultScale) ? stripeV2DefaultScale : 1);
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
  const blueViewport = stripeV2AllowUrlParams && typeof urlParams?.has === 'function' ? urlParams.has('blueViewport') : false;
  const debugV2Anchors = stripeV2AllowUrlParams && typeof urlParams?.has === 'function' ? urlParams.has('debugV2Anchors') : false;
  const stripeRefMockupSrcRaw = typeof urlParams?.get === 'function' ? (urlParams.get('stripeRefMockup') || '') : '';
  const stripeRefMockupSrc = stripeRefMockupSrcRaw && typeof stripeRefMockupSrcRaw === 'string' ? stripeRefMockupSrcRaw.trim() : '';
  const stripeV3 = stripeV2
    && (forceStripeV3 || (stripeV2AllowUrlParams && typeof urlParams?.has === 'function' ? urlParams.has('v3') : false));
  const stripeV3Src = stripeV2 && stripeV3
    ? ((stripeV2AllowUrlParams ? (urlParams.get('v3Src') || '') : '') || '/placeholders/t-shirt_buttons/full-color-stripe-2.webp')
    : '';
  const stripeV2Sprite = stripeV2AllowUrlParams && typeof urlParams?.has === 'function' ? urlParams.has('v2Sprite') : false;
  const stripeV2SpriteSrc = stripeV2 && stripeV2Sprite
    ? (urlParams?.get('v2SpriteSrc') || '/placeholders/t-shirt_buttons/full-color-stripe+botonera-cc+red.webp')
    : '/placeholders/t-shirt_buttons/full-color-stripe-2.webp';
  const stripeV2SpriteInsetLeftPx = stripeV2 && stripeV2Sprite
    ? parseIntParamV2('v2SpriteInsetL', 0)
    : 0;

  const stripeV2Anchor1XPx = stripeV2
    ? parseFloatParamV2(
        'v2A1',
        Number.isFinite(stripeV2DefaultAnchor1XPx)
          ? stripeV2DefaultAnchor1XPx
          : (stripeV3 ? 57 : (stripeBeltGuides ? 57 : 0)),
      )
    : 0;
  const stripeV2Anchor14XPx = stripeV2
    ? parseFloatParamV2(
        'v2A14',
        Number.isFinite(stripeV2DefaultAnchor14XPx)
          ? stripeV2DefaultAnchor14XPx
          : (stripeV3 ? 118 : (stripeBeltGuides ? 118 : 0)),
      )
    : 0;
  const stripeV2YOffsetPx = stripeV2
    ? parseFloatParamV2(
        'v2Y',
        Number.isFinite(stripeV2DefaultYOffsetPx)
          ? stripeV2DefaultYOffsetPx
          : (stripeV3 ? -7 : (stripeBeltGuides ? -7 : 0)),
      )
    : 0;
  const stripeV2FitNudgeLeftPx = stripeV2 ? parseFloatParamV2('v2NL', stripeBeltGuides ? -1 : 0) : 0;
  const stripeV2FitNudgeRightPx = stripeV2 ? parseFloatParamV2('v2NR', stripeBeltGuides ? 4 : 0) : 0;

  const stripeV3BottomInsetPx = stripeV2 && stripeV3 ? parseFloatParamV2('v3BI', 0) : 0;
  const stripeV3YOffsetPx = stripeV2 && stripeV3 ? parseFloatParamV2('v3Y', -2) : 0;

  const stripeV3SvgW = 2491.66;
  const stripeV3SvgH = 258.283;

  const stripeV3FitSpanExtraPx = 3;
  const stripeV3HitStepX = 168.346;
  const stripeV3HitTranslateY = -12.675;
  const stripeV3HitYExtra = parseFloatParam('v3HitY', 0);
  const stripeV3HitTranslateYLive = stripeV3HitTranslateY + stripeV3HitYExtra;
  const stripeV3HitShiftScreenPx = -1;
  const stripeV3HitUniformScale = 0.9452;
  const stripeV3HitShrinkScreenPx = 0.9;
  const stripeV3HitStretchRightScreenPx = 3;

  const stripeV3TileX0 = parseFloatParam('v3TileX0', 0);
  const stripeV3TileStepX = parseFloatParam('v3TileStepX', stripeV3HitStepX);
  const stripeV3TileAnchorIndex = parseIntParam('v3TileAnchorIndex', 8);
  const stripeV3TileAnchorX = parseFloatParam('v3TileAnchorX', stripeV3HitStepX * 8);
  const stripeV3TileW = parseFloatParam('v3TileW', stripeV3TileStepX);

  const [stripeV3OverlayInvM, setStripeV3OverlayInvM] = useState(null);

  const parseStringParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return fallback;
  };

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
  const useFirstContactRed9RefDefaults =
    stripeRefTargetIndex === 1 &&
    typeof stripeRefMockupSrc === 'string' &&
    stripeRefMockupSrc.includes('first-contact-') &&
    stripeRefMockupSrc.includes('-black-white.png');
  const stripeRefXParam = parseFloatParam('stripeRefX', useFirstContactRed9RefDefaults ? -46 : 0);
  const stripeRefYParam = parseFloatParam('stripeRefY', useFirstContactRed9RefDefaults ? 0 : 0);
  const stripeRefScaleParam = parseFloatParam('stripeRefScale', useFirstContactRed9RefDefaults ? 1.315 : 1);

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
  const stripeOverlayXParam = parseFloatParam(
    'stripeOverlayX',
    isOverlayVulcansEnd
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
                : 0,
  );
  const stripeOverlayYParam = parseFloatParam(
    'stripeOverlayY',
    isOverlayVulcansEnd
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
                : 7,
  );
  const stripeOverlayScaleParam = parseFloatParam(
    'stripeOverlayScale',
    isOverlayVulcansEnd
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
                : 1,
  );

  const stripeOverlayClip = !urlParams?.has('stripeOverlayClip') || urlParams?.get('stripeOverlayClip') !== '0';
  const stripeOverlayClipDebug = !!urlParams?.has('stripeOverlayClipDebug');

  const stripeCalibModeParam = parseStringParam('stripeCalibMode', 'ref');
  const stripeHudPos = parseStringParam('stripeHudPos', 'below-deck');

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
      if (!overlaySrc) return null;
      const s = (overlaySrc || '').toString().toLowerCase();
      const isCubeDrawing = s.includes('/custom_logos/drawings/cube/');
      const isCubePlaceholder = s.includes('/placeholders/images_grid/cube/');
      if (!isCubeDrawing && !isCubePlaceholder) return null;

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

  const stripeRefMockupKey = useMemo(() => {
    if (!stripeRefMockupSrc || typeof stripeRefMockupSrc !== 'string') return 'none';
    return stripeRefMockupSrc
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]+/gi, '_')
      .slice(0, 48);
  }, [stripeRefMockupSrc]);

  const calibrationStorageKey = useMemo(() => {
    const base = stripeFresh ? 'stripeRefCalibFresh' : 'stripeRefCalib';
    const t = 'all';
    const m = stripeRefMockupKey;
    const g = geometrySignature || 'nogeo';
    return `${base}_${t}_${m}_${g}`;
  }, [geometrySignature, stripeFresh, stripeRefMockupKey]);

  const migrateRefCalibFromLegacyKeys = (keyToWrite, geoKey) => {
    try {
      if (!keyToWrite || !geoKey) return null;
      const base = 'stripeRefCalib';
      const candidates = [];
      if (stripeRefTargetIndex) candidates.push(`${base}_i${stripeRefTargetIndex}_${geoKey}`);
      if (stripeRefTargetSlug) candidates.push(`${base}_s${stripeRefTargetSlug}_${geoKey}`);
      candidates.push(`${base}_all_${geoKey}`);

      for (const k of candidates) {
        const v = window.localStorage.getItem(k);
        if (typeof v === 'string' && v) {
          window.localStorage.setItem(keyToWrite, v);
          return v;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const overlayCalibDesignKey = useMemo(() => {
    if (!overlaySrc) return 'none';
    if (cubeOverlayDesignKey) return cubeOverlayDesignKey;
    const s = overlaySrc.toLowerCase();
    if (
      s.includes('/custom_logos/drawings/austen/samarreta/encreuats/pride_and_prejudice/pride-and-prejudice-3.')
      || s.includes('/placeholders/images_grid/austen/crosswords/pride-and-prejudice-3.')
    ) {
      return 'austen_encreuats_pride_and_prejudice_3';
    }
    if (
      s.includes('/custom_logos/drawings/austen/samarreta/quotes/')
      || s.includes('/placeholders/images_grid/austen/quotes/')
    ) {
      if (s.includes('you-must-allow-me')) return 'austen_quotes_you_must_allow_me';
      if (s.includes('body-and-soul') || s.includes('you-have-bewiched-me')) return 'austen_quotes_body_and_soul';
    }
    if (
      s.includes('/custom_logos/drawings/austen/samarreta/looking_for_my_darcy/frame/')
      || s.includes('/placeholders/images_grid/austen/looking_for_my_darcy/')
    ) {
      if (s.includes('-frame.')) return 'austen_looking_for_my_darcy_frame';
    }
    const stripVariantFolder = s.replace(/\/(black|white)\//g, '/');
    const stripVariantSuffix = stripVariantFolder.replace(/-(b|w)\.webp$/i, '.webp');
    return stripVariantSuffix.replace(/[^a-z0-9]+/gi, '_').slice(0, 48);
  }, [cubeOverlayDesignKey, overlaySrc]);

  const overlayCalibrationStorageKey = useMemo(() => {
    const base = stripeFresh ? 'stripeOverlayCalibFresh' : 'stripeOverlayCalib';
    const t = 'all';
    const m = overlayCalibDesignKey;
    const g = geometrySignature || 'nogeo';
    return `${base}_${t}_${m}_${g}`;
  }, [geometrySignature, overlayCalibDesignKey, stripeFresh]);

  const overlayCalibrationStorageKeyLegacy = useMemo(() => {
    const base = 'stripeOverlayCalib';
    const t = 'all';
    const m = overlaySrc ? overlaySrc.replace(/[^a-z0-9]+/gi, '_').slice(0, 48) : 'none';
    const g = geometrySignature || 'nogeo';
    return `${base}_${t}_${m}_${g}`;
  }, [geometrySignature, overlaySrc]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      window.__HG_OVERLAY_DEBUG__ = {
        overlaySrc,
        cubeOverlayDesignKey,
        overlayCalibDesignKey,
        overlayCalibrationStorageKey,
        overlayCalibrationStorageKeyLegacy,
        geometrySignature,
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
  ]);

  const migrateOverlayCalibFromIndexedKeys = (keyToWrite, designKey, geoKey) => {
    try {
      if (!keyToWrite || !designKey || !geoKey) return null;
      const prefix = `stripeOverlayCalib_i`;
      const suffix = `_${designKey}_${geoKey}`;
      const keys = Object.keys(window.localStorage || {});
      const match = keys.find((k) => k.startsWith(prefix) && k.endsWith(suffix));
      if (!match) return null;
      const v = window.localStorage.getItem(match);
      if (typeof v !== 'string' || !v) return null;
      window.localStorage.setItem(keyToWrite, v);
      return v;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    overlayDirtyRef.current = false;
  }, [overlayCalibrationStorageKey]);

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
                || k.startsWith('stripeV3Tiles_')
                || k.startsWith('stripeV3TilesFresh_')
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

    setStripeOverlayX(stripeOverlayXParam);
    setStripeOverlayY(stripeOverlayYParam);
    setStripeOverlayScale(stripeOverlayScaleParam);
    stripeV3OverlayUnitsMigratedRef.current = false;

    v3TilesDirtyRef.current = false;
    setV3TileStepXLive(stripeV3TileStepX);
    setV3TileWLive(stripeV3TileW);
    setV3TileAnchorXLive(stripeV3TileAnchorX);
    setV3TileAnchorIndexLive(stripeV3TileAnchorIndex);
    setV3TileX0Live(stripeV3TileX0);
  }, [
    calibrationStorageKey,
    geometrySignature,
    overlayCalibrationStorageKey,
    stripeCalibReset,
    stripeOverlayScaleParam,
    stripeOverlayXParam,
    stripeOverlayYParam,
    stripeRef2ScaleParam,
    stripeRef2XParam,
    stripeRef2YParam,
    stripeRefScaleParam,
    stripeRefXParam,
    stripeRefYParam,
    stripeV3TileAnchorIndex,
    stripeV3TileAnchorX,
    stripeV3TileStepX,
    stripeV3TileW,
    stripeV3TileX0,
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

  const [v3TileStepXLive, setV3TileStepXLive] = useState(stripeV3TileStepX);
  const [v3TileWLive, setV3TileWLive] = useState(stripeV3TileW);
  const [v3TileAnchorXLive, setV3TileAnchorXLive] = useState(stripeV3TileAnchorX);
  const [v3TileAnchorIndexLive, setV3TileAnchorIndexLive] = useState(stripeV3TileAnchorIndex);
  const [v3TileX0Live, setV3TileX0Live] = useState(stripeV3TileX0);

  const stripeRef2DirtyRef = useRef(false);
  const v3TilesDirtyRef = useRef(false);

  const [stripeCalibMode, setStripeCalibMode] = useState(
    stripeCalibModeParam === 'overlay'
      ? 'overlay'
      : (stripeCalibModeParam === 'ref2'
          ? 'ref2'
          : (stripeCalibModeParam === 'tiles' ? 'tiles' : 'ref')),
  );

  const [beltGuideXPx, setBeltGuideXPx] = useState(null);
  const [stripeZoomHud, setStripeZoomHud] = useState(null);
  const [stripeV2LiveBoundsLocal, setStripeV2LiveBoundsLocal] = useState(null);
  const [stripeV2LiveFit, setStripeV2LiveFit] = useState(null);
  const [stripeV3HoverIdx, setStripeV3HoverIdx] = useState(null);

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
          k.startsWith('stripeV3Tiles_') ||
          k.startsWith('stripeV3TilesFresh_') ||
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
      const payload = {
        v: 1,
        ts: new Date().toISOString(),
        items: getAllCalibrationLocalStorage(),
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
      const payload = {
        v: 1,
        ts: new Date().toISOString(),
        items: getAllCalibrationLocalStorage(),
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
          k.startsWith('stripeV3Tiles_') ||
          k.startsWith('stripeV3TilesFresh_') ||
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

  const resetOverlayCalibration = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      try {
        if (overlayCalibrationStorageKey) window.localStorage.removeItem(overlayCalibrationStorageKey);
        if (overlayCalibrationStorageKeyLegacy) window.localStorage.removeItem(overlayCalibrationStorageKeyLegacy);
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
      if (overlaySrc) {
        setIf('stripeOverlayX', stripeOverlayX);
        setIf('stripeOverlayY', stripeOverlayY);
        setIf('stripeOverlayScale', stripeOverlayScale);
      }

      const qs = p.toString();
      return qs ? `${base}?${qs}` : base;
    } catch {
      return '';
    }
  }, [overlaySrc, stripeOverlayScale, stripeOverlayX, stripeOverlayY, stripeRefBlendCss, stripeRefMockupSrc, urlParams]);

  const stripeCalibHud = (stripeCalibEnabled && (stripeRefMockupSrc || overlaySrc)) ? createPortal(
    <div
      className="pointer-events-auto fixed z-[32020] w-[560px] max-w-[92vw] rounded-md bg-red-600 px-2 py-1 text-[12.5px] text-white"
      style={{
        top: `${Math.max(8, Number.isFinite(hudFixedPos?.top) ? hudFixedPos.top : 8)}px`,
        left: `${Math.max(8, Number.isFinite(hudFixedPos?.left) ? hudFixedPos.left : 8)}px`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold">Stripe calibration</div>
          <div className="rounded bg-white/10 px-1.5 py-0.5 font-mono">mode:{stripeCalibMode}</div>
          <div className="rounded bg-white/10 px-1.5 py-0.5 font-mono">fresh:{String(stripeFresh)}</div>
        </div>
        <div className="rounded bg-white/10 px-1.5 py-0.5 font-mono">clamp:{stripeClampLevel}</div>
      </div>

      <div className="mt-0.5 grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
        <div>
          <span className="font-semibold">Keys</span>
          <span className="text-white/60">:</span>
          <span className="ml-1 font-mono">Tab</span>
          <span className="mx-1 text-white/60">cycle</span>
          <span className="font-mono">R</span>
          <span className="mx-1 text-white/60">ref</span>
          <span className="font-mono">O</span>
          <span className="mx-1 text-white/60">overlay</span>
          <span className="font-mono">2</span>
          <span className="mx-1 text-white/60">ref2</span>
          <span className="font-mono">T</span>
          <span className="mx-1 text-white/60">tiles</span>
        </div>
        <div>
          <span className="font-semibold">Arrows</span>
          <span className="text-white/60">:</span>
          <span className="ml-1">move</span>
          <span className="mx-1 text-white/60">(Shift=10px)</span>
          <span className="font-mono">+/-</span>
          <span className="mx-1 text-white/60">scale</span>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => exportCalibrationConfig()}
        >
          export
        </button>
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => resetOverlayCalibration()}
        >
          reset overlay
        </button>
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => downloadCalibrationConfig()}
        >
          download
        </button>
        <input
          ref={calibUploadInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onUploadCalibrationFile}
        />
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => uploadCalibrationConfigPickFile()}
        >
          upload
        </button>
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => setCalibIoOpen((v) => !v)}
        >
          import
        </button>
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => {
            try {
              setCalibIoText(JSON.stringify({ v: 1, ts: new Date().toISOString(), items: getAllCalibrationLocalStorage() }, null, 2));
              setCalibIoOpen(true);
            } catch {
              // ignore
            }
          }}
        >
          view
        </button>
      </div>
      {calibIoOpen ? (
        <div className="mt-1">
          <textarea
            value={calibIoText}
            onChange={(e) => setCalibIoText(e.target.value)}
            rows={6}
            className="w-[520px] max-w-[92vw] rounded bg-white/10 px-2 py-1 font-mono text-white outline-none"
            placeholder="Paste calibration JSON here"
          />
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => copyToClipboard(calibIoText)}
            >
              copy
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => importCalibrationConfig()}
            >
              apply+reload
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => setCalibIoOpen(false)}
            >
              close
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <div className="pointer-events-none">url:</div>
        <a
          className="min-w-0 flex-1 truncate rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white/95 underline"
          href={minimalCalibUrl || (typeof window !== 'undefined' ? window.location?.href : '')}
          target="_blank"
          rel="noreferrer"
        >
          {minimalCalibUrl || (typeof window !== 'undefined' ? window.location?.href : '')}
        </a>
        <button
          type="button"
          className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
          onClick={() => copyToClipboard(minimalCalibUrl || (typeof window !== 'undefined' ? window.location?.href : ''))}
        >
          copy
        </button>
      </div>
      <div>Mode: {stripeCalibMode}</div>
      <div>Clamp: {stripeClampLevel}</div>
      <div>Params: allowUrl={String(stripeV2AllowUrlParams)} clip={String(stripeOverlayClip)} clipDbg={String(stripeOverlayClipDebug)}</div>
      <div>Overlay render: {overlaySrc ? (stripeOverlayClip ? 'svg-clip' : 'img') : 'none'}</div>
      {stripeV3 ? (
        <div>
          V3 v3Y(url):{urlParams?.get('v3Y') ?? '∅'} has:{String(!!urlParams?.has('v3Y'))}
          {' '}effective:{Number.isFinite(stripeV3YOffsetPx) ? Number(stripeV3YOffsetPx).toFixed(4) : 'n/a'}
        </div>
      ) : null}
      {stripeV3 ? (
        <div>
          V3 dpr:{typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio) ? Number(window.devicePixelRatio).toFixed(3) : 'n/a'}
          {' '}
          V3 invCTM a:{Number.isFinite(stripeV3OverlayInvM?.a) ? Number(stripeV3OverlayInvM.a).toFixed(6) : 'n/a'}
          {' '}b:{Number.isFinite(stripeV3OverlayInvM?.b) ? Number(stripeV3OverlayInvM.b).toFixed(6) : 'n/a'}
          {' '}c:{Number.isFinite(stripeV3OverlayInvM?.c) ? Number(stripeV3OverlayInvM.c).toFixed(6) : 'n/a'}
          {' '}d:{Number.isFinite(stripeV3OverlayInvM?.d) ? Number(stripeV3OverlayInvM.d).toFixed(6) : 'n/a'}
        </div>
      ) : null}
      {stripeV3 ? (
        <div>
          V3 fit ready:{String(stripeV3Ready)}
          {' '}tx:{Number.isFinite(stripeV3Fit?.tx) ? Number(stripeV3Fit.tx).toFixed(3) : 'n/a'}
          {' '}ty:{Number.isFinite(stripeV3Fit?.ty) ? Number(stripeV3Fit.ty).toFixed(3) : 'n/a'}
          {' '}s:{Number.isFinite(stripeV3Fit?.scale) ? Number(stripeV3Fit.scale).toFixed(6) : 'n/a'}
        </div>
      ) : null}
      {stripeRefMockupSrc ? (
        <>
          <div>
            Ref X:{stripeRefX} Y:{stripeRefY} S:{stripeRefScale}
          </div>
          <div className="flex items-center gap-2">
            <div className="pointer-events-none">
              stripeRefX={stripeRefX}&amp;stripeRefY={stripeRefY}&amp;stripeRefScale={stripeRefScale}
            </div>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => copyToClipboard(`stripeRefX=${stripeRefX}&stripeRefY=${stripeRefY}&stripeRefScale=${stripeRefScale}`)}
            >
              copy
            </button>
          </div>
        </>
      ) : null}
      {stripeRefMockupSrc && stripeRefTile1 ? (
        <>
          <div>
            Ref2 X:{stripeRef2X} Y:{stripeRef2Y} S:{stripeRef2Scale}
          </div>
          <div className="flex items-center gap-2">
            <div className="pointer-events-none">
              stripeRef2X={stripeRef2X}&amp;stripeRef2Y={stripeRef2Y}&amp;stripeRef2Scale={stripeRef2Scale}
            </div>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => copyToClipboard(`stripeRef2X=${stripeRef2X}&stripeRef2Y=${stripeRef2Y}&stripeRef2Scale=${stripeRef2Scale}`)}
            >
              copy
            </button>
          </div>
        </>
      ) : null}
      {overlaySrc ? (
        <>
          <div>
            Overlay X:{stripeOverlayX} Y:{stripeOverlayY} S:{stripeOverlayScale}
          </div>
          <div className="flex items-center gap-2">
            <div className="pointer-events-none">
              stripeOverlayX={stripeOverlayX}&amp;stripeOverlayY={stripeOverlayY}&amp;stripeOverlayScale={stripeOverlayScale}
            </div>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-white hover:bg-white/25"
              onClick={() => copyToClipboard(`stripeOverlayX=${stripeOverlayX}&stripeOverlayY=${stripeOverlayY}&stripeOverlayScale=${stripeOverlayScale}`)}
            >
              copy
            </button>
          </div>
        </>
      ) : null}
      {stripeV3 ? (
        <>
          <div>
            Tiles step:{v3TileStepXLive} w:{v3TileWLive} ai:{v3TileAnchorIndexLive + 1} ax:{v3TileAnchorXLive} x0:{v3TileX0Live}
          </div>
          <div>
            v3TileStepX={v3TileStepXLive}&amp;v3TileW={v3TileWLive}&amp;v3TileAnchorIndex={v3TileAnchorIndexLive}&amp;v3TileAnchorX={v3TileAnchorXLive}&amp;v3TileX0={v3TileX0Live}
          </div>
        </>
      ) : null}
    </div>,
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
          ?? pickRect(document.querySelectorAll('#stripe-guide-right-anchor'), 'maxLeft');
        const leftX = leftRect?.left;
        const rightX = rightRect?.left;

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
        if (Number.isFinite(dprNow) && stripeV2PrevDprRef.current !== dprNow) {
          stripeV2PrevDprRef.current = dprNow;
          stripeV2PrevRightXRef.current = null;
          if (stripeBeltGuides) setStripeV2ZoomSettling(true);

          try {
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
              if (stripeV2ZoomSettleRafRef.current) window.cancelAnimationFrame(stripeV2ZoomSettleRafRef.current);
              stripeV2ZoomSettleRafRef.current = window.requestAnimationFrame(() => {
                stripeV2ZoomSettleRafRef.current = window.requestAnimationFrame(() => {
                  stripeV2ZoomSettleRafRef.current = null;
                  if (stripeBeltGuides) setStripeV2ZoomSettling(false);
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
          'maxLeft',
          stripeV2PrevRightXRef.current,
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
          ? rightRect.left
          : (anteriorRect ? anteriorRect.left : (tile14Rect ? tile14Rect.right : null));

        if (Number.isFinite(rightX)) stripeV2PrevRightXRef.current = rightX;

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
          const next = {
            left: Number.isFinite(leftXGuide) ? leftXGuide : null,
            right: Number.isFinite(rightX) ? rightX : null,
          };
          if (!prev) return next;
          if (prev.left === next.left && prev.right === next.right) return prev;
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
    items.length,
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
      const raw = window.localStorage.getItem(calibrationStorageKey);
      if (!raw) {
        if (!stripeFresh) {
          const migrated = migrateRefCalibFromLegacyKeys(calibrationStorageKey, geometrySignature || 'nogeo');
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeRefX(parsedMigrated.x);
            else setStripeRefX(stripeRefXParam);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeRefY(parsedMigrated.y);
            else setStripeRefY(stripeRefYParam);
            if (typeof parsedMigrated?.s === 'number' && Number.isFinite(parsedMigrated.s)) setStripeRefScale(parsedMigrated.s);
            else setStripeRefScale(stripeRefScaleParam);
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
        if (!stripeFresh) {
          const migrated = migrateRefCalibFromLegacyKeys(calibrationStorageKey, geometrySignature || 'nogeo');
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeRefX(parsedMigrated.x);
            else setStripeRefX(stripeRefXParam);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeRefY(parsedMigrated.y);
            else setStripeRefY(stripeRefYParam);
            if (typeof parsedMigrated?.s === 'number' && Number.isFinite(parsedMigrated.s)) setStripeRefScale(parsedMigrated.s);
            else setStripeRefScale(stripeRefScaleParam);
            return;
          }
        }
      }
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeRefX(parsed.x);
      else setStripeRefX(stripeRefXParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeRefY(parsed.y);
      else setStripeRefY(stripeRefYParam);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeRefScale(parsed.s);
      else setStripeRefScale(stripeRefScaleParam);
    } catch {
      setStripeRefX(stripeRefXParam);
      setStripeRefY(stripeRefYParam);
      setStripeRefScale(stripeRefScaleParam);
    }
  }, [
    calibrationStorageKey,
    geometrySignature,
    stripeRefMockupSrc,
    stripeFresh,
    stripeRefScaleParam,
    stripeRefXParam,
    stripeRefYParam,
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
    if (!overlaySrc) return;
    try {
      const raw = window.localStorage.getItem(overlayCalibrationStorageKey);
      if (!raw) {
        if (!stripeFresh) {
          const migrated = migrateOverlayCalibFromIndexedKeys(
            overlayCalibrationStorageKey,
            overlayCalibDesignKey,
            geometrySignature || 'nogeo',
          );
          if (migrated) {
            const parsedMigrated = JSON.parse(migrated);
            if (typeof parsedMigrated?.x === 'number' && Number.isFinite(parsedMigrated.x)) setStripeOverlayX(parsedMigrated.x);
            else setStripeOverlayX(stripeOverlayXParam);
            if (typeof parsedMigrated?.y === 'number' && Number.isFinite(parsedMigrated.y)) setStripeOverlayY(parsedMigrated.y);
            else setStripeOverlayY(stripeOverlayYParam);
            if (typeof parsedMigrated?.s === 'number' && Number.isFinite(parsedMigrated.s)) setStripeOverlayScale(parsedMigrated.s);
            else setStripeOverlayScale(stripeOverlayScaleParam);
            overlayDirtyRef.current = false;
            return;
          }
          const legacyRaw = window.localStorage.getItem(overlayCalibrationStorageKeyLegacy);
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
        }

        const austenPride3Preset = (() => {
          const s = typeof overlaySrc === 'string' ? overlaySrc.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/austen/samarreta/encreuats/pride_and_prejudice/pride-and-prejudice-3.')
            || s.includes('/placeholders/images_grid/austen/crosswords/pride-and-prejudice-3.')
          ) {
            return { x: 107.304, y: 14.956, s: 0.545, u: 'svg' };
          }
          return null;
        })();

        const austenDarcyFramePreset = (() => {
          const s = typeof overlaySrc === 'string' ? overlaySrc.toLowerCase() : '';
          if (s.includes('/custom_logos/drawings/austen/samarreta/looking_for_my_darcy/frame/') || s.includes('/placeholders/images_grid/austen/looking_for_my_darcy/')) {
            if (s.includes('-frame.')) return { x: 105.321, y: -12.902, s: 0.575, u: 'svg' };
          }
          return null;
        })();

        const austenPemberleyHousePreset = (() => {
          const s = typeof overlaySrc === 'string' ? overlaySrc.toLowerCase() : '';
          if (
            s.includes('/custom_logos/drawings/austen/samarreta/pemberley_house/')
            || s.includes('/placeholders/images_grid/austen/pemberley_house/')
          ) {
            return { x: 107.308, y: 10.982, s: 0.545, u: 'svg' };
          }
          return null;
        })();

        const preset = austenPride3Preset
          || austenDarcyFramePreset
          || austenPemberleyHousePreset
          || getFirstContactOverlayPreset(overlaySrc)
          || getTheHumanInsideOverlayPreset(overlaySrc)
          || getCubeOverlayPreset(overlaySrc)
          || getOutcastedOverlayPreset(overlaySrc);
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
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeOverlayX(parsed.x);
      else setStripeOverlayX(stripeOverlayXParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeOverlayY(parsed.y);
      else setStripeOverlayY(stripeOverlayYParam);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeOverlayScale(parsed.s);
      else setStripeOverlayScale(stripeOverlayScaleParam);
      overlayDirtyRef.current = false;
    } catch {
      setStripeOverlayX(stripeOverlayXParam);
      setStripeOverlayY(stripeOverlayYParam);
      setStripeOverlayScale(stripeOverlayScaleParam);
      overlayDirtyRef.current = false;
    }
  }, [
    overlayCalibrationStorageKey,
    overlayCalibrationStorageKeyLegacy,
    overlaySrc,
    stripeFresh,
    stripeOverlayScaleParam,
    stripeOverlayXParam,
    stripeOverlayYParam,
  ]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    try {
      window.localStorage.setItem(calibrationStorageKey, JSON.stringify({ x: stripeRefX, y: stripeRefY, s: stripeRefScale, v: 2 }));
    } catch {
      // ignore
    }
  }, [calibrationStorageKey, stripeFresh, stripeRefMockupSrc, stripeRefScale, stripeRefX, stripeRefY]);

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

  useEffect(() => {
    if (!overlaySrc) return;
    if (!overlayDirtyRef.current) return;
    try {
      window.localStorage.setItem(
        overlayCalibrationStorageKey,
        JSON.stringify({ x: stripeOverlayX, y: stripeOverlayY, s: stripeOverlayScale, u: 'svg' }),
      );
    } catch {
      // ignore
    }
  }, [overlayCalibrationStorageKey, overlaySrc, stripeFresh, stripeOverlayScale, stripeOverlayX, stripeOverlayY]);

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

  const v3TileCalibrationStorageKey = useMemo(() => {
    if (!stripeV3) return null;
    return stripeFresh
      ? `stripeV3TilesFresh_${geometrySignature}`
      : `stripeV3Tiles_${geometrySignature}`;
  }, [geometrySignature, stripeFresh, stripeV3]);

  useEffect(() => {
    if (!stripeV3) return;
    if (!v3TileCalibrationStorageKey) return;

    const hasExplicitTileParams =
      urlParams?.has('v3TileStepX') ||
      urlParams?.has('v3TileW') ||
      urlParams?.has('v3TileAnchorX') ||
      urlParams?.has('v3TileAnchorIndex') ||
      urlParams?.has('v3TileX0');
    if (hasExplicitTileParams) return;

    try {
      const raw = window.localStorage.getItem(v3TileCalibrationStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      if (typeof parsed.step === 'number' && Number.isFinite(parsed.step)) setV3TileStepXLive(parsed.step);
      if (typeof parsed.w === 'number' && Number.isFinite(parsed.w)) setV3TileWLive(parsed.w);
      if (typeof parsed.ax === 'number' && Number.isFinite(parsed.ax)) setV3TileAnchorXLive(parsed.ax);
      if (typeof parsed.ai === 'number' && Number.isFinite(parsed.ai)) setV3TileAnchorIndexLive(parsed.ai);
      if (typeof parsed.x0 === 'number' && Number.isFinite(parsed.x0)) setV3TileX0Live(parsed.x0);
    } catch {
      // ignore
    }
  }, [stripeFresh, stripeV3, urlParams, v3TileCalibrationStorageKey]);

  useEffect(() => {
    if (!stripeV3) return;
    if (!v3TileCalibrationStorageKey) return;
    if (!v3TilesDirtyRef.current) return;
    try {
      window.localStorage.setItem(
        v3TileCalibrationStorageKey,
        JSON.stringify({
          step: v3TileStepXLive,
          w: v3TileWLive,
          ax: v3TileAnchorXLive,
          ai: v3TileAnchorIndexLive,
          x0: v3TileX0Live,
        }),
      );
    } catch {
      // ignore
    }
  }, [
    stripeFresh,
    stripeV3,
    v3TileAnchorIndexLive,
    v3TileAnchorXLive,
    v3TileCalibrationStorageKey,
    v3TileStepXLive,
    v3TileWLive,
    v3TileX0Live,
  ]);

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
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isTiles) {
          v3TilesDirtyRef.current = true;
          setV3TileStepXLive((v) => Number((v - tileStepDelta).toFixed(3)));
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
          v3TilesDirtyRef.current = true;
          setV3TileStepXLive((v) => Number((v + tileStepDelta).toFixed(3)));
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? ((step * m.a) + (0 * m.c)) : (step);
          const dySvg = m ? ((step * m.b) + (0 * m.d)) : 0;
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
          v3TilesDirtyRef.current = true;
          setV3TileX0Live((v) => Number((v - tileStepDelta).toFixed(3)));
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
          v3TilesDirtyRef.current = true;
          setV3TileX0Live((v) => Number((v + tileStepDelta).toFixed(3)));
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          const m = stripeV3OverlayInvM;
          const dxSvg = m ? ((0 * m.a) + (step * m.c)) : 0;
          const dySvg = m ? ((0 * m.b) + (step * m.d)) : (step);
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
          v3TilesDirtyRef.current = true;
          setV3TileWLive((v) => Number((v + (e.key === '-' ? -tileWDelta : tileWDelta)).toFixed(3)));
        }
        else if (isOverlay) {
          overlayDirtyRef.current = true;
          setStripeOverlayScale((v) => Number((v + delta).toFixed(3)));
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
  }, [overlaySrc, stripeCalibEnabled, stripeCalibMode, stripeRefMockupSrc, stripeV3OverlayInvM]);

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
    if (items.length === 0) return;

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
  }, [items.length, megaTileSize, selectedColorSlug]);

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
  }, [megaTileSize, items.length]);

  const containerH = megaTileSize;

  useEffect(() => {
    if (!megaTileSize) return;
    if (items.length === 0) return;
    if (!selectedTileSize.w || !selectedTileSize.h) return;

    if (stripeRecalibrate || !dotCalibrationRef.current) {
      dotCalibrationRef.current = {
        rx: stripeDotXPx / selectedTileSize.w,
        ry: stripeDotYPx / selectedTileSize.h,
      };
    }
  }, [items.length, megaTileSize, selectedTileSize.w, selectedTileSize.h, stripeDotXPx, stripeDotYPx, stripeRecalibrate]);

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
            opacity: (!stripeV3Ready || (stripeBeltGuides && stripeV2ZoomSettling)) ? 0 : 1,
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
              height: `${(stripeV2 ? (containerH + 3) : containerH)}px`,
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
              const tileLeftX = (v3TileAnchorXLive + (v3TileStepXLive * (idx - v3TileAnchorIndexLive))) + v3TileX0Live;
              const leftPct = tileLeftX / stripeV3SvgW;
              const wPct = v3TileWLive / stripeV3SvgW;
              if (!Number.isFinite(leftPct) || !Number.isFinite(wPct)) return null;

              const tile1LeftX = (v3TileAnchorXLive + (v3TileStepXLive * (0 - v3TileAnchorIndexLive))) + v3TileX0Live;
              const tile1LeftPct = tile1LeftX / stripeV3SvgW;

              return (
                <>
                  <div
                    className="pointer-events-none absolute top-0 h-full"
                    style={{
                      left: `${leftPct * 100}%`,
                      width: `${wPct * 100}%`,
                      overflow: 'visible',
                      zIndex: 40,
                    }}
                  >
                    <img
                      src={stripeRefMockupSrc}
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
                      style={{
                        opacity: (stripeCalibMode === 'ref' || stripeCalibMode === 'overlay' || stripeCalibMode === 'ref2')
                          ? Math.min(stripeRefOpacity, 0.45)
                          : stripeRefOpacity,
                        mixBlendMode: stripeRefBlendCss,
                        transform: `translate(${stripeRefX}px, ${stripeRefY + stripeRefRenderYOffsetPx}px) scale(${stripeRefScale})`,
                        transformOrigin: 'top left',
                      }}
                    />
                  </div>

                  {stripeRefTile1 && Number.isFinite(tile1LeftPct) ? (
                    <div
                      className="pointer-events-none absolute top-0 h-full"
                      style={{
                        left: `${tile1LeftPct * 100}%`,
                        width: `${wPct * 100}%`,
                        overflow: 'visible',
                        zIndex: 41,
                      }}
                    >
                      <img
                          src={stripeRefMockupSrc}
                          alt=""
                          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
                          style={{
                            opacity: (stripeCalibMode === 'ref' || stripeCalibMode === 'overlay' || stripeCalibMode === 'ref2')
                              ? Math.min(stripeRefOpacity, 0.45)
                              : stripeRefOpacity,
                            mixBlendMode: stripeRefBlendCss,
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
                            href={overlaySrc}
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
                        src={overlaySrc}
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

            {overlaySrc && !stripeOverlayClip ? (
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full" style={{ zIndex: 35 }}>
                <img
                  src={overlaySrc}
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
                pointerEvents: 'auto',
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
                const d = idx === 0
                  ? 'M64.395,272.049l-3.526,-135.289l-13.835,8.715l-47.034,-55.965l56.992,-48.167c20.84,-11.371 40.774,-21.067 58.985,-27.577l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-178.747,0Z'
                  : 'M86.446,26.217c10.229,-4.863 20.111,-9.083 29.531,-12.451l70.703,0c21.143,8.858 41.965,18.156 62.042,28.613l54.431,45.511l-47.202,55.281l-12.194,-7.953l-0.615,136.831l-151.015,0l0.486,-108.176l66.607,-78.006l-69.024,-57.713c-1.241,-0.647 -2.492,-1.293 -3.75,-1.937Z';

                const debugHitMode = stripeBeltGuides || debugStripeHit;
                const isHover = stripeV3HoverIdx === idx;
                const showHit = debugHitMode;

                const overlayClipId = `v3-ovclip-${geometrySignature}-${idx}`;

                return (
                  <g key={idx} transform={`translate(${offsetX}, 0)`}>
                    {overlaySrc && stripeOverlayClip ? (
                      <>
                        <defs>
                          <clipPath id={overlayClipId} clipPathUnits="userSpaceOnUse">
                            <path d={d} transform={`translate(0, ${stripeV3HitTranslateYLive})`} />
                          </clipPath>
                        </defs>
                        <g clipPath={`url(#${overlayClipId})`}>
                          <image
                            href={overlaySrc}
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
                        : (showHit ? 'rgba(0, 180, 255, 0.14)' : 'rgba(0,0,0,0.001)')}
                      stroke={isHover
                        ? 'rgba(255, 255, 255, 0.35)'
                        : (showHit ? 'rgba(255, 0, 0, 0.55)' : 'transparent')}
                      strokeWidth={isHover ? 1 : (showHit ? 2 : 0)}
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onMouseEnter={() => setStripeV3HoverIdx(idx)}
                      onMouseLeave={() => setStripeV3HoverIdx((prev) => (prev === idx ? null : prev))}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        const realSlug = effectiveItems?.[idx] || items?.[idx] || `t${idx + 1}`;
                        onSelect?.(realSlug);
                      }}
                      onClick={() => {
                        const realSlug = effectiveItems?.[idx] || items?.[idx] || `t${idx + 1}`;
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
            height: `${(stripeV2 ? (containerH + 3) : containerH)}px`,
            pointerEvents: 'none',
            opacity: stripeBeltGuides && stripeV2ZoomSettling ? 0 : 1,
            overflowX: stripeV2 ? (stripeV2Sprite ? 'visible' : 'hidden') : (stripeClampLevel >= 1 ? 'hidden' : 'visible'),
            overflowY: stripeV2 ? 'hidden' : 'visible',
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
            height: `${(stripeV2 ? (containerH + 3) : containerH)}px`,
            pointerEvents: 'none',
            overflowY: stripeV2 ? 'hidden' : undefined,
            clipPath: (stripeV2 && !stripeV2Sprite) ? 'inset(0 0 3px 0)' : undefined,
            transform: stripeV2
              ? `matrix(${(stripeV2Sprite && stripeV2LiveFit?.scale) ? stripeV2LiveFit.scale : stripeV2Scale}, 0, 0, ${(stripeV2Sprite && stripeV2LiveFit?.scale) ? stripeV2LiveFit.scale : stripeV2Scale}, ${snapToDevicePx(stripeV2ViewportExtendLeftPx + (stripeV2LiveFit?.tx ?? 0))}, ${snapToDevicePx(stripeV2YOffsetPx)})`
              : undefined,
            transformOrigin: stripeV2
              ? (stripeV2LiveFit ? '0px 0%' : `${stripeV2AnchorXPx}px 0%`)
              : undefined,
          }}
        >
          {stripeV2Sprite ? (
            <img
              src={stripeV2SpriteSrc}
              alt=""
              className="pointer-events-none absolute bottom-0 block"
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'left bottom',
                left: 'auto',
                right: '0px',
                clipPath: stripeV2SpriteInsetLeftPx ? `inset(0 0 0 ${stripeV2SpriteInsetLeftPx}px)` : undefined,
                WebkitClipPath: stripeV2SpriteInsetLeftPx ? `inset(0 0 0 ${stripeV2SpriteInsetLeftPx}px)` : undefined,
              }}
            />
          ) : null}
          {effectiveItems.map((slug, idx) => {
            const src =
              stripeV2
                ? (stripeV2Sprite ? null : `/placeholders/t-shirt_buttons/${idx + 1}.png`)
                : colorButtonSrcBySlug?.[slug];
            const zLayer = 100 - idx;
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

            const tileWPx = buttonW + stripeV2Tile1ExtendLeftPx;
            const tileLeftPx = left - stripeV2Tile1ExtendLeftPx;

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
                  height: `${containerH}px`,
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
                      height: `${containerH}px`,
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
                  {src ? (
                    <span
                      className={`absolute inset-0 ${isWhiteTile ? 'overflow-visible' : 'overflow-hidden'}`}
                      style={shouldClip ? { clipPath: firstClip, WebkitClipPath: firstClip } : undefined}
                    >
                      {isWhiteTile && whiteOverhangPx ? (
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
                            position: stripeV2Tile1ExtendLeftPx ? 'absolute' : undefined,
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
                      )}

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
                            zIndex: 40,
                            opacity: stripeRefOpacity,
                            mixBlendMode: stripeRefBlendCss,
                            transform: `translate(${stripeRefX}px, ${stripeRefY + stripeRefRenderYOffsetPx}px) scale(${stripeRefScale})`,
                            transformOrigin: 'top left',
                          }}
                        />
                      ) : null}

                      {overlaySrc ? (
                        <img
                          src={overlaySrc}
                          alt=""
                          className={`pointer-events-none absolute left-1/2 object-contain ${overlayClassName || ''}`}
                          style={{
                            top: `${stripeOverlayTopPct}%`,
                            width: `${stripeOverlayWPct}%`,
                            height: `${stripeOverlayHPct}%`,
                            transform: `translate(-50%, -50%) translate(${stripeOverlayX}px, ${stripeOverlayY}px) scale(${stripeOverlayScale})`,
                            transformOrigin: 'top left',
                            zIndex: 30,
                            opacity: 1,
                          }}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </div>

            {stripeV2 ? (
              <>
                <svg
                  role="button"
                  tabIndex={0}
                  aria-label={`t${idx + 1}`}
                  className="absolute"
                  onClick={() => {
                    const v2Key = `t${idx + 1}`;
                    setLastClickedV2Slug(v2Key);
                    const realSlug = items?.[idx] || slug;
                    onSelect?.(realSlug);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    const v2Key = `t${idx + 1}`;
                    setLastClickedV2Slug(v2Key);
                    const realSlug = items?.[idx] || slug;
                    onSelect?.(realSlug);
                  }}
                  style={(() => {
                    const trackH = stripeV2 ? (containerH + 3) : containerH;
                    const hitHPx = Math.round(trackH * stripeV2HitSvg.s);
                    const aspect = stripeV2HitSvg.vh ? stripeV2HitSvg.vw / stripeV2HitSvg.vh : 1;
                    const hitWPx = Math.round(hitHPx * aspect);
                    const blockOffsetXPx = idx >= 1 ? 20 : 0;
                    const insetXPx = Math.round(globalOffsetXPx + (buttonW - hitWPx) / 2 + blockOffsetXPx);
                    const baseTop = stripeV2Sprite ? 0 : 1;
                    const topPx = Math.round(globalOffsetYPx + baseTop + (trackH - hitHPx));
                    return {
                      left: stripeV2Tile1ExtendLeftPx ? undefined : `${insetXPx}px`,
                      right: stripeV2Tile1ExtendLeftPx ? `${insetXPx}px` : undefined,
                      top: `${topPx}px`,
                      width: `${hitWPx}px`,
                      height: `${hitHPx}px`,
                      pointerEvents: 'none',
                    };
                  })()}
                  viewBox={stripeV2HitSvg.viewBox}
                  preserveAspectRatio="xMidYMax meet"
                >
                  {debugStripeHit ? (
                    <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                  ) : null}
                  <path
                    d={stripeV2HitSvg.d}
                    fill={debugStripeHit ? 'rgba(0, 180, 255, 0.14)' : 'rgba(0,0,0,0.001)'}
                    stroke={
                      debugStripeHit && lastClickedV2Slug === `t${idx + 1}`
                        ? 'rgba(255, 0, 0, 0.85)'
                        : debugStripeHit
                          ? 'rgba(255, 0, 0, 0.45)'
                          : 'transparent'
                    }
                    strokeWidth={debugStripeHit && lastClickedV2Slug === `t${idx + 1}` ? 2 : 1}
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: 'auto' }}
                  />
                </svg>
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
            )}
          </div>
            );
          })}
        </div>
      </div>
      )}
    </>
  );
}
