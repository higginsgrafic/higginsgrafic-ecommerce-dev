/**
 * layoutMetrics
 * -----------------------------------------------------------------------------
 * Helper centralitzat per obtenir mesures de viewport i layout de manera
 * consistent entre Chromium, WebKit i Firefox.
 *
 * Regla fonamental d'aquest mòdul:
 *   - El layout productiu NO ha de dependre de guies debug (belt2, pautes...).
 *   - Aquestes funcions són la font segura de mesures per layouts crítics
 *     (mega-slide, checkout, overlays...).
 *
 * Notes cross-browser:
 *   - `window.innerWidth` inclou la scrollbar vertical en alguns motors.
 *   - `document.documentElement.clientWidth` exclou la scrollbar i és el valor
 *     que coincideix amb el "layout viewport" usat pel CSS (`100vw` pot
 *     comportar-se diferent en Chrome/Firefox/Safari amb scroll i zoom).
 *   - `window.visualViewport` només s'ha d'utilitzar per overlays que segueixen
 *     teclat o zoom mòbil; mai com a font primària per layouts desktop.
 *
 * Aquest fitxer no té side effects: només exporta funcions pures.
 */

/* eslint-disable no-restricted-globals */

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

let cachedScrollbarWidth = null;

/**
 * Mesura l'amplada real física de la scrollbar del sistema.
 * Utilitza un element temporal i en fa memòria per a màxim rendiment.
 * És independent de l'estat d'overflow de la pàgina actual.
 */
export function getNativeScrollbarWidth() {
  if (!isBrowser()) return 0;
  if (cachedScrollbarWidth !== null) return cachedScrollbarWidth;

  try {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const width = 100 - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    cachedScrollbarWidth = width;
    return width;
  } catch {
    return 0;
  }
}

/**
 * Amplada del layout viewport (sense scrollbar vertical).
 * Per garantir que no hi ha "salts" de centratge horitzontal entre rutes
 * amb scrollbar i rutes sense (com full-wide-slide amb overflow: hidden),
 * usem `window.innerWidth` menys l'amplada física de la scrollbar del sistema.
 * Així el viewport virtual de treball és completament consistent.
 */
export function getLayoutViewportWidth() {
  if (!isBrowser()) return 0;
  const winW = window.innerWidth;
  if (!Number.isFinite(winW) || winW <= 0) return 0;
  const sbW = getNativeScrollbarWidth();
  return Math.max(0, winW - sbW);
}

/**
 * Alçada del layout viewport (sense barres dinàmiques mòbils).
 * Per layouts desktop és prou estable.
 */
export function getLayoutViewportHeight() {
  if (!isBrowser()) return 0;
  const docH = document.documentElement?.clientHeight;
  if (Number.isFinite(docH) && docH > 0) return docH;
  const winH = window.innerHeight;
  return Number.isFinite(winH) && winH > 0 ? winH : 0;
}

/**
 * Amplada de la scrollbar vertical (en píxels).
 * Pot ser 0 (overlay scrollbars de macOS/iOS), 15-17 (Windows/Linux),
 * o variables segons motor i zoom.
 */
export function getScrollbarWidth() {
  if (!isBrowser()) return 0;
  const winW = window.innerWidth || 0;
  const docW = document.documentElement?.clientWidth || 0;
  const diff = winW - docW;
  return diff > 0 && diff < 64 ? diff : 0;
}

/**
 * Amplada visual (visualViewport). Útil per overlays mòbils/teclat.
 * No s'ha d'utilitzar com a font de layout desktop.
 */
export function getVisualViewportWidth() {
  if (!isBrowser()) return getLayoutViewportWidth();
  const vv = window.visualViewport;
  const w = vv?.width;
  return Number.isFinite(w) && w > 0 ? w : getLayoutViewportWidth();
}

/**
 * devicePixelRatio normalitzat.
 */
export function getDevicePixelRatio() {
  if (!isBrowser()) return 1;
  const dpr = window.devicePixelRatio;
  return Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
}

/**
 * Retorna `value` limitat a [min, max].
 * Si `value` no és finit, retorna `fallback` (també clampat).
 */
