import React, { useRef } from 'react';
import CercadorTopBar, { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import CercadorTextRow from '../fullwide/CercadorTextRow.jsx';
import MegaStripePanel from '../fullwide/MegaStripePanel.jsx';
import MegaHeroSlider from '../MegaHeroSlider.jsx';
import Pauta4ColsOverlay from '../pauta/Pauta4ColsOverlay';
import useMegaslideCalibration from '@/hooks/useMegaslideCalibration';

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
  stripeTileOverlaySrcs,
  stripeTileItems,
  clicAreaHighlightIndices,
  neckDotIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
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
            shirtColor={CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.hex}
            onShirtClick={onShirtClick}
            stripeTileOverlaySrcs={stripeTileOverlaySrcs}
            stripeTileItems={stripeTileItems}
            clicAreaHighlightIndices={clicAreaHighlightIndices}
            neckDotIndices={neckDotIndices}
            emptyTileIndices={emptyTileIndices}
            stripeEmptyMaskSrc={stripeEmptyMaskSrc}
          />
        </div>

        {/* Selector BLANC/COLOR/NEGRE */}
        {active ? (
          <div style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            marginTop: '56px',
            padding: '0 40px',
            justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '2px',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              border: '1px solid #e5e7eb',
              width: '100%',
              maxWidth: '202px',
              boxSizing: 'border-box',
            }}>
              {['BLANC', 'COLOR', 'NEGRE'].map((opt) => {
                const currentVariant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                const variantKey = opt === 'BLANC' ? 'white' : opt === 'NEGRE' ? 'black' : 'color';
                const isActive = currentVariant === variantKey;
                const variantExists = stripeVariantVisibility?.[variantKey] !== false;
                const isDisabled = !variantExists;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      if (active === 'the_human_inside') {
                        setHumanInsideVariant(variantKey);
                      } else {
                        setFirstContactVariant(variantKey);
                      }
                    }}
                    style={{
                      flex: 1,
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: '8.1pt',
                      fontWeight: isActive ? 400 : 300,
                      letterSpacing: '0em',
                      lineHeight: 1,
                      textTransform: 'none',
                      color: isDisabled ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '5px 0',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* MegaHeroSlider */}
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
      </div>

      <div style={{
        flex: '1 1 auto',
      }} />
    </div>
  );
}
