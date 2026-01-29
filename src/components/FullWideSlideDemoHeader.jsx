import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserRound, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getGildan5000Catalog } from '../utils/placeholders.js';
import { useProductContext } from '@/contexts/ProductContext';
import AdidasColorStripeButtons from './AdidasColorStripeButtons.jsx';
import AdidasCatalogPanel from './AdidasCatalogPanel.jsx';
import MegaStripeCatalogPanel from './MegaStripeCatalogPanel.jsx';
import FullWideSlideDemoHumanInsideSlider from './FullWideSlideDemoHumanInsideSlider.jsx';

const FIRST_CONTACT_MEDIA = {
  'NX-01': '/custom_logos/drawings/first_contact/negre/1-nx-01-b.webp',
  'NCC-1701': '/custom_logos/drawings/first_contact/negre/2-ncc-1701-b.webp',
  'NCC-1701-D': '/custom_logos/drawings/first_contact/negre/3-ncc-1701-d-b.webp',
  'Wormhole': '/custom_logos/drawings/first_contact/negre/4-wormhole-b.webp',
  'Plasma Escape': '/custom_logos/drawings/first_contact/negre/5-plasma-escape-b.webp',
  "Vulcan's End": '/custom_logos/drawings/first_contact/negre/6-vulcans-end-b.webp',
  'The Phoenix': '/custom_logos/drawings/first_contact/negre/7-the-phoenix-b.webp',
};

const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

const FIRST_CONTACT_MEDIA_WHITE = {
  'NX-01': '/custom_logos/drawings/first_contact/blanc/1-nx-01-w.webp',
  'NCC-1701': '/custom_logos/drawings/first_contact/blanc/2-ncc-1701-w.webp',
  'NCC-1701-D': '/custom_logos/drawings/first_contact/blanc/3-ncc-1701-d-w.webp',
  'Wormhole': '/custom_logos/drawings/first_contact/blanc/4-wormhole-w.webp',
  'Plasma Escape': '/custom_logos/drawings/first_contact/blanc/5-plasma-escape-w.webp',
  "Vulcan's End": '/custom_logos/drawings/first_contact/blanc/6-vulcans-end-w.webp',
  'The Phoenix': '/custom_logos/drawings/first_contact/blanc/7-the-phoenix-w.webp',
};

const THE_HUMAN_INSIDE_MEDIA = {
  'C3P0': '/custom_logos/drawings/the_human_inside/negre/7-c3p0-b4.webp',
  'Vader': '/custom_logos/drawings/the_human_inside/negre/8-vader-b4.webp',
  'Afrodita': '/custom_logos/drawings/the_human_inside/negre/9-afrodita-a-b3.webp',
  'Mazinger': '/custom_logos/drawings/the_human_inside/negre/10-mazinger-b4.webp',
  'Cylon 78': '/custom_logos/drawings/the_human_inside/negre/11-cylon-78-b4.webp',
  'Cylon 03': '/custom_logos/drawings/the_human_inside/negre/12-cylon-03-b1.webp',
  'Iron Man 68': '/custom_logos/drawings/the_human_inside/negre/13-iron-man-68-b1.webp',
  'Iron Man 08': '/custom_logos/drawings/the_human_inside/negre/14-ironman-08-b4.webp',
  'Cyberman': '/custom_logos/drawings/the_human_inside/negre/15-cyberman-b4.webp',
  'Maschinenmensch': '/custom_logos/drawings/the_human_inside/negre/16-maschinenmensch-b1.webp',
  'Robocop': '/custom_logos/drawings/the_human_inside/negre/17-robocop-b4.webp',
  'Terminator': '/custom_logos/drawings/the_human_inside/negre/18-terminator-b4.webp',
  'Robbie the Robot': '/custom_logos/drawings/the_human_inside/negre/19-robbie-the-robot-b1.webp',
};

