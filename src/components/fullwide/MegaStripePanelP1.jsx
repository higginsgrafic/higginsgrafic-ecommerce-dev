import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MegaColumn from './MegaColumn.jsx';
import { DibuixFranja, resolDibuixDeCasella, desplacamentsGapFranja } from './DibuixFranja.jsx';
import ClicAreaOverlayP1 from './ClicAreaOverlayP1.jsx';
import { CERCADOR_COLORS } from './CercadorTopBar.jsx';
import { computeStripeTileOverlaySrcs } from '../../utils/resolveStripeTile.js';
import { dibuixosGraella16x4 } from './CercadorTextRow.jsx';
import GraellaDuesFileresPagina1 from './GraellaDuesFileresPagina1.jsx';
import { SelectorQuadratPagina1, FletxesQuadratPagina1, PastillaBlancaPagina1, MIDA_BLOC_DRETA_PAGINA1_PX } from './BlocDretaPagina1.jsx';
import { estilCaixaBlocAlcadaAuto } from './estilsBlocs.js';
import { esComposicioEstretaMegaslide } from '../megaslide/geometriaMegaslide.js';
import { VECTOR_FRANJA_SAMARRETES, VECTOR_FRANJA_SAMARRETES_01, VECTOR_FRANJA_VIEWBOX, VECTOR_FRANJA_VIEWBOX_OBERT, VECTOR_FRANJA_CONTINGUT } from '../../config/vectorFranja.js';
import { desplacamentFranjaEscriptori } from '../../utils/mesuraMegaslide.js';
import { carrilPx, getBeltWidth, escalaMegaslide } from '../../utils/layoutMetrics.js';
import { caminsSiluetes, precarregaSiluetesSamarreta, textSiluetesSamarreta } from './siluetesSamarreta.js';
import useEscalaFranjaCarril from '../../hooks/useEscalaFranjaCarril.js';
import {
  AJUST_FRANJA_ESCRIPTORI_PX,
  PAGINA1_AJUST_FRANJA_PX,
  PAGINA1_GAP_DRETA_PX,
  PAGINA1_TOP_FILERA_PX,
  pagina1AlcadaFileraPx,
  pagina1BlocDretaPx,
  pagina1ColumnaDretaPx,
  DIBUIXOS_FRANJA_DX,
  DIBUIXOS_FRANJA_DY,
  DIBUIXOS_FRANJA_AMPLADA_NATURAL,
  escalaDibuixFranja,
  esBandaEstretaFranja,
  pageLiftPagina1,
  OMBRA_MANIGA_ALFA,
  OMBRA_MANIGA_BLUR_PX,
  OMBRA_MANIGA_OFFSET,
} from '../megaslide/geometriaMegaslide.js';

// La franja de samarretes de la pàgina 1 tendeix a quedar-se uns 10 px més avall
// del que toca: l'alçada del contenidor de la pàgina es calcula a partir del
// bottom mesurat de la franja i el pageLift es calibra amb el selector, de
// manera que el resultat depèn de l'ordre de les mesures. Amb aquest ajust la
// franja torna a la seva posició, i la pàgina 2 el fa servir perquè les dues
// franges quedin a la mateixa alçada.
/** Vegeu `AJUST_FRANJA_ESCRIPTORI_PX` a geometriaMegaslide.js. */
export const FRANJA_AJUST_PX = AJUST_FRANJA_ESCRIPTORI_PX;

