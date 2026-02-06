import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  overlaySrc,
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
  const [hudFixedPos, setHudFixedPos] = useState(null);
  const [stripeW, setStripeW] = useState(0);
  const [lastClickedV2Slug, setLastClickedV2Slug] = useState(null);

  const selectedTileRef = useRef(null);
  const beltTile1Ref = useRef(null);
  const beltTile14Ref = useRef(null);
  const [selectedTileSize, setSelectedTileSize] = useState({ w: 0, h: 0 });
  const dotCalibrationRef = useRef(null);
  const [beltGuidesRect, setBeltGuidesRect] = useState(null);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const wsEnabled = !!(import.meta.env.DEV && urlParams?.has('ws'));
  const stripeV2AllowUrlParams = !!(allowStripeV2UrlParams ?? wsEnabled);
  const debugStripeHitFromUrl = !!urlParams?.has('debugStripeHit');
  const debugStripeHit = wsEnabled || forceDebugStripeHit || (!ignoreUrlDebugStripeHit && debugStripeHitFromUrl);
  const showStripeClickDebug = wsEnabled || forceDebugStripeHit || debugStripeHitFromUrl;
  const stripeRecalibrate = !!urlParams?.has('stripeRecalibrate');
  const mirror1p5 = wsEnabled || !!urlParams?.has('mirror1p5');
  const stripeBeltGuides = !!(urlParams?.has('stripeBeltGuides') || urlParams?.has('beltGuides'));

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

  const parseStringParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (raw == null || raw === '') return fallback;
    return raw.toString();
  };

  const stripeDotXPx = parseFloatParam('stripeDotX', 0);
  const stripeDotYPx = parseFloatParam('stripeDotY', -6.5);

  const stripeRefMockupSrc = parseStringParam('stripeRefMockup', '');
  const stripeRefGroup = parseStringParam('stripeRefGroup', '');
  const stripeRefTargetSlug = parseStringParam('stripeRefTarget', '');
  const stripeRefTargetIndex = parseIntParam('stripeRefTargetIndex', 0);
  const stripeRefBlend = parseStringParam('stripeRefBlend', 'multiply');
  const stripeRefOpacity = parseFloatParam(
    'stripeRefOpacity',
    stripeRefBlend === 'average' && !urlParams?.has('stripeRefOpacity') ? 0.5 : 1,
  );
  const stripeRefBlendCss = stripeRefBlend === 'average' ? 'normal' : stripeRefBlend;
  const useFirstContactRed9RefDefaults =
    stripeRefTargetIndex === 9 &&
    typeof stripeRefMockupSrc === 'string' &&
    stripeRefMockupSrc.includes('first-contact-') &&
    stripeRefMockupSrc.includes('-black-white.png');
  const stripeRefXParam = parseFloatParam('stripeRefX', useFirstContactRed9RefDefaults ? -46 : 0);
  const stripeRefYParam = parseFloatParam('stripeRefY', useFirstContactRed9RefDefaults ? 0 : 0);
  const stripeRefScaleParam = parseFloatParam('stripeRefScale', useFirstContactRed9RefDefaults ? 1.315 : 1);

  const overlayKey = typeof overlaySrc === 'string' ? overlaySrc.toLowerCase() : '';
  const isOverlayNcc1701D = stripeRefTargetIndex === 9 && overlayKey.includes('ncc-1701-d');
  const isOverlayNcc1701 = stripeRefTargetIndex === 9 && overlayKey.includes('ncc-1701') && !overlayKey.includes('ncc-1701-d');
  const isOverlayNx01 = stripeRefTargetIndex === 9 && overlayKey.includes('nx-01');
  const isOverlayWormhole = stripeRefTargetIndex === 9 && overlayKey.includes('wormhole');
  const isOverlayPlasmaEscape = stripeRefTargetIndex === 9 && overlayKey.includes('plasma-escape');
  const isOverlayVulcansEnd = stripeRefTargetIndex === 9 && overlayKey.includes("vulcan") && overlayKey.includes('end');
  const isOverlayPhoenix = stripeRefTargetIndex === 9 && (overlayKey.includes('the-phoenix') || overlayKey.includes('the_phoenix') || overlayKey.includes('phoenix'));
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
          ? 115
          : isOverlayNx01
            ? 21
            : isOverlayNcc1701D
              ? 18
              : isOverlayNcc1701
                ? 18
                : 0,
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
          ? 0.895
          : isOverlayNx01
            ? 0.48
            : isOverlayNcc1701D
              ? 0.585
              : isOverlayNcc1701
                ? 0.595
                : 1,
  );

  const stripeCalibModeParam = parseStringParam('stripeCalibMode', 'ref');
  const stripeHudPos = parseStringParam('stripeHudPos', 'below-deck');

  const geometrySignature = useMemo(() => {
    const mt = Number.isFinite(megaTileSize) ? Math.round(megaTileSize) : 0;
    const cf = Number.isFinite(compressFactor) ? Number(compressFactor).toFixed(3) : '0';
    const fo = Number.isFinite(firstOffsetPx) ? Math.round(firstOffsetPx) : 0;
    const lo = Number.isFinite(lastOffsetPx) ? Math.round(lastOffsetPx) : 0;
    const cr = Number.isFinite(cropFirstRightPx) ? Math.round(cropFirstRightPx) : 0;
    const rb = redistributeBetweenFirstAndLast ? 1 : 0;
    return `mt${mt}_cf${cf}_fo${fo}_lo${lo}_cr${cr}_rb${rb}`;
  }, [megaTileSize, compressFactor, firstOffsetPx, lastOffsetPx, cropFirstRightPx, redistributeBetweenFirstAndLast]);

  const calibrationStorageKey = useMemo(() => {
    const base = 'stripeRefCalib';
    const t = stripeRefTargetIndex ? `i${stripeRefTargetIndex}` : stripeRefTargetSlug ? `s${stripeRefTargetSlug}` : 'all';
    const m = stripeRefGroup
      ? `g${stripeRefGroup.replace(/[^a-z0-9]+/gi, '_').slice(0, 48)}`
      : stripeRefMockupSrc
        ? stripeRefMockupSrc.replace(/[^a-z0-9]+/gi, '_').slice(0, 48)
        : 'none';
    const g = stripeRefGroup ? 'g0' : geometrySignature;
    return `${base}_${t}_${m}_${g}`;
  }, [geometrySignature, stripeRefGroup, stripeRefMockupSrc, stripeRefTargetIndex, stripeRefTargetSlug]);

  const overlayCalibrationStorageKey = useMemo(() => {
    const base = 'stripeOverlayCalib';
    const t = stripeRefTargetIndex ? `i${stripeRefTargetIndex}` : 'all';
    const m = overlaySrc ? overlaySrc.replace(/[^a-z0-9]+/gi, '_').slice(0, 48) : 'none';
    const g = geometrySignature;
    return `${base}_${t}_${m}_${g}`;
  }, [geometrySignature, overlaySrc, stripeRefTargetIndex]);

  useEffect(() => {
    if (stripeHudPos !== 'below-deck') {
      setHudFixedPos(null);
      return undefined;
    }
    if (!stripeRefMockupSrc && !overlaySrc) {
      setHudFixedPos(null);
      return undefined;
    }

    const update = () => {
      const el = stripeRootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setHudFixedPos((prev) => {
        const next = { top: Math.round(r.bottom + 8), left: Math.round(r.left + 8) };
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
  }, [overlaySrc, stripeHudPos, stripeRefMockupSrc]);

  const [stripeRefX, setStripeRefX] = useState(stripeRefXParam);
  const [stripeRefY, setStripeRefY] = useState(stripeRefYParam);
  const [stripeRefScale, setStripeRefScale] = useState(stripeRefScaleParam);
  const [stripeRefRX, setStripeRefRX] = useState(null);
  const [stripeRefRY, setStripeRefRY] = useState(null);

  const [stripeOverlayX, setStripeOverlayX] = useState(stripeOverlayXParam);
  const [stripeOverlayY, setStripeOverlayY] = useState(stripeOverlayYParam);
  const [stripeOverlayScale, setStripeOverlayScale] = useState(stripeOverlayScaleParam);

  const [stripeCalibMode, setStripeCalibMode] = useState(stripeCalibModeParam === 'overlay' ? 'overlay' : 'ref');

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    try {
      const raw = window.localStorage.getItem(calibrationStorageKey);
      if (!raw) {
        setStripeRefX(stripeRefXParam);
        setStripeRefY(stripeRefYParam);
        setStripeRefScale(stripeRefScaleParam);
        setStripeRefRX(null);
        setStripeRefRY(null);
        return;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeRefX(parsed.x);
      else setStripeRefX(stripeRefXParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeRefY(parsed.y);
      else setStripeRefY(stripeRefYParam);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeRefScale(parsed.s);
      else setStripeRefScale(stripeRefScaleParam);

      if (typeof parsed?.rx === 'number' && Number.isFinite(parsed.rx)) setStripeRefRX(parsed.rx);
      else setStripeRefRX(null);
      if (typeof parsed?.ry === 'number' && Number.isFinite(parsed.ry)) setStripeRefRY(parsed.ry);
      else setStripeRefRY(null);
    } catch {
      setStripeRefX(stripeRefXParam);
      setStripeRefY(stripeRefYParam);
      setStripeRefScale(stripeRefScaleParam);
      setStripeRefRX(null);
      setStripeRefRY(null);
    }
  }, [calibrationStorageKey, stripeRefMockupSrc, stripeRefScaleParam, stripeRefXParam, stripeRefYParam]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    if (!selectedTileSize.w || !selectedTileSize.h) return;

    setStripeRefRX((prev) => (Number.isFinite(prev) ? prev : stripeRefX / selectedTileSize.w));
    setStripeRefRY((prev) => (Number.isFinite(prev) ? prev : stripeRefY / selectedTileSize.h));
  }, [selectedTileSize.h, selectedTileSize.w, stripeRefMockupSrc, stripeRefX, stripeRefY]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    if (!selectedTileSize.w || !selectedTileSize.h) return;
    if (!Number.isFinite(stripeRefRX) || !Number.isFinite(stripeRefRY)) return;

    const nextX = stripeRefRX * selectedTileSize.w;
    const nextY = stripeRefRY * selectedTileSize.h;
    setStripeRefX((v) => (Math.abs(v - nextX) < 0.01 ? v : nextX));
    setStripeRefY((v) => (Math.abs(v - nextY) < 0.01 ? v : nextY));
  }, [selectedTileSize.h, selectedTileSize.w, stripeRefMockupSrc, stripeRefRX, stripeRefRY]);

  useEffect(() => {
    if (!overlaySrc) return;
    try {
      const raw = window.localStorage.getItem(overlayCalibrationStorageKey);
      if (!raw) {
        setStripeOverlayX(stripeOverlayXParam);
        setStripeOverlayY(stripeOverlayYParam);
        setStripeOverlayScale(stripeOverlayScaleParam);
        return;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === 'number' && Number.isFinite(parsed.x)) setStripeOverlayX(parsed.x);
      else setStripeOverlayX(stripeOverlayXParam);
      if (typeof parsed?.y === 'number' && Number.isFinite(parsed.y)) setStripeOverlayY(parsed.y);
      else setStripeOverlayY(stripeOverlayYParam);
      if (typeof parsed?.s === 'number' && Number.isFinite(parsed.s)) setStripeOverlayScale(parsed.s);
      else setStripeOverlayScale(stripeOverlayScaleParam);
    } catch {
      setStripeOverlayX(stripeOverlayXParam);
      setStripeOverlayY(stripeOverlayYParam);
      setStripeOverlayScale(stripeOverlayScaleParam);
    }
  }, [overlayCalibrationStorageKey, overlaySrc, stripeOverlayScaleParam, stripeOverlayXParam, stripeOverlayYParam]);

  useEffect(() => {
    if (!stripeRefMockupSrc) return;
    try {
      const rx = selectedTileSize.w ? stripeRefX / selectedTileSize.w : stripeRefRX;
      const ry = selectedTileSize.h ? stripeRefY / selectedTileSize.h : stripeRefRY;
      window.localStorage.setItem(
        calibrationStorageKey,
        JSON.stringify({ x: stripeRefX, y: stripeRefY, s: stripeRefScale, rx, ry }),
      );
    } catch {
      // ignore
    }
  }, [
    calibrationStorageKey,
    selectedTileSize.h,
    selectedTileSize.w,
    stripeRefMockupSrc,
    stripeRefRX,
    stripeRefRY,
    stripeRefScale,
    stripeRefX,
    stripeRefY,
  ]);

  useEffect(() => {
    if (!overlaySrc) return;
    try {
      window.localStorage.setItem(
        overlayCalibrationStorageKey,
        JSON.stringify({ x: stripeOverlayX, y: stripeOverlayY, s: stripeOverlayScale }),
      );
    } catch {
      // ignore
    }
  }, [overlayCalibrationStorageKey, overlaySrc, stripeOverlayScale, stripeOverlayX, stripeOverlayY]);

  useEffect(() => {
    if (!stripeRefMockupSrc && !overlaySrc) return;

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
        setStripeCalibMode((m) => (m === 'ref' ? 'overlay' : 'ref'));
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

      const step = e.shiftKey ? 10 : 1;
      const isOverlay = stripeCalibMode === 'overlay';
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isOverlay) setStripeOverlayX((v) => v - step);
        else setStripeRefX((v) => v - step);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isOverlay) setStripeOverlayX((v) => v + step);
        else setStripeRefX((v) => v + step);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isOverlay) setStripeOverlayY((v) => v - step);
        else setStripeRefY((v) => v - step);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isOverlay) setStripeOverlayY((v) => v + step);
        else setStripeRefY((v) => v + step);
        return;
      }

      if (e.key === '+' || e.key === '=' || e.key === '-') {
        e.preventDefault();
        const delta = e.key === '-' ? -0.005 : 0.005;
        if (isOverlay) setStripeOverlayScale((v) => Number((v + delta).toFixed(3)));
        else setStripeRefScale((v) => Number((v + delta).toFixed(3)));
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlaySrc, stripeCalibMode, stripeRefMockupSrc]);

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
  }, [items.length, megaTileSize, selectedColorSlug, stripeRefMockupSrc, stripeRefTargetIndex, stripeRefTargetSlug]);

  useEffect(() => {
    if (!stripeRootRef.current) return;
    const el = stripeRootRef.current;
    const update = () => {
      const w = el.clientWidth || 0;
      setStripeW(w);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [megaTileSize, items.length]);

  useEffect(() => {
    if (!stripeRefMockupSrc && !stripeRefGroup && !stripeBeltGuides) {
      setBeltGuidesRect(null);
      return undefined;
    }

    const update = () => {
      const leftAnchor = typeof document !== 'undefined' ? document.getElementById('stripe-guide-left-anchor') : null;
      const rightAnchor = typeof document !== 'undefined' ? document.getElementById('stripe-guide-right-anchor') : null;

      const el1 = beltTile1Ref.current;
      const el14 = beltTile14Ref.current;

      const r1 = el1 ? el1.getBoundingClientRect() : null;
      const r14 = el14 ? el14.getBoundingClientRect() : null;
      const rl = leftAnchor ? leftAnchor.getBoundingClientRect() : null;
      const rr = rightAnchor ? rightAnchor.getBoundingClientRect() : null;

      const hasAny = (rl && rl.width) || (rr && rr.width) || (r1 && r1.width) || (r14 && r14.width);
      if (!hasAny) {
        setBeltGuidesRect(null);
        return;
      }

      const next = {
        x1: rl && rl.width ? rl.left : r1 ? r1.left : 0,
        x14: rr && rr.width ? rr.left : r14 ? r14.right : 0,
        yTop: Math.min(r1 ? r1.top : Infinity, r14 ? r14.top : Infinity, rl ? rl.top : Infinity, rr ? rr.top : Infinity),
        yBottom: Math.max(r1 ? r1.bottom : -Infinity, r14 ? r14.bottom : -Infinity, rl ? rl.bottom : -Infinity, rr ? rr.bottom : -Infinity),
      };
      const eps = 0.25;
      setBeltGuidesRect((prev) => {
        if (!prev) return next;
        const same =
          Math.abs(prev.x1 - next.x1) < eps &&
          Math.abs(prev.x14 - next.x14) < eps &&
          Math.abs(prev.yTop - next.yTop) < eps &&
          Math.abs(prev.yBottom - next.yBottom) < eps;
        return same ? prev : next;
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [stripeBeltGuides, stripeRefGroup, stripeRefMockupSrc]);

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

  const imageAspect = 161 / 145;
  const refMegaTileSize = 360;
  const refButtonW = Math.round(refMegaTileSize * imageAspect);
  const buttonW = Math.round(megaTileSize * imageAspect);
  const stripeWVirtual = Math.max(
    0,
    stripeW - (stripeV2 ? stripeV2ViewportExtendLeftPx : 0) + (stripeV2 ? stripeV2ViewportTrimRightPx : 0)
  );
  const baseOverlap = Math.round(megaTileSize * 0.36);
  const baseStep = Math.max(0, buttonW - baseOverlap);
  const step = Math.round(baseStep * compressFactor);
  const lastIdx = 13;
  const offsetLast = Number.isFinite(itemLeftOffsetPxByIndex?.[lastIdx]) ? itemLeftOffsetPxByIndex[lastIdx] : 0;
  const computedLastOffsetPx =
    autoAlignLastToRight && stripeWVirtual > 0
      ? (Number.isFinite(offsetLast) && offsetLast > 0 ? offsetLast : lastOffsetPx)
      : lastOffsetPx;
  const stripeV2AnchorXPx = stripeWVirtual > 0
    ? (stripeWVirtual - stripeV2InsetRightPx) - computedLastOffsetPx + lastTileExtraOffsetPx + stripeV2PivotOffsetXPx
    : null;
  const stepEq = step + computedLastOffsetPx / 13;
  const hitW = Math.max(1, Math.round(stepEq));
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
      {(stripeBeltGuides || stripeRefMockupSrc || stripeRefGroup) && beltGuidesRect && typeof document !== 'undefined'
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[36000]">
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  bottom: 0,
                  left: `${beltGuidesRect.x1}px`,
                  width: '2px',
                  background: 'rgba(34, 197, 94, 0.9)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 0 6px rgba(34,197,94,0.55)',
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  bottom: 0,
                  left: `${beltGuidesRect.x14}px`,
                  width: '2px',
                  background: 'rgba(34, 197, 94, 0.9)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 0 6px rgba(34,197,94,0.55)',
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  top: `${beltGuidesRect.yBottom}px`,
                  height: '2px',
                  background: 'rgba(34, 197, 94, 0.65)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
                }}
              />
              <div
                className="rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white"
                style={{ position: 'fixed', left: `${beltGuidesRect.x1 + 6}px`, top: `${Math.max(0, beltGuidesRect.yTop - 18)}px` }}
              >
                belt x1={beltGuidesRect.x1.toFixed(2)} x14={beltGuidesRect.x14.toFixed(2)} yB={beltGuidesRect.yBottom.toFixed(2)}
              </div>
            </div>,
            document.body,
          )
        : null}
      {stripeHudPos === 'below-deck' && (stripeRefMockupSrc || overlaySrc) && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[30000] rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white"
              style={{
                top: `${hudFixedPos?.top ?? 0}px`,
                left: `${hudFixedPos?.left ?? 0}px`,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div>Calib: Tab toggle, R=ref, O=overlay</div>
              <div>Arrows (Shift=10px), +/- scale</div>
              <div>Mode: {stripeCalibMode}</div>
              <div>Clamp: {stripeClampLevel}</div>
              {stripeRefMockupSrc ? (
                <>
                  <div>
                    Ref X:{stripeRefX} Y:{stripeRefY} S:{stripeRefScale}
                  </div>
                  <div>
                    StripeW:{Number(stripeW).toFixed(2)} Virtual:{Number(stripeWVirtual).toFixed(2)} LastOff:{Number(computedLastOffsetPx).toFixed(2)}
                  </div>
                  <div>
                    stripeRefX={stripeRefX}&amp;stripeRefY={stripeRefY}&amp;stripeRefScale={stripeRefScale}
                  </div>
                </>
              ) : null}
              {overlaySrc ? (
                <>
                  <div>
                    Overlay X:{stripeOverlayX} Y:{stripeOverlayY} S:{stripeOverlayScale}
                  </div>
                  <div>
                    stripeOverlayX={stripeOverlayX}&amp;stripeOverlayY={stripeOverlayY}&amp;stripeOverlayScale={stripeOverlayScale}
                  </div>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}

      <div
        ref={stripeRootRef}
        className="absolute left-0 top-0 z-[40] w-full"
        style={{
          height: `${containerH}px`,
          pointerEvents: 'none',
          overflowX: stripeV2 ? 'hidden' : (stripeClampLevel >= 1 ? 'hidden' : 'visible'),
          overflowY: 'visible',
          left: stripeV2ViewportExtendLeftPx ? `${-stripeV2ViewportExtendLeftPx}px` : undefined,
          width: (stripeV2ViewportExtendLeftPx || stripeV2ViewportTrimRightPx)
            ? `calc(100% + ${stripeV2ViewportExtendLeftPx}px - ${stripeV2ViewportTrimRightPx}px)`
            : undefined,
          backgroundColor: blueViewport ? 'rgba(0, 90, 255, 0.08)' : undefined,
          outline: blueViewport ? '2px solid rgba(0, 90, 255, 0.9)' : undefined,
          outlineOffset: blueViewport ? '-2px' : undefined,
        }}
      >
        {stripeHudPos !== 'below-deck' && (stripeRefMockupSrc || overlaySrc) ? (
          <div
            className={`pointer-events-none absolute z-[999] rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] text-white ${
              stripeHudPos === 'above-left' || stripeHudPos === 'left' ? 'left-2' : 'right-2'
            }`}
            style={{
              top: stripeHudPos.startsWith('above') ? 0 : 8,
              transform: stripeHudPos.startsWith('above') ? 'translateY(calc(-100% - 8px))' : undefined,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div>Calib: Tab toggle, R=ref, O=overlay</div>
            <div>Arrows (Shift=10px), +/- scale</div>
            <div>Mode: {stripeCalibMode}</div>
            <div>Clamp: {stripeClampLevel}</div>
            {stripeRefMockupSrc ? (
              <>
                <div>
                  Ref X:{stripeRefX} Y:{stripeRefY} S:{stripeRefScale}
                </div>
                <div>
                  stripeRefX={stripeRefX}&amp;stripeRefY={stripeRefY}&amp;stripeRefScale={stripeRefScale}
                </div>
              </>
            ) : null}
            {overlaySrc ? (
              <>
                <div>
                  Overlay X:{stripeOverlayX} Y:{stripeOverlayY} S:{stripeOverlayScale}
                </div>
                <div>
                  stripeOverlayX={stripeOverlayX}&amp;stripeOverlayY={stripeOverlayY}&amp;stripeOverlayScale={stripeOverlayScale}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        <div
          className="absolute left-0 top-0 w-full"
          style={{
            height: `${containerH}px`,
            pointerEvents: 'none',
            transform: stripeV2
              ? `translateX(${stripeV2ViewportExtendLeftPx}px) scale(${stripeV2Scale})`
              : undefined,
            transformOrigin: stripeV2 ? (stripeV2AnchorXPx != null ? `${stripeV2AnchorXPx}px ${containerH}px` : '100% 100%') : undefined,
          }}
        >
          {effectiveItems.map((slug, idx) => {
            const src =
              stripeV2
                ? `/placeholders/t-shirt_buttons/${idx + 1}.png`
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
                ? (stripeWVirtual - stripeV2InsetRightPx) - buttonW - computedLastOffsetPx + lastTileExtraOffsetPx
                : null;

            const left =
              stripeV2 && lastIdx > 0 && stripeV2LeftLast != null
                ? stripeV2Left0 + (idx / lastIdx) * (stripeV2LeftLast - stripeV2Left0)
                : redistributeBetweenFirstAndLast && lastIdx > 0 && idx !== 0 && idx !== lastIdx
                  ? (firstOffsetPx + offsetFirst) + (idx / lastIdx) * ((firstOffsetPx + lastIdx * stepEq + offsetLast) - (firstOffsetPx + offsetFirst))
                  : baseLeft + offsetThis;
            const firstClip = `inset(0 0 0 ${cropRightPx}px)`;
            const isWhiteTile = !stripeV2 && idx === 0 && slug === 'white';
            const whiteOverhangPx = isWhiteTile ? Math.max(0, Math.round(buttonW * 0.28)) : 0;
            const shouldClip = idx === 0 && cropRightPx > 0 && !isWhiteTile;
            const isSelected = stripeV2 ? false : selectedColorSlug === slug;
            const isFirst = idx === 0;
            const isLast = idx === effectiveItems.length - 1;
            const thisHitW = isLast ? buttonW : hitW;

            const shouldMeasureSelectedTile = stripeRefMockupSrc
              ? stripeRefTargetIndex
                ? stripeRefTargetIndex === idx + 1
                : stripeRefTargetSlug
                  ? stripeRefTargetSlug === slug
                  : isSelected
              : isSelected;

            const stripeV2Tile1ExtendLeftPx = stripeV2 && idx === 0 ? 20 : 0;

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
                  viewBox: '0 0 328 271',
                  vw: 328,
                  vh: 271,
                  bx: 164,
                  by: 271,
                  s: 0.8,
                  d: 'M326.933263,80.81l-51.624,61.427l-14.746,-10.069l-0.159,137.854l-191.897,0l0,-139.069l-15.227,12.056l-52.406,-62.199l70.231,-55.452l54.701,-24.474c24.563,9.767 50.928,9.631 79.021,-0l59.027,27.094l63.079,52.832Z',
                }
              : {
                  viewBox: '0 0 225 271',
                  vw: 225,
                  vh: 271,
                  bx: 112.5,
                  by: 271,
                  s: 0.8,
                  d: 'M0.5468586,10.95l22.483,-10.059c24.563,9.767 50.928,9.631 79.021,-0l59.027,27.094l63.079,52.832l-51.624,61.427l-14.746,-10.069l-0.159,137.854l-150.223,0l0.119,-103.795l0.087,0.059l73.703,-87.698l-80.767,-67.645Z',
                };

            return (
              <div
                key={`${slug}-${idx}`}
                className="absolute top-0"
                data-stripe-tile
                data-slug={slug}
                ref={(el) => {
                  if (idx === 0) beltTile1Ref.current = el;
                  if (idx === lastIdx) beltTile14Ref.current = el;
                  if (shouldMeasureSelectedTile) selectedTileRef.current = el;
                }}
                style={{
                  width: `${tileWPx}px`,
                  height: `${containerH}px`,
                  left: `${tileLeftPx}px`,
                  overflowX: isWhiteTile ? (stripeClampLevel >= 2 ? 'hidden' : 'visible') : 'hidden',
                  overflowY: isWhiteTile ? 'visible' : 'hidden',
                  pointerEvents: 'none',
                  zIndex: zLayer,
                }}
              >
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
                          className="pointer-events-none block h-full object-contain object-bottom"
                          style={{
                            width: `${buttonW}px`,
                            position: stripeV2Tile1ExtendLeftPx ? 'absolute' : undefined,
                            right: stripeV2Tile1ExtendLeftPx ? 0 : undefined,
                            top: stripeV2Tile1ExtendLeftPx ? 0 : undefined,
                            transform: stripeV2 ? (idx === 0 ? 'translateY(2px)' : 'translateY(1px)') : (idx >= 1 ? 'translateY(2px)' : undefined),
                            transformOrigin: stripeV2 ? '50% 100%' : (idx >= 1 ? '50% 100%' : undefined),
                            objectPosition: stripeV2Tile1ExtendLeftPx ? 'right bottom' : undefined,
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
                            transform: `translate(${stripeRefX}px, ${stripeRefY}px) scale(${stripeRefScale})`,
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
                    const hitHPx = Math.round(containerH * stripeV2HitSvg.s);
                    const aspect = stripeV2HitSvg.vh ? stripeV2HitSvg.vw / stripeV2HitSvg.vh : 1;
                    const hitWPx = Math.round(hitHPx * aspect);
                    const blockOffsetXPx = idx >= 1 ? 20 : 0;
                    const insetXPx = Math.round(globalOffsetXPx + (buttonW - hitWPx) / 2 + blockOffsetXPx);
                    const blockOffsetYPx = idx >= 1 ? -1 : 0;
                    const topPx = Math.round(globalOffsetYPx + 1 + blockOffsetYPx + (containerH - hitHPx));
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
    </>
  );
}
