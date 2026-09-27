// TEMPORAL — no es comiteja. On es el carril de la PDP i on cau la cinta de
// producte (les tres columnes) dins seu?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  // La imatge gran de la TDP.
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  const ib = img?.b;
  // El seu contenidor (el fons gris).
  const caixa = img?.i.parentElement?.getBoundingClientRect();
  // El carril: els elements amb l'ample del carril.
  const carrils = [...document.querySelectorAll('div')].map((d) => ({ d, b: d.getBoundingClientRect(), s: getComputedStyle(d) })).filter((x) => {
    const css = getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim();
    return css && Math.abs(x.b.width - parseFloat(css)) < 2;
  }).slice(0, 4);
  return {
    finestra: { ample: window.innerWidth, centre: window.innerWidth / 2 },
    carrilCss: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
    carrils: carrils.map((x) => ({ ample: Math.round(x.b.width), esq: Math.round(x.b.left), centre: Math.round(x.b.left + x.b.width / 2), cls: String(x.d.className).slice(0, 30) })),
    tdp: ib ? { esq: Math.round(ib.left), dreta: Math.round(ib.right), centre: Math.round(ib.left + ib.width / 2), ample: Math.round(ib.width) } : null,
    caixaTdp: caixa ? { esq: Math.round(caixa.left), dreta: Math.round(caixa.right), ample: Math.round(caixa.width) } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
