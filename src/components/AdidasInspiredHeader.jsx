import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserRound, ChevronDown, ChevronLeft, ChevronRight, Layers, LayoutGrid } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { getGildan5000Catalog } from '../utils/placeholders.js';
import AdidasColorStripeButtons from './AdidasColorStripeButtons.jsx';
import AdidasCatalogPanel from './AdidasCatalogPanel.jsx';
import MegaStripeCatalogPanel from './MegaStripeCatalogPanel.jsx';
import AdidasHumanInsideSlider from './AdidasHumanInsideSlider.jsx';

const FIRST_CONTACT_MEDIA = {
  'NX-01': '/custom_logos/drawings/first_contact/black/1-nx-01-b.webp',
  'NCC-1701': '/custom_logos/drawings/first_contact/black/2-ncc-1701-b.webp',
  'NCC-1701-D': '/custom_logos/drawings/first_contact/black/3-ncc-1701-d-b.webp',
  'Wormhole': '/custom_logos/drawings/first_contact/black/4-wormhole-b.webp',
  'Plasma Escape': '/custom_logos/drawings/first_contact/black/5-plasma-escape-b.webp',
  "Vulcan's End": '/custom_logos/drawings/first_contact/black/6-vulcans-end-b.webp',
  'The Phoenix': '/custom_logos/drawings/first_contact/black/7-the-phoenix-b.webp',
};

const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

const FIRST_CONTACT_MEDIA_WHITE = {
  'NX-01': '/custom_logos/drawings/first_contact/white/1-nx-01-w.webp',
  'NCC-1701': '/custom_logos/drawings/first_contact/white/2-ncc-1701-w.webp',
  'NCC-1701-D': '/custom_logos/drawings/first_contact/white/3-ncc-1701-d-w.webp',
  'Wormhole': '/custom_logos/drawings/first_contact/white/4-wormhole-w.webp',
  'Plasma Escape': '/custom_logos/drawings/first_contact/white/5-plasma-escape-w.webp',
  "Vulcan's End": '/custom_logos/drawings/first_contact/white/6-vulcans-end-w.webp',
  'The Phoenix': '/custom_logos/drawings/first_contact/white/7-the-phoenix-w.webp',
};

const THE_HUMAN_INSIDE_MEDIA = {
  'C3P0': '/custom_logos/drawings/the_human_inside/black/7-c3p0-b4.webp',
  'Vader': '/custom_logos/drawings/the_human_inside/black/8-vader-b4.webp',
  'Afrodita': '/custom_logos/drawings/the_human_inside/black/9-afrodita-a-b3.webp',
  'Mazinger': '/custom_logos/drawings/the_human_inside/black/10-mazinger-b4.webp',
  'Cylon 78': '/custom_logos/drawings/the_human_inside/black/11-cylon-78-b4.webp',
  'Cylon 03': '/custom_logos/drawings/the_human_inside/black/12-cylon-03-b1.webp',
  'Iron Man 68': '/custom_logos/drawings/the_human_inside/black/13-iron-man-68-b1.webp',
  'Iron Man 08': '/custom_logos/drawings/the_human_inside/black/14-ironman-08-b4.webp',
  'Cyberman': '/custom_logos/drawings/the_human_inside/black/15-cyberman-b4.webp',
  'Maschinenmensch': '/custom_logos/drawings/the_human_inside/black/16-maschinenmensch-b1.webp',
  'Robocop': '/custom_logos/drawings/the_human_inside/black/17-robocop-b4.webp',
  'Terminator': '/custom_logos/drawings/the_human_inside/black/18-terminator-b4.webp',
  'Robbie the Robot': '/custom_logos/drawings/the_human_inside/black/19-robbie-the-robot-b1.webp',
};

