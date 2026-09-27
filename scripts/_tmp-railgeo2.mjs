import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  // Es reprodueix el filtre de la mesura del rail.
  const rects = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0 && x.right > 0 && x.left >= -1 && x.left < window.innerWidth).sort((a, b2) => a.left - b2.left);
  const visibles = rects.slice(0, 4);
  return {
    candidates: rects.length,
    amples: visibles.map((x) => +x.width.toFixed(2)),
    esq: visibles.map((x) => Math.round(x.left)),
    gap: visibles.length > 1 ? +(visibles[1].left - visibles[0].right).toFixed(2) : null,
    grid: visibles.length ? +(visibles[visibles.length - 1].right - visibles[0].left).toFixed(2) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
