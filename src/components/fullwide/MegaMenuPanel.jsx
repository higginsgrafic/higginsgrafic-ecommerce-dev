import { lazy, Suspense, useRef, useEffect, useCallback, useState } from 'react';
/* El panell surt de la feina de seguida quan no hi ha cap colleccio
   activa (`if (!active) return null`), i aixo fa que el lint vegi tots
   els hooks del darrere com a condicionals. Es una manera de fer que ja
   hi era i que funciona, perque el panell nomes es munta amb colleccio
   activa; canviar-ho obligaria a refer el component sencer. */
/* eslint-disable react-hooks/rules-of-hooks */
import MegaStripeBleedGuard from './MegaStripeBleedGuard.jsx';
import MegaStripePanelP1 from './MegaStripePanelP1.jsx';
import { factorAlcadaMegaslide } from './midesMegaslide.js';
import { alcadaPanellMegaslide } from '../../utils/mesuraMegaslide.js';
import MegaslidePagina2 from '../megaslide/MegaslidePagina2.jsx';
import { alturaTaulaVertical, CapaTaulaVertical, TaulaVerticalP1 } from '../megaslide/TaulaVertical.jsx';
import { CercadorDibuixosGraella, dibuixosGraella16x4 } from './CercadorTextRow.jsx';
import { FirstContactDibuix00Buttons, FirstContactDibuix09Buttons } from './firstContactPanels.jsx';

const MegaslidePagina3 = lazy(() => import('../megaslide/MegaslidePagina3.jsx'));
const MegaslidePagina4 = lazy(() => import('../megaslide/MegaslidePagina4.jsx'));

// Pàgina 1: espai que queda entre la vora inferior de les samarretes i la vora
// inferior del panell. Aquest és el número a retocar si en vol més o menys.
const P1_STRIPE_BOTTOM_GAP = 30;

// Marge extra de la pestanya del megaslide a l'escriptori: les graelles de la
// banda estreta s'han menjat el coixí que quedava sota les samarretes i cal
// deixar-hi 20 px més d'aire. NO s'aplica a la tauleta apaisada (768-1366, que
// té la seva pròpia alçada de guarda) ni al mòbil.
const MARGE_EXTRA_DESKTOP_PX = 20;