const THE_HUMAN_INSIDE_MEDIA_WHITE = {
  'C3P0': '/custom_logos/drawings/the_human_inside/white/7-c3p0-w1.webp',
  'Vader': '/custom_logos/drawings/the_human_inside/white/8-vader-w4.webp',
  'Afrodita': '/custom_logos/drawings/the_human_inside/white/9-afrodita-w4.webp',
  'Mazinger': '/custom_logos/drawings/the_human_inside/white/10-mazinger-w1.webp',
  'Cylon 78': '/custom_logos/drawings/the_human_inside/white/11-cylon-78-w4.webp',
  'Cylon 03': '/custom_logos/drawings/the_human_inside/white/12-cylon-03-w3.webp',
  'Iron Man 68': '/custom_logos/drawings/the_human_inside/white/13-iron-man-68-w4.webp',
  'Iron Man 08': '/custom_logos/drawings/the_human_inside/white/14-iron-man-08-w4.webp',
  'Cyberman': '/custom_logos/drawings/the_human_inside/white/15-cyberman-w1.webp',
  'Maschinenmensch': '/custom_logos/drawings/the_human_inside/white/16-maschinenmensch-w1.webp',
  'Robocop': '/custom_logos/drawings/the_human_inside/white/17-robocop-w3.webp',
  'Terminator': '/custom_logos/drawings/the_human_inside/white/18-terminator-w1.webp',
  'Robbie the Robot': '/custom_logos/drawings/the_human_inside/white/19-robbie-the-robot-w2.webp',
};

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
          console.warn('[OptimizedImg] error loading', { src, currentSrc, originalSrc });
        }
        if (triedFallbackRef.current) return;
        triedFallbackRef.current = true;
        if (currentSrc !== originalSrc) setCurrentSrc(originalSrc);
      }}
      {...rest}
    />
  );
});

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-end justify-center pb-[2px] rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10 lg:pb-[3px]"
    >
      {children}
    </button>
  );
}

