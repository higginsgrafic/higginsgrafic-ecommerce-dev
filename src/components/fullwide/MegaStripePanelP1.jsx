import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MegaColumn from './MegaColumn.jsx';
import { computeStripeTileItems, computeStripeTileOverlaySrcs, resolveForItem } from '../../utils/resolveStripeTile.js';
import ContornsFlex, { contornsActius } from '../megaslide/ContornsVertical.jsx';
import {
  GAP_PX,
  VerticalColleccions,
  VerticalFletxes,
  VerticalGraellaDibuixos,
  VerticalSelector,
  VerticalStripeFranja,
  ampladaCarril,
} from '../megaslide/VerticalPieces.jsx';
import ClicAreaOverlayP1 from './ClicAreaOverlayP1.jsx';
import { CERCADOR_COLORS } from './CercadorTopBar.jsx';
import { STRIPE_DRAWING_CALIBRATIONS } from '../../config/stripeCalibrations';
import { deltaObjectiuPageLift, desplacamentFranjaEscriptori } from '../../utils/mesuraMegaslide.js';
import { carrilPx } from '../../utils/layoutMetrics.js';

// La franja de samarretes de la pàgina 1 tendeix a quedar-se uns 10 px més avall
// del que toca: l'alçada del contenidor de la pàgina es calcula a partir del
// bottom mesurat de la franja i el pageLift es calibra amb el selector, de
// manera que el resultat depèn de l'ordre de les mesures. Amb aquest ajust la
// franja torna a la seva posició, i la pàgina 2 el fa servir perquè les dues
// franges quedin a la mateixa alçada.
export const FRANJA_AJUST_PX = 10;

// Les caselles de control de la filera (la botonera i les fletxes): no son
// dibuixos i no han d'entrar ni a la graella ni a la franja de la vertical.
const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

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
  let lsMap = null;
  try {
    const raw = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
    lsMap = raw ? JSON.parse(String(raw)) : null;
  } catch {
    lsMap = null;
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
  return { dx: 0, dy: 0, scale: 1 };
}

