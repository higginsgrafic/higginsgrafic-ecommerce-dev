import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import MegaColumn from './MegaColumn.jsx';
import ClicAreaOverlayP1 from './ClicAreaOverlayP1.jsx';
import { CERCADOR_COLORS } from './CercadorTopBar.jsx';
import {
  STRIPE_DRAWING_CALIBRATIONS,
  PASSOS_ESCALA_GAP_DIBUIX_VERTICAL,
  GAP_MOVIMENT_DIBUIX_VERTICAL,
  ESCALA_DIBUIX_VERTICAL,
} from '../../config/stripeCalibrations';
import {
  STRIPE_DRAWING_DY_VERTICAL,
  STRIPE_DRAWING_ESCALA_VERTICAL,
  STRIPE_DRAWING_DX_VERTICAL,
} from '../../config/stripeCalibrationsVertical';
import { VECTOR_FRANJA_SAMARRETES, VECTOR_FRANJA_SAMARRETES_01, VECTOR_FRANJA_VIEWBOX, VECTOR_FRANJA_VIEWBOX_OBERT, VECTOR_FRANJA_CONTINGUT } from '../../config/vectorFranja.js';
import { desplacamentFranjaEscriptori } from '../../utils/mesuraMegaslide.js';
import { carrilPx } from '../../utils/layoutMetrics.js';
import { precarregaSiluetesSamarreta, textSiluetesSamarreta } from './siluetesSamarreta.js';
import useEscalaFranjaCarril from '../../hooks/useEscalaFranjaCarril.js';
import {
  AJUST_FRANJA_ESCRIPTORI_PX,
  DIBUIXOS_FRANJA_DX,
  DIBUIXOS_FRANJA_DY,
  DIBUIXOS_FRANJA_AMPLADA_NATURAL,
  escalaDibuixFranja,
  esBandaEstretaFranja,
  pageLiftPagina1,
} from '../megaslide/geometriaMegaslide.js';

// La franja de samarretes de la pàgina 1 tendeix a quedar-se uns 10 px més avall
// del que toca: l'alçada del contenidor de la pàgina es calcula a partir del
// bottom mesurat de la franja i el pageLift es calibra amb el selector, de
// manera que el resultat depèn de l'ordre de les mesures. Amb aquest ajust la
// franja torna a la seva posició, i la pàgina 2 el fa servir perquè les dues
// franges quedin a la mateixa alçada.
/** Vegeu `AJUST_FRANJA_ESCRIPTORI_PX` a geometriaMegaslide.js. */
export const FRANJA_AJUST_PX = AJUST_FRANJA_ESCRIPTORI_PX;

function canonicalKey(rawSrc) {
  try {
    const s = String(rawSrc || '').trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower.includes('/custom_logos/drawings/images_stripe/austen/keep_calm/')) {
      return '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm';
    }
    return s;
  } catch {
    return String(rawSrc || '').trim();
  }
}

function getTileCalibration(src, overrides) {
  if (!src) return { dx: 0, dy: 0, scale: 1 };
  const cKey = canonicalKey(src);
  // L'OVERRIDE DEL HUD NOME'S EN DESENVOLUPAMENT (26/09/2026).
  //
  // El HUD desa les recalibracions al `localStorage` i aqui tenien prioritat
  // sobre el que diu el projecte: en producció, un valor vell del navegador
  // d'algú podia moure la composicio. El que es veu ha de ser sempre el que
  // diu el modul de geometria; el HUD es una eina de taller i, per tant,
  // nome's mana en desenvolupament.
  let lsMap = null;
  if (import.meta.env.DEV) {
    try {
      const raw = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      lsMap = raw ? JSON.parse(String(raw)) : null;
    } catch {
      lsMap = null;
    }
  }
  if (overrides && typeof overrides === 'object') {
    const fromOv = (cKey && overrides[cKey]) || overrides[src];
    if (fromOv && typeof fromOv === 'object') return fromOv;
  }
  if (lsMap && typeof lsMap === 'object') {
    const fromLs = (cKey && lsMap[cKey]) || lsMap[src];
    if (fromLs && typeof fromLs === 'object') return fromLs;
  }
  const fromDefaults = (cKey && STRIPE_DRAWING_CALIBRATIONS[cKey]) || STRIPE_DRAWING_CALIBRATIONS[src];
  if (fromDefaults && typeof fromDefaults === 'object') return fromDefaults;
  // LA REGLA DECLARADA (26/09/2026): les entrades que no son al mapa son
  // dibuixos de la franja i van a l'amplada base (80 unitats, el 41 % del cos),
  // centrats al cos de la seva samarreta. Vegeu `geometriaMegaslide.js`.
  if (typeof src === 'string' && src.includes('images_stripe')) {
    return {
      dx: DIBUIXOS_FRANJA_DX,
      dy: DIBUIXOS_FRANJA_DY,
      scale: escalaDibuixFranja(DIBUIXOS_FRANJA_AMPLADA_NATURAL),
    };
  }
  return { dx: 0, dy: 0, scale: 1 };
}

/** La mascara de les samarretes BUIDES, a partir del full de siluetes. */
function generaMascaraBuidesDataUrl(text, emptyTileIndices, shirtColor) {
  if (!text) return null;
  try {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const emptySet = new Set(Array.isArray(emptyTileIndices) ? emptyTileIndices : []);
    const paths = doc.querySelectorAll('.tshirt-outline');
    const isWhite = !shirtColor || shirtColor === '#FFFFFF';
    const emptyOpacity = isWhite ? '0.3' : '0.1';
    paths.forEach((p, i) => {
      p.setAttribute('fill', 'white');
      p.setAttribute('fill-opacity', emptySet.has(i) ? emptyOpacity : '1');
      p.removeAttribute('stroke');
      p.removeAttribute('class');
    });
    const serialized = new XMLSerializer().serializeToString(doc.documentElement);
    return `data:image/svg+xml,${encodeURIComponent(serialized)}`;
  } catch {
    return null;
  }
}

