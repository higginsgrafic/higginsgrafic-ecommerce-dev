import React, { lazy, Suspense } from 'react';
import MegaStripeBleedGuard from './MegaStripeBleedGuard.jsx';
import MegaStripePanel from './MegaStripePanel.jsx';
import MegaslidePagina2 from '../megaslide/MegaslidePagina2.jsx';

const MegaslidePagina3 = lazy(() => import('../megaslide/MegaslidePagina3.jsx'));
const MegaslidePagina4 = lazy(() => import('../megaslide/MegaslidePagina4.jsx'));

export default function MegaMenuPanel({
  active,
  megaPage,
  megaFullScreen,
  megaMenuRef,
  effectiveMegaTileSize,
  stripeRowPadPx,
  bleedGuardExpandPx,
  showStripe,
  resolvedMega,
  stripeRowPadXPx,
  stripePreviewHPx,
  stripeOverlayLoadState,
  resolvedOverlaySrc,
  stripeOverlayDebug,
  stripeMaskDebugRectsPct,
  stripeMaskTileRectsRawPct,
  megaStripeSpriteEnabledLocal,
  megaStripeRefEnabledLocal,
  megaStripeRefSrcLocal,
  megaStripeRef2EnabledLocal,
  megaStripeRef2SrcLocal,
  megaShirtDrawingEnabledLocal,
  drawingOverlaySrcEffective,
  drawingOverlayDebug,
  tileGapPxLocal,
  humanInsideVariant,
  firstContactVariant,
  reorderAustenQuotes,
  austenSelectedDisableMulti,
  stripeVariantVisibility,
  megaTileSelectorParams,
  onStartSelectorDrag,
  megaTileSize,
  setStripeOverlayOverrideActive,
  setFirstContactVariant,
  setHumanInsideVariant,
  setThinStartIndex,
  setFirstContactSelectedItem,
  setHumanInsideSelectedItem,
  setSelectedItemByCollection,
  normalizeOverlaySrc,
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
  megaHeroGridRef,
  megaHeroRowHeight,
  stripeBaseImageSrc,
  resolvedMegaFiltered,
  humanInsideVariantP2,
  firstContactVariantP2,
  setFirstContactVariantP2,
  setHumanInsideVariantP2,
  displayedShirtColorP2,
  onShirtClickP2,
  thinDrawings,
  cartItems,
  setCartItems,
  localCartItemCount,
  megaAccordionLocked,
  acordioExpanded,
  setAcordioExpanded,
  touchMegaPublicActivity,
  accordionPautaScale,
  orders,
  adminEmail,
  acordioExpandedPage4,
}) {
  if (!active) return null;

  return (
    <div className="relative">
      <div
        className="relative z-[10000] block border-b border-border"
        style={{
          overflow: 'visible',
          ...(megaFullScreen ? {
            minHeight: '100vh',
          } : {})
        }}
      >
        <div
          ref={megaMenuRef}
          className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-8"
          style={{
            overflow: 'visible',
            ...(megaFullScreen ? {
              minHeight: 'calc(100vh - 16px)',
            } : {})
          }}
        >
          <MegaStripeBleedGuard
            heightPx={effectiveMegaTileSize
              ? `${Math.round(effectiveMegaTileSize * 2 + 37 + (() => {
                try {
                  const qs = (typeof window !== 'undefined') ? window.location?.search : '';
                  const p = qs ? new URLSearchParams(qs) : null;
                  const bottomPad = stripeRowPadPx;
                  return Math.max(0, bottomPad);
                } catch {
                  return 0;
                }
              })())}px`
              : undefined}
            debug={false}
            expandLeftPx={bleedGuardExpandPx?.left || 0}
            expandRightPx={bleedGuardExpandPx?.right || 0}
          >
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '100%',
              overflow: 'visible'
            }}>
              <div
                style={{
                  display: 'flex',
                  width: '400%',
                  height: '100%',
                  transform: `translateX(${megaPage === 2 ? '-25%' : megaPage === 3 ? '-50%' : megaPage === 4 ? '-75%' : '0'})`,
                  transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              >
                <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                  <div style={{
                    flex: '1 1 auto',
                  }} />

                  <div style={{ flex: '0 0 auto', width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))', maxWidth: 'none', position: 'relative', height: '100%', paddingLeft: '0px', paddingRight: '0px' }}>
                    <MegaStripePanel
                      active={active}
                      resolvedMega={resolvedMega}
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
                    />
                  </div>

                  <div style={{
                    flex: '1 1 auto',
                  }} />
                </div>

                <MegaslidePagina2
                  active={active}
                  setActive={setActive}
                  austenSubcollection={austenSubcollection}
                  setAustenSubcollection={setAustenSubcollection}
                  cercadorSelectedColor={cercadorSelectedColor}
                  setCercadorSelectedColor={setCercadorSelectedColor}
                  firstContactSelectedItem={firstContactSelectedItem}
                  humanInsideSelectedItem={humanInsideSelectedItem}
                  selectedItemByCollection={selectedItemByCollection}
                  hoveredStripeItem={hoveredStripeItem}
                  setHoveredStripeItem={setHoveredStripeItem}
                  hoveredStripeItemCollection={hoveredStripeItemCollection}
                  setHoveredStripeItemCollection={setHoveredStripeItemCollection}
                  setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
                  setFirstContactSelectedItem={setFirstContactSelectedItem}
                  setHumanInsideSelectedItem={setHumanInsideSelectedItem}
                  setSelectedItemByCollection={setSelectedItemByCollection}
                  megaHeroGridRef={megaHeroGridRef}
                  megaHeroRowHeight={megaHeroRowHeight}
                  stripeBaseImageSrc={stripeBaseImageSrc}
                  resolvedMegaFiltered={resolvedMegaFiltered}
                  showStripe={showStripe}
                  stripeOverlayLoadState={stripeOverlayLoadState}
                  resolvedOverlaySrc={resolvedOverlaySrc}
                  stripeOverlayDebug={stripeOverlayDebug}
                  stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
                  stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                  drawingOverlayDebug={drawingOverlayDebug}
                  humanInsideVariant={humanInsideVariantP2}
                  firstContactVariant={firstContactVariantP2}
                  reorderAustenQuotes={reorderAustenQuotes}
                  austenSelectedDisableMulti={austenSelectedDisableMulti}
                  stripeVariantVisibility={stripeVariantVisibility}
                  setFirstContactVariant={setFirstContactVariantP2}
                  setHumanInsideVariant={setHumanInsideVariantP2}
                  setThinStartIndex={setThinStartIndex}
                  displayedShirtColor={displayedShirtColorP2}
                  onShirtClick={onShirtClickP2}
                  thinDrawings={thinDrawings}
                  megaMenuRef={megaMenuRef}
                />

                <Suspense fallback={null}>
                  <MegaslidePagina3
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    setActive={setActive}
                    localCartItemCount={localCartItemCount}
                    megaAccordionLocked={megaAccordionLocked}
                    acordioExpanded={acordioExpanded}
                    setAcordioExpanded={setAcordioExpanded}
                    touchMegaPublicActivity={touchMegaPublicActivity}
                    accordionPautaScale={accordionPautaScale}
                  />
                </Suspense>

                <Suspense fallback={null}>
                  <MegaslidePagina4
                    orders={orders}
                    adminEmail={adminEmail}
                    acordioExpandedPage4={acordioExpandedPage4}
                    accordionPautaScale={accordionPautaScale}
                  />
                </Suspense>
              </div>
            </div>
          </MegaStripeBleedGuard>
        </div>
      </div>
    </div>
  );
}
