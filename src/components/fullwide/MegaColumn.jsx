import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AUSTEN_QUOTES_ASSETS,
  resolveAustenQuoteAssetId,
  resolveAustenQuoteThumbFromPath,
} from '../../utils/austenQuotesAssets.js';
import {
  FIRST_CONTACT_MEDIA,
  FIRST_CONTACT_MEDIA_WHITE,
  FIRST_CONTACT_MEDIA_COLOR,
  THE_HUMAN_INSIDE_MEDIA,
  THE_HUMAN_INSIDE_MEDIA_WHITE,
  CUBE_MEDIA,
} from './megaSlideMedia.js';
import {
  getMegaPublicSelectorFor,
  setMegaPublicSelectorFor,
  touchMegaPublicActivity,
} from './megaPublicSelectorState.js';
import OptimizedImg from './OptimizedImg.jsx';
import {
  FirstContactDibuix00Buttons,
  FirstContactDibuix09Buttons,
} from './firstContactPanels.jsx';

const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

function MegaColumn({
  title,
  items,
  row = false,
  megaTileSize,
  isFirstContact,
  isHumanInside,
  collectionId,
  firstContactVariant,
  humanInsideVariant,
  onFirstContactWhite,
  onFirstContactBlack,
  onFirstContactMulti,
  onHumanWhite,
  onHumanBlack,
  onHumanMulti,
  onHumanPrev,
  onHumanNext,
  onSelectItem,
  onTileSize,
  disableMulti = false,
  stripeVariantVisibility,
  megaTileSelectorParams,
  onStartSelectorDrag,
}) {
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const humanInsideEnabled = Boolean(isHumanInside);
  const effectiveTileSize = megaTileSize || tileSize;
  const selectorTilePitchPx = (Number(effectiveTileSize) || 120) + 12;
  const selectorSizePx = Math.round(Number(megaTileSelectorParams?.sizePx) || 200);
  const selectorStrokePx = Math.min(80, Math.max(0, Number(megaTileSelectorParams?.strokePx) || 0));
  const selectorRadiusPx = Math.round(Math.min(200, Math.max(0, Number(megaTileSelectorParams?.radiusPx) || 0)));
  const selectorExtendTopPx = Number.isFinite(Number(megaTileSelectorParams?.extendTopPx)) ? Number(megaTileSelectorParams?.extendTopPx) : 0;
  const selectorExtendRightPx = Number.isFinite(Number(megaTileSelectorParams?.extendRightPx)) ? Number(megaTileSelectorParams?.extendRightPx) : 0;
  const selectorExtendBottomPx = Number.isFinite(Number(megaTileSelectorParams?.extendBottomPx)) ? Number(megaTileSelectorParams?.extendBottomPx) : 0;
  const selectorExtendLeftPx = Number.isFinite(Number(megaTileSelectorParams?.extendLeftPx)) ? Number(megaTileSelectorParams?.extendLeftPx) : 0;
  const selectorStepX = Number.isFinite(Number(megaTileSelectorParams?.stepX)) ? Number(megaTileSelectorParams?.stepX) : 0;
  const selectorStepY = Number.isFinite(Number(megaTileSelectorParams?.stepY)) ? Number(megaTileSelectorParams?.stepY) : 0;
  const selectorDxPx = selectorStepX * selectorTilePitchPx;
  const selectorDyPx = selectorStepY * selectorTilePitchPx;
  const selectorTranslateX = selectorDxPx + (selectorExtendRightPx - selectorExtendLeftPx) / 2;
  const selectorTranslateY = selectorDyPx + (selectorExtendBottomPx - selectorExtendTopPx) / 2;
  const selectorWidthPx = Math.max(1, selectorSizePx + selectorExtendLeftPx + selectorExtendRightPx);
  const selectorHeightPx = Math.max(1, selectorSizePx + selectorExtendTopPx + selectorExtendBottomPx);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageStart, setPageStart] = useState(0);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const gridCalibEnabled = !!urlParams?.has('gridCalib');
  const GRID_SCALE_STORAGE_KEY = useMemo(
    () => `HG_GRID_SCALES_${(collectionId || '').toString()}`,
    [collectionId]
  );
  const GRID_OFFSET_STORAGE_KEY = useMemo(
    () => `HG_GRID_OFFSETS_${(collectionId || '').toString()}`,
    [collectionId]
  );

  const cubeAdjustable = useMemo(
    () => new Set(['MaschinenCube', 'Mazinger C', 'Afrodita C', 'Cube 3 P0', 'Cyber Cube', 'Darth Cube', '3cube p0', '3cube-p0']),
    []
  );
  const cubeLocked = useMemo(
    () => new Set(['Iron Kong', 'Iron Cube 68', 'RoboCube', 'Cylon Cube', 'Cylon Cube 03']),
    []
  );

  const gridCalibKeyFor = (it) => {
    if (!it || typeof it !== 'string') return it;
    if (collectionId !== 'cube') return it;

    const raw = it.trim();
    const file = raw.split('/').filter(Boolean).pop() || raw;
    const lower = file.toLowerCase();
    const map = {
      'iron-kong.webp': 'Iron Kong',
      'iron-cube.webp': 'Iron Cube 68',
      'robocube.webp': 'RoboCube',
      'cylon-cube.webp': 'Cylon Cube 03',
      'maschinencube.webp': 'MaschinenCube',
      'mazinger-c.webp': 'Mazinger C',
      'afrodita-c.webp': 'Afrodita C',
      '3cube-p0.webp': 'Cube 3 P0',
      'cybercube.webp': 'Cyber Cube',
      'darth-cube.webp': 'Darth Cube',
    };
    return map[lower] || it;
  };

  const [gridScales, setGridScales] = useState(() => {
    try {
      if (typeof window === 'undefined') return {};
      const raw = window.localStorage.getItem(`HG_GRID_SCALES_${(collectionId || '').toString()}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  const [gridOffsets, setGridOffsets] = useState(() => {
    try {
      if (typeof window === 'undefined') return {};
      const raw = window.localStorage.getItem(`HG_GRID_OFFSETS_${(collectionId || '').toString()}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(GRID_SCALE_STORAGE_KEY, JSON.stringify(gridScales || {}));
    } catch {
      // ignore
    }
  }, [GRID_SCALE_STORAGE_KEY, gridScales]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(GRID_OFFSET_STORAGE_KEY, JSON.stringify(gridOffsets || {}));
    } catch {
      // ignore
    }
  }, [GRID_OFFSET_STORAGE_KEY, gridOffsets]);

  useEffect(() => {
    if (!gridCalibEnabled) return undefined;
    if (collectionId !== 'cube') return undefined;

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

      const it = selectedItem;
      if (!it || typeof it !== 'string') return;
      const calibKey = gridCalibKeyFor(it);
      if (cubeLocked.has(calibKey)) return;
      if (!cubeAdjustable.has(calibKey)) return;

      const isScaleKey = e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_';
      const isArrowKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (!isScaleKey && !isArrowKey) return;
      e.preventDefault();

      if (isScaleKey) {
        const dir = (e.key === '-' || e.key === '_') ? -1 : 1;
        const delta = (e.shiftKey ? 0.05 : 0.02) * dir;

        setGridScales((prev) => {
          const base = prev && typeof prev === 'object' ? prev : {};
          const current = Number.parseFloat(base[calibKey] ?? '');
          const start = Number.isFinite(current) ? current : 0.6;
          const next = Math.max(0.2, Math.min(1.5, Number((start + delta).toFixed(3))));
          return { ...base, [calibKey]: next };
        });
        return;
      }

      const step = e.shiftKey ? 6 : 2;
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      if (!dx && !dy) return;

      setGridOffsets((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const cur = base[calibKey] && typeof base[calibKey] === 'object' ? base[calibKey] : {};
        const cx = Number.isFinite(Number(cur.x)) ? Number(cur.x) : 0;
        const cy = Number.isFinite(Number(cur.y)) ? Number(cur.y) : 0;
        const next = { x: cx + dx, y: cy + dy };
        return { ...base, [calibKey]: next };
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [collectionId, cubeAdjustable, cubeLocked, selectedItem, gridCalibEnabled]);

  const effectiveItems = useMemo(() => {
    const list = Array.isArray(items) ? items.slice() : [];
    if (collectionId !== 'miscellania') return list.filter(Boolean);
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    const filtered = list.filter((it) => {
      if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
      if (typeof it !== 'string') return false;
      if (!isPathItem(it)) return true;
      if (variant === 'white' && it.includes('/black/')) return false;
      if (variant === 'black' && it.includes('/white/')) return false;
      return true;
    });
    return filtered.filter(Boolean);
  }, [items, collectionId, isHumanInside, humanInsideVariant, firstContactVariant]);

  const drawableItems = useMemo(() => {
    const list = Array.isArray(effectiveItems) ? effectiveItems.filter(Boolean) : [];
    return list.filter((it) => it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [CONTROL_TILE_ARROWS, CONTROL_TILE_BN, effectiveItems]);

  useEffect(() => {
    setPageStart(0);
  }, [collectionId]);

  const rowItems = useMemo(() => {
    if (!row) return effectiveItems;
    const list = Array.isArray(effectiveItems) ? effectiveItems.filter(Boolean) : [];
    const hasBn = list.includes(CONTROL_TILE_BN);
    const hasArrows = list.includes(CONTROL_TILE_ARROWS);
    if (!hasBn || !hasArrows) return list.slice(0, 9);

    if (drawableItems.length <= 7) {
      const padCount = Math.max(0, 7 - drawableItems.length);
      const pads = Array.from({ length: padCount }, () => null);
      return [CONTROL_TILE_BN, ...drawableItems, ...pads, CONTROL_TILE_ARROWS].slice(0, 9);
    }

    const len = drawableItems.length;
    const start = ((pageStart % len) + len) % len;
    const windowed = [];
    for (let i = 0; i < 7; i += 1) {
      windowed.push(drawableItems[(start + i) % len]);
    }
    return [CONTROL_TILE_BN, ...windowed, CONTROL_TILE_ARROWS];
  }, [CONTROL_TILE_ARROWS, CONTROL_TILE_BN, drawableItems, effectiveItems, pageStart, row]);

  useLayoutEffect(() => {
    try {
      if (!row) return;
      if (!collectionId) return;
      if (!megaTileSelectorParams?.enabled) return;
      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
      const existing = getMegaPublicSelectorFor(collectionId, keyset);
      const existingTarget = typeof existing?.target === 'string' ? existing.target.trim() : '';
      if (existingTarget) return;

      // Sempre usar t1 (índex 1) com a posició per defecte
      const candidate = rowItems?.[1] || rowItems?.[0] || null;
      if (typeof candidate !== 'string') return;
      setMegaPublicSelectorFor(collectionId, keyset, { target: candidate, stepX: 0, stepY: 0 });
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [collectionId, megaTileSelectorParams?.enabled, megaTileSelectorParams?.keyset, row, rowItems]);

  const selectorDragBounds = useMemo(() => {
    try {
      if (!row) return null;
      const targetRaw = String(megaTileSelectorParams?.target || '').trim().toLowerCase();
      if (!targetRaw) return null;
      const idx = rowItems.findIndex((it) => typeof it === 'string' && String(it || '').trim().toLowerCase() === targetRaw);
      if (idx < 0) return null;
      return { minStepX: 1 - idx, maxStepX: 7 - idx, lockStepY: true };
    } catch {
      return null;
    }
  }, [megaTileSelectorParams?.target, row, rowItems]);

  const selectorStepXForRender = selectorDragBounds
    ? Math.min(selectorDragBounds.maxStepX, Math.max(selectorDragBounds.minStepX, selectorStepX))
    : selectorStepX;
  const selectorStepYForRender = selectorDragBounds ? 0 : selectorStepY;
  // Only keep drag-driven translation. Legacy extend* params are ignored now that
  // the selector auto-fits the parent column via inset insets.
  const selectorTranslateXForRender = selectorStepXForRender * selectorTilePitchPx;
  const selectorTranslateYForRender = selectorStepYForRender * selectorTilePitchPx;

  useLayoutEffect(() => {
    if (!row) return;
    const el = tileSizeRef.current;
    if (!el) return;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) return;
      setTileSize(w);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [row]);

  useEffect(() => {
    if (!row) return;
    if (!tileSize) return;
    if (!onTileSize) return;
    onTileSize(tileSize);
  }, [row, tileSize, onTileSize]);

  const baseItems = useMemo(() => {
    return rowItems.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [rowItems]);

  const preloadedThumbsRef = useRef(new Set());
  const preloadThumbSrc = (src) => {
    try {
      if (!src || typeof src !== 'string') return;
      const normalized = src.trim();
      if (!normalized) return;
      if (preloadedThumbsRef.current.has(normalized)) return;
      preloadedThumbsRef.current.add(normalized);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = encodeURI(normalized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const limit = collectionId === 'the_human_inside' ? 48 : 24;
    baseItems.slice(0, limit).forEach((it) => {
      const src = resolveGridThumbSrc(it, collectionId) || resolveSrc(it);
      preloadThumbSrc(src);
    });
  }, [baseItems, collectionId]);

  const miscellaniaStripeTiles = collectionId === 'miscellania' ? Math.max(0, Math.min(7, baseItems.length)) : 7;

  const thinSlideEnabled = isHumanInside && row && drawableItems.length > 7;
  const pagingEnabled = row && !thinSlideEnabled && drawableItems.length > 7;

  function isPathItem(it) {
    return typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);
  }

  function deriveVariantPath(p, variant) {
    if (typeof p !== 'string') return null;
    if (!isPathItem(p)) return null;
    let next = p;

    // Normalize legacy folder names to canonical ones.
    if (next.includes('/blanc/')) next = next.replace('/blanc/', '/white/');
    if (next.includes('/negre/')) next = next.replace('/negre/', '/black/');
    if (next.startsWith('blanc/')) next = `white/${next.slice('blanc/'.length)}`;
    if (next.startsWith('negre/')) next = `black/${next.slice('negre/'.length)}`;

    if (variant === 'color') return next;

    if (!variant || variant === 'black') {
      if (next.includes('/white/')) next = next.replace('/white/', '/black/');
      if (/-w\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-w\.(png|jpg|jpeg|webp)$/i, '-b.$1');
      return next;
    }
    if (next.includes('/black/')) next = next.replace('/black/', '/white/');
    if (/-b\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-b\.(png|jpg|jpeg|webp)$/i, '-w.$1');
    return next;
  }

  const labelForItem = (it) => {
    if (typeof it !== 'string') return '';
    if (!isPathItem(it)) return it;
    const seg = it.split('/').filter(Boolean);
    const base = seg.length ? seg[seg.length - 1] : it;
    const noExt = base.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    const noSuffixes = noExt
      .replace(/-(grid|stripe)$/i, '')
      .replace(/-(b|w)$/i, '')
      .replace(/-(b|w)-(grid|stripe)$/i, '')
      .replace(/-(grid|stripe)-(b|w)$/i, '')
      .replace(/-(b|w)-stripe$/i, '')
      .replace(/-stripe-(b|w)$/i, '')
      .replace(/-(b|w)-grid$/i, '')
      .replace(/-grid-(b|w)$/i, '')
      .replace(/-+$/g, '');
    const baseLabel = noSuffixes.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const titleCased = baseLabel
      .split(' ')
      .filter(Boolean)
      .map((w) => {
        const head = w.slice(0, 1);
        const tail = w.slice(1);
        return `${head.toUpperCase()}${tail}`;
      })
      .join(' ');
    if (collectionId === 'austen') {
      const lower = it.toLowerCase();
      if (lower.includes('/austen/keep_calm/') && titleCased === 'Keep Calm Multi Red') return 'Keep Calm Red';
      if (lower.includes('/austen/looking_for_my_darcy/')) {
        return titleCased.replace(/\bGradient\b/gi, '').replace(/\s+/g, ' ').trim();
      }
      if (lower.includes('/austen/quotes/')) {
        if (titleCased === 'Unsociable And Taciturn') return 'Unsociable';
        if (titleCased === 'Half Agony Half Hope') return 'Half Agony';
      }
    }
    return titleCased;
  };

  const labelForItemWhenSelected = (it) => {
    const full = labelForItem(it);
    if (!full) return full;
    const pp = full.match(/^Pride And Prejudice(?:\s+(\d+))?$/);
    if (pp) return `P&P ${pp[1] || '1'}`;
    const ss = full.match(/^Sense And Sensibility(?:\s+(\d+))?$/);
    if (ss) return `S&S ${ss[1] || '1'}`;
    return full;
  };

  const normalizeKey = (value) => {
    if (typeof value !== 'string') return '';
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resolveSrc = (it) => {
    if (!it) return null;

    if (typeof it === 'string') {
      const raw = it.trim();
      const fixedStripeFolder = raw.replace(
        '/custom_logos/drawings/images_stripe/stripe/',
        '/custom_logos/drawings/images_stripe/',
      );
      if (fixedStripeFolder !== raw && (fixedStripeFolder.startsWith('/custom_logos/') || fixedStripeFolder.includes('/custom_logos/'))) {
        const customIdx = fixedStripeFolder.indexOf('/custom_logos/');
        if (customIdx !== -1) return fixedStripeFolder.slice(customIdx);
      }
      const publicIdx = raw.indexOf('/public/');
      if (publicIdx !== -1) {
        const sub = raw.slice(publicIdx + '/public'.length);
        if (sub.startsWith('/custom_logos/') || sub.startsWith('/placeholders/') || sub.startsWith('/tmp/')) {
          return sub;
        }
      }
      const customIdx = raw.indexOf('/custom_logos/');
      if (customIdx !== -1) return raw.slice(customIdx);
      const placeholdersIdx = raw.indexOf('/placeholders/');
      if (placeholdersIdx !== -1) return raw.slice(placeholdersIdx);
      if (raw.startsWith('/custom_logos/') || raw.startsWith('/placeholders/') || raw.startsWith('/tmp/')) {
        return raw;
      }
    }

    const itKey = normalizeKey(it);
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    if (collectionId === 'cube') {
      return CUBE_MEDIA[itKey] || CUBE_MEDIA[it] || null;
    }
    if (isPathItem(it) && collectionId) {
      const vPath = deriveVariantPath(it, variant) || it;
      if (typeof vPath === 'string' && vPath.startsWith('/')) return ensureThumbSuffix(vPath, 'stripe');

      if (collectionId === 'miscellania') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        if (variant === 'color') {
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscellania/color/${normalized}`, 'stripe');
        }
        if (variant === 'white') {
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscellania/white/${normalized}`, 'stripe');
        }
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscellania/black/${normalized}`, 'stripe');
      }

      if (collectionId === 'the_human_inside') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        const folder = variant === 'white' ? 'white' : 'black';
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/${folder}/${normalized}`, 'stripe');
      }

      const out = `/custom_logos/drawings/images_stripe/${collectionId}/${vPath}`;
      return ensureThumbSuffix(out, 'stripe');
    }
    if (isHumanInside && (THE_HUMAN_INSIDE_MEDIA[itKey] || THE_HUMAN_INSIDE_MEDIA[it])) {
      return (humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[itKey]
        || (humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]
        || null;
    }
    if (FIRST_CONTACT_MEDIA[itKey] || FIRST_CONTACT_MEDIA[it] || FIRST_CONTACT_MEDIA_COLOR[itKey] || FIRST_CONTACT_MEDIA_COLOR[it]) {
      const base = FIRST_CONTACT_MEDIA[itKey] || FIRST_CONTACT_MEDIA[it] || null;
      const white = FIRST_CONTACT_MEDIA_WHITE[itKey] || FIRST_CONTACT_MEDIA_WHITE[it] || base;
      const color = FIRST_CONTACT_MEDIA_COLOR[itKey] || FIRST_CONTACT_MEDIA_COLOR[it] || base;
      return (firstContactVariant === 'white' ? white : firstContactVariant === 'color' ? color : base) || null;
    }
    return null;
  };

  const ensureThumbSuffix = (src, kind) => {
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
  };

  const resolveGridThumbSrc = (it, collectionIdOverride) => {
    if (!it || typeof it !== 'string') return resolveSrc(it);
    const raw = it.trim();
    const inferred = (() => {
      const m = raw.match(/\/custom_logos\/drawings\/(?:images_grid|images_stripe|images_originals\/(?:grid|stripe))\/([^/]+)\//i);
      return m?.[1] || null;
    })();
    const cid = collectionIdOverride || collectionId || inferred;

    if (cid === 'first_contact' && !isPathItem(raw)) {
      const key = normalizeKey(raw);
      const fileByLabel = {
        'NX-01': 'nx-01',
        'NCC-1701': 'ncc-1701',
        'NCC-1701-D': 'ncc1701-d',
        Wormhole: 'wormhole',
        'Plasma Escape': 'plasma-escape',
        "Vulcan's End": 'vulcans-end',
        'The Phoenix': 'the-phoenix',
      };
      const base = fileByLabel[key] || fileByLabel[raw] || null;
      if (!base) return resolveSrc(it);

      const folder = 'black';
      const suffix = 'b';
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${folder}/${base}-${suffix}-grid.webp`, 'grid');
    }

    if (raw.startsWith('/custom_logos/drawings/images_grid/')) {
      if (cid === 'miscellania' && raw.startsWith('/custom_logos/drawings/images_grid/miscellania/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const miscellaniaMap = {
          'dj-vader-grid.webp': 'dj-vader-b-grid.webp',
          'dj-vader.webp': 'dj-vader-b-grid.webp',
          'death-star2d2-grid.webp': 'death-star2d2-b-grid.webp',
          'death-star2d2.webp': 'death-star2d2-b-grid.webp',
          'pont-del-diable-grid.webp': 'pont-del-diable-b-grid.webp',
          'pont-del-diable.webp': 'pont-del-diable-b-grid.webp',
        };
        const mapped = miscellaniaMap[lower];
        if (mapped) return `/custom_logos/drawings/images_grid/miscellania/${mapped}`;
      }
      if (cid === 'austen' && raw.includes('/austen/quotes/')) {
        return resolveAustenQuoteThumbFromPath(raw, 'grid') || ensureThumbSuffix(raw, 'grid');
      }
      if (cid === 'austen' && raw.includes('/austen/keep_calm/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (
          lower === 'keep-calm-black.webp'
          || lower === 'keep-calm-black-grid.webp'
          || lower === 'keep-calm-b.webp'
          || lower === 'keep-calm-b-grid.webp'
        ) {
          return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp';
        }
        return ensureThumbSuffix(raw, 'grid');
      }
      if (cid === 'austen' && raw.includes('/austen/looking_for_my_darcy/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const base = lower.replace(/\.(webp|png|jpe?g)$/i, '').replace(/-grid$/i, '');

        const mapped = (() => {
          if (base.endsWith('-frame')) {
            const c = base.replace(/-frame$/i, '');
            return `${c}-frame-grid.webp`;
          }
          if (base.endsWith('-solid')) {
            const c = base.replace(/-solid$/i, '');
            return `${c}-solid-grid.webp`;
          }
          return file;
        })();

        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/${mapped}`, 'grid');
      }
      return ensureThumbSuffix(raw, 'grid');
    }

    if (
      raw.startsWith('/custom_logos/drawings/images_stripe/')
      || raw.startsWith('/custom_logos/drawings/images_originals/stripe/')
    ) {
      const file = raw.split('/').pop() || '';
      const baseFile = file.replace(/-stripe\.(webp|png|jpe?g)$/i, '.$1');

      if (cid === 'first_contact') {
        const map = {
          '1-nx-01-b.webp': 'nx-01.webp',
          '1-nx-01-w.webp': 'nx-01.webp',
          '2-ncc-1701-b.webp': 'ncc-1701.webp',
          '2-ncc-1701-w.webp': 'ncc-1701.webp',
          '3-ncc-1701-d-b.webp': 'ncc1701-d.webp',
          '3-ncc-1701-d-w.webp': 'ncc1701-d.webp',
          '4-wormhole-b.webp': 'wormhole.webp',
          '4-wormhole-w.webp': 'wormhole.webp',
          '5-plasma-escape-b.webp': 'plasma-escape.webp',
          '5-plasma-escape-w.webp': 'plasma-escape.webp',
          '6-vulcans-end-b.webp': 'vulcans-end.webp',
          '6-vulcans-end-w.webp': 'vulcans-end.webp',
          '7-the-phoenix-b.webp': 'the-phoenix.webp',
          '7-the-phoenix-w.webp': 'the-phoenix.webp',
        };
        const out = map[baseFile.toLowerCase()];
        if (out) return ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${out}`, 'grid');
      }

      if (cid === 'the_human_inside') {
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/the_human_inside/${baseFile}`, 'grid');
      }

      if (cid === 'cube') {
        const map = {
          'iron-cube-68.webp': 'iron-cube.webp',
          'iron-cube-08-iron-kong.webp': 'iron-kong.webp',
          'cube-3-p0.webp': '3cube-p0.webp',
          'cyber-cube.webp': 'cybercube.webp',
          'cylon-cube-03.webp': 'cylon-cube.webp',
        };
        const out = map[baseFile.toLowerCase()] || baseFile;
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${out}`, 'grid');
      }

      if (cid === 'miscellania') {
        const lower = baseFile.toLowerCase();
        if (lower === 'dj-vader.webp') return '/custom_logos/drawings/images_grid/miscellania/dj-vader-b-grid.webp';
        if (lower === 'dj-vader-b.webp') return '/custom_logos/drawings/images_grid/miscellania/dj-vader-b-grid.webp';
        if (lower === 'death-star2d2.webp') return '/custom_logos/drawings/images_grid/miscellania/death-star2d2-b-grid.webp';
        if (lower === 'death-star2d2-b.webp') return '/custom_logos/drawings/images_grid/miscellania/death-star2d2-b-grid.webp';
        if (lower === 'pont-del-diable.webp') return '/custom_logos/drawings/images_grid/miscellania/pont-del-diable-b-grid.webp';
        if (lower === 'pont-del-diable-b.webp') return '/custom_logos/drawings/images_grid/miscellania/pont-del-diable-b-grid.webp';
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/miscellania/${baseFile.replace(/-b\.webp$/i, '-b-grid.webp')}`, 'grid');
      }

      if (cid === 'austen') {
        if (raw.includes('/austen/quotes/')) {
          return resolveAustenQuoteThumbFromPath(raw, 'grid') || null;
        }
        if (raw.includes('/austen/keep_calm/')) {
          const lower = baseFile.toLowerCase();
          if (lower === 'keep-calm-black.webp' || lower === 'keep-calm-b.webp') {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp';
          }
          if (lower === 'keep-calm-w.webp') {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-w-red-grid.webp';
          }
          if (lower.includes('keep-calm-multi-w-red')) {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-w-red-grid.webp';
          }
          if (lower.includes('keep-calm-multi')) {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red-grid.webp';
          }
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/keep_calm/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/looking_for_my_darcy/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/pemberley_house/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/pemberley_house/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/crosswords/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/crosswords/${baseFile}`, 'grid');
        }
      }
    }

    if (
      raw.includes('/austen/quotes/')
      && (
        raw.startsWith('/placeholders/images_grid/')
        || raw.startsWith('/custom_logos/drawings/images_grid/')
        || raw.startsWith('/custom_logos/drawings/images_stripe/')
        || raw.startsWith('/custom_logos/drawings/images_originals/stripe/')
      )
    ) {
      return resolveAustenQuoteThumbFromPath(raw, 'grid') || resolveSrc(it);
    }
    if (raw.startsWith('placeholders/images_grid/')) {
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/${raw.replace(/^placeholders\/images_grid\//, '')}`, 'grid');
    }
    if (raw.startsWith('/placeholders/images_grid/')) {
      return ensureThumbSuffix(raw.replace(/^\/placeholders\/images_grid\//, '/custom_logos/drawings/images_grid/'), 'grid');
    }
    if (cid === 'cube' && isPathItem(raw) && !raw.startsWith('/')) {
      const map = {
        'iron-cube-68.webp': 'iron-cube.webp',
        'iron-cube-08-iron-kong.webp': 'iron-kong.webp',
        'cube-3-p0.webp': '3cube-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };
      const file = map[raw.toLowerCase()] || raw;
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${file}`, 'grid');
    }
    const key = normalizeKey(it).toLowerCase();

    if (cid === 'first_contact') {
      const map = {
        'nx-01': 'nx-01.webp',
        'ncc-1701': 'ncc-1701.webp',
        'ncc-1701-d': 'ncc1701-d.webp',
        wormhole: 'wormhole.webp',
        'plasma escape': 'plasma-escape.webp',
        "vulcan's end": 'vulcans-end.webp',
        'the phoenix': 'the-phoenix.webp',
      };
      const file = map[key];
      return file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${file}`, 'grid') : resolveSrc(it);
    }

    if (cid === 'the_human_inside') {
      const baseByLabel = {
        'r2-d2': 'r2-d2',
        c3p0: 'c3-p0',
        vader: 'vader',
        afrodita: 'afrodita-a',
        mazinger: 'mazinger-z',
        'cylon 78': 'cylon-78',
        'cylon 03': 'cylon-03',
        'iron man 68': 'iron-man-68',
        'iron man 08': 'iron-man-08',
        cyberman: 'cyberman',
        'the dalek': 'the-dalek',
        robocop: 'robocop',
        terminator: 'terminator',
        maschinenmensch: 'maschinenmensch',
        'robby the robot': 'robby-the-robot',
        'robbie the robot': 'robby-the-robot',
      };
      const keySpaced = key.replace(/-/g, ' ');
      const base = baseByLabel[key] || baseByLabel[keySpaced];
      if (!base) return null;
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/the_human_inside/black/${base}-b-grid.webp`, 'grid');
    }

    if (cid === 'austen') {
      const id = resolveAustenQuoteAssetId(key);
      if (id && AUSTEN_QUOTES_ASSETS[id]?.grid) return AUSTEN_QUOTES_ASSETS[id].grid;
      if (typeof raw === 'string' && raw.includes('/austen/quotes/')) return AUSTEN_QUOTES_ASSETS.it_is_a_truth.grid;
      return null;
    }

    if (cid === 'cube') {
      const map = {
        'afrodita c': 'afrodita-c.webp',
        'mazinger c': 'mazinger-c.webp',
        'iron cube': 'iron-cube.webp',
        'iron cube 68': 'iron-cube.webp',
        'iron kong': 'iron-kong.webp',
        'iron cube 08 iron kong': 'iron-kong.webp',
        'cube 3 p0': '3cube-p0.webp',
        'darth cube': 'darth-cube.webp',
        maschinencube: 'maschinencube.webp',
        robocube: 'robocube.webp',
        cybercube: 'cybercube.webp',
        'cyber cube': 'cybercube.webp',
        'cylon cube': 'cylon-cube.webp',
        'cylon cube 03': 'cylon-cube.webp',
      };
      const keySpaced = key.replace(/-/g, ' ');
      const file = map[key] || map[keySpaced];
      const out = file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${file}`, 'grid') : null;
      if (import.meta.env.DEV && !out) {
        // eslint-disable-next-line no-console
        console.error('[CUBE grid thumb] unresolved', { it, key, raw });
      }
      return out;
    }

    if (cid === 'miscellania') {
      const s = it.toLowerCase();
      if (s.includes('dj-vader')) return '/custom_logos/drawings/images_grid/miscellania/dj-vader-b-grid.webp';
      if (s.includes('death-star2d2')) return '/custom_logos/drawings/images_grid/miscellania/death-star2d2-b-grid.webp';
      if (s.includes('pont-del-diable')) return '/custom_logos/drawings/images_grid/miscellania/pont-del-diable-b-grid.webp';
      return resolveSrc(it);
    }

    return resolveSrc(it);
  };

  const resolveStripeThumbSrc = (it) => {
    if (!it || typeof it !== 'string') return null;
    const raw = it.trim();

    // Never let STRIPE thumbnails come from GRID or ORIGINALS.
    if (raw.startsWith('/custom_logos/drawings/images_stripe/')) return ensureThumbSuffix(raw, 'stripe');

    if (raw.startsWith('/custom_logos/drawings/images_originals/stripe/')) {
      const lower = raw.toLowerCase();
      if (lower.includes('/austen/crosswords/')) {
        const file = (lower.split('/').pop() || '').replace(/\?.*$/, '');
        const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-stripe\.(webp|png)$/i);
        if (m) {
          const folder = m[1].replace(/-/g, '_');
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/crosswords/${folder}/${m[1]}-${m[2]}.${m[3]}`, 'stripe');
        }
      }

      const mapped = raw.replace(
        '/custom_logos/drawings/images_originals/stripe/',
        '/custom_logos/drawings/images_stripe/',
      );
      return ensureThumbSuffix(mapped, 'stripe');
    }

    if (collectionId === 'austen') {
      const variant = firstContactVariant;
      const key = normalizeKey(it).toLowerCase();
      const id = resolveAustenQuoteAssetId(key);
      if (id) {
        const slug = String(id || '').replace(/_/g, '-');
        const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
        const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
        const out = variant === 'color'
          ? `/custom_logos/drawings/images_stripe/austen/quotes/color/${multiStem}-multi-light-stripe.webp`
          : variant === 'white'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
            : `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
        return ensureThumbSuffix(out, 'stripe');
      }
      if (raw.includes('/austen/quotes/')) {
        try {
          const file = (raw.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const out = variant === 'color'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/color/${multiStem}-multi-light-stripe.webp`
            : variant === 'white'
              ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
              : `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
          return ensureThumbSuffix(out, 'stripe');
        } catch {
          return resolveAustenQuoteThumbFromPath(raw, 'stripe') || null;
        }
      }

      if (raw.includes('/austen/keep_calm/')) {
        const out = variant === 'color'
          ? '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp'
          : variant === 'white'
            ? '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp'
            : '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
        return ensureThumbSuffix(out, 'stripe');
      }

      if (raw.includes('/austen/pemberley_house/')) {
        const out = variant === 'color'
          ? '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp'
          : variant === 'white'
            ? '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp'
            : '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp';
        return ensureThumbSuffix(out, 'stripe');
      }

      if (raw.includes('/austen/crosswords/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)(?:-stripe)?\.webp$/);
        if (m) {
          const book = m[1];
          const n = m[2];
          // Crosswords has NO color variant. Treat `color` as `white`.
          const out = variant === 'black'
            ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`
            : `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          return ensureThumbSuffix(out, 'stripe');
        }
      }

      if (raw.includes('/austen/looking_for_my_darcy/')) {
        const file = raw.split('/').pop() || '';
        const base = file.toLowerCase().replace(/\.(webp|png|jpe?g)$/i, '').replace(/-(grid|stripe)$/i, '');
        if (base.endsWith('-frame')) {
          const c = base.replace(/-frame$/i, '');
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/${c}-frame-stripe.webp`, 'stripe');
        }
        if (base.endsWith('-solid')) {
          const c = base.replace(/-solid$/i, '');
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/${c}-solid-stripe.webp`, 'stripe');
        }
      }

      if (raw.includes('/austen/pemberley_house/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (lower === 'pemberley-house-b-grid.webp' || lower === 'pemberley-house-b.webp' || lower === 'pemberley-house-b-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
        if (lower === 'pemberley-house-w-grid.webp' || lower === 'pemberley-house-w.webp' || lower === 'pemberley-house-w-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
      }

      if (raw.includes('/austen/crosswords/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const persuasion = lower.match(/^persuasion-(\d)(?:-grid)?\.webp$/);
        if (persuasion) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-${persuasion[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-${persuasion[1]}-w-stripe.webp`;
        const pride = lower.match(/^pride-and-prejudice-(\d)(?:-grid)?\.webp$/);
        if (pride) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-${pride[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-${pride[1]}-w-stripe.webp`;
        const sense = lower.match(/^sense-and-sensibility-(\d)(?:-grid)?\.webp$/);
        if (sense) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-${sense[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-${sense[1]}-w-stripe.webp`;
      }

      return null;
    }

    if (collectionId === 'cube') {
      const file = raw.split('/').pop() || '';
      const map = {
        'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
        'iron-cube.webp': 'iron-cube-68.webp',
        '3cube-p0.webp': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };
      const master = map[file.toLowerCase()] || file;
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/cube/${master}`, 'stripe');
    }

    if (collectionId === 'miscellania') {
      const file = raw.split('/').pop() || '';
      const map = {
        'dj-vader.webp': 'dj-vader-b.webp',
        'death-star2d2.webp': 'death-star2d2-b.webp',
      };
      const master = map[file.toLowerCase()] || file;
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscellania/black/${master}`, 'stripe');
    }

    if (collectionId === 'the_human_inside') {
      const key = normalizeKey(it).toLowerCase();
      const keySpaced = key.replace(/-/g, ' ');
      const labelMap = {
        'r2-d2': 'r2-d2.webp',
        c3p0: 'c3-p0.webp',
        vader: 'vader.webp',
        afrodita: 'afrodita-a.webp',
        mazinger: 'mazinger-z.webp',
        'cylon 78': 'cylon-78.webp',
        'cylon 03': 'cylon-03.webp',
        'iron man 68': 'iron-man-68.webp',
        'iron man 08': 'iron-man-08.webp',
        cyberman: 'cyberman.webp',
        'the dalek': 'the-dalek.webp',
        robocop: 'robocop.webp',
        terminator: 'terminator.webp',
        maschinenmensch: 'maschinenmensch.webp',
        'robby the robot': 'robbie-the-robot.webp',
        'robbie the robot': 'robby-the-robot.webp',
      };

      const file = labelMap[key] || labelMap[keySpaced] || (raw.split('/').pop() || '');
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/black/${file}`, 'stripe');
    }

    if (collectionId === 'cube') {
      const key = normalizeKey(it).toLowerCase();
      const labelMap = {
        'iron kong': 'iron-cube-08-iron-kong.webp',
        'iron cube': 'iron-cube-68.webp',
        'iron cube 68': 'iron-cube-68.webp',
        robocube: 'robocube.webp',
        'cylon cube': 'cylon-cube-03.webp',
        'cylon cube 03': 'cylon-cube-03.webp',
        maschinencube: 'maschinencube.webp',
        'mazinger c': 'mazinger-c.webp',
        'afrodita c': 'afrodita-c.webp',
        'cube 3 p0': 'cube-3-p0.webp',
        '3cube p0': 'cube-3-p0.webp',
        '3cube-p0': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cyber cube': 'cyber-cube.webp',
        'darth cube': 'darth-cube.webp',
      };

      const file = raw.split('/').pop() || '';
      const fileMap = {
        'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
        'iron-cube.webp': 'iron-cube-68.webp',
        '3cube-p0.webp': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };

      const master = labelMap[key] || fileMap[file.toLowerCase()] || file;
      return master ? ensureThumbSuffix(`/custom_logos/drawings/images_stripe/cube/${master}`, 'stripe') : null;
    }

    if (collectionId === 'first_contact') {
      const file = raw.split('/').pop() || '';
      const map = {
        'nx-01.webp': '1-nx-01-b.webp',
        'ncc-1701.webp': '2-ncc-1701-b.webp',
        'ncc1701-d.webp': '3-ncc-1701-d-b.webp',
        'wormhole.webp': '4-wormhole-b.webp',
        'plasma-escape.webp': '5-plasma-escape-b.webp',
        'vulcans-end.webp': '6-vulcans-end-b.webp',
        'the-phoenix.webp': '7-the-phoenix-b.webp',
      };
      const out = map[file.toLowerCase()];
      return out ? ensureThumbSuffix(`/custom_logos/drawings/images_stripe/first_contact/black/${out}`, 'stripe') : null;
    }

    return null;
  };

  const gridScaleFor = (it) => {
    if (!it || typeof it !== 'string') return 0.6;
    const k = gridCalibKeyFor(it);
    const v = Number.parseFloat(gridScales?.[k] ?? '');
    if (Number.isFinite(v)) return v;
    if (it === 'Mazinger') return 0.64;
    if (it === 'Maschinenmensch') return 0.65;
    return 0.6;
  };

  const gridOffsetFor = (it) => {
    if (!it || typeof it !== 'string') return { x: 0, y: 0 };
    const k = gridCalibKeyFor(it);
    const raw = gridOffsets?.[k];
    if (!raw || typeof raw !== 'object') return { x: 0, y: 0 };
    const x = Number.isFinite(Number(raw.x)) ? Number(raw.x) : 0;
    const y = Number.isFinite(Number(raw.y)) ? Number(raw.y) : 0;
    return { x, y };
  };

  return (
    <div className="min-w-0">
      {row ? (
        <div className="grid w-full grid-cols-9 gap-x-3">
          {rowItems.map((it, idx) => (
            <div
              key={`${it}-${idx}`}
              className="min-w-0 relative z-10 self-start"
            >
              {(() => {
                const isSelected = Boolean(
                  megaTileSelectorParams?.enabled
                  && typeof it === 'string'
                  && String(it || '').trim().toLowerCase() === String(megaTileSelectorParams?.target || '').trim().toLowerCase(),
                );
                const displayLabel = isSelected ? labelForItemWhenSelected(it) : labelForItem(it);

                return !it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                  <div className="h-4" />
                ) : (
                  <Link
                    to="#"
                    className={`relative z-[60] flex h-[20px] w-full items-center justify-center whitespace-nowrap rounded-none px-2 font-roboto-condensed leading-[20px] uppercase text-foreground hover:text-foreground ${
                      isSelected
                        ? 'text-[12.8px] font-normal tracking-[0.1em] bg-transparent'
                        : 'text-[11.2px] font-normal bg-muted'
                    }`}
                    style={{
                      color: isSelected
                        ? String(megaTileSelectorParams?.color || '').trim() || undefined
                        : undefined,
                    }}
                    data-mega-label="1"
                    data-mega-collection={collectionId}
                    data-mega-item={typeof it === 'string' ? it : ''}
                    onClick={(e) => {
                      if (typeof onSelectItem !== 'function') return;
                      e.preventDefault();
                      onSelectItem(it);
                    }}
                  >
                    {displayLabel}
                  </Link>
                );
              })()}

              {!it ? null : it === CONTROL_TILE_BN ? (
                <div className="relative z-40 mt-2">
                  {isFirstContact ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onFirstContactWhite}
                      onBlack={onFirstContactBlack}
                      onMulti={onFirstContactMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : isHumanInside ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onHumanWhite}
                      onBlack={onHumanBlack}
                      onMulti={onHumanMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : collectionId === 'austen' ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onFirstContactWhite}
                      onBlack={onFirstContactBlack}
                      onMulti={onFirstContactMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : null}
                </div>
              ) : it === CONTROL_TILE_ARROWS ? (
                <div
                  className={`relative z-40 mt-2 ${thinSlideEnabled || pagingEnabled || (isHumanInside && onHumanPrev && onHumanNext) ? '' : 'opacity-30 pointer-events-none'}`}
                  aria-hidden={thinSlideEnabled || pagingEnabled || (isHumanInside && onHumanPrev && onHumanNext) ? undefined : true}
                >
                  <FirstContactDibuix09Buttons
                    tileSize={tileSize}
                    onPrev={() => {
                      touchMegaPublicActivity();
                      if (thinSlideEnabled) {
                        setPageStart((v) => v - 1);
                        if (onHumanPrev) return onHumanPrev();
                        return;
                      }
                      if (pagingEnabled) return setPageStart((v) => v - 1);
                      if (isHumanInside && onHumanPrev) return onHumanPrev();
                    }}
                    onNext={() => {
                      touchMegaPublicActivity();
                      if (thinSlideEnabled) {
                        setPageStart((v) => v + 1);
                        if (onHumanNext) return onHumanNext();
                        return;
                      }
                      if (pagingEnabled) return setPageStart((v) => v + 1);
                      if (isHumanInside && onHumanNext) return onHumanNext();
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`relative z-50 mt-2 aspect-square w-full ${typeof onSelectItem === 'function' ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
                  data-mega-tile="1"
                  data-mega-collection={collectionId}
                  data-mega-item={typeof it === 'string' ? it : ''}
                  ref={idx === 1 ? tileSizeRef : undefined}
                  style={{
                    transform: `translate(${gridOffsetFor(it).x}px, ${gridOffsetFor(it).y}px)`,
                  }}
                  onClick={(e) => {
                    if (typeof onSelectItem !== 'function') return;
                    e.preventDefault();
                    if (import.meta.env.DEV && collectionId === 'cube') {
                      // eslint-disable-next-line no-console
                      console.error('[MEGA cube tile click]', {
                        it,
                        thumb: resolveGridThumbSrc(it, collectionId),
                      });
                    }
                    setSelectedItem(it);
                    onSelectItem(it);

                    try {
                      if (!row) return;
                      if (!megaTileSelectorParams?.enabled) return;
                      if (idx < 1 || idx > 7) return;
                      if (typeof window === 'undefined') return;
                      if (typeof it !== 'string') return;
                      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
                      setMegaPublicSelectorFor(collectionId, keyset, { target: String(it), stepX: 0, stepY: 0 });
                      touchMegaPublicActivity();
                      window.dispatchEvent(new Event('mega-tile-selector-changed'));
                    } catch {
                      // ignore
                    }
                  }}
                  tabIndex={typeof onSelectItem === 'function' ? 0 : -1}
                  onKeyDown={(e) => {
                    if (typeof onSelectItem !== 'function') return;
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    setSelectedItem(it);
                    onSelectItem(it);

                    try {
                      if (!row) return;
                      if (!megaTileSelectorParams?.enabled) return;
                      if (idx < 1 || idx > 7) return;
                      if (typeof window === 'undefined') return;
                      if (typeof it !== 'string') return;
                      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
                      setMegaPublicSelectorFor(collectionId, keyset, { target: String(it), stepX: 0, stepY: 0 });
                      touchMegaPublicActivity();
                      window.dispatchEvent(new Event('mega-tile-selector-changed'));
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <div
                    className={`absolute inset-0 z-20 overflow-hidden rounded-md ${
                      collectionId === 'austen'
                      && typeof it === 'string'
                      && it.toLowerCase().includes('/austen/keep_calm/')
                      && (
                        it.toLowerCase().endsWith('keep-calm-black.webp')
                        || it.toLowerCase().endsWith('keep-calm-b.webp')
                        || it.toLowerCase().endsWith('keep-calm-b-grid.webp')
                      )
                        ? 'bg-white'
                        : collectionId === 'austen'
                          && typeof it === 'string'
                          && it.toLowerCase().includes('/austen/pemberley_house/')
                          ? 'bg-transparent'
                        : 'bg-transparent'
                    }`}
                  >
                    {(() => {
                      const thumbSrc = resolveGridThumbSrc(it, collectionId);
                      const useContain =
                        collectionId === 'austen'
                        && typeof it === 'string'
                        && (it.includes('/austen/quotes/') || it.includes('/austen/crosswords/'));
                      return thumbSrc ? (
                        <OptimizedImg
                          src={thumbSrc}
                          alt={labelForItem(it) || it}
                          className={useContain ? 'h-full w-full object-contain' : 'h-full w-full object-cover'}
                        />
                      ) : (
                        <div className="h-full w-full bg-black/5" />
                      );
                    })()}
                  </div>

                </button>
              )}

              {megaTileSelectorParams?.enabled
                && typeof it === 'string'
                && String(it || '').trim().toLowerCase() === String(megaTileSelectorParams?.target || '').trim().toLowerCase() ? (
                String(megaTileSelectorParams?.keyset || 'v1') === 'v2' ? (
                  <>
                    <div
                      className="absolute z-10 bg-muted"
                      style={{
                        top: '-12px',
                        right: '-6px',
                        bottom: '-6px',
                        left: '-6px',
                        transform: `translate(${selectorTranslateXForRender}px, ${selectorTranslateYForRender}px)`,
                        borderStyle: 'none',
                        borderWidth: '0px',
                        borderColor: 'transparent',
                        background: 'color-mix(in srgb, color-mix(in srgb, hsl(var(--muted)) 97%, rgb(59 130 246) 3%) 90%, white 10%)',
                        borderRadius: `${selectorRadiusPx}px`,
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute z-[55]"
                      style={{
                        top: '-12px',
                        right: '-6px',
                        bottom: '-6px',
                        left: '-6px',
                        transform: `translate(${selectorTranslateXForRender}px, ${selectorTranslateYForRender}px)`,
                        borderStyle: 'none',
                        borderWidth: '0px',
                        borderColor: 'transparent',
                        background: 'transparent',
                        borderRadius: `${selectorRadiusPx}px`,
                        boxSizing: 'border-box',
                        cursor: 'grab',
                        pointerEvents: 'auto',
                      }}
                      aria-hidden="true"
                      data-circle-selector="1"
                      onPointerDown={(e) => {
                        if (typeof onStartSelectorDrag !== 'function') return;
                        e.preventDefault();
                        e.stopPropagation();
                        if (!selectorDragBounds) return;
                        onStartSelectorDrag(e, { ...megaTileSelectorParams, collectionId }, selectorDragBounds);
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute z-[55]"
                    style={{
                      top: '-12px',
                      right: '-6px',
                      bottom: '0px',
                      left: '-6px',
                      transform: `translate(${selectorTranslateXForRender}px, ${selectorTranslateYForRender}px)`,
                      borderStyle: 'solid',
                      borderWidth: `${selectorStrokePx}px`,
                      borderColor: String(megaTileSelectorParams?.color || 'black'),
                      background: 'transparent',
                      borderRadius: `${selectorRadiusPx}px`,
                      boxSizing: 'border-box',
                      cursor: 'grab',
                      pointerEvents: 'auto',
                    }}
                    aria-hidden="true"
                    data-circle-selector="1"
                    onPointerDown={(e) => {
                      if (typeof onStartSelectorDrag !== 'function') return;
                      e.preventDefault();
                      e.stopPropagation();
                      if (!selectorDragBounds) return;
                      onStartSelectorDrag(e, { ...megaTileSelectorParams, collectionId }, selectorDragBounds);
                    }}
                  />
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((it) => (
            <Link key={it} to="#" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
              {it}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export { CONTROL_TILE_BN, CONTROL_TILE_ARROWS };

export default MegaColumn;
