import { CistellLayout1, CistellLayout2, CistellLayout3, CistellLayout4 } from '@/components/CistellLayouts';
import { clampScale, writeCalibrationToMap, parseFinite, normalizeMegaStripeRefSrc } from '@/utils/megaStripeCalibration';

function MegaStripeHud({
  megaStripeState,
  isFullWideSlideDemoRoute,
  isFullWideSlideRoute,
  cistellExpanded,
  setCistellExpanded,
  cistellLayout,
  setCistellLayout,
  navigate,
  location,
  stripeOverlayDebugSnapshot,
  stripeOverlayDebugOn,
  megaStripeRefPresets,
  HUD_DEBUG_BOTTOM_RESERVE_PX,
  exportCopyStatus,
  setExportCopyStatus,
  exportTab,
  setExportTab,
  exportModalOpen,
  setExportModalOpen,
  exportModalTitle,
  setExportModalTitle,
  exportModalText,
  setExportModalText,
  belt2GuidesEnabled,
  setBelt2GuidesEnabled,
  megaAccordionLocked,
  setMegaAccordionLocked,
  debugOverlaysEnabled,
  guidesEnabled,
  setGuidesEnabled,
  isAdmin,
  isDevDemoRoute,
  isEmbeddedPreview,
  layoutInspectorActive,
  setLayoutInspectorEnabled,
}) {
  if (!isFullWideSlideDemoRoute && !isFullWideSlideRoute) return null;

  const {
    megaStripeDx, setMegaStripeDx,
    megaStripeDy, setMegaStripeDy,
    megaStripeSpriteEnabled, setMegaStripeSpriteEnabled,
    megaStripeBeltEnabled, setMegaStripeBeltEnabled,
    megaStripeOverlayMode, setMegaStripeOverlayMode,
    megaShirtDrawingEnabled, setMegaShirtDrawingEnabled,
    megaShirtDrawingOverlayDx, setMegaShirtDrawingOverlayDx,
    megaShirtDrawingOverlayDy, setMegaShirtDrawingOverlayDy,
    megaShirtDrawingOverlayScale, setMegaShirtDrawingOverlayScale,
    megaShirtDrawingOverlaySrc, setMegaShirtDrawingOverlaySrc,
    megaStripeDrawingOverlayDx, setMegaStripeDrawingOverlayDx,
    megaStripeDrawingOverlayDy, setMegaStripeDrawingOverlayDy,
    megaStripeDrawingOverlayScale, setMegaStripeDrawingOverlayScale,
    megaStripeOverlayDx, setMegaStripeOverlayDx,
    megaStripeOverlayDy, setMegaStripeOverlayDy,
    megaStripeOverlayScale, setMegaStripeOverlayScale,
    megaStripeScale, setMegaStripeScale,
    megaStripeRefEnabled, setMegaStripeRefEnabled,
    megaStripeRefSrc, setMegaStripeRefSrc,
    megaStripeRef2Enabled, setMegaStripeRef2Enabled,
    megaStripeRef2Src, setMegaStripeRef2Src,
    megaStripeRefCollection, setMegaStripeRefCollection,
    megaStripeRefDx, setMegaStripeRefDx,
    megaStripeRefDy, setMegaStripeRefDy,
    megaStripeRefScale, setMegaStripeRefScale,
    megaStripeRef2Dx, setMegaStripeRef2Dx,
    megaStripeRef2Dy, setMegaStripeRef2Dy,
    megaStripeRef2Scale, setMegaStripeRef2Scale,
    stripeEditTool, setStripeEditTool,
    megaStripeNudgeStep, setMegaStripeNudgeStep,
    megaStripeTileGapPx, setMegaStripeTileGapPx,
    megaTileSelectorV1Enabled, setMegaTileSelectorV1Enabled,
    megaTileSelectorEnabled, setMegaTileSelectorEnabled,
    megaTileSelectorTarget, setMegaTileSelectorTarget,
    megaTileSelectorSizePx, setMegaTileSelectorSizePx,
    megaTileSelectorStrokePx, setMegaTileSelectorStrokePx,
    megaTileSelectorColor, setMegaTileSelectorColor,
    megaTileSelectorStepX, setMegaTileSelectorStepX,
    megaTileSelectorStepY, setMegaTileSelectorStepY,
    megaTileSelectorRadiusPx, setMegaTileSelectorRadiusPx,
    megaTileSelectorExtendTopPx, setMegaTileSelectorExtendTopPx,
    megaTileSelectorExtendRightPx, setMegaTileSelectorExtendRightPx,
    megaTileSelectorExtendBottomPx, setMegaTileSelectorExtendBottomPx,
    megaTileSelectorExtendLeftPx, setMegaTileSelectorExtendLeftPx,
    megaStripeHudTopPx, setMegaStripeHudTopPx,
    megaStripeHudLockedTopPx, setMegaStripeHudLockedTopPx,
    megaStripeHudLockedHPx, setMegaStripeHudLockedHPx,
    megaStripeHudOwnHPx, setMegaStripeHudOwnHPx,
    megaStripeHudMaxRefPresets, setMegaStripeHudMaxRefPresets,
    megaStripeHudSnapDyPx, setMegaStripeHudSnapDyPx,
    hudCollapsed, setHudCollapsed,
    hudActiveTab, setHudActiveTab,
    megaStripeHudWrapRef,
    megaStripeParamsGridRef,
    megaStripeLastGoodHudTopPxRef,
    megaStripeLastNonOffOverlayModeRef,
    prevMegaStripeOverlayModeRef,
    megaStripeOverlayScaleInputFocusedRef, megaStripeOverlayScaleDraft, setMegaStripeOverlayScaleDraft,
    megaStripeDrawingOverlayDxInputFocusedRef, megaStripeDrawingOverlayDxDraft, setMegaStripeDrawingOverlayDxDraft,
    megaStripeDrawingOverlayDyInputFocusedRef, megaStripeDrawingOverlayDyDraft, setMegaStripeDrawingOverlayDyDraft,
    megaStripeDrawingOverlayScaleInputFocusedRef, megaStripeDrawingOverlayScaleDraft, setMegaStripeDrawingOverlayScaleDraft,
    megaStripeDxInputFocusedRef, megaStripeDxDraft, setMegaStripeDxDraft,
    megaStripeDyInputFocusedRef, megaStripeDyDraft, setMegaStripeDyDraft,
    megaStripeScaleInputFocusedRef, megaStripeScaleDraft, setMegaStripeScaleDraft,
    megaStripeRefDxInputFocusedRef, megaStripeRefDxDraft, setMegaStripeRefDxDraft,
    megaStripeRefDyInputFocusedRef, megaStripeRefDyDraft, setMegaStripeRefDyDraft,
    megaStripeRefScaleInputFocusedRef, megaStripeRefScaleDraft, setMegaStripeRefScaleDraft,
    megaStripeRef2DxInputFocusedRef, megaStripeRef2DxDraft, setMegaStripeRef2DxDraft,
    megaStripeRef2DyInputFocusedRef, megaStripeRef2DyDraft, setMegaStripeRef2DyDraft,
    megaStripeRef2ScaleInputFocusedRef, megaStripeRef2ScaleDraft, setMegaStripeRef2ScaleDraft,
    megaStripeTileGapPxInputFocusedRef, megaStripeTileGapPxDraft, setMegaStripeTileGapPxDraft,
    megaTileSelectorSizePxInputFocusedRef, megaTileSelectorSizePxDraft, setMegaTileSelectorSizePxDraft,
    megaTileSelectorStrokePxInputFocusedRef, megaTileSelectorStrokePxDraft, setMegaTileSelectorStrokePxDraft,
    megaTileSelectorStepXInputFocusedRef, megaTileSelectorStepXDraft, setMegaTileSelectorStepXDraft,
    megaTileSelectorStepYInputFocusedRef, megaTileSelectorStepYDraft, setMegaTileSelectorStepYDraft,
    megaTileSelectorRadiusPxInputFocusedRef, megaTileSelectorRadiusPxDraft, setMegaTileSelectorRadiusPxDraft,
    megaTileSelectorExtendTopPxInputFocusedRef, megaTileSelectorExtendTopPxDraft, setMegaTileSelectorExtendTopPxDraft,
    megaTileSelectorExtendRightPxInputFocusedRef, megaTileSelectorExtendRightPxDraft, setMegaTileSelectorExtendRightPxDraft,
    megaTileSelectorExtendBottomPxInputFocusedRef, megaTileSelectorExtendBottomPxDraft, setMegaTileSelectorExtendBottomPxDraft,
    megaTileSelectorExtendLeftPxInputFocusedRef, megaTileSelectorExtendLeftPxDraft, setMegaTileSelectorExtendLeftPxDraft,
  } = megaStripeState;

  return (
              <div
                ref={megaStripeHudWrapRef}
                className="debug-exempt"
                data-dev-overlay-hud="mega-stripe"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: hudCollapsed ? 'auto' : Math.max(160, Math.round(Number.isFinite(megaStripeHudOwnHPx) ? megaStripeHudOwnHPx : 360)),
                  maxHeight: '100vh',
                  paddingLeft: 16,
                  paddingRight: 16,
                  zIndex: 1000000,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  transform: (Number.isFinite(megaStripeHudSnapDyPx) && Math.abs(megaStripeHudSnapDyPx) > 0.001) ? `translateY(${megaStripeHudSnapDyPx}px)` : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  pointerEvents: 'none',
                  transition: 'height 300ms ease',
                  overflow: hudCollapsed ? 'hidden' : 'visible',
                }}
              >
                <div
                  style={{
                    background: '#b91c1c',
                    color: 'rgba(255,255,255,0.92)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #7f1d1d',
                    maxWidth: '100%',
                    pointerEvents: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, minWidth: 0, overflow: 'hidden' }}>
                    <button type="button" onClick={() => setHudCollapsed(!hudCollapsed)} style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.25)', color: 'inherit', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }} title={hudCollapsed ? 'Desplegar HUD' : 'Plegar HUD'}>{hudCollapsed ? '↓' : '↑'}</button>
                    <span style={{ flexShrink: 0 }}>HUD</span>
                    {!hudCollapsed && (
                      <div style={{ display: 'flex', gap: 4, marginLeft: 10, overflow: 'hidden' }}>
                        {['Stripe', 'Cercador', 'Cistell', 'Usr', 'Pàgines'].map((tab) => (
                          <button key={tab} type="button" onClick={() => setHudActiveTab(tab.toLowerCase())} style={{ background: hudActiveTab === tab.toLowerCase() ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.20)', color: 'inherit', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: hudActiveTab === tab.toLowerCase() ? 800 : 600, cursor: 'pointer', opacity: hudActiveTab === tab.toLowerCase() ? 1 : 0.7, flexShrink: 0 }}>{tab}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(() => {
                    const refSelected = stripeEditTool === 'ref';
                    const ref2Selected = stripeEditTool === 'ref2';
                    const overlaySelected = stripeEditTool === 'overlay';
                    const tileSelected = stripeEditTool === 'tile';
                    const beltOn = Boolean(megaStripeBeltEnabled);
                    const onStyle = { fontWeight: 900, opacity: 0.98 };
                    const offStyle = { fontWeight: 300, opacity: 0.28 };
                    const btnBase = {
                      fontSize: 13,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.20)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'inherit',
                      userSelect: 'none',
                      lineHeight: 1,
                    };
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', left: -20 }}>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(refSelected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('ref');
                          }}
                        >
                          REF
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(ref2Selected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMegaStripeRef2Enabled(true);
                            setMegaStripeRef2Src((prev) => (String(prev || '').trim() ? prev : megaStripeRefSrc));
                            setStripeEditTool('ref2');
                          }}
                        >
                          REF2
                        </button>
                        <button
                          type="button"
                          style={{
                            ...btnBase,
                            ...(overlaySelected ? onStyle : offStyle),
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('overlay');
                          }}
                        >
                          OVERLAY
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(tileSelected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('tile');
                          }}
                        >
                          TILE
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(beltOn ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMegaStripeBeltEnabled((prev) => !prev);
                          }}
                        >
                          BELT
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderTop: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    boxShadow: 'none',
                    overflow: 'auto',
                    pointerEvents: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 380px)',
                    gap: 10,
                    alignItems: 'stretch',
                    padding: 10,
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                  }}
                >
                    {hudActiveTab === 'cistell' && !cistellExpanded && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.98)', display: 'flex', flexDirection: 'column', zIndex: 10, pointerEvents: 'auto', overflow: 'auto', padding: '20px 24px' }}>
                        <div style={{ fontFamily: 'Roboto, sans-serif', color: '#000', maxWidth: 480 }}>
                          {/* Selector de layout */}
                          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                            <button onClick={() => setCistellLayout(1)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 1 ? 700 : 400, background: cistellLayout === 1 ? '#000' : '#f0f0f0', color: cistellLayout === 1 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 1</button>
                            <button onClick={() => setCistellLayout(2)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 2 ? 700 : 400, background: cistellLayout === 2 ? '#000' : '#f0f0f0', color: cistellLayout === 2 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 2</button>
                            <button onClick={() => setCistellLayout(3)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 3 ? 700 : 400, background: cistellLayout === 3 ? '#000' : '#f0f0f0', color: cistellLayout === 3 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 3</button>
                            <button onClick={() => setCistellLayout(4)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 4 ? 700 : 400, background: cistellLayout === 4 ? '#000' : '#f0f0f0', color: cistellLayout === 4 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Imatge</button>
                          </div>
                          
                          {/* Header compacte */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, borderBottom: '2px solid #000', paddingBottom: 8 }}>
                            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>CISTELL (2)</h2>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>34,90€</div>
                          </div>
                          
                          {/* Renderitzar layout segons selecció */}
                          {cistellLayout === 1 && <CistellLayout1 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 2 && <CistellLayout2 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 3 && <CistellLayout3 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 4 && <CistellLayout4 onExpand={() => setCistellExpanded(true)} />}
                        </div>
                      </div>
                    )}
                    {hudActiveTab === 'cistell' && cistellExpanded && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.96)', display: 'flex', flexDirection: 'column', zIndex: 10, pointerEvents: 'auto', overflow: 'auto', padding: 16 }}>
                        <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: '#000' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>LA MEVA COMANDA 🛒</h2>
                            <button onClick={() => setCistellExpanded(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>← Tornar</button>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                            {/* Producte 1: WORMHOLE */}
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>WORMHOLE</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>QUANTITAT:</span> 1</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>TALLATGE:</span> L</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IMPORT:</span> 15,76€</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IVA 21%:</span> 4,19€</div>
                              <div style={{ fontSize: 12, fontWeight: 800 }}><span style={{ fontWeight: 800 }}>PVP:</span> 19,95€</div>
                            </div>

                            {/* Producte 2: MASCHINENMENSCH */}
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>MASCHINENMENSCH</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>QUANTITAT:</span> 1</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>TALLATGE:</span> M</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IMPORT:</span> 11,81€</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IVA 21%:</span> 3,14€</div>
                              <div style={{ fontSize: 12, fontWeight: 800 }}><span style={{ fontWeight: 800 }}>PVP:</span> 14,95€</div>
                            </div>
                          </div>

                          {/* Total */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 16, borderTop: '2px solid #000', marginBottom: 20 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOT PLEGAT</div>
                            <div style={{ fontSize: 28, fontWeight: 900 }}>34,90€</div>
                          </div>

                          {/* Seccions expandides */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Dades d'usuari</div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Classe de gas</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                              <span>He vist i estic d'acord amb les condicions</span>
                            </label>

                            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>Enviament i facturació</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" style={{ width: 16, height: 16 }} />
                              <span>És igual l'adreça de facturació que la de compra</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" style={{ width: 16, height: 16 }} />
                              <span>Ja ho sé i no vull cobrar</span>
                            </label>

                            <div style={{ fontWeight: 600, marginTop: 8 }}>On vols que ho enviem?</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                              <span>Adreça que em mostri en el moment de la compra</span>
                            </label>

                            <div style={{ fontWeight: 600, marginTop: 8 }}>On vols que les facturem?</div>

                            {/* Botó Pagament */}
                            <button style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', borderRadius: 4, marginTop: 16 }}>Pagament</button>

                            {/* Footer */}
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', textAlign: 'center', lineHeight: 1.6, marginTop: 16 }}>
                              <div>Política de reemborsament | Política d'enviament</div>
                              <div>Política de privacitat | Termes del servei</div>
                              <div style={{ marginTop: 8 }}>Higgins Gràfic 2026</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {hudActiveTab === 'pàgines' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.98)', display: 'flex', flexDirection: 'column', zIndex: 10, pointerEvents: 'auto', overflow: 'auto', padding: '20px 24px' }}>
                        <div style={{ fontFamily: 'Roboto, sans-serif', color: '#000', maxWidth: 480 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Components</div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.12)', marginBottom: 16 }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => navigate('/checkout')}
                              style={{ textAlign: 'left', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                              <span>Llista Checkout</span>
                              <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>/checkout</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {hudActiveTab !== 'stripe' && hudActiveTab !== 'cistell' && hudActiveTab !== 'pàgines' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'auto' }}>
                        <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textTransform: 'capitalize' }}>{hudActiveTab}</div>
                          <div style={{ fontSize: 13 }}>Contingut de la pestanya {hudActiveTab}</div>
                        </div>
                      </div>
                    )}
                    <div
                      ref={megaStripeParamsGridRef}
                      style={{
                        minWidth: 0,
                        border: '1px solid rgba(0,0,0,0.45)',
                        backgroundColor: 'transparent',
                        padding: 8,
                        position: 'relative',
                        display: 'grid',
                        gridTemplateRows: 'auto auto auto auto',
                        gap: 6,
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, shapeRendering: 'crispEdges' }}
                      >
                        {Array.from({ length: 7 }).map((_, i) => {
                          // Amaga separadors verticals interns de les cel·les ajuntades (17.2-17.6 i 18.2-18.6)
                          if (i >= 2 && i <= 5) return null;
                          const x = (i / 6) * 100;
                          return (
                            <line
                              key={`hud-grid-v-${i}`}
                              x1={x}
                              y1={0}
                              x2={x}
                              y2={100}
                              stroke="rgba(148,163,184,0.80)"
                              strokeWidth={0.5}
                              vectorEffect="non-scaling-stroke"
                            />
                          );
                        })}
                        {Array.from({ length: 21 }).map((_, j) => {
                          const y = (j / 20) * 100;
                          return (
                            <line
                              key={`hud-grid-h-${j}`}
                              x1={0}
                              y1={y}
                              x2={100}
                              y2={y}
                              stroke="rgba(148,163,184,0.80)"
                              strokeWidth={0.5}
                              vectorEffect="non-scaling-stroke"
                            />
                          );
                        })}
                      </svg>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          pointerEvents: 'none',
                          zIndex: 30,
                        }}
                      >
                        {Array.from({ length: 20 }).map((_, rIdx) => (
                          Array.from({ length: 6 }).map((__, cIdx) => {
                            const topPct = (rIdx / 20) * 100;
                            const leftPct = (cIdx / 6) * 100;
                            return (
                              <div
                                key={`hud-struct-cell-${rIdx + 1}-${cIdx + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: `${topPct}%`,
                                  left: `${leftPct}%`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  padding: '1px 3px',
                                  fontSize: 8,
                                  fontWeight: 900,
                                  color: 'rgba(2,6,23,0.28)',
                                  letterSpacing: -0.35,
                                  fontVariantNumeric: 'tabular-nums',
                                  userSelect: 'none',
                                }}
                              >
                                {`${rIdx + 1}.${cIdx + 1}`}
                              </div>
                            );
                          })
                        ))}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          top: `${(16 / 20) * 100}%`,
                          left: '0%',
                          width: `${(1 / 6) * 100}%`,
                          height: `${(4 / 20) * 100}%`,
                          background: 'rgba(255,255,255,1)',
                          border: '0.5px solid rgba(148,163,184,0.80)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          top: `${(19 / 20) * 100}%`,
                          left: `${(1 / 6) * 100}%`,
                          width: `${(3 / 6) * 100}%`,
                          height: `${(1 / 20) * 100}%`,
                          background: 'rgba(255,255,255,1)',
                          border: '0.5px solid rgba(148,163,184,0.80)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                          gridTemplateRows: 'repeat(20, minmax(0, 1fr))',
                          gap: 0,
                          minWidth: 0,
                          minHeight: 0,
                          zIndex: 1,
                        }}
                      >
                        {(() => {
                            const safeGetLs = (k) => {
                              try {
                                return String(window.localStorage.getItem(k) || '');
                              } catch {
                                return '';
                              }
                            };

                            const safeGetLsJson = (k) => {
                              try {
                                const raw = safeGetLs(k);
                                if (!raw) return null;
                                const parsed = JSON.parse(raw);
                                return parsed && typeof parsed === 'object' ? parsed : null;
                              } catch {
                                return null;
                              }
                            };

                            const readGridCalibFromLocalStorage = () => {
                              try {
                                const scalesByCollection = {};
                                const offsetsByCollection = {};
                                const ls = window.localStorage;
                                if (!ls) return { scalesByCollection, offsetsByCollection };

                                for (let i = 0; i < ls.length; i += 1) {
                                  const key = ls.key(i);
                                  if (!key) continue;
                                  if (key.startsWith('HG_GRID_SCALES_')) {
                                    const collection = key.slice('HG_GRID_SCALES_'.length);
                                    const parsed = safeGetLsJson(key);
                                    if (parsed) scalesByCollection[collection] = parsed;
                                  } else if (key.startsWith('HG_GRID_OFFSETS_')) {
                                    const collection = key.slice('HG_GRID_OFFSETS_'.length);
                                    const parsed = safeGetLsJson(key);
                                    if (parsed) offsetsByCollection[collection] = parsed;
                                  }
                                }

                                return { scalesByCollection, offsetsByCollection };
                              } catch {
                                return { scalesByCollection: {}, offsetsByCollection: {} };
                              }
                            };

                            const gridCalib = readGridCalibFromLocalStorage();

                            const payload = {
                              shortcuts: {
                                o: 'overlay (drawingOverlay)',
                                r: 'ref',
                                t: 'tile gap',
                                2: 'ref2',
                              },
                              overlay: {
                                enabled: Boolean(megaShirtDrawingEnabled),
                                dx: Number.isFinite(megaShirtDrawingOverlayDx) ? megaShirtDrawingOverlayDx : 0,
                                dy: Number.isFinite(megaShirtDrawingOverlayDy) ? megaShirtDrawingOverlayDy : 0,
                                scale: Number.isFinite(megaShirtDrawingOverlayScale) ? megaShirtDrawingOverlayScale : 1,
                                src: safeGetLs('HG_DRAWING_OVERLAY_SRC').trim(),
                              },
                              ref: {
                                enabled: Boolean(megaStripeRefEnabled),
                                collection: String(megaStripeRefCollection || ''),
                                src: String(megaStripeRefSrc || ''),
                                dx: Number.isFinite(megaStripeRefDx) ? megaStripeRefDx : 0,
                                dy: Number.isFinite(megaStripeRefDy) ? megaStripeRefDy : 0,
                                scale: Number.isFinite(megaStripeRefScale) ? megaStripeRefScale : 1,
                              },
                              tile: {
                                gapPx: Number.isFinite(megaStripeTileGapPx) ? megaStripeTileGapPx : 0,
                              },
                              ref2: {
                                enabled: Boolean(megaStripeRef2Enabled),
                                src: String(megaStripeRef2Src || ''),
                                dx: Number.isFinite(megaStripeRef2Dx) ? megaStripeRef2Dx : 0,
                                dy: Number.isFinite(megaStripeRef2Dy) ? megaStripeRef2Dy : 0,
                                scale: Number.isFinite(megaStripeRef2Scale) ? megaStripeRef2Scale : 1,
                              },
                              selector: {
                                enabled: Boolean(megaTileSelectorEnabled),
                                target: String(megaTileSelectorTarget || ''),
                                sizePx: Number.isFinite(megaTileSelectorSizePx) ? megaTileSelectorSizePx : 200,
                                strokePx: Number.isFinite(megaTileSelectorStrokePx) ? megaTileSelectorStrokePx : 10,
                                color: String(megaTileSelectorColor || 'black'),
                                stepX: Number.isFinite(megaTileSelectorStepX) ? megaTileSelectorStepX : 0,
                                stepY: Number.isFinite(megaTileSelectorStepY) ? megaTileSelectorStepY : 0,
                                radiusPx: Number.isFinite(megaTileSelectorRadiusPx) ? megaTileSelectorRadiusPx : 8,
                                extendTopPx: Number.isFinite(megaTileSelectorExtendTopPx) ? megaTileSelectorExtendTopPx : 0,
                                extendRightPx: Number.isFinite(megaTileSelectorExtendRightPx) ? megaTileSelectorExtendRightPx : 0,
                                extendBottomPx: Number.isFinite(megaTileSelectorExtendBottomPx) ? megaTileSelectorExtendBottomPx : 0,
                                extendLeftPx: Number.isFinite(megaTileSelectorExtendLeftPx) ? megaTileSelectorExtendLeftPx : 0,
                              },
                              gridCalib,
                              localStorageKeys: {
                                overlayEnabled: 'HG_SHIRT_DRAWING_ENABLED',
                                overlaySrc: 'HG_DRAWING_OVERLAY_SRC',
                                overlayDx: 'HG_SHIRT_DRAWING_OVERLAY_DX',
                                overlayDy: 'HG_SHIRT_DRAWING_OVERLAY_DY',
                                overlayScale: 'HG_SHIRT_DRAWING_OVERLAY_SCALE',
                                refEnabled: 'MEGA_STRIPE_REF_ENABLED',
                                refSrc: 'MEGA_STRIPE_REF_SRC',
                                refCollection: 'MEGA_STRIPE_REF_COLLECTION',
                                refDx: 'MEGA_STRIPE_REF_DX',
                                refDy: 'MEGA_STRIPE_REF_DY',
                                refScale: 'MEGA_STRIPE_REF_SCALE',
                                tileGapPx: 'MEGA_STRIPE_TILE_GAP_PX',
                                ref2Enabled: 'MEGA_STRIPE_REF2_ENABLED',
                                ref2Src: 'MEGA_STRIPE_REF2_SRC',
                                ref2Dx: 'MEGA_STRIPE_REF2_DX',
                                ref2Dy: 'MEGA_STRIPE_REF2_DY',
                                ref2Scale: 'MEGA_STRIPE_REF2_SCALE',
                                selectorEnabled: 'MEGA_TILE_SELECTOR_V2_ENABLED',
                                selectorTarget: 'MEGA_TILE_SELECTOR_V2_TARGET',
                                selectorSizePx: 'MEGA_TILE_SELECTOR_V2_SIZE_PX',
                                selectorStrokePx: 'MEGA_TILE_SELECTOR_V2_STROKE_PX',
                                selectorColor: 'MEGA_TILE_SELECTOR_V2_COLOR',
                                selectorStepX: 'MEGA_TILE_SELECTOR_V2_STEP_X',
                                selectorStepY: 'MEGA_TILE_SELECTOR_V2_STEP_Y',
                                selectorRadiusPx: 'MEGA_TILE_SELECTOR_V2_RADIUS_PX',
                                selectorExtendTopPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX',
                                selectorExtendRightPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX',
                                selectorExtendBottomPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX',
                                selectorExtendLeftPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX',
                                gridScalesPrefix: 'HG_GRID_SCALES_',
                                gridOffsetsPrefix: 'HG_GRID_OFFSETS_',
                              },
                            };

                            const doCopyText = async (value) => {
                              const text = String(value || '');
                              const fallbackCopy = () => {
                                try {
                                  const ta = document.createElement('textarea');
                                  ta.value = text;
                                  ta.setAttribute('readonly', '');
                                  ta.style.position = 'fixed';
                                  ta.style.left = '-9999px';
                                  document.body.appendChild(ta);
                                  ta.select();
                                  const ok = document.execCommand('copy');
                                  document.body.removeChild(ta);
                                  return ok;
                                } catch {
                                  return false;
                                }
                              };
                              try {
                                if (navigator?.clipboard?.writeText) {
                                  await navigator.clipboard.writeText(text);
                                } else {
                                  const ok = fallbackCopy();
                                  if (!ok) throw new Error('copy_failed');
                                }
                                return true;
                              } catch {
                                return false;
                              }
                            };

                            const exportTabs = [
                              { id: 'all', label: 'ALL' },
                              { id: 'stripe', label: 'STRIPE' },
                              { id: 'overlay', label: 'OVERLAY' },
                              { id: 'selector', label: 'SELECTOR' },
                              { id: 'grid', label: 'GRID' },
                              { id: 'keys', label: 'KEYS' },
                            ];

                            const sectionsAll = [
                              { id: 'overlay', label: 'overlay', data: payload.overlay },
                              { id: 'ref', label: 'ref', data: payload.ref },
                              { id: 'ref2', label: 'ref2', data: payload.ref2 },
                              { id: 'tile', label: 'tile', data: payload.tile },
                              { id: 'selector', label: 'selector', data: payload.selector },
                              { id: 'gridCalib', label: 'gridCalib', data: payload.gridCalib },
                              { id: 'shortcuts', label: 'shortcuts', data: payload.shortcuts },
                              { id: 'localStorageKeys', label: 'localStorageKeys', data: payload.localStorageKeys },
                            ];

                            const sections = (() => {
                              const t = String(exportTab || 'all');
                              if (t === 'overlay') return sectionsAll.filter((s) => s.id === 'overlay');
                              if (t === 'selector') return sectionsAll.filter((s) => s.id === 'selector');
                              if (t === 'grid') return sectionsAll.filter((s) => s.id === 'gridCalib');
                              if (t === 'stripe') return sectionsAll.filter((s) => s.id === 'ref' || s.id === 'ref2' || s.id === 'tile');
                              if (t === 'keys') return sectionsAll.filter((s) => s.id === 'shortcuts' || s.id === 'localStorageKeys');
                              return sectionsAll;
                            })();

                            const tabPayload = (() => {
                              const t = String(exportTab || 'all');
                              if (t === 'overlay') return { overlay: payload.overlay };
                              if (t === 'selector') return { selector: payload.selector };
                              if (t === 'grid') return { gridCalib: payload.gridCalib };
                              if (t === 'stripe') return { ref: payload.ref, tile: payload.tile, ref2: payload.ref2 };
                              if (t === 'keys') return { shortcuts: payload.shortcuts, localStorageKeys: payload.localStorageKeys };
                              return payload;
                            })();

                            const tabText = JSON.stringify(tabPayload, null, 2);
                            const allText = JSON.stringify(payload, null, 2);

                            return (
                              <>
                                <div style={{ gridRow: '1', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                                  EXPORT
                                </div>

                                <div style={{ gridRow: '2', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 6, padding: '0 6px', overflow: 'hidden', minWidth: 0 }}>
                                  {exportTabs.map((t) => {
                                    const active = String(exportTab || 'all') === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setExportTab(t.id);
                                        }}
                                        style={{ height: 18, padding: '0 8px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.15)', background: active ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: active ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                                      >
                                        {t.label}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div style={{ gridRow: '3 / span 12', gridColumn: '1', width: '100%', height: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 8, background: 'rgba(255,255,255,0.55)', minWidth: 0, overflow: 'auto' }}>
                                  {sections.map((s) => {
                                    const sectionText = JSON.stringify(s.data, null, 2);
                                    return (
                                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 6px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(2,6,23,0.70)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.label}>
                                          {s.label}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportModalTitle(String(s.label || ''));
                                              setExportModalText(sectionText);
                                              setExportModalOpen(true);
                                            }}
                                            style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            VIEW
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportCopyStatus('copying');
                                              doCopyText(sectionText).then((ok) => {
                                                setExportCopyStatus(ok ? 'copied' : 'idle');
                                                window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                              });
                                            }}
                                            style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.35)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', transition: 'background 150ms ease, color 150ms ease' }}
                                          >
                                            {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(2,6,23,0.55)', padding: '4px 6px', lineHeight: '12px' }}>
                                    {sections.length ? `${sections.length} sections` : '—'}
                                  </div>
                                </div>

                                <div style={{ gridRow: '15', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', minWidth: 0, overflow: 'hidden' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportModalTitle(`tab:${String(exportTab || 'all')}`);
                                        setExportModalText(tabText);
                                        setExportModalOpen(true);
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                    >
                                      VIEW TAB
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportCopyStatus('copying');
                                        doCopyText(tabText).then((ok) => {
                                          setExportCopyStatus(ok ? 'copied' : 'idle');
                                          window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                        });
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.35)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap', transition: 'background 150ms ease, color 150ms ease' }}
                                    >
                                      {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY TAB'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportCopyStatus('copying');
                                        doCopyText(allText).then((ok) => {
                                          setExportCopyStatus(ok ? 'copied' : 'idle');
                                          window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                        });
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                    >
                                      COPY ALL
                                    </button>
                                  </div>
                                </div>

                                {exportModalOpen ? (
                                  <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(2,6,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
                                    onClick={() => setExportModalOpen(false)}
                                    role="presentation"
                                  >
                                    <div
                                      style={{ width: 'min(980px, 96vw)', height: 'min(760px, 88vh)', background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                                      onClick={(e) => e.stopPropagation()}
                                      role="presentation"
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.10)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(2,6,23,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                          {exportModalTitle || 'EXPORT'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportCopyStatus('copying');
                                              doCopyText(exportModalText).then((ok) => {
                                                setExportCopyStatus(ok ? 'copied' : 'idle');
                                                window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                              });
                                            }}
                                            style={{ height: 22, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,1)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.75)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportModalOpen(false);
                                            }}
                                            style={{ height: 22, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)', background: 'rgba(255,255,255,1)', color: 'rgba(0,0,0,0.75)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            CLOSE
                                          </button>
                                        </div>
                                      </div>
                                      <textarea
                                        readOnly
                                        value={exportModalText}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        style={{ flex: 1, width: '100%', height: '100%', resize: 'none', border: 0, borderRadius: 0, padding: 12, background: 'transparent', color: 'rgba(2,6,23,0.78)', fontSize: 11, fontWeight: 700, outline: 'none', lineHeight: '14px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}

                        <div style={{ gridRow: '1', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          OVERLAY
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          STRIPE
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          DEBUG
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>drawingOverlay</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDrawingOverlayDxDraft}
                              onFocus={() => { megaStripeDrawingOverlayDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayDxDraft);
                                if (n === null) {
                                  setMegaStripeDrawingOverlayDxDraft(String(megaStripeDrawingOverlayDx));
                                  return;
                                }
                                setMegaStripeDrawingOverlayDx(n);
                                writeCalibrationToMap(megaShirtDrawingOverlaySrc, { dx: n });
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDrawingOverlayDyDraft}
                              onFocus={() => { megaStripeDrawingOverlayDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayDyDraft);
                                if (n === null) {
                                  setMegaStripeDrawingOverlayDyDraft(String(megaStripeDrawingOverlayDy));
                                  return;
                                }
                                setMegaStripeDrawingOverlayDy(n);
                                writeCalibrationToMap(megaShirtDrawingOverlaySrc, { dy: n });
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 56, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeDrawingOverlayScaleDraft}
                              onFocus={() => { megaStripeDrawingOverlayScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeDrawingOverlayScaleDraft(String(megaStripeDrawingOverlayScale));
                                  return;
                                }
                                setMegaStripeDrawingOverlayScale(clampScale(n, 1));
                                writeCalibrationToMap(megaShirtDrawingOverlaySrc, { scale: clampScale(n, 1) });
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                const fallbackCopy = (value) => {
                                  try {
                                    const ta = document.createElement('textarea');
                                    ta.value = String(value || '');
                                    ta.setAttribute('readonly', '');
                                    ta.style.position = 'fixed';
                                    ta.style.left = '-9999px';
                                    document.body.appendChild(ta);
                                    ta.select();
                                    const ok = document.execCommand('copy');
                                    document.body.removeChild(ta);
                                    return ok;
                                  } catch {
                                    return false;
                                  }
                                };
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const payload = JSON.stringify({
                                    dx: Number.isFinite(megaStripeDrawingOverlayDx) ? megaStripeDrawingOverlayDx : 0,
                                    dy: Number.isFinite(megaStripeDrawingOverlayDy) ? megaStripeDrawingOverlayDy : 0,
                                    scale: Number.isFinite(megaStripeDrawingOverlayScale) && megaStripeDrawingOverlayScale > 0 ? megaStripeDrawingOverlayScale : 1,
                                  });
                                  const run = async () => {
                                    try {
                                      if (navigator?.clipboard?.writeText) {
                                        await navigator.clipboard.writeText(payload);
                                        return true;
                                      }
                                      return fallbackCopy(payload);
                                    } catch {
                                      return fallbackCopy(payload);
                                    }
                                  };
                                  run();
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              COPY
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                const apply = (next) => {
                                  try {
                                    const dx = Number.parseFloat(String(next?.dx));
                                    const dy = Number.parseFloat(String(next?.dy));
                                    const scale = Number.parseFloat(String(next?.scale));
                                    const dxOk = Number.isFinite(dx) ? dx : 0;
                                    const dyOk = Number.isFinite(dy) ? dy : 0;
                                    const scOk = Number.isFinite(scale) && scale > 0 ? clampScale(scale, 1) : 1;
                                    setMegaStripeDrawingOverlayDx(dxOk);
                                    setMegaStripeDrawingOverlayDy(dyOk);
                                    setMegaStripeDrawingOverlayScale(scOk);
                                    setMegaStripeDrawingOverlayDxDraft(String(dxOk));
                                    setMegaStripeDrawingOverlayDyDraft(String(dyOk));
                                    setMegaStripeDrawingOverlayScaleDraft(String(scOk));
                                  } catch {
                                    // ignore
                                  }
                                };
                                const parseText = (raw) => {
                                  try {
                                    const s = String(raw || '').trim();
                                    if (!s) return null;
                                    if (s.startsWith('{') || s.startsWith('[')) {
                                      const parsed = JSON.parse(s);
                                      if (Array.isArray(parsed)) {
                                        return { dx: parsed[0], dy: parsed[1], scale: parsed[2] };
                                      }
                                      if (parsed && typeof parsed === 'object') {
                                        return { dx: parsed.dx, dy: parsed.dy, scale: parsed.scale };
                                      }
                                    }
                                    const parts = s.split(/[,\s]+/g).filter(Boolean);
                                    if (parts.length >= 3) {
                                      return { dx: parts[0], dy: parts[1], scale: parts[2] };
                                    }
                                    return null;
                                  } catch {
                                    return null;
                                  }
                                };
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const run = async () => {
                                    let text = '';
                                    try {
                                      if (navigator?.clipboard?.readText) {
                                        text = await navigator.clipboard.readText();
                                      }
                                    } catch {
                                      text = '';
                                    }
                                    if (!text) {
                                      try {
                                        text = String(window.prompt('Paste drawingOverlay as JSON {dx,dy,scale} or "dx dy scale"', '') || '').trim();
                                      } catch {
                                        text = '';
                                      }
                                    }
                                    const parsed = parseText(text);
                                    if (parsed) apply(parsed);
                                  };
                                  run();
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              PASTE
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMegaShirtDrawingEnabled((v) => !v);
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaShirtDrawingEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaShirtDrawingEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {megaShirtDrawingEnabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '20', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>drawing src</div>
                          <input
                            value={megaShirtDrawingOverlaySrc}
                            placeholder="/custom_logos/..."
                            onChange={(e) => {
                              try {
                                const v = String(e.target.value || '');
                                const s = v.trim();
                                const normalized = (() => {
                                  try {
                                    const idx = s.lastIndexOf('/public/custom_logos/');
                                    if (idx >= 0) {
                                      const suffix = s.slice(idx + '/public'.length);
                                      if (suffix.startsWith('/custom_logos/')) return suffix;
                                    }
                                    const idx2 = s.lastIndexOf('/custom_logos/');
                                    if (idx2 > 0 && !s.startsWith('/custom_logos/')) {
                                      const suffix = s.slice(idx2);
                                      if (suffix.startsWith('/custom_logos/')) return suffix;
                                    }
                                    const file = (s.split('/').filter(Boolean).pop() || '').trim();
                                    const lower = file.toLowerCase();
                                    const isBare = s === file || s === `/${file}`;
                                    if (isBare && /^keep-calm-.*-stripe\.webp$/i.test(file)) {
                                      const folder = lower.includes('-b-stripe')
                                        ? 'black'
                                        : lower.includes('-w-stripe')
                                          ? 'white'
                                          : (lower.includes('multi') || lower.includes('-multi-'))
                                            ? 'color'
                                            : 'color';
                                      return `/custom_logos/drawings/images_stripe/austen/keep_calm/${folder}/${file}`;
                                    }
                                    return s;
                                  } catch {
                                    return s;
                                  }
                                })();
                                setMegaShirtDrawingOverlaySrc(normalized);
                                if (!normalized) return;
                                const sLower = normalized.toLowerCase();
                                const isStripeSrc = sLower.includes('/custom_logos/drawings/images_stripe/') || sLower.includes('/custom_logos/drawings/images_originals/stripe/');
                                if (!isStripeSrc) return;
                                window.localStorage.setItem('HG_DRAWING_OVERLAY_SRC', normalized);
                                window.dispatchEvent(new Event('hg-drawing-overlay-changed'));
                              } catch {
                                // ignore
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>stripeOverlayDebug(URL)</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 0, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const sp = new URLSearchParams(location.search || '');
                                  const has = sp.has('stripeOverlayDebug');
                                  const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase();
                                  const on = has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes');
                                  const next = new URLSearchParams(location.search || '');
                                  if (on) next.delete('stripeOverlayDebug');
                                  else next.set('stripeOverlayDebug', '1');
                                  const qs = next.toString();
                                  navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                } catch {
                                }
                              }}
                              style={{ height: 20, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: (() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); return has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes') ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)'; })(), color: (() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); return has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes') ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)'; })(), fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {(() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); const on = has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes'); return on ? 'ON' : 'OFF'; })()}
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const snap = stripeOverlayDebugSnapshot;
                          const disabled = !stripeOverlayDebugOn;
                          const lsDrawingEnabledRaw = (() => {
                            try {
                              const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
                              if (rawNew != null) return rawNew;
                              const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
                              if (rawOld != null) return rawOld;
                              return '';
                            } catch {
                              return '';
                            }
                          })();
                          const lsDrawingEnabledOn = (() => {
                            try {
                              const s = (lsDrawingEnabledRaw == null) ? '' : String(lsDrawingEnabledRaw).trim().toLowerCase();
                              if (!s) return null;
                              return s === '1' || s === 'true' || s === 'on' || s === 'yes';
                            } catch {
                              return null;
                            }
                          })();
                          const formatActiveLabel = (value) => {
                            try {
                              const v = (value == null) ? '' : String(value);
                              const key = v.trim().toLowerCase();
                              if (!key) return '—';
                              if (key === 'miscellania') return 'Miscel·lània';
                              if (key === 'first_contact') return 'First Contact';
                              if (key === 'the_human_inside') return 'The Human Inside';
                              if (key === 'austen') return 'Austen';
                              if (key === 'cube') return 'Cube';
                              return v;
                            } catch {
                              return String(value || '—');
                            }
                          };
                          const debugPairs = [
                            ['stripeOverlayDebug', snap ? String(Boolean(snap.stripeOverlayDebug)) : '—'],
                            ['showStripe', snap ? String(Boolean(snap.showStripe)) : '—'],
                            ['active', snap ? formatActiveLabel(snap.active || '') : '—'],
                            ['loadState', snap ? String(snap.stripeOverlayLoadState || '') : '—'],
                            ['stripeWide', snap ? String(Boolean(snap.stripeOverlayIsStripeWide)) : '—'],
                            ['stripeWide(derived)', snap && snap.stripeOverlayIsStripeWideDerived !== null ? String(Boolean(snap.stripeOverlayIsStripeWideDerived)) : '—'],
                            ['stripeWide(measured)', snap && snap.stripeOverlayIsStripeWideMeasured !== null ? String(Boolean(snap.stripeOverlayIsStripeWideMeasured)) : '—'],
                            ['resolvedOverlaySrc', snap ? (snap.resolvedOverlaySrc ? 'yes' : 'no') : '—'],
                            ['HG_SHIRT_DRAWING', lsDrawingEnabledOn === null ? '—' : (lsDrawingEnabledOn ? 'ON' : 'OFF')],
                          ];

                          return (
                            <>
                              {debugPairs.map(([k, v], idx) => {
                                const row = String(3 + idx);
                                return (
                                  <div
                                    key={`stripeOverlayDebug-${k}`}
                                    style={{
                                      gridRow: row,
                                      gridColumn: '6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 6,
                                      padding: '0 6px',
                                      paddingLeft: 30,
                                      minWidth: 0,
                                      height: 'var(--megaStripeHudCellHPx)',
                                      overflow: 'hidden',
                                      opacity: disabled ? 0.35 : 1,
                                    }}
                                  >
                                    <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '16px' }} title={String(k)}>
                                      {String(k)}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'right', lineHeight: '16px' }} title={String(v)}>
                                      {String(v)}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}

                        <div style={{ gridRow: '2', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sprite</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDxDraft}
                              onFocus={() => { megaStripeDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDxDraft);
                                if (n === null) {
                                  setMegaStripeDxDraft(String(megaStripeDx));
                                  return;
                                }
                                setMegaStripeDx(n);
                              }}
                              onChange={(e) => setMegaStripeDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDyDraft}
                              onFocus={() => { megaStripeDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDyDraft);
                                if (n === null) {
                                  setMegaStripeDyDraft(String(megaStripeDy));
                                  return;
                                }
                                setMegaStripeDy(n);
                              }}
                              onChange={(e) => setMegaStripeDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeScaleDraft}
                              onFocus={() => { megaStripeScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeScaleDraft(String(megaStripeScale));
                                  return;
                                }
                                setMegaStripeScale(clampScale(n, 1.2125));
                              }}
                              onChange={(e) => setMegaStripeScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeSpriteEnabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeSpriteEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeSpriteEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeSpriteEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '4', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>REF</div>
                            <select
                              value={String(megaStripeRefCollection || 'first_contact')}
                              onChange={(e) => {
                                try {
                                  const k = String(e.target.value || 'first_contact');
                                  setMegaStripeRefCollection(k);
                                  setMegaStripeRefEnabled((prev) => (prev ? prev : true));
                                  setMegaStripeRefSrc((prev) => {
                                    const cur = (prev == null) ? '' : String(prev);
                                    if (cur.trim()) return cur;
                                    const presets = megaStripeRefPresets?.[k] || [];
                                    const first = Array.isArray(presets) ? presets[0] : null;
                                    const src = first?.src ? normalizeMegaStripeRefSrc(first.src) : '';
                                    return src || cur;
                                  });
                                } catch {
                                  // ignore
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              style={{ height: 18, flex: '0 0 auto', minWidth: 110, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6, background: 'rgba(255,255,255,0.50)', fontSize: 10, fontWeight: 900, color: 'rgba(0,0,0,0.70)', padding: '0 6px', outline: 'none' }}
                            >
                              {['first_contact', 'thin', 'austen', 'cube', 'miscellania'].map((k) => (
                                <option key={k} value={k}>
                                  {k}
                                </option>
                              ))}
                            </select>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRefDxDraft}
                              onFocus={() => { megaStripeRefDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefDxDraft);
                                if (n === null) {
                                  setMegaStripeRefDxDraft(String(megaStripeRefDx));
                                  return;
                                }
                                setMegaStripeRefDx(n);
                              }}
                              onChange={(e) => setMegaStripeRefDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRefDyDraft}
                              onFocus={() => { megaStripeRefDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefDyDraft);
                                if (n === null) {
                                  setMegaStripeRefDyDraft(String(megaStripeRefDy));
                                  return;
                                }
                                setMegaStripeRefDy(n);
                              }}
                              onChange={(e) => setMegaStripeRefDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 52, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeRefScaleDraft}
                              onFocus={() => { megaStripeRefScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeRefScaleDraft(String(megaStripeRefScale));
                                  return;
                                }
                                setMegaStripeRefScale(clampScale(n, 1));
                              }}
                              onChange={(e) => setMegaStripeRefScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeRefEnabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeRefEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeRefEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeRefEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '5', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>REF2</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRef2DxDraft}
                              onFocus={() => { megaStripeRef2DxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2DxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2DxDraft);
                                if (n === null) {
                                  setMegaStripeRef2DxDraft(String(megaStripeRef2Dx));
                                  return;
                                }
                                setMegaStripeRef2Dx(n);
                              }}
                              onChange={(e) => setMegaStripeRef2DxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRef2DyDraft}
                              onFocus={() => { megaStripeRef2DyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2DyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2DyDraft);
                                if (n === null) {
                                  setMegaStripeRef2DyDraft(String(megaStripeRef2Dy));
                                  return;
                                }
                                setMegaStripeRef2Dy(n);
                              }}
                              onChange={(e) => setMegaStripeRef2DyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 52, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeRef2ScaleDraft}
                              onFocus={() => { megaStripeRef2ScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2ScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2ScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeRef2ScaleDraft(String(megaStripeRef2Scale));
                                  return;
                                }
                                setMegaStripeRef2Scale(clampScale(n, 1));
                              }}
                              onChange={(e) => setMegaStripeRef2ScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeRef2Enabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeRef2Enabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeRef2Enabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeRef2Enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '15', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ref src</div>
                          <input
                            value={String(megaStripeRefSrc || '')}
                            placeholder="/tmp/... o https://..."
                            onChange={(e) => {
                              const v = e.target.value;
                              setMegaStripeRefEnabled(true);
                              setMegaStripeRefSrc(normalizeMegaStripeRefSrc(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '16', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ref2 src</div>
                          <input
                            value={String(megaStripeRef2Src || '')}
                            placeholder="/tmp/... o https://..."
                            onChange={(e) => {
                              const v = e.target.value;
                              setMegaStripeRef2Enabled(true);
                              setMegaStripeRef2Src(normalizeMegaStripeRefSrc(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '6', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Tile</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>g:</div>
                            <input
                              type="text"
                              value={megaStripeTileGapPxDraft}
                              onFocus={() => { megaStripeTileGapPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeTileGapPxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeTileGapPxDraft);
                                if (n === null) {
                                  setMegaStripeTileGapPxDraft(String(megaStripeTileGapPx || 0));
                                  return;
                                }
                                setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n)));
                              }}
                              onChange={(e) => setMegaStripeTileGapPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                            />
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '11', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>extend</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>t:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendTopPxDraft}
                              onFocus={() => { megaTileSelectorExtendTopPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendTopPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendTopPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendTopPxDraft(String(megaTileSelectorExtendTopPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendTopPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendTopPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>r:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendRightPxDraft}
                              onFocus={() => { megaTileSelectorExtendRightPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendRightPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendRightPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendRightPxDraft(String(megaTileSelectorExtendRightPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendRightPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendRightPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>b:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendBottomPxDraft}
                              onFocus={() => { megaTileSelectorExtendBottomPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendBottomPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendBottomPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendBottomPxDraft(String(megaTileSelectorExtendBottomPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendBottomPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendBottomPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>l:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendLeftPxDraft}
                              onFocus={() => { megaTileSelectorExtendLeftPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendLeftPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendLeftPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendLeftPxDraft(String(megaTileSelectorExtendLeftPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendLeftPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendLeftPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '10', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>radius</div>
                            <input
                              type="text"
                              value={megaTileSelectorRadiusPxDraft}
                              onFocus={() => { megaTileSelectorRadiusPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorRadiusPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorRadiusPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorRadiusPxDraft(String(megaTileSelectorRadiusPx || 0));
                                  return;
                                }
                                setMegaTileSelectorRadiusPx(Math.min(200, Math.max(0, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorRadiusPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '4', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SELECTOR</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMegaTileSelectorV1Enabled((v) => !v);
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaTileSelectorV1Enabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaTileSelectorV1Enabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              v1
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMegaTileSelectorEnabled((v) => !v);
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaTileSelectorEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaTileSelectorEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              v2
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '5', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>target</div>
                          <input
                            value={String(megaTileSelectorTarget || '')}
                            placeholder="NCC-1701-D"
                            onChange={(e) => setMegaTileSelectorTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '6', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>size</div>
                            <input
                              type="text"
                              value={megaTileSelectorSizePxDraft}
                              onFocus={() => { megaTileSelectorSizePxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorSizePxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorSizePxDraft);
                                if (n === null) {
                                  setMegaTileSelectorSizePxDraft(String(megaTileSelectorSizePx || 0));
                                  return;
                                }
                                setMegaTileSelectorSizePx(Math.min(800, Math.max(20, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorSizePxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') {
                                  setMegaTileSelectorSizePxDraft(String(megaTileSelectorSizePx || 0));
                                  e.currentTarget.blur();
                                }
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '7', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>stroke</div>
                            <input
                              type="text"
                              value={megaTileSelectorStrokePxDraft}
                              onFocus={() => { megaTileSelectorStrokePxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStrokePxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStrokePxDraft);
                                if (n === null) {
                                  setMegaTileSelectorStrokePxDraft(String(megaTileSelectorStrokePx || 0));
                                  return;
                                }
                                setMegaTileSelectorStrokePx(Math.min(80, Math.max(0, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStrokePxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') {
                                  setMegaTileSelectorStrokePxDraft(String(megaTileSelectorStrokePx || 0));
                                  e.currentTarget.blur();
                                }
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '8', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0 }}>color</div>
                          <input
                            value={String(megaTileSelectorColor || '')}
                            placeholder="black"
                            onChange={(e) => setMegaTileSelectorColor(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '9', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>grid</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              value={megaTileSelectorStepXDraft}
                              onFocus={() => { megaTileSelectorStepXInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStepXInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStepXDraft);
                                if (n === null) {
                                  setMegaTileSelectorStepXDraft(String(megaTileSelectorStepX || 0));
                                  return;
                                }
                                setMegaTileSelectorStepX(Math.min(99, Math.max(-99, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStepXDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              value={megaTileSelectorStepYDraft}
                              onFocus={() => { megaTileSelectorStepYInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStepYInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStepYDraft);
                                if (n === null) {
                                  setMegaTileSelectorStepYDraft(String(megaTileSelectorStepY || 0));
                                  return;
                                }
                                setMegaTileSelectorStepY(Math.min(99, Math.max(-99, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStepYDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '3 / span 15', gridColumn: '2 / span 2', padding: 0, minWidth: 0, height: '100%', overflow: 'hidden', display: 'none' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                              gridAutoRows: 'var(--megaStripeHudCellHPx)',
                              columnGap: 0,
                              rowGap: 0,
                              alignItems: 'center',
                              alignContent: 'start',
                              position: 'relative',
                              zIndex: 1,
                              minWidth: 0,
                            }}
                          >
                            {(() => {
                              try {
                                const sp = new URLSearchParams(location.search || '');
                                const ignored = new Set(['layout', 'guides', 'stripeOverlayDebug']);
                                const allEntries = Array.from(sp.entries())
                                  .filter(([k]) => k && !ignored.has(String(k)))
                                  .sort((a, b) => {
                                    const rank = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      if (s.includes('stripe')) return 0;
                                      if (s.includes('overlay')) return 1;
                                      if (s.includes('ref')) return 2;
                                      if (s.includes('grid')) return 3;
                                      return 9;
                                    };
                                    const axisRank = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      if (/(^|[-_])(dx|x)$/.test(s)) return 0;
                                      if (/(^|[-_])(dy|y)$/.test(s)) return 1;
                                      if (/(^|[-_])(scale|s)$/.test(s)) return 2;
                                      if (s.includes('dx') && !s.includes('dy')) return 0;
                                      if (s.includes('dy') && !s.includes('dx')) return 1;
                                      if (s.includes('scale')) return 2;
                                      return 9;
                                    };
                                    const baseKey = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      return s
                                        .replace(/(^|[-_])(dx|dy|x|y|scale|s)$/i, '')
                                        .replace(/(dx|dy|scale)\b/gi, '')
                                        .replace(/\b(x|y|s)\b/gi, '')
                                        .replace(/[-_]+$/g, '')
                                        .trim();
                                    };
                                    const ra = rank(a[0]);
                                    const rb = rank(b[0]);
                                    if (ra !== rb) return ra - rb;

                                    const ba = baseKey(a[0]);
                                    const bb = baseKey(b[0]);
                                    if (ba !== bb) return ba.localeCompare(bb);

                                    const aa = axisRank(a[0]);
                                    const ab = axisRank(b[0]);
                                    if (aa !== ab) return aa - ab;

                                    return String(a[0]).localeCompare(String(b[0]));
                                  });

                                const isBoolLike = (v) => {
                                  const s = (v == null) ? '' : String(v).trim().toLowerCase();
                                  return s === '' || s === '0' || s === '1' || s === 'true' || s === 'false' || s === 'on' || s === 'off' || s === 'yes' || s === 'no';
                                };
                                const boolOn = (v) => {
                                  const s = (v == null) ? '' : String(v).trim().toLowerCase();
                                  if (s === '' || s === '1' || s === 'true' || s === 'on' || s === 'yes') return true;
                                  return false;
                                };

                                const isLongish = (key, val) => {
                                  try {
                                    const k = (key == null) ? '' : String(key);
                                    const v = (val == null) ? '' : String(val);
                                    if (v.length >= 34) return true;
                                    if (k.toLowerCase().includes('src')) return true;
                                    if (k.toLowerCase().includes('path')) return true;
                                    if (v.includes('/') || v.includes('http://') || v.includes('https://')) return true;
                                    return false;
                                  } catch {
                                    return false;
                                  }
                                };

                                const nonLongEntries = allEntries.filter(([k, v]) => !isLongish(k, v));
                                const boolEntries = [];
                                const valueEntries = [];
                                nonLongEntries.forEach(([k, v]) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  if (isBoolLike(val)) boolEntries.push([key, val]);
                                  else valueEntries.push([key, val]);
                                });

                                const valueSlots = [];
                                for (let col = 1; col <= 2; col += 1) {
                                  for (let row = 1; row <= 13; row += 2) {
                                    valueSlots.push({ col, row });
                                  }
                                }

                                const boolSlots = [];
                                for (let col = 2; col >= 1; col -= 1) {
                                  for (let row = 1; row <= 13; row += 1) {
                                    boolSlots.push({ col, row });
                                  }
                                }

                                const occupied = new Set();
                                const placements = [];

                                valueEntries.forEach(([key, val], idx) => {
                                  const slot = valueSlots[idx];
                                  if (!slot) return;
                                  occupied.add(`${slot.col}-${slot.row}`);
                                  occupied.add(`${slot.col}-${slot.row + 1}`);
                                  placements.push({ key, val, boolLike: false, col: slot.col, row: slot.row });
                                });

                                let boolCursor = 0;
                                boolEntries.forEach(([key, val]) => {
                                  while (boolCursor < boolSlots.length) {
                                    const slot = boolSlots[boolCursor];
                                    boolCursor += 1;
                                    if (occupied.has(`${slot.col}-${slot.row}`)) continue;
                                    occupied.add(`${slot.col}-${slot.row}`);
                                    placements.push({ key, val, boolLike: true, col: slot.col, row: slot.row });
                                    break;
                                  }
                                });

                                placements.sort((a, b) => {
                                  if (a.col !== b.col) return a.col - b.col;
                                  return a.row - b.row;
                                });

                                return placements.map(({ key, val, boolLike, col, row }) => {
                                  const keyStr = String(key);
                                  const valStr = (val == null) ? '' : String(val);
                                  const on = boolLike ? boolOn(valStr) : false;

                                  if (boolLike) {
                                    return (
                                      <div key={keyStr} style={{ gridColumn: String(col), gridRow: String(row), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', padding: '0 6px', paddingLeft: 30 }}>
                                        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }} title={keyStr}>
                                          {keyStr}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            try {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const next = new URLSearchParams(location.search || '');
                                              if (on) next.set(keyStr, '0');
                                              else next.set(keyStr, '1');
                                              navigate(`${location.pathname}?${next.toString()}`, { replace: true });
                                            } catch {
                                              // ignore
                                            }
                                          }}
                                          style={{
                                            height: 16,
                                            padding: '0 6px',
                                            borderRadius: 4,
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            background: on ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)',
                                            color: on ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)',
                                            fontSize: 10,
                                            fontWeight: 900,
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {on ? 'ON' : 'OFF'}
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={keyStr} style={{ gridColumn: String(col), gridRow: String(row), gridRowEnd: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, minWidth: 0, height: '100%', padding: '4px 6px', paddingLeft: 30 }}>
                                      <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '14px' }} title={keyStr}>
                                        {keyStr}
                                      </div>
                                      <input
                                        defaultValue={valStr}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(keyStr);
                                            else next.set(keyStr, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ height: 16, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                      />
                                    </div>
                                  );
                                });
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </div>

                        {null}

                        {(() => {
                          try {
                            const sp = new URLSearchParams(location.search || '');
                            const ignored = new Set(['layout', 'guides', 'stripeOverlayDebug']);
                            const entries = Array.from(sp.entries())
                              .filter(([k]) => k && !ignored.has(String(k)))
                              .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

                            const normalizeOverlaySrcLocal = (value) => {
                              try {
                                let s = (value || '').toString().trim();
                                if (!s) return '';
                                if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'))) {
                                  s = s.slice(1, -1).trim();
                                }
                                if (!s) return '';
                                if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
                                return s.startsWith('/') ? s : `/${s}`;
                              } catch {
                                return '';
                              }
                            };

                            const lsDrawingSrc = (() => {
                              try {
                                return String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
                              } catch {
                                return '';
                              }
                            })();
                            const lsLongEntries = [
                              ['HG_DRAWING_OVERLAY_SRC', lsDrawingSrc || '—'],
                              ['HG_DRAWING_OVERLAY_SRC(norm)', lsDrawingSrc ? normalizeOverlaySrcLocal(lsDrawingSrc) : '—'],
                            ];

                            const isLongish = (key, val) => {
                              try {
                                const k = (key == null) ? '' : String(key);
                                const v = (val == null) ? '' : String(val);
                                if (v.length >= 34) return true;
                                if (k.toLowerCase().includes('src')) return true;
                                if (k.toLowerCase().includes('path')) return true;
                                if (v.includes('/') || v.includes('http://') || v.includes('https://')) return true;
                                return false;
                              } catch {
                                return false;
                              }
                            };

                            const isDebugEntry = (key) => {
                              try {
                                return String(key || '').toLowerCase().includes('debug');
                              } catch {
                                return false;
                              }
                            };

                            const longEntriesAll = entries.filter(([k, v]) => isLongish(k, v));
                            const longDebugEntries = longEntriesAll.filter(([k]) => isDebugEntry(k)).slice(0, 3);
                            const longEntries = [
                              ...lsLongEntries,
                              ...longEntriesAll.filter(([k]) => !isDebugEntry(k) && !lsLongEntries.some(([lk]) => String(lk) === String(k))),
                            ].slice(0, 3);

                            const resolvedOverlaySrcValue = (() => {
                              try {
                                const v = stripeOverlayDebugSnapshot?.resolvedOverlaySrc;
                                if (!stripeOverlayDebugSnapshot) return '—';
                                return v == null ? '—' : String(v);
                              } catch {
                                return stripeOverlayDebugSnapshot ? '' : '—';
                              }
                            })();

                            return (
                              <>
                                <div style={{ gridRow: '17', gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative', opacity: stripeOverlayDebugOn ? 1 : 0.35 }}>
                                  <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }} title="resolvedOverlaySrc">
                                    resolvedOverlaySrc
                                  </div>
                                  <input
                                    value={resolvedOverlaySrcValue}
                                    readOnly
                                    placeholder="(enable stripeOverlayDebug=1)"
                                    onClick={(e) => {
                                      try {
                                        e.stopPropagation();
                                        e.currentTarget.select?.();
                                      } catch {
                                        // ignore
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                  />
                                </div>

                                {longEntries.map(([k, v], idx) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  const row = (() => {
                                    if (key === 'HG_DRAWING_OVERLAY_SRC') return '19';
                                    if (key === 'HG_DRAWING_OVERLAY_SRC(norm)') return '18';
                                    return String(16 - idx);
                                  })();
                                  const isReadOnly = key === 'HG_DRAWING_OVERLAY_SRC' || key === 'HG_DRAWING_OVERLAY_SRC(norm)';
                                  return (
                                    <div key={key} style={{ gridRow: row, gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative' }}>
                                      <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }} title={key}>
                                        {key}
                                      </div>
                                      <input
                                        {...(isReadOnly ? { value: val, readOnly: true } : { defaultValue: val })}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          if (isReadOnly) return;
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(key);
                                            else next.set(key, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                      />
                                    </div>
                                  );
                                })}

                                {longDebugEntries.map(([k, v], idx) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  const row = String(17 - idx);
                                  return (
                                    <div key={`debug-${key}`} style={{ gridRow: row, gridColumn: '6', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, padding: '2px 6px', minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden' }}>
                                      <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '12px' }} title={key}>
                                        {key}
                                      </div>
                                      <input
                                        defaultValue={val}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(key);
                                            else next.set(key, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0, lineHeight: '14px' }}
                                      />
                                    </div>
                                  );
                                })}

                                {null}
                              </>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>

                      <div style={{ height: `calc(${HUD_DEBUG_BOTTOM_RESERVE_PX}px + env(safe-area-inset-bottom, 0px))` }} />
                    </div>

                    <div style={{ minWidth: 0, border: '1px solid rgba(0,0,0,0.45)', background: 'rgba(239,68,68,0.06)', padding: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.70)', marginBottom: 8 }}>ASSETS/REF</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
                          {['first_contact', 'thin', 'austen', 'cube', 'miscellania'].map((k) => {
                            const active = String(megaStripeRefCollection || 'first_contact') === k;
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMegaStripeRefCollection(k);
                                  setMegaStripeRefEnabled((prev) => (prev ? prev : true));
                                  setMegaStripeRefSrc((prev) => {
                                    const cur = (prev == null) ? '' : String(prev);
                                    if (cur.trim()) return cur;
                                    const presets = megaStripeRefPresets?.[k] || [];
                                    const first = Array.isArray(presets) ? presets[0] : null;
                                    const src = first?.src ? normalizeMegaStripeRefSrc(first.src) : '';
                                    return src || cur;
                                  });
                                }}
                                style={{
                                  height: 22,
                                  padding: '0 6px',
                                  borderRadius: 4,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  background: active ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.35)',
                                  color: 'rgba(0,0,0,0.80)',
                                  fontSize: 10,
                                  fontWeight: 900,
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {k.replace('_', ' ').toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        {(() => {
                          const colKey = String(megaStripeRefCollection || 'first_contact');
                          const allPresets = (megaStripeRefPresets[colKey] || []);
                          const isAusten = colKey === 'austen';
                          const presets = isAusten ? allPresets : allPresets.slice(0, megaStripeHudMaxRefPresets);

                          const columns = 2;
                          const perCol = Math.ceil(presets.length / columns);
                          const cols = Array.from({ length: columns }, (_, i) => presets.slice(i * perCol, (i + 1) * perCol));

                          const presetBtnHeight = isAusten ? 18 : 22;
                          const presetBtnFontSize = isAusten ? 11 : 12;
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8 }}>
                              {cols.map((items, colIdx) => (
                                <div key={`col-${colIdx}`} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                                  {items.map((p) => (
                                    <button
                                      key={p.key}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMegaStripeRefEnabled(true);
                                        setMegaStripeRefSrc(normalizeMegaStripeRefSrc(p.src));
                                      }}
                                      style={{
                                        height: presetBtnHeight,
                                        padding: '0 6px',
                                        borderRadius: 4,
                                        border: '1px solid rgba(0,0,0,0.10)',
                                        background: 'rgba(255,255,255,0.35)',
                                        color: megaStripeRefSrc === normalizeMegaStripeRefSrc(p.src) ? 'rgba(239,68,68,1)' : 'rgba(0,0,0,0.80)',
                                        fontSize: presetBtnFontSize,
                                        fontWeight: 900,
                                        textAlign: 'left',
                                      }}
                                    >
                                      {String(p.key || '').replace(/\s*BW\s*$/i, '')}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
  );
}

export default MegaStripeHud;
