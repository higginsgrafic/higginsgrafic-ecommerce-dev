import { useLayoutEffect } from 'react';
import { getLayoutViewportWidth } from '@/utils/layoutMetrics';

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

function compute() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  // Usem la font de veritat unificada de `layoutMetrics.js`, que resta
  // l'amplada real de la scrollbar del sistema. Això garanteix que tant la
  // Pauta com SiteFrame calculen EXACTAMENT les mateixes coordenades de
  // centratge horitzontal a totes les pàgines (amb scrollbar o sense).
  const vw = getLayoutViewportWidth();
  if (!Number.isFinite(vw) || vw <= 0) return null;
  // El `<main>` aplica `paddingLeft: var(--rulerInset)` a l'esquerra (per
  // deixar lloc als rulers de dev). El contingut útil de la pàgina és
  // [rulerInset, vw]. Centrem el frame en aquest interval perquè coincideixi
  // amb com es centra la Pauta i la resta de layouts productius.
  const inset = readRulerInset();
  const available = Math.max(0, vw - inset);
  const w = Math.max(0, Math.min(SITE_FRAME_MAX_WIDTH, available - SITE_FRAME_MIN_GUTTER * 2));
  const xL = Math.round(inset + (available - w) / 2);
  const xR = xL + w;
  return { xL, xR, w };
}

export default function SiteFrame() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    let last = { xL: NaN, xR: NaN, w: NaN };
    const apply = () => {
      const next = compute();
      if (!next) return;
      if (next.xL === last.xL && next.xR === last.xR && next.w === last.w) return;
      last = next;
      root.style.setProperty('--site-xL', `${next.xL}px`);
      root.style.setProperty('--site-xR', `${next.xR}px`);
      root.style.setProperty('--site-w', `${next.w}px`);
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