function useEmptyShirtMask(emptyTileIndices, shirtColor) {
  const emptyKey = Array.isArray(emptyTileIndices) ? emptyTileIndices.join(',') : '';
  // Si la porta d'obertura ja ha precarregat el full, la mascara neix en el
  // MATEIX primer render (vegeu `siluetesSamarreta.js`).
  const [dataUrl, setDataUrl] = useState(() => generaMascaraBuidesDataUrl(textSiluetesSamarreta(), emptyTileIndices, shirtColor));
  useEffect(() => {
    let cancelled = false;
    precarregaSiluetesSamarreta()
      .then((text) => {
        if (cancelled) return;
        setDataUrl(generaMascaraBuidesDataUrl(text, emptyTileIndices, shirtColor));
      })
      .catch(() => { if (!cancelled) setDataUrl(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emptyKey, shirtColor]);
  return dataUrl;
}

function MegaStripePanelP1({
  hideGrid,
  reserveGridSpace,
  stripeImageSrc,
  active,
  resolvedMega,
  showStripe,
  stripeRowPadPx,
  stripeRowPadXPx,
  stripePreviewHPx,
  stripeOverlayLoadState,
  resolvedOverlaySrc,
  stripeOverlayDebug,
  stripeMaskDebugRectsPct,
  megaStripeSpriteEnabledLocal,
  megaStripeRefEnabledLocal,
  megaStripeRefSrcLocal,
  megaStripeRef2EnabledLocal,
  megaStripeRef2SrcLocal,
  megaShirtDrawingEnabledLocal,
  drawingOverlaySrcEffective,
  stripeMaskTileRectsRawPct,
  // A la vista vertical la franja son dues fileres i la mascara de la
  // samarreta (pensada per a una) les retalla: amb aixo no s'hi posa.
  senseMascaraSamarreta = false,
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
  shirtColor,
  onShirtClick,
  selectedItem,
  stripeTileOverlaySrcs,
  stripeTileItems,
  clicAreaHighlight,
  clicAreaHighlightIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
  calibrationOverrides,
  compactLandscape = false,
  onP1ContentBottomChange,
  onPageLiftChange,
  isPortraitTablet = false,
  // Si la franja s'ha d'ajustar a l'amplada del carril (les manigues a fora).
  // Ho decideix qui el posa: a la vista vertical, la franja viu dins d'una
  // filera escalada i no hi ha carril.
  ajustFranjaCarril = false,
  isLandscapeTablet = false,
}) {
  // Id unic per al retall dels dibuixos: els dos panells conviuen al DOM i
  // amb un id repetit la referencia url(#...) no resolia.
  const idRetall = `hgRetallSamarretes-${useId().replace(/:/g, '')}`;
  // A la vista vertical la franja son DUES fileres de 7: les 14 posicions de
  // la mascara es reparteixen 7 a dalt i 7 a baix (a l'apaisada van en una
  // sola filera).
  const rectsMascara = (Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14 && isPortraitTablet)
    ? stripeMaskTileRectsRawPct.map((r, idx) => ({
      left: (idx % 7) * (100 / 7),
      width: 100 / 7,
      top: idx < 7 ? 0 : 50,
      height: 50,
    }))
    : stripeMaskTileRectsRawPct;
  // Estat de pas per al desplaçament dels dibuixos de la franja a la vista
  // vertical: el primer dibuix de cada filera de 7 no es mou i la resta es
  // desplacen cap a l'esquerra el 10% de l'espai buit que tenen a l'esquerra.
  // S'acumula mentre es pinten les caselles (en ordre), o sigui que son
  // variables de render, no d'estat.
  let gapDibuixAcumulat = 0;
  let gapDibuixEscalaAnterior = null;
  const emptyShirtMaskUrl = useEmptyShirtMask(emptyTileIndices, shirtColor);
  const pageRootRef = useRef(null);
  const pageLiftRef = useRef(0);
  // La franja s'ha de quedar dins del carril amb les manigues a fora (com a la
  // pagina 2: les dues pagines han de quadrar). Vegeu l'hook.
  const filaFranjaRef = useRef(null);
  const { factor: factorCarrilFranja, centre: centreCarrilFranja } = useEscalaFranjaCarril(filaFranjaRef, ajustFranjaCarril);
  const [pageLift, setPageLift] = useState(0);
  // Franja estreta (768-1366 en horitzontal): hi ha ajustos propis de 10 px i
  // l'ajust general de la franja no s'hi aplica. La condicio es declarada
  // (`esBandaEstretaFranja`): es la MATEIXA que fa servir la pagina 2.
  const esEstenyFins1366 = typeof window !== 'undefined'
    && esBandaEstretaFranja({ ample: window.innerWidth, alt: window.innerHeight });

  // En portrait tablet, la stripe està dins d'un viewport scrollable amb
  // overflowY hidden. Reduïm l'escala de la stripe perquè no es talli.
  useLayoutEffect(() => {
    if (!isPortraitTablet) return;
    const root = pageRootRef.current;
    if (!root) return;
    root.style.setProperty('--megaStripeScale', '1.17');
    return () => { root.style.removeProperty('--megaStripeScale'); };
  }, [isPortraitTablet]);

  useLayoutEffect(() => {
    const root = pageRootRef.current;
    const panel = root?.closest('[data-mega-panel-surface="1"]');
    if (!root || !panel) return undefined;

    let frame = 0;
    const applyMeasurement = () => {
      // EL PAGELIFT ES DECLARA (26/09/2026): el punt fix del bucle era el top
      // natural del selector de la pagina 1 menys el desplacament de disseny
      // (vegeu `pageLiftPagina1`). El bucle que mesurava el selector i el
      // panell va desaparèixer.
      const next = pageLiftPagina1({ isPortraitTablet, isLandscapeTablet });
      if (Math.abs(next - pageLiftRef.current) >= 0.5) {
        pageLiftRef.current = next;
        setPageLift(next);
        onPageLiftChange?.(next);
      }
      // Bottom visual de les samarretes (ja inclou l'escala interna de la
      // franja i el pageLift) mesurat des del capdamunt del panell: el pare
      // el fa servir per retallar l'alçada de la pàgina 1 sense números màgics.
      if (typeof onP1ContentBottomChange === 'function') {
        const stripeContent = root.querySelector('[data-stripe-visual-content="1"]');
        if (stripeContent) {
          const bottom = stripeContent.getBoundingClientRect().bottom - panel.getBoundingClientRect().top;
          if (Number.isFinite(bottom) && bottom > 0) onP1ContentBottomChange(bottom);
        }
      }
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(applyMeasurement);
    };

    // La primera mesura no espera cap frame: useLayoutEffect encara és abans
    // de pintar i així la pàgina ja neix a la posició bona, sense salt visible.
    applyMeasurement();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(panel);
    observer?.observe(root);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [active, isPortraitTablet, isLandscapeTablet, megaTileSize, onP1ContentBottomChange, onPageLiftChange, pageLift]);

  useEffect(() => {
    const handler = (ev) => {
      if (typeof onShirtClick !== 'function') return;
      const x = ev.detail?.x;
      if (typeof x !== 'number') return;
      const tileIdx = Math.min(13, Math.max(0, Math.floor(x * 14)));
      const item = selectedItem || stripeTileItems?.[0];
      if (!item) return;
      const tileColor = CERCADOR_COLORS[tileIdx]?.overlayHex || shirtColor;
      onShirtClick(active, item, tileColor);
    };
    window.addEventListener('mega-stripe-full-hit-p1', handler);
    return () => window.removeEventListener('mega-stripe-full-hit-p1', handler);
  }, [onShirtClick, selectedItem, stripeTileItems, active, shirtColor]);

  return (
    <div
      ref={pageRootRef}
      className="w-full shrink-0"
      style={{ transform: (!isPortraitTablet && pageLift > 0) ? `translateY(-${pageLift}px)` : undefined }}
    >
      {!hideGrid || reserveGridSpace ? (
        <div
          className="relative z-10 grid grid-cols-1 gap-10"
          style={{
            // La graella fa el 100% del carril i es pinta al 94% (centrada): el
            // bloc de dibuixos arrenca a la segona columna, o sigui al 13% del
            // carril, que es on arrenca tambe la filera de la pagina 2.
            // Sense desplaçaments: quan se li afegia un `translateX` per
            // quadrar-lo amb la pagina 2, tota la filera (dibuixos, colors i
            // colleccions) marxava cap a la dreta.
            transform: 'scale(var(--hgGridFitScale, 0.94))',
            transformOrigin: 'top center',
            visibility: reserveGridSpace ? 'hidden' : undefined,
            pointerEvents: reserveGridSpace ? 'none' : undefined,
          }}
          aria-hidden={reserveGridSpace ? true : undefined}
        >
          {(resolvedMega[active] || []).map((col, idx) => (
            <MegaColumn
              key={`${active}-${idx}`}
              title={col.title}
              isFirstContact={active === 'first_contact' || active === 'austen' || active === 'cube' || active === 'miscellania'}
              isHumanInside={active === 'the_human_inside'}
              collectionId={active}
              disableMulti={active === 'austen' && austenSelectedDisableMulti}
              stripeVariantVisibility={stripeVariantVisibility}
              megaTileSelectorParams={megaTileSelectorParams}
              onStartSelectorDrag={onStartSelectorDrag}
              megaTileSize={megaTileSize}
              compactLandscape={compactLandscape}
              hideLabels
              hideSelectorBackground
              humanInsideVariant={humanInsideVariant}
              items={active === 'austen' ? reorderAustenQuotes(col.items) : col.items}
              row={true}
              firstContactVariant={firstContactVariant}
              onFirstContactWhite={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('white'); }}
              onFirstContactBlack={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('black'); }}
              onFirstContactMulti={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('color'); }}
              onHumanWhite={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('white'); }}
              onHumanBlack={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('black'); }}
              onHumanMulti={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('color'); }}
              onHumanPrev={() => setThinStartIndex((v) => v - 1)}
              onHumanNext={() => setThinStartIndex((v) => v + 1)}
              onSelectItem={(it) => {
                setStripeOverlayOverrideActive(false);
                if (active === 'first_contact') setFirstContactSelectedItem(it);
                else if (active === 'the_human_inside') setHumanInsideSelectedItem(it);
                else setSelectedItemByCollection((prev) => ({ ...prev, [active]: it }));
                if (typeof onShirtClick === 'function') onShirtClick(active, it);
              }}
            />
          ))}
        </div>
      ) : null}

      {showStripe ? (
        <div
          className="relative z-0"
          style={{
            // A la franja estreta (768-1366) la pàgina ja té els seus propis
            // ajustos de 10 px i l'ajust general no s'hi ha d'aplicar.
            marginTop: compactLandscape ? '16px' : `${stripeRowPadPx}px`,
            paddingBottom: compactLandscape ? '8px' : `${stripeRowPadPx}px`,
            paddingLeft: `${stripeRowPadXPx?.left || 0}px`,
            paddingRight: `${stripeRowPadXPx?.right || 0}px`,
            // La franja estreta (768-1366) no ha de pujar: el belt s'ha
            // encongit, la graella de colors ha quedat 17 px més curta i
            // aquests -15 px la partien en dues meitats (els cercles a dalt i
            // el COLOR/NEGRE dins de les samarretes). Ha de coincidir amb el
            // mateix ajust de MegaStripePanel (pàgina 2).
            transform: (compactLandscape || esEstenyFins1366) ? 'none' : 'translateY(-15px)',
          }}
        >
          <div
            className="w-full bg-transparent"
            // EL CENTRE ES EL DEL CARRIL, NO EL DEL CONTINGUT.
            //
            // El panell porta un coixi lateral (`stripeRowPadXPx`) i el
            // centratge es feia sobre el CONTINGUT (el carril menys els
            // coixins): si els dos coixins no son iguals —o si un navegador els
            // aplica diferent— el centre se'n va. Aqui el coixi es descompta
            // NEGATIU a l'embolcall, de manera que l'embolcall fa exactament el
            // carril i el 50% de la filera es el centre del carril, a tothom.
            style={{ width: 'auto', marginLeft: `-${stripeRowPadXPx?.left || 0}px`, marginRight: `-${stripeRowPadXPx?.right || 0}px` }}
          >

            <div
              id="stripe-guide-stripe-row-p1"
              ref={filaFranjaRef}
              className="relative inline-block"
              style={{
                height: carrilPx(stripePreviewHPx),
                width: 'auto',
                // CENTRADA SOBRE EL CARRIL, A MA, NO PEL `justify-content`.
                //
                // La filera es mes ampla que el carril (les manigues hi surten)
                // i amb `w-full flex justify-center` el centratge depenia del
                // navegador: quan l'element desborda el contenidor, Chromium el
                // centra pero FIREFOX L'ALINEA A L'INICI. Amb la franja
                // desbordant, allo la desplaçava a la dreta (mesurat a la
                // captura de l'amo del 24/09 a les 23:47: els cossos començaven
                // a 459,5 en comptes de 381). Amb `left: 50%` i
                // `translateX(-50%)` el centre es el del contenidor de
                // maquetacio (el carril menys els coixins, que son iguals), a
                // tots els navegadors.
                // El centre, a mig cami entre la vora esquerra del carril i la
                // dreta de les fletxes: aixi la cintura de la primera samarreta
                // cau a la vora esquerra del carril i la de l'ultima a la guia
                // de les fletxes. Sense fletxes (tauletes) el centre es el del
                // carril, que es com estava.
                left: centreCarrilFranja === null ? '50%' : `${centreCarrilFranja}px`,
                transform: 'translateX(-50%)',
                // La filera NO s'ha d'encongir per encabir-se al contenidor: la
                // franja te una mida de disseny i es escala amb `transform`
                // (com la de la pagina 2, que ja no s'encongia). Sense aixo, a
                // 1280-1440 la franja de la pagina 1 quedava mes estreta que la
                // de la pagina 2 (820 contra 1017 px) i les dues pagines no
                // quadraven.
                flexShrink: 0,
              }}
            >
              {stripeOverlayDebug && stripeOverlayLoadState !== 'ok' ? (
                <div
                  className="absolute left-2 top-2"
                  style={{
                    zIndex: 100,
                    pointerEvents: 'none',
                    fontSize: 11,
                    lineHeight: 1.2,
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: 'rgba(255, 80, 80, 0.92)',
                    color: '#fff',
                    maxWidth: 420,
                    wordBreak: 'break-all',
                  }}
                >
                  {stripeOverlayLoadState === 'no-src'
                    ? 'overlay: no src'
                    : (stripeOverlayLoadState === 'loading'
                        ? 'overlay: loading...'
                        : `overlay: failed (${resolvedOverlaySrc || 'empty'})`)}
                </div>
              ) : null}

              <div
                className="relative"
                data-stripe-visual-content="1"
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'block',
                  transformOrigin: 'top center',
                  // A l'apaisada pugem la stripe 10px (les samarretes). El
                  // desplaçament va amb la resta de la seva posicio, que ve de
                  // les variables de calibracio.
                  // La franja NO s'ajusta a l'alcada de la finestra: fa el carril
                  // SEMPRE (vegeu MegaMenuPanel). Ha de coincidir amb
                  // MegaStripePanel (pagina 2).
                  // El desplaçament (i la resta de la posició) ve de les
                  // variables de calibracio i NO s'escala: el `translate` va
                  // abans de l'`scale`, o sigui en px del pare. El que s'escala
                  // es la mida de la filera (`stripePreviewHPx`), i l'escala que
                  // la porta al carril la calcula `useEscalaFranjaCarril` (les
                  // manigues hi queden a fora, a la mida del dibuix).
                  transform: `translate(var(--megaStripeDx, 0px), calc(var(--megaStripeDy, 0px) + ${(typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? -10 : 0}px + ${desplacamentFranjaEscriptori({ ample: typeof window !== 'undefined' ? window.innerWidth : 0, alt: typeof window !== 'undefined' ? window.innerHeight : 0, esTauleta: isPortraitTablet || isLandscapeTablet })}px)) scale(calc(var(--megaStripeScale, 1.2125) * ${factorCarrilFranja}))`,
                  isolation: 'isolate',
                }}
              >
                {stripeOverlayDebug ? (
                  <div
                    className="absolute inset-0 flex"
                    style={{
                      pointerEvents: 'none',
                      zIndex: 1000,
                      transformOrigin: 'top center',
                      transform: 'none',
                      background: 'transparent',
                    }}
                    aria-hidden="true"
                  >
                    {Array.isArray(stripeMaskDebugRectsPct) && stripeMaskDebugRectsPct.length === 14
                      ? stripeMaskDebugRectsPct.map((r, idx) => (
                        <div
                          key={`stripe-tile-debug-abs-p1-${idx}`}
                          style={{
                            position: 'absolute',
                            left: `${r.left}%`,
                            top: `${r.top}%`,
                            width: `${r.width}%`,
                            height: `${r.height}%`,
                            boxSizing: 'border-box',
                            border: '2px solid rgba(0, 200, 255, 0.82)',
                            background: idx % 2 === 0 ? 'rgba(0, 200, 255, 0.18)' : 'rgba(0, 200, 255, 0.1)',
                            overflow: 'visible',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: -16,
                              transform: 'translateX(-50%)',
                              zIndex: 2,
                              padding: '2px 6px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 900,
                              lineHeight: 1,
                              color: 'rgba(2,6,23,0.95)',
                              background: 'rgba(255, 255, 0, 0.94)',
                              boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                              border: '1px solid rgba(0,0,0,0.25)',
                              userSelect: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {idx + 1}
                          </div>
                        </div>
                      ))
                      : Array.from({ length: 14 }).map((_, idx) => (
                        <div
                          key={`stripe-tile-debug-abs-fallback-p1-${idx}`}
                          style={{
                            height: '100%',
                            flex: '1 1 0%',
                            boxSizing: 'border-box',
                            border: '2px solid rgba(0, 200, 255, 0.75)',
                            background: idx % 2 === 0 ? 'rgba(0, 200, 255, 0.22)' : 'rgba(0, 200, 255, 0.11)',
                          }}
                        />
                      ))}
                  </div>
                ) : null}

                <div
                  className="relative"
                  style={{
                    height: '100%',
                    width: '100%',
                    // La franja s'hi centra: amb l'amplada fixa i l'alcada per
                    // l'aspecte, si no, quedava enganxada i semblava tallada.
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    WebkitMaskImage: senseMascaraSamarreta
                      ? 'none'
                      : (emptyShirtMaskUrl
                        ? `url("${emptyShirtMaskUrl}")`
                        : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)'),
                    maskImage: senseMascaraSamarreta
                      ? 'none'
                      : (emptyShirtMaskUrl
                        ? `url("${emptyShirtMaskUrl}")`
                        : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)'),
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: '103% 100%',
                    maskSize: '103% 100%',
                    WebkitMaskPosition: '50% 0',
                    maskPosition: '50% 0',
                  }}
                >
                  {isPortraitTablet ? (
                    <svg
                      viewBox={`0 0 ${VECTOR_FRANJA_VIEWBOX_OBERT.width} ${VECTOR_FRANJA_VIEWBOX_OBERT.height}`}
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      style={{
                        // Exactament el mateix que la imatge de la franja (mateixa
                        // mida i mateix aspecte): alcada del contenidor i amplada
                        // per l'aspecte del viewBox.
                        // Com la imatge de la franja: alcada del contenidor i
                        // amplada per l'aspecte del viewBox.
                        position: 'relative',
                        height: '100%',
                        width: 'auto',
                        maxWidth: 'none',
                        display: 'block',
                        pointerEvents: 'none',
                        zIndex: 4,
                      }}
                    >
                      {/* La imatge de la franja, DINS del perimetre vectorial: el
                          clipPath son les 14 siluetes, aixi la imatge nomes es veu
                          a dins de les samarretes. */}
                      <defs>
                        <clipPath id={`hgFranjaImatge-${idRetall}`} clipPathUnits="userSpaceOnUse">
                          {VECTOR_FRANJA_SAMARRETES.map((d, k) => (
                            <path key={`hg-clip-${k}`} d={d} />
                          ))}
                        </clipPath>
                      </defs>
                      {stripeImageSrc ? (
                        <image
                          href={stripeImageSrc}
                          x={0}
                          y={0}
                          width={VECTOR_FRANJA_VIEWBOX.width}
                          height={VECTOR_FRANJA_CONTINGUT}
                          preserveAspectRatio="none"
                          clipPath={`url(#hgFranjaImatge-${idRetall})`}
                        />
                      ) : null}
                      {VECTOR_FRANJA_SAMARRETES.map((d, k) => (
                        <path
                          key={`hg-samarreta-${k}`}
                          id={`hgSamarreta-${k}`}
                          d={d}
                          fill="none"
                          // El contorn de la stripe vectorial, amagat.
                          stroke="none"
                        />
                      ))}
                    </svg>
                  ) : null}

                  {megaStripeSpriteEnabledLocal && !isPortraitTablet ? (
                    <img
                      src={stripeImageSrc || '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'}
                      alt=""
                      className="block"
                      // Les mides del fitxer per atribut: vegeu MegaStripePanel
                      // (la filera de la franja no pot fer zero d'amplada mentre
                      // la imatge arriba, perque l'escala de la franja se'n val).
                      width={2866}
                      height={307}
                      style={{
                        height: '100%',
                        width: 'auto',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : null}

                  {shirtColor && shirtColor !== '#FFFFFF' && !isPortraitTablet ? (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: shirtColor,
                        mixBlendMode: 'multiply',
                        opacity: 0.9,
                        pointerEvents: 'none',
                        zIndex: 5,
                        // A la vista vertical la franja te dues fileres i la
                        // mascara de contorn del panell es d'una: el tint es
                        // retalla amb la MATEIXA imatge de la stripe (el seu
                        // canal alfa es el contorn de les samarretes), aixi no
                        // tenyeix el rectangle de fons.
                        ...((isPortraitTablet && stripeImageSrc)
                          ? {
                            WebkitMaskImage: `url("${encodeURI(stripeImageSrc)}")`,
                            maskImage: `url("${encodeURI(stripeImageSrc)}")`,
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                          }
                          : null),
                      }}
                    />
                  ) : null}

                  {megaStripeRefEnabledLocal && megaStripeRefSrcLocal && !isPortraitTablet ? (
                    <img
                      src={megaStripeRefSrcLocal}
                      alt=""
                      className="block absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 6,
                        height: '100%',
                        width: 'auto',
                        transformOrigin: 'top center',
                        transform: 'translate(var(--megaStripeRefDx, 0px), var(--megaStripeRefDy, 0px)) scale(var(--megaStripeRefScale, 1))',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {megaStripeRef2EnabledLocal && megaStripeRef2SrcLocal && !isPortraitTablet ? (
                    <img
                      src={megaStripeRef2SrcLocal}
                      alt=""
                      className="block absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 7,
                        height: '100%',
                        width: 'auto',
                        transformOrigin: 'top center',
                        transform: 'translate(var(--megaStripeRef2Dx, 0px), var(--megaStripeRef2Dy, 0px)) scale(var(--megaStripeRef2Scale, 1))',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {stripeEmptyMaskSrc ? (
                    <img
                      src={stripeEmptyMaskSrc}
                      alt=""
                      aria-hidden="true"
                      className="block absolute"
                      style={{
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: 'auto',
                        pointerEvents: 'none',
                        zIndex: 9,
                        opacity: 'var(--hgStripeEmptyMaskOpacity, 1)',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : null}

                  {Array.isArray(emptyTileIndices) && emptyTileIndices.length > 0 ? (
                    <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 10 }}>
                      {emptyTileIndices.map((idx) => {
                        const r = Array.isArray(rectsMascara) && rectsMascara.length === 14
                          ? rectsMascara[idx]
                          : null;
                        const leftPct = r ? Number(r.left) || 0 : (idx / 14) * 100;
                        const widthPct = r ? Number(r.width) || 0 : (1 / 14) * 100;
                        const topPct = r ? Number(r.top) || 0 : 0;
                        const heightPct = r ? Number(r.height) || 100 : 100;
                        return (
                          <div
                            key={`disabled-tile-p1-${idx}`}
                            onPointerDown={(ev) => { ev.stopPropagation(); }}
                            onClick={(ev) => { ev.stopPropagation(); }}
                            style={{
                              position: 'absolute',
                              top: `${topPct}%`,
                              height: `${heightPct}%`,
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              background: 'var(--hgStripeDisabledFill, transparent)',
                              pointerEvents: 'auto',
                              cursor: 'default',
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Silueta de les 14 samarretes (coordenades 0-1) per retallar-hi
                      els dibuixos i que no trepitgin el blanc entre samarretes. */}
                  {isPortraitTablet ? (
                    <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      <clipPath id={idRetall} clipPathUnits="objectBoundingBox">
                        <path d={VECTOR_FRANJA_SAMARRETES_01.join(' ')} clipRule="evenodd" />
                      </clipPath>
                    </svg>
                  ) : null}

                  {megaShirtDrawingEnabledLocal && drawingOverlaySrcEffective && !isPortraitTablet ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 12,
                        transformOrigin: 'top center',
                        transform: 'none',
                        background: 'transparent',
                        // El dibuix no ha de trepitjar el blanc entre samarretes:
                        // es retalla amb la silueta vectorial de les 14 samarretes.
                        // El dibuix no ha de trepitjar el blanc entre samarretes: es
                        // retalla amb la silueta vectorial de les 14 samarretes
                        // (clipPath mes avall; amb la imatge com a mascara no
                        // s'hi va aplicar el canal alfa i el dibuix quedava fluix).
                        clipPath: `url(#${idRetall})`,
                      }}
                    >
                      {Array.isArray(rectsMascara) && rectsMascara.length === 14
                        ? rectsMascara.map((r, idx) => {
                          if (Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) {
                            return null;
                          }
                          const base = (() => {
                            try {
                              if (Array.isArray(stripeTileOverlaySrcs) && stripeTileOverlaySrcs[idx]) {
                                return normalizeOverlaySrc(stripeTileOverlaySrcs[idx]);
                              }
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            } catch {
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            }
                          })();

                          const resolvePerTileAssetSrc = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return null;
                              const tpl = String(src || '').trim();
                              if (!tpl) return null;
                              const i1 = idx + 1;
                              const hasTpl = tpl.includes('{i}') || tpl.includes('{idx}') || tpl.includes('{n}');
                              if (hasTpl) {
                                return tpl
                                  .replace(/\{i\}/g, String(i1))
                                  .replace(/\{n\}/g, String(i1))
                                  .replace(/\{idx\}/g, String(idx));
                              }
                              return null;
                            } catch {
                              return null;
                            }
                          };

                          const isAustenKeepCalm = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
                          const isAustenTileSwapBW = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/(pemberley_house|crosswords|quotes)\//i.test(resolvedOverlaySrc);
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'miscellania' || isAustenKeepCalm || isAustenTileSwapBW;
                          const baseMode = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                          const isAustenPemberley = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);

                          const resolveDrawingOverlaySrcForTile = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return src;
                              const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
                              // A la vista vertical la franja son DUES fileres de 7: la samarreta
                              // sencera (i el seu dibuix) es la de l'extrem de CADA filera.
                              const isFirst = isPortraitTablet ? safeIdx % 7 === 0 : safeIdx === 0;
                              const isLast = isPortraitTablet ? safeIdx % 7 === 6 : safeIdx === 13;
                              const useEdgeOverride = active === 'first_contact' || active === 'the_human_inside' || active === 'miscellania' || isAustenPemberley || isAustenKeepCalm;
                              const mode = useEdgeOverride && isFirst
                                ? (baseMode === 'color' ? 'color' : 'black')
                                : useEdgeOverride && isLast
                                  ? (baseMode === 'color' ? 'color' : 'white')
                                  : baseMode;

                              const toBlack = (s) => {
                                let out = s;
                                out = out.replace(/\/white\//i, '/black/');
                                out = out.replace(/-w(?=[-.])/i, '-b');
                                return out;
                              };
                              const toWhite = (s) => {
                                let out = s;
                                out = out.replace(/\/black\//i, '/white/');
                                out = out.replace(/-b(?=[-.])/i, '-w');
                                return out;
                              };

                              if (!shouldApplyRules) return src;

                              if ((active === 'the_human_inside' || active === 'miscellania' || isAustenTileSwapBW) && (mode === 'white' || mode === 'black') && !isAustenPemberley) {
                                return mode === 'white' ? toWhite(src) : toBlack(src);
                              }

                              if (mode === 'color') {
                                const hasMultiLight = src.toLowerCase().includes('-multi-light-');
                                const hasMultiDark = src.toLowerCase().includes('-multi-dark-');
                                const hasThruLight = src.toLowerCase().includes('-multi-thru-light-');
                                const hasThruDark = src.toLowerCase().includes('-multi-thru-dark-');
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiDark) return src;
                                if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiLight) return src;
                                if (isAustenPemberley) {
                                  if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                  return src;
                                }
                                if (isAustenKeepCalm) {
                                  const safeIdxKc = safeIdx;
                                  if (safeIdxKc === 8) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  const isRedShirt = shirtColor === '#CB001D';
                                  if (isRedShirt) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  return src;
                                }
                                if (hasMultiLight) return src;
                                if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (hasThruLight) return src;
                                if (hasThruDark) return src.replace(/-multi-thru-dark-/i, '-multi-thru-light-');
                                if (hasWRed) return src;
                                if (hasThruRed) return src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                return src;
                              }

                              if (isAustenPemberley && (mode === 'white' || mode === 'black') && !(useEdgeOverride && (isFirst || isLast))) {
                                return src;
                              }

                              if (mode === 'white') {
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (hasThruRed || hasWRed) {
                                  return hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                }
                                return toWhite(src);
                              }
                              if (mode === 'black') {
                                return toBlack(src);
                              }

                              return src;
                            } catch {
                              return src;
                            }
                          };

                          const hasPerTileSrc = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const perTile = resolvePerTileAssetSrc(base);
                              const candidate = perTile || base;
                              if (hasPerTileSrc) return candidate;
                              return resolveDrawingOverlaySrcForTile(candidate) || candidate;
                            } catch {
                              return base;
                            }
                          })();
                          const imgUrl = picked ? encodeURI(picked) : '';
                          const safeW = Number(r?.width) || 0;
                          const safeH = Number(r?.height) || 0;
                          const safeL = Number(r?.left) || 0;
                          const safeT = Number(r?.top) || 0;

                          return (
                            <div
                              key={`stripe-tile-drawing-p1-${idx}-${imgUrl || ''}`}
                              style={{
                                position: 'absolute',
                                left: `${safeL}%`,
                                top: `${safeT}%`,
                                width: `${safeW}%`,
                                height: `${safeH}%`,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                background: drawingOverlayDebug ? 'rgba(217,70,239,0.06)' : 'transparent',
                                border: drawingOverlayDebug ? '1px solid rgba(217,70,239,0.35)' : '0px solid transparent',
                                // El desplacament del gap va DINS de cada filera: a la vista vertical
                                // (dues fileres de 7) la posicio dins la filera es idx % 7.
                                transform: tileGapPxLocal ? `translateX(${(isPortraitTablet ? (idx % 7) : idx) * tileGapPxLocal}px)` : 'none',
                              }}
                            >
                              {drawingOverlayDebug ? (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 6,
                                    fontSize: 12,
                                    fontWeight: 900,
                                    color: 'rgba(88,28,135,0.92)',
                                    textShadow: '0 1px 1px rgba(255,255,255,0.85)',
                                    userSelect: 'none',
                                    zIndex: 13,
                                  }}
                                >
                                  {`D${idx + 1}`}
                                </div>
                              ) : null}

                              <img
                                src={imgUrl ? imgUrl : undefined}
                                alt=""
                                className="block absolute inset-0"
                                onError={(e) => {
                                  try {
                                    e.currentTarget.style.display = 'none';
                                  } catch {
                                  }
                                }}
                                style={{
                                  pointerEvents: 'none',
                                  height: '100%',
                                  width: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.98,
                                  transformOrigin: 'top center',
                                  transform: (() => {
                                    const cal = getTileCalibration(picked, calibrationOverrides);
                                    // El calibratge es d'una filera: a la vista vertical
                                    // la casella es 1/7 d'amplada (en comptes de la de la
                                    // filera), i els desplacaments en px s'han d'escalar amb
                                    // la casella perque el dibuix caigui al mateix lloc.
                                    const fA = (() => {
                                      const original = Array.isArray(stripeMaskTileRectsRawPct) ? stripeMaskTileRectsRawPct[idx] : null;
                                      const w1 = Number(original?.width) || 0;
                                      const w2 = Number(rectsMascara?.[idx]?.width) || 0;
                                      return (w1 > 0 && w2 > 0) ? w1 / w2 : 1;
                                    })();
                                    // A la vista vertical el dibuix no canvia de mida
                                    // (PASSOS_ESCALA_GAP_DIBUIX_VERTICAL es congelat) i el
                                    // gap s'estreta MOVENT: el dibuix de l'esquerra de la
                                    // filera no es mou i la resta es desplacen el 10% de
                                    // l'espai buit que tenen a l'esquerra
                                    // (GAP_MOVIMENT_DIBUIX_VERTICAL).
                                    const factorGap = 0.9 ** PASSOS_ESCALA_GAP_DIBUIX_VERTICAL;
                                    const escalaGap = isPortraitTablet ? 1 - factorGap * (1 - cal.scale) : cal.scale;
                                    // La mida dels dibuixos a la vertical (un 20% menys).
                                    const factorEscalaDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_ESCALA_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_ESCALA_VERTICAL[picked] ?? 1)
                                      : 1;
                                    const escalaDibuix = isPortraitTablet ? escalaGap * ESCALA_DIBUIX_VERTICAL * factorEscalaDibuix : escalaGap;
                                    // A la vista vertical el dy es el propi de la
                                    // vertical (la base de la impressio, alineada amb
                                    // THE HUMAN INSIDE); a la resta de vistes, el de sempre.
                                    const dyDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_DY_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DY_VERTICAL[picked] ?? cal.dy)
                                      : cal.dy;
                                    if (idx % 7 === 0) {
                                      gapDibuixAcumulat = 0;
                                      gapDibuixEscalaAnterior = null;
                                    }
                                    if (isPortraitTablet) {
                                      if (gapDibuixEscalaAnterior != null) {
                                        const gapAmbAnterior = 1 - (gapDibuixEscalaAnterior + escalaDibuix) / 2;
                                        gapDibuixAcumulat += (1 - GAP_MOVIMENT_DIBUIX_VERTICAL) * gapAmbAnterior;
                                      }
                                      gapDibuixEscalaAnterior = escalaDibuix;
                                    }
                                    const desplacamentGap = isPortraitTablet ? -100 * gapDibuixAcumulat : 0;
                                    const dxDibuix = isPortraitTablet
                                      ? cal.dx + (STRIPE_DRAWING_DX_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DX_VERTICAL[picked] ?? 0)
                                      : cal.dx;
                                    return `translate(calc(${dxDibuix}px * ${fA} + ${desplacamentGap}% + var(--hgStripeDrawingExtraDx, 0px)), calc(${dyDibuix}px + var(--hgStripeDrawingExtraDy, -5px)${idx < 7 ? ' + var(--hgStripeDrawingExtraDyFilaDalt, 0px)' : ''})) scale(calc(${escalaDibuix} * var(--hgStripeDrawingExtraScale, 1)))`;
                                  })(),
                                  filter: (() => {
                                    const baseFx = drawingOverlayDebug
                                      ? 'drop-shadow(0 0 2px rgba(0,0,0,0.65))'
                                      : active === 'austen'
                                            && typeof picked === 'string'
                                            && picked.toLowerCase().includes('/austen/keep_calm/')
                                            && picked.toLowerCase().endsWith('keep-calm-w-stripe.webp')
                                          ? 'drop-shadow(0 0 2px rgba(0,0,0,0.75))'
                                        : 'none';
                                    return baseFx;
                                  })(),
                                }}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchpriority={idx === 0 ? 'high' : undefined}
                              />
                            </div>
                          );
                        })
                        : Array.from({ length: 14 }).map((_, idx) => {
                          if (Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) {
                            return null;
                          }
                          const base = (() => {
                            try {
                              if (Array.isArray(stripeTileOverlaySrcs) && stripeTileOverlaySrcs[idx]) {
                                return normalizeOverlaySrc(stripeTileOverlaySrcs[idx]);
                              }
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            } catch {
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            }
                          })();

                          const resolvePerTileAssetSrc = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return null;
                              const tpl = String(src || '').trim();
                              if (!tpl) return null;
                              const i1 = idx + 1;
                              const hasTpl = tpl.includes('{i}') || tpl.includes('{idx}') || tpl.includes('{n}');
                              if (hasTpl) {
                                return tpl
                                  .replace(/\{i\}/g, String(i1))
                                  .replace(/\{n\}/g, String(i1))
                                  .replace(/\{idx\}/g, String(idx));
                              }
                              return null;
                            } catch {
                              return null;
                            }
                          };
                          const isAustenKeepCalm = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
                          const isAustenTileSwapBW = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/(pemberley_house|crosswords|quotes)\//i.test(resolvedOverlaySrc);
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'miscellania' || isAustenKeepCalm || isAustenTileSwapBW;
                          const baseMode = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                          const isAustenPemberley = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);

                          const resolveDrawingOverlaySrcForTile = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return src;
                              const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
                              // A la vista vertical la franja son DUES fileres de 7: la samarreta
                              // sencera (i el seu dibuix) es la de l'extrem de CADA filera.
                              const isFirst = isPortraitTablet ? safeIdx % 7 === 0 : safeIdx === 0;
                              const isLast = isPortraitTablet ? safeIdx % 7 === 6 : safeIdx === 13;
                              const useEdgeOverride = active === 'first_contact' || active === 'the_human_inside' || active === 'miscellania' || isAustenPemberley || isAustenKeepCalm;
                              const mode = useEdgeOverride && isFirst
                                ? (baseMode === 'color' ? 'color' : 'black')
                                : useEdgeOverride && isLast
                                  ? (baseMode === 'color' ? 'color' : 'white')
                                  : baseMode;

                              const toBlack = (s) => {
                                let out = s;
                                out = out.replace(/\/white\//i, '/black/');
                                out = out.replace(/-w(?=[-.])/i, '-b');
                                return out;
                              };
                              const toWhite = (s) => {
                                let out = s;
                                out = out.replace(/\/black\//i, '/white/');
                                out = out.replace(/-b(?=[-.])/i, '-w');
                                return out;
                              };

                              if (!shouldApplyRules) return src;

                              if ((active === 'the_human_inside' || active === 'miscellania' || isAustenTileSwapBW) && (mode === 'white' || mode === 'black') && !isAustenPemberley) {
                                return mode === 'white' ? toWhite(src) : toBlack(src);
                              }

                              if (mode === 'color') {
                                const hasMultiLight = src.toLowerCase().includes('-multi-light-');
                                const hasMultiDark = src.toLowerCase().includes('-multi-dark-');
                                const hasThruLight = src.toLowerCase().includes('-multi-thru-light-');
                                const hasThruDark = src.toLowerCase().includes('-multi-thru-dark-');
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiDark) return src;
                                if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiLight) return src;
                                if (isAustenPemberley) {
                                  if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                  return src;
                                }
                                if (isAustenKeepCalm) {
                                  const safeIdxKc = safeIdx;
                                  if (safeIdxKc === 8) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  const isRedShirt = shirtColor === '#CB001D';
                                  if (isRedShirt) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  return src;
                                }
                                if (hasMultiLight) return src;
                                if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (hasThruLight) return src;
                                if (hasThruDark) return src.replace(/-multi-thru-dark-/i, '-multi-thru-light-');
                                if (hasWRed) return src;
                                if (hasThruRed) return src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                return src;
                              }

                              if (mode === 'white') {
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (hasThruRed || hasWRed) {
                                  return hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                }
                                return toWhite(src);
                              }
                              if (mode === 'black') {
                                return toBlack(src);
                              }

                              return src;
                            } catch {
                              return src;
                            }
                          };

                          const perTileRaw = (() => {
                            try {
                              if (!base) return null;
                              return resolvePerTileAssetSrc(base);
                            } catch {
                              return null;
                            }
                          })();

                          const hasPerTileSrcFallback = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const candidate = perTileRaw || base;
                              if (hasPerTileSrcFallback) return candidate;
                              return resolveDrawingOverlaySrcForTile(candidate) || candidate;
                            } catch {
                              return base;
                            }
                          })();

                          const imgUrl = picked ? encodeURI(picked) : '';
                          return (
                            <div
                              key={`stripe-tile-drawing-fallback-p1-${idx}-${imgUrl || ''}`}
                              style={{
                                position: 'absolute',
                                top: '0%',
                                height: '100%',
                                left: `${(idx / 14) * 100}%`,
                                width: `${(1 / 14) * 100}%`,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                // El desplacament del gap va DINS de cada filera: a la vista vertical
                                // (dues fileres de 7) la posicio dins la filera es idx % 7.
                                transform: tileGapPxLocal ? `translateX(${(isPortraitTablet ? (idx % 7) : idx) * tileGapPxLocal}px)` : 'none',
                              }}
                            >
                              <img
                                src={imgUrl ? imgUrl : undefined}
                                alt=""
                                className="block absolute inset-0"
                                onError={(e) => {
                                  try {
                                    e.currentTarget.style.display = 'none';
                                  } catch {
                                  }
                                }}
                                style={{
                                  pointerEvents: 'none',
                                  height: '100%',
                                  width: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.98,
                                  transformOrigin: 'top center',
                                  transform: (() => {
                                    const cal = getTileCalibration(picked, calibrationOverrides);
                                    // El calibratge es d'una filera: a la vista vertical
                                    // la casella es 1/7 d'amplada (en comptes de la de la
                                    // filera), i els desplacaments en px s'han d'escalar amb
                                    // la casella perque el dibuix caigui al mateix lloc.
                                    const fA = (() => {
                                      const original = Array.isArray(stripeMaskTileRectsRawPct) ? stripeMaskTileRectsRawPct[idx] : null;
                                      const w1 = Number(original?.width) || 0;
                                      const w2 = Number(rectsMascara?.[idx]?.width) || 0;
                                      return (w1 > 0 && w2 > 0) ? w1 / w2 : 1;
                                    })();
                                    // A la vista vertical el dibuix no canvia de mida
                                    // (PASSOS_ESCALA_GAP_DIBUIX_VERTICAL es congelat) i el
                                    // gap s'estreta MOVENT: el dibuix de l'esquerra de la
                                    // filera no es mou i la resta es desplacen el 10% de
                                    // l'espai buit que tenen a l'esquerra
                                    // (GAP_MOVIMENT_DIBUIX_VERTICAL).
                                    const factorGap = 0.9 ** PASSOS_ESCALA_GAP_DIBUIX_VERTICAL;
                                    const escalaGap = isPortraitTablet ? 1 - factorGap * (1 - cal.scale) : cal.scale;
                                    // La mida dels dibuixos a la vertical (un 20% menys).
                                    const factorEscalaDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_ESCALA_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_ESCALA_VERTICAL[picked] ?? 1)
                                      : 1;
                                    const escalaDibuix = isPortraitTablet ? escalaGap * ESCALA_DIBUIX_VERTICAL * factorEscalaDibuix : escalaGap;
                                    // A la vista vertical el dy es el propi de la
                                    // vertical (la base de la impressio, alineada amb
                                    // THE HUMAN INSIDE); a la resta de vistes, el de sempre.
                                    const dyDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_DY_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DY_VERTICAL[picked] ?? cal.dy)
                                      : cal.dy;
                                    if (idx % 7 === 0) {
                                      gapDibuixAcumulat = 0;
                                      gapDibuixEscalaAnterior = null;
                                    }
                                    if (isPortraitTablet) {
                                      if (gapDibuixEscalaAnterior != null) {
                                        const gapAmbAnterior = 1 - (gapDibuixEscalaAnterior + escalaDibuix) / 2;
                                        gapDibuixAcumulat += (1 - GAP_MOVIMENT_DIBUIX_VERTICAL) * gapAmbAnterior;
                                      }
                                      gapDibuixEscalaAnterior = escalaDibuix;
                                    }
                                    const desplacamentGap = isPortraitTablet ? -100 * gapDibuixAcumulat : 0;
                                    const dxDibuix = isPortraitTablet
                                      ? cal.dx + (STRIPE_DRAWING_DX_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DX_VERTICAL[picked] ?? 0)
                                      : cal.dx;
                                    return `translate(calc(${dxDibuix}px * ${fA} + ${desplacamentGap}% + var(--hgStripeDrawingExtraDx, 0px)), calc(${dyDibuix}px + var(--hgStripeDrawingExtraDy, -5px)${idx < 7 ? ' + var(--hgStripeDrawingExtraDyFilaDalt, 0px)' : ''})) scale(calc(${escalaDibuix} * var(--hgStripeDrawingExtraScale, 1)))`;
                                  })(),
                                  filter: (() => {
                                    return 'none';
                                  })(),
                                }}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : null}

                </div>

                <ClicAreaOverlayP1
                  src="/placeholders/cercador/full-clic-area-5.svg"
                  highlightAll={!!clicAreaHighlight}
                  highlightIndices={clicAreaHighlightIndices}
                  tshirtColor={shirtColor}
                  disabledIndices={emptyTileIndices}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MegaStripePanelP1;
