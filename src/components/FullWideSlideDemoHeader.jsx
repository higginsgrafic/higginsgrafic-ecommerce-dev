import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserRound, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getGildan5000Catalog } from '../utils/placeholders.js';
import { useProductContext } from '@/contexts/ProductContext';
import {
  AUSTEN_QUOTES_ASSETS,
  resolveAustenQuoteAssetId,
  resolveAustenQuoteThumbFromPath,
  resolveAustenQuoteOriginalFromPath,
} from '../utils/austenQuotesAssets.js';
import AdidasColorStripeButtons from './AdidasColorStripeButtons.jsx';
import AdidasCatalogPanel from './AdidasCatalogPanel.jsx';
import MegaStripeCatalogPanel from './MegaStripeCatalogPanel.jsx';
import FullWideSlideDemoHumanInsideSlider from './FullWideSlideDemoHumanInsideSlider.jsx';

const FIRST_CONTACT_MEDIA = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp',
};

const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

const FIRST_CONTACT_MEDIA_WHITE = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-w-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/white/wormhole-w-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/white/plasma-escape-w-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/white/vulcans-end-w-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp',
};

const FIRST_CONTACT_MEDIA_COLOR = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/multi/nx-01-multi-light-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-multi-light-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-d-multi-light-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/multi/wormhole-multi-light-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/multi/plasma-escape-multi-light-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/multi/vulcans-end-multi-light-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/multi/the phoenix-multi-light-stripe.webp',
};

const THE_HUMAN_INSIDE_MEDIA = {
  'R2-D2': '/custom_logos/drawings/images_grid/the_human_inside/black/r2-d2-b-grid.webp',
  'The Dalek': '/custom_logos/drawings/images_grid/the_human_inside/black/the-dalek-b-grid.webp',
  'C3P0': '/custom_logos/drawings/images_grid/the_human_inside/black/c3-p0-b-grid.webp',
  'Vader': '/custom_logos/drawings/images_grid/the_human_inside/black/vader-b-grid.webp',
  'Afrodita': '/custom_logos/drawings/images_grid/the_human_inside/black/afrodita-a-b-grid.webp',
  'Mazinger': '/custom_logos/drawings/images_grid/the_human_inside/black/mazinger-z-b-grid.webp',
  'Cylon 78': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-78-b-grid.webp',
  'Cylon 03': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-03-b-grid.webp',
  'Iron Man 68': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-68-b-grid.webp',
  'Iron Man 08': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-08-b-grid.webp',
  Cyberman: '/custom_logos/drawings/images_grid/the_human_inside/black/cyberman-b-grid.webp',
  Robocop: '/custom_logos/drawings/images_grid/the_human_inside/black/robocop-b-grid.webp',
  Terminator: '/custom_logos/drawings/images_grid/the_human_inside/black/terminator-b-grid.webp',
  Maschinenmensch: '/custom_logos/drawings/images_grid/the_human_inside/black/maschinenmensch-b-grid.webp',
  'Robby the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
  'Robbie the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
};

const THE_HUMAN_INSIDE_MEDIA_WHITE = {
  ...THE_HUMAN_INSIDE_MEDIA,
};

const CUBE_MEDIA = {
  'Iron Kong': '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp',
  'Iron Cube 68': '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp',
  RoboCube: '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp',
  'Cylon Cube': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  'Cylon Cube 03': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  MaschinenCube: '/custom_logos/drawings/images_stripe/cube/maschinencube-stripe.webp',
  'Mazinger C': '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp',
  'Afrodita C': '/custom_logos/drawings/images_stripe/cube/afrodita-c-stripe.webp',
  'Cube 3 P0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube-p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  'Cyber Cube': '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp',
  'Darth Cube': '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp',
};

