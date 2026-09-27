import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const totes = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => { const b2 = c.getBoundingClientRect(); return { esq: Math.round(b2.left), dreta: Math.round(b2.right) }; });
  const visibles = totes.filter((x) => x.esq >= 0 && x.dreta <= window.innerWidth);
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i; while (el && getComputedStyle(el).display !== 'grid') el = el.parentElement;
  const cols = [...el.children].map((c) => { const b2 = c.getBoundingClientRect(); return `${Math.round(b2.left)}..${Math.round(b2.right)}`; });
  const eb = el.getBoundingClientRect();
  return { visibles, block: `${Math.round(eb.left)}..${Math.round(eb.right)}`, cols, template: getComputedStyle(el).gridTemplateColumns, gap: getComputedStyle(el).gap };
});
console.log('targetes dins la pantalla:', JSON.stringify(r.visibles));
console.log('bloc:', r.block, '| gap', r.gap, '| template', r.template);
console.log('columnes:', JSON.stringify(r.cols));
await b.close();
