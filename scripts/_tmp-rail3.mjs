// TEMPORAL — no es comiteja. On cau el rail i on cau el carril, ara.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  const carril = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).filter((x) => Math.abs(x.width - carrilCss) < 1).sort((a, b2) => a.top - b2.top)[0];
  // El rail: el pare de la targeta que conte el track.
  const totes = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  const visibles = totes.filter((x) => x.left >= 0 && x.right <= window.innerWidth);
  return {
    carril: carril ? { esq: Math.round(carril.left), dreta: Math.round(carril.right), ample: Math.round(carril.width), centre: Math.round(carril.left + carril.width / 2) } : null,
    totes: totes.slice(0, 8).map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    visibles: visibles.map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    visiblesN: visibles.length,
  };
});
console.log('carril:', JSON.stringify(r.carril));
console.log('totes les targetes:', JSON.stringify(r.totes));
console.log('visibles (' + r.visiblesN + '):', JSON.stringify(r.visibles));
await b.close();
