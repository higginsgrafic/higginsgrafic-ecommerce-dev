import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MegaColumn from './MegaColumn.jsx';
import ClicAreaOverlayP1 from './ClicAreaOverlayP1.jsx';
import { CERCADOR_COLORS } from './CercadorTopBar.jsx';
import { dibuixosGraella16x4 } from './CercadorTextRow.jsx';
import GraellaDuesFileresPagina1 from './GraellaDuesFileresPagina1.jsx';
import { SelectorQuadratPagina1, FletxesQuadratPagina1, MIDA_BLOC_DRETA_PAGINA1_PX } from './BlocDretaPagina1.jsx';
import { ESTIL_CAIXA_BLOC_ALCADA_AUTO } from './estilsBlocs.js';
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
  const escalaCarril = (isPortraitTablet || isLandscapeTablet)
    ? 1
    : escalaMegaslide(getBeltWidth(typeof window !== 'undefined' ? window.innerWidth : 1920));
  // ELS NUMEROS DE LA COMPOSICIO VIUEN A `geometriaMegaslide.js` (B4): aqui
  // nome's es passen a px amb l'escala del carril.
  const alcadaFileraPx = pagina1AlcadaFileraPx(escalaCarril);
  const gapDretaPx = PAGINA1_GAP_DRETA_PX * escalaCarril;
  const blocDretaPx = pagina1BlocDretaPx(escalaCarril);
  const columnaDretaPx = pagina1ColumnaDretaPx(escalaCarril);
  // EL TOP DE LA FILERA, EN PX (mesurat: posa la filera de dalt de la graella
  // al centre de la cel·la BLANC del selector).
  const topFileraPx = PAGINA1_TOP_FILERA_PX * escalaCarril;
  // LA FRANJA PUJA EL QUE LA FILERA NO OCUPA. La seva posicio ve del flux (el
  // coixi de la filera del panell), que estava calibrat per a la malla vella de
  // nou columnes: amb aquest descompte la franja de la p1 cau a la mateixa
  // alcada que la de la p2 (mesurat a 1920: 242,1 contra 241,5).
  const ajustFranjaPx = PAGINA1_AJUST_FRANJA_PX * escalaCarril;

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
                  escala={escalaCarril}
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
                  width: `${blocDretaPx}px`,
                  minWidth: 0,
                  position: 'relative',
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
                  ...(alcadaBlocP1 != null ? {
                    height: `${alcadaBlocP1}px`,
                    marginBottom: `${-(alcadaBlocP1 - columnaDretaPx * 3)}px`,
                  } : null),
                  // LES FLETXES A DALT I EL SELECTOR A SOTA, A LA DRETA (28/09/2026).
                  // El bloc es ample com la columna de la p2 (130 de disseny) perque
                  // la maniga de l'ultima samarreta hi arribi; el selector i les
                  // fletxes van a la dreta i el buit de l'esquerra es on cau l'ombra.
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  ...ESTIL_CAIXA_BLOC_ALCADA_AUTO,
                }}
              >
                {ombraManigaP1 && mascaraManigaP1 ? (
                  <div
                    aria-hidden="true"
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
                  </div>
                ) : null}
                {/* DUES BOTONERES QUADRADES APILADES: el quadrat de les fletxes a
                    DALT i els tres botons del selector a SOTA (28/09/2026, ho va
                    demanar en Marc: «Intercanvia les posicions del selector i les
                    fletxes»). Es van intercanviar les DUES PECES de debo, no
                    nome's el que s'hi pinta: el quadrat de les fletxes passa de
                    la meitat de baix a la de dalt. Els dos quadrats fan el
                    MATEIX (128,7 x 128,3 a 1920), o sigui que l'alcada del bloc,
                    la de la filera i la de la franja no es mouen. */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                {/* EL QUADRAT DE DALT: els dos botons de les fletxes. */}
                <div style={{ flex: '1 1 50%', minHeight: 0, width: '100%' }}>
                <FletxesQuadratPagina1
                  omple
                  onPrev={() => stepperP1?.(-1)}
                  onNext={() => stepperP1?.(1)}
                />
                </div>
                {/* EL QUADRAT DE SOTA: els tres botons del selector. */}
                <div style={{ flex: '1 1 50%', minHeight: 0, width: '100%' }}>
                <SelectorQuadratPagina1
                  dinsBloc
                  omple
                  format="square"
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
            marginTop: compactLandscape ? '16px' : `calc(${stripeRowPadPx}px - ${ajustFranjaPx}px)`,
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
