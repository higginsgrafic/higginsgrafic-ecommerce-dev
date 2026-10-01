// 02/10/2026 — La captura de l'amo (3.25.17) te ~1060x668 de finestra i alla la
// p2 surt tallada (les samarretes). Es mira quina alcada te el panell, on cau el
// contingut i qui el retalla, a 1051, 1060, 1100, 1180 i 1280.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { w: 1051, h: 668 }, { w: 1060, h: 668 }, { w: 1100, h: 700 }, { w: 1180, h: 742 }, { w: 1280, h: 666 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const root = getComputedStyle(document.documentElement);
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const franja = document.querySelector('[data-stripe-visual-content="2"]');
    const grid = v2?.querySelector('[data-carrusel="1"]');
    const strip = document.querySelector('[data-colleccions-franja="1"]');
    // Tots els avantpassats de la franja, amb overflow i alcada.
    const cadena = [];
    let e = franja;
    while (e && e !== document.body && cadena.length < 8) {
      const cs = getComputedStyle(e);
      cadena.push([e.tagName + (e.getAttribute('data-mega-page-viewport') ? ('[vp' + e.getAttribute('data-mega-page-viewport') + ']') : '') + (e.getAttribute('data-mega-panel-surface') !== null ? '[panell]' : ''), q(e), cs.overflow + '/' + cs.overflowY, cs.maxHeight]);
      e = e.parentElement;
    }
    return {
      carril: root.getPropertyValue('--hg-mega-w').trim(), escala: root.getPropertyValue('--hg-escala-mega').trim(),
      panell: q(panell), vp2: q(v2), strip: q(strip), grid: q(grid), franja: q(franja),
      franjaBaix: franja ? Math.round(franja.getBoundingClientRect().bottom) : null,
      panellBaix: panell ? Math.round(panell.getBoundingClientRect().bottom) : null,
      finestra: window.innerHeight, cadena,
    };
  });
  console.log(`--- ${f.w}x${f.h}`, JSON.stringify({ carril: m.carril, escala: m.escala, panell: m.panell, vp2: m.vp2, strip: m.strip, grid: m.grid, franja: m.franja, franjaBaix: m.franjaBaix, panellBaix: m.panellBaix, finestra: m.finestra }));
  for (const c of m.cadena) console.log('     ', JSON.stringify(c));
  await p.screenshot({ path: `_tmp-t1060-${f.w}x${f.h}.png` });
  await ctx.close();
}
await b.close();
