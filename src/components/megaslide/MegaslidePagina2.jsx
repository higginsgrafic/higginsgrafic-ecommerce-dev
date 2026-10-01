import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import CercadorTextRow from '../fullwide/CercadorTextRow.jsx';
import MegaStripePanel from '../fullwide/MegaStripePanel.jsx';
import {
  centratgeSelectorY,
  desplacTopSelector,
  visualOffsetYFranjaPagina2,
  desplacamentCentratgeFranja,
  casaIniciGrupActiu,
  buscaGrupActiuFranja,
  desplacamentGrupActiuFranja,
  AIRE_FRANJA_COLLECCIONS_PX,
  esComposicioEstretaMegaslide,
  pagina1BlocDretaPx,
} from './geometriaMegaslide.js';
import { COIX_ENLLAC_COLLECCIONS_PX } from '../fullwide/estilsBlocs.js';
import { carrilPx, readRootCssNumber, MEGASLIDE_REFERENCIA_PX } from '../../utils/layoutMetrics.js';
import { SelectorQuadratPagina1, PastillaBlancaPagina1 } from '../fullwide/BlocDretaPagina1.jsx';
import { CapaTaulaVertical, TaulaVerticalP2 } from './TaulaVertical.jsx';
import {
  CercadorColleccionsColumna,
  CercadorColorsGrid,
  CercadorDibuixosGraella,
  dibuixosGraella16x4,
} from '../fullwide/CercadorTextRow.jsx';
import { colorGap, midaDibuix, gapVertical, gapHorizontal, GRAELLA_COLUMNES } from '../fullwide/midesGraella.js';
import { ampladaCarril } from './TaulaVertical.jsx';
import MegaHeroSlider from '../MegaHeroSlider.jsx';
import Pauta4ColsOverlay from '../pauta/Pauta4ColsOverlay';
import useMegaslideCalibration from '@/hooks/useMegaslideCalibration';
import {
  CONTROL_TILE_BN,
  CONTROL_TILE_ARROWS,
} from '../fullwide/MegaColumn.jsx';
import { FirstContactDibuix00Buttons } from '../fullwide/firstContactPanels.jsx';

/**
 * L'AIRE DE DALT DEL BLOC DE LA P2 A LA COMPOSICIO ESTRETA (02/10/2026).
 *
 * En Marc: «Alinea el bloc p2 a 20 px del bottom del header» i, tot seguit,
 * «En lloc de 20 px que siguin 15 px. Per sobre i per sota». El panell arrenca al
 * bottom del header, o sigui que son 15 px des del sostre del megaslide.
 *
 * PER SOBRE I PER SOTA: els 15 px son el minim de dalt; a sota en queda el que
 * sobra del megaslide, que sempre es mes (el bloc te una alcada fixa: selector,
 * els dos aires de 5 px de la franja de colleccions i la franja de samarretes).
 */