function FirstContactDibuix00Buttons({ onWhite, onBlack }) {
  return (
    <div className="relative mt-2 aspect-square w-full">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="Blanc"
          onClick={onWhite}
          className="absolute left-0 top-0 h-1/2 w-full bg-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase text-whiteStrong">
            Blanc
          </span>
        </button>
        <button
          type="button"
          aria-label="Negre"
          onClick={onBlack}
          className="absolute left-0 bottom-0 h-1/2 w-full bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase text-foreground">
            Negre
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
  return (
    <div className="relative mt-2 aspect-square w-full">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="Anterior"
          onClick={onPrev}
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
          onClick={onNext}
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

function getContainContentHeightPx(imgEl) {
  if (!imgEl) return null;
  const w = imgEl.clientWidth;
  const h = imgEl.clientHeight;
  const nw = imgEl.naturalWidth;
  const nh = imgEl.naturalHeight;
  if (!w || !h || !nw || !nh) return null;
  const aspect = nh / nw;
  const containH = Math.min(h, w * aspect);
  return containH;
}

function MegaColumn({
  title,
  items,
  row = false,
  isFirstContact = false,
  isHumanInside = false,
  megaTileSize,
  humanInsideVariant = 'black',
  firstContactVariant = 'black',
  onFirstContactWhite,
  onFirstContactBlack,
  onHumanWhite,
  onHumanBlack,
  onHumanPrev,
  onHumanNext,
  onTileSize,
}) {
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const scrollRowRef = useRef(null);
  const humanInsideEnabled = Boolean(isHumanInside);
  const effectiveTileSize = megaTileSize || tileSize;

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

  const scrollByTiles = (dir) => {
    const el = scrollRowRef.current;
    if (!el) return;
    const step = (effectiveTileSize || 160) * 3 + 12 * 3;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
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
                style={tileSize ? { height: `${tileSize}px` } : undefined}
              />
            </div>
          </div>

          <div
            ref={scrollRowRef}
            className="relative z-10 overflow-hidden"
            style={effectiveTileSize ? { height: `${effectiveTileSize + 24}px` } : undefined}
          >
            {humanInsideEnabled ? (
              <AdidasHumanInsideSlider
                items={items}
                megaTileSize={megaTileSize}
                isFirstContact={isFirstContact}
                isHumanInside={isHumanInside}
                humanInsideVariant={humanInsideVariant}
                firstContactVariant={firstContactVariant}
                onFirstContactWhite={onFirstContactWhite}
                onFirstContactBlack={onFirstContactBlack}
                onHumanWhite={onHumanWhite}
                onHumanBlack={onHumanBlack}
                onHumanPrev={onHumanPrev}
                onHumanNext={onHumanNext}
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
                {items.map((it, idx) => (
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
                        className="relative z-40 flex h-4 w-full items-center justify-center whitespace-nowrap rounded-none bg-muted px-2 text-xs leading-4 text-muted-foreground hover:text-foreground"
                      >
                        {it}
                      </Link>
                    )}

                    {FIRST_CONTACT_MEDIA[it] ? (
                      <div
                        className="relative z-10 mt-2 aspect-square w-full overflow-hidden"
                        ref={idx === 1 ? tileSizeRef : undefined}
                      >
                        <OptimizedImg
                          src={FIRST_CONTACT_MEDIA[it]}
                          alt={it}
                          className={
                            it === 'The Phoenix'
                              ? 'h-full w-full object-contain scale-[0.825]'
                              : it === 'NX-01'
                                ? 'h-full w-full object-contain scale-[0.47]'
                              : it === 'NCC-1701'
                                  ? 'h-full w-full object-contain scale-[0.75]'
                                  : it === 'NCC-1701-D'
                                    ? 'h-full w-full object-contain scale-100'
                                  : it === 'Wormhole'
                                    ? 'h-full w-full object-contain scale-[0.54]'
                                  : it === 'Plasma Escape'
                                    ? 'h-full w-full object-contain scale-[0.54]'
                                  : it === "Vulcan's End"
                                    ? 'h-full w-full object-contain scale-[0.66]'
                                  : 'h-full w-full object-contain scale-[0.6]'
                          }
                        />

                        {idx >= 1 && idx <= 7 && firstContactVariant === 'white' ? (
                          <OptimizedImg
                            src={FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                            alt={it}
                            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                              firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                            } ${
                              it === 'The Phoenix'
                                ? 'scale-[0.825]'
                                : it === 'NX-01'
                                  ? 'scale-[0.47]'
                                  : it === 'NCC-1701'
                                    ? 'scale-[0.75]'
                                    : it === 'NCC-1701-D'
                                      ? 'scale-100'
                                    : it === 'Wormhole'
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
                    ) : (humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it] ? (
                      <div
                        className="relative z-10 mt-2 aspect-square w-full overflow-hidden"
                        ref={idx === 1 ? tileSizeRef : undefined}
                      >
                        <OptimizedImg
                          src={(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]}
                          alt={it}
                          className={`h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                        />
                      </div>
                    ) : it === CONTROL_TILE_BN ? (
                      <div className="relative z-40">
                        {isFirstContact ? (
                          <FirstContactDibuix00Buttons onWhite={onFirstContactWhite} onBlack={onFirstContactBlack} />
                        ) : isHumanInside ? (
                          <FirstContactDibuix00Buttons onWhite={onHumanWhite} onBlack={onHumanBlack} />
                        ) : null}
                      </div>
                    ) : it === CONTROL_TILE_ARROWS ? (
                      <div className="relative z-40">
                        <FirstContactDibuix09Buttons
                          tileSize={tileSize}
                          onPrev={() => {
                            if (isHumanInside && !humanInsideEnabled && onHumanPrev) return onHumanPrev();
                            return scrollByTiles(-1);
                          }}
                          onNext={() => {
                            if (isHumanInside && !humanInsideEnabled && onHumanNext) return onHumanNext();
                            return scrollByTiles(1);
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="mt-2 aspect-square w-full rounded-md bg-muted"
                        ref={idx === 1 ? tileSizeRef : undefined}
                      />
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
            <Link
              key={it}
              to="#"
              className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              {it}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdidasInspiredHeader({
  cartItemCount = 0,
  onCartClick,
  onUserClick,
  forceStripeDebugHit = false,
  ignoreStripeDebugFromUrl = false,
  stripeItemLeftOffsetPxByIndex,
  redistributeStripeBetweenFirstAndLast = false,
}) {
  const navigate = useNavigate();
  const cartClickTimeoutRef = useRef(null);

  const isManualLockEnabled = () => {
    try {
      return (
        window.localStorage.getItem('NIKE_DEMO_MANUAL') === '1' ||
        window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1'
      );
    } catch {
      return false;
    }
  };

  const [active, setActive] = useState(() => {
    try {
      return isManualLockEnabled() ? 'first_contact' : null;
    } catch {
      return null;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoManualEnabled, setDemoManualEnabled] = useState(() => {
    try {
      return isManualLockEnabled();
    } catch {
      return false;
    }
  });
  const [firstContactVariant, setFirstContactVariant] = useState('black');
  const [humanInsideVariant, setHumanInsideVariant] = useState('black');
  const [selectedColorSlug, setSelectedColorSlug] = useState('white');
  const [thinStartIndex, setThinStartIndex] = useState(0);
  const [gildan5000Catalog, setGildan5000Catalog] = useState(null);
  const [megaTileSize, setMegaTileSize] = useState(null);
  const [rootRemPx, setRootRemPx] = useState(16);
  const headerRef = useRef(null);
  const megaMenuRef = useRef(null);
  const mobileHumanScrollRef = useRef(null);

  const selectedColorHex = useMemo(
    () => ({
      white: '#ffffff',
      'light-pink': '#f6c6d0',
      'light-blue': '#a9c9e8',
      daisy: '#f6d54a',
      gold: '#d4a62a',
      red: '#c8102e',
      purple: '#5a2a82',
      royal: '#1f3fbf',
      navy: '#13294b',
      'military-green': '#4b5320',
      'forest-green': '#0b3d2e',
      'irish-green': '#1f8a3b',
      kiwi: '#7bbf2a',
      black: '#111111',
    }),
    []
  );

  const getSlugLuminance = useMemo(() => {
    const hexToRgb = (hex) => {
      const clean = String(hex || '').replace('#', '').trim();
      if (clean.length !== 6) return null;
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      if (![r, g, b].every((v) => Number.isFinite(v))) return null;
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
      'light-pink',
      'kiwi',
      'light-blue',
      'daisy',
      'gold',
      'irish-green',
      'royal',
      'red',
      'purple',
      'military-green',
      'forest-green',
      'navy',
      'black',
    ],
    []
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/selector-color-white.png',
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

  const nav = useMemo(
    () => [
      { id: 'first_contact', label: 'First Contact' },
      { id: 'the_human_inside', label: 'The Human Inside' },
      { id: 'austen', label: 'Austen' },
      { id: 'cube', label: 'Cube' },
      { id: 'outcasted', label: 'Outcasted' },
    ],
    []
  );

  const thinDrawings = useMemo(
    () => [
      'C3P0',
      'Vader',
      'Afrodita',
      'Mazinger',
      'Cylon 78',
      'Cylon 03',
      'Iron Man 68',
      'Iron Man 08',
      'Cyberman',
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

  const mega = useMemo(
    () => ({
      first_contact: [
        { title: '', items: [CONTROL_TILE_BN, 'NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'Plasma Escape', "Vulcan's End", 'The Phoenix', CONTROL_TILE_ARROWS] },
      ],
      the_human_inside: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            ...thinWindowItems,
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      austen: [
        { title: '', items: [CONTROL_TILE_BN, 'NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'Plasma Escape', "Vulcan's End", 'The Phoenix', CONTROL_TILE_ARROWS] },
      ],
      cube: [
        { title: '', items: [CONTROL_TILE_BN, 'NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'Plasma Escape', "Vulcan's End", 'The Phoenix', CONTROL_TILE_ARROWS] },
      ],
      outcasted: [
        { title: '', items: [CONTROL_TILE_BN, 'NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'Plasma Escape', "Vulcan's End", 'The Phoenix', CONTROL_TILE_ARROWS] },
      ],
    }),
    [thinWindowItems]
  );

  useEffect(() => {
    const readControls = () => {
      try {
        const enabled = isManualLockEnabled();
        setDemoManualEnabled((prev) => (prev === enabled ? prev : enabled));
      } catch {
        setDemoManualEnabled((prev) => (prev === false ? prev : false));
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (
        e.key === 'NIKE_DEMO_MANUAL' ||
        e.key === 'NIKE_DEMO_PHASE' ||
        e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' ||
        e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE'
      ) {
        readControls();
      }
    };

    const onFullWideLocalChange = () => readControls();

    const onLocalChange = () => {
      readControls();
    };

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onFullWideLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onFullWideLocalChange);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (demoManualEnabled || isManualLockEnabled()) return;
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

    const GAP_PX = 12; // gap-x-3
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
      setMegaTileSize(Math.round(colW));
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
    if (!demoManualEnabled) return;
    setActive((prev) => (prev == null ? 'first_contact' : prev));
  }, [demoManualEnabled]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
      className="fixed z-[10000] bg-background"
      style={{ top: 'var(--appHeaderOffset, 0px)', left: 'var(--rulerInset, 0px)', right: 0 }}
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
                  maskSize: 'contain'
                }}
              />
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {nav.map((item) => {
              const open = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-expanded={open ? 'true' : 'false'}
                  onMouseEnter={() => setActive(item.id)}
                  onFocus={() => setActive(item.id)}
                  onClick={() => setActive((prev) => (prev === item.id ? null : item.id))}
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1" data-icons-wrap="true">
            <IconButton label="Search" onClick={() => {}}>
              <svg className="h-[25px] w-[25px] text-foreground -translate-x-[1px] lg:h-[29px] lg:w-[29px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </IconButton>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  onCartClick?.();
                }, 320);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = null;
                navigate('/cart');
              }}
              aria-label="Cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10"
            >
              <span aria-hidden="true" className="relative block h-[27px] w-[27px] transition-all duration-200 lg:h-[31px] lg:w-[31px]">
                <span
                  className="absolute inset-0"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/basket-full-2.svg' : '/custom_logos/icons/basket-empty.svg'})`,
                    maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/basket-full-2.svg' : '/custom_logos/icons/basket-empty.svg'})`,
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
            <IconButton label="Account" onClick={() => onUserClick?.()}>
              <UserRound className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={1.5} />
            </IconButton>
          </div>
        </div>
      </div>

      {canUseDom && createPortal(
        active ? (
          <div
            className="fixed inset-0 z-[9990] bg-foreground/25"
            onClick={() => {
              if (demoManualEnabled || isManualLockEnabled()) return;
              setActive(null);
            }}
          />
        ) : null,
        document.body
      )}

      <div
        className="relative"
        onMouseLeave={() => {
          if (demoManualEnabled || isManualLockEnabled()) return;
          setActive(null);
        }}
      >
        {active ? (
          <div className="hidden lg:block border-b border-border bg-background">
            <div
              ref={megaMenuRef}
              className="mx-auto max-w-[1400px] overflow-x-hidden px-4 sm:px-6 lg:px-10 py-8"
            >
              <div className="grid grid-cols-1 gap-10">
                {(mega[active] || []).map((col, idx) => (
                  <MegaColumn
                    key={`${active}-${idx}`}
                    title={col.title}
                    isFirstContact={active === 'first_contact' || active === 'austen' || active === 'cube' || active === 'outcasted'}
                    isHumanInside={active === 'the_human_inside'}
                    megaTileSize={megaTileSize}
                    humanInsideVariant={humanInsideVariant}
                    items={col.items}
                    row={true}
                    firstContactVariant={firstContactVariant}
                    onFirstContactWhite={() => setFirstContactVariant('white')}
                    onFirstContactBlack={() => setFirstContactVariant('black')}
                    onHumanWhite={() => setHumanInsideVariant('white')}
                    onHumanBlack={() => setHumanInsideVariant('black')}
                    onHumanPrev={() => setThinStartIndex((v) => v - 1)}
                    onHumanNext={() => setThinStartIndex((v) => v + 1)}
                  />
                ))}
              </div>

              <MegaStripeCatalogPanel
                megaTileSize={megaTileSize}
                StripeButtonsComponent={AdidasColorStripeButtons}
                stripeProps={{
                  selectedColorOrder,
                  selectedColorSlug,
                  onSelect: setSelectedColorSlug,
                  colorLabelBySlug,
                  colorButtonSrcBySlug,
                  itemLeftOffsetPxByIndex: stripeItemLeftOffsetPxByIndex,
                  redistributeBetweenFirstAndLast: redistributeStripeBetweenFirstAndLast,
                  firstOffsetPx: -20,
                  lastOffsetPx: 63,
                  cropFirstRightPx: 20,
                  compressFactor: 0.79,
                  forceDebugStripeHit: forceStripeDebugHit,
                  ignoreUrlDebugStripeHit: ignoreStripeDebugFromUrl,
                }}
                CatalogPanelComponent={AdidasCatalogPanel}
              />
            </div>
          </div>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="lg:hidden border-b border-border bg-background">
          <div className="px-4 py-4 grid gap-2">
            {nav.map((item) => (
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
                {(mega[active] || []).map((col) => (
                  <div key={col.title} className="rounded-2xl bg-muted p-4">
                    <div
                      ref={active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? mobileHumanScrollRef : undefined}
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
                      {(active === 'the_human_inside' ? col.items : col.items.slice(0, 9)).map((it, idx) => (
                          <div key={`${it}-${idx}`} className="min-w-0">
                            {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
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
                                      firstContactVariant === 'white'
                                        ? 'bg-foreground'
                                        : 'bg-transparent'
                                    }`}
                                  />
                                ) : null}
                                <OptimizedImg
                                  src={FIRST_CONTACT_MEDIA[it]}
                                  alt={it}
                                  className={
                                    it === 'The Phoenix'
                                      ? 'relative z-10 h-full w-full object-contain scale-[0.825]'
                                      : it === 'NX-01'
                                        ? 'relative z-10 h-full w-full object-contain scale-[0.47]'
                                        : it === 'NCC-1701'
                                          ? 'relative z-10 h-full w-full object-contain scale-[0.75]'
                                          : it === 'NCC-1701-D'
                                            ? 'relative z-10 h-full w-full object-contain scale-100'
                                          : it === 'Wormhole'
                                            ? 'relative z-10 h-full w-full object-contain scale-[0.54]'
                                          : it === 'Plasma Escape'
                                            ? 'relative z-10 h-full w-full object-contain scale-[0.54]'
                                          : it === "Vulcan's End"
                                            ? 'relative z-10 h-full w-full object-contain scale-[0.66]'
                                          : 'relative z-10 h-full w-full object-contain scale-[0.6]'
                                  }
                                />

                                {idx >= 1 && idx <= 7 && firstContactVariant === 'white' ? (
                                  <OptimizedImg
                                    src={FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                                    alt={it}
                                    className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                                      firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                                    } ${
                                      it === 'The Phoenix'
                                        ? 'scale-[0.825]'
                                        : it === 'NX-01'
                                          ? 'scale-[0.47]'
                                          : it === 'NCC-1701'
                                            ? 'scale-[0.75]'
                                            : it === 'NCC-1701-D'
                                              ? 'scale-100'
                                            : it === 'Wormhole'
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
                                <FirstContactDibuix00Buttons onWhite={() => setHumanInsideVariant('white')} onBlack={() => setHumanInsideVariant('black')} />
                              ) : (
                                <FirstContactDibuix00Buttons onWhite={() => setFirstContactVariant('white')} onBlack={() => setFirstContactVariant('black')} />
                              )
                            ) : it === CONTROL_TILE_ARROWS ? (
                              <FirstContactDibuix09Buttons
                                tileSize={120}
                                onPrev={
                                  active === 'the_human_inside'
                                    ? () => setThinStartIndex((v) => v - 1)
                                    : () => {}
                                }
                                onNext={
                                  active === 'the_human_inside'
                                    ? () => setThinStartIndex((v) => v + 1)
                                    : () => {}
                                }
                              />
                            ) : (
                              <div className="mt-2 aspect-square w-full rounded-md bg-muted" />
                            )}
                          </div>
                        ))}
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
