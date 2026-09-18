/**
 * Mesura única del megaslide.
 * -----------------------------------------------------------------------------
 * Aquest mòdul és l'ÚNICA font de veritat de les mides del megaslide.
 *
 * PER QUÈ EXISTEIX
 *
 * El megaslide tenia la posició repartida entre sis bucles d'auto-calibratge
 * (`pageLift` a MegaStripePanelP1, `alignTopRowToPage1` i
 * `centraAmbLaGraellaDeColors` a MegaslidePagina2, `midesGraella` a
 * CercadorTextRow, i `p1ContentBottomPx`/`guardHeightPx` a MegaMenuPanel) que
 * es llegeixen i es reescriuen els uns als altres. Cap peça no tenia una
 * posició pròpia: totes depenien de la mesura d'una altra, i el resultat
 * depenia de l'ordre en què arribaven les mesures. Això feia que qualsevol
 * ajust ("baixa-ho 20 px") fos impracticable: un bucle el compensava i el
 * canvi reapareixia en una altra peça.
 *
 * Aquest mòdul no canvia res encara: només OBSERVA. Serveix per
 *   1. tenir la llista completa de les peces i de les variables, en un sol lloc;
 *   2. comparar estats (abans/després) amb xifres, no amb impressions;
 *   3. fer de test de regressió quan es comenci a unificar els bucles.
 *
 * És una funció pura sobre el DOM: no llegeix ni escriu cap estat de React.
 */

/** Peces del megaslide que els bucles fan servir com a referència. */
const SELECTORS = {
  panell: '[data-mega-panel-surface="1"]',
  guarda: '[data-stripe-bottom]',
  vistaP1: '[data-mega-page-viewport="1"]',
  vistaP2: '[data-mega-page-viewport="2"]',
  // Contenidor del selector Blanc/Color/Negre de la pàgina 2
  contenidorSelectorP2: '[data-p2-color-selector]',
  // El botó del selector (el que llegeixen tots els bucles)
  botoSelector: 'button[aria-label="Color"]',
  // Etiquetes dels botons del selector, per si el selector és dins d'un altre bloc
  barraSelector: '[data-stripe-buttonbar="bn"]',
  graellaColors: '[data-p2-color-grid]',
  // Malla de 9 columnes de la pàgina 1 (el MegaColumn)
  mallaP1: '.grid-cols-9',
  franjaP1: '[data-stripe-visual-content="1"]',
  franjaP2: '[data-stripe-visual-content="2"]',
};

/** Variables CSS que governen la calibració. */
const VARS = [
  '--hg-mega-w',
  '--hg-mega-x',
  '--hgGridFitScale',
  '--megaStripeScale',
  '--megaStripeDy',
  '--hg-cercador-bar-top',
  '--hg-cercador-bar-width',
  '--hg-cercador-bar-scale',
];

const rodona = (n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : null);

/**
 * Rect d'un element, en coordenades de finestra i relatives al panell.
 * @param {Element|null} el
 * @param {Element|null} panell
 */
function rect(el, panell) {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  const p = panell ? panell.getBoundingClientRect() : null;
  return {
    top: rodona(b.top),
    bottom: rodona(b.bottom),
    left: rodona(b.left),
    right: rodona(b.right),
    width: rodona(b.width),
    height: rodona(b.height),
    // Relatiu al capdamunt del panell: és com ho llegeixen els bucles.
    relTop: p ? rodona(b.top - p.top) : null,
    relBottom: p ? rodona(b.bottom - p.top) : null,
  };
}

/**
 * Llegeix les variables CSS de calibració de l'arrel.
 * @param {Window} win
 */
function variables(win) {
  const cs = win.getComputedStyle(win.document.documentElement);
  const out = {};
  for (const v of VARS) out[v] = cs.getPropertyValue(v).trim() || null;
  return out;
}

/**
 * Mesura tot el megaslide d'una sola passada.
 *
 * @param {Document} [doc]
 * @param {Window} [win]
 * @returns {object} instantània amb totes les peces i totes les variables
 */
