import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carril = [...document.querySelectorAll('div')].map((d) => d.getBoundingClientRect()).filter((x) => Math.abs(x.width - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'))) < 1).sort((a, b2) => a.top - b2.top)[0];
  const cards = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b2) => a.left - b2.left);
  const dins = cards.filter((x) => x.left >= carril.left - 1 && x.right <= carril.right + 1);
  const parcials = cards.filter((x) => x.right > carril.left && x.left < carril.right && !(x.left >= carril.left - 1 && x.right <= carril.right + 1));
  return {
    carril: `${Math.round(carril.left)}..${Math.round(carril.right)}`,
    total: cards.length,
    dins: dins.length,
    trossos: parcials.length,
    posDins: dins.map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    posTrossos: parcials.map((x) => `${Math.round(x.left)}..${Math.round(x.right)}`),
    ampleDins: dins.length ? Math.round(dins[dins.length - 1].right - dins[0].left) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