function useEmptyShirtMask(emptyTileIndices, shirtColor) {
  const [dataUrl, setDataUrl] = useState(null);
  const emptyKey = Array.isArray(emptyTileIndices) ? emptyTileIndices.join(',') : '';
  useEffect(() => {
    let cancelled = false;
    fetch('/placeholders/cercador/full-clic-area-5.svg')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
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
          const svgEl = doc.documentElement;
          const serialized = new XMLSerializer().serializeToString(svgEl);
          const encoded = encodeURIComponent(serialized);
          setDataUrl(`data:image/svg+xml,${encoded}`);
        } catch {
          setDataUrl(null);
        }
      })
      .catch(() => setDataUrl(null));
    return () => { cancelled = true; };
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
  neckDotIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
  calibrationOverrides,
  compactLandscape = false,
  fitAlcada = 1,
  onP1ContentBottomChange,
  onPageLiftChange,
  isPortraitTablet = false,
  isLandscapeTablet = false,
}) {
  const emptyShirtMaskUrl = useEmptyShirtMask(emptyTileIndices, shirtColor);
  const pageRootRef = useRef(null);
  const pageLiftRef = useRef(0);
  const [pageLift, setPageLift] = useState(0);
  // Franja estreta (768-1366 en horitzontal): hi ha ajustos propis de 10 px i
  // l'ajust general de la franja no s'hi aplica.
  const esEstenyFins1366 = typeof window !== 'undefined'
    && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight;

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
      const selector = root.querySelector('[data-stripe-buttonbar="bn"]');
      if (isPortraitTablet) {
        if (pageLiftRef.current !== 0) {
          pageLiftRef.current = 0;
          setPageLift(0);
        }
        onPageLiftChange?.(0);
      } else if (selector) {
        // L'objectiu del pageLift és una funció pura (midesMegaslide.js): el
        // càlcul vivia aquí dins de l'efecte i no es podia comprovar sense
        // navegador. La fórmula és la mateixa.
        const selectorTop = selector.getBoundingClientRect().top;
        const panelTop = panel.getBoundingClientRect().top;
        const delta = deltaObjectiuPageLift({
          selectorTop,
          panelTop,
          ample: window.innerWidth,
          alt: window.innerHeight,
          esTauleta: isPortraitTablet || isLandscapeTablet,
        });
        const next = Math.max(0, pageLiftRef.current + delta);
        if (Math.abs(next - pageLiftRef.current) >= 0.5) {
          pageLiftRef.current = next;
          setPageLift(next);
          onPageLiftChange?.(next);
        }
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

  /* LA VERTICAL: la composicio propia de la pagina 1.
     Tres files dins del carril:
       fila 1: la filera de dibuixos (el carrusel)
       fila 2: la stripe + les fletxes
       fila 3: la stripe + el selector Blanc/Color/Negre
     La franja es la MULTICOLOR: es fan servir les mateixes funcions que la
     resta del megaslide amb la variant de color. */
  const itemsFila = useMemo(() => {
    const cols = resolvedMega?.[active] || [];
    const items = cols[0]?.items || [];
    return items.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [resolvedMega, active]);

  const stripeVertical = useMemo(() => {
    if (itemsFila.length === 0) return { srcs: null, items: null };
    return {
      srcs: computeStripeTileOverlaySrcs({
        drawable: itemsFila,
        variant: 'color',
        active,
        displayedShirtColor: 'white',
        resolvedOverlaySrc,
      }),
      items: computeStripeTileItems(itemsFila),
    };
  }, [itemsFila, active, resolvedOverlaySrc]);

  // Els blocs de la vertical, mesurats, per poder-ne pintar els contorns.
  const contornsRef = useRef(null);
  const [contornsBlocs, setContornsBlocs] = useState([]);
  useLayoutEffect(() => {
    if (!isPortraitTablet || !contornsActius()) { setContornsBlocs([]); return undefined; }
    const mesura = () => {
      const arrel = contornsRef.current;
      if (!arrel) return;
      const base = arrel.getBoundingClientRect();
      const blocs = [...arrel.querySelectorAll('[data-contorn-bloc]')].map((el) => {
        const b = el.getBoundingClientRect();
        return {
          left: `${Math.round(b.left - base.left)}px`,
          top: `${Math.round(b.top - base.top)}px`,
          width: `${Math.round(b.width)}px`,
          height: `${Math.round(b.height)}px`,
        };
      });
      setContornsBlocs(blocs);
    };
    mesura();
    const t = window.setTimeout(mesura, 400);
    window.addEventListener('resize', mesura);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', mesura); };
  }, [isPortraitTablet]);

  if (isPortraitTablet && active) {
    const carril = ampladaCarril(typeof window !== 'undefined' ? window.innerWidth : 0);
    const variantActual = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
    return (
      <div ref={pageRootRef} className="w-full shrink-0">
        <div
          ref={contornsRef}
          data-vertical-megaslide="1"
          style={{
            position: 'relative',
            width: carril ? `${Math.round(carril)}px` : '100%',
            maxWidth: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Roboto Condensed, sans-serif',
            color: '#4A5057',
          }}
        >
          {contornsActius() ? <ContornsFlex blocs={contornsBlocs} /> : null}
          {/* FILA 1: la filera de dibuixos (el carrusel). */}
          <div data-vertical-graella="1" data-contorn-bloc="1">
            <VerticalGraellaDibuixos active={active} items={itemsFila} />
          </div>

          {/* FILA 2: la stripe i, a la dreta, les fletxes. La stripe ocupa dues
              files de la retícula; les fletxes i el selector van a la columna
              de la dreta, una a cada fila. */}
          <div style={{ display: 'flex', gap: `${GAP_PX * 4}px`, marginTop: `${GAP_PX * 3}px`, alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 0%', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }} data-contorn-bloc="2">
              <VerticalStripeFranja
                width={Math.max(0, Math.round(carril) - Math.round(carril * 0.19) - GAP_PX * 4)}
                srcs={stripeVertical.srcs}
                items={stripeVertical.items}
                selectedItem={selectedItem}
                onSelect={(idx) => {
                  const it = stripeVertical.items?.[idx];
                  if (!it) return;
                  setStripeOverlayOverrideActive?.(false);
                  if (active === 'first_contact') setFirstContactSelectedItem?.(it);
                  else if (active === 'the_human_inside') setHumanInsideSelectedItem?.(it);
                  else setSelectedItemByCollection?.((prev) => ({ ...prev, [active]: it }));
                }}
              />
            </div>

            {/* La columna de la dreta: les fletxes (fila 2) i el selector (fila 3). */}
            <div style={{ flex: `0 0 ${Math.round(carril * 0.19)}px`, display: 'flex', flexDirection: 'column', gap: `${GAP_PX * 3}px` }}>
              <div data-contorn-bloc="3">
                <VerticalFletxes
                  tileSize={Math.round(carril * 0.19 * 0.9)}
                  onPrev={() => setThinStartIndex?.((v) => v - 1)}
                  onNext={() => setThinStartIndex?.((v) => v + 1)}
                />
              </div>
              <div data-contorn-bloc="4">
            <VerticalSelector
              variant={variantActual}
              visibility={stripeVariantVisibility}
              onWhite={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('white'); else setFirstContactVariant?.('white'); }}
              onBlack={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('black'); else setFirstContactVariant?.('black'); }}
              onMulti={() => { setStripeOverlayOverrideActive?.(false); if (active === 'the_human_inside') setHumanInsideVariant?.('color'); else setFirstContactVariant?.('color'); }}
            />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            marginTop: compactLandscape ? '16px' : `${stripeRowPadPx - ((!isPortraitTablet && !compactLandscape && !esEstenyFins1366) ? FRANJA_AJUST_PX : 0)}px`,
            // El coixí de sota tambe s'ajusta a l'alcada de la finestra (vegeu
            // fitAlcada a MegaMenuPanel): si no, la franja s'encongiria pero el
            // panell no. Ha de coincidir amb MegaStripePanel (pàgina 2).
            paddingBottom: compactLandscape ? '8px' : `${stripeRowPadPx * fitAlcada}px`,
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
          <div className="w-full flex justify-center bg-transparent">
            <div
              id="stripe-guide-stripe-row-p1"
              className="relative inline-block"
              style={{
                height: carrilPx(stripePreviewHPx),
                width: 'auto',
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
                  width: 'fit-content',
                  display: 'inline-block',
                  transformOrigin: 'top center',
                  // A l'apaisada pugem la stripe 10px (les samarretes). El
                  // desplaçament va amb la resta de la seva posicio, que ve de
                  // les variables de calibracio.
                  // La franja s'ajusta tambe a l'alcada de la finestra (fitAlcada):
                  // en una finestra curta, la seva mida de disseny no hi cap i es
                  // menja el panell. MegaStripePanel (pagina 2) fa el mateix.
                  // El desplaçament (i la resta de la posició) ve de les
                  // variables de calibracio i NO s'escala: el `translate` va
                  // abans de l'`scale`, o sigui en px del pare. El que s'escala
                  // es la mida de la filera (`stripePreviewHPx`).
                  transform: `translate(var(--megaStripeDx, 0px), calc(var(--megaStripeDy, 0px) + ${(typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? -10 : 0}px + ${desplacamentFranjaEscriptori({ ample: typeof window !== 'undefined' ? window.innerWidth : 0, alt: typeof window !== 'undefined' ? window.innerHeight : 0, esTauleta: isPortraitTablet || isLandscapeTablet })}px)) scale(calc(var(--megaStripeScale, 1.2125) * ${fitAlcada}))`,
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
                    width: 'fit-content',
                    display: 'inline-block',
                    position: 'relative',
                    zIndex: 1,
                    WebkitMaskImage: emptyShirtMaskUrl
                      ? `url("${emptyShirtMaskUrl}")`
                      : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
                    maskImage: emptyShirtMaskUrl
                      ? `url("${emptyShirtMaskUrl}")`
                      : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: '103% 100%',
                    maskSize: '103% 100%',
                    WebkitMaskPosition: '50% 0',
                    maskPosition: '50% 0',
                  }}
                >
                  {megaStripeSpriteEnabledLocal ? (
                    <img
                      src={stripeImageSrc || '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'}
                      alt=""
                      className="block"
                      style={{
                        height: '100%',
                        width: 'auto',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {shirtColor && shirtColor !== '#FFFFFF' ? (
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
                      }}
                    />
                  ) : null}

                  {megaStripeRefEnabledLocal && megaStripeRefSrcLocal ? (
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

                  {megaStripeRef2EnabledLocal && megaStripeRef2SrcLocal ? (
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
                        const r = Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                          ? stripeMaskTileRectsRawPct[idx]
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

                  {megaShirtDrawingEnabledLocal && drawingOverlaySrcEffective ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 12,
                        transformOrigin: 'top center',
                        transform: 'none',
                        background: 'transparent',
                      }}
                    >
                      {Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                        ? stripeMaskTileRectsRawPct.map((r, idx) => {
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
                              const isFirst = safeIdx === 0;
                              const isLast = safeIdx === 13;
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
                                transform: tileGapPxLocal ? `translateX(${idx * tileGapPxLocal}px)` : 'none',
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
                                    const isPemberleyHouse = active === 'austen' && typeof picked === 'string' && /\/austen\/pemberley_house\//i.test(picked);
                                    const extraDx = isPemberleyHouse ? -2 : 0;
                                    return `translate(${cal.dx + extraDx}px, calc(${cal.dy}px + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(${cal.scale} * var(--hgStripeDrawingExtraScale, 1)))`;
                                  })(),
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof picked === 'string' && /\/austen\/pemberley_house\//i.test(picked);
                                    const baseFx = drawingOverlayDebug
                                      ? 'drop-shadow(0 0 2px rgba(0,0,0,0.65))'
                                      : active === 'austen'
                                            && typeof picked === 'string'
                                            && picked.toLowerCase().includes('/austen/keep_calm/')
                                            && picked.toLowerCase().endsWith('keep-calm-w-stripe.webp')
                                          ? 'drop-shadow(0 0 2px rgba(0,0,0,0.75))'
                                        : isPemberley
                                          ? 'drop-shadow(0 0 0px rgba(0,0,0,0.85))'
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
                              const isFirst = safeIdx === 0;
                              const isLast = safeIdx === 13;
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
                                transform: tileGapPxLocal ? `translateX(${idx * tileGapPxLocal}px)` : 'none',
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
                                    const isPemberleyHouse = active === 'austen' && typeof picked === 'string' && /\/austen\/pemberley_house\//i.test(picked);
                                    const extraDx = isPemberleyHouse ? -2 : 0;
                                    return `translate(${cal.dx + extraDx}px, calc(${cal.dy}px + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(${cal.scale} * var(--hgStripeDrawingExtraScale, 1)))`;
                                  })(),
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
                                    const baseFx = isPemberley ? 'drop-shadow(0 0 0px rgba(0,0,0,0.85))' : 'none';
                                    return baseFx;
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

                <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 40 }}>
                  {(Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                    ? stripeMaskTileRectsRawPct.map((r, idx) => ({
                      idx,
                      cx: (Number(r?.left) || 0) + (Number(r?.width) || 0) / 2,
                    }))
                    : Array.from({ length: 14 }).map((_, idx) => ({
                      idx,
                      cx: ((idx + 0.5) / 14) * 100,
                    }))
                  ).filter(({ idx }) => Array.isArray(neckDotIndices) && neckDotIndices.includes(idx)).map(({ idx, cx }) => (
                    <span
                      key={`neck-dot-p1-${idx}`}
                      style={{
                        position: 'absolute',
                        left: `${cx}%`,
                        top: 0,
                        width: 'var(--hgStripeNeckDotSize, 5.625px)',
                        height: 'var(--hgStripeNeckDotSize, 5.625px)',
                        borderRadius: '50%',
                        backgroundColor: 'var(--hgStripeNeckDotColor, #1a1a1a)',
                        transform: 'translate(-50%, calc(-100% + var(--hgStripeNeckDotDy, -2px)))',
                      }}
                    />
                  ))}
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
