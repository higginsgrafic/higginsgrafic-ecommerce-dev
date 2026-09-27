import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const s = sel.getBoundingClientRect();
  return {
    boto: +bs[0].getBoundingClientRect().height.toFixed(2),
    fila_top_1: bs[0].style.top, fila_top_2: bs[1].style.top,
    selector_h: +s.height.toFixed(2),
    selector_w: +s.width.toFixed(2),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