const AIRE_DALT_BLOC_P2_PX = 15;
import { VEL_SAMARRETA_BUIDA_ALFA } from '../../config/stripeCalibrationsVertical.js';
import { computeStripeTileOverlaySrcs, srcDibuixVelatEnNegre } from '@/utils/resolveStripeTile.js';

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
  resolvedMegaFiltered,
  resolvedMega,
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
  // LA COMPOSICIO ESTRETA (1024-1366, 02/10/2026): alla els enllacos de
  // colleccions son una franja sota la tira de colors i el bloc sencer es mou
  // perque els seus dos aires facin 5 px (vegeu el bucle d'alineacio).
  const esComposicioEstreta = esComposicioEstretaMegaslide({
    ample: typeof window !== 'undefined' ? window.innerWidth : 0,
    isLandscapeTablet,
  });
  // LA PAGINA 2 DE 1024, AL SEGON CARRIL (02/10/2026). En Marc: «Ara hem de fer
  // la p2 de la 1024» i «La stripe ha de ser de la mida del segon carril, com la
  // p1»: alla el contenidor de la pagina fa el carril de la pagina
  // (`min(939.2px, 100vw - 80px)`: el del header, la hero, el bloc de la p1 i les
  // segones guies) en lloc del carril del megaslide (605), i tot el que hi ha a
  // dins (el selector, la graella, la tira de colors, els enllacos i la franja de
  // samarretes) en surt. El contenidor va centrat a la FINESTRA, com la resta
  // d'aquella composicio: la filera es centra sobre l'amplada de maquetacio del
  // cos, que reserva la barra, i aixo son uns px de desplacament.
  const esCarrilPagina1024 = typeof window !== 'undefined'
    && window.innerWidth >= 1000 && window.innerWidth <= 1050
    && window.innerWidth >= window.innerHeight;
  // LA FRANJA DE COLLECCIONS NOME'S QUEDA A 1280-1366 (02/10/2026): a 1024 els
  // enllacos son la columna de la dreta (vegeu `CercadorTextRow`), o sigui que
  // tot el que a la composicio estreta es feia «al voltant de la franja» (el seu
  // baix, el bloc centrat amb ella) ha de seguir el cami de sempre.
  const esComposicioFranja = esComposicioEstreta && !esCarrilPagina1024;
  const ampleCarrilPaginaP2 = esCarrilPagina1024 ? Math.min(939.2, window.innerWidth - 80) : 0;
  // EL SELECTOR B/C/N DE 1024 ES EL DE LA P1 (02/10/2026). En Marc: «Fes el
  // selector b/c/n del mateix estil que el de la p1»: mateixa peca (el quadrat
  // amb el fons `paper-soft`, el radi, l'ombra i la pastilla blanca) i mateixa
  // mida, que a 1024 es `pagina1BlocDretaPx(1) * 0,75` (96,5), com el bloc de la
  // dreta de la pagina 1.
  const costatSelectorP1 = pagina1BlocDretaPx(1) * 0.75;
  const midaSelectorP2 = esCarrilPagina1024 ? costatSelectorP1 : bnSliderSize;
  // La pastilla, a la casella del variant triat: el mateix ordre que la p1.
  const ORDRE_BCN = ['white', 'color', 'black'];
  const variantBcn = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
  const topPastillaBcnPct = (ORDRE_BCN.indexOf(ORDRE_BCN.includes(variantBcn) ? variantBcn : 'color') * 100) / 3;
  const desplacCarrilPaginaP2 = esCarrilPagina1024
    ? (window.innerWidth - (document.body?.clientWidth || window.innerWidth)) / 2
    : 0;
  const topGraellaColors = 40 - (esBandaEstreta ? 38 : 0);
  const [topVisualAlignmentY, setTopVisualAlignmentY] = useState(0);
  // L'OMBRA DE LA MANIGA (26/09/2026, A3; refeta el 27/09/2026).
  //
  // Que la maniga (la màniga de l'última samarreta de la franja) passa per
  // sobre de la columna de col·leccions s'ha de VEURE: hi ha de fer una ombra
  // petita i suau.
  //
  // La primera versió era una banda recta de 5 px, pero vivia dins d'un
  // contenidor amb `zIndex: 1`, PER SOTA de la columna (que es a `zIndex: 3`):
  // no es veia mai. I amb la silueta de les samarretes (desplaçada i difosa)
  // tambe s'hi va provar: com que la silueta del full arriba unes quantes
  // unitats mes enlla de la tinta, el que es veia era la SILUETA (una taca
  // grisa), no una ombra.
  //
  // El que hi ha ara: una banda de 6 px que NASC a la costura (la vora dreta
  // del contingut de la franja) i s'obre cap a la dreta sobre la columna, amb
  // un degradat suau. Va DINS de la capa de la franja (`zIndex: 4`) i ABANS del
  // panell, amb `zIndex: -1`: es pinta abans de tot el contingut del panell
  // (que es posicionat) i, per tant, la samarreta la tapa on li toca.
  const [ombraManiga, setOmbraManiga] = useState(null);
  // Desplaçament propi del selector Blanc/Color/Negre perquè quedi centrat amb
  // la graella de colors. Va a part de topVisualAlignmentY (que alinea el
  // selector amb el de la pàgina 1): així els dos ajustos no es trepitgen.
  const [selectorCentratgeY, setSelectorCentratgeY] = useState(0);
  // LA MIDA MESURADA DE LA GRAELLA DE DIBUIXOS (25/09/2026).
  //
  // El centratge del selector depèn de l'alçada de la filera, i l'alçada de la
  // filera és la de la graella. La graella la mesura `CercadorTextRow` (que és
  // qui té la columna) i ens ho diu: així el bucle de sota torna a mesurar dins
  // el mateix commit, quan la mida ja és al DOM. Sense això, la passada que veia
  // la mida vella centrava el selector 11,16 px més avall del compte i el salt
  // arribava amb el panell ja obrint-se (mesurat a 1920: 47,8 -> 36,63).
  const [mesuraGraellaP2, setMesuraGraellaP2] = useState(null);
  // Els mateixos valors en refs: l'efecte de calibratge els necessita per
  // arrencar del que ja hi ha aplicat sense dependre de l'estat (que el faria
  // realimentar-se).
  const alignRefY = useRef(0);
  const centraRefY = useRef(0);
  const snapTimerRef = useRef(0);
  // EL BAIX DE LA FRANJA DE LA P2, QUADRAT AMB EL DE LA P1 (02/10/2026).
  //
  // A la banda de les tauletes apaissades la franja de la p2 es mes curta que la
  // de la p1 (cada pagina escala la seva fins a la vora del seu bloc de la
  // dreta) i, com que el `visualOffsetY` quadra els tops, el seu baix queia
  // 41-79 px per sobre: l'amo ho va veure i ho va demanar («baixa la stripe fins
  // al limit del megaslide», concretat com «a 30 px del final, com la p1»).
  //
  // L'alcada de la franja de la p2 es MESURA (surt de l'amplada del seu carril
  // objectiu), o sigui que l'ajust no es pot declarar: es la diferencia entre
  // els dos baixos, i la resol el bucle de sota, que es qui te les dues franges
  // al DOM. El valor viatja amb el `visualOffsetY` de la franja I amb el sostre
  // de la franja (`topFranjaPagina2`), que es el que fa que la columna de
  // colleccions hi acabi.
  const ajustFranjaRefY = useRef(0);
  const [ajustFranjaP2Y, setAjustFranjaP2Y] = useState(0);

  // L'AMPLE DE LA CAIXA DEL SELECTOR B/C/N, CLAVAT AMB LA PASTILLA DE LA FRANJA
  // (02/10/2026). En Marc: «la pill del selector b/c/n s'ha d'eixamplar
  // simetricament fins que coincideixi, en x, al final de la pastilla de la tira
  // de colleccions en la posicio First Contact».
  //
  // La referencia es la PRIMERA casa de la franja (FIRST CONTACT, que es la que
  // cau a la vora esquerra del carril) i el seu ample depen de la font i del
  // carril, o sigui que es MESURA del DOM. D'aqui surt l'amplada de la CAIXA del
  // selector:
  //
  //   caixa = ample de la primera casa + COIX_ENLLAC_COLLECCIONS_PX
  //   pastilla = caixa - 2 x COIX_ENLLAC_COLLECCIONS_PX   (els coixos es
  //                                                        conserven, simetrics)
  //
  // i el final de la pastilla cau exactament al final de la de la franja. Fora
  // d'aquesta composicio (escriptori, on els enllacos son una columna) no hi ha
  // franja i el valor es queda nul: mana l'amplada de disseny de sempre.
  const [ampleCaixaBcnPx, setAmpleCaixaBcnPx] = useState(null);
  useLayoutEffect(() => {
    if (!active) return undefined;
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    let frame = 0;
    const mesura = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const primera = viewport.querySelector('[data-colleccions-franja-item="1"]');
        if (!primera) {
          setAmpleCaixaBcnPx((prev) => (prev === null ? prev : null));
          return;
        }
        const ample = primera.getBoundingClientRect().width;
        if (!(ample > 0)) return;
        const caixa = Math.round((ample + COIX_ENLLAC_COLLECCIONS_PX) * 10) / 10;
        setAmpleCaixaBcnPx((prev) => (prev != null && Math.abs(prev - caixa) < 0.5 ? prev : caixa));
      });
    };
    mesura();
    const t = window.setTimeout(mesura, 400);
    window.addEventListener('resize', mesura);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesura) : null;
    const primera = viewport.querySelector('[data-colleccions-franja-item="1"]');
    if (primera) observer?.observe(primera);
    const franja = viewport.querySelector('[data-colleccions-franja="1"]');
    if (franja) observer?.observe(franja);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
      window.removeEventListener('resize', mesura);
      observer?.disconnect();
    };
  }, [active, esComposicioEstreta]);


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
      // LES DUES TIRES DE SAMARRETES, PEL TOP (28/09/2026).
      //
      // En Marc: «quan tinguis la p2, alinea la p1», i ho va concretar com «les
      // dues coses»: que la p1 tambe tingui 30 px d'aire a dalt i que les dues
      // franges quedin exactament a la mateixa alcada. Les dues tires de
      // samarretes (la graella de la p1 i el retall de la p2) han d'arrencar a
      // la mateixa alcada.
      //
      // Fins ara el que s'alineava era el boto Color de les dues, i per aixo la
      // graella de la p1 queia 8,5 px mes amunt: fa 110 px d'alcada i la de la
      // p2 95,2, i amb els botons Color al mateix lloc els tops no hi poden ser.
      //
      // Nomes s'aplica quan les dues graelles hi son i no es la vista vertical
      // (alla mana el boto Color, com sempre).
      const page1Graella = page1Viewport?.querySelector('[data-carrusel="1"]');
      const page2Graella = viewportRef.current?.querySelector('[data-carrusel="1"]');
      const perGraelles = !!page1Graella && !!page2Graella && !isPortraitTablet;
      if (!perGraelles && (!page1Selector || !page2Selector)) return;

      const alignAplicat = alignRefY.current;
      const centraAplicat = centraRefY.current;
      const p1Top = perGraelles
        ? page1Graella.getBoundingClientRect().top
        : page1Selector.getBoundingClientRect().top;
      const p2Top = perGraelles
        ? page2Graella.getBoundingClientRect().top
        : page2Selector.getBoundingClientRect().top;

      // 1) ALINEACIÓ (fórmula original): l'objectiu és el selector de la pàgina 1
      //    més l'offset; el centratge no hi compta perquè va a sobre.
      //    Amb les graelles l'objectiu es la graella de la p1 i no hi ha offset:
      //    les dues tires han d'arrencar al mateix lloc.
      //
      //    A LA COMPOSICIO ESTRETA (1024-1366) L'OBJECTIU ES ABSOLUT
      //    (02/10/2026). Alla els enllacos de colleccions son una franja sota la
      //    tira de colors, amb 5 px per sobre (el cul del selector B/C/N), i
      //    l'amo hi vol el bloc CENTRAT: el mateix aire per sobre del selector
      //    que per sota de la franja de colleccions. Com que el bloc no ho pot
      //    resoldre tot sol (a 1024x768 l'espai entre el selector i la tinta de
      //    les samarretes en fa 49,1 i a 1366x768 nome s 29,2, per a un selector
      //    de 112,8 i una franja de 28,6), el que es mou es TOT EL BLOC: la
      //    graella, la tira de colors, el selector i la franja. Ho va triar
      //    l'amo tot i que la graella de la p2 deixa d'arrencar a la mateixa
      //    alcada que la de la p1.
      //
      //    L'objectiu es ABSOLUT (es mesura respecte la tinta de la franja de
      //    samarretes i el sostre del megaslide, que no es mouen) i per tant el
      //    bucle no s'alimenta d'ell mateix: l'unica distancia que hi entra de
      //    dins del bloc (`topBcn - topGraella`) no canvia quan el bloc es mou.
      const offset = (!perGraelles && typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 10 : 0;
      let objectiuTop = null;
      //    I A 1024 SENSE FRANJA (02/10/2026): alla els enllacos son la columna
      //    de la dreta i el bloc son nome's el selector, la graella i la tira de
      //    colors. El sostre es el MATEIX (la franja de colleccions no hi compta,
      //    `alcadaFranja` = 0), que es el que deixa els 15 px d'aire a dalt del
      //    megaslide que ha demanat l'amo.
      if (perGraelles && (esComposicioFranja || esCarrilPagina1024)) {
        const rGraella = page2Graella.getBoundingClientRect();
        // El selector pot ser el de la p2 (`bn`, el rectangle) o el de la p1
        // (`bn-p1`, el quadrat, que es el que es munta a 1024).
        const bcnBox = viewportRef.current.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"], [data-p2-color-selector] [data-stripe-buttonbar="bn-p1"]');
        const bandaEl = viewportRef.current.querySelector('[data-colleccions-franja="1"]');
        const franjaEl = viewportRef.current.querySelector('[data-stripe-visual-content="2"]');
        const panelEl = document.querySelector('[data-mega-panel-surface]');
        if (bcnBox && franjaEl && panelEl && (bandaEl || esCarrilPagina1024)) {
          const rBcn = bcnBox.getBoundingClientRect();
          const alcadaFranja = bandaEl ? bandaEl.getBoundingClientRect().height : 0;
          const rFranja = franjaEl.getBoundingClientRect();
          const panelTop = panelEl.getBoundingClientRect().top;
          const panelAlt = panelEl.getBoundingClientRect().height;
          const topBcn = rBcn.top - rGraella.top;   // el sostre del selector, dins del bloc
          // EL BLOC, CENTRAT (02/10/2026, «centra el bloc p2 al megaslide, en y»).
          //
          // El BLOC es tota la composicio de la p2: el selector B/C/N, la graella
          // de dibuixos, la tira de colors, la franja de colleccions I la franja
          // de samarretes. Amb els dos aires de 5 px (el de dins i el de sota la
          // franja de colleccions), la seva alcada es:
          //
          //   selector + 5 + franja de colleccions + 5 + franja de samarretes
          //
          // i el que queda del megaslide es reparteix a parts iguals a dalt i a
          // baix. A 1366x768 en queden 28,9 (14,5 i 14,5) i a 1024x768 45,1 (22,5
          // i 22,5). Aixo es el que fa que el selector deixi de topar amb el
          // sostre i que els dos aires de 5 px hi càpiguen sempre.
          //
          // La franja de samarretes tambe es mou (es part del bloc): ho fa el
          // bucle de sota, que la deixa a 5 px del baix de la franja de
          // colleccions. I alla on mana el bloc ja no mana l'alineacio amb la p1.
          // A 20 px DEL BOTTOM DEL HEADER (02/10/2026). En Marc: «Alinea el bloc p2
          // a 20 px del bottom del header». El panell arrenca exactament al bottom
          // del header (mesurat a 1366x768: el header fa 53 i el panell comença
          // alla mateix), o sigui que l'aire de dalt son aquests 20 px i el que
          // sobra del megaslide queda a sota. Amb el bloc mes alt que l'espai, el
          // `max(0, ...)` no hi cap i el bucle de sota ja el deixa arran.
          const aire = Math.max(0, Math.min(
            AIRE_DALT_BLOC_P2_PX,
            panelAlt - rBcn.height - alcadaFranja - rFranja.height - 2 * AIRE_FRANJA_COLLECCIONS_PX,
          ));
          objectiuTop = panelTop + aire - topBcn;
        }
      }
      //    (Amb el selector, el centratge del selector tambe mou el seu top i
      //    s'ha de descomptar; amb la graella, no.)
      const deltaAlign = (objectiuTop != null ? objectiuTop : p1Top + offset) - (p2Top - (perGraelles ? 0 : centraAplicat));

      // 2) CENTRATGE (DECLARAT, 26/09/2026): el centre del selector ha de
      //    coincidir amb el de la filera que flanquegen el selector i les
      //    fletxes: la graella de dibuixos mes la fila de colors.
      //
      //    JA NO ES MESURA. Els dos costats surten de les mateixes mides
      //    declarades (`centratgeSelectorY`: l'alcada del carrusel mes la fila
      //    de colors, menys l'alcada del selector), i la formula NO depen de
      //    l'alineacio amb la pagina 1 perque les dues peces es mouen juntes.
      //    El bucle nome's l'aplica, i el repas de 180/340 ms el refresca si la
      //    finestra ha canviat.
      //
      //    AQUESTA ÉS LA REFERÈNCIA DEL SELECTOR, i no es mou (24/09/2026, ho va
      //    demanar l'amo: «mou la fila, no el selector»). El que s'hi alinea és
      //    la SEGONA LÍNIA de la graella de dibuixos, i ho fa la filera
      //    (`CercadorTextRow`), que es qui sap on cau cada línia.
      // El desplac,ament NET de disseny (vegeu `desplacTopSelector`): el `top`
      // extra del contenidor de la filera, mes el `top` de la filera dins seu
      // (`topGraellaColors`), menys el `top` del contenidor del selector i el
      // `mt-2` de la pastilla (`firstContactPanels`).
      const desplacTopEf = desplacTopSelector({
        ample: typeof window !== 'undefined' ? window.innerWidth : 0,
        alt: typeof window !== 'undefined' ? window.innerHeight : 0,
        isLandscapeTablet,
      });

      // A 1024, EL BLOC AL TOP DEL SELECTOR (02/10/2026). En Marc: «Alinea el
      // bloc graella+tira de colors, al top del selector»: alla no hi ha
      // centratge (el selector i la filera comparteixen el `top`, o sigui que
      // arrenquen al mateix lloc) i el que mana es el top del selector, que es
      // qui deixa els 15 px d'aire amb el sostre del megaslide.
      const scyDeclarat = esCarrilPagina1024 ? 0 : centratgeSelectorY({
        midaSelector: midaSelectorP2,
        escala: readRootCssNumber('--hg-escala-mega', 1),
        dibuix: mesuraGraellaP2?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet),
        gapV: mesuraGraellaP2?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet),
        // EL CARRIL, EL DE LA PAGINA A 1024 (02/10/2026): alla el contenidor de
        // la pagina 2 fa el carril de la pagina (vegeu `esCarrilPagina1024`) i la
        // fila de colors hi va amb ell. El que es llegeix de l'arrel
        // (`document.documentElement`) encara es el carril del MEGASLIDE, que
        // alla es mes estret: el selector quedava centrat amb un bloc de tres
        // files que no era el que es pinta.
        carril: esCarrilPagina1024 ? ampleCarrilPaginaP2 : readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX),
        desplacTop: desplacTopEf,
      });

      if (Math.abs(deltaAlign) >= 0.5) {
        alignRefY.current = alignAplicat + deltaAlign;
        setTopVisualAlignmentY(alignRefY.current);
      }
      if (Math.abs(scyDeclarat - centraAplicat) >= 0.5) {
        centraRefY.current = scyDeclarat;
        setSelectorCentratgeY(scyDeclarat);
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
    //
    // La segona cau a 340 ms i no mes tard: es quan acaba l'animacio d'obertura
    // del panell (`mega-panel-desplega`). El repas antic a 600 ms corregia
    // DESPRES que el panell sembles fet, i l'amo ho veia com que el contingut
    // es continuava reajustant (25/09/2026).
    settleTimer = window.setTimeout(schedule, 180);
    settleTimer2 = window.setTimeout(schedule, 340);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(settleTimer2);
      window.removeEventListener('resize', schedule);
    };
    // `mesuraGraellaP2` és una dependència de debò: quan la graella canvia de
    // mida, l'alçada de la filera canvia amb ella i el centratge del selector
    // s'ha de tornar a calcular. Com que l'avís arriba des d'un efecte de
    // layout del fill (abans que aquest), la passada nova ja mesura el DOM amb
    // la mida bona: el selector neix centrat i no s'ha de corregir després.
  }, [active, bnSliderSize, isPortraitTablet, isLandscapeTablet, page1PageLift, esBandaEstreta, esComposicioEstreta, esComposicioFranja, esCarrilPagina1024, ampleCarrilPaginaP2, topGraellaColors, mesuraGraellaP2]);

  // (El centratge del selector amb la graella de colors s'ha fusionat amb
  // l'efecte de dalt. Era un segon bucle que reescrivia el valor que el primer
  // llegia, i per això l'ordre i el nombre d'iteracions en canviaven el
  // resultat.)

  // EL BAIX DE LA FRANJA DE LA P2, AL DE LA P1 (02/10/2026).
  //
  // Nomes a la banda de les tauletes apaissades, que es on les dues franges fan
  // alcades diferents: alla el `visualOffsetY` quadra els tops i els baixos
  // queden desquadrats (mesurat: l'aire de sota la franja de la p2 era 41,4 px
  // mes gran que el de la p1 a 1366x768, 51,1 a 1280x720 i 78,6 a 1024x768).
  // L'objectiu es el baix de la franja de la p1, que es qui dona l'alcada al
  // panell (i que sempre queda a 30 px del seu final).
  //
  // Es un bucle d'acumulacio, com el de l'alineacio de la graella: s'arrenca del
  // valor JA aplicat (la ref, no l'estat) i nome's s'hi suma la diferencia, amb
  // un llindar de 0,5 px perque no es posi a mesurar a cada passada. Les
  // repassades de 180 i 340 ms hi son perque l'alcada de la franja triga uns
  // quants fotogrames a assentar-se (la seva escala es mesura), i el
  // ResizeObserver les cobreix si canvia mes tard.
  useLayoutEffect(() => {
    if (!active) return undefined;
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    let frame = 0;
    let t1 = 0;
    let t2 = 0;

    const ajusta = () => {
      const f1 = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
      const f2 = viewport.querySelector('[data-stripe-visual-content="2"]');
      // Fora de la banda, el valor ha de tornar a zero: si s'hi entra i se'n
      // surt (una finestra que s'engrandeix), el desplaçament no s'ha de quedar.
      if (!isLandscapeTablet || !f1 || !f2) {
        if (ajustFranjaRefY.current !== 0) {
          ajustFranjaRefY.current = 0;
          setAjustFranjaP2Y(0);
        }
        return;
      }
      // A LA COMPOSICIO ESTRETA (1024-1366) LA FRANJA ES PART DEL BLOC CENTRAT
      // (02/10/2026): el seu objectiu no es la franja de la p1 sino quedar a 5 px
      // del baix de la franja de colleccions, que es qui la governa (el bloc el
      // col·loca el bucle d'alineacio i la franja de colleccions hi va 5 px per
      // sota del selector). Es una mesura ABSOLUTA, o sigui que el bucle no
      // s'alimenta d'ell mateix.
      let delta;
      if (esComposicioFranja) {
        const bandaEl = viewport.querySelector('[data-colleccions-franja="1"]');
        if (!bandaEl) return;
        const objectiu = bandaEl.getBoundingClientRect().bottom + AIRE_FRANJA_COLLECCIONS_PX;
        delta = objectiu - f2.getBoundingClientRect().top;
      } else {
        delta = f1.getBoundingClientRect().bottom - f2.getBoundingClientRect().bottom;
      }
      if (Math.abs(delta) < 0.5) return;
      ajustFranjaRefY.current += delta;
      setAjustFranjaP2Y(ajustFranjaRefY.current);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(ajusta);
    };

    ajusta();
    t1 = window.setTimeout(schedule, 180);
    t2 = window.setTimeout(schedule, 340);
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    const f1 = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
    const f2 = viewport.querySelector('[data-stripe-visual-content="2"]');
    if (f1) observer?.observe(f1);
    if (f2) observer?.observe(f2);
    // EL PANELL TAMBE ES MIRA (02/10/2026). La franja de samarretes no te
    // posicio propia: cau de la reserva del panell, i l'alcada del panell surt
    // d'una mesura de la pagina 1 que arriba uns centenars de mil·lisegons
    // despres. Mentre no s'ha assentat, l'objectiu d'aquest bucle es mou (i el
    // desplaçament es quedava 52 px curt a 1366x768). Amb el panell observat, la
    // correccio es torna a fer quan l'alcada canvia.
    const panell = document.querySelector('[data-mega-panel-surface]');
    if (panell) observer?.observe(panell);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [active, isLandscapeTablet, esComposicioEstreta, esComposicioFranja, topVisualAlignmentY, mesuraGraellaP2]);

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

  // LA TIRA DE LA FRANJA, DE TOTES LES COLLECCIONS SEGUIDES (24/09/2026, ho va
  // demanar l'amo): les caselles que abans quedaven buides (les samarretes
  // atenuades) porten els dibuixos de la colleccio seguent, en l'ordre de la
  // graella (`dibuixosGraella16x4`, que es qui la fa).
  //
  // ES CONSTRUEIX COLLECCIO A COLLECCIO, i aixo es el que fa que funcioni:
  // `computeStripeTileOverlaySrcs` resol cada dibuix amb el context de la seva
  // colleccio (`active`), i amb una llista barrejada retornava `null` a tot el
  // que no fos l'activa (mesurat: 7 dibuixos dels 14 que tocaven).
  //
  // DES DEL 25/09/2026 LA TIRA ES SENZERA (64 dibuixos, no 14). La franja te 14
  // CASES fixes —les catorze samarretes, que no es mouen— i per sobre seu hi
  // circula aquesta llista: una fletxa, la rodeta o l'arrossegament la fan
  // avançar d'un dibuix, i cada casa ensenya el dibuix que li toca. Es pot fer
  // perque el pas entre cases (6,8701 % de l'amplada, mesurat: 6,8691 / 6,8705 /
  // 6,8706) es constant, o sigui que el dibuix de la casa seguent cau
  // exactament on cau el dibuix d'aquesta.
  const tiraFranja = useMemo(() => {
    const items = [];
    const srcs = [];
    const collections = [];
    // La SUBCAPçALERA tambe acompanya cada dibuix: a AUSTEN el clic d'una
    // samarreta ha de deixar activa la seva (PEMBERLEY, QUOTES, CROSSWORDS...),
    // i nome's amb la colleccio no n'hi ha prou.
    const subcollections = [];
    const afegeix = (llista, ctxActive, ctxVariant, ctxCollection, ctxSubcollection, velada = false) => {
      if (!llista.length) return;
      // EL DIBUIX DE LES VELADES, EN NEGRE (28/09/2026): en Marc ho va demanar
      // («a partir d'ara hauran de tenir el dibuix en negre») i, tot seguit,
      // «les que només són en color no les toquis!». La decisio viu a
      // `srcDibuixVelatEnNegre`, que nome's canvia el dibuix si te versio negra
      // de debò.
      const s = velada
        ? llista.map((it) => srcDibuixVelatEnNegre({
          item: it,
          collection: ctxActive,
          variant: ctxVariant,
          displayedShirtColor,
          resolvedOverlaySrc,
        }))
        : computeStripeTileOverlaySrcs({
          drawable: llista,
          variant: ctxVariant,
          active: ctxActive,
          displayedShirtColor,
          resolvedOverlaySrc,
          // LA TIRA ES DE TOTES LES COLLECCIONS, NO D'UNA FRANJA DE CATORZE
          // (25/09/2026): sense aixo, la llista de la colleccio activa es retallava
          // a catorze dibuixos i la resta no arribava MAI a la franja. AUSTEN en
          // te 27, i per aixo cap dels de LOOKING FOR MY DARCY no hi era, ni els
          // solids ni els marcs. Ho va veure l'amo.
          limit: llista.length,
        });
      if (!s) return;
      for (let i = 0; i < llista.length; i++) {
        // Els dibuixos que la seva colleccio no sap resoldre es queden fora de
        // la tira: amb una casella buida al mig, el bucle tindria un forat.
        if (!s[i]) continue;
        items.push(llista[i]);
        srcs.push(s[i]);
        collections.push(ctxCollection);
        subcollections.push(ctxSubcollection || null);
      }
    };
    // LA TIRA ES SEMPRE LA MATEIXA: 64 FITXES EN L'ORDRE CANONIC (29/09/2026).
    //
    // Ho va dictar l'amo, amb el comptatge exacte:
    //
    //   FIRST CONTACT 7 · THE HUMAN INSIDE 15 · AUSTEN 27 · CUBE 10 · MISCEL·LANIA 5
    //
    // i, dins d'AUSTEN, les subcolleccions en aquest ordre:
    //
    //   PEMBERLEY 1 · KEEP CALM 1 · QUOTES 5 · CROSSWORDS 12 · LFMD 8
    //
    // (7 + 15 + 27 + 10 + 5 = 64.) Son AQUESTES i per AQUEST ordre, tant si una
    // colleccio es l'activa com si no.
    //
    // PER QUE CALIA: la tira es construia amb la COLLECCIO ACTIVA AL PRINCIPI i
    // les altres amb UNA SOLA fitxa, o sigui que (a) la triada sortia sempre entre
    // MISCEL·LANIA i FIRST CONTACT -la casa 0 d'una tira circular-, (b) totes les
    // altres es desplaçaven, i (c) les subcolleccions d'Austen ni hi eren.
    // L'amo ho va veure: «les colleccions es mouen de lloc cada cop que les
    // selecciones» i «continuen desapareixent les subcolleccions d'Austen».
    //
    // CADA ENTRADA: [item, colleccio, subcolleccio, mitja]. `mitja` es el nom o el
    // cami amb que `resolveForItem` sap resoldre el dibuix d'aquella colleccio:
    // first_contact, the_human_inside i cube resolen per NOM; miscellania i les
    // subcolleccions d'austen, per CAMI.
    const G = '/custom_logos/drawings/images_grid';
    const NOMS_CUBE = ['Afrodita C', 'Cube 3 P0', 'Cyber Cube', 'Cylon Cube', 'Darth Cube',
      'Iron Kong', 'Iron Cube 68', 'MaschinenCube', 'Mazinger C', 'RoboCube'];
    const TIRA_ITEMS = [
      // FIRST CONTACT (7)
      ...['NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'The Phoenix', "Vulcan's End", 'Plasma Escape']
        .map((n) => [n, 'first_contact', null, n]),
      // THE HUMAN INSIDE (15)
      // Els noms han de ser EXACTAMENT els que el resolutor te al seu mapa
      // (`mapBlack` de `resolveForItem`): alla son sense apostrofs.
      ...['Afrodita-A', 'C3-P0', 'Cyberman', 'Cylon 03', 'Cylon 78', 'Iron Man 08', 'Iron Man 68',
        'Maschinenmensch', 'Mazinger-Z', 'R2-D2', 'Robbie The Robot', 'Robocop', 'Terminator',
        'The Dalek', 'Vader'].map((n) => [n, 'the_human_inside', null, n]),
      // AUSTEN · PEMBERLEY (1) i KEEP CALM (1)
      ['pemberley-house', 'austen', 'pemberley', `${G}/austen/pemberley_house/pemberley-house-b-grid.webp`],
      ['keep-calm', 'austen', 'keep_calm', `${G}/austen/keep_calm/keep-calm-b-grid.webp`],
      // AUSTEN · QUOTES (5)
      ...['i-admire-and-love-you', 'you-have-bewitched-me', 'half-agony-half-hope', 'unsociable-and-taciturn', 'it-is-a-truth']
        .map((n) => [n, 'austen', 'quotes', `${G}/austen/quotes/${n}-b-grid.webp`]),
      // AUSTEN · CROSSWORDS (12)
      ...[1, 2, 3, 4].flatMap((k) => [
        [`persuasion-${k}`, 'austen', 'crosswords', `${G}/austen/crosswords/persuasion-${k}-grid.webp`],
        [`pride-and-prejudice-${k}`, 'austen', 'crosswords', `${G}/austen/crosswords/pride-and-prejudice-${k}-grid.webp`],
        [`sense-and-sensibility-${k}`, 'austen', 'crosswords', `${G}/austen/crosswords/sense-and-sensibility-${k}-grid.webp`],
      ]),
      // AUSTEN · LOOKING FOR MY DARCY (8)
      ...['blue', 'fuchsia', 'red', 'yellow'].flatMap((c) => [
        [`${c}-solid`, 'austen', 'looking_for_my_darcy', `${G}/austen/looking_for_my_darcy/${c}-solid-grid.webp`],
        [`${c}-frame`, 'austen', 'looking_for_my_darcy', `${G}/austen/looking_for_my_darcy/${c}-frame-grid.webp`],
      ]),
      // CUBE (10)
      ...NOMS_CUBE.map((n) => [n, 'cube', null, n]),
      // MISCEL·LANIA (5)
      ...['arthur-d-the-second', 'death-star2d2', 'dj-vader', 'pont-del-diable', 'r2d2-quote']
        .map((n) => [n, 'miscellania', null, `${G}/miscellania/${n}-b-grid.webp`]),
    ];
    // S'AFEGEIX COLLECCIO A COLLECCIO, perque `computeStripeTileOverlaySrcs` resol
    // amb el context de la SEVA colleccio; amb una llista barrejada retornava
    // `null` a tot el que no fos l'activa.
    let inici = 0;
    while (inici < TIRA_ITEMS.length) {
      const [it0, coll0, sub0] = TIRA_ITEMS[inici];
      let fi = inici;
      while (fi < TIRA_ITEMS.length && TIRA_ITEMS[fi][1] === coll0 && TIRA_ITEMS[fi][2] === sub0) fi += 1;
      const mitjans = TIRA_ITEMS.slice(inici, fi).map(([, , , m]) => m);
      // A AUSTEN el vel va per SUBCAPçALERA: si la colleccio es l'activa pero la
      // subcolleccio no, tambe va velada.
      const velada = coll0 !== active || (coll0 === 'austen' && sub0 !== austenSubcollection);
      afegeix(mitjans, coll0, variant, coll0, sub0, velada);
      inici = fi;
    }
    return { items, srcs, collections, subcollections };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawable, variant, active, displayedShirtColor, resolvedOverlaySrc, humanInsideVariant, firstContactVariant, austenSubcollection]);

  // Les 14 cases de la franja. Amb la tira sencera, cada casa ensenya el dibuix
  // que li toca segons el desplac,ament (`stripeStripOffset`, que governa el
  // panell); sense tira, es queda com estava.
  const stripeStrip = useMemo(() => {
    const n = tiraFranja.srcs.length;
    if (n === 0) return null;
    return Array.from({ length: 14 }, (_, i) => ({
      src: tiraFranja.srcs[i % n],
      item: tiraFranja.items[i % n],
      collection: tiraFranja.collections[i % n],
      subcollection: tiraFranja.subcollections[i % n],
    }));
  }, [tiraFranja]);

  const stripeTileOverlaySrcs = useMemo(() => {
    if (stripeStrip) return stripeStrip.map((x) => x.src);
    return null;
  }, [stripeStrip]);
  const stripeTileItems = useMemo(
    () => (stripeStrip ? stripeStrip.map((x) => x.item) : null),
    [stripeStrip],
  );

  // EL DESPLAÇAMENT DE LA TIRA DE LA FRANJA (25/09/2026, ho va demanar l'amo:
  // «pots fer lliscar les samarretes en un bucle infinit?» i, quan li vaig dir
  // que el dibuix de fons no es repeteix, «fes-ho sense animacio o amb una
  // animacio molt curta perque no es vegi el retall»).
  //
  // Les catorze samarretes NO es mouen (el dibuix de fons no es repeteix
  // exactament: mesurat, desplaçat 1/14 coincideix nome's al 49 % en blanc i al
  // 0,75 % en colors). El que circula es la LLISTA de dibuixos: una fletxa, un
  // pas de rodeta o un arrossegament l'avença d'un dibuix, i cada casa ensenya
  // el que li toca. La volta es infinita i exacta perque el periode es la
  // llargada de la llista (64 dibuixos) i el residu es modular.
  // EL DESPLACAMENT ARRENCA JA CENTRAT (26/09/2026): el valor es declarat
  // (`desplacamentCentratgeFranja`) i es calcula al PRIMER render, no en un
  // efecte. Abans naixia a 0 i mig segon despres girava tres cases, amb la
  // creueta dels dibuixos: es el moviment que va veure l'amo.
  // El grup actiu ja no comença a la casa 0: es busca on es (vegeu
  // `desplacamentGrupActiuFranja`). I a AUSTEN el grup el mana la
  // SUBCAPÇALERA activa (PEMBERLEY, QUOTES, CROSSWORDS…), no la collecció.
  const stripeStripOffsetInicial = desplacamentGrupActiuFranja({
    collections: tiraFranja.collections,
    subcollections: tiraFranja.subcollections,
    sub: austenSubcollection ?? null,
    active,
    isPortraitTablet,
  });
  const [stripeStripOffset, setStripeStripOffset] = useState(stripeStripOffsetInicial);
  const stripeStripOffsetRef = useRef(stripeStripOffsetInicial);
  // El dibuix que s'ha clicat en una samarreta VELADA, amb la casa on era: el
  // fa servir l'ancoratge de sota perque no es mogui de sota el cursor.
  const ancoratgeVelRef = useRef(null);
  const aplicaStripOffset = useCallback((f) => {
    const n = tiraFranja.srcs.length;
    if (!n) return;
    const seguent = typeof f === 'function' ? f(stripeStripOffsetRef.current) : f;
    const arrodonit = Math.round(seguent);
    if (arrodonit === stripeStripOffsetRef.current) return;
    stripeStripOffsetRef.current = arrodonit;
    setStripeStripOffset(arrodonit);
  }, [tiraFranja]);
  const moureStrip = useCallback((passos) => {
    aplicaStripOffset((v) => v + passos);
  }, [aplicaStripOffset]);

  // La rodeta, com al carrusel de la graella: `passive: false` perque tambe ha
  // d'aturar el desplaçament vertical de la pagina mentre es passa per sobre.
  const bandaFranjaRef = useRef(null);
  const rodetaFranja = useCallback((e) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!d) return;
    e.preventDefault();
    moureStrip(d > 0 ? 1 : -1);
  }, [moureStrip]);
  useEffect(() => {
    const el = bandaFranjaRef.current;
    if (!el) return undefined;
    el.addEventListener('wheel', rodetaFranja, { passive: false });
    return () => el.removeEventListener('wheel', rodetaFranja);
  }, [rodetaFranja]);

  // LA COLLECCIO CLICADA QUEDA CENTRADA A LA FRANJA (25/09/2026).
  //
  // Ho va demanar l'amo: «Quan cliquis una colleccio a la graella o a la stripe
  // s'ha de centrar la colleccio a dalt i a baix. A stripe i graella alhora.»
  // Fins ara, en canviar de colleccio, la tira es tornava a construir amb la
  // colleccio activa AL PRINCIPI (`tiraFranja`), i les catorze cases
  // començaven per la casa 0: la colleccio nova sortia enganxada a l'esquerra,
  // mentre que a la graella (a sota) quedava centrada a la finestra.
  //
  // El que circula es la LLISTA de 64 dibuixos per les 14 cases fixes, i el
  // desplaçament el governa `stripeStripOffset` (la rodeta, les fletxes i
  // l'arrossegament el mouen). Aqui nome's se li dona el valor que centra el
  // grup actiu, i nome's quan canvia el grup: el desplaçament manual de l'amo
  // no es trepitja mai.
  //
  // Mesurat: amb 7 dibuixos actius (FIRST CONTACT) el centre del grup cau a la
  // casa 6,5, que es la meitat de les catorze; amb 15 (THE HUMAN INSIDE) i 9
  // (CUBE) tambe.
  const grupActiuRef = useRef(undefined);
  useEffect(() => {
    if (!stripeStrip) return;
    // `stripeStrip` son les CATORZE CASES (una llista), no l'objecte amb `srcs`:
    // la llista sencera de dibuixos es `tiraFranja`.
    const n = tiraFranja.srcs.length;
    if (!n) return;
    // El grup actiu ja no comença a la casa 0: cal buscar on es i quants
    // dibuixos te (vegeu `desplacamentGrupActiuFranja`). A AUSTEN el grup es el
    // de la SUBCAPÇALERA activa, i per aixo tambe entra a la clau: canviar de
    // subcol·lecció ha de tornar a centrar la franja.
    const sub = austenSubcollection ?? null;
    const { quants } = buscaGrupActiuFranja(tiraFranja.collections, active, {
      subcollections: tiraFranja.subcollections, sub,
    });
    if (!quants) return;
    const clau = `${active}|${sub ?? ''}|${quants}|${n}`;
    if (grupActiuRef.current === clau) return;
    grupActiuRef.current = clau;
    // Es tria la volta mes propera al desplacament que ja hi hagi, perque el
    // canvi de colleccio no faci cap salt.
    const actual = stripeStripOffsetRef.current;
    const objectiu = desplacamentGrupActiuFranja({
      collections: tiraFranja.collections,
      subcollections: tiraFranja.subcollections,
      sub,
      active,
      isPortraitTablet,
      actual,
    });
    if (objectiu === actual) return;
    aplicaStripOffset(objectiu);
  }, [stripeStrip, tiraFranja, active, austenSubcollection, aplicaStripOffset, isPortraitTablet]);

  // EL DIBUIX CLICAT D'UNA SAMARRETA VELADA ES QUEDA A LA SEVA CASA
  // (26/09/2026).
  //
  // Clicar una samarreta d'una altra colleccio fa que aquella colleccio passi a
  // activa i que la tira es reconstrueixi amb el seu grup al principi. Si a
  // sobre el grup es centra (l'efecte de dalt), el dibuix que el client te sota
  // el cursor o el dit se li'n va unes cases i l'ha de tornar a buscar. Mesurat
  // a 1920: la casa 1 passava a la 7 (sis cases).
  //
  // Aqui es dona el desplac,ament que deixa el `src` clicat EXACTAMENT a la
  // casa on era. Va DESPRES de l'efecte de centratge, o sigui que mana; i deixa
  // la clau del grup marcada perque el centratge no ho desfaci al render
  // seguent.
  useEffect(() => {
    const anc = ancoratgeVelRef.current;
    if (!anc) return;
    ancoratgeVelRef.current = null;
    const n = tiraFranja.srcs.length;
    if (!n) return;
    const k = tiraFranja.srcs.indexOf(anc.src);
    if (k < 0) return;
    const sub = austenSubcollection ?? null;
    // La mateixa clau que el centratge, amb la subcol·lecció a dins: si no hi
    // son iguals, el centratge desfaria aquest ancoratge al render seguent.
    const { quants } = buscaGrupActiuFranja(tiraFranja.collections, active, {
      subcollections: tiraFranja.subcollections, sub,
    });
    grupActiuRef.current = `${active}|${sub ?? ''}|${quants}|${n}`;
    const objectiuBase = k - anc.cell;
    const actual = stripeStripOffsetRef.current;
    const objectiu = objectiuBase + Math.round((actual - objectiuBase) / n) * n;
    aplicaStripOffset(objectiu);
  }, [tiraFranja, active, austenSubcollection, aplicaStripOffset]);

  // Quantes caselles porten dibuix: les altres son samarretes buides i a la
  // vista vertical s'atenuen amb un vel blanc.
  const quantsDibuixosFranja = useMemo(() => (
    Array.isArray(stripeTileOverlaySrcs) ? stripeTileOverlaySrcs.filter(Boolean).length : 0
  ), [stripeTileOverlaySrcs]);

  // Caselles de la franja que queden sense dibuix: a la vista vertical
  // s'atenuen amb un vel blanc amb la forma de la samarreta.
  const indicesSamarretesBuidesFranja = useMemo(() => (
    quantsDibuixosFranja > 0 && quantsDibuixosFranja < 14
      ? Array.from({ length: 14 }, (_, i) => i).filter((i) => i >= quantsDibuixosFranja)
      : []
  ), [quantsDibuixosFranja]);

  // LES SAMARRETES QUE NO SON DE LA COLLECCIO ACTIVA (25/09/2026).
  //
  // Ho va demanar l'amo: «Les samarretes, quan no son actives, tambe s'han
  // d'atenuar, no nome's el dibuix.» La franja horitzontal es UNA sola imatge
  // amb les catorze samarretes, i fins ara nome's s'atenuava la capa del DIBUIX
  // (0,12): la samarreta blanca de sota quedava igual, i la casa inactiva
  // nome's es distingia pel dibuix mes fluix. Aqui es marquen les cases que no
  // son de la colleccio activa, i el panell hi posa el vel de la silueta (el
  // mateix mecanisme que les samarretes buides).
  //
  // EL VEL VA AMB EL DIBUIX, NO AMB LA CASA (25/09/2026, segona volta).
  //
  // Les catorze cases son FIXES i el que circula es la llista de dibuixos: cada
  // casa ensenya el dibuix que li toca segons `stripeStripOffset`. Si el vel es
  // calcula nome's amb la colleccio activa, en fer scroll es queda a les cases
  // d'abans: les que ja no duen cap dibuix d'aquella colleccio continuen
  // atenuades i les que n'hi duen de nous es queden sense vel. Ho va veure
  // l'amo: «les samarretes que eren actives, quan fas scroll, queden actives i
  // les altres atenuades encara que vagin corrent els dibuixos».
  //
  // Per aixo el mapa surt de la MATEIXA rotacio que pinta les cases
  // (`stripeStripOffset` sobre la tira de dalt): el vel i el dibuix de cada casa
  // sempre son el mateix dibuix.
  //
  // En blanc pla, com el vel de les buides: la samarreta s'aclareix cap al fons
  // conservant el seu to.
  const VEL_SAMARRETA_INACTIVA = 0.6;
  const indicesSamarretesInactivesFranja = useMemo(() => {
    const n = tiraFranja.srcs.length;
    if (!n || !active) return [];
    // LA SUBCAPçALERA TAMBE MANA (29/09/2026).
    //
    // Fins ara es mirava nome's la COLLECCIO, i com que totes les
    // subcolleccions d'austen (PEMBERLEY, KEEP CALM, QUOTES, CROSSWORDS i
    // LOOKING FOR MY DARCY) comparteixen `collection === 'austen'`, en clicar
    // una d'elles les altres es quedaven sense vel: «Quan clico una colleccio
    // d'Austen, les altres d'Austen, desapareixen de la stripe».
    //
    // Amb la subcolleccio, una casa esta activa nome's si tambe ho es la seva
    // subcolleccio. Si el context no en te (les altres colleccions), el
    // comportament es el de sempre.
    const sub = austenSubcollection ?? null;
    const out = [];
    for (let i = 0; i < 14; i++) {
      const j = ((((i + stripeStripOffset) % n) + n) % n);
      const coll = tiraFranja.collections[j];
      const subDeLaCasa = tiraFranja.subcollections?.[j] ?? null;
      const esActiva = coll === active && (coll !== 'austen' || !sub || subDeLaCasa === sub);
      if (coll && !esActiva) out.push(i);
    }
    return out;
  }, [tiraFranja, stripeStripOffset, active, austenSubcollection]);
  // Pista de taller (nome's en desenvolupament): estat de la franja i una
  // manera de moure-la des de la consola per comprovar el vel. Va DINS D'UN
  // EFECTE i no al cos del render: escriure a `window` mentre es pinta es mutar
  // un valor de fora i el lint (`react-hooks/immutability`) ho atura.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__HG_STRIPE_INACTIUS__ = {
      offset: stripeStripOffset,
      active,
      sub: austenSubcollection ?? null,
      inactius: indicesSamarretesInactivesFranja,
      collections: tiraFranja.collections,
      subcollections: tiraFranja.subcollections,
      mou: setStripeStripOffset,
    };
    return undefined;
  }, [stripeStripOffset, active, austenSubcollection, indicesSamarretesInactivesFranja, tiraFranja]);

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

  // Les props compartides de la franja de la pagina 2 (vegeu la pagina 1).
  const propsFranjaP2 = {
    active: active,
    reserveGridSpace: true,
    resolvedMega: resolvedMegaFiltered,
    showStripe: showStripe,
    stripeRowPadPx: stripeRowPadPx,
    stripeRowPadXPx: stripeRowPadXPx,
    stripePreviewHPx: compactStripePreviewHPx,
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
    megaTileSize: compactMegaTileSize,
    setStripeOverlayOverrideActive: setStripeOverlayOverrideActive,
    setFirstContactVariant: setFirstContactVariant,
    setHumanInsideVariant: setHumanInsideVariant,
    setThinStartIndex: setThinStartIndex,
    setFirstContactSelectedItem: setFirstContactSelectedItem,
    setHumanInsideSelectedItem: setHumanInsideSelectedItem,
    setSelectedItemByCollection: setSelectedItemByCollection,
    normalizeOverlaySrc: normalizeOverlaySrc,
    shirtColor: CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.overlayHex,
    onShirtClick: onShirtClick,
    selectedItem: 
              active === 'first_contact' ? firstContactSelectedItem
              : active === 'the_human_inside' ? humanInsideSelectedItem
              : (selectedItemByCollection?.[active] ?? null)
            ,
    stripeTileOverlaySrcs: stripeTileOverlaySrcs,
    stripeTileItems: stripeTileItems,
    // La tira sencera (64 dibuixos amb la seva colleccio) i el seu desplaçament:
    // es el que fa circular els dibuixos per les catorze cases fixes.
    stripeStrip: tiraFranja.srcs.length ? { srcs: tiraFranja.srcs, items: tiraFranja.items, collections: tiraFranja.collections, subcollections: tiraFranja.subcollections } : null,
    stripeStripOffset: stripeStripOffset,
    // Les casa de la franja que no son de la colleccio activa: el panell hi posa
    // el vel de la samarreta (a l'apaisat; a la vertical ja hi ha els `path` de
    // la silueta dins l'SVG). Vegeu `indicesSamarretesInactivesFranja`.
    indicesSamarretesInactives: indicesSamarretesInactivesFranja,
    alfaVelSamarretaInactiva: VEL_SAMARRETA_INACTIVA,
    onStripeStripWheel: rodetaFranja,
    onStripeStripPas: moureStrip,
    // El clic d'una samarreta ACTIVA la seva colleccio (25/09/2026, ho va
    // demanar l'amo): el cami es el mateix que el de la icona atenuada de la
    // graella.
    //
    // PERO SI LA SAMARRETA ES VELADA, LA FRANJA NO ES TORNA A CENTRAR
    // (26/09/2026): el dibuix que el client te sota el cursor o el dit s'ha de
    // quedar a la seva casa. El centratge automatic (l'efecte de
    // `stripeStripOffset`) el desplac,ava sis cases (mesurat: la casa 1 passava
    // a la 7) i el client l'havia de tornar a buscar. Amb l'ancoratge, la
    // colleccio tambe queda activa pero el dibuix no es mou.
    onStripeStripSelect: (collection, subcollection, info) => {
      if (collection && collection !== active) {
        if (info && typeof info.cell === 'number' && info.src) {
          ancoratgeVelRef.current = { cell: info.cell, src: info.src };
        }
        setActive(collection);
      }
      if (collection === 'austen') setAustenSubcollection(subcollection || null);
      else setAustenSubcollection(null);
    },
    clicAreaHighlightIndices: clicAreaHighlightIndices,
    emptyTileIndices: emptyTileIndices,
    stripeEmptyMaskSrc: stripeEmptyMaskSrc,
    // La franja de la pagina 2 s'ajusta al carril sempre que no siguem a la
    // vista vertical, on la franja va dins d'una filera escalada i te el seu
    // propi calibratge.
    ajustFranjaCarril: !isPortraitTablet,
  };
  // L'OMBRA DE LA MANIGA: es mesura la caixa del contingut de la franja (on son
  // les samarretes) relativa a la capa de la franja, i la vora esquerra de la
  // columna de colleccions, que es on s'ha de veure l'ombra. Es recalcula amb
  // els canvis de mida (ResizeObserver) i amb la finestra.
  useLayoutEffect(() => {
    const capa = bandaFranjaRef.current;
    const visual = capa?.querySelector('[data-stripe-visual-content="2"]');
    const columna = capa?.parentElement?.querySelector('[data-colleccions-targeta]')?.parentElement;
    if (!capa || !visual) return undefined;
    let frame = 0;
    const mesura = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const a = capa.getBoundingClientRect();
        const c = visual.getBoundingClientRect();
        if (!a.width || !c.width) return;
        const k = columna ? columna.getBoundingClientRect() : null;
        // L'OMBRA VA DINS DEL SELECTOR (27/09/2026, ho ha demanat en Marc): el
        // que es passa a la columna son les distancies de la caixa del contingut
        // de la franja a la SEVA caixa (ja descomptada la vora, que es el que
        // mana per a un fill absolut), i la mida de la caixa. Aixi la columna
        // (que te `overflow: hidden` i radi 6) retalla l'ombra tota sola i
        // l'ombra queda SOTA la imatge, perque la columna es a `zIndex: 3` i la
        // franja a `zIndex: 4`.
        const voraEsq = columna ? (parseFloat(getComputedStyle(columna).borderLeftWidth) || 0) : 0;
        const voraDalt = columna ? (parseFloat(getComputedStyle(columna).borderTopWidth) || 0) : 0;
        const caixa = k ? {
          left: Math.round(((c.left - k.left) - voraEsq) * 10) / 10,
          top: Math.round(((c.top - k.top) - voraDalt) * 10) / 10,
          width: Math.round(c.width * 10) / 10,
          height: Math.round(c.height * 10) / 10,
        } : null;
        // Nome's es canvia si els numeros es MOUEN: amb un objecte nou a cada
        // passada, el MutationObserver de sota es realimentaria.
        setOmbraManiga((previ) => {
          if (previ && caixa
            && Math.abs(previ.left - caixa.left) < 0.5 && Math.abs(previ.top - caixa.top) < 0.5
            && Math.abs(previ.width - caixa.width) < 0.5 && Math.abs(previ.height - caixa.height) < 0.5) {
            return previ;
          }
          return caixa;
        });
      });
    };
    mesura();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesura) : null;
    observer?.observe(capa);
    if (visual) observer?.observe(visual);
    // LA COLUMNA TAMBE (02/10/2026): l'ombra es mesura contra la SEVA caixa, i
    // la columna es mou (els bucles li canvien el `top` i l'alcada).
    if (columna) observer?.observe(columna);
    // I ELS CANVIS DE POSICIO (02/10/2026). En Marc: «L'ombra encara vola»: el
    // ResizeObserver nome's veu els canvis de MIDA, i la franja i la columna es
    // MOUEN (els bucles d'alineacio els escriuen el `top` a l'estil en linia):
    // l'ombra es quedava amb la mesura vella i queia desplaçada. Amb l'observador
    // d'estils, cada moviment torna a mesurar.
    const observadorEstil = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(mesura)
      : null;
    if (observadorEstil && capa.parentElement) {
      observadorEstil.observe(capa.parentElement, { attributes: true, attributeFilter: ['style'], subtree: true });
    }
    window.addEventListener('resize', mesura);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      observadorEstil?.disconnect();
      window.removeEventListener('resize', mesura);
    };
  }, [isPortraitTablet, isLandscapeTablet]);

  return (
    <div style={{ width: '25%', flexShrink: 0, display: isPortraitTablet ? 'block' : 'flex', height: '100%', position: 'relative', justifyContent: 'center', overflow: 'visible' }}>      <div
        ref={viewportRef}
        data-mega-page-viewport="2"
        style={{
          // A la VERTICAL, el contingut de la pagina 2 queda AMAGAT (l'espai
          // es conserva). A l'apaisada i a l'escriptori no es toca res.
          visibility: isPortraitTablet ? 'hidden' : undefined,
          // A mes, el contingut de l'horitzontal no ha de rebre tocs a la vista
          // vertical: el seu overlay de clic quedaría per sobre de les taules i
          // s'empassaria els clics (dibuixos i samarretes).
          pointerEvents: isPortraitTablet ? 'none' : undefined,
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
          width: isPortraitTablet ? '992px' : (esCarrilPagina1024 ? `${ampleCarrilPaginaP2}px` : 'var(--hg-mega-w, 70.3vw)'),
          maxWidth: 'none',
          position: 'relative',
          // El contenidor es centra sobre l'amplada de maquetacio del cos (que
          // reserva la barra): per caure a sobre del carril de la pagina, que va
          // centrat a la finestra, se'l desplaça el que hi ha de l'una a l'altra.
          left: esCarrilPagina1024 ? `${desplacCarrilPaginaP2}px` : undefined,
          // I EL CARRIL DEL MEGASLIDE, REDEFINIT AQUI DINS (02/10/2026): tot el
          // que hi ha a la pagina 2 que es mesura «en carrils» (`carrilLane`: les
          // columnes, les separacions i el marge de la filera) ha de seguir el
          // carril de la PAGINA, que a 1024 es mes ample que el del megaslide.
          // Les peces que van amb `carrilPx` (el selector, els dibuixos, la
          // franja) tenen la seva propia calibracio i no es toquen.
          ...(esCarrilPagina1024 ? { '--hg-mega-w': `${ampleCarrilPaginaP2}px` } : null),
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
            // EL SELECTOR, AL LEFT DEL CARRIL (24/09/2026, ho va demanar l'amo).
            // Abans arrencava amb el coixí de la fila del header
            // (`carrilLane(40)`, el left del logo). Ara arrenca a la VORA del
            // carril, o sigui a 0: el mateix lloc on arrenquen el marc del lloc i
            // la filera.
            left: 0,
            // L'AMPLE ES EL DE DISSENY (24/09/2026): la pastilla que s'hi veu
            // fa la MEITAT (`w-1/2`), i per aixo el contenidor en fa el doble.
            // La meitat que sobra trepitjava les primeres caselles del carrusel
            // (Playwright: «intercepts pointer events»), i per aixo el
            // contenidor no rep clics: els rep la pastilla.
            //
            // La CAIXA (el fill) pot dur l'amplada manada des del 02/10/2026
            // (`ampleCaixaBcnPx`): la seva pastilla ha d'acabar on acaba la de la
            // franja de colleccions amb FIRST CONTACT actiu. El contenidor es
            // queda l'ample de disseny, que sempre es mes ample.
            width: carrilPx(midaSelectorP2),
            height: carrilPx(midaSelectorP2),
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Els clics no els rep el contenidor (fa el doble d'ample que la
            // pastilla i tapava les primeres caselles del carrusel): els rep la
            // pastilla, que des de dins torna a dir `pointerEvents: auto`.
            pointerEvents: 'none',
          }}>
            {/* AQUEST EMBOLCALL TAMBE ES PLE (129,4 x 129,4) i taparia el
                carrusel: no rep clics. Els rep la pastilla, que es qui es veu. */}
            <div style={{ width: '100%', height: '100%', pointerEvents: 'none', transform: `translateY(${topVisualAlignmentY + selectorCentratgeY}px)` }}>
              {esCarrilPagina1024 ? (
                /* LA MATEIXA PECA QUE EL SELECTOR DE LA P1 (02/10/2026): el
                   quadrat amb el fons, el radi i l'ombra, la pastilla blanca a
                   la casella triada i els tres enllacos de text. */
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'hsl(var(--grey-paper-soft))',
                  borderRadius: '5.3px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                }}>
                  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <PastillaBlancaPagina1 topPct={topPastillaBcnPct} />
                  </div>
                  <SelectorQuadratPagina1
                    dinsBloc
                    omple
                    format="square"
                    mostraPastilla={false}
                    showWhite={stripeVariantVisibility?.white !== false}
                    showBlack={stripeVariantVisibility?.black !== false}
                    showMulti={stripeVariantVisibility?.color !== false}
                    selectedVariant={variantBcn}
                    onWhite={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('white') : setFirstContactVariant('white'); }}
                    onBlack={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('black') : setFirstContactVariant('black'); }}
                    onMulti={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('color') : setFirstContactVariant('color'); }}
                  />
                </div>
              ) : (
              <FirstContactDibuix00Buttons
                // EL SELECTOR DE LA PAGINA 2 ES RECTANGLE (26/09/2026): el bloc
                // de BLANC/COLOR/NEGRE es compartit amb la pagina 1, que el vol
                // quadrat, i per aixo la forma s'hi passa (vegeu
                // `FirstContactDibuix00Buttons`). Aqui torna a ser el de sempre:
                // la meitat d'amplada i el doble d'alçada.
                //
                // I A 1024 TORNA A SER QUADRAT (02/10/2026). En Marc: «el selector
                // b/c/n serà un quadrat com a la p1 (a l'esquerra)»: alla el
                // selector de la p1 es un quadrat i el de la p2 ha de fer el
                // mateix, amb les tres caselles apilades.
                format={esCarrilPagina1024 ? 'square' : 'rectangle'}
                // LA CAIXA, CLAVADA AMB LA PASTILLA DE LA FRANJA (02/10/2026):
                // l'amplada surt de la primera casa de la franja (vegeu
                // `ampleCaixaBcnPx`) i l'alçada es queda la de disseny (el doble
                // de l'amplada de disseny, que es el que feia l'aspecte 1/2).
                // A 1024 el quadrat fa el costat del contenidor
                // (`carrilPx(bnSliderSize)`).
                ampladaPx={esCarrilPagina1024
                  ? carrilPx(bnSliderSize)
                  : (ampleCaixaBcnPx != null ? `${ampleCaixaBcnPx}px` : null)}
                alcadaPx={carrilPx(bnSliderSize)}
                onWhite={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('white') : setFirstContactVariant('white'); }}
                onBlack={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('black') : setFirstContactVariant('black'); }}
                onMulti={() => { setStripeOverlayOverrideActive(false); active === 'the_human_inside' ? setHumanInsideVariant('color') : setFirstContactVariant('color'); }}
                showWhite={stripeVariantVisibility?.white !== false}
                showBlack={stripeVariantVisibility?.black !== false}
                showMulti={stripeVariantVisibility?.color !== false}
                selectedVariant={active === 'the_human_inside' ? humanInsideVariant : firstContactVariant}
              />
              )}
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
            midaSelector={bnSliderSize}
            // LA FILERA ARRENCA ON ACABA EL SELECTOR (24/09/2026). Els blocs de
            // la composicio son [selector] 10 [dibuixos] 10 [fletxes] 10
            // [columna de colleccions], i les fletxes les posa la graella de
            // dibuixos a la dreta del seu retall.
            //
            // Abans hi havia `carrilLane(40)` de mes: era l'amplada del
            // selector quan era sencer, i quan es va fer la meitat (24/09) va
            // quedar com a coixi de 34 px, o sigui que els dibuixos no
            // arrencaven on acaba el selector.
            //
            // I A LA COMPOSICIO ESTRETA ARRENCA ON ACABA EL SELECTOR DE DEBO
            // (02/10/2026). En Marc: «Aprofitarem que es d'aquesta mida. 1.
            // Redueix la tira de colors perque hi capiga entre el selector i la
            // dreta del carril. 2. Tanca el viewport de la graella de dibuixos
            // pel punt on comenci la tira de colors».
            //
            // El valor de disseny (`bnSliderSize / 2` + 10) ve de quan el
            // selector era el doble d'ample, i amb la caixa nova el retall dels
            // dibuixos i la tira de colors arrencaven 31 px ABANS del final del
            // selector (mesurat a 1366: 336,4 en lloc de 367,5), o sigui que
            // s'hi endinsaven. L'amplada de la caixa ja es mesura
            // (`ampleCaixaBcnPx`, vegeu mes amunt) i la caixa arrenca a la vora
            // esquerra del carril: el seu final es exactament aquesta amplada.
            // La franja de colleccions no s'hi mou: `franjaPlena` li descompta
            // l'`esquerra` i continua anant de vora a vora del carril.
            esquerra={bnSliderSize
              ? (esCarrilPagina1024
                // A 1024 el selector es un quadrat del costat del contenidor i la
                // filera arrenca 10 px mes enlla.
                ? `calc(${carrilPx(midaSelectorP2)} + ${carrilPx(10)})`
                : (esComposicioEstreta && ampleCaixaBcnPx != null
                  ? carrilPx(ampleCaixaBcnPx)
                  : `calc(${carrilPx(bnSliderSize / 2)} + ${carrilPx(10)})`))
              : undefined}
            desplacamentVertical={40 - topGraellaColors}
            // El desplaçament vertical d'aquesta filera, el que aplica el bucle
            // d'alineació de sota. La graella el necessita com a dependència: la
            // seva mesura (l'espai que li queda fins a la franja) en depèn i els
            // efectes dels fills van ABANS que aquest bucle, o sigui que sense
            // això mesurava amb la filera encara a baix i naixia un 20 % petita
            // (vegeu CercadorTextRow).
            alineacioY={topVisualAlignmentY}
            onMides={setMesuraGraellaP2}
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
                // I LA PDP (24/09/2026, ho va demanar l'amo): el clic a una
                // icona tambe ha d'obrir el producte, sigui de la colleccio
                // activa o no. Es el mateix cami que fa el clic de la
                // samarreta de la franja (`onShirtClick`).
                onShirtClick?.(collection, firstStripeItem, CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.overlayHex);
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
            // LES FLETXES MOUEN LA GRAELLA INTERCALADA (28/09/2026).
            //
            // En Marc: «Inverteix la direcció del moviment de les fletxes a la
            // graella», i tot seguit «Li has donat el moviment a la stripe...?
            // [...] Era a la graella intercalada»: el bloc de fletxes del costat
            // de la fila de colors es de la GRAELLA, i ha de moure-la a ella.
            //
            // Aqui hi havia `onCarouselStep={moureStrip}` (25/09/2026): les
            // fletxes feien passar els DIBUIXOS de la franja d'un en un, i la
            // graella no es movia gens. Sense aquesta prop, les fletxes fan
            // servir el pas propi de la graella (`setDesplacGest`), que es el
            // mateix mecanisme de la rodeta i de l'arrossegament. La franja
            // continua tenint el seu pas (`onStripeStripPas`, mes amunt) per a
            // la rodeta i el gest.
            //
            // La DIRECCIO va invertida respecte de com anava (vegeu
            // `CercadorTextRow`, a la botonera): prement la fletxa de dalt
            // (‹, «Anterior») la graella avança, que es el que va demanar. Si
            // ho vol a l'inrevés, nome's cal canviar el signe.
            // L'OMBRA DE LA MANIGA: la caixa del contingut de la franja dins de
            // la columna de colleccions (la pinta la columna, que la retalla).
            ombraManiga={ombraManiga}
            // El desplaçament que ha baixat la franja en aquesta banda: el
            // sostre de la franja (`topFranjaPagina2`) l'ha de portar perque la
            // columna de colleccions hi continuï acabant.
            ajustFranjaY={ajustFranjaP2Y}
          />
        </div>

        {/* MegaStripePanel */}
        <div ref={bandaFranjaRef} style={{
          position: 'relative',
          // LA MANIGA PER SOBRE DEL SELECTOR, AMB OMBRA (26/09/2026, ho va
          // demanar l'amo): «la maniga de la franja ha de sortir per sobre del
          // selector amb una ombra». La columna de colleccions es ara una
          // pastilla que ocupa tota la columna i la seva vora esquerra cau a
          // x1404; l'ultima columna amb tinta de la franja es a x1405, o sigui
          // que la trepitja 2 px. La columna viu a zIndex 3 (la filera del
          // cercador) i la franja a 1: pugem la franja a 4 perque la maniga
          // quedi per sobre.
          //
          // PERO LA CAPA NO HA DE TAPAR RES (26/09/2026). Aquesta capa fa TOT
          // el carril d'amplada i la seva alcada arriba fins al fons del
          // panell: amb `zIndex: 4` passava per sobre de la tira de colors i
          // del carrusel (que viuen a zIndex 1) i s'empassava els clics i la
          // rodeta («els clics estan tapats o capturats per alguna cosa»,
          // «nomes funciona l'scroll de la stripe»). Com que la capa no pinta
          // res (el que es veu son les imatges de dins, que si que rep els
          // clics), se li treu el `pointer-events`: els clics i la rodeta
          // travessen la capa i arriben a qui toca.
          zIndex: 4,
          pointerEvents: 'none',
          width: '100%',
          // SENSE el `left: -3,5px` DE TAU LETA (24/09/2026). Era una
          // compensacio del belt vell: amb el carril de 3/5 desplaçava tota la
          // franja 3,5 px a l'esquerra i les cintures no queien a la vora del
          // carril (mesurat: 198,8..802,8 amb el carril a 202..807 a 1024).
          left: undefined,
          // A tauleta, la franja va un 0,2% mes petita amb una escala uniforme
          // (ample i alt alhora), perque no es deformin els dibuixos. L'origen
          // es la cantonada esquerra: la reduccio entra per la dreta.
          transform: (isPortraitTablet || isLandscapeTablet) ? 'scale(0.998)' : undefined,
          transformOrigin: 'left top',
        }}>
          <MegaStripePanel
            {...propsFranjaP2}
            stripeImageSrc={isPortraitTablet ? '/placeholders/tablet vertical/full-white-stripe-doble.png' : stripeBaseImageSrc}
            // La franja ha de quedar a la mateixa alcada que la de la pagina 1.
            // El desplacament es DECLARAT (`visualOffsetYFranjaPagina2`): era
            // una composicio en línia aquí i el calcul del sostre de la franja
            // tambe el necessita. `ajustFranjaP2Y` es el que hi afegeix el bucle
            // de dalt a la banda de les tauletes apaissades, on les dues franges
            // no fan la mateixa alcada i els baixos s'han de quadrar igualment.
            visualOffsetY={visualOffsetYFranjaPagina2({
              ample: typeof window !== 'undefined' ? window.innerWidth : 0,
              alt: typeof window !== 'undefined' ? window.innerHeight : 0,
              isPortraitTablet,
              isLandscapeTablet,
              ajustBaixY: ajustFranjaP2Y,
            })}
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
                /* LA GRAELLA COM LA DE LA P2 HORITZONTAL (28/09/2026, ho va
                   demanar l'amo): el carrusel de DUES files intercalades, amb
                   la peca 1,5 cops la base (`midaDibuix x 1,5`), les
                   separacions de sempre (`gapHorizontal`/`gapVertical`) i
                   `GRAELLA_COLUMNES` columnes. Amb `dibuixPx` fix la graella
                   deixa d'expandir-se per omplir la casella — que es el que en
                   feia QUATRE files i 271 px, i no hi cabia — i fa l'alcada de
                   dues files. Sense fletxes: a la vertical son 0. */
                dibuixPx={midaDibuix(isPortraitTablet, false) * 1.655}
                /* MES SEPARACIO ENTRE DIBUIXOS (28/09/2026, ho ha demanat
                   l'amo): el gap de la vertical (17,91 px) per 1,5. */
                gapH={gapHorizontal(isPortraitTablet, false) * 1.5}
                /* SENSE GAP VERTICAL (28/09/2026): les dues files del carrusel
                   han d'anar amb el PAS DE LA PECA (34,6 px, l'alcada d'un boto
                   del selector), com a la horitzontal — alla les dues files
                   noves ocupen el que abans ocupaven tres. Amb el `gapV` de la
                   vertical (~7 px) el pas quedava en 18,6 i la fila de dalt no
                   quadrava amb BLANC. */
                gapV={0}
                numColumns={GRAELLA_COLUMNES}
                carrusel
                activeCollection={active}
                isPortraitTablet={isPortraitTablet}
                /* El tap en un dibuix tambe tria la seva colleccio, com a la
                   filera (onSelectGroup). */
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
                    // La PDP, com a la filera: el clic a una icona obre el
                    // producte, sigui de la colleccio activa o no.
                    onShirtClick?.(collection, firstStripeItem, CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.overlayHex);
                  }
                }}
              />
            )}
            colleccions={(
              <CercadorColleccionsColumna
                // La pastilla grisa es marca amb la clau composta, com a la
                // resta de la casa: 'austen:pemberley'.
                activeKey={active === 'austen' ? `austen:${austenSubcollection || ''}` : active}
                // La clau pot portar subcolleccio ('austen:pemberley'): s'ha de
                // partir. Amb setActive directe quedava com a colleccio sencera,
                // no existia i la franja queia a repetir un sol dibuix.
                onSelect={(key) => {
                  if (typeof key === 'string' && key.includes(':')) {
                    const [collection, subcollection] = key.split(':');
                    setActive(collection);
                    setAustenSubcollection(subcollection);
                  } else {
                    setActive(key);
                    setAustenSubcollection(null);
                  }
                }}
                alcadaFilaLlista={midesTaula.alcadaFilaLlista}
                caixes
              />
            )}
            colors={(
              /* Les catorze barres de color (8x1). A la VERTICAL, SENSE MARGE DE
                 DALT (28/09/2026): la casella de la taula ja les centra dins la
                 banda del boto NEGRE, i els 21 px de la composicio horitzontal
                 les deixaven 8,5 px mes avall (mesurat: y=236,2 amb el boto de
                 210,4 a 245). */
              /* DE L'AMPLADA DE LA CASELLA (28/09/2026, ho va demanar l'amo):
                 el contenidor de la tira es una graella de 14 columnes `1fr` amb
                 les barres a `width: 100%`, o sigui que la mida de cada barra la
                 mana l'amplada d'aquest contenidor. Sense `width: 100%` es un
                 element flex que s'encongia al seu minim (175,6 px) i les barres
                 quedaven de 7 x 2 px. */
              <div style={{ width: '100%', marginTop: isPortraitTablet ? 0 : '21px' }}>
                <CercadorColorsGrid
                  selectedColor={cercadorSelectedColor}
                  onSelectColor={setCercadorSelectedColor}
                  colorGapPx={colorGap(true, false)}
                />
              </div>
            )}
            stripe={(
              /* La franja de debò: el mateix panell que la filera, amb la imatge
                 de dues fileres (7+7), escalat per encaixar a la casella.
                 El DIBUIX de sobre les samarretes va 14 px visibles a la dreta
                 i 29 px amunt; la samarreta no es mou. A mes, els 7 de la
                 FILERA DE DALT van 12,8 px mes amunt
                 (--hgStripeDrawingExtraDyFilaDalt): la imatge talla les
                 samarretes de dalt i, sense aixo, les impressions hi quedaven
                 mes avall que a la de baix. Com que el dibuix viu
                 dins el panell escalat, 1 px d'aquest calibratge fa 2,566 px
                 visibles a 768: 14 / 2,566 = 5,46, i -16,31 es el -5 de sempre
                 menys 11,31 (els 29 px de dalt). */
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* AQUEST EMBOLCALL NO ES MENJA ELS CLICS (28/09/2026). Es el
                    que escala i desplaça la franja vertical
                    (`translate(130.25px,-145px) scale(2.484)`), i la seva caixa
                    transformada cau a (63,-89) i fa 476x607: arriba fins a
                    y=518 i trepitja la casella del selector (y=114..222), que
                    viu a la casella del costat. Sense `pointer-events: none`
                    s'empassava els seus tres clics (BLANC, COLOR i NEGRE). El
                    panell de dins ja porta el seu, i el que s'ha de poder clicar
                    (les arees de clic de les samarretes) el demana a part. */}
                <div style={{ height: '100%', transform: 'translate(130.25px, -145px) scale(2.484)', transformOrigin: 'right center', pointerEvents: 'none', '--megaStripeDx': '0px', '--megaStripeDy': '0px', '--hgStripeDrawingExtraDx': '5.86px', '--hgStripeDrawingExtraDxFilaDalt': '0.39px', '--hgStripeDrawingExtraDy': '-22.05px', '--hgStripeDrawingExtraDyFilaDalt': '-0.31px', '--hgStripeDrawingExtraScale': '1.155', '--hgStripeEmptyVeilAlpha': String(VEL_SAMARRETA_BUIDA_ALFA) }}>
                  <MegaStripePanel
                    {...propsFranjaP2}
                    isPortraitTablet
                    stripeImageSrc="/placeholders/tablet vertical/full-white-stripe-doble.png"
                    senseMascaraSamarreta
                    hideGrid
                    visualOffsetY={0}
                    indicesSamarretesBuides={indicesSamarretesBuidesFranja}
                  />
                </div>
              </div>
            )}
            selector={(
              /* El selector, un 10% mes petit (la peça agafa l'amplada del seu
                 contenidor). */
              /* EL 100% DE LA SEVA COLUMNA (28/09/2026): la columna fa 117,8 px
                 (el selector + les vores + la correguda), o sigui que la casella
                 fa 107,8 i el selector l'omple sense canviar de mida (105,8). */
              <div style={{ width: '100%' }}>
              <FirstContactDibuix00Buttons
                /* A la vertical la casella l'alinea amb la vora de dalt: sense
                   el `mt-2` del bloc (vegeu firstContactPanels.jsx). */
                senseMargeDalt
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
              </div>
            )}
          />
        </CapaTaulaVertical>
      ) : null}

    </div>
  );
}