export function mesuraMegaslide(doc = typeof document !== 'undefined' ? document : null, win = typeof window !== 'undefined' ? window : null) {
  if (!doc || !win) return null;
  const q = (sel, arrel = doc) => arrel.querySelector(sel);

  const panell = q(SELECTORS.panell);
  const guarda = q(SELECTORS.guarda);
  const vistaP1 = q(SELECTORS.vistaP1);
  const vistaP2 = q(SELECTORS.vistaP2);

  // Els bucles busquen el selector de cada pàgina; si no el troben dins la
  // vista, cauen al document (és el que fa `alignTopRowToPage1`).
  const botoP1 = (vistaP1 && q(SELECTORS.botoSelector, vistaP1)) || null;
  const botoP2 = q(SELECTORS.botoSelector, q(SELECTORS.contenidorSelectorP2) || doc);
  const barraP1 = vistaP1 ? q(SELECTORS.barraSelector, vistaP1) : null;
  const barraP2 = q(SELECTORS.barraSelector, q(SELECTORS.contenidorSelectorP2) || doc);

  const mallaP1 = vistaP1 ? q(SELECTORS.mallaP1, vistaP1) : null;
  const graellaColors = q(SELECTORS.graellaColors);
  const franjaP1 = q(SELECTORS.franjaP1);
  const franjaP2 = q(SELECTORS.franjaP2);

  // El carril i les vistes del carrusel
  const carril = guarda ? guarda.querySelector('div[style*="width: 400%"]') : null;

  const r = {
    finestra: {
      innerWidth: win.innerWidth,
      innerHeight: win.innerHeight,
      dpr: win.devicePixelRatio,
      clientWidth: doc.documentElement.clientWidth,
    },
    panell: rect(panell, panell),
    guarda: rect(guarda, panell),
    carril: rect(carril, panell),
    vistes: {
      p1: rect(vistaP1, panell),
      p2: rect(vistaP2, panell),
    },
    // Les tres peces que els bucles es disputen
    selector: {
      p1: rect(botoP1, panell),
      p2: rect(botoP2, panell),
      contenidorP2: rect(q(SELECTORS.contenidorSelectorP2), panell),
      barraP1: rect(barraP1, panell),
      barraP2: rect(barraP2, panell),
    },
    colors: rect(graellaColors, panell),
    malla9P1: rect(mallaP1, panell),
    franja: {
      p1: rect(franjaP1, panell),
      p2: rect(franjaP2, panell),
    },
    variables: variables(win),
    // Derivats: les diferències que els bucles volen mantenir a zero
    deltes: {
      selectorP2menysP1: (botoP1 && botoP2) ? rodona(botoP2.getBoundingClientRect().top - botoP1.getBoundingClientRect().top) : null,
      franjaP2menysP1: (franjaP1 && franjaP2) ? rodona(franjaP2.getBoundingClientRect().top - franjaP1.getBoundingClientRect().top) : null,
      colorsMenysSelectorP2: (graellaColors && botoP2)
        ? rodona((graellaColors.getBoundingClientRect().top + graellaColors.getBoundingClientRect().height / 2) - (botoP2.getBoundingClientRect().top + botoP2.getBoundingClientRect().height / 2))
        : null,
    },
  };
  return r;
}

export default mesuraMegaslide;

/**
 * Objectiu del `pageLift` de la pàgina 1.
 *
 * La pàgina 1 apuja tota la seva filera perquè el selector Blanc/Color/Negre
 * quedi a l'alçada que toca: `desplaçament` px sota el capdamunt del panell
 * (10 px a la banda estreta de desktop, 0 a la resta).
 *
 * Retorna el DELTA que s'ha de sumar al lift actual. Vivia dins de l'efecte de
 * MegaStripePanelP1, barrejat amb la lectura del DOM.
 *
 * @param {object} e
 * @param {number} e.selectorTop  `top` del selector, en px de finestra
 * @param {number} e.panelTop     `top` del panell, en px de finestra
 * @param {number} e.ample        amplada de la finestra
 * @param {number} e.alt          alçada de la finestra
 * @returns {number} delta del lift
 */
