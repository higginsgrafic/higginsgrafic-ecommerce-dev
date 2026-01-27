import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FullWideSlideDemoHumanInsideSlider({
  items,
  megaTileSize,
  isFirstContact,
  isHumanInside,
  humanInsideVariant,
  firstContactVariant,
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
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const scrollRowRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackInstant, setTrackInstant] = useState(false);

  const drawingItems = useMemo(
    () => (Array.isArray(items) ? items.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS) : []),
    [items, CONTROL_TILE_BN, CONTROL_TILE_ARROWS]
  );

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
                  ) : (
                    <Link
                      to="#"
                      className="relative z-40 flex h-4 w-full items-center justify-center whitespace-nowrap rounded-none bg-muted px-2 text-xs leading-4 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {it}
                    </Link>
                  )}

                  {(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it] ? (
                    <div className="relative z-10 mt-2 aspect-square w-full overflow-hidden" ref={shouldMeasure ? tileSizeRef : undefined}>
                      <OptimizedImg
                        src={(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]}
                        alt={it}
                        className={`h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                      />
                    </div>
                  ) : FIRST_CONTACT_MEDIA[it] ? (
                    <div className="relative z-10 mt-2 aspect-square w-full overflow-hidden" ref={shouldMeasure ? tileSizeRef : undefined}>
                      <OptimizedImg
                        src={FIRST_CONTACT_MEDIA[it]}
                        alt={it}
                        className={
                          it === 'The Phoenix'
                            ? 'h-full w-full object-contain'
                            : it === 'NX-01'
                              ? 'h-full w-full object-contain origin-center'
                              : it === 'NCC-1701'
                                ? 'h-full w-full object-contain origin-center'
                                : it === 'NCC-1701-D'
                                  ? 'h-full w-full object-contain'
                                  : it === 'Wormhole' || it === 'Plasma Escape'
                                    ? 'h-full w-full object-contain scale-[0.6]'
                                    : 'h-full w-full object-contain scale-75'
                        }
                        ref={it === 'NX-01' ? nxImgRef : it === 'NCC-1701' ? nccImgRef : undefined}
                        style={
                          it === 'NX-01' ? { transform: `scale(${nxScale})` } : it === 'NCC-1701' ? { transform: 'scale(0.75)' } : undefined
                        }
                      />

                      {originalIndex >= 1 && originalIndex <= 7 && firstContactVariant === 'white' ? (
                        <OptimizedImg
                          src={FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                          alt={it}
                          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                            firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                          } ${it === 'NX-01' || it === 'NCC-1701' ? 'origin-center' : ''} ${
                            it === 'Wormhole' || it === 'Plasma Escape'
                              ? 'scale-[0.6]'
                              : it === 'NX-01' || it === 'NCC-1701' || it === 'NCC-1701-D' || it === 'The Phoenix'
                                ? ''
                                : 'scale-75'
                          }`}
                          style={
                            it === 'NX-01' ? { transform: `scale(${nxScale})` } : it === 'NCC-1701' ? { transform: 'scale(0.75)' } : undefined
                          }
                        />
                      ) : null}
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
                if (isHumanInside && onHumanPrev) return onHumanPrev();
                return scrollByTiles(-1);
              }}
              onNext={() => {
                if (isHumanInside && onHumanNext) return onHumanNext();
                return scrollByTiles(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