const THE_HUMAN_INSIDE_MEDIA_WHITE = {
  'C3P0': '/custom_logos/drawings/the_human_inside/blanc/7-c3p0-w1.webp',
  'Vader': '/custom_logos/drawings/the_human_inside/blanc/8-vader-w4.webp',
  'Afrodita': '/custom_logos/drawings/the_human_inside/blanc/9-afrodita-w4.webp',
  'Mazinger': '/custom_logos/drawings/the_human_inside/blanc/10-mazinger-w1.webp',
  'Cylon 78': '/custom_logos/drawings/the_human_inside/blanc/11-cylon-78-w4.webp',
  'Cylon 03': '/custom_logos/drawings/the_human_inside/blanc/12-cylon-03-w3.webp',
  'Iron Man 68': '/custom_logos/drawings/the_human_inside/blanc/13-iron-man-68-w4.webp',
  'Iron Man 08': '/custom_logos/drawings/the_human_inside/blanc/14-iron-man-08-w4.webp',
  'Cyberman': '/custom_logos/drawings/the_human_inside/blanc/15-cyberman-w1.webp',
  'Maschinenmensch': '/custom_logos/drawings/the_human_inside/blanc/16-maschinenmensch-w1.webp',
  'Robocop': '/custom_logos/drawings/the_human_inside/blanc/17-robocop-w3.webp',
  'Terminator': '/custom_logos/drawings/the_human_inside/blanc/18-terminator-w1.webp',
  'Robbie the Robot': '/custom_logos/drawings/the_human_inside/blanc/19-robbie-the-robot-w2.webp',
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
  const iconH = tileSize ? Math.round(tileSize * 0.3) : 48;
  const iconW = tileSize ? Math.round(tileSize * 0.15) : 24;

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
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground"
            style={{ height: `${iconH}px`, width: `${iconW}px` }}
            strokeWidth={1.5}
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
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground"
            style={{ height: `${iconH}px`, width: `${iconW}px` }}
            strokeWidth={1.5}
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
  isFirstContact = false,
  isHumanInside = false,
  collectionId,
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
  const humanInsideEnabled = Boolean(isHumanInside);
  const effectiveTileSize = megaTileSize || tileSize;

  const effectiveItems = useMemo(() => {
    const list = Array.isArray(items) ? items.slice() : [];
    if (collectionId !== 'outcasted') return list.filter(Boolean);
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    const filtered = list.filter((it) => {
      if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
      if (typeof it !== 'string') return false;
      if (it.startsWith('black/')) return variant !== 'white';
      if (it.startsWith('white/')) return variant === 'white';
      return true;
    });
    const bn = filtered.includes(CONTROL_TILE_BN) ? CONTROL_TILE_BN : null;
    const arrows = filtered.includes(CONTROL_TILE_ARROWS) ? CONTROL_TILE_ARROWS : null;
    const drawings = filtered.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
    const padded = drawings.slice(0, 7);
    while (padded.length < 7) padded.push(null);
    return [bn, ...padded, arrows];
  }, [items, collectionId, isHumanInside, humanInsideVariant, firstContactVariant]);

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
    return effectiveItems.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [effectiveItems]);

  const outcastedStripeTiles = collectionId === 'outcasted' ? Math.max(0, Math.min(7, baseItems.length)) : 7;

  const thinSlideEnabled = row && baseItems.length > 7;

  const isPathItem = (it) => typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);

  const deriveVariantPath = (p, variant) => {
    if (typeof p !== 'string') return null;
    if (!isPathItem(p)) return null;
    let next = p;
    if (!variant || variant === 'black') {
      if (next.includes('/white/')) next = next.replace('/white/', '/black/');
      if (next.includes('/blanc/')) next = next.replace('/blanc/', '/negre/');
      if (/-w\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-w\.(png|jpg|jpeg|webp)$/i, '-b.$1');
      return next;
    }
    if (next.includes('/black/')) next = next.replace('/black/', '/white/');
    if (next.includes('/negre/')) next = next.replace('/negre/', '/blanc/');
    if (/-b\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-b\.(png|jpg|jpeg|webp)$/i, '-w.$1');
    return next;
  };

  const labelForItem = (it) => {
    if (typeof it !== 'string') return '';
    if (!isPathItem(it)) return it;
    const seg = it.split('/').filter(Boolean);
    const base = seg.length ? seg[seg.length - 1] : it;
    return base.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/[-_]+/g, ' ');
  };

  const resolveSrc = (it) => {
    if (!it) return null;
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    if (isPathItem(it) && collectionId) {
      const vPath = deriveVariantPath(it, variant) || it;
      return `/custom_logos/drawings/${collectionId}/${vPath}`;
    }
    if (FIRST_CONTACT_MEDIA[it]) return variant === 'white' ? (FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]) : FIRST_CONTACT_MEDIA[it];
    const humanSrc = (variant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it];
    return humanSrc || null;
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
                {effectiveItems.map((it, idx) => (
                  <div
                    key={`${it}-${idx}`}
                    className="min-w-0 relative z-10"
                    style={humanInsideEnabled && effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}
                  >
                    {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                      <div className="h-4" />
                    ) : (
                      collectionId === 'outcasted' && isPathItem(it) ? (
                        <div className="h-4" />
                      ) : (
                      <Link
                        to="#"
                        className="relative z-40 flex h-4 w-full items-center justify-center whitespace-nowrap rounded-none bg-muted px-2 text-xs leading-4 text-muted-foreground hover:text-foreground"
                      >
                        {labelForItem(it)}
                      </Link>
                      )
                    )}

                    {!it ? null : resolveSrc(it) ? (
                      <div className="relative z-10 mt-2 aspect-square w-full overflow-hidden" ref={idx === 1 ? tileSizeRef : undefined}>
                        <OptimizedImg
                          src={resolveSrc(it)}
                          alt={collectionId === 'outcasted' && isPathItem(it) ? '' : labelForItem(it) || it}
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

                        {FIRST_CONTACT_MEDIA[it] && idx >= 1 && idx <= 7 && firstContactVariant === 'white' ? (
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
                    ) : it === CONTROL_TILE_BN ? (
                      <div className="relative z-40">
                        {isFirstContact ? (
                          <FirstContactDibuix00Buttons onWhite={onFirstContactWhite} onBlack={onFirstContactBlack} />
                        ) : isHumanInside ? (
                          <FirstContactDibuix00Buttons onWhite={onHumanWhite} onBlack={onHumanBlack} />
                        ) : null}
                      </div>
                    ) : it === CONTROL_TILE_ARROWS ? (
                      <div
                        className={`relative z-40 ${thinSlideEnabled ? '' : 'opacity-30 pointer-events-none'}`}
                        aria-hidden={thinSlideEnabled ? undefined : true}
                      >
                        <FirstContactDibuix09Buttons
                          tileSize={tileSize}
                          onPrev={() => {
                            if (thinSlideEnabled) return;
                            if (isHumanInside && !humanInsideEnabled && onHumanPrev) return onHumanPrev();
                          }}
                          onNext={() => {
                            if (thinSlideEnabled) return;
                            if (isHumanInside && !humanInsideEnabled && onHumanNext) return onHumanNext();
                          }}
                        />
                      </div>
                    ) : collectionId === 'outcasted' ? null : (
                      <div className="mt-2 aspect-square w-full rounded-md bg-muted" ref={idx === 1 ? tileSizeRef : undefined} />
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
      outcasted: 'Outcasted',
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
  const megaSliderIndex = Math.max(0, Math.min(MEGA_SLIDES_COUNT - 1, (megaPage || 1) - 1));
  const [active, setActive] = useState(() => {
    if (contained) return initialActiveId || 'first_contact';
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1' ? 'first_contact' : null;
    } catch {
      return null;
    }
  });
  const forceStripeDebugHit = false;
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

  const defaultNav = useMemo(
    () => [
      { id: 'first_contact', label: 'First Contact' },
      { id: 'the_human_inside', label: 'The Human Inside' },
      { id: 'austen', label: 'Austen' },
      { id: 'cube', label: 'Cube' },
      { id: 'outcasted', label: 'Outcasted' },
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
          items: [CONTROL_TILE_BN, ...thinWindowItems, CONTROL_TILE_ARROWS],
        },
      ],
      austen: [
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
      cube: [
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
      outcasted: [
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
    return out;
  }, [defaultMega, megaConfig]);

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
      className={`${contained ? 'relative' : 'fixed'} z-[10000] bg-background`}
      style={
        contained
          ? { top: 0, left: 0, right: 0 }
          : { top: 'var(--appHeaderOffset, 0px)', left: 'var(--rulerInset, 0px)', right: 0 }
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

          <div className="ml-auto flex items-center gap-1" data-icons-wrap="true">
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
          <div className="hidden lg:block border-b border-border bg-background">
            <div
              ref={megaMenuRef}
              className="mx-auto max-w-[1400px] overflow-x-hidden px-4 sm:px-6 lg:px-10 py-8"
            >
              <div
                className="overflow-hidden"
                style={megaTileSize ? { height: `${Math.round(megaTileSize * 2 + 37)}px` } : undefined}
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
                          items={col.items}
                          row={true}
                          firstContactVariant={firstContactVariant}
                          onFirstContactWhite={() => setFirstContactVariant('white')}
                          onFirstContactBlack={() => setFirstContactVariant('black')}
                          onHumanWhite={() => setFirstContactVariant('white')}
                          onHumanBlack={() => setFirstContactVariant('black')}
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
                        <div className="relative z-10 min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
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
                                        className="group w-[220px] shrink-0 overflow-hidden rounded-md bg-transparent snap-start"
                                      >
                                        <div className="aspect-square w-full bg-muted">
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
                                <FirstContactDibuix00Buttons onWhite={() => setHumanInsideVariant('white')} onBlack={() => setHumanInsideVariant('black')} />
                              ) : (
                                <FirstContactDibuix00Buttons onWhite={() => setFirstContactVariant('white')} onBlack={() => setFirstContactVariant('black')} />
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
