// TEMPORAL — no es comiteja. Es reprodueix la formula del width amb els numeros
// de la propia pagina.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const rects = [...document.querySelectorAll('[data-component="product-card"]')].map((c) => c.getBoundingClientRect()).filter((x) => x.width > 0 && x.right > 0 && x.left >= -1 && x.left < window.innerWidth).sort((a, b2) => a.left - b2.left);
  const v = rects.slice(0, 4);
  const w1 = v[0].width, gap = v[1].left - v[0].right;
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i; while (el && getComputedStyle(el).display !== 'grid') el = el.parentElement;
  return {
    w1: +w1.toFixed(3), gap: +gap.toFixed(3),
    formula3mas2: +(w1 * 3 + gap * 2).toFixed(3),
    formula2mas3: +(w1 * 2 + gap * 3).toFixed(3),
    inlineWidth: el.style.width,
    transform: getComputedStyle(el).transform,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
