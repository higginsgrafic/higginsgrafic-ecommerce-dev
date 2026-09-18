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
