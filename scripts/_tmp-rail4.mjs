// TEMPORAL — no es comiteja. Posicio i amplada del visor del rail.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const visor = document.querySelector('[data-container="rail-estatic"], [data-container="carousel-track"]')?.parentElement;
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  const carril = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).filter((x) => Math.abs(x.width - carrilCss) < 1).sort((a, b2) => a.top - b2.top)[0];
  const b2 = visor?.getBoundingClientRect();
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.left >= 0 && x.right <= window.innerWidth);
  return {
    visor: b2 ? { esq: Math.round(b2.left), ample: Math.round(b2.width), marginLeft: getComputedStyle(visor).marginLeft, overflow: getComputedStyle(visor).overflow } : null,
    carril: carril ? { esq: Math.round(carril.left), dreta: Math.round(carril.right), ample: Math.round(carril.width), centre: Math.round(carril.left + carril.width / 2) } : null,
    visibles: cards.map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    centreVisibles: cards.length ? Math.round((cards[0].left + cards[cards.length - 1].right) / 2) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
