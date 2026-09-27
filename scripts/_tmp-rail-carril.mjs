// TEMPORAL — no es comiteja. On cau el rail de targetes respecte del carril, i
// com esta posicionat (quin element el conté i amb quin marge)?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  const carril = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).filter((x) => Math.abs(x.width - carrilCss) < 1).sort((a, b2) => a.top - b2.top)[0];
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  const primera = cards[0];
  // El contenidor del rail: el pare de la primera targeta.
  const el = document.querySelector('[data-component="product-card"]');
  let pare = el?.parentElement;
  const info = [];
  let e = el;
  for (let i = 0; i < 5 && e; i++) {
    const s = getComputedStyle(e);
    const b2 = e.getBoundingClientRect();
    info.push({ i, tag: e.tagName.toLowerCase(), esq: Math.round(b2.left), ample: Math.round(b2.width), margin: s.marginLeft, pad: s.paddingLeft, display: s.display, overflowX: s.overflowX, transform: s.transform === 'none' ? '-' : s.transform.slice(0, 24) });
    e = e.parentElement;
  }
  return {
    carril: carril ? { esq: Math.round(carril.left), dreta: Math.round(carril.right), ample: Math.round(carril.width) } : null,
    primera: primera ? { esq: Math.round(primera.left), dreta: Math.round(primera.right) } : null,
    cards: cards.slice(0, 6).map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    info,
  };
});
console.log('carril:', JSON.stringify(r.carril));
console.log('primera targeta:', JSON.stringify(r.primera), '| desviament:', r.primera && r.carril ? r.primera.esq - r.carril.esq : null, 'px');
console.log('targetes:', JSON.stringify(r.cards));
for (const x of r.info) console.log(`  ${x.i} ${x.tag.padEnd(5)} esq=${String(x.esq).padStart(5)} ample=${String(x.ample).padStart(5)} marginL=${x.margin.padEnd(10)} padL=${x.pad.padEnd(9)} ovX=${x.overflowX.padEnd(9)} ${x.transform}`);
await b.close();