export function clampNumber(value, min, max, fallback = min) {
  const v = Number.isFinite(value) ? value : fallback;
  if (!Number.isFinite(v)) return min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/**
 * Referència de la composició del megaslide: la mida a la qual està calibrat
 * tot el contingut (dibuixos, franja, selector, coordenades).
 */
export const MEGASLIDE_REFERENCIA_PX = 1350;

/**
 * Factor d'escala del megaslide respecte de la seva composició de 1350 px.
 *
 * Aquesta és l'ÚNICA font de l'escala: la graella de dibuixos ja s'hi adapta
 * (mesura l'amplada de la seva columna), pero la franja de samarretes i les
 * coordenades del panell no. Mentre no surtin totes del mateix factor, les
 * peces no escalen juntes i les proporcions es trenquen.
 *
 * @param {number} beltWidth amplada del belt, en px
 * @returns {number} factor (1 = composicio completa, 0,75 = tres quartes parts)
 */
export function escalaMegaslide(beltWidth) {
  if (!Number.isFinite(beltWidth) || beltWidth <= 0) return 1;
  return beltWidth / MEGASLIDE_REFERENCIA_PX;
}

/**
 * Amplada de la finestra que es pren com a referencia del disseny.
 */
export const MEGASLIDE_VISTA_REFERENCIA_PX = 1920;

/**
 * Amplada del belt per a una finestra donada: la mateixa part de la pantalla
 * que a la referencia (1350 sobre 1920).
 */
export function getBeltWidth(vw = getLayoutViewportWidth()) {
  if (!Number.isFinite(vw) || vw <= 0) return MEGASLIDE_REFERENCIA_PX;
  return Math.round(vw * (MEGASLIDE_REFERENCIA_PX / MEGASLIDE_VISTA_REFERENCIA_PX));
}

/**
 * Amplada segura per a contenidors centrats tipus "belt".
 * Equival a:
 *   min(maxContent, viewportWidth - 2 * sideMargin)
 * però amb clamps per evitar valors absurds.
 *
 * @param {object} [opts]
 * @param {number} [opts.maxContent=1350] amplada màxima del contingut.
 * @param {number} [opts.sideMargin=76]   marge mínim a cada costat.
 * @param {number} [opts.minContent=320]  amplada mínima útil.
 * @returns {number}
 */
export function getSafeContentWidth({
  maxContent = MEGASLIDE_REFERENCIA_PX,
  sideMargin = 16,
  minContent = 320,
} = {}) {
  const vw = getLayoutViewportWidth();
  if (vw <= 0) return maxContent;
  // El sostre es la proporcio de la finestra quan es tracta de la referencia
  // del megaslide: a 1920 dona 1350 i a 1440 en dona 1013.
  const cap = maxContent === MEGASLIDE_REFERENCIA_PX ? getBeltWidth(vw) : maxContent;
  const available = vw - sideMargin * 2;
  const target = Math.min(cap, available);
  return clampNumber(target, minContent, cap, minContent);
}

/**
 * Comprova que un rect mesurat té sentit (no negatiu, no infinit, no zero).
 * Útil per descartar mesures contaminades abans de persistir-les o usar-les.
 */
export function isSaneRect(rect, { minWidth = 1, minHeight = 1 } = {}) {
  if (!rect) return false;
  const { left, top, width, height } = rect;
  if (![left, top, width, height].every((v) => Number.isFinite(v))) return false;
  if (width < minWidth || height < minHeight) return false;
  return true;
}

/**
 * Llegeix una variable CSS numèrica de :root (en píxels).
 * Retorna `fallback` si no existeix o no és finita.
 */
export function readRootCssNumber(varName, fallback = NaN) {
  if (!isBrowser()) return fallback;
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName);
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Retorna un belt segur derivat de les guies belt2 actuals.
 * Si les guies són absents, contaminades o incoherents amb el viewport,
 * cau a un belt centrat dins de [sideMargin, vw - sideMargin].
 *
 * Mai retorna valors absurds: és segur fer-lo servir per layouts productius.
 */
export function getSafeBelt({
  maxContent = MEGASLIDE_REFERENCIA_PX,
  sideMargin = 16,
  minContent = 320,
  varLeft = '--belt2-xL',
  varRight = '--belt2-xR',
} = {}) {
  const vw = getLayoutViewportWidth();
  const xLraw = readRootCssNumber(varLeft);
  const xRraw = readRootCssNumber(varRight);

  const safeWidth = getSafeContentWidth({ maxContent, sideMargin, minContent });
  const fallbackLeft = Math.max(0, Math.round((vw - safeWidth) / 2));
  const fallbackRight = fallbackLeft + safeWidth;

  const beltOk =
    Number.isFinite(xLraw) &&
    Number.isFinite(xRraw) &&
    xRraw > xLraw &&
    xLraw >= 0 &&
    xRraw <= vw + 1 &&
    xRraw - xLraw >= minContent &&
    xRraw - xLraw <= safeWidth + 2;

  if (!beltOk) {
    return {
      left: fallbackLeft,
      right: fallbackRight,
      width: safeWidth,
      source: 'fallback',
    };
  }

  return {
    left: xLraw,
    right: xRraw,
    width: xRraw - xLraw,
    source: 'belt2',
  };
}

/**
 * Snapshot complet, útil per debug/probes (`window.__HG_LAYOUT_METRICS__`).
 */
export function getLayoutMetricsSnapshot() {
  return {
    layout: {
      width: getLayoutViewportWidth(),
      height: getLayoutViewportHeight(),
    },
    visual: {
      width: getVisualViewportWidth(),
    },
    scrollbar: getScrollbarWidth(),
    dpr: getDevicePixelRatio(),
    safeContentWidth: getSafeContentWidth(),
    safeBelt: getSafeBelt(),
  };
}

/**
 * Exposa el snapshot a `window.__HG_LAYOUT_METRICS__` per inspecció ràpida
 * des de la consola del navegador. Cridar una sola vegada (App boot).
 */
export function installLayoutMetricsProbe() {
  if (!isBrowser()) return;
  try {
    window.__HG_LAYOUT_METRICS__ = getLayoutMetricsSnapshot;
  } catch {
    // ignore
  }
}
