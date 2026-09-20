import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import CercadorTextRow from '../fullwide/CercadorTextRow.jsx';
import MegaStripePanel from '../fullwide/MegaStripePanel.jsx';
import { FRANJA_AJUST_PX } from '../fullwide/MegaStripePanelP1.jsx';
import { desplacamentFranjaEscriptori } from '../../utils/mesuraMegaslide.js';
import { carrilPx, carrilLane } from '../../utils/layoutMetrics.js';
import { CapaTaulaVertical, TaulaVerticalP2 } from './TaulaVertical.jsx';
import {
  CercadorColleccionsColumna,
  CercadorColorsGrid,
  CercadorDibuixosGraella,
  dibuixosGraella16x4,
} from '../fullwide/CercadorTextRow.jsx';
import { colorGap, colorMida } from '../fullwide/midesGraella.js';
import { ampladaCarril } from './TaulaVertical.jsx';
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
  isPortraitTablet = false,
  isLandscapeTablet = false,
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
  page1MegaTileSize,
  page1StripePreviewHPx,
  page1PageLift = 0,
  fitAlcada = 1,
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
  const viewportRef = useRef(null);
  const calibrationRef = megaMenuRef;
  const cal = useMegaslideCalibration('p2', active, calibrationRef);
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

  const compactMegaTileSize = page1MegaTileSize || megaTileSize;
  const compactStripePreviewHPx = page1StripePreviewHPx || stripePreviewHPx;
  // El vertical fa servir exactament les mateixes mides que l'apaisada: la
  // pagina es la mateixa, nomes que a vertical no s'hi veu sencera i cal
  // desplacar-la horitzontalment.
  //
  // Mida de DISSENY del selector (el tile del carril): es pinta amb `carrilPx`,
  // aixi que s'encongeix amb el carril com el de la pagina 1. El bucle
  // `alignTopRowToPage1` alinea el boto Color de les dues pagines i el
  // desplaçament que hi aplica (`topVisualAlignmentY`) tambe mou la filera de
  // dibuixos de la pagina 2: per aixo tots dos (selector i filera) s'han
  // d'encongir amb el MATEIX factor, i per aixo tots dos surten del carril.
  const bnSliderSize = (compactMegaTileSize || 120) * ((isPortraitTablet || isLandscapeTablet) ? 0.94 : 1);
  // A la banda estreta, la filera de dalt de la pàgina 2 (el selector
  // Blanc/Color/Negre i la graella de colors) cau 38 px més avall que la de la
  // pàgina 1: allà la filera viu dins del MegaColumn i aquí en blocs propis.
  // El senyal visible és que el selector i els cercles no queden a la mateixa
  // alçada que els de la pàgina 1 en canviar de pàgina.
  //
  // El desplaçament va al contenidor de la graella de colors (40 -> 2 px), i
  // NO al `top` del CercadorTextRow: aquell el reescriu el bucle
  // `alignTopRowToPage1`, que el compensaria. El selector segueix la graella
  // tot sol, perquè `centraAmbLaGraellaDeColors` el centra amb ella.
  //
  // La franja de samarretes no es mou: depèn del contingut de la pàgina 1.
  //
  // El `!isLandscapeTablet` és imprescindible: 1024×768 també compleix
  // «ample ≥ alt» i NO és la banda estreta, és la tauleta apaisada. Si hi
  // entra, se li baixa la filera 38 px i se li desquadra el selector.
  const esBandaEstreta = typeof window !== 'undefined'
    && !isLandscapeTablet
    && window.innerWidth >= 768 && window.innerWidth <= 1366
    && window.innerWidth >= window.innerHeight;
  const topGraellaColors = 40 - (esBandaEstreta ? 38 : 0);
  // Desplaçament de la franja a l'escriptori, per repartir el marge afegit a
  // l'alçada de la pestanya (vegeu midesMegaslide.js). Va tambe a la franja de
  // la pagina 1, amb el mateix valor, perque han de quedar a la mateixa alçada.
  const desplacamentFranja = desplacamentFranjaEscriptori({
    ample: typeof window !== 'undefined' ? window.innerWidth : 0,
    alt: typeof window !== 'undefined' ? window.innerHeight : 0,
    esTauleta: isPortraitTablet || isLandscapeTablet,
  });
  const [topVisualAlignmentY, setTopVisualAlignmentY] = useState(0);
  // Desplaçament propi del selector Blanc/Color/Negre perquè quedi centrat amb
  // la graella de colors. Va a part de topVisualAlignmentY (que alinea el
  // selector amb el de la pàgina 1): així els dos ajustos no es trepitgen.
  const [selectorCentratgeY, setSelectorCentratgeY] = useState(0);
  // Els mateixos valors en refs: l'efecte de calibratge els necessita per
  // arrencar del que ja hi ha aplicat sense dependre de l'estat (que el faria
  // realimentar-se).
  const alignRefY = useRef(0);
  const centraRefY = useRef(0);
  const snapTimerRef = useRef(0);
  const neutralGammaRef = useRef(null);
  const tiltDeltaRef = useRef(0);


  const scrollToProgress = useCallback((progress, behavior = 'smooth') => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    viewport.scrollTo({ left: maxScroll * Math.min(1, Math.max(0, progress)), behavior });
  }, []);

  const handlePortraitScroll = useCallback(() => {
    window.clearTimeout(snapTimerRef.current);
    const viewport = viewportRef.current;
    if (viewport) {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
      window.dispatchEvent(new CustomEvent('mega-portrait-scroll', { detail: { progress } }));
    }
    snapTimerRef.current = window.setTimeout(() => {
      if (Math.abs(tiltDeltaRef.current) > 3) return;
      if (!viewport) return;
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (maxScroll <= 0) return;
      const snapStep = maxScroll / 2;
      viewport.scrollTo({ left: Math.round(viewport.scrollLeft / snapStep) * snapStep, behavior: 'smooth' });
    }, 180);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    if (!isPortraitTablet) {
      viewport.scrollLeft = 0;
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      scrollToProgress(0, 'auto');
    });
    return () => cancelAnimationFrame(frame);
  }, [active, isPortraitTablet, scrollToProgress]);


  useEffect(() => {
    if (!isPortraitTablet || !active) return undefined;
    let viewport = viewportRef.current;
    if (!viewport) {
      // El viewport pot aparèixer després que el mega menu s'obri
      const observer = new MutationObserver(() => {
        viewport = viewportRef.current;
        if (viewport) {
          observer.disconnect();
          viewport.addEventListener('scroll', handlePortraitScroll, { passive: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        if (viewport) viewport.removeEventListener('scroll', handlePortraitScroll);
      };
    }
    viewport.addEventListener('scroll', handlePortraitScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handlePortraitScroll);
  }, [isPortraitTablet, active, handlePortraitScroll]);

  useEffect(() => () => window.clearTimeout(snapTimerRef.current), []);

  useEffect(() => {
    if (!isPortraitTablet) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Sol·licita permís per a deviceorientation a iOS
    const OrientationEvent = window.DeviceOrientationEvent;
    if (OrientationEvent && typeof OrientationEvent.requestPermission === 'function') {
      OrientationEvent.requestPermission().catch(() => {});
    }

    neutralGammaRef.current = null;
    tiltDeltaRef.current = 0;
    let frame = 0;
    const handleOrientation = (event) => {
      if (!Number.isFinite(event.gamma)) return;
      if (neutralGammaRef.current == null) neutralGammaRef.current = event.gamma;
      tiltDeltaRef.current = event.gamma - neutralGammaRef.current;
    };
    const tick = () => {
      const viewport = viewportRef.current;
      const delta = tiltDeltaRef.current;
      if (viewport && Math.abs(delta) > 3) {
        const velocity = Math.sign(delta) * Math.min(10, (Math.abs(delta) - 3) * 0.45);
        viewport.scrollLeft += velocity;
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
        window.dispatchEvent(new CustomEvent('mega-portrait-scroll', { detail: { progress } }));
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(frame);
      neutralGammaRef.current = null;
      tiltDeltaRef.current = 0;
    };
  }, [isPortraitTablet]);

  // Alineació de la filera de dalt de la pàgina 2 amb la de la pàgina 1, i
  // centratge del selector amb la graella de colors.
  //
  // Eren DOS efectes que es donaven suport: el d'alineació llegia
  // `selectorCentratgeY` i el de centratge el reescrivia, i tots dos es
  // tornaven a executar al cap de 180 ms. El resultat depenia de l'ordre i del
  // nombre d'iteracions.
  //
  // Aquí els dos càlculs viuen en el MATEIX efecte i s'apliquen en una sola
  // actualització, però es mantenen les dues fórmules originals tal qual (i
  // l'ordre: primer alineació, després centratge). Les refs serveixen per
  // arrencar del valor aplicat sense dependre de l'estat, que és el que feia
  // que l'efecte es realimentés.
  useLayoutEffect(() => {
    if (!active) return undefined;
    let frame = 0;
    let settleTimer = 0;
    let settleTimer2 = 0;

    const ajusta = () => {
      const page1Viewport = document.querySelector('[data-mega-page-viewport="1"]');
      const page1Selector = page1Viewport?.querySelector('button[aria-label="Color"]');
      const page2Selector = viewportRef.current?.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
      if (!page1Selector || !page2Selector) return;

      const alignAplicat = alignRefY.current;
      const centraAplicat = centraRefY.current;
      const p1Top = page1Selector.getBoundingClientRect().top;
      const p2Top = page2Selector.getBoundingClientRect().top;

      // 1) ALINEACIÓ (fórmula original): l'objectiu és el selector de la pàgina 1
      //    més l'offset; el centratge no hi compta perquè va a sobre.
      const offset = (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 10 : 0;
      const deltaAlign = (p1Top + offset) - (p2Top - centraAplicat);

      // 2) CENTRATGE (fórmula original): el centre del selector ha de coincidir
      //    amb el de la graella. Es treballa sobre la posició que tindrà DESPRÉS
      //    de l'alineació, que és el que fa el bucle original quan corre tot
      //    seguit de l'altre.
      const graella = document.querySelector('[data-p2-color-grid]');
      let deltaCentra = 0;
      if (graella) {
        const g = graella.getBoundingClientRect();
        const s = page2Selector.getBoundingClientRect();
        const centreGraella = g.top + g.height / 2;
        const centreSelector = (s.top + deltaAlign) + s.height / 2;
        deltaCentra = centreGraella - centreSelector;
      }

      if (Math.abs(deltaAlign) >= 0.5) {
        alignRefY.current = alignAplicat + deltaAlign;
        setTopVisualAlignmentY(alignRefY.current);
      }
      if (Math.abs(deltaCentra) >= 0.5) {
        centraRefY.current = centraAplicat + deltaCentra;
        setSelectorCentratgeY(centraRefY.current);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(ajusta);
    };

    ajusta();
    // Dues passades de repas: la segona torna a mesurar amb el DOM ja pintat.
    // Amb una de sola, si el fila es pinta despres del timer, el bucle es quedava
    // amb un residu d'1,8 px que canviava d'una execucio a l'altra.
    settleTimer = window.setTimeout(schedule, 180);
    settleTimer2 = window.setTimeout(schedule, 600);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(settleTimer2);
      window.removeEventListener('resize', schedule);
    };
  }, [active, bnSliderSize, isPortraitTablet, isLandscapeTablet, page1PageLift, esBandaEstreta]);

  // (El centratge del selector amb la graella de colors s'ha fusionat amb
  // l'efecte de dalt. Era un segon bucle que reescrivia el valor que el primer
  // llegia, i per això l'ordre i el nombre d'iteracions en canviaven el
  // resultat.)

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

  // Les mides de la taula de la vista vertical: el carril i les seves caselles.
  // La filera de dalt fa carril/5 d'alcada (les caselles son quadrades) i la
  // graella hi ha de cabre en 16 columnes i 4 files.
  const carrilTaula = typeof window !== 'undefined' && window.innerWidth > 0
    ? ampladaCarril(window.innerWidth)
    : 0;
  const gapDibuixos = 3;
  const midesTaula = (() => {
    if (!carrilTaula) return { dibuixPx: 32, gapDibuixos, alcadaFilaLlista: 30 };
    const alcadaCella = carrilTaula / 5;
    const perAmplada = (carrilTaula - 15 * gapDibuixos) / 16;
    const perAlcada = (alcadaCella - 3 * gapDibuixos) / 4;
    return {
      dibuixPx: Math.floor(Math.min(perAmplada, perAlcada) * 100) / 100,
      gapDibuixos,
      alcadaFilaLlista: Math.floor(((4 * Math.min(perAmplada, perAlcada)) / 9) * 100) / 100,
    };
  })();

  return (
    <div style={{ width: '25%', flexShrink: 0, display: isPortraitTablet ? 'block' : 'flex', height: '100%', position: 'relative', justifyContent: 'center', overflow: isPortraitTablet ? 'hidden' : 'visible' }}>
      <div
        ref={viewportRef}
        data-mega-page-viewport="2"
        style={{
          // A la VERTICAL, el contingut de la pagina 2 queda AMAGAT (l'espai
          // es conserva). A l'apaisada i a l'escriptori no es toca res.
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
          touchAction: isPortraitTablet ? 'pan-x pinch-zoom' : undefined,
        }}
      >
        <div style={{
          flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
        }} />

        <div
          style={{
          flex: '0 0 auto',
          width: isPortraitTablet ? '992px' : 'var(--hg-mega-w, 70.3vw)',
          maxWidth: 'none',
          position: 'relative',
          height: '100%',
          paddingLeft: '0px',
          paddingRight: '0px',
        }}>
        {/* Slider B/N/C vertical — cantó esquerre, alçada barra grisa */}
        {active ? (
          <div
            data-p2-color-selector
            style={{
            position: 'absolute',
            top: `calc(var(--hg-cercador-bar-top, 0px) + ${40 + ((typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 5 : 0)}px)`,
            // El selector arrenca on arrenca el logo del header: la franja
            // central es [left del logo, right de la icona d'usuari] i el seu
            // marge es el coixi de la fila del header (40 px de disseny, el
            // mateix `carrilPx(40)` que fa servir alla).
            // El coixí es el MATEIX 3% del carril que el del header
            // (`carrilLane(40)`): aixi el selector arrenca on arrenca el logo i
            // la fila 1 fa exactament l'amplada de la franja del header, tambe
            // a tauleta (alla `carrilPx(40)` son 40 i el 3% en son 29,4).
            left: carrilLane(40),
            width: carrilPx(bnSliderSize),
            height: carrilPx(bnSliderSize),
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ width: '100%', height: '100%', transform: `translateY(${topVisualAlignmentY + selectorCentratgeY}px)` }}>
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
          </div>
        ) : null}

        {/* CercadorTextRow */}
        <div style={{
          position: 'absolute',
          top: `calc(var(--hg-cercador-bar-top, 0px) + ${topVisualAlignmentY + (isLandscapeTablet ? 5 : ((typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 45 : 20))}px)`,
          left: '50%',
          transform: `translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))`,
          transformOrigin: 'top center',
          // El contenidor de la filera ES el carril: tot el que hi ha a dins
          // son proporcions seves (`carrilPct` i `carrilLane` a
          // CercadorTextRow), tambe a tauleta.
          width: '100%',
          zIndex: 3,
          containerType: 'inline-size',
        }}>
          <CercadorTextRow
            compact
            // La filera arrenca 10 px a la dreta del selector: els blocs de la
            // composicio son [selector] 10 [graella de dibuixos i colors] 10
            // [columna de colleccions].
            esquerra={bnSliderSize ? `calc(${carrilLane(40)} + ${carrilPx(bnSliderSize)} + 20px)` : undefined}
            desplacamentVertical={40 - topGraellaColors}
            isPortraitTablet={isPortraitTablet}
            isLandscapeTablet={isLandscapeTablet}
            activeCollection={active}
            activeSubcollection={austenSubcollection}
            selectedColor={cercadorSelectedColor}
            onSelectColor={setCercadorSelectedColor}
            onSelectCollection={(key) => {
              if (key.includes(':')) {
                const [collection, subcollection] = key.split(':');
                setActive(collection);
                setAustenSubcollection(subcollection);
              } else {
                setActive(key);
                setAustenSubcollection(null);
              }
            }}
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
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          left: (isPortraitTablet || isLandscapeTablet) ? '-3.5px' : undefined,
          // A tauleta, la franja va un 0,2% mes petita amb una escala uniforme
          // (ample i alt alhora), perque no es deformin els dibuixos. L'origen
          // es la cantonada esquerra: la reduccio entra per la dreta.
          transform: (isPortraitTablet || isLandscapeTablet) ? 'scale(0.998)' : undefined,
          transformOrigin: 'left top',
        }}>
          <MegaStripePanel
            active={active}
            reserveGridSpace
            stripeImageSrc={stripeBaseImageSrc}
            resolvedMega={resolvedMegaFiltered}
            showStripe={showStripe}
            stripeRowPadPx={stripeRowPadPx}
            stripeRowPadXPx={stripeRowPadXPx}
            stripePreviewHPx={compactStripePreviewHPx}
            // La franja ha de quedar a la mateixa alçada que la de la pàgina 1.
            // L'ajust de la pàgina 1 (FRANJA_AJUST_PX a MegaStripePanelP1) no
            // s'aplica a la franja estreta (768-1366), però aquí sí que cal per
            //quedar-hi alineats.
            visualOffsetY={-page1PageLift + (isLandscapeTablet ? -10 : 0) - ((isPortraitTablet || isLandscapeTablet) ? 0 : FRANJA_AJUST_PX) + desplacamentFranja}
            fitAlcada={fitAlcada}
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
            megaTileSize={compactMegaTileSize}
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
          flex: isPortraitTablet ? '0 0 0px' : '1 1 auto',
        }} />
      </div>

      {/* A la VERTICAL, el contingut de debò de la pagina 2 esta amagat i el
          que s'hi veu es la TAULA dibuixada (5 columnes x 3 files), a
          l'amplada del carril. Es una capa absoluta: no mou res del layout. */}
      {isPortraitTablet ? (
        <CapaTaulaVertical pagina={2}>
          <TaulaVerticalP2
            /* Les peces de debò, una per casella. */
            graella={(
              <CercadorDibuixosGraella
                items={dibuixosGraella16x4()}
                dibuixPx={null}
                gapH={0}
                gapV={0}
                numColumns={16}
                activeCollection={active}
                isPortraitTablet={isPortraitTablet}
              />
            )}
            colleccions={(
              <CercadorColleccionsColumna
                activeKey={active}
                onSelect={setActive}
                alcadaFilaLlista={midesTaula.alcadaFilaLlista}
                caixes
              />
            )}
            colors={(
              <CercadorColorsGrid
                selectedColor={cercadorSelectedColor}
                onSelectColor={setCercadorSelectedColor}
                cerclePx={colorMida(true, false)}
                colorGapPx={colorGap(true, false)}
                isPortraitTablet={isPortraitTablet}
              />
            )}
            stripe={(
              <img
                src="/placeholders/tablet vertical/stripe-curta-7+7.png"
                alt=""
                style={{ width: 'calc(100% + 24px)', height: 'auto', display: 'block', flexShrink: 0, maxWidth: 'none', marginLeft: '-4px' }}
              />
            )}
            selector={(
              <FirstContactDibuix00Buttons
                onWhite={() => {
                  setFirstContactVariant?.('white');
                  setHumanInsideVariant?.('white');
                }}
                onBlack={() => {
                  setFirstContactVariant?.('black');
                  setHumanInsideVariant?.('black');
                }}
                onMulti={() => {
                  setFirstContactVariant?.('color');
                  setHumanInsideVariant?.('color');
                }}
                showWhite={stripeVariantVisibility?.white !== false}
                showBlack={stripeVariantVisibility?.black !== false}
                showMulti={stripeVariantVisibility?.color !== false}
                selectedVariant={active === 'the_human_inside' ? humanInsideVariant : firstContactVariant}
              />
            )}
          />
        </CapaTaulaVertical>
      ) : null}

    </div>
  );
}
