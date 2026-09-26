import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import MegaColumn, { GAP_X_PX } from './MegaColumn.jsx';
import ClicAreaOverlay from './ClicAreaOverlay.jsx';
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
  VEL_SAMARRETA_BUIDA_ALFA_BLANCA,
} from '../../config/stripeCalibrationsVertical';
import { carrilPx } from '../../utils/layoutMetrics.js';
import useEscalaFranjaCarril from '../../hooks/useEscalaFranjaCarril.js';
import {
  areesClicAmpla,
  areesClicEstreta,
  VECTOR_FRANJA_SAMARRETES,
  VECTOR_FRANJA_SAMARRETES_01,
  VECTOR_FRANJA_CAIXES,
  VECTOR_FRANJA_VIEWBOX,
  VECTOR_FRANJA_VIEWBOX_OBERT,
  VECTOR_FRANJA_CONTINGUT,
  VECTOR_FRANJA_SAMARRETA,
  VECTOR_FRANJA_SAMARRETA_01,
  VECTOR_FRANJA_IMPRESSIO_01,
  VECTOR_FRANJA_MIDA_SENCERA,
  VECTOR_FRANJA_MIDA_IMPRESSIO,
} from '../../config/vectorFranja.js';

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

// El full de les catorze siluetes de samarreta es demana una sola vegada per
// sessio: els dos panells (pagina 1 i pagina 2) i les dues mascares (les
// samarretes buides i les inactives) el fan servir, i el fitxer no canvia.
let cacheSiluetesSamarreta = null;
function carregaSiluetesSamarreta() {
  if (!cacheSiluetesSamarreta) {
    cacheSiluetesSamarreta = fetch('/placeholders/cercador/full-clic-area-5.svg')
      .then((r) => r.text())
      .catch(() => null);
  }
  return cacheSiluetesSamarreta;
}

/**
 * El VEL de les samarretes: una capa amb la silueta de cada casella pintada de
 * blanc, amb la opacitat que toqui.
 *
 * El full (`full-clic-area-5.svg`) porta un `path` per samarreta, en l'ordre de
 * les catorze cases de la franja. Aqui nome's se n'ajusta el color i
 * l'opacitat: els `paths` que no son al mapa es treuen (queden transparents), i
 * la resta es pinten amb l'opacitat demanada. Serveix per a dues coses, i totes
 * dues son el mateix gest:
 *
 *   - LES SAMARRETES BUIDES (ja hi era): es queden a 0,3 de blanc (o 0,1 si la
 *     samarreta es de color).
 *   - LES SAMARRETES QUE NO SON DE LA COLLECCIO ACTIVA (25/09/2026, ho va
 *     demanar l'amo: «Les samarretes, quan no son actives, tambe s'han
 *     d'atenuar, no nome's el dibuix»). Fins ara nome's s'atenuava la capa del
 *     DIBUIX (0,12) i la samarreta blanca quedava igual: a la franja, que es una
 *     sola imatge amb les catorze samarretes, la inactiva es distingia nome's
 *     pel dibuix. Amb el vel, la casella sencera queda mes fluixa.
 *
 * @param {Record<number, number>} opacitats - casella -> opacitat del vel.
 * @param {string} key - qualsevol valor que canvii quan canvia el mapa.
 * @param {string} color - el color del vel (blanc per defecte).
 */
