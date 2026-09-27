// TEMPORAL — no es comiteja. L'engruna, entre el bottom del header i el top de
// les targetes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const header = document.querySelector('header');
  const hb = header?.getBoundingClientRect();
  const inici = [...document.querySelectorAll('a, span')].find((e) => /^\s*INICI\s*$/i.test((e.textContent || '').trim()));
  const ib = inici?.getBoundingClientRect();
  const card = document.querySelector('[data-component="product-card"]');
  const cb = card?.getBoundingClientRect();
  // El contenidor de l'engruna.
  let cont = inici;
  for (let i = 0; i < 4 && cont; i++) { if (cont.getBoundingClientRect().width > 800) break; cont = cont.parentElement; }
  const kb = cont?.getBoundingClientRect();
  return {
    header: hb ? { dalt: Math.round(hb.top), baix: Math.round(hb.bottom) } : null,
    engruna: ib ? { dalt: Math.round(ib.top), baix: Math.round(ib.bottom), alt: Math.round(ib.height) } : null,
    contenidor: kb ? { dalt: Math.round(kb.top), baix: Math.round(kb.bottom), alt: Math.round(kb.height) } : null,
    targeta: cb ? { dalt: Math.round(cb.top), baix: Math.round(cb.bottom) } : null,
  };
});
console.log(JSON.stringify(r, null, 1));
if (r.header && r.targeta && r.engruna) {
  const mig = (r.header.baix + r.targeta.dalt) / 2;
  console.log('--- espai header..targeta:', r.header.baix, '..', r.targeta.dalt, '(alt', r.targeta.dalt - r.header.baix, ')');
  console.log('--- mig d\'aquest espai:', mig);
  console.log('--- centre de l\'engruna:', (r.engruna.dalt + r.engruna.baix) / 2);
  console.log('--- cal moure:', mig - (r.engruna.dalt + r.engruna.baix) / 2, 'px');
}
await b.close();