// Memoria de l'alcada bona del panell. El mega-slide es munta i es desmunta cada
// cop que s'obre, i la mesura del contingut de la pagina 1 triga una estona a
// arribar i va canviant (476 -> 456 -> 417): allo es veia com un rebot. Guardant
// l'ultima alcada bona al navegador, el panell ja neix amb l'alcada correcta
// tambe despres de recarregar la pagina. Es per mida de finestra, perque
// l'alcada en depen.
const KEY_ALCADA = 'hg.megaPanelHeight.v1';
function llegirAlcadaDesada() {
  try {
    const cru = window.localStorage.getItem(KEY_ALCADA);
    if (!cru) return null;
    const d = JSON.parse(cru);
    if (d && d.w === window.innerWidth && d.h === window.innerHeight && typeof d.px === 'string') return d.px;
  } catch { /* ignore */ }
  return null;
}
function desarAlcada(px) {
  try {
    window.localStorage.setItem(KEY_ALCADA, JSON.stringify({ w: window.innerWidth, h: window.innerHeight, px }));
  } catch { /* ignore */ }
}

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
  isLandscapeTablet = false,
}) {
  if (!active) return null;

  // Dimensions i format de la finestra. Es calculen aquí dalt perquè els fan
  // servir tant la reserva d'alçada del panell com el càlcul de la guarda.
  const w = typeof window !== 'undefined' ? window.innerWidth : 0;
  const h = typeof window !== 'undefined' ? window.innerHeight : 0;
  const esVerticalAqui = w >= 768 && w <= 1366 && h > w;
  const esApaissadaAqui = w >= 768 && w <= 1366 && w >= h;
  const esMobilAqui = w < 768;
  // Marge extra de la pestanya a l'escriptori (vegeu MARGE_EXTRA_DESKTOP_PX).
  // S'aplica tant a la mesura com a la reserva, perquè el panell no faci cap
  // salt entre l'estat inicial i el calibrat.
  const margeExtraDesktop = (esVerticalAqui || esApaissadaAqui || esMobilAqui) ? 0 : MARGE_EXTRA_DESKTOP_PX;
  // L'alçada del panell a partir de la mesura de la pàgina 1: el càlcul viu a
  // mesuraMegaslide.js (funció pura, comprovable). Aquí només s'hi afegeix el
  // marge extra de l'escriptori i el format en px.
  // Sense `margeExtra`: els 20 px de marge ja els compensa el desplaçament del
  // contingut (que fa que la mesura de la pagina 1 sigui 20 px mes gran). Si
  // s'hi sumessin tambe aqui, es comptarien DUES vegades i el panell creixeria
  // 40 px en comptes de 20.
  const alcadaGuard = (p1Bottom) => alcadaPanellMegaslide({ p1ContentBottom: p1Bottom, gap: P1_STRIPE_BOTTOM_GAP });

  const viewport1Ref = useRef(null);
  const handlePortraitScroll1 = useCallback(() => {
    const viewport = viewport1Ref.current;
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
    window.dispatchEvent(new CustomEvent('mega-portrait-scroll', { detail: { progress } }));
  }, []);

  useEffect(() => {
    if (!isPortraitTablet) return undefined;
    const viewport = viewport1Ref.current;
    if (!viewport) return undefined;
    viewport.addEventListener('scroll', handlePortraitScroll1, { passive: true });
    return () => viewport.removeEventListener('scroll', handlePortraitScroll1);
  }, [isPortraitTablet, handlePortraitScroll1]);

  const page1SelectedItem = active === 'first_contact' ? firstContactSelectedItem
    : active === 'the_human_inside' ? humanInsideSelectedItem
    : (selectedItemByCollection?.[active] ?? null);
  // Factor d'alçada: encongeix la franja (i la seva reserva) a les finestres
  // baixes. Va a les DUES pàgines amb el mateix valor; si una el portés i
  // l'altra no, les franges es desquadrarien. A tauleta val 1 (vegeu
  // midesMegaslide.js): les dues orientacions han de donar la mateixa franja.
  const fitAlcada = factorAlcadaMegaslide(
    typeof window !== 'undefined' ? window.innerHeight : 0,
    isPortraitTablet || isLandscapeTablet,
  );
  const defaultBleedGuardHeight = effectiveMegaTileSize
    ? `${Math.round((effectiveMegaTileSize * 2 + 37 + Math.max(0, stripeRowPadPx)) * fitAlcada) + margeExtraDesktop}px`
    : undefined;
  // A vertical el contingut te la mateixa alcada que a horitzontal: el que
  // s'allarga el panell es la capcalera, que alla fa dues fileres. Ja no hi ha
  // una alcada propia del vertical.
  const bleedGuardHeight = defaultBleedGuardHeight;

  // El formulari de pagament necessita alçada per centrar-s'hi: a les dues
  // tauletes, obrir l'acordió estira la franja fins al peu de pantalla.
  // 112px = capçalera (80px) + padding vertical del panell (32px).
  // S'usa la prop isLandscapeTablet (detecció centralitzada a useDeviceLayout).
  const paymentFillsScreen = (isPortraitTablet || isLandscapeTablet) && megaPage === 3 && acordioExpanded;
  // L'acordió desplegat NO ha d'estirar el panell fins al peu de pantalla (ho
  // va veure l'amo: a les tauletes el megaslide quedava enganxat a baix de tot,
  // i fins i tot se n'anava mes enllà: 937 px en una pantalla de 1024 a la
  // vertical i 681 en una de 768 a l'apaisada). Amb l'alçada de sempre, el
  // panell es queda on toca i el contingut de l'acordió s'hi ajusta a dins.
  // `paymentFillsScreen` es conserva per a la resta d'usos (mesuraEstable).
  const guardHeightPxDefault = bleedGuardHeight;

  // Retall de la pàgina 1: el panell acaba P1_STRIPE_BOTTOM_GAP px sota el
  // bottom visible de les samarretes. La mesura ve de MegaStripePanelP1 (ja hi
  // inclou l'escala de la franja i el pageLift). 64 = py-8 (32+32) del
  // contenidor del panell. Mentre no hi ha mesura, s'usa l'alçada de sempre.
  const [p1ContentBottomPx, setP1ContentBottomPx] = useState(null);
  const [p1PageLift, setP1PageLift] = useState(0);
  const handleP1ContentBottom = useCallback((px) => {
    setP1ContentBottomPx((prev) => (prev != null && Math.abs(prev - px) < 0.5 ? prev : px));
  }, []);
  const handleP1PageLift = useCallback((px) => {
    setP1PageLift((prev) => (Math.abs(prev - px) < 0.5 ? prev : px));
  }, []);
  const matchesPage1Height = megaPage === 1 || megaPage === 2 || megaPage === 3 || megaPage === 4;
  // El rebot en obrir: l'alcada del panell surt d'una mesura del contingut de la
  // pagina 1 que va canviant mentre les imatges de la franja carreguen
  // (476 -> 456 -> 417). Com que el header creix amb el panell, allo es veu com
  // un rebot. Mentre la mesura no faci estona que no canvia, el panell es queda
  // amb l'alcada de reserva; aixi nome s canvia un cop, i no tres.
  const [alcadaRecordada] = useState(llegirAlcadaDesada);
  // Sempre arrenca "no estable": encara que tinguem una alcada recordada, cal
  // esperar que la mesura d'aquesta obertura tambe es quedi quieta. Si no, la
  // primera mesura (dolenta) s'aplicava de seguida i el panell saltava.
  const [mesuraEstable, setMesuraEstable] = useState(false);
  useEffect(() => {
    if (isPortraitTablet || paymentFillsScreen) {
      setMesuraEstable(true);
      return undefined;
    }
    if (p1ContentBottomPx == null) return undefined;
    const t = window.setTimeout(() => setMesuraEstable(true), 220);
    return () => window.clearTimeout(t);
  }, [isPortraitTablet, paymentFillsScreen, p1ContentBottomPx]);

  // Al checkout, el mega-slide no pot arribar més avall d'on comença el
  // formulari: el cistell el taparia. Amb una alçada fixa per format (la que
  // deixa el formulari just a sota) el cistell no tapa res i, de passada, en
  // obrir-lo no es veu cap ajust d'alçada.
  const esCheckout = typeof window !== 'undefined' && window.location.pathname === '/checkout';
  // 270px de panell a l'apaisada i 330 a l'escriptori: son les alcades que
  // deixen el formulari just a sota. A la vertical i al mobil no cal limit
  // (al mobil el mega-slide ja es baixet i el limit li tapava el formulari).
  const CHECKOUT_GUARD_H = (esVerticalAqui || esMobilAqui) ? null : (esApaissadaAqui ? 206 : 266);
  // L'alcada de la TAULA dibuixada de la pagina 2 (les caselles son quadrades):
  // es la que fa creixer la pestanya del megaslide a la vertical.
  const alturaTaulaPx = isPortraitTablet && typeof window !== 'undefined' && window.innerWidth > 0
    ? alturaTaulaVertical(window.innerWidth)
    : 0;
  const guardHeightBase = esCheckout && CHECKOUT_GUARD_H != null
    ? `${CHECKOUT_GUARD_H}px`
    : matchesPage1Height && p1ContentBottomPx != null && mesuraEstable
    ? `${alcadaGuard(p1ContentBottomPx)}px`
    : (alcadaRecordada || guardHeightPxDefault);
  const guardHeightPx = paymentFillsScreen
    ? guardHeightPxDefault
    : (isPortraitTablet && alturaTaulaPx > 0)
    ? `${Math.max(parseFloat(guardHeightBase) || 0, alturaTaulaPx)}px`
    : guardHeightBase;

  // Quan l'alcada bona ja es ferma, la guardem per a les properes obertures.
  useEffect(() => {
    if (isPortraitTablet || paymentFillsScreen) return;
    if (!mesuraEstable || p1ContentBottomPx == null) return;
    desarAlcada(`${alcadaGuard(p1ContentBottomPx)}px`);
  }, [mesuraEstable, p1ContentBottomPx, isPortraitTablet, paymentFillsScreen, margeExtraDesktop]);

  // Les props compartides de la franja de la pagina 1: les fan servir la
  // instancia de la filera (horitzontal) i la de la casella de la taula
  // (vertical). Les que son de layout NOMES van a la de la filera.
  const propsFranjaP1 = {
    active: active,
    resolvedMega: resolvedMega,
    showStripe: showStripe,
    fitAlcada: fitAlcada,
    isLandscapeTablet: isLandscapeTablet,
    stripeRowPadPx: stripeRowPadPx,
    stripeRowPadXPx: stripeRowPadXPx,
    stripePreviewHPx: stripePreviewHPx,
    stripeOverlayLoadState: stripeOverlayLoadState,
    resolvedOverlaySrc: resolvedOverlaySrc,
    stripeOverlayDebug: stripeOverlayDebug,
    stripeMaskDebugRectsPct: stripeMaskDebugRectsPct,
    megaStripeSpriteEnabledLocal: megaStripeSpriteEnabledLocal,
    megaStripeRefEnabledLocal: megaStripeRefEnabledLocal,
    megaStripeRefSrcLocal: megaStripeRefSrcLocal,
    megaStripeRef2EnabledLocal: megaStripeRef2EnabledLocal,
    megaStripeRef2SrcLocal: megaStripeRef2SrcLocal,
    megaShirtDrawingEnabledLocal: megaShirtDrawingEnabledLocal,
    drawingOverlaySrcEffective: drawingOverlaySrcEffective,
    stripeMaskTileRectsRawPct: stripeMaskTileRectsRawPct,
    drawingOverlayDebug: drawingOverlayDebug,
    tileGapPxLocal: tileGapPxLocal,
    humanInsideVariant: humanInsideVariant,
    firstContactVariant: firstContactVariant,
    reorderAustenQuotes: reorderAustenQuotes,
    austenSelectedDisableMulti: austenSelectedDisableMulti,
    stripeVariantVisibility: stripeVariantVisibility,
    megaTileSelectorParams: megaTileSelectorParams,
    onStartSelectorDrag: onStartSelectorDrag,
    megaTileSize: megaTileSize,
    setStripeOverlayOverrideActive: setStripeOverlayOverrideActive,
    setFirstContactVariant: setFirstContactVariant,
    setHumanInsideVariant: setHumanInsideVariant,
    setThinStartIndex: setThinStartIndex,
    setFirstContactSelectedItem: setFirstContactSelectedItem,
    setHumanInsideSelectedItem: setHumanInsideSelectedItem,
    setSelectedItemByCollection: setSelectedItemByCollection,
    normalizeOverlaySrc: normalizeOverlaySrc,
    onShirtClick: onShirtClick,
    selectedItem: page1SelectedItem,
    isPortraitTablet: isPortraitTablet,
  };
  return (
    <div className="relative">
      <div
        data-mega-panel-surface="1"
        className="relative z-[10000] block border-b border-border"
        style={{
          overflow: 'visible',
          backgroundColor: '#ffffff',
          // El megaslide apareixia de cop i es veia com s'anava muntant el
          // contingut. Amb aquesta animacio es desplega suaument (baixa i es
          // fon alhora), i l'ull ja no percep que les imatges arriben.
          animation: 'mega-panel-desplega 340ms cubic-bezier(0.22, 1, 0.36, 1)',
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
            marginTop: isPortraitTablet ? '-32px' : undefined,
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
              // El cos no fa l'amplada de la finestra: `scrollbar-gutter:
              // stable` a <html> reserva l'amplada de la barra de desplaçament
              // (15 px) encara que no n'hi hagi. El marc del lloc (SiteFrame,
              // belt2) es centra sobre la FINESTRA, i aquesta capa es centra
              // sobre el contenidor on viu (el guard, centrat al cos), o sigui
              // mitja reserva a l'esquerra del lloc que li toca. SiteFrame
              // publica aquesta meitat i aquí la sumem.
              left: 'calc(50% + var(--site-gutter-mig, 0px))',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '100%',
              overflow: 'visible',
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
                <div style={{ width: '25%', flexShrink: 0, display: 'block', height: '100%', position: 'relative', overflow: isPortraitTablet ? 'hidden' : 'visible' }}>
                  <div ref={viewport1Ref} data-mega-page-viewport="1" style={{
                    // A la VERTICAL, el contingut de debò de la pagina 1 queda
                    // AMAGAT i el que s'hi veu es la TAULA dibuixada (la
                    // mateixa que a la pagina 2). A la resta de formats no es
                    // toca res.
                    visibility: isPortraitTablet ? 'hidden' : undefined,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: isPortraitTablet ? 'flex-start' : 'center',
                    overflowX: isPortraitTablet ? 'auto' : 'visible',
                    overflowY: isPortraitTablet ? 'hidden' : 'visible',
                    overscrollBehaviorX: isPortraitTablet ? 'contain' : undefined,
                    WebkitOverflowScrolling: isPortraitTablet ? 'touch' : undefined,
                    scrollbarWidth: isPortraitTablet ? 'none' : undefined,
                    touchAction: isPortraitTablet ? 'pan-x' : undefined,
                    pointerEvents: isPortraitTablet ? 'auto' : undefined,
                  }}>
                  <div style={{
                    flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
                  }} />

                  {/* A vertical, la pagina es la mateixa que a l'apaisada
                      d'un iPad (1024): el tauler fa 992 px i no es zoomat, i
                      el que no hi cap s'hi arriba desplacant. D'aquesta
                      amplada en surt la calibracio (megaTileSize), aixi que
                      les mides del selector i de la franja tambe coincideixen. */}
                  <div style={{ flex: '0 0 auto', width: isPortraitTablet ? '992px' : 'var(--hg-mega-w, 70.3vw)', maxWidth: 'none', position: 'relative', height: '100%', paddingLeft: '0px', paddingRight: '0px' }}>
                    <MegaStripePanelP1
                      {...propsFranjaP1}
                      onP1ContentBottomChange={handleP1ContentBottom}
                      onPageLiftChange={handleP1PageLift}
                    />
                  </div>

                  <div style={{
                    flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
                  }} />
                  </div>

                  {/* La TAULA de la pagina 1: la mateixa capa que la de la
                      pagina 2 (absoluta, centrada i a l'amplada del carril). */}
                  {isPortraitTablet ? (
                    <CapaTaulaVertical pagina={1}>
                      <TaulaVerticalP1
                        /* Les peces de debò, una per casella: la graella de
                           dibuixos, la imatge de la franja, la tile de les
                           fletxes i la tile del selector. */
                        grid={(() => {
                          // Les tiles de la graella, de la mida de la casella: la
                          // graella omple tota l'amplada i l'alcada de la casella.
                          const items = dibuixosGraella16x4().filter((it) => it.collection === active);
                          const n = items.length || 1;
                          return (
                            // Les tiles, un 15% mes petites, pero amb els
                            // centres de la distribucio anterior (s'encongeixen
                            // dins la seva casella, no la graella sencera).
                            <CercadorDibuixosGraella
                              items={items}
                              dibuixPx={null}
                              gapH={0}
                              gapV={0}
                              numColumns={n}
                              tilesPercent={85}
                              activeCollection={active}
                              isPortraitTablet
                            />
                          );
                        })()}
                        /* Les mides de la pagina 1, igualades a les de la pagina 2:
                           la franja fa el mateix (458,8 x 213,9 a 768), les fletxes
                           i el selector tambe (96,8 de costat, com el selector de la
                           pagina 2). */
                        stripe={(
                          /* La franja de debò: el mateix panell que la filera,
                             amb la imatge de dues fileres (7+7), escalat per
                             encaixar a la casella. */
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <div style={{ height: '100%', transform: 'translateY(51px) scale(2.148)', transformOrigin: 'center center' }}>
                              <MegaStripePanelP1
                                {...propsFranjaP1}
                                isPortraitTablet
                                stripeImageSrc="/placeholders/tablet vertical/stripe-curta-7+7.png"
                              />
                            </div>
                          </div>
                        )}
                        /* Les fletxes, alineades verticalment amb el selector
                           (el mateix centre vertical). */
                        fletxes={(
                          <div style={{ width: '75.9%', position: 'relative', top: '-7.6px' }}>
                          <FirstContactDibuix09Buttons
                            tileSize={96.8}
                            onPrev={() => { touchMegaPublicActivity?.(); }}
                            onNext={() => { touchMegaPublicActivity?.(); }}
                          />
                          </div>
                        )}
                        selector={(
                          <div style={{ width: '90%' }}>
                          <FirstContactDibuix00Buttons
                            onWhite={() => {
                              setStripeOverlayOverrideActive?.(false);
                              if (active === 'the_human_inside') setHumanInsideVariant?.('white');
                              else setFirstContactVariant?.('white');
                            }}
                            onBlack={() => {
                              setStripeOverlayOverrideActive?.(false);
                              if (active === 'the_human_inside') setHumanInsideVariant?.('black');
                              else setFirstContactVariant?.('black');
                            }}
                            onMulti={() => {
                              setStripeOverlayOverrideActive?.(false);
                              if (active === 'the_human_inside') setHumanInsideVariant?.('color');
                              else setFirstContactVariant?.('color');
                            }}
                            showWhite={stripeVariantVisibility?.white !== false}
                            showBlack={stripeVariantVisibility?.black !== false}
                            showMulti={stripeVariantVisibility?.color !== false}
                            selectedVariant={active === 'the_human_inside' ? humanInsideVariant : firstContactVariant}
                          />
                          </div>
                        )}
                      />
                    </CapaTaulaVertical>
                  ) : null}
                </div>

                <MegaslidePagina2
                  active={active}
                  isPortraitTablet={isPortraitTablet}
                  isLandscapeTablet={isLandscapeTablet}
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
                  page1MegaTileSize={effectiveMegaTileSize}
                  page1StripePreviewHPx={stripePreviewHPx}
                  page1PageLift={isPortraitTablet ? 0 : p1PageLift}
                  fitAlcada={fitAlcada}
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
                    isLandscapeTablet={isLandscapeTablet}
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
