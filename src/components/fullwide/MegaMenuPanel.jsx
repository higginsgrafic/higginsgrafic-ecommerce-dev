import React, { lazy, Suspense } from 'react';
import MegaStripeBleedGuard from './MegaStripeBleedGuard.jsx';
import MegaStripePanelP1 from './MegaStripePanelP1.jsx';
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
  onShirtClick,
  onShirtClickP2,
  cercadorSelectedColorP2,
  setCercadorSelectedColorP2,
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
  setAcordioExpandedPage4,
  isPortraitTablet = false,
}) {
  if (!active) return null;

  const page1SelectedItem = active === 'first_contact' ? firstContactSelectedItem
    : active === 'the_human_inside' ? humanInsideSelectedItem
    : (selectedItemByCollection?.[active] ?? null);
  const portraitPage2TileSize = 'min(144px, calc((min(1350px, calc(100vh - 15px)) - 176px) / 9))';
  const portraitLandscapeWidth = typeof window !== 'undefined'
    ? Math.min(1350, window.innerHeight - 15)
    : 1024;
  const portraitPage1TileSize = Math.min(144, (portraitLandscapeWidth - 176) / 9);
  const defaultBleedGuardHeight = effectiveMegaTileSize
    ? `${Math.round(effectiveMegaTileSize * 2 + 37 + Math.max(0, stripeRowPadPx))}px`
    : undefined;
  const bleedGuardHeight = isPortraitTablet && megaPage === 2
    ? `calc(${portraitPage2TileSize} + ${portraitPage2TileSize} + ${37 + Math.max(0, stripeRowPadPx)}px)`
    : isPortraitTablet
      ? `${Math.round(portraitPage1TileSize * 2 + 69)}px`
      : defaultBleedGuardHeight;

  // El formulari de pagament necessita alçada per centrar-s'hi: a les dues
  // tauletes, obrir l'acordió estira la franja fins al peu de pantalla.
  // 112px = capçalera (80px) + padding vertical del panell (32px).
  const landscapeTablet = typeof window !== 'undefined'
    && window.innerWidth >= 768
    && window.innerWidth <= 1366
    && window.innerWidth >= window.innerHeight;
  const paymentFillsScreen = (isPortraitTablet || landscapeTablet) && megaPage === 3 && acordioExpanded;
  const guardHeightPx = paymentFillsScreen
    ? 'calc(100vh - var(--globalHeaderTopOffset, 0px) - 112px)'
    : bleedGuardHeight;

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
            heightPx={guardHeightPx}
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
                <div style={{ width: '25%', flexShrink: 0, display: 'block', height: '100%', position: 'relative', overflow: isPortraitTablet ? 'hidden' : 'visible', boxShadow: isPortraitTablet ? 'inset 8px 0 0 #ffffff, inset -8px 0 0 #ffffff' : undefined }}>
                  <div data-mega-page-viewport="1" style={{
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
                  }}>
                  <div style={{
                    flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
                  }} />

                  <div style={{ flex: '0 0 auto', width: isPortraitTablet ? 'min(1350px, calc(100vh - 32px))' : 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))', maxWidth: 'none', position: 'relative', height: '100%', paddingLeft: '0px', paddingRight: '0px' }}>
                    <MegaStripePanelP1
                      active={active}
                      resolvedMega={resolvedMega}
                      showStripe={showStripe}
                      stripeRowPadPx={isPortraitTablet ? 32 : stripeRowPadPx}
                      stripeRowPadXPx={isPortraitTablet ? { left: 40, right: 40 } : stripeRowPadXPx}
                      stripePreviewHPx={isPortraitTablet ? Math.round(portraitPage1TileSize * 0.9) : stripePreviewHPx}
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
                      megaTileSize={isPortraitTablet ? portraitPage1TileSize : megaTileSize}
                      setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
                      setFirstContactVariant={setFirstContactVariant}
                      setHumanInsideVariant={setHumanInsideVariant}
                      setThinStartIndex={setThinStartIndex}
                      setFirstContactSelectedItem={setFirstContactSelectedItem}
                      setHumanInsideSelectedItem={setHumanInsideSelectedItem}
                      setSelectedItemByCollection={setSelectedItemByCollection}
                      normalizeOverlaySrc={normalizeOverlaySrc}
                      onShirtClick={onShirtClick}
                      selectedItem={page1SelectedItem}
                    />
                  </div>

                  <div style={{
                    flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
                  }} />
                  </div>
                </div>

                <MegaslidePagina2
                  active={active}
                  isPortraitTablet={isPortraitTablet}
                  setActive={setActive}
                  austenSubcollection={austenSubcollection}
                  setAustenSubcollection={setAustenSubcollection}
                  cercadorSelectedColor={cercadorSelectedColorP2}
                  setCercadorSelectedColor={setCercadorSelectedColorP2}
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
                    isPortraitTablet={isPortraitTablet}
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
                    isPortraitTablet={isPortraitTablet}
                    orders={orders}
                    adminEmail={adminEmail}
                    acordioExpandedPage4={acordioExpandedPage4}
                    setAcordioExpandedPage4={setAcordioExpandedPage4}
                    touchMegaPublicActivity={touchMegaPublicActivity}
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
