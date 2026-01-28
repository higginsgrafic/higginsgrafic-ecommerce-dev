import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FullWideSlideDemoHumanInsideSlider({
  items,
  collectionId,
  megaTileSize,
  isFirstContact,
  isHumanInside,
  humanInsideVariant,
  firstContactVariant,
  variantOverride,
  onFirstContactWhite,
  onFirstContactBlack,
  onHumanWhite,
  onHumanBlack,
  onHumanPrev,
  onHumanNext,
  OptimizedImg,
  FirstContactDibuix00Buttons,
  FirstContactDibuix09Buttons,
  CONTROL_TILE_BN,
  CONTROL_TILE_ARROWS,
  FIRST_CONTACT_MEDIA,
  FIRST_CONTACT_MEDIA_WHITE,
  THE_HUMAN_INSIDE_MEDIA,
  THE_HUMAN_INSIDE_MEDIA_WHITE,
}) {
  const nxImgRef = useRef(null);
  const nccImgRef = useRef(null);
  const [nxScale, setNxScale] = useState(0.75);
  const preloadedSrcRef = useRef(new Set());
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const scrollRowRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackInstant, setTrackInstant] = useState(false);

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
    const variant = variantOverride || (isHumanInside ? humanInsideVariant : firstContactVariant);
    if (isPathItem(it) && collectionId) {
      const vPath = deriveVariantPath(it, variant) || it;
      return `/custom_logos/drawings/${collectionId}/${vPath}`;
    }
    if (FIRST_CONTACT_MEDIA[it]) return variant === 'white' ? (FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]) : FIRST_CONTACT_MEDIA[it];
    return (variant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it] || null;
  };

  const drawingItems = useMemo(
    () => (Array.isArray(items) ? items.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS) : []),
    [items, CONTROL_TILE_BN, CONTROL_TILE_ARROWS]
  );

  const activeVariant = variantOverride || (isHumanInside ? humanInsideVariant : firstContactVariant);

  const humanInsideTotal = Array.isArray(drawingItems) ? drawingItems.length : 0;
  const humanInsideVisible = 7;
  const humanInsideClones = Math.max(1, Math.min(humanInsideVisible, humanInsideTotal || 0));
  const effectiveTileSize = megaTileSize || tileSize;

  const getContainContentHeightPx = (imgEl) => {
    if (!imgEl) return null;
    const w = imgEl.clientWidth;
    const h = imgEl.clientHeight;
    const nw = imgEl.naturalWidth;
    const nh = imgEl.naturalHeight;
    if (!w || !h || !nw || !nh) return null;
    const aspect = nh / nw;
    const containH = Math.min(h, w * aspect);
    return containH;
  };

  useEffect(() => {
    const nxEl = nxImgRef.current;
    const nccEl = nccImgRef.current;
    if (!nxEl || !nccEl) return;

    const recompute = () => {
      const baseScale = 0.75;
      const nxH = getContainContentHeightPx(nxEl);
      const nccH = getContainContentHeightPx(nccEl);
      if (!nxH || !nccH) return;
      const target = nccH * baseScale;
      const next = target / nxH;
      setNxScale(Math.max(0.2, Math.min(1.5, next)));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(nxEl);
    ro.observe(nccEl);
    nxEl.addEventListener('load', recompute);
    nccEl.addEventListener('load', recompute);
    return () => {
      ro.disconnect();
      nxEl.removeEventListener('load', recompute);
      nccEl.removeEventListener('load', recompute);
    };
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    setTrackInstant(true);
    setTrackIndex(humanInsideClones);
  }, [humanInsideClones]);

  const scrollByTiles = (dir) => {
    setTrackInstant(false);
    setTrackIndex((prev) => prev + dir);
  };

  const step = (effectiveTileSize || 160) + 12;
  const clones = humanInsideClones;
  const carouselLength = Math.max(1, humanInsideTotal);
  const baseStart = clones;
  const baseEnd = clones + carouselLength;

  const viewportW = (effectiveTileSize || 160) * humanInsideVisible + 12 * (humanInsideVisible - 1);

  const prefix = drawingItems.slice(-clones).map((it, idx) => ({ it, originalIndex: carouselLength - clones + idx }));
  const main = drawingItems.map((it, idx) => ({ it, originalIndex: idx }));
  const suffix = drawingItems.slice(0, clones).map((it, idx) => ({ it, originalIndex: idx }));
  const trackItems = [...prefix, ...main, ...suffix];

  const x = -trackIndex * step;
  const transition = trackInstant ? { duration: 0 } : { duration: 0.38, ease: [0.32, 0.72, 0, 1] };

  const preloadSrc = (src) => {
    if (!src) return;
    if (preloadedSrcRef.current.has(src)) return;
    preloadedSrcRef.current.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = encodeURI(src);
  };

  useEffect(() => {
    if (!humanInsideTotal) return;
    const baseStartLocal = clones;
    const baseEndLocal = clones + Math.max(1, humanInsideTotal);
    if (trackIndex < baseStartLocal || trackIndex >= baseEndLocal) return;

    const centerOriginalIndex = ((trackIndex - baseStartLocal) % humanInsideTotal + humanInsideTotal) % humanInsideTotal;
    const idxs = [
      centerOriginalIndex - 2,
      centerOriginalIndex - 1,
      centerOriginalIndex,
      centerOriginalIndex + 1,
      centerOriginalIndex + 2,
      centerOriginalIndex + 3,
    ];

    idxs.forEach((raw) => {
      const oi = ((raw % humanInsideTotal) + humanInsideTotal) % humanInsideTotal;
      const it = drawingItems[oi];
      preloadSrc(resolveSrc(it));
    });
  }, [trackIndex, clones, humanInsideTotal, drawingItems, activeVariant]);

  return (
    <div
      ref={scrollRowRef}
      className="relative z-10 overflow-hidden"
      style={effectiveTileSize ? { height: `${effectiveTileSize + 24}px` } : undefined}
    >
      <div className="flex" style={{ gap: '12px' }}>
        <div className="min-w-0" style={effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}>
          <div className="h-4" />
          <div className="relative z-40">
            {isFirstContact ? (
              <FirstContactDibuix00Buttons onWhite={onFirstContactWhite} onBlack={onFirstContactBlack} />
            ) : isHumanInside ? (
              <FirstContactDibuix00Buttons onWhite={onHumanWhite} onBlack={onHumanBlack} />
            ) : null}
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden" style={effectiveTileSize ? { width: `${viewportW}px` } : undefined}>
          <div
            className={`pointer-events-none absolute left-0 right-0 top-6 rounded-md transition-opacity duration-300 ease-in-out ${
              activeVariant === 'white' ? 'bg-foreground opacity-100' : 'bg-transparent opacity-100'
            }`}
            style={effectiveTileSize ? { height: `${effectiveTileSize}px` } : undefined}
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-0 top-0"
            animate={{ x }}
            transition={{ ...transition, type: 'tween' }}
            onAnimationComplete={() => {
              if (trackIndex >= baseEnd) {
                setTrackInstant(true);
                setTrackIndex(baseStart);
                return;
              }
              if (trackIndex < baseStart) {
                setTrackInstant(true);
                setTrackIndex(baseEnd - 1);
                return;
              }
              setTrackInstant(false);
            }}
            style={{ display: 'flex', gap: '12px', willChange: 'transform' }}
          >
            {trackItems.map((slot, trackPos) => {
              const it = slot.it;
              const originalIndex = slot.originalIndex;
              const shouldMeasure = slot.originalIndex === 1 && trackPos >= baseStart && trackPos < baseEnd;

              return (
                <div
                  key={`track-${trackPos}-${it}`}
                  className="min-w-0 relative z-10"
                  style={effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}
                >
                  {!it ? (
                    <div className="h-4" />
                  ) : collectionId === 'outcasted' && isPathItem(it) ? (
                    <div className="h-4" />
                  ) : (
                    <Link
                      to="#"
                      className="relative z-40 flex h-4 w-full items-center justify-center whitespace-nowrap rounded-none bg-muted px-2 text-xs leading-4 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {labelForItem(it)}
                    </Link>
                  )}

                  {resolveSrc(it) ? (
                    <div className="relative z-10 mt-2 aspect-square w-full overflow-hidden" ref={shouldMeasure ? tileSizeRef : undefined}>
                      <OptimizedImg
                        src={resolveSrc(it)}
                        alt={collectionId === 'outcasted' && isPathItem(it) ? '' : labelForItem(it) || it}
                        className={`h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 aspect-square w-full rounded-md bg-black/5" ref={shouldMeasure ? tileSizeRef : undefined} />
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="min-w-0" style={effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}>
          <div className="h-4" />
          <div className="relative z-40">
            <FirstContactDibuix09Buttons
              tileSize={effectiveTileSize}
              onPrev={() => {
                try {
                  if (isHumanInside && onHumanPrev) onHumanPrev();
                } catch {
                  // ignore
                }
                scrollByTiles(-1);
              }}
              onNext={() => {
                try {
                  if (isHumanInside && onHumanNext) onHumanNext();
                } catch {
                  // ignore
                }
                scrollByTiles(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
