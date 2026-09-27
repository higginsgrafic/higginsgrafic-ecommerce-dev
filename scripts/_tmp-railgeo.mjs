import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  return { n: cards.length, amples: cards.slice(0, 6).map((x) => +x.width.toFixed(2)), esq: cards.slice(0, 6).map((x) => Math.round(x.left)), gaps: cards.slice(0, 5).map((x, i) => +(cards[i + 1].left - x.right).toFixed(2)) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
