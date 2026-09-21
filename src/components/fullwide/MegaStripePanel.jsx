import React, { useEffect, useState, useMemo } from 'react';
import MegaColumn, { GAP_X_PX } from './MegaColumn.jsx';
import ClicAreaOverlay from './ClicAreaOverlay.jsx';
import { CERCADOR_COLORS } from './CercadorTopBar.jsx';
import { STRIPE_DRAWING_CALIBRATIONS } from '../../config/stripeCalibrations';
import { carrilPx } from '../../utils/layoutMetrics.js';

/**
 * Reserva d'espai de la graella vella a la pàgina 2.
 *
 * La pàgina 2 ja no dibuixa les 8 columnes de text: la graella de dibuixos viu
 * a CercadorTextRow. Però el lloc que ocupava el MegaColumn encara s'ha de
 * reservar, perquè la franja de samarretes no pugi.
 *
 * El buit és un fill únic amb `aspect-ratio`, que reprodueix la mida de la
 * graella vella a partir de l'amplada del belt (no pas una alçada fixa: a
 * desktop el belt s'encongeix per sota de 1382 i l'alçada l'ha de seguir).
 * Calibrat contra el MegaColumn de debò: 8,77 dona la mateixa alçada a
 * 768/1024/1280/1366/1440/1920 amb una desviació de dècimes de px.
 *
 * El transform `scale(0.94)` del contenidor no canvia la geometria del flux;
 * per això la reserva es mesura amb la mida escalada del contenidor.
 */
// Alçada de la reserva de la graella de la pàgina 2 = la de la filera de la
// pàgina 1. És la fórmula del MegaColumn, no un `aspect-ratio`: el tile és
// `(belt − 8 separacions) / 9`, i a sobre hi van el marge de dalt del botó
// (8 px) i el descendent de la seva línia (~5,96 px). Tot en px de LAYOUT (el
// contenidor els escala al 0,94 en pintar-los).
const RESERVA_ALCADA = `calc((var(--hg-mega-w, 1350px) - ${8 * GAP_X_PX}px * var(--hg-escala-mega, 1)) / 9 + 13.96px)`;

/**
 * Banda estreta del megaslide: el desktop que no arriba al belt de 1350.
 *
 * El belt no arriba als 1350 i tot el bloc s'ha encongit, però la franja de
 * samarretes no (la seva mida va lligada a l'amplada de la pàgina). Per això
 * aquí no se li ha d'aplicar el desplaçament de -15 px.
 *
 * El llindar inferior és 1025 i no 768 a posta: 1024×768 és la tauleta
 * apaisada, que també compleix «ample ≥ alt» i que NO s'ha de tocar. Com que
 * a 1024 la franja ja té 29 px de coixí, deixar-la fora no costa res.
 *
 * S'ha de mantenir idèntic a MegaStripePanelP1 (`esEstenyFins1366`): si una
 * pàgina el baixa i l'altra no, les dues franges es desquadren.
 */
// Mateixa condicio que `esEstenyFins1366` de MegaStripePanelP1 (inclou el
// 1024): si una pagina el baixa i l'altra no, les dues franges es desquadren.
// Abans aixo deia `> 1024`, i a la tauleta apaisada de 1024 la franja de la
// pagina 2 queia 15 px mes amunt que la de la pagina 1.
const esFranjaEstenya = typeof window !== 'undefined'
  && window.innerWidth >= 768 && window.innerWidth <= 1366
  && window.innerWidth >= window.innerHeight;

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

