import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
const d = await p.evaluate(() => {
  const ambMida = (sel) => [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
  const cg0 = ambMida('[data-p2-color-grid]');
  const arrel = (cg0 && cg0.closest('[data-mega-page-viewport="2"]')) || document;
  const pel = (etiqueta) => [...arrel.querySelectorAll('button[aria-label]')].find((x) => x.getAttribute('aria-label') === etiqueta);
  const carrusel = arrel.querySelector('[data-carrusel="1"]');
  const retall = carrusel ? carrusel.firstElementChild : null;
  return {
    cg: !!cg0, nx: !!pel('NX-01'), mz: !!pel('Mazinger-Z'), ncc: !!pel('NCC-1701'),
    sel: !!arrel.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
    tira: !!(retall && retall.firstElementChild),
    classAmagat: !!(arrel.closest('[data-mega-panel-surface="1"]')?.querySelector('.hg-mega-amagat')),
    ampleTauler: (document.querySelector('[data-mega-panel-surface="1"]') || {}).clientWidth,
  };
});
console.log(d);
await b.close();
