import { useLayoutEffect } from 'react';
import { getLayoutViewportWidth } from '@/utils/layoutMetrics';
import { siteFrameForViewport } from '@/utils/layoutModel';

/**
 * SiteFrame — referència estructural transversal del lloc.
 *
 * Component invisible que publica les coordenades canòniques del marc
 * horitzontal (`--site-xL`, `--site-xR`, `--site-w`) com a CSS variables
 * a `<html>`. És l'única font de veritat horitzontal del projecte.
 *
 * Comportament:
 *   - Viewport gran: frame de 1350px centrat (16px de gutter mínim).
 *   - Viewport reduït: ocupa el viewport menys 16px de gutter a cada costat.
 *
 * Per què JS i no CSS pur?
 *   El càlcul es fa amb `document.documentElement.clientWidth` (la mateixa
 *   font que `getLayoutViewportWidth()` a `utils/layoutMetrics.js`), que
 *   exclou el scrollbar vertical. Així el centrat coincideix EXACTAMENT
 *   amb el de la Pauta i altres layouts productius. Si féssim servir
 *   `100vw` (CSS), Chromium inclou el scrollbar i descentra ~7px.
 */

const SITE_FRAME_MAX_WIDTH = 1350;
const SITE_FRAME_MIN_GUTTER = 16;

function readRulerInset() {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--rulerInset');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * El carril declarat, si la capçalera l'ha publicat.
 *
 * El marc del lloc i el carril son la mateixa cosa: si el carril es declara
 * (3/5 de la finestra a l'escriptori i a la tauleta apaïssada), el marc l'ha de
 * seguir. Si no hi es (la vertical i el mobil tenen disseny propi), es queda
 * amb el topall de 1350 de sempre.
 */
function readCarril() {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--carril');
    const n = parseFloat(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function computeSiteFrame() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const vw = getLayoutViewportWidth();
  if (!Number.isFinite(vw) || vw <= 0) return null;
  const marc = siteFrameForViewport({
    vw,
    rulerInset: readRulerInset(),
    maxAmple: readCarril() ?? SITE_FRAME_MAX_WIDTH,
  });
  if (!marc) return null;
  // Ja no es publica cap compensacio de la barra de desplacament: el marc, el
  // carril i el megaslide es calculen tots amb l'amplada de MAQUETACIO
  // (getLayoutViewportWidth, la del cos), o sigui que cauen al mateix lloc
  // sense desplacaments. La compensacio existia quan el megaslide es mesurava
  // sobre la finestra (`100vw`), i amb barra classica desalineava 7,5 px.
  return { xL: marc.xL, xR: marc.xR, w: marc.width, layoutW: vw };
}

export default function SiteFrame() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    let last = { xL: NaN, xR: NaN, w: NaN, layoutW: NaN };
    const apply = () => {
      const next = computeSiteFrame();
      if (!next) return;
      if (next.xL === last.xL && next.xR === last.xR && next.w === last.w && next.layoutW === last.layoutW) return;
      last = next;
      root.style.setProperty('--site-xL', `${next.xL}px`);
      root.style.setProperty('--site-xR', `${next.xR}px`);
      root.style.setProperty('--site-w', `${next.w}px`);
      // L'amplada de MAQUETACIO, en px: les formulas de `foundation.css` que
      // abans feien servir `100vw` (que inclou el canal de la barra) l'han de
      // fer servir per caure on cau el carril.
      root.style.setProperty('--layout-w', `${next.layoutW}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    // App.jsx publica `--rulerInset` com a inline style a <html>. Observem
    // mutacions a l'atribut style perquè SiteFrame es recomputi quan l'usuari
    // toggleja la regla i, per tant, canvia el padding-left del <main>.
    const mo = new MutationObserver(apply);
    mo.observe(root, { attributes: true, attributeFilter: ['style'] });
    return () => {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      mo.disconnect();
    };
  }, []);
  return null;
}
