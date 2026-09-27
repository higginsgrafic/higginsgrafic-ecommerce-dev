// TEMPORAL — no es comiteja. On cau la TDP de la PDP respecte del carril?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const carril = getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim();
  // La cinta de la PDP: el bloc de les tres columnes.
  const files = [...document.querySelectorAll('div')].filter((d) => {
    const s = getComputedStyle(d);
    return s.display === 'grid' && s.gridTemplateColumns.split(' ').length === 3 && d.getBoundingClientRect().width > 300;
  });
  const cinta = files[0]?.getBoundingClientRect();
  // La imatge de la TDP (la samarreta gran del mig).
  const imgs = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 200 && x.b.width < 500);
  const tdp = imgs.sort((a, b2) => b2.b.width - a.b.width)[0]?.b;
  const cap = document.querySelector('header')?.getBoundingClientRect();
  return {
    carrilCss: carril,
    carrilPx: null,
    cinta: cinta ? { esq: Math.round(cinta.left), dreta: Math.round(cinta.right), ample: Math.round(cinta.width), centre: Math.round(cinta.left + cinta.width / 2) } : null,
    tdp: tdp ? { esq: Math.round(tdp.left), dreta: Math.round(tdp.right), ample: Math.round(tdp.width), centre: Math.round(tdp.left + tdp.width / 2) } : null,
    finestra: { ample: window.innerWidth, centre: window.innerWidth / 2 },
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.cinta && r.tdp) {
  console.log('--- cinta centre', r.cinta.centre, '| TDP centre', r.tdp.centre, '| desviament', r.tdp.centre - r.cinta.centre, 'px');
  console.log('--- marge esq TDP dins la cinta:', r.tdp.esq - r.cinta.esq, '| marge dret:', r.cinta.dreta - r.tdp.dreta);
}
await b.close();
