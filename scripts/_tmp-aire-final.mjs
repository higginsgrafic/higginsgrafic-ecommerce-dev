// TEMPORAL — l'aire de la p2 (i de la p1) contra el panel i el header.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [ +x.top.toFixed(1), +(x.top + x.height).toFixed(1), +x.left.toFixed(1), +(x.left + x.width).toFixed(1) ]; };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const panel = document.querySelector('[data-mega-panel-surface]');
  const header = document.querySelector('header');
  const parts2 = {
    graella: v2.querySelector('[data-carrusel="1"]'),
    retall: v2.querySelector('[data-carrusel="1"]')?.firstElementChild,
    franja: v2.querySelector('[data-stripe-visual-content="2"]'),
    columna: v2.querySelector('[data-colleccions-targeta]')?.parentElement,
    selector: v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
    colors: v2.querySelector('[data-p2-color-grid]'),
  };
  const parts1 = {
    graella: v1.querySelector('[data-carrusel="1"]'),
    franja: v1.querySelector('[data-stripe-visual-content="1"]'),
  };
  const b2 = Object.fromEntries(Object.entries(parts2).map(([k, el]) => [k, box(el)]));
  const b1 = Object.fromEntries(Object.entries(parts1).map(([k, el]) => [k, box(el)]));
  const tops2 = Object.values(b2).filter(Boolean).map((x) => x[0]);
  const baixos2 = Object.values(b2).filter(Boolean).map((x) => x[1]);
  return {
    header: box(header), panel: box(panel), v1: box(v1), v2: box(v2),
    p2: b2, p1: b1,
    p2Contingut: [Math.min(...tops2), Math.max(...baixos2)],
  };
});
const hb = r.header[1];
console.log(JSON.stringify(r, null, 1));
console.log('---');
console.log('header bottom', hb, '| panel', r.panel[0], '->', r.panel[1]);
console.log('p2 top', r.p2Contingut[0], '=> aire de dalt', (r.p2Contingut[0] - hb).toFixed(1));
console.log('p2 baix', r.p2Contingut[1], '=> aire de baix', (r.panel[1] - r.p2Contingut[1]).toFixed(1));
console.log('p1 graella top', r.p1.graella[0], '=> aire de dalt p1', (r.p1.graella[0] - hb).toFixed(1));
console.log('p1 franja baix', r.p1.franja[1], '| p2 franja baix', r.p2.franja[1], '| dif', (r.p1.franja[1] - r.p2.franja[1]).toFixed(1));
console.log('aire de baix p1', (r.panel[1] - r.p1.franja[1]).toFixed(1));
await ctx.close(); await b.close();
