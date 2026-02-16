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
  onSelectItem,
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
  const lastDirRef = useRef(0);
  const wrapRafRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const pendingNavDeltaRef = useRef(0);
  const holdTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);

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

    if (!variant || variant === 'black') {
      if (next.includes('/white/')) next = next.replace('/white/', '/black/');
      if (/-w\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-w\.(png|jpg|jpeg|webp)$/i, '-b.$1');
      return next;
    }
    if (next.includes('/black/')) next = next.replace('/black/', '/white/');
    if (/-b\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-b\.(png|jpg|jpeg|webp)$/i, '-w.$1');
    return next;
  }

  const normalizeKey = (value) => {
    if (typeof value !== 'string') return '';
    return value
      .trim()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/\s+/g, ' ');
  };

  const resolveThinPlaceholderSrc = (it) => {
    if (!it || typeof it !== 'string') return null;
    if (collectionId !== 'the_human_inside') return null;

    const key = normalizeKey(it).toLowerCase();
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
    return file ? `/placeholders/images_grid/the_human_inside/${file}` : null;
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
    lastDirRef.current = dir;
    if (wrapRafRef.current) {
      cancelAnimationFrame(wrapRafRef.current);
      wrapRafRef.current = null;
    }

    if (isAnimatingRef.current) {
      pendingNavDeltaRef.current = Math.max(-2, Math.min(2, pendingNavDeltaRef.current + dir));
      return;
    }

    isAnimatingRef.current = true;
    setTrackInstant(false);
    setTrackIndex((prev) => prev + dir);
  };

  const stopHold = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const startHold = (dir) => {
    stopHold();
    scrollByTiles(dir);
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        scrollByTiles(dir);
      }, 160);
    }, 260);
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
    const dir = lastDirRef.current;
    const forwardPad = dir > 0 ? 10 : 6;
    const backwardPad = dir < 0 ? 10 : 6;
    const idxs = [];
    for (let i = -backwardPad; i <= humanInsideVisible - 1 + forwardPad; i += 1) {
      idxs.push(centerOriginalIndex + i);
    }

    idxs.forEach((raw) => {
      const oi = ((raw % humanInsideTotal) + humanInsideTotal) % humanInsideTotal;
      const it = drawingItems[oi];
      const src = resolveThinPlaceholderSrc(it);
      preloadSrc(src);
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
                wrapRafRef.current = requestAnimationFrame(() => {
                  const overflow = trackIndex - baseEnd;
                  setTrackIndex(baseStart + overflow);
                  wrapRafRef.current = requestAnimationFrame(() => {
                    setTrackInstant(false);
                    wrapRafRef.current = null;
                  });
                });
                return;
              }
              if (trackIndex < baseStart) {
                setTrackInstant(true);
                wrapRafRef.current = requestAnimationFrame(() => {
                  const underflow = baseStart - trackIndex;
                  setTrackIndex(baseEnd - underflow);
                  wrapRafRef.current = requestAnimationFrame(() => {
                    setTrackInstant(false);
                    wrapRafRef.current = null;
                  });
                });
                return;
              }

              isAnimatingRef.current = false;
              const queued = pendingNavDeltaRef.current;
              if (queued !== 0) {
                pendingNavDeltaRef.current = queued > 0 ? queued - 1 : queued + 1;
                requestAnimationFrame(() => {
                  scrollByTiles(queued > 0 ? 1 : -1);
                });
              }
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
                      onClick={(e) => {
                        if (typeof onSelectItem !== 'function') return;
                        e.preventDefault();
                        onSelectItem(it);
                      }}
                    >
                      {labelForItem(it)}
                    </Link>
                  )}

                  {resolveThinPlaceholderSrc(it) ? (
                    <div
                      className="relative z-10 mt-2 aspect-square w-full overflow-hidden"
                      ref={shouldMeasure ? tileSizeRef : undefined}
                      onClick={(e) => {
                        if (typeof onSelectItem !== 'function') return;
                        e.preventDefault();
                        onSelectItem(it);
                      }}
                      role={typeof onSelectItem === 'function' ? 'button' : undefined}
                      tabIndex={typeof onSelectItem === 'function' ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (typeof onSelectItem !== 'function') return;
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        onSelectItem(it);
                      }}
                    >
                      <OptimizedImg
                        src={resolveThinPlaceholderSrc(it)}
                        alt={collectionId === 'outcasted' && isPathItem(it) ? '' : labelForItem(it) || it}
                        className="h-full w-full object-cover"
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
                stopHold();
                try {
                  if (isHumanInside && onHumanPrev) onHumanPrev();
                } catch {
                  // ignore
                }
                scrollByTiles(-1);
              }}
              onNext={() => {
                stopHold();
                try {
                  if (isHumanInside && onHumanNext) onHumanNext();
                } catch {
                  // ignore
                }
                scrollByTiles(1);
              }}
              onPrevPointerDown={(e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                } catch {
                  // ignore
                }
                startHold(-1);
              }}
              onPrevPointerUp={(e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                } catch {
                  // ignore
                }
                stopHold();
              }}
              onNextPointerDown={(e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                } catch {
                  // ignore
                }
                startHold(1);
              }}
              onNextPointerUp={(e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                } catch {
                  // ignore
                }
                stopHold();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
