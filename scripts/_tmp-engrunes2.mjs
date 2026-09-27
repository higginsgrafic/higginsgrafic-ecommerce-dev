import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const logo = [...document.querySelector('header').querySelectorAll('a, div, span')].map((e) => e.getBoundingClientRect()).find((x) => x.width > 100 && x.width < 300 && x.top < 50);
  const inici = [...document.querySelectorAll('a, span')].find((e) => /^\s*INICI\s*$/i.test((e.textContent || '').trim()));
  const ib = inici?.getBoundingClientRect();
  let cont = inici;
  for (let i = 0; i < 4 && cont; i++) { const b2 = cont.getBoundingClientRect(); if (b2.width > 800) break; cont = cont.parentElement; }
  const cb = cont?.getBoundingClientRect();
  return {
    logo: { esq: Math.round(logo.left), dreta: Math.round(logo.right), dalt: Math.round(logo.top), baix: Math.round(logo.bottom) },
    inici: ib ? { esq: Math.round(ib.left), dalt: Math.round(ib.top), baix: Math.round(ib.bottom) } : null,
    contenidor: cb ? { esq: Math.round(cb.left), ample: Math.round(cb.width), dalt: Math.round(cb.top), top: getComputedStyle(cont).top, padL: getComputedStyle(cont).paddingLeft } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.inici && r.logo) {
  console.log('--- X: INICI', r.inici.esq, '| logo', r.logo.esq, '-> diferencia', r.inici.esq - r.logo.esq, 'px');
  console.log('--- Y: INICI', r.inici.dalt, '| logo baix', r.logo.baix, '-> diferencia', r.inici.dalt - r.logo.baix, 'px');
}
await b.close();