function MegaStripePanel({
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
  isPortraitTablet = false,
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
  neckDotIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
  calibrationOverrides,
  visualOffsetY = 0,
  compactLandscape = false,
  fitAlcada = 1,
}) {
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
  const emptyShirtMaskUrl = useEmptyShirtMask(emptyTileIndices, shirtColor);

  useEffect(() => {
    const handler = (ev) => {
      if (typeof onShirtClick !== 'function') return;
      const x = ev.detail?.x;
      if (typeof x !== 'number') return;
      const tileIdx = Math.min(13, Math.max(0, Math.floor(x * 14)));
      const item = stripeTileItems?.[tileIdx] || selectedItem || stripeTileItems?.[0];
      if (!item) return;
      onShirtClick(active, item, shirtColor);
    };
    window.addEventListener('mega-stripe-full-hit-p2', handler);
    return () => window.removeEventListener('mega-stripe-full-hit-p2', handler);
  }, [onShirtClick, selectedItem, stripeTileItems, active, shirtColor]);

  return (
    <div className="w-full shrink-0">
      {!hideGrid || reserveGridSpace ? (
        <div
          className="relative z-10 grid grid-cols-1 gap-10"
          style={{
            transform: 'scale(var(--hgGridFitScale, 0.94))',
            transformOrigin: 'top center',
            visibility: reserveGridSpace ? 'hidden' : undefined,
            pointerEvents: reserveGridSpace ? 'none' : undefined,
          }}
          aria-hidden={reserveGridSpace ? true : undefined}
        >
          {reserveGridSpace ? (
            /* Només reserva: el MegaColumn vell ja no s'ha de dibuixar (pàgina 2).
               L'alçada ha de ser EXACTAMENT la de la filera de la pàgina 1,
               perquè la franja arrenqui a la mateixa alçada a les dues pàgines.
               Es reprodueix la fórmula del MegaColumn (vegeu `RESERVA_ALCADA`),
               que no és proporcional al belt: la separació de 12 px i el marge
               de dalt de 8 px s'escalen amb el belt i el descendent de la línia
               del botó (~5,1 px) no. */
            <div style={{ width: '100%', height: RESERVA_ALCADA }} />
          ) : (
            (resolvedMega[active] || []).map((col, idx) => (
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
            ))
          )}
        </div>
      ) : null}

      {showStripe ? (
        <div
          className="relative z-0"
          style={{
            marginTop: compactLandscape ? '16px' : `${stripeRowPadPx}px`,
            // El coixí de sota tambe s'ajusta a l'alcada de la finestra (vegeu
            // fitAlcada): si no, la franja s'encongiria pero el panell no.
            paddingBottom: compactLandscape ? '8px' : `${stripeRowPadPx * fitAlcada}px`,
            paddingLeft: `${stripeRowPadXPx?.left || 0}px`,
            paddingRight: `${stripeRowPadXPx?.right || 0}px`,
            // A la banda estreta la franja NO s'ha de pujar: el belt s'ha
            // encongit i aquests -15 px deixaven el seu top 1,2 px per damunt
            // del bottom de la graella de colors, que quedava partida en dues
            // meitats (els cercles a dalt i el COLOR/NEGRE dins les samarretes).
            // El mateix ajust va a MegaStripePanelP1 perquè les dues pàgines
            // quedin a la mateixa alçada.
            transform: (compactLandscape || esFranjaEstenya) ? 'none' : 'translateY(-15px)',
          }}
        >
          <div className="w-full flex justify-center bg-transparent">
            <div
              id="stripe-guide-stripe-row"
              className="relative inline-block"
              style={{
                height: carrilPx(stripePreviewHPx),
                width: 'auto',
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
                data-stripe-visual-content="2"
                style={{
                  height: '100%',
                  width: 'fit-content',
                  display: 'inline-block',
                  transformOrigin: 'top center',
                  // La franja s'ajusta tambe a l'alcada de la finestra (fitAlcada):
                  // en una finestra curta, la seva mida de disseny no hi cap i es
                  // menja el panell. MegaStripePanelP1 (pagina 1) fa el mateix
                  // amb el mateix factor, perque les dues franges quedin igual.
                  // El desplaçament ve de les variables de calibracio i NO
                  // s'escala (el `translate` va abans de l'`scale`: és en px del
                  // pare). El que s'escala és la mida de la filera.
                  transform: `translate(var(--megaStripeDx, 0px), calc(var(--megaStripeDy, 0px) + ${visualOffsetY}px)) scale(calc(var(--megaStripeScale, 1.2125) * ${fitAlcada}))`,
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
                          key={`stripe-tile-debug-abs-${idx}`}
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
                          key={`stripe-tile-debug-abs-fallback-${idx}`}
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
                  {megaStripeSpriteEnabledLocal ? (
                    <img
                      src={stripeImageSrc || '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp?v=2866'}
                      alt=""
                      className="block"
                      style={{
                        height: '100%',
                        width: 'auto',
                        maxWidth: 'none',
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
                        maxWidth: 'none',
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
                        maxWidth: 'none',
                        transformOrigin: 'top center',
                        transform: 'translate(var(--megaStripeRef2Dx, 0px), var(--megaStripeRef2Dy, 0px)) scale(var(--megaStripeRef2Scale, 1))',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {/* Imatge prerenderitzada de les samarretes buides esvaïdes
                      (N.webp, transparent), alineada amb la stripe. Esvaeix només
                      les buides; la zona dels dibuixos és transparent i no tapa
                      les samarretes de color. */}
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
                        maxWidth: 'none',
                        pointerEvents: 'none',
                        zIndex: 9,
                        opacity: 'var(--hgStripeEmptyMaskOpacity, 1)',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : null}

                  {/* Capa de bloqueig de clics sobre les samarretes buides
                      (transparent; el fade visual ve de stripeEmptyMaskSrc). */}
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
                            key={`disabled-tile-${idx}`}
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
                      {Array.isArray(rectsMascara) && rectsMascara.length === 14
                        ? rectsMascara.map((r, idx) => {
                          // Tile buit (samarreta sense dibuix): no renderitzem res
                          // (no repetim ni fem fallback al dibuix per defecte).
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
                              key={`stripe-tile-drawing-${idx}-${imgUrl || ''}`}
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
                                    if (
                                      import.meta.env.DEV
                                      && active === 'austen'
                                      && typeof resolvedOverlaySrc === 'string'
                                      && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc)
                                    ) {
                                      // eslint-disable-next-line no-console
                                      console.error('[MEGA stripe tile img error]', { idx, src: imgUrl, resolvedOverlaySrc });
                                    }
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
                                    return `translate(calc(${cal.dx + extraDx}px * ${fA}), calc(${cal.dy}px * ${fA} + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(${cal.scale} * var(--hgStripeDrawingExtraScale, 1)))`;
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
                          // Tile buit (samarreta sense dibuix): no renderitzem res.
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
                              key={`stripe-tile-drawing-fallback-${idx}-${imgUrl || ''}`}
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
                                    const isPemberleyHouse = active === 'austen' && typeof picked === 'string' && /\/austen\/pemberley_house\//i.test(picked);
                                    const extraDx = isPemberleyHouse ? -2 : 0;
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
                                    return `translate(calc(${cal.dx + extraDx}px * ${fA}), calc(${cal.dy}px * ${fA} + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(${cal.scale} * var(--hgStripeDrawingExtraScale, 1)))`;
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

                  {/* ClicAreaOverlay is the sole click target for shirts.
                      The old transparent div (z-index 3) that also dispatched
                      mega-stripe-full-hit has been removed to avoid duplicate
                      events and coordinate mismatches. */}

                </div>

                {/* Cercle fosc sobre el coll de cada samarreta, situat al gap
                    superior (fora de la imatge), alineat amb el centre de cada
                    casella. Configurable amb CSS vars: --hgStripeNeckDotSize,
                    --hgStripeNeckDotColor, --hgStripeNeckDotDy. */}
                <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 40 }}>
                  {(Array.isArray(rectsMascara) && rectsMascara.length === 14
                    ? rectsMascara.map((r, idx) => ({
                      idx,
                      cx: (Number(r?.left) || 0) + (Number(r?.width) || 0) / 2,
                    }))
                    : Array.from({ length: 14 }).map((_, idx) => ({
                      idx,
                      cx: ((idx + 0.5) / 14) * 100,
                    }))
                  ).filter(({ idx }) => Array.isArray(neckDotIndices) && neckDotIndices.includes(idx)).map(({ idx, cx }) => (
                    <span
                      key={`neck-dot-${idx}`}
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

                {/* Contorn de l'àrea de clic (samarretes), alineat amb la
                    màscara de la imatge (103% × 100%, centrat). Cada samarreta
                    es ressalta en passar-hi el ratolí; si `clicAreaHighlight`
                    (hover sobre el nom del dibuix) és cert, es ressalten totes. */}
                <ClicAreaOverlay
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

export default MegaStripePanel;
