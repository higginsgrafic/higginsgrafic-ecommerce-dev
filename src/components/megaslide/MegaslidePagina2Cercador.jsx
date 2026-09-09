import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
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

export default function MegaslidePagina2Cercador({
  active,
  isPortraitTablet = false,
  isLandscapeTablet = false,
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
  page1MegaTileSize,
  page1StripePreviewHPx,
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
  const calibrationRef = megaMenuRef;
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

  const portraitMegaTileSize = Math.min((1350 - (8 * 12)) / 9, 144);
  const compactMegaTileSize = page1MegaTileSize || megaTileSize;
  const compactStripePreviewHPx = page1StripePreviewHPx || 117;
  const bnSliderSize = 123;
  const [stripeVisualAlignmentY, setStripeVisualAlignmentY] = useState(0);
  const [topVisualAlignmentY, setTopVisualAlignmentY] = useState(0);
  const snapTimerRef = useRef(0);
  const neutralGammaRef = useRef(null);
  const tiltDeltaRef = useRef(0);


  const scrollToProgress = useCallback((progress, behavior = 'smooth') => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTo({ left: maxScroll * Math.min(1, Math.max(0, progress)), behavior });
  }, []);

  const handlePortraitScroll = useCallback(() => {
    window.clearTimeout(snapTimerRef.current);
    const viewport = viewportRef.current;
    if (viewport) {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
      window.dispatchEvent(new CustomEvent('mega-portrait-scroll', { detail: { progress } }));
    }
    snapTimerRef.current = window.setTimeout(() => {
      if (Math.abs(tiltDeltaRef.current) > 3) return;
      if (!viewport) return;
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (maxScroll <= 0) return;
      const snapStep = maxScroll / 2;
      viewport.scrollTo({ left: Math.round(viewport.scrollLeft / snapStep) * snapStep, behavior: 'smooth' });
    }, 180);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    if (!isPortraitTablet) {
      viewport.scrollLeft = 0;
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      scrollToProgress(0, 'auto');
    });
    return () => cancelAnimationFrame(frame);
  }, [active, isPortraitTablet, scrollToProgress]);

  useLayoutEffect(() => {
    if (!isPortraitTablet) return undefined;
    const root = viewportRef.current;
    if (!root) return undefined;
    root.style.setProperty('--megaStripeScale', '1.17');
    return () => { root.style.removeProperty('--megaStripeScale'); };
  }, [isPortraitTablet]);

  useEffect(() => {
    if (!isPortraitTablet || !active) return undefined;
    let viewport = viewportRef.current;
    if (!viewport) {
      // El viewport pot aparèixer després que el mega menu s'obri
      const observer = new MutationObserver(() => {
        viewport = viewportRef.current;
        if (viewport) {
          observer.disconnect();
          viewport.addEventListener('scroll', handlePortraitScroll, { passive: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        if (viewport) viewport.removeEventListener('scroll', handlePortraitScroll);
      };
    }
    viewport.addEventListener('scroll', handlePortraitScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handlePortraitScroll);
  }, [isPortraitTablet, active, handlePortraitScroll]);

  useEffect(() => () => window.clearTimeout(snapTimerRef.current), []);

  useEffect(() => {
    if (!isPortraitTablet) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Sol·licita permís per a deviceorientation a iOS
    const OrientationEvent = window.DeviceOrientationEvent;
    if (OrientationEvent && typeof OrientationEvent.requestPermission === 'function') {
      OrientationEvent.requestPermission().catch(() => {});
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
      const viewport = viewportRef.current;
      const delta = tiltDeltaRef.current;
      if (viewport && Math.abs(delta) > 3) {
        const velocity = Math.sign(delta) * Math.min(10, (Math.abs(delta) - 3) * 0.45);
        viewport.scrollLeft += velocity;
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
        window.dispatchEvent(new CustomEvent('mega-portrait-scroll', { detail: { progress } }));
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
  }, [isPortraitTablet]);

  useLayoutEffect(() => {
    let frame = 0;
    let settleTimer = 0;
    const alignToPage1 = () => {
      const page1Stripe = document.querySelector('[data-stripe-visual-content="1"]');
      const page2Stripe = viewportRef.current?.querySelector('[data-stripe-visual-content="2"]');
      if (!page1Stripe || !page2Stripe) return;
      const delta = page1Stripe.getBoundingClientRect().top - page2Stripe.getBoundingClientRect().top;
      if (Math.abs(delta) < 0.5) return;
      setStripeVisualAlignmentY((current) => current + delta);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(alignToPage1);
    };

    schedule();
    settleTimer = window.setTimeout(schedule, 180);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', schedule);
    };
  }, [active, compactMegaTileSize, compactStripePreviewHPx, isPortraitTablet]);

  useLayoutEffect(() => {
    let frame = 0;
    let settleTimer = 0;
    const alignTopRowToPage1 = () => {
      const page1Viewport = document.querySelector('[data-mega-page-viewport="1"]');
      const page1Selector = page1Viewport?.querySelector('button[aria-label="Color"]');
      const page2Selector = viewportRef.current?.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
      if (!page1Selector || !page2Selector) return;
      const delta = page1Selector.getBoundingClientRect().top - page2Selector.getBoundingClientRect().top;
      if (Math.abs(delta) < 0.5) return;
      setTopVisualAlignmentY((current) => current + delta);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(alignTopRowToPage1);
    };

    schedule();
    settleTimer = window.setTimeout(schedule, 180);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', schedule);
    };
  }, [active, bnSliderSize, isPortraitTablet, stripeVisualAlignmentY]);

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
      <div
        ref={viewportRef}
        data-mega-page-viewport="2-cercador"
        style={{
          width: '100%',
          height: isPortraitTablet ? '269px' : '100%',
          display: 'flex',
          justifyContent: isPortraitTablet ? 'flex-start' : 'center',
          overflowX: isPortraitTablet ? 'auto' : 'visible',
          overflowY: isPortraitTablet ? 'hidden' : 'visible',
          overscrollBehaviorX: isPortraitTablet ? 'contain' : undefined,
          WebkitOverflowScrolling: isPortraitTablet ? 'touch' : undefined,
          scrollbarWidth: isPortraitTablet ? 'none' : undefined,
          touchAction: isPortraitTablet ? 'pan-x' : undefined,
          pointerEvents: isPortraitTablet ? 'auto' : undefined,
        }}
      >
        <div style={{
          flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
        }} />

        <div
          style={{
          flex: '0 0 auto',
          width: isPortraitTablet ? '1350px' : 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
          maxWidth: 'none',
          position: 'relative',
          height: '100%',
          paddingLeft: '0px',
          paddingRight: '0px',
          zoom: isPortraitTablet ? 0.868 : 1,
        }}>
        {/* Slider B/N/C vertical — cantó esquerre, alçada barra grisa */}
        {active ? (
          <div
            data-p2-color-selector
            style={{
            position: 'absolute',
            top: 'calc(var(--hg-cercador-bar-top, 0px) + 10px)',
            left: '44px',
            width: `${bnSliderSize}px`,
            height: `${bnSliderSize}px`,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ width: '100%', height: '100%', transform: `translateY(${topVisualAlignmentY}px)` }}>
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
          </div>
        ) : null}

        {/* CercadorTextRow */}
        <div style={{
          position: 'absolute',
          top: `calc(var(--hg-cercador-bar-top, 0px) + ${topVisualAlignmentY - 10}px)`,
          left: 'calc(50% - 64px)',
          transform: `translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))`,
          transformOrigin: 'top center',
          width: 'var(--hg-cercador-bar-width, 94%)',
          zIndex: 3,
          containerType: 'inline-size',
        }}>
          <CercadorTextRow
            compact
            isPortraitTablet={false}
            isLandscapeTablet={true}
            leftOffset={140}
            uniformColumns
            fontBoost={2.5}
            activeCollection={active}
            activeSubcollection={austenSubcollection}
            selectedColor={cercadorSelectedColor}
            onSelectColor={setCercadorSelectedColor}
            onSelectCollection={(key) => {
              if (key.includes(':')) {
                const [collection, subcollection] = key.split(':');
                setActive(collection);
                setAustenSubcollection(subcollection);
              } else {
                setActive(key);
                setAustenSubcollection(null);
              }
            }}
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
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '310px', left: '2px' }}>
          <MegaStripePanel
            active={active}
            reserveGridSpace
            stripeImageSrc={stripeBaseImageSrc}
            resolvedMega={resolvedMegaFiltered}
            showStripe={showStripe}
            stripeRowPadPx={stripeRowPadPx}
            stripeRowPadXPx={stripeRowPadXPx}
            stripePreviewHPx={compactStripePreviewHPx}
            visualOffsetY={stripeVisualAlignmentY}
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
            megaTileSize={compactMegaTileSize}
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

    </div>
  );
}
