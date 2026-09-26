import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CERCADOR_COLORS } from '../fullwide/CercadorTopBar.jsx';
import CercadorTextRow from '../fullwide/CercadorTextRow.jsx';
import MegaStripePanel from '../fullwide/MegaStripePanel.jsx';
import { centratgeSelectorY, desplacTopSelector, visualOffsetYFranjaPagina2 } from './geometriaMegaslide.js';
import { carrilPx, readRootCssNumber, MEGASLIDE_REFERENCIA_PX } from '../../utils/layoutMetrics.js';
import { CapaTaulaVertical, TaulaVerticalP2 } from './TaulaVertical.jsx';
import {
  CercadorColleccionsColumna,
  CercadorColorsGrid,
  CercadorDibuixosGraella,
  dibuixosGraella16x4,
} from '../fullwide/CercadorTextRow.jsx';
import { colorGap, midaDibuix, gapVertical } from '../fullwide/midesGraella.js';
import { ampladaCarril } from './TaulaVertical.jsx';
import MegaHeroSlider from '../MegaHeroSlider.jsx';
import Pauta4ColsOverlay from '../pauta/Pauta4ColsOverlay';
import useMegaslideCalibration from '@/hooks/useMegaslideCalibration';
import {
  CONTROL_TILE_BN,
  CONTROL_TILE_ARROWS,
} from '../fullwide/MegaColumn.jsx';
import { FirstContactDibuix00Buttons } from '../fullwide/firstContactPanels.jsx';
import { VEL_SAMARRETA_BUIDA_ALFA } from '../../config/stripeCalibrationsVertical.js';
import { computeStripeTileOverlaySrcs } from '@/utils/resolveStripeTile.js';

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
  const [topVisualAlignmentY, setTopVisualAlignmentY] = useState(0);
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
      if (!page1Selector || !page2Selector) return;

      const alignAplicat = alignRefY.current;
      const centraAplicat = centraRefY.current;
      const p1Top = page1Selector.getBoundingClientRect().top;
      const p2Top = page2Selector.getBoundingClientRect().top;

      // 1) ALINEACIÓ (fórmula original): l'objectiu és el selector de la pàgina 1
      //    més l'offset; el centratge no hi compta perquè va a sobre.
      const offset = (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 10 : 0;
      const deltaAlign = (p1Top + offset) - (p2Top - centraAplicat);

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

      const scyDeclarat = centratgeSelectorY({
        midaSelector: bnSliderSize,
        escala: readRootCssNumber('--hg-escala-mega', 1),
        dibuix: mesuraGraellaP2?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet),
        gapV: mesuraGraellaP2?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet),
        carril: readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX),
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
  }, [active, bnSliderSize, isPortraitTablet, isLandscapeTablet, page1PageLift, esBandaEstreta, topGraellaColors, mesuraGraellaP2]);

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
    const afegeix = (llista, ctxActive, ctxVariant, ctxCollection, ctxSubcollection) => {
      if (!llista.length) return;
      const s = computeStripeTileOverlaySrcs({
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
    // Primer la colleccio activa, amb el SEU ordre; despres les altres, en
    // l'ordre de la graella.
    //
    // LA COLLECCIO ACTIVA ES QUEDA AGRUPADA (25/09/2026, ho ha demanat l'amo:
    // «Prefereixo que es veguin agrupats a la stripe. Torna a deixar les imatges
    // com estaven ordenades abans»). La llista ve del mega configurat, i alla
    // els quatre solids de LOOKING FOR MY DARCY hi son seguits i els quatre
    // marcs darrere: agrupats. Ordenar-la pel rang de la graella els
    // intercalava, i allo es el que no vol.
    afegeix(drawable, active, variant, active, austenSubcollection);
    for (const it of dibuixosGraella16x4()) {
      if (!it.stripeItem || it.collection === active) continue;
      afegeix([it.stripeItem], it.collection, it.collection === 'the_human_inside' ? humanInsideVariant : firstContactVariant, it.collection, it.subcollection);
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
  const [stripeStripOffset, setStripeStripOffset] = useState(0);
  const stripeStripOffsetRef = useRef(0);
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
    // El grup actiu es contigu i comença a la casa 0 (aixi es construeix
    // `tiraFranja`): el que cal saber-ne es quants dibuixos te.
    let quants = 0;
    for (const c of (tiraFranja.collections || [])) {
      if (c !== active) break;
      quants += 1;
    }
    if (!quants) return;
    const clau = `${active}|${quants}|${n}`;
    if (grupActiuRef.current === clau) return;
    grupActiuRef.current = clau;
    // El centre del grup cau a la casa `(quants - 1) / 2` i el mig de la franja
    // es la casa 6,5 (catorze cases): el desplaçament que els fa coincidir es la
    // diferencia. Com que la tira es circular, es tria la volta mes propera al
    // desplaçament que ja hi hagi, perque no faci cap salt (mateix criteri que
    // el centratge de la graella, a `CercadorTextRow`).
    const objectiuBase = (quants - 1) / 2 - 6.5;
    const actual = stripeStripOffsetRef.current;
    const objectiu = objectiuBase + Math.round((actual - objectiuBase) / n) * n;
    if (objectiu === actual) return;
    aplicaStripOffset(objectiu);
  }, [stripeStrip, tiraFranja, active, aplicaStripOffset]);

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
    let quants = 0;
    for (const c of (tiraFranja.collections || [])) {
      if (c !== active) break;
      quants += 1;
    }
    grupActiuRef.current = `${active}|${quants}|${n}`;
    const objectiuBase = k - anc.cell;
    const actual = stripeStripOffsetRef.current;
    const objectiu = objectiuBase + Math.round((actual - objectiuBase) / n) * n;
    aplicaStripOffset(objectiu);
  }, [tiraFranja, active, aplicaStripOffset]);

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
    const out = [];
    for (let i = 0; i < 14; i++) {
      const j = ((((i + stripeStripOffset) % n) + n) % n);
      const coll = tiraFranja.collections[j];
      if (coll && coll !== active) out.push(i);
    }
    return out;
  }, [tiraFranja, stripeStripOffset, active]);

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
  return (
    <div style={{ width: '25%', flexShrink: 0, display: isPortraitTablet ? 'block' : 'flex', height: '100%', position: 'relative', justifyContent: 'center', overflow: 'visible' }}>
      <div
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
            width: carrilPx(bnSliderSize),
            height: carrilPx(bnSliderSize),
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
            esquerra={bnSliderSize ? `calc(${carrilPx(bnSliderSize / 2)} + ${carrilPx(10)})` : undefined}
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
            // Les fletxes fan passar els DIBUIXOS de la franja d'un en un
            // (25/09/2026, ho va demanar l'amo: «una peça per fletxa»).
            onCarouselStep={moureStrip}
          />
        </div>

        {/* MegaStripePanel */}
        <div ref={bandaFranjaRef} style={{
          position: 'relative',
          zIndex: 1,
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
            // tambe el necessita.
            visualOffsetY={visualOffsetYFranjaPagina2({
              ample: typeof window !== 'undefined' ? window.innerWidth : 0,
              alt: typeof window !== 'undefined' ? window.innerHeight : 0,
              isPortraitTablet,
              isLandscapeTablet,
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
                dibuixPx={null}
                gapH={0}
                gapV={0}
                numColumns={16}
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
              /* Les catorze barres de color (8x1), enganxades a dalt amb el
                 mateix marge de sempre. */
              <div style={{ marginTop: '21px' }}>
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
                <div style={{ height: '100%', transform: 'translate(130px, -119.3px) scale(2.059)', transformOrigin: 'right center', '--megaStripeDx': '0px', '--megaStripeDy': '0px', '--hgStripeDrawingExtraDx': '5.46px', '--hgStripeDrawingExtraDy': '-17.55px', '--hgStripeDrawingExtraDyFilaDalt': '-5.26px', '--hgStripeEmptyVeilAlpha': String(VEL_SAMARRETA_BUIDA_ALFA) }}>
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
              <div style={{ width: '90%' }}>
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
              </div>
            )}
          />
        </CapaTaulaVertical>
      ) : null}

    </div>
  );
}
