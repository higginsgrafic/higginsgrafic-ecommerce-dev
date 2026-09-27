// TEMPORAL — no es comiteja. On cau el RAIL (les 4 targetes) i on cau la cinta
// de la TDP? Esta alineada?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const targetes = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0 && x.right > 0);
  const railEsq = targetes.length ? Math.round(Math.min(...targetes.map((x) => x.left))) : null;
  const railDreta = targetes.length ? Math.round(Math.max(...targetes.map((x) => x.right))) : null;
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  const caixa = img?.i.parentElement?.getBoundingClientRect();
  const carril = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).find((x) => Math.abs(x.width - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'))) < 2);
  return {
    carril: carril ? { esq: Math.round(carril.left), dreta: Math.round(carril.right), centre: Math.round(carril.left + carril.width / 2) } : null,
    rail: railEsq ? { esq: railEsq, dreta: railDreta, centre: Math.round((railEsq + railDreta) / 2) } : null,
    caixaTdp: caixa ? { esq: Math.round(caixa.left), dreta: Math.round(caixa.right), centre: Math.round(caixa.left + caixa.width / 2) } : null,
    tdp: img ? { baix: Math.round(img.b.bottom), ample: Math.round(img.b.width) } : null,
    viewport: { alt: window.innerHeight },
  };
});
console.log(JSON.stringify(r, null, 1));
const c = r.carril, a = r.caixaTdp;
if (c && a) console.log('--- caixa TDP: esq', a.esq - c.esq, 'px del carril | dreta', c.dreta - a.dreta, 'px del carril | centre', a.centre - c.centre, 'px del centre del carril');
await b.close();