function useVelSamarretes(opacitats, key, color = 'white') {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const mapa = opacitats && typeof opacitats === 'object' ? opacitats : {};
    carregaSiluetesSamarreta()
      .then((text) => {
        if (cancelled) return;
        // Sense cap casella a velar no hi ha res a pintar. El `setState` va
        // DINS del `then`, que es asincron: cridar-lo al cos de l'efecte es un
        // render en cascada i el lint ho atura.
        if (!text || !Object.keys(mapa).length) {
          setDataUrl(null);
          return;
        }
        try {
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
          const paths = doc.querySelectorAll('.tshirt-outline');
          paths.forEach((p, i) => {
            const op = mapa[i];
            if (typeof op !== 'number') {
              p.remove();
              return;
            }
            p.setAttribute('fill', color);
            p.setAttribute('fill-opacity', String(op));
            p.removeAttribute('stroke');
            p.removeAttribute('class');
          });
          const svgEl = doc.documentElement;
          const serialized = new XMLSerializer().serializeToString(svgEl);
          setDataUrl(`data:image/svg+xml,${encodeURIComponent(serialized)}`);
        } catch {
          setDataUrl(null);
        }
      })
      .catch(() => setDataUrl(null));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, color]);
  return dataUrl;
}

/** Les catorze siluetes a 0,3 de blanc: el vel de les samarretes buides. */
function useEmptyShirtMask(emptyTileIndices, shirtColor) {
  const emptyKey = Array.isArray(emptyTileIndices) ? emptyTileIndices.join(',') : '';
  const isWhite = !shirtColor || shirtColor === '#FFFFFF';
  const opacitat = isWhite ? 0.3 : 0.1;
  const mapa = {};
  for (const i of (Array.isArray(emptyTileIndices) ? emptyTileIndices : [])) {
    if (Number.isInteger(i) && i >= 0 && i < 14) mapa[i] = opacitat;
  }
  return useVelSamarretes(mapa, `${emptyKey}|${opacitat}`);
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
  // Si la franja s'ha d'ajustar a l'amplada del carril (les manigues a fora).
  // Ho decideix qui el posa: a la vista vertical, la franja viu dins d'una
  // filera escalada i no hi ha carril.
  ajustFranjaCarril = false,
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
  // LA TIRA DE DIBUIXOS QUE CIRCULA (25/09/2026): la llista sencera (64
  // dibuixos, amb la seva colleccio) i el desplaçament actual. Vegeu
  // `MegaslidePagina2`.
  stripeStrip = null,
  stripeStripOffset = 0,
  onStripeStripWheel,
  onStripeStripSelect,
  clicAreaHighlight,
  clicAreaHighlightIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
  indicesSamarretesBuides,
  // LES SAMARRETES QUE NO SON DE LA COLLECCIO ACTIVA (25/09/2026): les cases on
  // s'ha de posar el vel, perque la samarreta tambe s'atenui i no nome's el
  // dibuix. Vegeu `MegaslidePagina2`.
  indicesSamarretesInactives = [],
  alfaVelSamarretaInactiva = 0.6,
  calibrationOverrides,
  visualOffsetY = 0,
  compactLandscape = false,
}) {
  // Id unic per al retall dels dibuixos: els dos panells conviuen al DOM i
  // amb un id repetit la referencia url(#...) no resolia.
  const idRetall = `hgRetallSamarretes-${useId().replace(/:/g, '')}`;
  // La franja s'ha de quedar dins del carril amb les manigues a fora: el factor
  // surt de l'amplada del carril, no d'un numero calibrat (vegeu l'hook). A la
  // vista vertical no s'hi aplica: alla la franja te el seu propi calibratge.
  const filaFranjaRef = useRef(null);
  const { factor: factorCarrilFranja, centre: centreCarrilFranja } = useEscalaFranjaCarril(filaFranjaRef, ajustFranjaCarril);
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

  // El vel de les samarretes inactives (vegeu la prop). Nomes a l'apaisat: alla
  // la franja es UNA sola imatge amb les catorze samarretes i no hi ha cap
  // silueta per casella on posar-lo. A la vista vertical ja hi ha els `path` de
  // la silueta dins l'SVG, i alla el vel s'hi posa per casella (`indices`).
  const clauVelInactives = Array.isArray(indicesSamarretesInactives) ? indicesSamarretesInactives.join(',') : '';
  const mapaVelInactives = {};
  if (!isPortraitTablet) {
    for (const i of (Array.isArray(indicesSamarretesInactives) ? indicesSamarretesInactives : [])) {
      if (Number.isInteger(i) && i >= 0 && i < 14) mapaVelInactives[i] = alfaVelSamarretaInactiva;
    }
  }
  const velSamarretesInactivesUrl = useVelSamarretes(mapaVelInactives, `${clauVelInactives}|${alfaVelSamarretaInactiva}`);

  useEffect(() => {
    const handler = (ev) => {
      if (typeof onShirtClick !== 'function') return;
      // NOME'S ELS CLICS D'AQUEST PANELL: hi ha dos panells muntats i tots dos
      // escolten el mateix esdeveniment (vegeu `ClicAreaOverlay`).
      if (ev.detail?.panellId != null && ev.detail.panellId !== idRetall) return;
      const x = ev.detail?.x;
      const y = ev.detail?.y;
      if (typeof x !== 'number') return;
      // LA IDENTITAT DEL DIBUIX SURT DE LA CASA CLICADA (25/09/2026).
      //
      // Les catorze cases son fixes i el que circula es la tira de 64 dibuixos:
      // cada casa ensenya el dibuix que li toca segons `stripeStripOffset`. El
      // gestor tornava a calcular aquesta rotacio pel seu compte, i amb dues
      // rotacions calculades a llocs diferents el clic s'anava desincronitzant
      // (mesurat: la casa 0 ensenyava `dj-vader` i obria el producte de
      // `nx-01`, tres cases enrere).
      //
      // Ara qui pinta deixa la identitat del dibuix a la propia casa
      // (`data-stripe-item`, `data-stripe-collection`): el gestor nome's
      // l'ha de llegir i no hi pot haver desincronitzacio.
      // El `src` que el pintor ha deixat a la casa es la font de veritat: es
      // exactament el que es veu, i amb ell es pot trobar l'item i la colleccio
      // a la tira (les tres llistes van en paral·lel, es construeixen juntes).
      let item = null;
      let collection = null;
      let subcollection = null;
      let srcDeLaCasa = null;
      try {
        const capa = filaFranjaRef.current;
        if (capa) {
          const idx = (isPortraitTablet && typeof y === 'number')
            ? Math.min(13, Math.max(0, (y < 0.5 ? 0 : 7) + Math.min(6, Math.max(0, Math.floor(x * 7)))))
            : Math.min(13, Math.max(0, Math.floor(x * 14)));
          const casa = capa.querySelector(`[data-stripe-tile="${idx}"]`);
          srcDeLaCasa = casa?.getAttribute?.('data-stripe-src') || null;
          if (srcDeLaCasa && Array.isArray(stripeStrip?.srcs)) {
            const i = stripeStrip.srcs.indexOf(srcDeLaCasa);
            if (i >= 0) {
              item = stripeStrip.items?.[i] ?? null;
              collection = stripeStrip.collections?.[i] ?? null;
              subcollection = stripeStrip.subcollections?.[i] ?? null;
            }
          }
          // Si el src no es a la llista (o no hi ha tira), es cau als atributs
          // que tambe ha deixat el pintor.
          if (!item) item = casa?.getAttribute?.('data-stripe-item') || null;
          if (!collection) collection = casa?.getAttribute?.('data-stripe-collection') || null;
          if (!subcollection) subcollection = casa?.getAttribute?.('data-stripe-subcollection') || null;
        }
      } catch {
        // s'ignora a posta: es cau al calcul de reserva
      }
      if (!item) {
        // Reserva (si el DOM no hi es): la rotacio, comptada una sola vegada.
        const tileIdx = (isPortraitTablet && typeof y === 'number')
          ? Math.min(13, Math.max(0, (y < 0.5 ? 0 : 7) + Math.min(6, Math.max(0, Math.floor(x * 7)))))
          : Math.min(13, Math.max(0, Math.floor(x * 14)));
        item = stripeTileItems?.[tileIdx] || selectedItem || stripeTileItems?.[0] || null;
        collection = stripeStrip?.collections?.[tileIdx] || active;
        subcollection = stripeStrip?.subcollections?.[tileIdx] || null;
      }
      if (!item) return;
      if (!collection) collection = active;
      // I la samarreta clicada tambe ACTIVA la seva colleccio (25/09/2026, ho va
      // demanar l'amo): es el mateix cami que el clic d'una icona atenuada de la
      // graella, i deixa la colleccio centrada a la finestra de la graella.
      if (typeof onStripeStripSelect === 'function') {
        onStripeStripSelect(collection, subcollection);
      }
      onShirtClick(collection, item, shirtColor);
    };
    window.addEventListener('mega-stripe-full-hit-p2', handler);
    return () => window.removeEventListener('mega-stripe-full-hit-p2', handler);
    // `stripeStrip` i `onStripeStripSelect` tambe hi son: el gestor en llegeix la
    // colleccio i la subcolleccio de la casa clicada, i amb una llista de
    // dependencies curta es quedava amb les primeres (mai no hi eren).
  }, [onShirtClick, selectedItem, stripeTileItems, active, shirtColor, stripeStrip, onStripeStripSelect]);

  // LA RODETA SOBRE LA FRANJA (25/09/2026, ho va demanar l'amo): fa passar els
  // dibuixos d'un en un, com la graella i com la tira de colors. Amb
  // `passive: false` perque el gest tambe ha d'aturar el desplaçament vertical
  // de la pagina mentre el punter es a sobre la franja.
  useEffect(() => {
    const el = filaFranjaRef.current;
    if (!el || typeof onStripeStripWheel !== 'function' || !stripeStrip) return undefined;
    el.addEventListener('wheel', onStripeStripWheel, { passive: false });
    return () => el.removeEventListener('wheel', onStripeStripWheel);
  }, [onStripeStripWheel, stripeStrip]);

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
            // A la vista vertical, la meitat del coixi a dalt i el coixi
            // sencer a baix deixaven la franja enganxada al fons de la
            // casella (semblava tallada). Amb mig coixi a dalt queda centrada.
            marginTop: compactLandscape ? '16px' : `${stripeRowPadPx}px`,
            paddingBottom: compactLandscape ? '8px' : `${stripeRowPadPx}px`,
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
              id="stripe-guide-stripe-row"
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
                  width: '100%',
                  display: 'block',
                  transformOrigin: 'top center',
                  // La franja NO s'ajusta a l'alcada de la finestra: fa el carril
                  // SEMPRE (vegeu MegaMenuPanel). Abans hi havia un factor
                  // d'alcada que l'encongia a les finestres baixes i trencava
                  // l'encaix per les cintures.
                  // El desplaçament ve de les variables de calibracio i NO
                  // s'escala (el `translate` va abans de l'`scale`: és en px del
                  // pare). El que s'escala és la mida de la filera, i l'escala
                  // que la porta al carril la calcula `useEscalaFranjaCarril`
                  // (les manigues hi queden a fora, a la mida del dibuix).
                  transform: `translate(var(--megaStripeDx, 0px), calc(var(--megaStripeDy, 0px) + ${visualOffsetY}px)) scale(calc(var(--megaStripeScale, 1.2125) * ${factorCarrilFranja}))`,
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
                  {megaStripeSpriteEnabledLocal && !isPortraitTablet ? (
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

                  {/* EL VEL DE LES SAMARRETES QUE NO SON DE LA COLLECCIO ACTIVA
                      (25/09/2026, ho va demanar l'amo: «Les samarretes, quan no
                      son actives, tambe s'han d'atenuar, no nome's el dibuix»).

                      Mateixa caixa i mateix aspecte que la imatge de la franja
                      (es desplacen de la mateixa manera: les dues van amb
                      `height: 100%`), i la silueta nomes cau damunt de la
                      samarreta. Es queda per sota de la capa dels DIBUIXOS: alla
                      el dibuix tambe s'atenua (0,12) i ha de conservar el seu
                      to. */}
                  {velSamarretesInactivesUrl ? (
                    <img
                      src={velSamarretesInactivesUrl}
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
                        zIndex: 6,
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : null}

                  {/* EL VECTOR DE LES DUES FRANGES. Mateixa caixa i mateix aspecte
                      que la imatge (viewBox 0 0 1487 694,05): les 14 siluetes de
                      les dues fileres. Cada path porta un id perque els sandboxos
                      de cada samarreta (clipPath) s'hi puguin referenciar. */}
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
                      {/* El tint del color, DINS de l'SVG i just despres de la
                          imatge: aixi queda per sota del vel i de les siluetes,
                          pero per damunt de la imatge (que es opaca). */}
                      {shirtColor && shirtColor !== '#FFFFFF' && stripeImageSrc ? (
                        <>
                          <defs>
                            <mask
                              id={`hgTintMask-${idRetall}`}
                              maskType="alpha"
                              style={{ maskType: 'alpha' }}
                              maskUnits="userSpaceOnUse"
                              x={0}
                              y={0}
                              width={VECTOR_FRANJA_VIEWBOX.width}
                              height={VECTOR_FRANJA_CONTINGUT}
                            >
                              <image
                                href={stripeImageSrc}
                                x={0}
                                y={0}
                                width={VECTOR_FRANJA_VIEWBOX.width}
                                height={VECTOR_FRANJA_CONTINGUT}
                                preserveAspectRatio="none"
                              />
                            </mask>
                          </defs>
                          <rect
                            x={0}
                            y={0}
                            width={VECTOR_FRANJA_VIEWBOX_OBERT.width}
                            height={VECTOR_FRANJA_VIEWBOX_OBERT.height}
                            fill={shirtColor}
                            mask={`url(#hgTintMask-${idRetall})`}
                            style={{ mixBlendMode: 'multiply' }}
                          />
                        </>
                      ) : null}
                      {/* El vel de les samarretes sense dibuix: la silueta de
                          cada casella buida pintada de blanc. Va AQUI, despres de
                          la imatge i abans de les siluetes, perque el contorn del
                          vector quedi sempre per damunt. */}
                      {isPortraitTablet && Array.isArray(indicesSamarretesBuides) && indicesSamarretesBuides.length > 0
                        ? indicesSamarretesBuides.map((idx) => {
                          // Els extrems son NOMES la primera de dalt de tot i
                          // l'ultima de baix de tot; la resta son intermedies.
                          const extrem = idx === 0 || idx === 13;
                          const a = extrem ? areesClicAmpla()[idx] : areesClicEstreta()[idx];
                          // La segona filera va girada, com les siluetes del
                          // vector: mirall en X amb eix a Y.
                          const girar = idx >= 7;
                          const ajustGir = extrem ? 302.2 : 65.3;
                          // El vel, 0,5 px mes amunt (en unitats del panell).
                          const AJUST_VEL_Y = 1.6767;
                          const esBlanca = shirtColor === '#FFFFFF';
                          return (
                            <path
                              key={`hg-vel-${idx}`}
                              id={`hg-vel-${idx}`}
                              d={a.d}
                              transform={`translate(${a.tx}, ${a.ty - AJUST_VEL_Y})${girar ? ` translate(${ajustGir}, 0) scale(-1, 1)` : ''} ${a.transform}`}
                              // Blanc pla, sense cap efecte: la samarreta
                              // s'aclareix cap al fons conservant el seu to.
                              fill="#FFFFFF"
                              fillOpacity={esBlanca ? VEL_SAMARRETA_BUIDA_ALFA_BLANCA : 'var(--hgStripeEmptyVeilAlpha, 0.85)'}
                              clipRule="evenodd"
                            />
                          );
                        })
                        : null}
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
                      {/* I les QUE NO SON DE LA COLLECCIO ACTIVA (25/09/2026):
                          a la vista vertical la silueta ve donada per l'`area de
                          clic` de cada casella, que es la que fa servir el mateix
                          vel de les buides. Ho va demanar l'amo: «Les samarretes,
                          quan no son actives, tambe s'han d'atenuar, no nome's el
                          dibuix.» */}
                      {(indicesSamarretesInactives || []).map((idx) => {
                        if (!Number.isInteger(idx) || idx < 0 || idx >= 14) return null;
                        const extrem = idx === 0 || idx === 13;
                        const a = extrem ? areesClicAmpla()[idx] : areesClicEstreta()[idx];
                        if (!a) return null;
                        const girar = idx >= 7;
                        const ajustGir = extrem ? 302.2 : 65.3;
                        const AJUST_VEL_Y = 1.6767;
                        return (
                          <path
                            key={`hg-vel-inactiva-${idx}`}
                            d={a.d}
                            transform={`translate(${a.tx}, ${a.ty - AJUST_VEL_Y})${girar ? ` translate(${ajustGir}, 0) scale(-1, 1)` : ''} ${a.transform}`}
                            fill="#FFFFFF"
                            fillOpacity={alfaVelSamarretaInactiva}
                            clipRule="evenodd"
                          />
                        );
                      })}
                    </svg>
                  ) : null}



                  {shirtColor && shirtColor !== '#FFFFFF' && !isPortraitTablet ? (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: shirtColor,
                        mixBlendMode: 'multiply',
                        // Les arrugues es marquen amb el tint (multiply) al maxim:
                        // no cal cap filtre d'enfocament.
                        opacity: 1,
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
                        maxWidth: 'none',
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

                  {/* Silueta de les 14 samarretes (coordenades 0-1) per retallar-hi
                      els dibuixos i que no trepitgin el blanc entre samarretes. */}
                  {isPortraitTablet ? (
                    <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      <clipPath id={idRetall} clipPathUnits="objectBoundingBox">
                        {/* Les siluetes de les 14 samarretes, tal com son al vector
                            de la franja (cada una a la seva casella). */}
                        {VECTOR_FRANJA_SAMARRETES_01.map((camiK, k) => (
                          <path key={`retall-${k}`} d={camiK} clipRule="evenodd" />
                        ))}
                      </clipPath>
                    </svg>
                  ) : null}

                  {megaShirtDrawingEnabledLocal && drawingOverlaySrcEffective ? (
                    <div
                      data-stripe-drawing-layer
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
                          // El dibuix d'aquesta casa surt de la TIRA sencera
                          // (64 dibuixos) desplaçada pel `stripeStripOffset`.
                          // LA CASA DE LA TIRA, AMB EL MODUL DE LA TIRA SENZERA
                          // (25/09/2026). Les catorze cases son fixes i el que
                          // circula es la llista dels 64 dibuixos: la casa `i`
                          // ensenya el dibuix `i + stripeStripOffset` de la TIRA.
                          // El modul ha de ser la llargada de la TIRA (64), no la
                          // de `stripeStrip` (14), que es una llista retallada.
                          const nTira = Array.isArray(stripeStrip?.srcs) ? stripeStrip.srcs.length : 0;
                          const iTira = nTira > 0
                            ? ((((idx + stripeStripOffset) % nTira) + nTira) % nTira)
                            : idx;
                          const deLaTira = nTira > 0
                            ? {
                              src: stripeStrip.srcs[iTira],
                              collection: stripeStrip.collections[iTira],
                              item: stripeStrip.items?.[iTira] ?? null,
                              subcollection: stripeStrip.subcollections?.[iTira] ?? null,
                            }
                            : null;
                          // Tile buit (samarreta sense dibuix): no renderitzem res
                          // (no repetim ni fem fallback al dibuix per defecte).
                          if (!deLaTira && Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) {
                            return null;
                          }
                          const base = (() => {
                            try {
                              if (deLaTira) return normalizeOverlaySrc(deLaTira.src);
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
                              data-stripe-tile={idx}
                              // LA IDENTITAT DEL DIBUIX, escrita per qui el
                              // pinta (25/09/2026). El gestor del clic la
                              // llegeix d'aqui en lloc de tornar a calcular la
                              // rotacio de la tira: amb dues rotacions
                              // calculades a llocs diferents, el clic anava tres
                              // cases enrere (mesurat: la casa 0 ensenyava
                              // `dj-vader` i obria el producte de `nx-01`).
                              data-stripe-src={deLaTira?.src || undefined}
                              data-stripe-item={deLaTira?.item || undefined}
                              data-stripe-collection={deLaTira?.collection || undefined}
                              data-stripe-subcollection={deLaTira?.subcollection || undefined}
                              key={`stripe-tile-drawing-${idx}`}
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
                                // L'ATENUACIO DELS DIBUIXOS QUE NO SON DE LA COLLECCIO
                                // ACTIVA (25/09/2026). Primer va anar a 0,24, la
                                // mateixa que fa servir la graella (`pintaItem`),
                                // pero a la FRANJA no n'hi ha prou: el dibuix hi va
                                // sobre una samarreta blanca i un traç negre prim, i a
                                // 0,24 encara es llegeix. Ho va demanar l'amo: «A la
                                // stripe, els atenuats ho han de ser més.» Ara es 0,12,
                                // la meitat. La graella es queda a 0,24: alla els
                                // dibuixos son mes grans i el gris ja es veu.
                                opacity: deLaTira && deLaTira.collection && deLaTira.collection !== active ? 0.12 : 1,
                                // UN PAS DE TIRA, UNA TRANSICIO CURTA (25/09/2026): la
                                // tira no llisca de debò —les catorze cases son fixes i
                                // el dibuix de fons no es repeteix—, o sigui que el que
                                // es veu es el canvi de dibuix. Amb 160 ms el canvi es
                                // llegeix com un moviment i no com un salt, i es prou
                                // curt perque el retall de la casella no es vegi.
                                transition: stripeStrip ? 'opacity 160ms ease' : undefined,
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
                                    // Els calibratges es van fer amb la franja a escala 2,116
                                    // i ara va a 2,059: compensem el factor perque els
                                    // desplaçaments (en px, dins l'embolcall escalat) no
                                    // s'encongeixin amb ella.
                                    const factorEscalaFranja = 1.027683;
                                    const dyDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_DY_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DY_VERTICAL[picked] ?? cal.dy) * factorEscalaFranja
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
                                      ? (cal.dx + (STRIPE_DRAWING_DX_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DX_VERTICAL[picked] ?? 0)) * factorEscalaFranja
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
                                    // Els calibratges es van fer amb la franja a escala 2,116
                                    // i ara va a 2,059: compensem el factor perque els
                                    // desplaçaments (en px, dins l'embolcall escalat) no
                                    // s'encongeixin amb ella.
                                    const factorEscalaFranja = 1.027683;
                                    const dyDibuix = isPortraitTablet
                                      ? (STRIPE_DRAWING_DY_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DY_VERTICAL[picked] ?? cal.dy) * factorEscalaFranja
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
                                      ? (cal.dx + (STRIPE_DRAWING_DX_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DX_VERTICAL[picked] ?? 0)) * factorEscalaFranja
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

                  {/* ClicAreaOverlay is the sole click target for shirts.
                      The old transparent div (z-index 3) that also dispatched
                      mega-stripe-full-hit has been removed to avoid duplicate
                      events and coordinate mismatches. */}

                </div>


                {/* Contorn de l'àrea de clic (samarretes), alineat amb la
                    màscara de la imatge (103% × 100%, centrat). Cada samarreta
                    es ressalta en passar-hi el ratolí; si `clicAreaHighlight`
                    (hover sobre el nom del dibuix) és cert, es ressalten totes. */}
                <ClicAreaOverlay
                  panellId={idRetall}
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