/** La mascara de les samarretes BUIDES, a partir del full de siluetes. */
function generaMascaraBuidesDataUrl(text, emptyTileIndices, shirtColor) {
  if (!text) return null;
  try {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    // LA MIDA DEL FITXER, PER ATRIBUT (27/09/2026): el full nou porta
    // `width="100%"` i, com a mascara CSS, un SVG sense mida intrinseca no te
    // proporcio. Vegeu `generaVelDataUrl`.
    const vbP1 = (doc.documentElement.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    if (Number.isFinite(vbP1[2]) && Number.isFinite(vbP1[3])) {
      doc.documentElement.setAttribute('width', String(vbP1[2]));
      doc.documentElement.setAttribute('height', String(vbP1[3]));
    }
    const emptySet = new Set(Array.isArray(emptyTileIndices) ? emptyTileIndices : []);
    // ELS CAMINS DEL FULL, AMB CLASSE O AMB `id="_1".."_14"` (27/09/2026):
    // vegeu `caminsSiluetes`.
    const paths = caminsSiluetes(doc);
    const isWhite = !shirtColor || shirtColor === '#FFFFFF';
    const emptyOpacity = isWhite ? '0.3' : '0.1';
    // UN SOL GRUP PER OPACITAT (27/09/2026): el ROMBE.
    //
    // Les siluetes de cases veines es TREPITGEN (la maniga d'una arriba a la
    // casa del costat). Amb un `fill-opacity` a cada cami, alla on es
    // trepitgen el blanc es composava dos cops i hi quedava un rombe mes clar
    // a la cantonada de la samarreta: aquesta mascara tambe pinta, perque es
    // una mascara CSS sobre el contenidor de la franja. Amb `opacity` al grup,
    // el grup es composa una vegada i el solapament no compta. Es fa per
    // tirades d'igual opacitat per no canviar l'ordre de pintat (l'ultima
    // silueta pintada es la que mana, com als `path` originals).
    const pare = paths.length ? paths[0].parentNode : null;
    let grup = null;
    let valor = null;
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      const op = emptySet.has(i) ? emptyOpacity : '1';
      p.setAttribute('fill', 'white');
      p.removeAttribute('fill-opacity');
      p.removeAttribute('stroke');
      p.removeAttribute('class');
      // EL `style` DEL FULL TAMBE SE'N VA (27/09/2026). El full nou de l'amo
      // porta `style="fill:#0091ff;fill-opacity:0.5"` a cada cami, i el `style`
      // en línia guanya sobre l'atribut `fill`: la mascara quedava al 50 % i la
      // franja sencera es veia mig transparent (ho ha vist en Marc: «totes les
      // samarretes semblen velades»). La mascara ha de ser opaca.
      p.removeAttribute('style');
      if (!pare) continue;
      if (!grup || op !== valor) {
        grup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        grup.setAttribute('fill', 'white');
        grup.setAttribute('opacity', op);
        valor = op;
        pare.appendChild(grup);
      }
      grup.appendChild(p);
    }
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
  // Per canviar de colleccio des de la graella de la pagina 1 (el clic en un
  // dibuix atenuat activa la seva colleccio, com a la pagina 2).
  setActive,
  // LA SUBCALLECCIO D'AUSTEN A LA PAGINA 1 (28/09/2026). Es el MATEIX estat que
  // la pagina 2 (`FullWideSlideHeader`): el clic d'un dibuix hi desa la seva
  // subcolleccio i amb aixo nome's s'encen aquella. Sense, Austen te quatre
  // subcolleccions (Pemberley, Keep Calm, Quotes, Crosswords, Looking For My
  // Darcy) i el clic n'engegava les cinc alhora.
  austenSubcollection = null,
  setAustenSubcollection,
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
  // LA PECA TRIADA DE CADA COLLECCIO (28/09/2026): les necessita el SCROLL de la
  // franja per saber per on va (l'index surt de la peca triada, no d'un
  // comptador propi).
  firstContactSelectedItem,
  humanInsideSelectedItem,
  selectedItemByCollection,
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
  // Els desplaçaments del gap, calculats TOTS DE COP a partir de la llista
  // `picksDibuixFranja` (la imatge de cada una de les catorze caselles).
  // Abans s'acumulaven en una variable mentre es pintaven les caselles, o sigui
  // que el lloc d'un dibuix depenia de l'ordre de pintat; ara cada casella rep
  // el seu numero i les dues franges (i els dos panells) es poden tocar sense
  // moure res. `false` marca una casella que no es pinta: no compta per al gap.
  const picksDibuixFranja = Array.from({ length: 14 }, (_, idx) => {
    if (Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) return false;
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
    const hasPerTileSrc = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
    return resolDibuixDeCasella({
      base, idx, hasPerTileSrc, active, resolvedOverlaySrc,
      humanInsideVariant, firstContactVariant, isPortraitTablet, shirtColor,
    });
  });
  const gapsDibuixFranja = desplacamentsGapFranja(picksDibuixFranja, { isPortraitTablet, calibrationOverrides });
  const emptyShirtMaskUrl = useEmptyShirtMask(emptyTileIndices, shirtColor);
  const pageRootRef = useRef(null);
  const pageLiftRef = useRef(0);
  // La franja s'ha de quedar dins del carril amb les manigues a fora (com a la
  // pagina 2: les dues pagines han de quadrar). Vegeu l'hook.
  const filaFranjaRef = useRef(null);
  // A 1024, LA GRAELLA INTERCALADA UN 25 % MES PETITA I LA FRANJA UN 25 % MES
  // GRAN (02/10/2026). En Marc: «Ara treballarem només a la 1024. Res més s'ha de
  // veure afectat. Redueix la graella intercalada un 25 % i augmenta la stripe un
  // 25 %». Nome's alla: la resta de mides no s'hi toquen. Es calcula aqui dalt
  // perque la franja (l'hook de sota) ja en depen.
  const esAjust1024P1 = typeof window !== 'undefined'
    && window.innerWidth >= 1000 && window.innerWidth <= 1050
    && window.innerWidth >= window.innerHeight;
  // A 1024, LA STRIPE FA EL CARRIL DE LA PAGINA (02/10/2026). En Marc: «Acaba
  // d'alinear la stripe p1 a la mida del segon carril». El segon carril es el de
  // la pagina —`min(939.2px, 100vw - 80px)`, el del header, la hero, el bloc de
  // la dreta i les segones guies verdes— i es el MATEIX calcul que fa l'estil del
  // bloc. Nome's te valor a 1024: a la resta de mides la franja va amb el carril
  // del megaslide, com sempre.
  const ampleCarrilPaginaP1 = esAjust1024P1
    ? Math.min(939.2, window.innerWidth - 80)
    : 0;
  // La franja s'ha de quedar dins del carril amb les manigues a fora (com a la
  // pagina 2: les dues pagines han de quadrar). Vegeu l'hook.
  const { factor: factorCarrilFranjaBase, centre: centreCarrilFranja } = useEscalaFranjaCarril(filaFranjaRef, ajustFranjaCarril, ampleCarrilPaginaP1);
  const [pageLift, setPageLift] = useState(0);
  // EL SCROLL DE LA FRANJA DE LA P1 (28/09/2026). En Marc: «Aplica-li un scroll
  // als dibuixos de la franja. Com que a la franja de p1 nome's es mostra un
  // dibuix cada vegada, la franja canviara tota sencera cada cop».
  //
  // A la p1 cada samarreta ensenya el MATEIX dibuix (el de la peca triada), o
  // sigui que el que ha de fer la rodeta es passar d'un dibuix a un altre: cada
  // pas tria el dibuix seguent i les catorze samarretes canvien alhora. A la p2
  // el que circula es una llista de 64 posicions per les catorze cases
  // (`stripeStripOffset`); alla, doncs, el pas es un gir.
  //
  // TOTS ELS DIBUIXOS DE TOTES LES COLLECCIONS (28/09/2026). En Marc: «L'scroll
  // de la franja p1 funciona amb el criteri de colleccio activa i no ha de ser
  // aixi. A l'scroll hi han de sortir tots els dibuixos de totes les
  // colleccions» i, quan en van sortir 56, «Nome's 56 dibuixos? N'hi ha d'haver
  // 64».
  //
  // Eren 56 perque la clau amb que es demanava el dibuix era l'ETIQUETA de la
  // casella («Cylon '03», «3cube-P0») i el que el resoledor enten es el
  // `stripeItem` de la casella («Cylon 03», «Cube 3 P0»): vuit caselles (les
  // quatre de THE HUMAN INSIDE amb xifra, `Vulcans End` i tres de CUBE) es
  // quedaven pel cami. Ara es fan servir les MATEIXES 64 caselles de la graella
  // (`dibuixosGraella16x4`), que ja porten la seva colleccio, la seva
  // subcolleccio i el seu `stripeItem`, i la clau bona: 7 + 15 + 27 + 10 + 5 =
  // 64, totes amb dibuix de franja.
  //
  // La llista NO depen de la colleccio activa, i per aixo tampoc no mira
  // `resolvedMegaFiltered` (la subcolleccio d'Austen no hi filtra res).
  //
  // El dibuix NO es desa en un estat propi: es tria la PECA del seu lloc
  // (`setSelectedItem...`) i el cami de la imatge surt de `resolvedOverlaySrc`,
  // que es el MATEIX circuit que el clic a la graella. Amb un estat paral·lel hi
  // hauria dues veritats.
  const dibuixosFranja = useMemo(() => {
    const perColleccio = dibuixosGraella16x4().reduce((acc, it) => {
      acc[it.collection] = acc[it.collection] || [];
      acc[it.collection].push(it);
      return acc;
    }, {});
    const tots = [];
    for (const [colleccio, items] of Object.entries(perColleccio)) {
      const variant = colleccio === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
      const claus = items.map((it) => it.stripeItem);
      const srcs = computeStripeTileOverlaySrcs({
        drawable: claus,
        variant,
        active: colleccio,
        displayedShirtColor: shirtColor,
        resolvedOverlaySrc,
        limit: claus.length,
      });
      items.forEach((it, i) => {
        if (srcs?.[i]) tots.push(it);
      });
    }
    return tots;
  }, [humanInsideVariant, firstContactVariant, shirtColor, resolvedOverlaySrc]);
  // L'INDEX surt de la peca TRIADA de la colleccio de cada dibuix, no d'un
  // comptador propi: aixi, en canviar de colleccio no hi ha cap estat que valgui
  // per a una altra llista i no cal cap efecte de reinici.
  const triaDibuixFranja = useCallback((passos) => {
    const n = dibuixosFranja.length;
    if (!n) return;
    const seleccionat = (colleccio) => (colleccio === 'first_contact' ? firstContactSelectedItem
      : colleccio === 'the_human_inside' ? humanInsideSelectedItem
        : (selectedItemByCollection?.[colleccio] ?? null));
    let idx = dibuixosFranja.findIndex((d) => d.collection === active && d.stripeItem === seleccionat(active));
    if (idx < 0) idx = 0;
    const seguent = dibuixosFranja[(((idx + passos) % n) + n) % n];
    if (!seguent) return;
    // Si el dibuix es d'una altra colleccio, tambe s'hi ha de passar: la franja
    // pinta el dibuix de la colleccio ACTIVA.
    if (seguent.collection !== active) setActive?.(seguent.collection);
    if (seguent.collection === 'first_contact') setFirstContactSelectedItem?.(seguent.stripeItem);
    else if (seguent.collection === 'the_human_inside') setHumanInsideSelectedItem?.(seguent.stripeItem);
    else setSelectedItemByCollection?.((prev) => ({ ...prev, [seguent.collection]: seguent.stripeItem }));
  }, [dibuixosFranja, active, firstContactSelectedItem, humanInsideSelectedItem, selectedItemByCollection, setActive, setFirstContactSelectedItem, setHumanInsideSelectedItem, setSelectedItemByCollection]);
  // Els gestos llegeixen la funcio a traves d'un ref: la llista de dibuixos i la
  // peca triada canvien a cada clic, i amb la funcio capturada dins del listener
  // la rodeta es quedaria amb la primera.
  const triaDibuixFranjaRef = useRef(triaDibuixFranja);
  useEffect(() => { triaDibuixFranjaRef.current = triaDibuixFranja; }, [triaDibuixFranja]);
  // EL SCROLL, LLIGAT A L'ELEMENT (28/09/2026). Amb un efecte que mira
  // `filaFranjaRef.current` hi havia un forat: la franja nome's es munta quan
  // `showStripe` es cert, i l'efecte podia haver corregut abans. Amb una funcio
  // de ref, els gestos s'hi enganxen exactament quan l'element apareix.
  const desaGestosFranjaRef = useRef({ el: null, net: null });
  const refGestosFranja = useCallback((el) => {
    const previ = desaGestosFranjaRef.current;
    if (previ.net) previ.net();
    if (!el) {
      desaGestosFranjaRef.current = { el: null, net: null };
      return;
    }
    let ultim = 0;
    const rodeta = (e) => {
      if (!dibuixosFranja.length) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      if (e.timeStamp - ultim < 90) return;
      ultim = e.timeStamp;
      triaDibuixFranjaRef.current(d > 0 ? 1 : -1);
    };
    // El gest d'arrossegar, amb la mateixa forma que la p2.
    let arrossegant = null;
    const baix = (e) => { arrossegant = e.clientX; };
    const mou = (e) => {
      if (arrossegant == null) return;
      const dx = e.clientX - arrossegant;
      if (Math.abs(dx) < 18) return;
      arrossegant = e.clientX;
      triaDibuixFranjaRef.current(dx > 0 ? -1 : 1);
    };
    const aixeca = () => { arrossegant = null; };
    el.addEventListener('wheel', rodeta, { passive: false });
    el.addEventListener('pointerdown', baix);
    el.addEventListener('pointermove', mou);
    el.addEventListener('pointerup', aixeca);
    el.addEventListener('pointercancel', aixeca);
    desaGestosFranjaRef.current = {
      el,
      net: () => {
        el.removeEventListener('wheel', rodeta);
        el.removeEventListener('pointerdown', baix);
        el.removeEventListener('pointermove', mou);
        el.removeEventListener('pointerup', aixeca);
        el.removeEventListener('pointercancel', aixeca);
      },
    };
  }, [dibuixosFranja.length]);
  // Franja estreta (768-1366 en horitzontal): hi ha ajustos propis de 10 px i
  // l'ajust general de la franja no s'hi aplica. La condicio es declarada
  // (`esBandaEstretaFranja`): es la MATEIXA que fa servir la pagina 2.
  const esEstenyFins1366 = typeof window !== 'undefined'
    && esBandaEstretaFranja({ ample: window.innerWidth, alt: window.innerHeight });

  // LA COMPOSICIO DE LA PAGINA 1 A L'ESCRIPTORI (26/09/2026, B2 del bucle): la
  // graella de DUES FILERES intercalades (la MATEIXA peça que la pagina 2,
  // `GraellaDuesFileresPagina1`) a l'esquerra del carril i el bloc de la dreta
  // (fletxes quadrades a dalt, selector quadrat a sota) a la vora dreta.
  //
  // L'amo ho va dir amb totes les xifres: «la graella intercalada ja la tens
  // feta, nome's l'has de duplicar» i «les files han de ser identiques». O
  // sigui que les peces son les de la pagina 2 (`dibuixosGraella16x4`), amb la
  // mida de 45 unitats (`COSTAT_PECA_PAGINA1_PX`) i el carrusel que centra la
  // colleccio activa. Les fletxes paginen aquest carrusel, com a la pagina 2.
  //
  // La malla de nou columnes (`MegaColumn`) NOME'S es queda per a la vista
  // vertical (tauleta), on la graella viu a la taula i el panell va amb
  // `hideGrid`.
  const itemsGraella = useMemo(() => dibuixosGraella16x4(), []);
  // LA FUNCIO DE PAS DEL CARRUSEL, PUBLICADA PER LA GRAELLA (27/09/2026).
  //
  // El bloc de la dreta es FORA de la graella, i fins ara portava un comptador
  // de passos propi (`pageStart` -> `desplacamentPassos`) que la graella
  // desfeia: cada cop que canviava, el muntatge de la base esborrava la base i
  // compensava el gest perque la posicio no fes cap salt, i el pas es
  // cancel·lava. Mesurat: la transformacio del carrusel es quedava sempre a
  // −1018,5 i el clic a la fletxa no movia res.
  //
  // Ara la graella publica aqui el SEU pas (`setDesplacGest`, el mateix que fan
  // servir les fletxes del carrusel i la rodeta) i el bloc el crida: un sol
  // mecanisme i un sol estat.
  // La funcio de pas que publica la graella (vegeu `onStepper`): les fletxes
  // del bloc la criden. Es desa en ESTAT, no en un `ref`, perque els `onClick`
  // dels botons l'han de veure fresca; nome's canvia quan canvia el pas de la
  // graella, o sigui que no provoca renders de mes.
  const [stepperP1, setStepperP1] = useState(null);
  // L'OMBRA DE LA MANIGA DINS DEL BLOC (28/09/2026). En Marc: «Cal posar l'ombra
  // sota la màniga (dins del bloc, com a la p2)». Es el mateix mecanisme que la
  // columna de colleccions de la p2: la silueta de l'ultima casa de la franja
  // (difosa i negra al 25 %) pintada a la caixa de la franja, que queda a dins
  // del bloc perque el bloc encavalca la franja 18 px. El bloc la retalla
  // (`overflow: hidden`).
  const blocDretaRef = useRef(null);
  const [mascaraManigaP1, setMascaraManigaP1] = useState(null);
  const [ombraManigaP1, setOmbraManigaP1] = useState(null);
  useEffect(() => {
    let viu = true;
    precarregaSiluetesSamarreta()
      .then((text) => {
        if (!viu || !text) return;
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const camins = caminsSiluetes(doc);
        const ultima = camins[13];
        if (!ultima) return;
        const vb = (doc.documentElement.getAttribute('viewBox') || '0 0 2866 307').trim().split(/[\s,]+/);
        const w = Number(vb[2]) || 2866;
        const h = Number(vb[3]) || 307;
        const tr = ultima.getAttribute('transform') || '';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
          + `<path d="${ultima.getAttribute('d')}"${tr ? ` transform="${tr}"` : ''} fill="#FFFFFF"/></svg>`;
        setMascaraManigaP1(`data:image/svg+xml,${encodeURIComponent(svg)}`);
      })
      .catch(() => {});
    return () => { viu = false; };
  }, []);
  // L'alcada del bloc: el bottom de la franja respecte del seu top.
  const alcadaBlocP1 = ombraManigaP1 ? +(ombraManigaP1.top + ombraManigaP1.height).toFixed(1) : null;
  useLayoutEffect(() => {
    const bloc = blocDretaRef.current;
    if (!bloc) return undefined;
    const mesura = () => {
      const franja = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
      if (!franja) return;
      const b = bloc.getBoundingClientRect();
      const f = franja.getBoundingClientRect();
      setOmbraManigaP1((prev) => {
        const nou = {
          left: +(f.left - b.left).toFixed(1),
          top: +(f.top - b.top).toFixed(1),
          width: +f.width.toFixed(1),
          height: +f.height.toFixed(1),
        };
        if (prev && Math.abs(prev.left - nou.left) < 0.5 && Math.abs(prev.top - nou.top) < 0.5
          && Math.abs(prev.width - nou.width) < 0.5 && Math.abs(prev.height - nou.height) < 0.5) return prev;
        return nou;
      });
    };
    mesura();
    const t1 = window.setTimeout(mesura, 400);
    window.addEventListener('resize', mesura);
    return () => { window.clearTimeout(t1); window.removeEventListener('resize', mesura); };
  }, [active]);
  // L'ESCALA DEL CARRIL, EN NUMERO. La graella nova la necessita per calcular
  // el pas i l'alcada del carrusel (operacions matematiques: amb la cadena
  // `calc(...)` que torna `carrilPx` el carrusel naixia amb alcada 0). A la
  // vista vertical l'escala es 1, com el senyal de la casa.
  // LA COMPOSICIO ESTRETA (1024-1366): nome s alla la caixa del bloc va sense
  // fons, sense contorn i sense ombra; a 1920/1440 es la de sempre («Recupera el
  // contorn a les versions 1920/1440»).
  const esComposicioEstretaP1 = esComposicioEstretaMegaslide({
    ample: typeof window !== 'undefined' ? window.innerWidth : 0,
    isLandscapeTablet,
  });
  // LA FRANJA, FINS A L'AMPLADA DEL CARRIL DE LA PAGINA (02/10/2026). En Marc:
  // «Augmenta la stripe fins que encaixi a l'amplada del carril» i, tot seguit,
  // «Acaba d'alinear la stripe p1 a la mida del segon carril»: a 1024 el carril
  // de la pagina fa 939,2 px (el mateix del header, de la hero i del bloc de la
  // dreta) i la franja l'ha de fer EXACTAMENT, tambe de posicio. El factor el
  // calcula l'hook amb `ampleCarrilPaginaP1` (que es qui sap que alla l'objectiu
  // no es el carril del megaslide); aqui ja no hi ha cap retoc a ma. Abans hi
  // havia un `* 1.4834` («939 / 633») que deixava la franja a 938,9 i 7,5 px a
  // l'esquerra del carril de la pagina: els 939,2 surten de la regla, no d'un
  // numero calibrat.
  const factorCarrilFranja = factorCarrilFranjaBase;
  const escalaCarril = (isPortraitTablet || isLandscapeTablet)
    ? 1
    : escalaMegaslide(getBeltWidth(typeof window !== 'undefined' ? window.innerWidth : 1920));
  // EL QUADRAT DE LES FLETXES I EL SELECTOR, AMB LA GRAELLA (02/10/2026). En
  // Marc: «Redueix el quadrat fletxes/selector juntament amb la graella»: a 1024
  // el bloc de la dreta tambe va un 25 % mes petit.
  //
  // AQUESTS TRES NUMEROS ES CALCULEN AQUI DALT (02/10/2026) perque el bucle
  // d'alineacio del bloc (el `useLayoutEffect` de sota) ja fa servir el
  // `blocDretaPx`: declarats despres, el lint hi veia un us abans de la
  // declaracio.
  const escalaBlocDreta = esAjust1024P1 ? 0.75 : 1;
  const blocDretaPx = pagina1BlocDretaPx(escalaCarril) * escalaBlocDreta;
  const columnaDretaPx = pagina1ColumnaDretaPx(escalaCarril) * escalaBlocDreta;
  // EL BLOC DE LA P1: UN QUADRAT, MIG PER A LES FLETXES I MIG PER AL SELECTOR
  // (02/10/2026).
  //
  // En Marc: «Fes que el selector i les fletxes comparteixin quadrat» i tot
  // seguit «Fes les fletxes en mig quadrat i el selector a l'altre mig quadrat».
  // A 1920 el bloc fa 128,7 x 256,6 (dues botoneres quadrades apilades); a
  // 1024-1366 l'alcada sortia del bottom de la franja (223,6) i cada botonera
  // quedava 128,7 x 111,8, mes baixa que ampla. Ara el bloc fa EL SEU QUADRAT
  // (costat x costat) i les dues botoneres se'l reparteixen: mig quadrat
  // cadascuna (128,7 x 64,35).
  //
  // Es mesura l'amplada del bloc i se li dona la mateixa alcada.
  const [alcadaBlocEstretaP1, setAlcadaBlocEstretaP1] = useState(null);
  const prevAjustRef = useRef(null);
  useLayoutEffect(() => {
    if (!esComposicioEstretaP1) return undefined;
    let frame = 0;
    const mesura = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // El bloc, per consulta i no per la `ref`: la ref es declara mes avall i
        // des d'aquí no s'hi pot arribar (`Cannot access variable before it is
        // declared`).
        const bloc = document.querySelector('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]');
        if (!bloc) return;
        const costat = esAjust1024P1
          ? +blocDretaPx.toFixed(1)
          : +bloc.getBoundingClientRect().width.toFixed(1);
        if (!(costat > 0)) return;
        // A 1024 el bloc fa una fila d'un sol quadrat d'alcada.
        const alcada = costat;
        // I LA MATEIXA Y QUE LA DE LA P2 (02/10/2026). En Marc: «No es com la p2».
        // La franja de la p2 la baixa el bucle d'alineacio (que centra el bloc de
        // la p2 al megaslide) i la de la p1 no en te: a 1024-1366 quedava 18 px
        // mes amunt. El desplacament es ABSOLUT (el que ja tenim mes la diferencia
        // que queda) perque el bucle no oscil·li.
        const vp2 = document.querySelector('[data-mega-page-viewport="2"]');
        const f2 = vp2?.querySelector('[data-stripe-visual-content="2"]');
        const f1 = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
        if (!f2 || !f1) return;
        const dy = +(f2.getBoundingClientRect().top - f1.getBoundingClientRect().top).toFixed(1);
        setAlcadaBlocEstretaP1((prev) => {
          prevAjustRef.current = prev;
          const dyAplicat = prev?.dy ?? 0;
          const nouDy = +(dyAplicat + dy).toFixed(1);
          // EL QUADRAT, A LA DRETA DEL CARRIL DE LA PAGINA (02/10/2026). En Marc:
          // «Alinea el quadrat a la dreta del carril» i, en dir-li que el carril
          // de la pagina es mes ample que el del megaslide, «Sí».
          const amplePagina = Math.min(939.2, window.innerWidth - 80);
          const esquerraPagina = (window.innerWidth - amplePagina) / 2;
          // El desplacament es ABSOLUT (el que ja tenim mes el que falta): la
          // mesura del bloc ja porta el `transform` aplicat i, sense descomptar-lo,
          // el bucle anava derivant i el bloc marxava de la pantalla.
          const dxAplicat = prevAjustRef.current?.dx ?? 0;
          const dx = Math.round(dxAplicat + (esquerraPagina - bloc.getBoundingClientRect().left));
          if (prev
            && Math.abs(prev.alcada - alcada) < 0.5
            && Math.abs(prev.dy - nouDy) < 0.5
            && Math.abs(prev.dx - dx) < 0.5) return prev;
          return { alcada, dy: nouDy, dx };
        });
      });
    };
    mesura();
    const t1 = window.setTimeout(mesura, 400);
    const t2 = window.setTimeout(mesura, 1500);
    window.addEventListener('resize', mesura);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', mesura);
    };
  }, [esComposicioEstretaP1, active, esAjust1024P1, blocDretaPx]);
  // ELS NUMEROS DE LA COMPOSICIO VIUEN A `geometriaMegaslide.js` (B4): aqui
  // nome's es passen a px amb l'escala del carril.
  // (L'`escalaBlocDreta`, el `blocDretaPx` i el `columnaDretaPx` es calculen
  // MES AMUNT, abans del bucle d'alineacio: aquell efecte els fa servir i, si
  // fossin aqui, el lint hi veu un us abans de la declaracio.)
  const alcadaFileraPx = pagina1AlcadaFileraPx(escalaCarril);
  const gapDretaPx = PAGINA1_GAP_DRETA_PX * escalaCarril;
  // EL TOP DE LA FILERA, EN PX (mesurat: posa la filera de dalt de la graella
  // al centre de la cel·la BLANC del selector).
  const topFileraPx = PAGINA1_TOP_FILERA_PX * escalaCarril;
  // LA FRANJA PUJA EL QUE LA FILERA NO OCUPA. La seva posicio ve del flux (el
  // coixi de la filera del panell), que estava calibrat per a la malla vella de
  // nou columnes: amb aquest descompte la franja de la p1 cau a la mateixa
  // alcada que la de la p2 (mesurat a 1920: 242,1 contra 241,5).
  const ajustFranjaPx = PAGINA1_AJUST_FRANJA_PX * escalaCarril;
  // LA CASELLA DE LA PASTILLA DEL SELECTOR (28/09/2026). La pastilla blanca ja
  // no viu dins del selector: viu a la CAPA DE LA CAIXA, per sota de l'ombra de
  // la maniga (vegeu `PastillaBlancaPagina1` i el bloc de la dreta, aqui sota).
  // Els numeros son els MATEIXOS que els del selector (`ORDRE`, `slotPct` i el
  // coixi de 5 px de `sliderInset`), i tambe la caiguda per defecte a COLOR.
  const ORDRE_PASTILLA_P1 = ['white', 'color', 'black'];
  const variantPastillaP1 = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
  const clauPastillaP1 = ORDRE_PASTILLA_P1.includes(variantPastillaP1) ? variantPastillaP1 : 'color';
  const topPastillaP1Pct = (ORDRE_PASTILLA_P1.indexOf(clauPastillaP1) * 100) / ORDRE_PASTILLA_P1.length;

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
      // panell va desaparèixer. La finestra hi entra perque l'ajust de les
      // files nome's va a l'escriptori (`esEscriptoriPagina1`).
      const next = pageLiftPagina1({
        ample: typeof window !== 'undefined' ? window.innerWidth : 0,
        alt: typeof window !== 'undefined' ? window.innerHeight : 0,
        isPortraitTablet,
        isLandscapeTablet,
      });
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

  // LA CAPA DIFOSA DE L'OMBRA DE LA MANIGA (02/10/2026). Es el fons negre difós
  // retallat per la silueta de l'ultima casa del full (`mascaraManigaP1`); viu
  // dins d'un embolcall posicionat, que es qui mana on cau. Es la MATEIXA als
  // dos llocs on es munta: la capa de la caixa del bloc a la composicio ampla
  // (l'ombra hi queda retallada pel bloc) i la peça del selector a 1024 (que es
  // qui la retalla). En Marc: «que l'ombra de la maniga vagi amb la peça del
  // selector, que es on toca».
  const capaDifosaOmbraManigaP1 = (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: `rgba(0, 0, 0, ${OMBRA_MANIGA_ALFA})`,
      WebkitMaskImage: `url("${mascaraManigaP1}")`,
      maskImage: `url("${mascaraManigaP1}")`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: '103% 100%',
      maskSize: '103% 100%',
      WebkitMaskPosition: '50% 0',
      maskPosition: '50% 0',
    }} />
  );

  return (
    <div
      ref={pageRootRef}
      className="w-full shrink-0"
      style={{ transform: (!isPortraitTablet && pageLift > 0) ? `translateY(-${pageLift}px)` : undefined }}
    >
      {!hideGrid || reserveGridSpace ? (
        <div
          // SENSE `z-10` (28/09/2026). La filera (la graella i el bloc de la dreta) anava
          // a zIndex 10 i per aixo la caixa del bloc tapava la maniga de la franja:
          // tota la filera pintava per damunt. En Marc: «Es veu la caixa per sobre».
          // Sense capa propia, la franja (que ve DESPRES al DOM) hi pinta per damunt,
          // com a la p2.
          className="relative grid grid-cols-1 gap-10"
          style={{
            // LA GRAELLA DE DUES FILERES I EL BLOC DE LA DRETA (26/09/2026,
            // B2). A l'escriptori i a la tauleta apaisada la composicio es:
            //
            //   [ graella ................. ] 10 [ selector ]
            //                                     [ fletxes  ]
            //   [ franja de samarretes (amplada del carril) ]
            //
            // La graella arrenca a la vora esquerra del carril (x381) i el bloc
            // de la dreta acaba a la dreta (x1524). La feina la fan
            // `GraellaDuesFileresPagina1` (la MATEIXA graella de la pagina 2,
            // amb la peça de 45 unitats) i `BlocDretaPagina1` (selector
            // quadrat + fletxes quadrades).
            //
            // A la vista VERTICAL (tauleta vertical) es queda la malla de nou
            // columnes de sempre: alla la graella viu a la taula.
            transform: isPortraitTablet ? 'scale(var(--hgGridFitScale, 0.94))' : undefined,
            transformOrigin: 'top center',
            visibility: reserveGridSpace ? 'hidden' : undefined,
            pointerEvents: reserveGridSpace ? 'none' : undefined,
          }}
          aria-hidden={reserveGridSpace ? true : undefined}
        >
          {isPortraitTablet ? (resolvedMega[active] || []).map((col, idx) => (
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
          )) : (
            <div
              data-filera-p1="1"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
                marginTop: `${topFileraPx}px`,
              }}
            >
              <div style={{ flex: '1 1 0%', minWidth: 0, marginRight: `${gapDretaPx}px` }}>
                <GraellaDuesFileresPagina1
                  items={itemsGraella}
                  onStepper={setStepperP1}
                  activeCollection={active}
                  activeSubcollection={austenSubcollection}
                  escala={esAjust1024P1 ? escalaCarril * 0.75 : escalaCarril}
                  alcadaCarruselPx={alcadaFileraPx}
                  midaSelector={MIDA_BLOC_DRETA_PAGINA1_PX}
                  onSelectGroup={(collection, subcollection, firstStripeItem) => {
                    // EL CLIC TRIa EL DIBUIX I EL MOSTRA (28/09/2026). En Marc:
                    // «El clic obre la pdp, pero no mostra el dibuix a la franja
                    // ni a la graella»: el clic ha de deixar triat aquell dibuix
                    // (amb la seva colleccio activa, perque la graella i la franja
                    // l'ensenyin) i NO ha d'obrir la fitxa del producte. La PDP
                    // s'obre des de les samarretes de la franja, com a la p2.
                    if (collection !== active) setActive?.(collection);
                    // LA SUBCALLECCIO, DESADA AL CLIC (28/09/2026). En Marc: «Quan
                    // cliques un dibuix d'Austen, activa totes les col·leccions
                    // d'Austen»: la graella passava `subcollection` i algu no el
                    // desava enlloc. Es el MATEIX cami que la pagina 2 (vegeu
                    // `onSelectGroup` de `MegaslidePagina2`).
                    if (collection === 'austen') setAustenSubcollection?.(subcollection || null);
                    else setAustenSubcollection?.(null);
                    setStripeOverlayOverrideActive(false);
                    if (firstStripeItem) {
                      if (collection === 'first_contact') setFirstContactSelectedItem(firstStripeItem);
                      else if (collection === 'the_human_inside') setHumanInsideSelectedItem(firstStripeItem);
                      else setSelectedItemByCollection((prev) => ({ ...prev, [collection]: firstStripeItem }));
                    }
                  }}
                />
              </div>
              {/* EL BLOC DE LA DRETA, COM EL DE LA PAGINA 2 (28/09/2026).

                  En Marc: «Fes el bloc de la mateixa mida del bloc de la p2 i amb
                  el selector (tambe de la mateixa mida que el p2) i les fletxes
                  centrades al quadrat que et quedarà per haver redimensionat el
                  selector» i «i les fletxes sota del selector, no al costat».

                  El bloc fa `blocDretaPx` d'ample (59,5 px a 1920, la meitat del
                  contenidor del selector de la p2): a dalt hi va el quadrat de
                  les fletxes (59,5 x 59,5) i a sota el selector (59,5 x 119, la
                  forma `rectangle` de la p2), tots dos a la DRETA. La caixa i
                  l'ombra les duu el bloc sencer (vegeu
                  `ESTIL_CAIXA_BLOC_ALCADA_AUTO`). */}
              <div
                ref={blocDretaRef}
                data-bloc-dreta-p1="1"
                style={{
                  flex: '0 0 auto',
                  width: esAjust1024P1 ? 'min(939.2px, calc(100vw - 80px))' : `${blocDretaPx}px`,
                  minWidth: 0,
                  position: 'relative',
                  // A 1024, el bloc es desplac, a la dreta del carril de la pagina.
                  ...((esAjust1024P1 && alcadaBlocEstretaP1) ? { transform: `translateX(${alcadaBlocEstretaP1.dx}px)` } : null),
                  // EL BLOC, SENSE CAPA PROPRIA, PER SOTA DE LA FRANJA (28/09/2026).
                  //
                  // En Marc: «La franja continua per sota del bloc» i «Encara no.
                  // Queda per sobre». El bloc i la franja son dins del MATEIX
                  // contenidor, i el contingut de la franja es DESPRES del bloc al
                  // DOM: sense capa propia (`zIndex: auto`) la franja hi pinta per
                  // damunt i la samarreta tapa la caixa. Amb `zIndex: 3` (el de la
                  // columna de la p2) el bloc guanyava i tapava la maniga: la
                  // columna de la p2 pot anar a 3 perque alla la franja te una capa
                  // propia (4) dins del seu propi apilat.
                  // EL BLOC SON DUES BOTONERES QUADRADES APILADES (28/09/2026).
                  // En Marc: «El bloc es un grup de tres botons + un grup de 2
                  // botons, tots en vertical [...] son dues botoneres quadrades
                  // apilades l'una sobre l'altra». Cada quadrat fa el costat del bloc
                  // (128,9 a 1920) i el `marginBottom` negatiu compensa el que
                  // creix, perque la filera no s'allargui i la franja no es mogui.
                  // EL SELECTOR I LES FLETXES, QUADRATS (02/10/2026). En Marc:
                  // «Fes que el selector i les fletxes comparteixin quadrat». A
                  // 1920 el bloc ja fa els dos quadrats (256,6 = 2 x 128,3); a
                  // 1024-1366 l'alcada sortia del bottom de la franja (223,6) i
                  // cada botonera quedava 128,7 x 111,8, mes baixa que ampla.
                  // Amb l'ajust el bloc fa els DOS quadrats sencers i el
                  // `marginBottom` negatiu compensa el que creix, perque la
                  // filera no s'allargui i la franja no es mogui.
                  ...((((alcadaBlocEstretaP1?.alcada ?? alcadaBlocP1)) != null) ? {
                    height: `${(alcadaBlocEstretaP1?.alcada ?? alcadaBlocP1)}px`,
                    marginBottom: `${-(((alcadaBlocEstretaP1?.alcada ?? alcadaBlocP1)) - columnaDretaPx * 3)}px`,
                  } : null),
                  // LES FLETXES A DALT I EL SELECTOR A SOTA, A LA DRETA (28/09/2026).
                  // El bloc es ample com la columna de la p2 (130 de disseny) perque
                  // la maniga de l'ultima samarreta hi arribi; el selector i les
                  // fletxes van a la dreta i el buit de l'esquerra es on cau l'ombra.
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                }}
              >
                {/* LA CAIXA (LA VORA I L'OMBRA DE LA MANIGA), PER SOTA DE LA
                    FRANJA. Te una capa propia a zIndex 0: es la que ha de quedar
                    sota la samarreta perque l'ombra no hi caigui a sobre. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    ...estilCaixaBlocAlcadaAuto(esComposicioEstretaP1),
                    // A 1024 la caixa gran no pinta: cada peca porta la seva.
                    ...(esAjust1024P1 ? { backgroundColor: 'transparent', boxShadow: 'none' } : null),
                    // EL FONS DEL QUADRAT DEL SELECTOR I LES FLETXES (02/10/2026).
                    // En Marc: «Posa-li el fons al quadrat amb el selector i les
                    // fletxes». A la composicio estreta la caixa va sense fons
                    // (nomes radi i retall), i el quadrat nou —el selector i les
                    // fletxes en dues columnes— quedava invisible sobre el paper:
                    // se li posa el mateix fons que a la resta de caixes. Sense
                    // vora ni ombra, que allo no ho ha demanat.
                    //
                    // A 1024, AIXÒ NO ES PINTA (02/10/2026). En Marc: «Pero ara hi
                    // ha les fletxes i els enllacos del selector dins de la
                    // mateixa franja i jo els vull separats». A 1024 el bloc fa
                    // TOT el carril (939,2) i te les dues peces a les vorades: el
                    // fons d'aquesta capa les unia amb una franja comuna de 939 px.
                    // Alla el fons el porten les DUES PECES, cadascuna a la seva
                    // caixa (vegeu els quadrats de sota): la capa del bloc nome's
                    // queda el radi i el retall.
                    ...((esComposicioEstretaP1 && !esAjust1024P1) ? { backgroundColor: 'hsl(var(--grey-paper-soft))' } : null),
                  }}
                >
                {/* LA PASTILLA BLANCA DEL SELECTOR, PER SOTA DE L'OMBRA (28/09/2026).
                    En Marc: «A la p2, la pastilla blanca passa per sota de
                    l'ombra, no nome's de la samarreta. A la p1 has aconseguit
                    posar la pastilla per sota de la samarreta, pero no per sota
                    de l'ombra» i «Et puc suggerir que imitis el que has fet a la
                    p2?».

                    A la p2 la caixa blanca de la colleccio activa es `static` i
                    el seu fons es pinta ABANS que l'ombra (que es `absolute` amb
                    `z-index: 0`): l'ombra hi cau a sobre. Aqui es fa el mateix
                    dins d'aquesta capa: la pastilla es posicionada i SENSE
                    `z-index`, i va ABANS de l'ombra al DOM, o sigui que l'ombra
                    guanya i li passa per damunt.

                    L'embolcall reserva el REQUADRE DEL SELECTOR: la meitat de
                    baix del bloc, que es exactament on cau el selector quadrat
                    (les dues botoneres son `flex: 1 1 50%`). Amb els MATEIXOS
                    numeros de dins del selector, la pastilla cau al mateix lloc
                    de sempre (mesurat a 1920: x1400,3..1519 · y259..291,8).

                    Els BOTONS no es toquen: son a la capa de dalt (`zIndex: 6`),
                    que es la que impedeix que la franja se'ls mengi els clics.
                    Purament decorativa (`pointerEvents: none`). */}
                <div
                  aria-hidden="true"
                  data-pastilla-p1="1"
                  style={{
                    position: 'absolute',
                    // LA PASTILLA VA AMB EL SELECTOR: a la dreta (meitat dreta) a
                    // la composicio estreta, i a sota (meitat de baix) a la resta.
                    ...(esAjust1024P1
                      ? { right: 0, top: 0, bottom: 0, width: `${blocDretaPx}px` }
                      : (esComposicioEstretaP1
                        ? { right: 0, top: 0, bottom: 0, width: '50%' }
                        : { left: 0, right: 0, bottom: 0, height: '50%' })),
                    pointerEvents: 'none',
                  }}
                >
                  <PastillaBlancaPagina1 topPct={topPastillaP1Pct} />
                </div>
                {!esAjust1024P1 && ombraManigaP1 && mascaraManigaP1 ? (
                  <div
                    data-maniga-ombra-p1="1"
                    style={{
                      position: 'absolute',
                      left: `${ombraManigaP1.left}px`,
                      top: `${ombraManigaP1.top}px`,
                      width: `${ombraManigaP1.width}px`,
                      height: `${ombraManigaP1.height}px`,
                      pointerEvents: 'none',
                      zIndex: 0,
                      // L'OMBRA DE LA MANIGA, REFORÇADA (28/09/2026). En Marc: «A
                      // la maniga dreta de la p1, dona-li una miqueta mes de
                      // forca». Els numeros son declarats
                      // (`OMBRA_MANIGA_*`, geometriaMegaslide.js) i els MATEIXOS
                      // que la columna de la p2.
                      filter: `blur(${OMBRA_MANIGA_BLUR_PX}px)`,
                      transform: `translate(${OMBRA_MANIGA_OFFSET.x}px, ${OMBRA_MANIGA_OFFSET.y}px)`,
                    }}
                  >
                    {capaDifosaOmbraManigaP1}
                  </div>
                ) : null}
                </div>
                {/* ELS BOTONS, EN UNA CAPA PROPIA PER DAMUNT DE LA FRANJA.
                    DUES BOTONERES QUADRADES APILADES: el quadrat de les fletxes a
                    DALT i els tres botons del selector a SOTA (28/09/2026, ho va
                    demanar en Marc: «Intercanvia les posicions del selector i les
                    fletxes»). Es van intercanviar les DUES PECES de debo, no
                    nome's el que s'hi pinta: el quadrat de les fletxes passa de
                    la meitat de baix a la de dalt. Els dos quadrats fan el
                    MATEIX (128,7 x 128,3 a 1920), o sigui que l'alcada del bloc,
                    la de la filera i la de la franja no es mouen.
                    PER QUE UNA CAPA A PART (28/09/2026). En Marc: «Alguna cosa
                    captura els clics del selector». La franja va a zIndex 4 i la
                    SEVA capa (amb el coixi de -40 px) arriba fins a x1524, o sigui
                    que cobreix tot el bloc; els seus fills (el vel a z10 i el
                    dibuix a z12) apilen DINS seu i guanyen a qualsevol zIndex que
                    es posi al bloc. Amb les fletxes a baix no es notava (queien
                    per sota del top de la franja, 226,6), pero amb el selector a
                    la meitat de baix la franja se li menjava els clics.
                    Amb la caixa i els botons en DUES capes, cada cosa va on toca:
                    la caixa (vora + ombra) per sota de la samarreta, com sempre, i
                    els botons per damunt (zIndex 6, un punt mes que el 4 de la
                    franja). */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 6,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  // EN DUES COLUMNES NOME'S A LA COMPOSICIO ESTRETA (02/10/2026).
                  // En Marc: «Fes les fletxes en mig quadrat i el selector a
                  // l'altre mig quadrat», «En dues columnes» i, en veure que allo
                  // tambe passava a 1920/1440, «A les vistes 1920 i 1440 el
                  // selector i les fletxes han d'estar una sota l'altra ocupant tot
                  // el seu quadrat»: a 1024-1366 van en dues columnes i a la resta
                  // apilats, com sempre.
                  // A 1024, DOS QUADRATS APILATS (02/10/2026). En Marc: «Divideix el
                  // quadrat de les fletxes/selector. Fes una mitosi i converteix-lo
                  // en dos quadrats de la mateixa mida»: el bloc fa dos costats
                  // d'alcada i cada botonera un quadrat sencer. A la resta de la
                  // composicio estreta es queden en dues columnes.
                  // EL QUADRAT CONJUNT (02/10/2026). En Marc: «Reverteix fins al
                  // quadrat conjunt»: un sol quadrat amb les fletxes i el selector
                  // a dins (dues columnes a la composicio estreta, apilats a la
                  // resta), com estava abans de la mitosi.
                  // DUES PECES DIFERENTS (02/10/2026). En Marc: «Pots separar les
                  // fletxes del selector en dues peces diferents?»: a 1024 son DOS
                  // quadrats de 96,5 independents, el de les fletxes a la vora
                  // esquerra del carril de la pagina i el del selector a la dreta,
                  // i cadascun porta la seva caixa (fons, radi i ombra). A la
                  // resta, el quadrat conjunt de sempre.
                  flexDirection: (esAjust1024P1 || esComposicioEstretaP1) ? 'row' : 'column',
                  justifyContent: esAjust1024P1 ? 'space-between' : 'flex-end',
                  alignItems: (esAjust1024P1 || esComposicioEstretaP1) ? 'stretch' : 'flex-end',
                }}>
                {/* EL QUADRAT DE DALT: els dos botons de les fletxes. */}
                <div style={{
                  position: 'relative',
                  flex: esAjust1024P1 ? '0 0 auto' : '1 1 50%',
                  minHeight: 0,
                  width: esAjust1024P1 ? `${blocDretaPx}px` : '100%',
                  height: esAjust1024P1 ? `${blocDretaPx}px` : undefined,
                  // LA CAIXA DE CADA PECA: fons, radi i ombra propis.
                  ...(esAjust1024P1
                    ? {
                      backgroundColor: 'hsl(var(--grey-paper-soft))',
                      borderRadius: '5.3px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                    }
                    : null),
                }}>
                <FletxesQuadratPagina1
                  omple
                  // LA DIRECCIO DE LES FLETXES, INVERTIDA (28/09/2026). En Marc: «El
                  // moviment de la graella amb les fletxes ha de ser al reves». El
                  // carrusel es pinta amb `translateX(-desplacEf)`, o sigui que
                  // SUMAR a `desplacGest` mou les peces cap a l'ESQUERRA: amb la
                  // fletxa de la DRETA («Següent») la graella ha d'AVANÇAR (cap a
                  // l'esquerra) i amb la de l'ESQUERRA («Anterior») ha de RECULAR.
                  // Es el MATEIX criteri que la botonera de la p2 (vegeu
                  // CercadorTextRow), on la fletxa de dalt avança i la de baix
                  // recula; alla tambe es va haver d'invertir.
                  onPrev={() => stepperP1?.(1)}
                  onNext={() => stepperP1?.(-1)}
                />
                </div>
                {/* EL QUADRAT DE SOTA: els tres botons del selector. */}
                <div style={{
                  position: 'relative',
                  flex: esAjust1024P1 ? '0 0 auto' : '1 1 50%',
                  minHeight: 0,
                  width: esAjust1024P1 ? `${blocDretaPx}px` : '100%',
                  height: esAjust1024P1 ? `${blocDretaPx}px` : undefined,
                  // LA CAIXA DE CADA PECA: fons, radi i ombra propis.
                  ...(esAjust1024P1
                    ? {
                      backgroundColor: 'hsl(var(--grey-paper-soft))',
                      borderRadius: '5.3px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                    }
                    : null),
                }}>
                {/* L'OMBRA DE LA MANIGA, AMB LA PEÇA DEL SELECTOR (02/10/2026).
                    En Marc: «Pero ara hi ha les fletxes i els enllacos del
                    selector dins de la mateixa franja i jo els vull separats» i
                    «que l'ombra de la maniga vagi amb la peça del selector, que
                    es on toca». A 1024 l'ombra NO es munta a la capa de la caixa
                    del bloc (una capa de 939 px que hi pintava una franja
                    comuna): es munta AQUI, dins de la peça del selector, i es la
                    mateixa peça qui la retalla (`overflow: hidden`). Com que la
                    mesura (`ombraManigaP1`) es fa contra el bloc, se li
                    descompta el que la peça te a la seva esquerra (el bloc menys
                    la peça: la peça va a la vora dreta). */}
                {esAjust1024P1 && ombraManigaP1 && mascaraManigaP1 ? (
                  <div
                    data-maniga-ombra-p1="1"
                    style={{
                      position: 'absolute',
                      left: `${ombraManigaP1.left - (ampleCarrilPaginaP1 - blocDretaPx)}px`,
                      top: `${ombraManigaP1.top}px`,
                      width: `${ombraManigaP1.width}px`,
                      height: `${ombraManigaP1.height}px`,
                      pointerEvents: 'none',
                      zIndex: 0,
                      // Els MATEIXOS numeros declarats que la columna de la p2
                      // (`OMBRA_MANIGA_*`, geometriaMegaslide.js).
                      filter: `blur(${OMBRA_MANIGA_BLUR_PX}px)`,
                      transform: `translate(${OMBRA_MANIGA_OFFSET.x}px, ${OMBRA_MANIGA_OFFSET.y}px)`,
                    }}
                  >
                    {capaDifosaOmbraManigaP1}
                  </div>
                ) : null}
                <SelectorQuadratPagina1
                  dinsBloc
                  omple
                  format="square"
                  // LA PASTILLA LA PINTA LA CAPA DE LA CAIXA (28/09/2026), perque
                  // ha de quedar per sota de l'ombra de la maniga. Aqui nome's
                  // queden els tres botons i el seu text, que han de seguir per
                  // damunt de la franja.
                  mostraPastilla={false}
                  showWhite={stripeVariantVisibility?.white !== false}
                  showBlack={stripeVariantVisibility?.black !== false}
                  showMulti={stripeVariantVisibility?.color !== false}
                  selectedVariant={active === 'the_human_inside' ? humanInsideVariant : firstContactVariant}
                  onWhite={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('white'); }}
                  onBlack={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('black'); }}
                  onMulti={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('color'); }}
                />
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {showStripe ? (
        <div
          // LA FRANJA PER DAMUNT DEL BLOC DE LA DRETA (28/09/2026). En Marc:
          // «L'ombra de la maniga ha d'estar sota la maniga, no a sobre». El bloc
          // porta dins l'ombra (la silueta de l'ultima casa, difosa) i, si el
          // bloc va per damunt de la franja, l'ombra cau SOBRE la samarreta. Amb
          // la franja a zIndex 4 (el MATEIX que a la p2), la samarreta tapa l'ombra i
          // nome's se'n veu la part que cau dins del bloc, com a la pagina 2 (alla la franja es a
          // zIndex 4 i la columna a 3).
          className="relative"
          style={{
            // LA FRANJA, PER DAMUNT DEL BLOC (zIndex 4, com a la p2).
            zIndex: 4,
            // A la franja estreta (768-1366) la pàgina ja té els seus propis
            // ajustos de 10 px i l'ajust general no s'hi ha d'aplicar.
            //
            // A LA VISTA VERTICAL TAMPOCO (28/09/2026). `ajustFranjaPx` es un
            // calibratge d'ESCRIPTORI: son els 73,4 px que la franja de la p1
            // puja per caure a la mateixa alcada que la de la p2 a 1920. A la
            // vertical la franja viu dins d'un embolcall escalat (2,177) i allo
            // es converteix en 73,4 x 2,177 = 159,8 px: la franja se n'anava
            // 160 px enlaire i trepitjava la filera de la graella de dibuixos.
            // Es el que feia que la p1 vertical no quadres amb la referencia
            // bona del 23/09, on aquest ajust encara no existia.
            marginTop: compactLandscape
              ? '16px'
              : (isPortraitTablet ? `${stripeRowPadPx}px` : `calc(${stripeRowPadPx}px - ${ajustFranjaPx}px)`),
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
              ref={(el) => {
                filaFranjaRef.current = el;
                refGestosFranja(el);
              }}
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
                // ENCAIXADA A L'AMPLADA DEL CARRIL (02/10/2026). En Marc: «Ara
                // encaixa la stripe p1 a l'amplada del carril». El contenidor
                // d'aquesta filera ja fa exactament el carril, o sigui que a la
                // composicio estreta n'hi ha prou de no centrar-la i donar-li
                // l'aspecte del full: la franja va de vora a vora del carril i
                // l'alcada en surt sola (811 x 86,9 a 1366 en lloc de 713,9 x
                // 76,5). A la resta de mides, com sempre.
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
                    color: 'hsl(var(--grey-paper))',
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
                  ...((esComposicioEstretaP1 && alcadaBlocEstretaP1) ? { marginTop: `${alcadaBlocEstretaP1.dy}px` } : null),
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
                  // EL LLOC DE LA FRANJA DE LA P2 (02/10/2026): a 1024-1366 la
                  // franja de la p1 ha de caure on cau la de la p2 dins de la
                  // seva pagina. El desplacament va ABANS del `translate` i de
                  // l'`scale` de sempre, o sigui en px del pare.
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
                    // LA MASCARA, DEL FULL BO (27/09/2026): vegeu
                    // `MegaStripePanel`. El full `v5` te les siluetes en unes
                    // altres coordenades i tallava les manigues.
                    WebkitMaskImage: senseMascaraSamarreta
                      ? 'none'
                      : (emptyShirtMaskUrl
                        ? `url("${emptyShirtMaskUrl}")`
                        : 'none'),
                    maskImage: senseMascaraSamarreta
                      ? 'none'
                      : (emptyShirtMaskUrl
                        ? `url("${emptyShirtMaskUrl}")`
                        : 'none'),
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
                        // SENSE EL LÍMIT DEL PREFLIGHT (02/10/2026). El full de la
                        // franja fa 9,33:1 i a 1024-1366 el contenidor es mes
                        // estret que la imatge a aquesta alcada: amb el
                        // `max-width: 100%` de sempre, la imatge s'encongia
                        // d'amplada (7,5:1) i les catorze samarretes es
                        // trepitjaven. Amb `none` la filera s'eixampla fins a
                        // l'amplada que li toca i despres s'escala sencera, com
                        // a la pagina 2.
                        ...(esComposicioEstretaP1 ? { maxWidth: 'none' } : null),
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

                  {/* Els dibuixos tambe a la vista vertical: la p2 ja els hi
                      pinta (mateixa condicio, sense `!isPortraitTablet`) i el
                      `clipPath` de la vertical d'aqui dalt hi es per aixo. Amb
                      la guarda, a la tauleta vertical les samarretes de la p1
                      es quedaven sense dibuix (28/09/2026). */}
                  {megaShirtDrawingEnabledLocal && drawingOverlaySrcEffective ? (
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
                          if (picksDibuixFranja[idx] === false) {
                            return null;
                          }
                          const picked = picksDibuixFranja[idx];
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

                              <DibuixFranja
                                picked={picked}
                                idx={idx}
                                desplacamentGap={gapsDibuixFranja[idx]}
                                calibrationOverrides={calibrationOverrides}
                                stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                                rectsMascara={rectsMascara}
                                isPortraitTablet={isPortraitTablet}
                                active={active}
                                drawingOverlayDebug={drawingOverlayDebug}
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

                          const hasPerTileSrcFallback = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
                          const picked = resolDibuixDeCasella({
                            base, idx, hasPerTileSrcFallback, active, resolvedOverlaySrc,
                            humanInsideVariant, firstContactVariant, isPortraitTablet, shirtColor,
                          });

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
                              <DibuixFranja
                                picked={picked}
                                idx={idx}
                                desplacamentGap={gapsDibuixFranja[idx]}
                                calibrationOverrides={calibrationOverrides}
                                stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                                rectsMascara={rectsMascara}
                                isPortraitTablet={isPortraitTablet}
                                active={active}
                                drawingOverlayDebug={drawingOverlayDebug}
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
