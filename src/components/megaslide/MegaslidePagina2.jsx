import React, { useMemo } from 'react';
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
  const cal = useMegaslideCalibration('p2', active, megaMenuRef);
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
    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
      <div style={{
        flex: '1 1 auto',
      }} />

      <div
        style={{
        flex: '0 0 auto',
        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
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
          top: 'var(--hg-cercador-bar-top, 0px)',
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
        flex: '1 1 auto',
      }} />
    </div>
  );
}