export function deltaObjectiuPageLift({ selectorTop, panelTop, ample, alt, esTauleta = false }) {
  // `esTauleta` arriba del dispositiu (useDeviceLayout) i NO es pot deduir de
  // les mides: 1024x768 compleix «ample >= alt» com la banda estreta, pero la
  // tauleta no ha de portar aquest desplacament. Si no s'hi passa, la tauleta
  // apaisada es tracta com a banda estreta i se li mou tota la filera.
  // El desplaçament de 10 px el porten TANT la banda estreta com les dues
  // tauletes (es el que hi havia abans); el que canvia es que a la tauleta no
  // s'hi ha d'afegir cap marge extra.
  const bandaEstreta = ample >= 768 && ample <= 1366 && ample >= alt;
  // Tres casos:
  //   banda estreta de desktop -> 10 + 20 = 30 (els 20 del marge de la filera)
  //   desktop ample            -> 0 + 20 = 20 (nomes els 20 de la franja)
  //   les dues tauletes        -> 10 (com sempre)
  const desplacament = esTauleta ? 10 : (bandaEstreta ? 30 : 20);
  return (selectorTop - panelTop) - desplacament;
}

/**
 * Alçada del panell del megaslide a partir de la mesura del contingut de la
 * pàgina 1.
 *
 * El panell acaba `gap` px sota el bottom visible de les samarretes. El `-64`
 * és el `py-8` del contenidor del panell (32 + 32), que la mesura ja inclou i
 * per tant s'ha de descomptar.
 *
 * Vivia dins de MegaMenuPanel, dins d'una expressió de set línies amb tres
 * condicions enganxades (checkout, mesura estable, valor recordat).
 *
 * @param {object} e
 * @param {number} e.p1ContentBottom  bottom de la franja de la pàgina 1, en px des del capdamunt del panell
 * @param {number} [e.gap]            espai que queda sota les samarretes (P1_STRIPE_BOTTOM_GAP)
 * @param {number} [e.margeExtra]     marge extra de l'escriptori
 * @returns {number} alçada del panell en px (mai negativa)
 */
export function alcadaPanellMegaslide({ p1ContentBottom, gap = 30, margeExtra = 0 }) {
  if (!Number.isFinite(p1ContentBottom)) return 0;
  return Math.max(0, Math.round(p1ContentBottom + gap - 64 + margeExtra));
}

/**
 * Desplaçament cap avall de les franges de samarretes a l'escriptori, en px.
 *
 * Compensa els 20 px de marge que s'han afegit a l'alçada de la pestanya: si no
 * s'hi apliquessin, el buit quedaria tot a sota la franja i el contingut no
 * baixaria. Va a les DUES franges (pàgina 1 i 2) amb el mateix valor, perquè
 * han de quedar a la mateixa alçada.
 *
 * NOMÉS escriptori: a les tauletes les alçades són les seves.
 *
 * @param {object} e
 * @param {number} e.ample
 * @param {number} e.alt
 * @param {boolean} [e.esTauleta]
 * @returns {number} px (0 o 20)
 */
export const DESPLACAMENT_FRANJA_ESCRIPTORI_PX = 20;

export function desplacamentFranjaEscriptori({ ample, alt, esTauleta = false }) {
  if (esTauleta || ample < 768) return 0;
  // A la banda estreta la filera ja baixa 20 px (amb l'objectiu del pageLift) i
  // la franja la segueix: sumar-hi 20 mes la deixaria 10 px de l'aire de sota.
  const bandaEstreta = ample <= 1366 && ample >= alt;
  if (bandaEstreta) return 0;
  return DESPLACAMENT_FRANJA_ESCRIPTORI_PX;
}
