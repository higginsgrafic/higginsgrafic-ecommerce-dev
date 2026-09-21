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

export function computeSiteFrame() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const vw = getLayoutViewportWidth();
  if (!Number.isFinite(vw) || vw <= 0) return null;
  const marc = siteFrameForViewport({ vw, rulerInset: readRulerInset() });
  if (!marc) return null;
  // Mitja reserva de la barra de desplaçament (o del seu lloc): el marc es
  // centra sobre la FINESTRA, pero el cos es `gutter` px mes estret. Les capes
  // que es pengen d'un contenidor centrat al COS (el megaslide) necessiten
  // aquesta meitat per caure al mateix lloc que el marc.
  const gutter = Math.max(0, (window.innerWidth || 0) - (document.body?.clientWidth || 0));
  return { xL: marc.xL, xR: marc.xR, w: marc.width, gutterMig: gutter / 2 };
}

export default function SiteFrame() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    let last = { xL: NaN, xR: NaN, w: NaN, gutterMig: NaN };
    const apply = () => {
      const next = computeSiteFrame();
      if (!next) return;
      if (next.xL === last.xL && next.xR === last.xR && next.w === last.w && next.gutterMig === last.gutterMig) return;
      last = next;
      root.style.setProperty('--site-xL', `${next.xL}px`);
      root.style.setProperty('--site-xR', `${next.xR}px`);
      root.style.setProperty('--site-w', `${next.w}px`);
      root.style.setProperty('--site-gutter-mig', `${next.gutterMig}px`);
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
