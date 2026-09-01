import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import CercadorTopBar, { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import CercadorTextRow from '../fullwide/CercadorTextRow.jsx';
import MegaStripePanel from '../fullwide/MegaStripePanel.jsx';
import MegaHeroSlider from '../MegaHeroSlider.jsx';
import Pauta4ColsOverlay from '../pauta/Pauta4ColsOverlay';
import useMegaslideCalibration from '@/hooks/useMegaslideCalibration';
import {
  CONTROL_TILE_BN,
  CONTROL_TILE_ARROWS,
} from '../fullwide/MegaColumn.jsx';
import { FirstContactDibuix00Buttons } from '../fullwide/firstContactPanels.jsx';
import { computeStripeTileOverlaySrcs, computeStripeTileItems } from '@/utils/resolveStripeTile.js';

export default function MegaslidePagina2({
  active,
  isPortraitTablet = false,
  megaPage = 2,
  setActive,
  austenSubcollection,
  setAustenSubcollection,
  cercadorSelectedColor,
  setCercadorSelectedColor,
  firstContactSelectedItem,
  humanInsideSelectedItem,
  selectedItemByCollection,
  hoveredStripeItem,
  setHoveredStripeItem,
  hoveredStripeItemCollection,
  setHoveredStripeItemCollection,
  setStripeOverlayOverrideActive,
  setFirstContactSelectedItem,
  setHumanInsideSelectedItem,
  setSelectedItemByCollection,
  megaHeroGridRef,
  megaHeroRowHeight,
  stripeBaseImageSrc,
  resolvedMegaFiltered,
  showStripe,
  stripeOverlayLoadState,
  resolvedOverlaySrc,
  stripeOverlayDebug,
  stripeMaskDebugRectsPct,
  stripeMaskTileRectsRawPct,
  drawingOverlayDebug,
  humanInsideVariant,
  firstContactVariant,
  reorderAustenQuotes,
  austenSelectedDisableMulti,
  stripeVariantVisibility,
  setFirstContactVariant,
  setHumanInsideVariant,
  setThinStartIndex,
  displayedShirtColor,
  onShirtClick,
  thinDrawings,
  megaMenuRef,
}) {
  const viewportRef = useRef(null);
  const portraitContentRef = useRef(null);
  const calibrationRef = isPortraitTablet ? portraitContentRef : megaMenuRef;
  const cal = useMegaslideCalibration('p2', active, calibrationRef);
  const {
    stripeRowPadPx,
    stripeRowPadXPx,
    stripePreviewHPx,
    megaStripeSpriteEnabledLocal,
    megaStripeRefEnabledLocal,
    megaStripeRefSrcLocal,
    megaStripeRef2EnabledLocal,
    megaStripeRef2SrcLocal,
    megaShirtDrawingEnabledLocal,
    drawingOverlaySrcEffective,
    tileGapPxLocal,
    megaTileSelectorParams,
    onStartSelectorDrag,
    megaTileSize,
    normalizeOverlaySrc,
  } = cal;

  const bnSliderSize = megaTileSize || 120;
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltStatus, setTiltStatus] = useState('idle');
  const snapTimerRef = useRef(0);
  const neutralGammaRef = useRef(null);
  const tiltDeltaRef = useRef(0);

  const getActiveViewport = useCallback(() => {
    if (typeof document === 'undefined') return viewportRef.current;
    return document.querySelector(`[data-mega-page-viewport="${megaPage}"]`) || viewportRef.current;
  }, [megaPage]);

  const updateScrollProgress = useCallback(() => {
    const viewport = getActiveViewport();
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setScrollProgress(maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0);
  }, [getActiveViewport]);

  const scrollToProgress = useCallback((progress, behavior = 'smooth') => {
    const viewport = getActiveViewport();
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTo({ left: maxScroll * Math.min(1, Math.max(0, progress)), behavior });
  }, [getActiveViewport]);

  const handlePortraitScroll = useCallback(() => {
    updateScrollProgress();
    window.clearTimeout(snapTimerRef.current);
    snapTimerRef.current = window.setTimeout(() => {
      if (Math.abs(tiltDeltaRef.current) > 3) return;
      const viewport = getActiveViewport();
      if (!viewport) return;
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (maxScroll <= 0) return;
      const snapStep = maxScroll / 4;
      viewport.scrollTo({ left: Math.round(viewport.scrollLeft / snapStep) * snapStep, behavior: 'smooth' });
    }, 180);
  }, [getActiveViewport, updateScrollProgress]);

  useLayoutEffect(() => {
    const viewport = getActiveViewport();
    if (!viewport) return undefined;
    if (!isPortraitTablet) {
      viewport.scrollLeft = 0;
      setScrollProgress(0);
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      scrollToProgress(0, 'auto');
      updateScrollProgress();
    });
    return () => cancelAnimationFrame(frame);
  }, [active, isPortraitTablet, megaPage, getActiveViewport, scrollToProgress, updateScrollProgress]);

  useEffect(() => {
    if (!isPortraitTablet) return undefined;
    const viewport = getActiveViewport();
    if (!viewport) return undefined;
    viewport.addEventListener('scroll', handlePortraitScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handlePortraitScroll);
  }, [isPortraitTablet, megaPage, getActiveViewport, handlePortraitScroll]);

  useEffect(() => () => window.clearTimeout(snapTimerRef.current), []);

  useEffect(() => {
    if (!isPortraitTablet || !tiltEnabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTiltEnabled(false);
      setTiltStatus('reduced-motion');
      return undefined;
    }

    neutralGammaRef.current = null;
    tiltDeltaRef.current = 0;
    let frame = 0;
    const handleOrientation = (event) => {
      if (!Number.isFinite(event.gamma)) return;
      if (neutralGammaRef.current == null) neutralGammaRef.current = event.gamma;
      tiltDeltaRef.current = event.gamma - neutralGammaRef.current;
    };
    const tick = () => {
      const viewport = getActiveViewport();
      const delta = tiltDeltaRef.current;
      if (viewport && Math.abs(delta) > 3) {
        const velocity = Math.sign(delta) * Math.min(10, (Math.abs(delta) - 3) * 0.45);
        viewport.scrollLeft += velocity;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(frame);
      neutralGammaRef.current = null;
      tiltDeltaRef.current = 0;
    };
  }, [isPortraitTablet, tiltEnabled, getActiveViewport]);

  useEffect(() => {
    if (!isPortraitTablet) {
      setTiltEnabled(false);
      setTiltStatus('idle');
    }
  }, [isPortraitTablet]);

  const toggleTilt = useCallback(async () => {
    if (tiltEnabled) {
      setTiltEnabled(false);
      setTiltStatus('idle');
      return;
    }
    const OrientationEvent = window.DeviceOrientationEvent;
    if (!OrientationEvent) {
      setTiltStatus('unsupported');
      return;
    }
    try {
      if (typeof OrientationEvent.requestPermission === 'function') {
        const permission = await OrientationEvent.requestPermission();
        if (permission !== 'granted') {
          setTiltStatus('denied');
          return;
        }
      }
      setTiltStatus('active');
      setTiltEnabled(true);
    } catch {
      setTiltStatus('denied');
    }
  }, [tiltEnabled]);

  const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;

  const drawable = useMemo(() => {
    const cols = resolvedMegaFiltered?.[active];
    if (!Array.isArray(cols) || cols.length === 0) return [];
    const items = cols[0]?.items || [];
    const d = active === 'the_human_inside'
      ? (Array.isArray(thinDrawings) ? thinDrawings : [])
      : items.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
    return Array.isArray(d) ? d : [];
  }, [resolvedMegaFiltered, active, thinDrawings]);

  const stripeTileOverlaySrcs = useMemo(() => {
    if (drawable.length === 0) return null;
    return computeStripeTileOverlaySrcs({
      drawable,
      variant,
      active,
      displayedShirtColor,
      resolvedOverlaySrc,
    });
  }, [drawable, variant, active, displayedShirtColor, resolvedOverlaySrc]);

  const stripeTileItems = useMemo(() => {
    if (drawable.length === 0) return null;
    return computeStripeTileItems(drawable);
  }, [drawable]);

  const emptyTileIndices = useMemo(() => {
    if (!Array.isArray(stripeTileItems)) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => { if (!it) out.push(i); });
    return out;
  }, [stripeTileItems]);

  const clicAreaHighlightIndices = useMemo(() => {
    if (!hoveredStripeItem || !Array.isArray(stripeTileItems)) return [];
    const distinct = new Set(stripeTileItems.filter(Boolean));
    if (distinct.size <= 1) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => { if (it === hoveredStripeItem) out.push(i); });
    return out;
  }, [hoveredStripeItem, stripeTileItems]);

  const neckDotIndices = useMemo(() => {
    if (!Array.isArray(stripeTileItems)) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => { if (it && it === hoveredStripeItem) out.push(i); });
    return out;
  }, [stripeTileItems, hoveredStripeItem]);

  const stripeEmptyMaskSrc = null;

  return (
    <div style={{ width: '25%', flexShrink: 0, display: isPortraitTablet ? 'block' : 'flex', height: '100%', position: 'relative', justifyContent: 'center', overflow: isPortraitTablet ? 'hidden' : 'visible' }}>
      {isPortraitTablet && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: 0,
          bottom: '8px',
          left: '8px',
          right: '8px',
          boxShadow: '0 0 0 9999px #ffffff',
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      )}
      {isPortraitTablet && (
        <div
          ref={portraitContentRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 'min(1350px, calc(100vh - 15px))',
            height: 1,
            boxSizing: 'border-box',
            padding: '32px 40px',
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={viewportRef}
        data-mega-page-viewport="2"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: isPortraitTablet ? 'flex-start' : 'center',
          overflowX: isPortraitTablet ? 'auto' : 'visible',
          overflowY: isPortraitTablet ? 'hidden' : 'visible',
          overscrollBehaviorX: isPortraitTablet ? 'contain' : undefined,
          WebkitOverflowScrolling: isPortraitTablet ? 'touch' : undefined,
          scrollbarWidth: isPortraitTablet ? 'thin' : undefined,
          touchAction: isPortraitTablet ? 'pan-x pinch-zoom' : undefined,
        }}
      >
        <div style={{
          flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
        }} />

        <div
          style={{
          flex: '0 0 auto',
          width: isPortraitTablet ? 'min(1350px, calc(100vh - 32px))' : 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
          maxWidth: 'none',
          position: 'relative',
          height: '100%',
          paddingLeft: '0px',
          paddingRight: '0px',
        }}>
        {/* Slider B/N/C vertical — cantó esquerre, alçada barra grisa */}
        {active ? (
          <div style={{
            position: 'absolute',
            top: 'calc(var(--hg-cercador-bar-top, 0px) + 45px)',
            left: '40px',
            width: `${bnSliderSize}px`,
            height: `${bnSliderSize}px`,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FirstContactDibuix00Buttons
              onWhite={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('white') : setFirstContactVariant('white'); }}
              onBlack={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('black') : setFirstContactVariant('black'); }}
              onMulti={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('color') : setFirstContactVariant('color'); }}
              showWhite={stripeVariantVisibility?.white !== false}
              showBlack={stripeVariantVisibility?.black !== false}
              showMulti={stripeVariantVisibility?.color !== false}
              selectedVariant={active === 'the_human_inside' ? humanInsideVariant : firstContactVariant}
            />
          </div>
        ) : null}

        {/* CercadorTopBar */}
        <div style={{
          position: 'absolute',
          top: 'var(--hg-cercador-bar-top, 0px)',
          left: '50%',
          transform: 'translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))',
          transformOrigin: 'top center',
          width: 'var(--hg-cercador-bar-width, 94%)',
          zIndex: 3,
        }}>
          <CercadorTopBar
            activeCollection={active}
            activeSubcollection={austenSubcollection}
            onSelectCollection={(key) => {
              if (key.includes(':')) {
                const [col, sub] = key.split(':');
                setActive(col);
                setAustenSubcollection(sub);
              } else {
                setActive(key);
                setAustenSubcollection(null);
              }
            }}
            selectedColor={cercadorSelectedColor}
            onSelectColor={setCercadorSelectedColor}
          />
        </div>

        {/* CercadorTextRow */}
        <div style={{
          position: 'absolute',
          top: isPortraitTablet ? 'calc(var(--hg-cercador-bar-top, 0px) + 8px)' : 'var(--hg-cercador-bar-top, 0px)',
          left: '50%',
          transform: 'translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))',
          transformOrigin: 'top center',
          width: 'var(--hg-cercador-bar-width, 94%)',
          zIndex: 3,
          containerType: 'inline-size',
        }}>
          <CercadorTextRow
            activeCollection={active}
            activeSubcollection={austenSubcollection}
            selectedStripeItem={
              active === 'first_contact' ? firstContactSelectedItem
              : active === 'the_human_inside' ? humanInsideSelectedItem
              : (selectedItemByCollection?.[active] ?? null)
            }
            hoveredStripeItem={hoveredStripeItem}
            onSelectGroup={(collection, subcollection, firstStripeItem) => {
              if (collection !== active) setActive(collection);
              if (collection === 'austen') {
                setAustenSubcollection(subcollection);
              } else {
                setAustenSubcollection(null);
              }
              setStripeOverlayOverrideActive(false);
              if (firstStripeItem) {
                if (collection === 'first_contact') {
                  setFirstContactSelectedItem(firstStripeItem);
                } else if (collection === 'the_human_inside') {
                  setHumanInsideSelectedItem(firstStripeItem);
                } else {
                  setSelectedItemByCollection((prev) => ({ ...prev, [collection]: firstStripeItem }));
                }
              }
            }}
            onHoverItem={(stripeItem, collection) => {
              setHoveredStripeItem(stripeItem);
              setHoveredStripeItemCollection(collection);
            }}
            onHoverLeave={() => {
              setHoveredStripeItem(null);
              setHoveredStripeItemCollection(null);
            }}
          />
        </div>

        {/* MegaStripePanel */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <MegaStripePanel
            active={active}
            reserveGridSpace
            stripeImageSrc={stripeBaseImageSrc}
            resolvedMega={resolvedMegaFiltered}
            showStripe={showStripe}
            stripeRowPadPx={stripeRowPadPx}
            stripeRowPadXPx={stripeRowPadXPx}
            stripePreviewHPx={stripePreviewHPx}
            stripeOverlayLoadState={stripeOverlayLoadState}
            resolvedOverlaySrc={resolvedOverlaySrc}
            stripeOverlayDebug={stripeOverlayDebug}
            stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
            megaStripeSpriteEnabledLocal={megaStripeSpriteEnabledLocal}
            megaStripeRefEnabledLocal={megaStripeRefEnabledLocal}
            megaStripeRefSrcLocal={megaStripeRefSrcLocal}
            megaStripeRef2EnabledLocal={megaStripeRef2EnabledLocal}
            megaStripeRef2SrcLocal={megaStripeRef2SrcLocal}
            megaShirtDrawingEnabledLocal={megaShirtDrawingEnabledLocal}
            drawingOverlaySrcEffective={drawingOverlaySrcEffective}
            stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
            drawingOverlayDebug={drawingOverlayDebug}
            tileGapPxLocal={tileGapPxLocal}
            humanInsideVariant={humanInsideVariant}
            firstContactVariant={firstContactVariant}
            reorderAustenQuotes={reorderAustenQuotes}
            austenSelectedDisableMulti={austenSelectedDisableMulti}
            stripeVariantVisibility={stripeVariantVisibility}
            megaTileSelectorParams={megaTileSelectorParams}
            onStartSelectorDrag={onStartSelectorDrag}
            megaTileSize={megaTileSize}
            setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
            setFirstContactVariant={setFirstContactVariant}
            setHumanInsideVariant={setHumanInsideVariant}
            setThinStartIndex={setThinStartIndex}
            setFirstContactSelectedItem={setFirstContactSelectedItem}
            setHumanInsideSelectedItem={setHumanInsideSelectedItem}
            setSelectedItemByCollection={setSelectedItemByCollection}
            normalizeOverlaySrc={normalizeOverlaySrc}
            shirtColor={CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.overlayHex}
            onShirtClick={onShirtClick}
            selectedItem={
              active === 'first_contact' ? firstContactSelectedItem
              : active === 'the_human_inside' ? humanInsideSelectedItem
              : (selectedItemByCollection?.[active] ?? null)
            }
            stripeTileOverlaySrcs={stripeTileOverlaySrcs}
            stripeTileItems={stripeTileItems}
            clicAreaHighlightIndices={clicAreaHighlightIndices}
            neckDotIndices={neckDotIndices}
            emptyTileIndices={emptyTileIndices}
            stripeEmptyMaskSrc={stripeEmptyMaskSrc}
          />
        </div>

        {/* MegaHeroSlider — amagat temporalment
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
          <Pauta4ColsOverlay
            pautaEnabled={false}
            tableEnabled={false}
            numCols={3}
            numRows={24}
            canvasAspect={[2642, 1780]}
            topOffset="76px"
            bottomPadding="0px"
            innerRef={megaHeroGridRef}
          >
            <div
              style={{
                gridColumn: '1 / 4',
                gridRow: '10 / 25',
                position: 'relative',
                left: '-1px',
                top: `calc(-31px - ${megaHeroRowHeight / 2}px)`,
                width: 'calc(100% + 1px)',
                height: 'calc(100% + 2px)',
                transform: 'scale(0.94)',
                transformOrigin: 'center center',
                pointerEvents: 'auto',
              }}
            >
              <MegaHeroSlider
                slides={[
                  { id: 'white-1' },
                  { id: 'white-2' },
                  { id: 'white-3' },
                ]}
                autoplay
                autoplayIntervalMs={8000}
                className="h-full"
                flush
              />
            </div>
          </Pauta4ColsOverlay>
        </div>
        */}
        </div>

        <div style={{
          flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
        }} />
      </div>

      {isPortraitTablet && (
        <div
          style={{
            position: 'fixed',
            left: `calc(50% + ${(megaPage - 2) * 100}vw)`,
            top: 'calc(14.32vh + 176.65px)',
            transform: 'translateX(calc(-50% - 650px))',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px',
            border: '1px solid rgba(71, 80, 89, 0.2)',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            aria-label="Desplaça la stripe cap a l'esquerra"
            onClick={() => scrollToProgress(scrollProgress - 0.25)}
            style={{ width: 28, height: 28, border: 0, borderRadius: '50%', background: '#f3f4f6', color: '#111827', cursor: 'pointer' }}
          >
            ‹
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} aria-label="Posició de la stripe">
            {Array.from({ length: 5 }).map((_, index) => {
              const progress = index / 4;
              const activeDot = Math.round(scrollProgress * 4) === index;
              return (
                <button
                  key={`stripe-scroll-dot-${index}`}
                  type="button"
                  aria-label={`Posició ${index + 1} de 5`}
                  onClick={() => scrollToProgress(progress)}
                  style={{ width: activeDot ? 16 : 6, height: 6, padding: 0, border: 0, borderRadius: 999, background: activeDot ? '#111827' : '#cbd5e1', cursor: 'pointer', transition: 'width 160ms ease, background 160ms ease' }}
                />
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Desplaça la stripe cap a la dreta"
            onClick={() => scrollToProgress(scrollProgress + 0.25)}
            style={{ width: 28, height: 28, border: 0, borderRadius: '50%', background: '#f3f4f6', color: '#111827', cursor: 'pointer' }}
          >
            ›
          </button>
          <button
            type="button"
            aria-pressed={tiltEnabled}
            onClick={toggleTilt}
            title="Controla el desplaçament inclinant la tablet"
            style={{ height: 28, padding: '0 10px', border: '1px solid #e5e7eb', borderRadius: 999, background: tiltEnabled ? '#111827' : '#ffffff', color: tiltEnabled ? '#ffffff' : '#475059', fontFamily: 'Roboto Condensed, sans-serif', fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer' }}
          >
            {tiltStatus === 'active' ? 'INCLINACIÓ ACTIVA' : tiltStatus === 'denied' ? 'PERMÍS DENEGAT' : tiltStatus === 'unsupported' ? 'SENSE SENSOR' : tiltStatus === 'reduced-motion' ? 'MOVIMENT REDUÏT' : 'INCLINACIÓ'}
          </button>
        </div>
      )}
    </div>
  );
}