function FirstContactStripeMockupPanel({ megaTileSize, selectedItem, variant, resolveSrc, OptimizedImg }) {
  if (!megaTileSize) return null;
  if (!selectedItem) return null;
  if (!resolveSrc) return null;
  if (!OptimizedImg) return null;

  const inkSrc = resolveSrc(selectedItem);
  if (!inkSrc) return null;

  const shirtSrc =
    variant === 'white'
      ? '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png'
      : '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';

  const overlayClass =
    selectedItem === 'The Phoenix'
      ? 'scale-[0.43]'
      : selectedItem === 'NX-01'
        ? 'scale-[0.26]'
        : selectedItem === 'NCC-1701'
          ? 'scale-[0.41]'
          : selectedItem === 'NCC-1701-D'
            ? 'scale-[0.54]'
            : selectedItem === 'Wormhole'
              ? 'scale-[0.30]'
              : selectedItem === 'Plasma Escape'
                ? 'scale-[0.30]'
                : selectedItem === "Vulcan's End"
                  ? 'scale-[0.36]'
                  : 'scale-[0.34]';

  return (
    <div
      className="absolute top-0 z-[20]"
      style={{
        width: `${Math.round(megaTileSize * (4 / 3))}px`,
        height: `${megaTileSize}px`,
        right: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-muted">
        <div className="relative h-full w-full">
          <OptimizedImg src={shirtSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
          <OptimizedImg
            src={inkSrc}
            alt=""
            className={`absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain ${overlayClass}`}
          />
        </div>
      </div>
    </div>
  );
}

const OptimizedImg = React.forwardRef(function OptimizedImg({ src, alt, className, style, ...rest }, ref) {
  const normalizeSrc = (value) => {
    const s = (value || '').toString();
    if (!s) return '';
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
    return s.startsWith('/') ? s : `/${s}`;
  };

  const originalSrc = normalizeSrc(src);
  const webpSrc = originalSrc.replace(/\.(png|jpe?g)(?=([?#]|$))/i, '.webp');
  const [currentSrc, setCurrentSrc] = useState(webpSrc);
  const triedFallbackRef = useRef(false);

  useEffect(() => {
    triedFallbackRef.current = false;
    setCurrentSrc(webpSrc);
  }, [webpSrc]);

  return (
    <img
      ref={ref}
      src={currentSrc ? encodeURI(currentSrc) : undefined}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          const s = (currentSrc || originalSrc || src || '').toString();
          const shouldLog =
            s.includes('/custom_logos/drawings/images_grid/cube/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/cube/')
            || s.includes('/custom_logos/drawings/images_grid/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_grid/first_contact/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/first_contact/')
            || s.includes('/custom_logos/drawings/images_grid/miscel');
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.error('[OptimizedImg] tile error loading', { src, currentSrc, originalSrc });
          }
        }
        if (triedFallbackRef.current) return;
        triedFallbackRef.current = true;
        if (currentSrc !== originalSrc) setCurrentSrc(originalSrc);
      }}
      {...rest}
    />
  );
});

function IconButton({ label, onClick, onDoubleClick, onMouseEnter, buttonRef, children }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      className="inline-flex h-9 w-9 items-end justify-center pb-[2px] rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10 lg:pb-[3px]"
    >
      {children}
    </button>
  );
}

function FirstContactDibuix00Buttons({ onWhite, onBlack, onMulti }) {
  return (
    <div className="relative mt-2 aspect-square w-full" data-stripe-buttonbar="bn">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="Blanc"
          id="stripe-guide-left-anchor"
          onClick={onWhite}
          className="absolute left-0 top-0 h-1/3 w-full bg-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase text-whiteStrong">
            Blanc
          </span>
        </button>
        <button
          type="button"
          aria-label="Negre"
          onClick={onBlack}
          className="absolute left-0 top-1/3 h-1/3 w-full bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase text-foreground">
            Negre
          </span>
        </button>

        <button
          type="button"
          aria-label="Color"
          onClick={onMulti}
          className="absolute left-0 bottom-0 h-1/3 w-full bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase text-foreground">
            Color
          </span>
        </button>
      </div>
    </div>
  );
}

function FirstContactDibuix09Buttons({
  onPrev,
  onNext,
  tileSize,
  onPrevPointerDown,
  onPrevPointerUp,
  onNextPointerDown,
  onNextPointerUp,
}) {
  const hasPrevPointerHandlers = Boolean(onPrevPointerDown || onPrevPointerUp);
  const hasNextPointerHandlers = Boolean(onNextPointerDown || onNextPointerUp);

  return (
    <div className="relative mt-2 aspect-square w-full">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="Anterior"
          id="stripe-guide-right-anchor"
          onClick={hasPrevPointerHandlers ? undefined : onPrev}
          onPointerDown={onPrevPointerDown}
          onPointerUp={onPrevPointerUp}
          onPointerCancel={onPrevPointerUp}
          onPointerLeave={onPrevPointerUp}
          className="absolute left-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label="Següent"
          onClick={hasNextPointerHandlers ? undefined : onNext}
          onPointerDown={onNextPointerDown}
          onPointerUp={onNextPointerUp}
          onPointerCancel={onNextPointerUp}
          onPointerLeave={onNextPointerUp}
          className="absolute right-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

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
}) {
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const humanInsideEnabled = Boolean(isHumanInside);
  const effectiveTileSize = megaTileSize || tileSize;
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageStart, setPageStart] = useState(0);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const gridCalibEnabled = !!urlParams?.has('gridCalib') || !!urlParams?.has('stripeCalib');
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
    if (collectionId !== 'outcasted') return list.filter(Boolean);
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

  const outcastedStripeTiles = collectionId === 'outcasted' ? Math.max(0, Math.min(7, baseItems.length)) : 7;

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
    return titleCased;
  };

  const normalizeKey = (value) => {
    if (typeof value !== 'string') return '';
    return value
      .trim()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/\s+/g, ' ');
  };

  const resolveSrc = (it) => {
    if (!it) return null;

    if (typeof it === 'string') {
      const raw = it.trim();
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

      if (collectionId === 'outcasted') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/black/${normalized}`, 'stripe');
      }

      if (collectionId === 'the_human_inside') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/black/${normalized}`, 'stripe');
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

      const folder = firstContactVariant === 'white' ? 'white' : 'black';
      const suffix = firstContactVariant === 'white' ? 'w' : 'b';
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${folder}/${base}-${suffix}-grid.webp`, 'grid');
    }

    if (raw.startsWith('/custom_logos/drawings/images_grid/')) {
      if (cid === 'austen' && raw.includes('/austen/quotes/')) {
        return resolveAustenQuoteThumbFromPath(raw, 'grid') || ensureThumbSuffix(raw, 'grid');
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

      if (cid === 'outcasted') {
        const lower = baseFile.toLowerCase();
        if (lower === 'dj-vader-b.webp') return '/custom_logos/drawings/images_grid/miscel·lania/dj-vader-grid.webp';
        if (lower === 'death-star2d2-b.webp') return '/custom_logos/drawings/images_grid/miscel·lania/death-star2d2-grid.webp';
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/miscel·lania/${baseFile.replace(/-b\.webp$/i, '.webp')}`, 'grid');
      }

      if (cid === 'austen') {
        if (raw.includes('/austen/quotes/')) {
          return resolveAustenQuoteThumbFromPath(raw, 'grid') || null;
        }
        if (raw.includes('/austen/keep_calm/')) {
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
        'cyber-cube.webp': 'cybercube.webp',
        'cylon-cube-03.webp': 'cylon-cube.webp',
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
      const map = {
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
        'robby the robot': 'robby-the-robot.webp',
        'robbie the robot': 'robby-the-robot.webp',
      };
      const file = map[key];
      return file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/the_human_inside/${file}`, 'grid') : null;
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
      const file = map[key];
      const out = file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${file}`, 'grid') : null;
      if (import.meta.env.DEV && !out) {
        // eslint-disable-next-line no-console
        console.error('[CUBE grid thumb] unresolved', { it, key, raw });
      }
      return out;
    }

    if (cid === 'outcasted') {
      const s = it.toLowerCase();
      if (s.includes('dj-vader')) return '/custom_logos/drawings/images_grid/miscel·lania/dj-vader-grid.webp';
      if (s.includes('death-star2d2')) return '/custom_logos/drawings/images_grid/miscel·lania/death-star2d2-grid.webp';
      if (s.includes('pont-del-diable')) return '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-grid.webp';
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
      const key = normalizeKey(it).toLowerCase();
      const id = resolveAustenQuoteAssetId(key);
      if (id && AUSTEN_QUOTES_ASSETS[id]?.stripe) return AUSTEN_QUOTES_ASSETS[id].stripe;
      if (raw.includes('/austen/quotes/')) {
        return resolveAustenQuoteThumbFromPath(raw, 'stripe') || null;
      }

      if (raw.includes('/austen/keep_calm/')) {
        const file = raw.split('/').pop() || '';
        if (file === 'keep-calm-multi-red.webp') return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-red-stripe.webp';
        if (file === 'keep-calm-black.webp') return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
      }

      if (raw.includes('/austen/looking_for_my_darcy/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (lower.includes('dark-gradient')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/${file}`, 'stripe');
        if (lower.includes('light-gradient')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/${file}`, 'stripe');
        if (lower.includes('-frame')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/${file}`, 'stripe');
        if (lower.includes('-solid')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/${file}`, 'stripe');
      }

      if (raw.includes('/austen/pemberley_house/')) {
        const file = raw.split('/').pop() || '';
        if (file === 'pemberley-black.webp') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-black-stripe.webp';
      }

      if (raw.includes('/austen/crosswords/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const persuasion = lower.match(/^persuasion-(\d)\.webp$/);
        if (persuasion) return `/custom_logos/drawings/images_stripe/austen/crosswords/persuasion/persuasion-${persuasion[1]}-stripe.webp`;
        const pride = lower.match(/^pride-and-prejudice-(\d)\.webp$/);
        if (pride) return `/custom_logos/drawings/images_stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-${pride[1]}-stripe.webp`;
        const sense = lower.match(/^sense-and-sensibility-(\d)\.webp$/);
        if (sense) return `/custom_logos/drawings/images_stripe/austen/crosswords/sense_and_sensibility/sense-and-sensibility-${sense[1]}-stripe.webp`;
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

    if (collectionId === 'outcasted') {
      const file = raw.split('/').pop() || '';
      const map = {
        'dj-vader.webp': 'dj-vader-b.webp',
        'death-star2d2.webp': 'death-star2d2-b.webp',
      };
      const master = map[file.toLowerCase()] || file;
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/black/${master}`, 'stripe');
    }

    if (collectionId === 'the_human_inside') {
      const key = normalizeKey(it).toLowerCase();
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
        'robbie the robot': 'robbie-the-robot.webp',
      };

      const file = labelMap[key] || (raw.split('/').pop() || '');
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
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-0 z-0 grid w-full grid-cols-9 gap-x-3">
            <div className="col-start-2 col-span-7 min-w-0">
              <div className="h-4" />
              <div
                className={`mt-2 w-full rounded-md transition-opacity duration-300 ease-in-out ${
                  isFirstContact && firstContactVariant === 'white'
                    ? 'bg-foreground opacity-100'
                    : isHumanInside && humanInsideVariant === 'white'
                      ? 'bg-foreground opacity-100'
                      : 'bg-transparent opacity-100'
                  }`}
                style={
                  tileSize
                    ? {
                        height: `${tileSize}px`,
                        width:
                          collectionId === 'outcasted'
                            ? `${outcastedStripeTiles * tileSize + Math.max(0, outcastedStripeTiles - 1) * 12}px`
                            : undefined,
                      }
                    : undefined
                }
              />
            </div>
          </div>

          <div
            className="relative z-10 overflow-hidden"
            style={effectiveTileSize ? { height: `${effectiveTileSize + 24}px` } : undefined}
          >
            {thinSlideEnabled ? (
              <FullWideSlideDemoHumanInsideSlider
                items={effectiveItems}
                collectionId={collectionId}
                megaTileSize={megaTileSize}
                isFirstContact={isFirstContact}
                isHumanInside={isHumanInside}
                humanInsideVariant={humanInsideVariant}
                firstContactVariant={firstContactVariant}
                onFirstContactWhite={onFirstContactWhite}
                onFirstContactBlack={onFirstContactBlack}
                onHumanWhite={onHumanWhite}
                onHumanBlack={onHumanBlack}
                onHumanPrev={isHumanInside ? onHumanPrev : undefined}
                onHumanNext={isHumanInside ? onHumanNext : undefined}
                onSelectItem={onSelectItem}
                OptimizedImg={OptimizedImg}
                FirstContactDibuix00Buttons={FirstContactDibuix00Buttons}
                FirstContactDibuix09Buttons={FirstContactDibuix09Buttons}
                CONTROL_TILE_BN={CONTROL_TILE_BN}
                CONTROL_TILE_ARROWS={CONTROL_TILE_ARROWS}
                FIRST_CONTACT_MEDIA={FIRST_CONTACT_MEDIA}
                FIRST_CONTACT_MEDIA_WHITE={FIRST_CONTACT_MEDIA_WHITE}
                THE_HUMAN_INSIDE_MEDIA={THE_HUMAN_INSIDE_MEDIA}
                THE_HUMAN_INSIDE_MEDIA_WHITE={THE_HUMAN_INSIDE_MEDIA_WHITE}
              />
            ) : (
              <div className="grid w-full grid-cols-9 gap-x-3">
                {rowItems.map((it, idx) => (
                  <div
                    key={`${it}-${idx}`}
                    className="min-w-0 relative z-10"
                    style={humanInsideEnabled && effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}
                  >
                    {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                      <div className="h-4" />
                    ) : (
                      <Link
                        to="#"
                        className="relative z-40 flex h-[20px] w-full items-center justify-center whitespace-nowrap rounded-none bg-muted px-2 font-roboto-condensed text-[11.2px] leading-[20px] uppercase text-foreground hover:text-foreground"
                        data-mega-label="1"
                        data-mega-collection={collectionId}
                        data-mega-item={typeof it === 'string' ? it : ''}
                        onClick={(e) => {
                          if (typeof onSelectItem !== 'function') return;
                          e.preventDefault();
                          onSelectItem(it);
                        }}
                      >
                        {labelForItem(it)}
                      </Link>
                    )}

                    {!it ? null : it === CONTROL_TILE_BN ? (
                      <div className="relative z-40">
                        {isFirstContact ? (
                          <FirstContactDibuix00Buttons onWhite={onFirstContactWhite} onBlack={onFirstContactBlack} onMulti={onFirstContactMulti} />
                        ) : isHumanInside ? (
                          <FirstContactDibuix00Buttons onWhite={onHumanWhite} onBlack={onHumanBlack} onMulti={onHumanMulti} />
                        ) : null}
                      </div>
                    ) : it === CONTROL_TILE_ARROWS ? (
                      <div
                        className={`relative z-40 ${thinSlideEnabled || pagingEnabled ? '' : 'opacity-30 pointer-events-none'}`}
                        aria-hidden={thinSlideEnabled || pagingEnabled ? undefined : true}
                      >
                        <FirstContactDibuix09Buttons
                          tileSize={tileSize}
                          onPrev={() => {
                            if (thinSlideEnabled) return;
                            if (pagingEnabled) return setPageStart((v) => v - 1);
                            if (isHumanInside && !humanInsideEnabled && onHumanPrev) return onHumanPrev();
                          }}
                          onNext={() => {
                            if (thinSlideEnabled) return;
                            if (pagingEnabled) return setPageStart((v) => v + 1);
                            if (isHumanInside && !humanInsideEnabled && onHumanNext) return onHumanNext();
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
                        }}
                        tabIndex={typeof onSelectItem === 'function' ? 0 : -1}
                        onKeyDown={(e) => {
                          if (typeof onSelectItem !== 'function') return;
                          if (e.key !== 'Enter' && e.key !== ' ') return;
                          e.preventDefault();
                          setSelectedItem(it);
                          onSelectItem(it);
                        }}
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-md bg-transparent">
                          {(() => {
                            let thumbSrc = resolveGridThumbSrc(it, collectionId);
                            const isFirstContactWhiteGridThumb =
                              collectionId === 'first_contact'
                              && typeof thumbSrc === 'string'
                              && thumbSrc.includes('/custom_logos/drawings/images_grid/first_contact/white/');
                            const useContain =
                              collectionId === 'austen'
                              && typeof it === 'string'
                              && it.includes('/austen/quotes/');
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

                        {FIRST_CONTACT_MEDIA[it] && idx >= 1 && idx <= 7 && firstContactVariant === 'white' && !(
                          collectionId === 'first_contact'
                          && typeof resolveGridThumbSrc(it, collectionId) === 'string'
                          && resolveGridThumbSrc(it, collectionId).includes('/custom_logos/drawings/images_grid/first_contact/white/')
                        ) ? (
                          <OptimizedImg
                            src={FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                            alt={it}
                            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                              firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        ) : null}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
 
export default function FullWideSlideDemoHeader({
  cartItemCount,
  onCartClick,
  onUserClick,
  ignoreStripeDebugFromUrl = false,
  stripeItemLeftOffsetPxByIndex,
  redistributeStripeBetweenFirstAndLast = false,
  contained = false,
  portalContainer,
  manualEnabledOverride,
  initialActiveId,
  navItems,
  megaConfig,
  showStripe = true,
  showCatalogPanel = true,
}) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window !== 'undefined') {
        window.__MEGA_BUILD_MARKER__ = 'FullWideSlideDemoHeader 2026-02-14T02:36';
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line no-console
    console.error('[MEGA build marker]', 'FullWideSlideDemoHeader 2026-02-14T02:36');
  }, []);

  const navigate = useNavigate();
  const { products: contextProducts } = useProductContext();
  const cartClickTimeoutRef = useRef(null);
  const accountClickTimeoutRef = useRef(null);
  const dblClickDelayMs = 240;
  const MEGA_SLIDES_COUNT = 4;
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(() => {
    const products = Array.isArray(contextProducts) ? contextProducts : [];
    const q = (searchQuery || '').toString().trim().toLowerCase();

    const normalizeCollectionKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const allowedCollectionKeys = new Set(['the-human-inside', 'first-contact', 'austen', 'outcasted']);
    const collectionLabelByKey = {
      'the-human-inside': 'The Human Inside',
      'first-contact': 'First Contact',
      austen: 'Austen',
      outcasted: 'Miscel·lània',
    };

    const isCubeRelated = (p) => {
      const haystack = `${p?.collection || ''} ${p?.slug || ''} ${p?.name || ''} ${p?.description || ''}`.toLowerCase();
      return haystack.includes('cube');
    };

    const matches = (p) => {
      if (!p) return false;
      if (!q) return true;
      const haystack = `${p.slug || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
      return haystack.includes(q);
    };

    const toPriceLabel = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return `${value.toFixed(2)} €`;
      if (typeof value === 'string' && value.trim()) return value.trim();
      return '—';
    };

    return products
      .filter((p) => allowedCollectionKeys.has(normalizeCollectionKey(p?.collection)))
      .filter((p) => !isCubeRelated(p))
      .filter((p) => matches(p))
      .slice(0, 160)
      .map((p) => {
        const id = p?.slug || p?.id;
        const slugOrId = p?.slug || p?.id;
        const collectionKey = normalizeCollectionKey(p?.collection);
        const collection = (collectionLabelByKey?.[collectionKey] || p?.collection || 'Catàleg').toString();
        const name = (p?.name || 'Producte').toString();
        const image = p?.image || p?.images?.[0] || null;
        return {
          id: id?.toString() || name,
          slugOrId,
          category: collection,
          title: name,
          price: toPriceLabel(p?.price),
          image,
        };
      });
  }, [contextProducts, searchQuery]);

  const searchAccent = '#ef4444';
  const searchTopLinks = useMemo(() => ['Novetats', 'Samarretes', 'Bosses', 'Promocions'], []);

  const searchSuggestions = useMemo(
    () => [
      'Samarreta Gildan 5000',
      'Dibuixos',
      'Logotips',
      'Bosses',
      'Papereria',
    ],
    []
  );
  const [searchGridScale, setSearchGridScale] = useState(1);
  const [searchCaretVisible, setSearchCaretVisible] = useState(true);
  const [megaPage, setMegaPage] = useState(1);
  const [firstContactSelectedItem, setFirstContactSelectedItem] = useState(null);
  const [humanInsideSelectedItem, setHumanInsideSelectedItem] = useState(null);
  const [selectedItemByCollection, setSelectedItemByCollection] = useState({});
  const megaSliderIndex = Math.max(0, Math.min(MEGA_SLIDES_COUNT - 1, (megaPage || 1) - 1));
  const [active, setActive] = useState(() => {
    if (contained) return initialActiveId || 'first_contact';
    try {
      const p = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const fromUrl = p?.get('active') || p?.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'outcasted']);
      if (next && allowed.has(next)) return next;
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1' ? 'first_contact' : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const p = new URLSearchParams(window.location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'outcasted']);
      if (next && allowed.has(next)) setActive(next);
    } catch {
      // ignore
    }
  }, []);

  const forceStripeDebugHit =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debugStripeHit');
  const disableCatalogPanel =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noCatalogPanel');
  const wsEnabled =
    typeof window !== 'undefined' && import.meta.env.DEV && new URLSearchParams(window.location.search).has('ws');
  const effectiveForceStripeDebugHit = forceStripeDebugHit;
  const effectiveDisableCatalogPanel = disableCatalogPanel;
  const disableStripe = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noStripe');
  const gridCalibFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gridCalib');

  const overlaySrcFromUrl = useMemo(() => {
    try {
      if (typeof window === 'undefined') return null;
      const p = new URLSearchParams(window.location.search);
      const raw = p.get('stripeOverlay');
      if (typeof raw !== 'string') return null;
      const v = raw.trim();
      return v ? v : null;
    } catch {
      return null;
    }
  }, []);

  const overlayStorageKey = useMemo(() => {
    const k = (active || '').toString();
    return k ? `HG_STRIPE_OVERLAY_SRC_${k}` : 'HG_STRIPE_OVERLAY_SRC';
  }, [active]);

  const [stripeOverlayOverrideActive, setStripeOverlayOverrideActive] = useState(() => Boolean(overlaySrcFromUrl));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoManualEnabled, setDemoManualEnabled] = useState(() => {
    if (typeof manualEnabledOverride === 'boolean') return manualEnabledOverride;
    if (contained) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  });
  const [firstContactVariant, setFirstContactVariant] = useState('black');
  const [humanInsideVariant, setHumanInsideVariant] = useState('black');
  const [selectedColorSlug, setSelectedColorSlug] = useState('white');
  const [thinStartIndex, setThinStartIndex] = useState(0);
  const [gildan5000Catalog, setGildan5000Catalog] = useState(null);

  const reorderAustenQuotes = (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return items;
      const wantOrder = [
        'it-is-a-truth',
        'you-must-allow-me',
        'body-and-soul',
        'unsociable-and-taciturn',
        'half-agony-half-hope',
      ];
      const rankByNeedle = new Map(wantOrder.map((v, idx) => [v, idx]));
      const pickRank = (v) => {
        if (typeof v !== 'string') return null;
        const s = v.toLowerCase();
        if (!s.includes('/austen/quotes/')) return null;
        for (const [needle, idx] of rankByNeedle.entries()) {
          if (s.includes(needle)) return idx;
        }
        return null;
      };

      let touched = false;
      const out = items
        .map((it, idx) => {
          const r = pickRank(it);
          if (r !== null) touched = true;
          return { it, idx, r };
        })
        .sort((a, b) => {
          if (a.r === null && b.r === null) return a.idx - b.idx;
          if (a.r === null) return 1;
          if (b.r === null) return -1;
          if (a.r !== b.r) return a.r - b.r;
          return a.idx - b.idx;
        })
        .map((e) => e.it);

      return touched ? out : items;
    } catch {
      return items;
    }
  };

  useEffect(() => {
    if (overlaySrcFromUrl) return;
    setStripeOverlayOverrideActive(false);
  }, [active, overlaySrcFromUrl]);

  const resolvedOverlaySrc = useMemo(() => {
    const normalizeKeyLocal = (value) => {
      if (typeof value !== 'string') return '';
      return value
        .trim()
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
        .replace(/\s+/g, ' ');
    };
    const isPathItem = (it) => typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);

    if (active === 'first_contact' && firstContactSelectedItem) {
      if (firstContactVariant === 'white') {
        return FIRST_CONTACT_MEDIA_WHITE[firstContactSelectedItem]
          || FIRST_CONTACT_MEDIA[firstContactSelectedItem]
          || null;
      }
      if (firstContactVariant === 'color') {
        return FIRST_CONTACT_MEDIA_COLOR[firstContactSelectedItem]
          || FIRST_CONTACT_MEDIA[firstContactSelectedItem]
          || null;
      }
      return FIRST_CONTACT_MEDIA[firstContactSelectedItem] || null;
    }
    if (active === 'the_human_inside' && humanInsideSelectedItem) {
      const key = normalizeKeyLocal(humanInsideSelectedItem).toLowerCase();
      const map = {
        'r2-d2': 'r2-d2-stripe.webp',
        c3p0: 'c3-p0-stripe.webp',
        vader: 'vader-stripe.webp',
        afrodita: 'afrodita-a-stripe.webp',
        mazinger: 'mazinger-z-stripe.webp',
        'cylon 78': 'cylon-stripe.webp',
        'cylon 03': 'cylon-03-stripe.webp',
        'iron man 68': 'iron-man-68-stripe.webp',
        'iron man 08': 'iron-man-08-stripe.webp',
        cyberman: 'cyberman-stripe.webp',
        'the dalek': 'the-dalek-stripe.webp',
        robocop: 'robocop-stripe.webp',
        terminator: 'terminator-stripe.webp',
        maschinenmensch: 'maschinenmensch-stripe.webp',
        'robby the robot': 'robbie-the-robot-stripe.webp',
        'robbie the robot': 'robbie-the-robot-stripe.webp',
      };
      const file = map[key] || null;
      return file ? `/custom_logos/drawings/images_stripe/the_human_inside/black/${file}` : null;
    }
    if (active && selectedItemByCollection?.[active]) {
      const key = selectedItemByCollection[active];

      if (active === 'cube' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const map = {
          'iron kong': 'iron-cube-08-iron-kong-stripe.webp',
          'iron cube': 'iron-cube-68-stripe.webp',
          'iron cube 68': 'iron-cube-68-stripe.webp',
          robocube: 'robocube-stripe.webp',
          'cylon cube': 'cylon-cube-03-stripe.webp',
          'cylon cube 03': 'cylon-cube-03-stripe.webp',
          maschinencube: 'maschinencube-stripe.webp',
          'mazinger c': 'mazinger-c-stripe.webp',
          'afrodita c': 'afrodita-c-stripe.webp',
          'cube 3 p0': 'cube-3-p0-stripe.webp',
          '3cube p0': 'cube-3-p0-stripe.webp',
          '3cube-p0': 'cube-3-p0-stripe.webp',
          '3cube p0': 'cube-3-p0-stripe.webp',
          '3cube-p0': 'cube-3-p0-stripe.webp',
          'cyber cube': 'cyber-cube-stripe.webp',
          cybercube: 'cyber-cube-stripe.webp',
          'darth cube': 'darth-cube-stripe.webp',
        };
        const file = map[k] || null;
        const out = file ? `/custom_logos/drawings/images_stripe/cube/${file}` : null;
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[CUBE stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      if (active === 'outcasted' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const map = {
          'dj vader': '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp',
          'dj-vader': '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp',
          deathstar2d2: '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp',
          'death star2d2': '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp',
          'death-star2d2': '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp',
        };
        const out = map[k] || null;
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[OUTCASTED stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      // Path-based collections (e.g. outcasted black/xxx.webp) can be resolved directly.
      if (isPathItem(key)) {
        if (active === 'cube' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/cube/')) {
          const file = key.split('/').pop() || '';
          const fileNormalized = file.replace(/-grid\.(webp|png|jpe?g)$/i, '.$1');
          const map = {
            'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
            'iron-cube.webp': 'iron-cube-68.webp',
            'robocube.webp': 'robocube.webp',
            'cylon-cube.webp': 'cylon-cube-03.webp',
            'maschinencube.webp': 'maschinencube.webp',
            'mazinger-c.webp': 'mazinger-c.webp',
            'afrodita-c.webp': 'afrodita-c.webp',
            '3cube-p0.webp': 'cube-3-p0.webp',
            'cybercube.webp': 'cyber-cube.webp',
            'darth-cube.webp': 'darth-cube.webp',
          };
          const drawingFile = map[fileNormalized] || map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/cube/${drawingFile.replace(/\.(webp|png|jpe?g)$/i, '-stripe.$1')}`;
        }
        if (active === 'outcasted' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscel·lania/')) {
          const file = key.split('/').pop() || '';
          const map = {
            'dj-vader.webp': 'dj-vader-b.webp',
            'death-star2d2.webp': 'death-star2d2-b.webp',
          };
          const drawingFile = map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/miscel·lania/black/${drawingFile.replace(/\.(webp|png|jpe?g)$/i, '-stripe.$1')}`;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/keep_calm/')) {
          const file = key.split('/').pop() || '';
          if (file === 'keep-calm-multi-red.webp') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-red.webp';
          }
          if (file === 'keep-calm-black.webp') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (lower.includes('dark-gradient')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/${file}`;
          if (lower.includes('light-gradient')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/${file}`;
          if (lower.includes('-frame')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/${file}`;
          if (lower.includes('-solid')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/${file}`;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          const file = key.split('/').pop() || '';
          if (file === 'pemberley-black.webp') {
            return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-black.webp';
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_stripe/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-stripe\.(webp|png)$/i);
          if (m) {
            const folder = m[1].replace(/-/g, '_');
            return `/custom_logos/drawings/images_stripe/austen/crosswords/${folder}/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_originals/grid/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-grid\.(webp|png)$/i);
          if (m) {
            return `/custom_logos/drawings/images_grid/austen/crosswords/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const persuasion = lower.match(/^persuasion-(\d)\.webp$/);
          if (persuasion) {
            const n = persuasion[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/persuasion/persuasion-${n}.webp`;
          }
          const pride = lower.match(/^pride-and-prejudice-(\d)\.webp$/);
          if (pride) {
            const n = pride[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-${n}.webp`;
          }
          const sense = lower.match(/^sense-and-sensibility-(\d)\.webp$/);
          if (sense) {
            const n = sense[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/sense_and_sensibility/sense-and-sensibility-${n}.webp`;
          }
        }
        if (
          active === 'austen'
          && typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          return resolveAustenQuoteOriginalFromPath(key) || key;
        }
        return key;
      }

      if (active === 'austen') {
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/keep_calm/')) {
          const file = key.split('/').pop() || '';
          if (file === 'keep-calm-multi-red.webp') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-red.webp';
          }
          if (file === 'keep-calm-black.webp') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
          }
        }
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (lower.includes('dark-gradient')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/${file}`;
          if (lower.includes('light-gradient')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/${file}`;
          if (lower.includes('-frame')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/${file}`;
          if (lower.includes('-solid')) return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/${file}`;
        }
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          const file = key.split('/').pop() || '';
          if (file === 'pemberley-black.webp') {
            return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-black.webp';
          }
        }
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const persuasion = lower.match(/^persuasion-(\d)\.webp$/);
          if (persuasion) {
            const n = persuasion[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/persuasion/persuasion-${n}.webp`;
          }
          const pride = lower.match(/^pride-and-prejudice-(\d)\.webp$/);
          if (pride) {
            const n = pride[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/pride_and_prejudice/pride-and-prejudice-${n}.webp`;
          }
          const sense = lower.match(/^sense-and-sensibility-(\d)\.webp$/);
          if (sense) {
            const n = sense[1];
            return `/custom_logos/drawings/images_stripe/austen/crosswords/sense_and_sensibility/sense-and-sensibility-${n}.webp`;
          }
        }
        if (
          typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          return resolveAustenQuoteOriginalFromPath(key) || key;
        }
        const k = typeof key === 'string' ? normalizeKeyLocal(key).toLowerCase() : '';
        const id = resolveAustenQuoteAssetId(k);
        if (id && AUSTEN_QUOTES_ASSETS[id]?.original) return AUSTEN_QUOTES_ASSETS[id].original;
        return AUSTEN_QUOTES_ASSETS.it_is_a_truth.original;
      }

      if (active === 'outcasted') {
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscel·lania/')) {
          const file = key.split('/').pop() || '';
          const map = {
            'dj-vader.webp': 'dj-vader-b-stripe.webp',
            'death-star2d2.webp': 'death-star2d2-b-stripe.webp',
          };
          const drawingFile = map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/miscel·lania/black/${drawingFile}`;
        }
        return null;
      }

      if (FIRST_CONTACT_MEDIA[key]) {
        return firstContactVariant === 'white'
          ? (FIRST_CONTACT_MEDIA_WHITE[key] || FIRST_CONTACT_MEDIA[key] || null)
          : (FIRST_CONTACT_MEDIA[key] || null);
      }
    }
    return null;
  }, [
    active,
    firstContactVariant,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    humanInsideVariant,
    selectedItemByCollection,
  ]);

  useEffect(() => {
    if (stripeOverlayOverrideActive) return;
    if (!resolvedOverlaySrc) return;
    try {
      window.localStorage.setItem(overlayStorageKey, resolvedOverlaySrc);
    } catch {
      // ignore
    }
  }, [overlayStorageKey, resolvedOverlaySrc, stripeOverlayOverrideActive]);
  const [megaTileSize, setMegaTileSize] = useState(null);
  const [rootRemPx, setRootRemPx] = useState(16);
  const headerRef = useRef(null);
  const megaMenuRef = useRef(null);
  const mobileHumanScrollRef = useRef(null);
  const logoMarkRef = useRef(null);
  const accountButtonRef = useRef(null);
  const searchHeaderRowRef = useRef(null);
  const searchGridRowRef = useRef(null);
  const searchGridScrollRef = useRef(null);
  const [megaInsetsPx, setMegaInsetsPx] = useState({ left: 0, right: 0 });

  const ensureMegaOpen = () => {
    setActive((prev) => prev || 'first_contact');
  };

  useEffect(() => {
    setHumanInsideVariant((prev) => (prev === firstContactVariant ? prev : firstContactVariant));
  }, [firstContactVariant]);

  const scrollSearchGridBy = (deltaPx) => {
    const el = searchGridScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: deltaPx, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const containerEl = searchGridScrollRef.current;
    const rowEl = searchGridRowRef.current;
    if (!containerEl || !rowEl) return undefined;

    const measure = () => {
      const containerHeight = containerEl.clientHeight;
      const rowHeight = rowEl.offsetHeight;
      if (!containerHeight || !rowHeight) return;

      const nextScale = Math.max(0.5, Math.min(2.5, containerHeight / rowHeight));
      setSearchGridScale((prev) => (Math.abs(prev - nextScale) < 0.01 ? prev : nextScale));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, megaPage, searchResults.length]);

  const isManualLockEnabled = () => {
    if (demoManualEnabled) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const logoEl = logoMarkRef.current;
    const accountEl = accountButtonRef.current;
    const megaEl = megaMenuRef.current;
    if (!logoEl || !accountEl || !megaEl) return undefined;

    const measure = () => {
      const megaRect = megaEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();
      const accountRect = accountEl.getBoundingClientRect();

      const left = Math.max(0, Math.round(logoRect.right - megaRect.left));
      const right = Math.max(0, Math.round(megaRect.right - accountRect.left));

      setMegaInsetsPx((prev) => {
        if (prev.left === left && prev.right === right) return prev;
        return { left, right };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(logoEl);
    ro.observe(accountEl);
    ro.observe(megaEl);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [active]);

  useEffect(() => {
    if (!active || megaPage !== 2) return undefined;
    const id = window.setInterval(() => {
      setSearchCaretVisible((v) => !v);
    }, 520);
    return () => window.clearInterval(id);
  }, [active, megaPage]);

  const selectedColorHex = useMemo(
    () => ({
      c0: '#ffffff',
      c1: '#ffffff',
      c2: '#ffffff',
      c3: '#ffffff',
      c4: '#ffffff',
      c5: '#ffffff',
      c6: '#ffffff',
      c7: '#ffffff',
      c8: '#ffffff',
      c9: '#ffffff',
      c10: '#ffffff',
      c11: '#ffffff',
      c12: '#ffffff',
      c13: '#ffffff',
      c14: '#ffffff',
    }),
    []
  );

  const getSlugLuminance = useMemo(() => {
    const hexToRgb = (hex) => {
      if (!hex || typeof hex !== 'string') return null;
      const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) return null;
      const v = m[1];
      const r = Number.parseInt(v.slice(0, 2), 16);
      const g = Number.parseInt(v.slice(2, 4), 16);
      const b = Number.parseInt(v.slice(4, 6), 16);
      return { r, g, b };
    };

    const srgbToLinear = (c) => {
      const x = c / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };

    return (slug) => {
      const hex = selectedColorHex?.[slug];
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const r = srgbToLinear(rgb.r);
      const g = srgbToLinear(rgb.g);
      const b = srgbToLinear(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
  }, [selectedColorHex]);

  const colorLabelBySlug = useMemo(() => {
    const colors = Array.isArray(gildan5000Catalog?.colors) ? gildan5000Catalog.colors : [];
    const out = {};
    for (const c of colors) {
      if (!c?.slug) continue;
      out[c.slug] = c.label || c.slug;
    }
    return out;
  }, [gildan5000Catalog]);

  const selectedColorOrder = useMemo(
    () => [
      'white',
      'light-blue',
      'royal',
      'purple',
      'navy',
      'daisy',
      'gold',
      'light-pink',
      'red',
      'kiwi',
      'irish-green',
      'military-green',
      'forest-green',
      'black',
    ],
    []
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/1.png',
      'light-pink': '/placeholders/t-shirt_buttons/selector-color-light-pink.png',
      'light-blue': '/placeholders/t-shirt_buttons/selector-color-light-blue.png',
      daisy: '/placeholders/t-shirt_buttons/selector-color-daisy.png',
      gold: '/placeholders/t-shirt_buttons/selector-color-gold.png',
      red: '/placeholders/t-shirt_buttons/selector-color-red.png',
      purple: '/placeholders/t-shirt_buttons/selector-color-purple.png',
      royal: '/placeholders/t-shirt_buttons/selector-color-blue-royal.png',
      navy: '/placeholders/t-shirt_buttons/selector-color-blue-navy.png',
      'military-green': '/placeholders/t-shirt_buttons/selector-color-military-green.png',
      'forest-green': '/placeholders/t-shirt_buttons/selector-color-forest-green.png',
      'irish-green': '/placeholders/t-shirt_buttons/selector-color-irish-green.png',
      kiwi: '/placeholders/t-shirt_buttons/selector-color-kiwi.png',
      black: '/placeholders/t-shirt_buttons/selector-color-black.png',
    }),
    []
  );

  const defaultNav = useMemo(
    () => [
      { id: 'first_contact', label: 'First Contact' },
      { id: 'the_human_inside', label: 'The Human Inside' },
      { id: 'austen', label: 'Austen' },
      { id: 'cube', label: 'Cube' },
      { id: 'outcasted', label: 'Miscel·lània' },
    ],
    []
  );

  const resolvedNav = useMemo(() => {
    if (!Array.isArray(navItems) || navItems.length === 0) return defaultNav;

    const byId = new Map();
    for (const item of defaultNav) {
      if (!item?.id) continue;
      byId.set(item.id, item);
    }
    for (const item of navItems) {
      if (!item?.id) continue;
      byId.set(item.id, item);
    }

    const out = [];
    if (byId.has('first_contact')) out.push(byId.get('first_contact'));
    for (const item of navItems) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      out.push(byId.get(item.id));
    }
    for (const item of defaultNav) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      if (out.some((x) => x?.id === item.id)) continue;
      out.push(item);
    }
    return out;
  }, [defaultNav, navItems]);

  const thinDrawings = useMemo(
    () => [
      'R2-D2',
      'C3P0',
      'Vader',
      'Afrodita',
      'Mazinger',
      'Cylon 78',
      'Cylon 03',
      'Iron Man 68',
      'Iron Man 08',
      'Cyberman',
      'The Dalek',
      'Maschinenmensch',
      'Robocop',
      'Terminator',
      'Robbie the Robot',
    ],
    []
  );

  const thinWindowItems = useMemo(() => {
    const list = Array.isArray(thinDrawings) ? thinDrawings : [];
    if (list.length === 0) return [];
    const start = ((thinStartIndex % list.length) + list.length) % list.length;
    const out = [];
    for (let i = 0; i < 7; i += 1) {
      out.push(list[(start + i) % list.length]);
    }
    return out;
  }, [thinDrawings, thinStartIndex]);

  const defaultMega = useMemo(
    () => ({
      first_contact: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'NX-01',
            'NCC-1701',
            'NCC-1701-D',
            'Wormhole',
            'Plasma Escape',
            "Vulcan's End",
            'The Phoenix',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      the_human_inside: [
        {
          title: '',
          items: [CONTROL_TILE_BN, ...thinDrawings, CONTROL_TILE_ARROWS],
        },
      ],
      austen: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-dark.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-solid.webp',
            '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-2.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-4.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      cube: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'Iron Kong',
            'Iron Cube 68',
            'RoboCube',
            'Cylon Cube',
            'Cylon Cube 03',
            'MaschinenCube',
            'Mazinger C',
            'Afrodita C',
            'Cube 3 P0',
            'Cyber Cube',
            'Darth Cube',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      outcasted: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
    }),
    [thinWindowItems]
  );

  const resolvedMega = useMemo(() => {
    if (!megaConfig || typeof megaConfig !== 'object') return defaultMega;

    const out = { ...defaultMega };
    for (const [key, value] of Object.entries(megaConfig)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const hasAnyItems = value.some((col) => Array.isArray(col?.items) && col.items.length > 0);
      if (!hasAnyItems) continue;
      out[key] = value;
    }

    if (gridCalibFromUrl) {
      out.cube = defaultMega.cube;
    }
    return out;
  }, [defaultMega, gridCalibFromUrl, megaConfig]);

  useEffect(() => {
    if (!active) return;
    if (stripeOverlayOverrideActive) return;

    const pickFirstDrawingItem = (items) => {
      const list = Array.isArray(items) ? items : [];
      for (const it of list) {
        if (!it) continue;
        if (it === CONTROL_TILE_BN) continue;
        if (it === CONTROL_TILE_ARROWS) continue;
        return it;
      }
      return null;
    };

    const col = resolvedMega?.[active];
    const firstItems = Array.isArray(col) && col.length > 0 ? col[0]?.items : null;
    const fallbackItem = pickFirstDrawingItem(firstItems);
    if (!fallbackItem) return;

    if (active === 'first_contact') {
      if (firstContactSelectedItem) return;
      setFirstContactSelectedItem(fallbackItem);
      return;
    }

    if (active === 'the_human_inside') {
      if (humanInsideSelectedItem) return;
      setHumanInsideSelectedItem(fallbackItem);
      return;
    }

    if (active === 'cube' || active === 'outcasted') {
      if (selectedItemByCollection?.[active]) return;
      setSelectedItemByCollection((prev) => ({ ...prev, [active]: fallbackItem }));
    }

    if (active === 'austen') {
      if (selectedItemByCollection?.[active]) return;
      setSelectedItemByCollection((prev) => ({ ...prev, [active]: fallbackItem }));
    }
  }, [
    active,
    CONTROL_TILE_ARROWS,
    CONTROL_TILE_BN,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    resolvedMega,
    selectedItemByCollection,
    stripeOverlayOverrideActive,
  ]);

  useEffect(() => {
    if (typeof manualEnabledOverride === 'boolean') return undefined;
    if (contained) return undefined;

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
        setDemoManualEnabled((prev) => (prev === enabled ? prev : enabled));
      } catch {
        setDemoManualEnabled((prev) => (prev === false ? prev : false));
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' || e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE') {
        readControls();
      }
    };

    const onLocalChange = () => {
      readControls();
    };

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    };
  }, [contained, manualEnabledOverride]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (demoManualEnabled) return;
        setActive(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [demoManualEnabled]);

  useLayoutEffect(() => {
    if (!active) return;
    const el = megaMenuRef.current;
    if (!el) return;

    const GAP_PX = 12;
    const COLS = 9;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) return;
      const cs = window.getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft || '0') || 0;
      const pr = parseFloat(cs.paddingRight || '0') || 0;
      const contentW = w - pl - pr;
      if (!contentW) return;
      const totalGaps = (COLS - 1) * GAP_PX;
      const colW = (contentW - totalGaps) / COLS;
      if (!Number.isFinite(colW) || colW <= 0) return;
      setMegaTileSize(colW);
    };

    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [active]);

  useEffect(() => {
    let mounted = true;
    getGildan5000Catalog().then((catalog) => {
      if (mounted) setGildan5000Catalog(catalog);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (gildan5000Catalog) return;
    let cancelled = false;
    getGildan5000Catalog()
      .then((data) => {
        if (cancelled) return;
        setGildan5000Catalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGildan5000Catalog({ selected: [], selectedSlugs: new Set(), getPlaceholderSrc: () => null });
      });
    return () => {
      cancelled = true;
    };
  }, [active, gildan5000Catalog]);

  useEffect(() => {
    if (contained) {
      setActive(initialActiveId || 'first_contact');
      return;
    }
    setActive(demoManualEnabled ? 'first_contact' : null);
  }, [contained, demoManualEnabled, initialActiveId]);

  useEffect(() => {
    if (!active) {
      setMegaPage(1);
    }
  }, [active]);

  useEffect(() => {
    if (contained) return undefined;
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [contained, mobileOpen]);

  useEffect(() => {
    const recompute = () => {
      try {
        const px = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        if (Number.isFinite(px) && px > 0) setRootRemPx(px);
      } catch {
        setRootRemPx(16);
      }
    };

    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  const canUseDom = typeof document !== 'undefined';

  const scrollMobileHumanByTiles = (dir) => {
    const el = mobileHumanScrollRef.current;
    if (!el) return;
    const step = 120 * 3 + 12 * 3;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <header
      ref={headerRef}
      className={`${contained ? 'relative' : 'fixed'} z-[10000] bg-background ${megaPage === 1 ? 'overflow-x-visible' : 'overflow-x-hidden'}`}
      style={
        contained
          ? { top: 0, left: 0, right: 0 }
          : {
 top: 'var(--appHeaderOffset, 0px)', left: 'var(--rulerInset, 0px)', right: 0 }
      }
    >
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
              aria-label={mobileOpen ? 'Tancar menú' : 'Obrir menú'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/" className="relative z-10 pointer-events-auto flex items-center gap-2 font-black tracking-tight text-foreground">
              <span
                ref={logoMarkRef}
                aria-hidden="true"
                data-brand-logo="1"
                className="h-8 w-[140px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskPosition: 'left center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {resolvedNav.map((item) => {
              const open = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-expanded={open ? 'true' : 'false'}
                  onMouseEnter={() => {
                    setMegaPage(1);
                    setActive(item.id);
                  }}
                  onFocus={() => {
                    setMegaPage(1);
                    setActive(item.id);
                  }}
                  onClick={() => {
                    setMegaPage(1);
                    setActive((prev) => (prev === item.id ? null : item.id));
                  }}
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div
            className="ml-auto grid grid-cols-3 items-center"
            style={{ width: megaTileSize ? `${Math.round(megaTileSize)}px` : undefined }}
            data-icons-wrap="true"
          >
            <div className="justify-self-start">
              <IconButton
                label="Search"
                onClick={() => {
                  if (active) {
                    if (megaPage === 2) {
                      setActive(null);
                      return;
                    }
                    setMegaPage(2);
                    return;
                  }
                  ensureMegaOpen();
                  setMegaPage(2);
                }}
              >
                <svg className="h-[25px] w-[25px] text-foreground -translate-x-[1px] lg:h-[29px] lg:w-[29px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </IconButton>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  if (active) {
                    if (megaPage === 3) {
                      setActive(null);
                      return;
                    }
                    setMegaPage(3);
                    return;
                  }
                  ensureMegaOpen();
                  setMegaPage(3);
                }, dblClickDelayMs);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = null;
                setActive(null);
                navigate('/cart');
              }}
              aria-label="Cart"
              className="relative inline-flex h-9 w-9 items-center justify-center justify-self-center rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10"
            >
              <span aria-hidden="true" className="relative block h-[27px] w-[27px] transition-all duration-200 lg:h-[31px] lg:w-[31px]">
                <span
                  className="absolute inset-0"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                {cartItemCount > 0 ? (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] font-bold lg:text-[16.25px]"
                    style={{ top: 'calc(60% - 0.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                  >
                    {cartItemCount}
                  </span>
                ) : null}
              </span>
            </button>
            <div className="justify-self-end">
              <IconButton
                label="Account"
                buttonRef={accountButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  if (accountClickTimeoutRef.current) window.clearTimeout(accountClickTimeoutRef.current);
                  accountClickTimeoutRef.current = window.setTimeout(() => {
                    accountClickTimeoutRef.current = null;
                    if (active) {
                      if (megaPage === 4) {
                        setActive(null);
                        return;
                      }
                      setMegaPage(4);
                      return;
                    }
                    ensureMegaOpen();
                    setMegaPage(4);
                  }, dblClickDelayMs);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (accountClickTimeoutRef.current) window.clearTimeout(accountClickTimeoutRef.current);
                  accountClickTimeoutRef.current = null;
                  setActive(null);
                  navigate('/profile');
                }}
              >
                <UserRound className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={1.5} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {canUseDom && (!contained || portalContainer) &&
        createPortal(
          active ? (
            <div
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9990] bg-foreground/25`}
              onClick={() => {
                if (isManualLockEnabled()) return;
                setActive(null);
              }}
            />
          ) : null,
          portalContainer || document.body
        )}

      <div
        className="relative"
        onMouseLeave={() => {
          if (isManualLockEnabled()) return;
          setActive(null);
        }}
      >
        {active ? (
          <div className={`hidden lg:block border-b border-border bg-background ${megaPage === 1 ? 'overflow-x-visible' : 'overflow-x-hidden'}`}>
            <div
              ref={megaMenuRef}
              className={`mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8 ${megaPage === 1 ? 'overflow-x-visible' : 'overflow-x-hidden'}`}
            >
              <div
                className={megaPage === 1 ? 'overflow-y-visible' : 'overflow-x-hidden overflow-y-visible'}
                style={megaTileSize
                  ? {
                      height: `${Math.round(megaTileSize * 2 + 37)}px`,
                      marginLeft: '0px',
                      paddingLeft: '0px',
                      width: '100%',
                      overflowX: megaPage === 1 ? 'visible' : undefined,
                      clipPath: megaPage === 1 ? 'inset(0px 0px 0px -260px)' : undefined,
                    }
                  : undefined}
              >
                <div
                  className="flex h-full"
                  style={{
                    width: `${MEGA_SLIDES_COUNT * 100}%`,
                    transform: `translateX(-${megaSliderIndex * (100 / MEGA_SLIDES_COUNT)}%)`,
                    transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  <div className="h-full w-full shrink-0" style={{ width: `${100 / MEGA_SLIDES_COUNT}%` }}>
                    <div className="grid grid-cols-1 gap-10">
                      {(resolvedMega[active] || []).map((col, idx) => (
                        <MegaColumn
                          key={`${active}-${idx}`}
                          title={col.title}
                          isFirstContact={active === 'first_contact' || active === 'austen' || active === 'cube' || active === 'outcasted'}
                          isHumanInside={active === 'the_human_inside'}
                          collectionId={active}
                          megaTileSize={megaTileSize}
                          humanInsideVariant={humanInsideVariant}
                          items={active === 'austen' ? reorderAustenQuotes(col.items) : col.items}
                          row={true}
                          firstContactVariant={firstContactVariant}
                          onFirstContactWhite={() => setFirstContactVariant('white')}
                          onFirstContactBlack={() => setFirstContactVariant('black')}
                          onFirstContactMulti={() => setFirstContactVariant('color')}
                          onHumanWhite={() => setFirstContactVariant('white')}
                          onHumanBlack={() => setFirstContactVariant('black')}
                          onHumanMulti={() => setFirstContactVariant('color')}
                          onHumanPrev={() => setThinStartIndex((v) => v - 1)}
                          onHumanNext={() => setThinStartIndex((v) => v + 1)}
                          onSelectItem={
                            (it) => {
                              if (!it || it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return;
                              setStripeOverlayOverrideActive(false);
                              if (active === 'first_contact') setFirstContactSelectedItem(it);
                              else if (active === 'the_human_inside') setHumanInsideSelectedItem(it);
                              else setSelectedItemByCollection((prev) => ({ ...prev, [active]: it }));
                            }
                          }
                        />
                      ))}
                    </div>

                    {disableStripe ? null : (
                      <MegaStripeCatalogPanel
                        megaTileSize={megaTileSize}
                        StripeButtonsComponent={AdidasColorStripeButtons}
                        stripeKey={active}
                        stripeProps={{
                          selectedColorOrder,
                          selectedColorSlug,
                          onSelect: setSelectedColorSlug,
                          colorLabelBySlug,
                          colorButtonSrcBySlug,
                          stripeV2: true,
                          allowStripeV2UrlParams: true,
                          forceStripeV3: true,
                          stripeV2Defaults: { v2S: 1.25, v2L: 162, v2R: 9, v2PX: 0, v2VL: 50, v2VR: 0 },
                          placeholderCount: 14,
                          distribution: 'anchored-even',
                          autoAlignLastToRight: true,
                          lastTileExtraOffsetPx: 15,
                          overlaySrc: (stripeOverlayOverrideActive ? overlaySrcFromUrl : null) || resolvedOverlaySrc,
                          overlayClassName: undefined,
                          itemLeftOffsetPxByIndex: stripeItemLeftOffsetPxByIndex,
                          redistributeBetweenFirstAndLast: redistributeStripeBetweenFirstAndLast,
                          firstOffsetPx: 20,
                          firstTileExtraOffsetPx: 25,
                          lastOffsetPx: 63,
                          cropFirstRightPx: 20,
                          compressFactor: 0.79,
                          forceDebugStripeHit: effectiveForceStripeDebugHit,
                          ignoreUrlDebugStripeHit: ignoreStripeDebugFromUrl,
                        }}
                        CatalogPanelComponent={effectiveDisableCatalogPanel ? null : AdidasCatalogPanel}
                      />
                    )}
                  </div>

                  <div className="h-full w-full shrink-0" style={{ width: `${100 / MEGA_SLIDES_COUNT}%` }}>
                    <div className="flex h-full min-h-0 flex-col">
                      <div className="relative flex items-center justify-between" ref={searchHeaderRowRef}>
                        <div
                          className="pointer-events-none absolute left-1/2 right-10 top-1/2 h-7 -translate-y-1/2 rounded-md"
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                          aria-hidden="true"
                        />
                        <div
                          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2"
                          style={{ backgroundColor: searchAccent, opacity: searchCaretVisible ? 1 : 0 }}
                          aria-hidden="true"
                        />
                        <div
                          className="relative z-10 min-w-0 overflow-hidden"
                          style={{ maxWidth: 'calc(100% - 340px)' }}
                        >
                          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                            {searchTopLinks.map((label, idx) => (
                              <div key={label} className="flex min-w-0 items-center gap-2">
                                <button
                                  type="button"
                                  className="truncate text-[10px] font-semibold tracking-[0.22em] uppercase"
                                  style={{ color: searchAccent }}
                                >
                                  {label}
                                </button>
                                {idx < searchTopLinks.length - 1 ? (
                                  <span className="text-[10px] font-normal tracking-[0.22em] opacity-50" style={{ color: searchAccent }}>
                                    |
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2">
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca"
                            className="h-7 w-[280px] bg-transparent px-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-foreground placeholder:text-foreground/40 focus:outline-none"
                            style={{ color: searchAccent }}
                          />
                          <div className="ml-1" style={{ color: searchAccent }}>
                            <svg
                              className="h-[25px] w-[25px] origin-top-right scale-[1.15] text-foreground -translate-x-[1px]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 h-px w-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.35)' }} />

                      <div className="mt-3 flex-1 min-h-0">
                        <div className="relative grid h-full min-h-0 grid-cols-2 gap-6">
                          <div className="relative h-full min-h-0 overflow-hidden border-r border-foreground">
                            <div className="h-full fw-no-scrollbar">
                              <div ref={searchGridScrollRef} className="h-full overflow-x-auto overflow-y-hidden fw-no-scrollbar">
                                <div
                                  ref={searchGridRowRef}
                                  className="flex gap-3 snap-x snap-mandatory"
                                  style={{ transform: `scale(${searchGridScale})`, transformOrigin: 'top left' }}
                                >
                                  {searchResults.map((item, itemIdx) => {
                                    const officialColorSlugs = selectedColorOrder.filter((slug) => gildan5000Catalog?.selectedSlugs?.has(slug));
                                    const colorSlug = officialColorSlugs.length ? officialColorSlugs[itemIdx % officialColorSlugs.length] : null;
                                    const placeholderSrc =
                                      item.image ||
                                      (colorSlug ? gildan5000Catalog?.getPlaceholderSrc?.(colorSlug) : null) ||
                                      '/placeholder-product.svg';
                                    return (
                                      <div
                                        key={item.id}
                                        className="group h-full w-[220px] shrink-0 overflow-hidden rounded-md bg-transparent snap-start"
                                      >
                                        <div className="h-full w-full bg-muted">
                                          <OptimizedImg src={placeholderSrc} alt="" className="block h-full w-full object-contain" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                              <button
                                type="button"
                                className="pointer-events-auto ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/70 shadow-sm"
                                onClick={() => scrollSearchGridBy(-420)}
                                aria-label="Desplaçar a l'esquerra"
                                title="Esquerra"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                              <button
                                type="button"
                                className="pointer-events-auto mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/70 shadow-sm"
                                onClick={() => scrollSearchGridBy(420)}
                                aria-label="Desplaçar a la dreta"
                                title="Dreta"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="relative flex h-full min-h-0 flex-col">
                            <div className="flex-1 min-h-0 overflow-y-auto fw-no-scrollbar">
                              <div className="w-full">
                                {searchResults.map((item, idx) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      borderBottom: '0.5px solid hsl(var(--foreground))',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="grid w-full grid-cols-[1fr_auto] gap-6 px-1 py-3 text-left"
                                      onClick={() => {
                                        const dest = item.slugOrId ? `/product/${item.slugOrId}` : null;
                                        if (!dest) return;
                                        navigate(dest);
                                        setActive(null);
                                      }}
                                    >
                                      <div className="min-w-0 py-0.5">
                                        <div className="flex min-w-0 items-center space-x-2 text-sm uppercase" style={{ color: searchAccent }}>
                                          <span className="text-muted-foreground">Inici</span>
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-muted-foreground">{item.category}</span>
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                          <span className="min-w-0 truncate text-foreground font-medium">{item.title}</span>
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-[17px] font-normal text-foreground">
                                        {item.price}
                                      </div>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-full w-full shrink-0" style={{ width: `${100 / MEGA_SLIDES_COUNT}%` }}>
                    <div className="flex h-full min-h-0 flex-col">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-foreground">Cistell</div>
                        <button type="button" className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground">
                          Veure cistell
                        </button>
                      </div>

                      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pb-4">
                        <div className="grid gap-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-md bg-muted p-3">
                              <div className="h-14 w-14 rounded-md bg-background" />
                              <div className="min-w-0">
                                <div className="truncate text-[12px] font-medium text-foreground">Samarreta Gildan 5000 — Mock {i}</div>
                                <div className="mt-1 text-[11px] font-medium text-foreground/60">Color: {selectedColorSlug} · Talla: M · QTY: 1</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[12px] font-semibold text-foreground">12,90 €</div>
                                <button type="button" className="mt-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 border-t border-border pt-3">
                        <div className="flex items-center justify-between text-[12px]">
                          <div className="font-medium text-foreground/70">Subtotal</div>
                          <div className="font-semibold text-foreground">38,70 €</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button type="button" className="h-9 rounded-md border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground">
                            Checkout
                          </button>
                          <button type="button" className="h-9 rounded-md bg-foreground text-xs font-semibold tracking-[0.18em] uppercase text-background">
                            Pagar ara
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-full w-full shrink-0" style={{ width: `${100 / MEGA_SLIDES_COUNT}%` }}>
                    <div className="flex h-full min-h-0 flex-col">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-foreground">Compte</div>
                        <button type="button" className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground">
                          Ajuda
                        </button>
                      </div>

                      <div className="mt-3 grid flex-1 min-h-0 gap-3 overflow-y-auto pb-4">
                        <div className="rounded-md bg-muted p-4">
                          <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-foreground/70">Accés</div>
                          <div className="mt-2 text-[12px] text-foreground">Inicia sessió per veure comandes, adreces i dissenys guardats.</div>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <button type="button" className="h-9 rounded-md bg-foreground text-xs font-semibold tracking-[0.18em] uppercase text-background">
                              Iniciar sessió
                            </button>
                            <button type="button" className="h-9 rounded-md border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground">
                              Crear compte
                            </button>
                          </div>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                          <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-foreground/70">Comandes recents</div>
                          <div className="mt-3 grid gap-2">
                            {['#HG-10284', '#HG-10211'].map((code) => (
                              <button key={code} type="button" className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-left">
                                <div className="text-[12px] font-medium text-foreground">{code}</div>
                                <div className="text-[11px] font-semibold text-foreground/60">Veure</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                          <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-foreground/70">Preferències</div>
                          <div className="mt-3 grid gap-2">
                            <button type="button" className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-left">
                              <div className="text-[12px] font-medium text-foreground">Dades i adreces</div>
                              <div className="text-[11px] font-semibold text-foreground/60">Editar</div>
                            </button>
                            <button type="button" className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-left">
                              <div className="text-[12px] font-medium text-foreground">Notificacions</div>
                              <div className="text-[11px] font-semibold text-foreground/60">Configurar</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="lg:hidden border-b border-border bg-background">
          <div className="px-4 py-4 grid gap-2">
            {resolvedNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setActive((prev) => (prev === item.id ? null : item.id))}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 ${active === item.id ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>

          {active ? (
            <div className="border-t border-border px-4 py-4">
              <div className="grid gap-4">
                {(resolvedMega[active] || []).map((col) => (
                  <div key={col.title} className="rounded-2xl bg-muted p-4">
                    <div
                      ref={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? mobileHumanScrollRef : undefined
                      }
                      className={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                          ? 'relative mt-3 overflow-x-auto'
                          : 'mt-3 grid grid-cols-3 gap-3'
                      }
                    >
                      <div
                        className={active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? 'grid gap-x-3' : ''}
                        style={
                          active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                            ? {
                                width: 'max-content',
                                gridAutoFlow: 'column',
                                gridAutoColumns: '120px',
                              }
                            : undefined
                        }
                      >
                        {(() => {
                          const isPath = (v) => typeof v === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(v);
                          const base = active === 'the_human_inside' ? col.items : col.items.slice(0, 9);
                          if (active !== 'outcasted') return base;
                          const variant = firstContactVariant;
                          return base.filter((it) => {
                            if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
                            if (!isPath(it)) return false;
                            if (it.startsWith('black/')) return variant !== 'white';
                            if (it.startsWith('white/')) return variant === 'white';
                            return true;
                          });
                        })().map((it, idx) => (
                          <div key={`${it}-${idx}`} className="min-w-0">
                            {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                              <div className="h-4" />
                            ) : active === 'outcasted' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="h-4" />
                            ) : (
                              <Link
                                to="#"
                                className="flex h-4 w-full items-center justify-center rounded-none bg-muted px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                {it}
                              </Link>
                            )}

                            {FIRST_CONTACT_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                {idx >= 1 && idx <= 7 ? (
                                  <div
                                    className={`absolute inset-0 rounded-md ${
                                      firstContactVariant === 'white' ? 'bg-foreground' : 'bg-transparent'
                                    }`}
                                  />
                                ) : null}
                                <OptimizedImg
                                  src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA[it]}
                                  alt={it}
                                  className={
                                    it === 'The Phoenix'
                                      ? 'absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 object-contain'
                                      : 'absolute inset-0 h-full w-full object-contain'
                                  }
                                />

                                {idx >= 1 && idx <= 7 && firstContactVariant === 'white' && !(
                                  typeof resolveGridThumbSrc(it, active) === 'string'
                                  && resolveGridThumbSrc(it, active).includes('/custom_logos/drawings/images_grid/first_contact/white/')
                                ) ? (
                                  <OptimizedImg
                                    src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                                    alt={it}
                                    className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                                      firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                                    } ${
                                      it === 'Wormhole'
                                        ? 'scale-[0.54]'
                                        : it === 'Plasma Escape'
                                          ? 'scale-[0.54]'
                                          : it === "Vulcan's End"
                                            ? 'scale-[0.66]'
                                            : 'scale-[0.6]'
                                    }`}
                                  />
                                ) : null}
                              </div>
                            ) : active === 'outcasted' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={`/custom_logos/drawings/outcasted/${it}`}
                                  alt=""
                                  className="relative z-10 h-full w-full object-contain"
                                />
                              </div>
                            ) : THE_HUMAN_INSIDE_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]}
                                  alt={it}
                                  className={`relative z-10 h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                                />
                              </div>
                            ) : it === CONTROL_TILE_BN ? (
                              active === 'the_human_inside' ? (
                                <FirstContactDibuix00Buttons onWhite={() => setHumanInsideVariant('white')} onBlack={() => setHumanInsideVariant('black')} onMulti={() => setHumanInsideVariant('color')} />
                              ) : (
                                <FirstContactDibuix00Buttons onWhite={() => setFirstContactVariant('white')} onBlack={() => setFirstContactVariant('black')} onMulti={() => setFirstContactVariant('color')} />
                              )
                            ) : it === CONTROL_TILE_ARROWS ? (
                              <FirstContactDibuix09Buttons
                                tileSize={120}
                                onPrev={active === 'the_human_inside' ? () => setThinStartIndex((v) => v - 1) : () => {}}
                                onNext={active === 'the_human_inside' ? () => setThinStartIndex((v) => v + 1) : () => {}}
                              />
                            ) : (
                              <div className="mt-2 aspect-square w-full rounded-md bg-muted" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(-1)}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(1)}
                        >
                          Següent
                        </button>
                      </div>
                    ) : null}

                    {active === 'outcasted' ? null : (
                      <div className="mt-4">
                        <div className="grid gap-2">
                          {(col.items || []).filter(Boolean).slice(0, 8).map((it) => (
                            <Link key={it} to="#" className="text-sm text-muted-foreground hover:text-foreground">
                              {it}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                          Catàleg
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <Layers className="h-4 w-4" strokeWidth={1.75} />
                          Col·lecció
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <motion.span layoutId={`stripe-${active}`} className="h-3 w-3 rounded-full bg-foreground" />
                          Color
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          Detalls
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
