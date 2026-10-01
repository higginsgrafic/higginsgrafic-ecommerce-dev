// 02/10/2026 — Quin carril fa servir cada format de tauleta apaïssada: el del
// megaslide (`--hg-mega-w`) i el de la pagina (les guies verdes), i on cau cada
// peca. En Marc: «I no se li pot fer un segon carril a aquest, també?»
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: 'iPad 10.2 apaissada (1024)', w: 1024, h: 690 },
  { nom: 'Portatil 1280', w: 1280, h: 666 },
  { nom: 'iPad Air 13 apaissada (1366)', w: 1366, h: 946 },
  { nom: 'iPad Pro 13 apaissada (1376)', w: 1376, h: 954 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const guia = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().left) : null; };
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const carril = getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim();
    const escala = getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim();
    const panell = document.querySelector('[data-mega-panel-surface]');
    const bcn = document.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"], [data-p2-color-selector] [data-stripe-buttonbar="bn-p1"]');
    const grid = v2?.querySelector('[data-carrusel="1"]');
    const colors = v2?.querySelector('[data-p2-color-grid]');
    const col = v2?.querySelector('[data-colleccions-franja="1"]') || v2?.querySelector('[data-colleccions-columna="1"]');
    const stripe = document.querySelector('[data-stripe-visual-content="2"]');
    return {
      carrilMega: carril, escala,
      guiaPaginaEsq: guia('[data-guia-carril-pagina="esq"]'), guiaPaginaDret: guia('[data-guia-carril-pagina="dret"]'),
      guiaMegaEsq: guia('[data-guia-carril="esq"]'), guiaMegaDret: guia('[data-guia-carril="dret"]'),
      panell: q(panell), bcn: q(bcn), graella: q(grid), colors: q(colors), colleccions: q(col), franja: q(stripe),
    };
  });
  console.log(`--- ${f.nom} (${f.w}x${f.h})`);
  console.log('   ', JSON.stringify(m));
  await ctx.close();
}
await b.close();
